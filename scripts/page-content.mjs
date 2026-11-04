const pages = {
  accueil: ['pages', 'key', 'home'], expertises: ['pages', 'key', 'expertises'], 'a-propos': ['pages', 'key', 'about'], contact: ['pages', 'key', 'contact'],
  'mentions-legales': ['pages', 'key', 'legal'], confidentialite: ['pages', 'key', 'privacy'],
  ressources: ['pages', 'key', 'resources'], partenaires: ['pages', 'key', 'partners'],
  fellowship: ['programmes', 'key', 'fellowship'], 'agir-ia': ['programmes', 'key', 'agir-ia'],
  ...Object.fromEntries(Array.from({length:8},(_,i)=>['pole-'+(i+1),['expertises','code',String(i+1).padStart(2,'0')]])),
};
const plain = (value, maximum = 12000) => typeof value === 'string' && value.length <= maximum ? value.trim() : null;
const identifier = value => typeof value === 'string' && /^[a-z][a-z0-9-]{0,79}$/u.test(value);
const record = value => value && typeof value === 'object' && !Array.isArray(value);

export function presentation(value) {
  const copy = {};
  if (record(value?.siteText)) {
    const text = value.siteText;
    if (plain(text.title,500)) copy.title = plain(text.title,500);
    if (record(text.hero)) copy.hero = {title:plain(text.hero.title,500),intro:plain(text.hero.intro,5000)};
    if (record(text.sections)) {
      copy.sections = {};
      for (const [id, section] of Object.entries(text.sections).slice(0,60)) {
        if (!identifier(id) || !record(section)) continue;
        copy.sections[id] = {title:plain(section.title,500),kicker:plain(section.kicker,300),lead:plain(section.lead,20000)};
        if (Array.isArray(section.groups)) copy.sections[id].groups = section.groups.slice(0,100).map(group=>({title:plain(group?.title,500),text:plain(group?.text,12000)}));
      }
    }
  }
  // Native simple-entry fields remain authoritative for the page heading.
  copy.title = plain(value.title,500) || copy.title;
  copy.hero = {...copy.hero,title:plain(value.heroTitle || value.title,500) || copy.hero?.title,intro:plain(value.summary || value.objective,5000) || copy.hero?.intro};
  const layout = {};
  if (record(value.siteLayout)) {
    if (Array.isArray(value.siteLayout.sections)) layout.sections = [...new Set(value.siteLayout.sections.filter(identifier))].slice(0,60);
    if (record(value.siteLayout.cards)) {
      layout.cards = {};
      for (const [id, order] of Object.entries(value.siteLayout.cards).slice(0,60)) {
        if (identifier(id) && Array.isArray(order)) layout.cards[id]=[...new Set(order.filter(index=>Number.isInteger(index)&&index>=0&&index<100))];
      }
    }
  }
  return {copy,layout};
}

export async function readPublishedPage({page,locale,env=process.env,fetchImpl=fetch}) {
  if (!Object.hasOwn(pages,page) || !['fr','en'].includes(locale)) return {http:400,body:{error:'unsupported_page_or_locale'}};
  if (env.AGROPULSE_CMS_ENABLE_PAGES !== 'true') return {http:200,body:{status:'reference'}};
  const token=env.AGROPULSE_CMS_READ_TOKEN?.trim();
  let base;
  try { base=new URL(env.AGROPULSE_CMS_URL); } catch { return {http:503,body:{status:'unavailable'}}; }
  if (!token || /[\r\n]/u.test(token) || base.username || base.password || base.pathname!=='/' || base.search || base.hash || !['https:','http:'].includes(base.protocol) || (base.protocol==='http:'&&!['127.0.0.1','localhost','[::1]'].includes(base.hostname))) return {http:503,body:{status:'unavailable'}};
  const [collection,identity,key]=pages[page];
  const endpoint=new URL('/api/'+collection,base);
  endpoint.searchParams.set('locale',locale);
  endpoint.searchParams.set('status','published');
  endpoint.searchParams.set(`filters[${identity}][$eq]`,key);
  endpoint.searchParams.set('pagination[pageSize]','2');
  // Populate is deliberately omitted: only scalar copy and layout fields are read.
  let response,payload;
  try {
    response=await fetchImpl(endpoint,{headers:{Accept:'application/json',Authorization:'Bearer '+token},cache:'no-store',signal:AbortSignal.timeout(5000)});
    if(!response.ok) return {http:502,body:{status:'unavailable'}};
    payload=await response.json();
  } catch { return {http:502,body:{status:'unavailable'}}; }
  if(!Array.isArray(payload.data)) return {http:502,body:{status:'unavailable'}};
  if(payload.data.length===0) return {http:200,body:{status:'reference'}};
  if(payload.data.length!==1 || payload.data[0][identity]!==key || payload.data[0].locale!==locale) return {http:502,body:{status:'unavailable'}};
  return {http:200,body:{status:'published',...presentation(payload.data[0])}};
}

export function createPageContentHandler(options={}) {
  return async(req,res)=>{
    const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
    if(req.method!=='GET'){res.writeHead(405,{...headers,Allow:'GET'}).end(JSON.stringify({error:'method_not_allowed'}));return;}
    const url=new URL(req.url,'http://localhost');
    const result=await readPublishedPage({...options,page:url.searchParams.get('page'),locale:url.searchParams.get('locale')});
    res.writeHead(result.http,headers).end(JSON.stringify(result.body));
  };
}
