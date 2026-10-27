import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {simplifyContent} from './concise-content.mjs';
const {chromium}=createRequire(import.meta.url)('playwright');
const source=process.argv[2];if(!source)throw Error('Expected the approved interior-pages HTML path.');
const original=await fs.readFile(source,'utf8');
const hash=createHash('sha256').update(original).digest('hex');
if(hash!=='59882988305db5661d85a4e4d545989e265bf0f926c779280ff5e843654cc8ed')throw Error('Source changed; review required before import.');
const slugs=['a-propos','expertises','pole-1','pole-2','pole-3','pole-4','pole-5','pole-6'];
const pages=JSON.parse(original.match(/<script[^>]*id="pages-data"[^>]*>([\s\S]*?)<\/script>/)[1]);
const scripts=[...original.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)].filter(match=>!match[1].includes('application/json'));
if(scripts.length!==2)throw Error('Unexpected interaction inventory.');
const root=new URL('../web/public/reference/',import.meta.url);await fs.mkdir(root,{recursive:true});
let html=original,engine=scripts[1][2];const imageMap=new Map();
for(const match of original.matchAll(/data:image\/(png|webp|jpeg);base64,([A-Za-z0-9+/=]+)/g)){
 if(imageMap.has(match[0]))continue;
 const bytes=Buffer.from(match[2],'base64'),name=createHash('sha256').update(bytes).digest('hex').slice(0,16)+'.'+match[1];
 await fs.writeFile(new URL(name,root),bytes);imageMap.set(match[0],'/reference/'+name);
}
for(const [embedded,url]of imageMap){html=html.replaceAll(embedded,url);engine=engine.replaceAll(embedded,url);}
const assets=JSON.parse(engine.match(/^window\.RES=(\{.*?\});window\.fixAssets/s)[1]);
function replaceAssets(value){if(typeof value==='string')return assets[value]||value;if(Array.isArray(value))return value.map(replaceAssets);if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,replaceAssets(item)]));return value;}
const selected=replaceAssets(Object.fromEntries(slugs.map(slug=>[slug,pages[slug]])));
selected['a-propos'].hero.lead=[{fr:'Nous mettons les données et l’IA au service des filières agricoles d’Afrique de l’Ouest.',en:'We put data and AI at the service of agricultural value chains in West Africa.'}];
for(const [slug,page]of Object.entries(selected))for(const section of page.sections){
 if(section.type==='statband')for(const stat of section.stats){stat.value='—';stat.label={fr:stat.label.fr+' · à confirmer',en:(stat.label.en||stat.label.fr)+' · to be confirmed'};}
 if(section.type==='territory'){
  section.title={fr:'Notre ancrage en Afrique de l’Ouest',en:'Our presence in West Africa'};
  section.lead=[{fr:'Trois pays d’intervention : Côte d’Ivoire, Sénégal et Guinée-Bissau.',en:'Three countries of intervention: Côte d’Ivoire, Senegal and Guinea-Bissau.'}];
  for(const group of section.groups){group.role={fr:'Pays d’intervention',en:'Country of intervention'};group.text=[{fr:'Les activités et les coordonnées locales restent à préciser.',en:'Local activities and contact details remain to be specified.'}];group.meta=[];group.bullets=[];}
 }
 if(section.type==='form'){
  section.offices=[];section.lead=[{fr:'Préparez votre demande ci-dessous. L’envoi sera activé après configuration du service de contact.',en:'Prepare your enquiry below. Sending will be enabled once the contact service is configured.'}];
  section.button={fr:'Préparer ma demande',en:'Prepare my enquiry'};
  section.success={fr:'Brouillon préparé sur cette page. Aucun message n’a été envoyé.',en:'Draft prepared on this page. No message has been sent.'};
 }
}
// Do not convert an unconfirmed programme duration into a delivery promise.
function wording(value){if(typeof value==='string')return value.replaceAll('De l’idée au terrain en 12 mois','De l’idée au terrain, selon un calendrier à confirmer').replaceAll('From idea to field in 12 months','From idea to field, with dates to be confirmed');if(Array.isArray(value))return value.map(wording);if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,wording(item)]));return value;}
const safePages=simplifyContent(wording(selected));
engine=engine.replace("const CFG=window.CFG||{spa:false,home:'index.html'};","const CFG=JSON.parse(q('#page-state').textContent);if(document.documentElement.lang!==CFG.locale)document.documentElement.lang=CFG.locale;");
engine=engine.replace("const PH=slug=>slug=='accueil'?CFG.home:CFG.spa?'#p-'+slug:slug+'.html';","const PH=slug=>CFG.slugs.includes(slug)?'/'+CFG.locale+'/'+slug:'/'+CFG.locale+(slug==='accueil'?'':'#'+({contact:'contact',fellowship:'programmes','agir-ia':'agir-ia',partenaires:'partenaires',ressources:'ressources',candidature:'fellowship','mentions-legales':'informations',confidentialite:'informations'}[slug]||'contact'));");
engine=engine.replace("let PAGES={},SITE=window.SITE0||{},CUR=null;","let PAGES={},SITE=JSON.parse(q('#site-data').textContent),CUR=null;");
const sendStart=engine.indexOf('function sendForm('),sendEnd=engine.indexOf('function bindStep(',sendStart);
if(sendStart<0||sendEnd<0)throw Error('Submission patch no longer matches.');
engine=engine.slice(0,sendStart)+"function sendForm(f,m){if(!f.checkValidity()){f.reportValidity();m.textContent=U('fill');m.className='msg er';return}m.textContent=EN()?'Draft prepared on this page. No message has been sent.':'Brouillon préparé sur cette page. Aucun message n’a été envoyé.';m.className='msg ok';}\n"+engine.slice(sendEnd);
engine=engine.replace(/if\(!CFG\.spa\)\{fetch\('content\/pages\/'[^\n]+/,'');
engine=engine.replace(/try\{if\(localStorage\.getItem\('ap-lang'\)==\s*'en'\)\{[^\n]+/,'');
engine=engine.replace("q('#lang').onclick=()=>setLang(EN()?'fr':'en');","q('#lang').onclick=()=>location.assign('/'+(EN()?'fr':'en')+'/'+CFG.slug+location.hash);");
engine=engine.replaceAll('<button class="btn" type="submit">','<button class="btn" type="submit" disabled>');
engine=engine.replace("else qa('#app .net').forEach(c=>c.remove());","else{qa('#app .net').forEach(c=>c.remove());qa('#app .scene').forEach(c=>scene(c,c.dataset.sc));}");
engine=engine.replace('else CUR=document.body.dataset.page;render()','else CUR=CFG.slug;render()');
engine=engine.replace('route();if(CFG.spa)addEventListener(\'hashchange\',route);',"route();q('#lang').textContent=EN()?'FR':'EN';qa('#app .fm [type=submit]').forEach(button=>button.disabled=false);if(location.hash)requestAnimationFrame(()=>{const node=document.getElementById(location.hash.slice(1));if(node)node.scrollIntoView();});");
engine+='\ndocument.documentElement.dataset.interiorReady=CFG.slug;\n';
engine=engine.replace("const g=nodes[i],[x,y]=P[g.to],nm=tr(g.title),role=tr(g.role)||'',hq=i==0;","const g=nodes[i],[x,y]=P[g.to],nm=tr(g.title),role=tr(g.role)||'',hq=false;");
if(/fetch\(|XMLHttpRequest|sendBeacon|eval\(|new Function/.test(engine))throw Error('Unexpected network or dynamic execution in interaction code.');
engine=engine.replace(/const gclamp=g=>[^\n]+/,'const gclamp=g=>gbody(g);');
let css=html.match(/<style>([\s\S]*?)<\/style>/)[1];
for(const [name,url]of Object.entries(assets))css=css.replaceAll(name,url);
css+='\n.skip{position:fixed;left:-999px;z-index:100;background:white;padding:10px}.skip:focus{left:8px;top:8px}#app .reveal h2,#app .reveal .lead,#app .fx>div,#app .mt,#app .steps li{opacity:1;transform:none}.social-placeholder{width:40px;height:40px;border:1px solid #fff3;border-radius:50%;display:grid;place-items:center}@media(max-width:860px){.steps{grid-template-columns:1fr!important}}\n';
css+='\n/* Concise editorial revision: visible information, no secondary tabs. */\n.ph{padding:140px 0 64px}.ph .w{display:block}.ph h1{max-width:28ch;font-size:clamp(2rem,4vw,3rem)}.ph .ld{max-width:65ch}.ph .net{display:none}section{padding:60px 0}.fx{margin-top:24px}.fx>div{padding:22px 0}.lead{margin-bottom:22px}.cm{max-height:none!important;overflow:visible}.cm:after{display:none}.fcols{grid-template-columns:1.4fr 1fr}@media(max-width:860px){.ph{padding:116px 0 44px}section{padding:44px 0}.fcols{grid-template-columns:1fr}}\n';
await fs.writeFile(new URL('../web/app/interior-reference.css',import.meta.url),css);
const browser=await chromium.launch({channel:'msedge',headless:true});const variants={};
try{
 for(const slug of slugs){variants[slug]={title:safePages[slug].title,locales:{}};
  for(const locale of ['fr','en']){
   const context=await browser.newContext({reducedMotion:'reduce'});await context.route('**/*',route=>route.abort());const page=await context.newPage();
   const body=await page.evaluate(({html,locale,slug,slugs,pageData,assets})=>{
    const doc=new DOMParser().parseFromString(html,'text/html');doc.querySelectorAll('script,style,link,base,iframe,object,embed').forEach(node=>node.remove());
    doc.querySelectorAll('*').forEach(node=>{for(const attr of [...node.attributes])if(attr.name.startsWith('on')||/^(javascript|vbscript):/i.test(attr.value))node.removeAttribute(attr.name);});
    const target=name=>slugs.includes(name)?'/'+locale+'/'+name:'/'+locale+(name==='accueil'?'':'#'+({'contact':'contact','partenaires':'partenaires','fellowship':'programmes','agir-ia':'agir-ia','ressources':'ressources','candidature':'fellowship','mentions-legales':'informations','confidentialite':'informations'}[name]||'contact'));
    doc.querySelectorAll('a[href]').forEach(node=>{const href=node.getAttribute('href');if(href.startsWith('#p-'))node.setAttribute('href',target(href.slice(3)));else if(href.startsWith('https://claude.ai/'))node.setAttribute('href',target('accueil'));});
    doc.querySelectorAll('img').forEach(img=>{const url=assets[img.getAttribute('src')];if(url)img.setAttribute('src',url);});
    doc.querySelectorAll('[data-en]').forEach(node=>{node.dataset.fr=node.innerHTML;if(locale==='en')node.innerHTML=node.dataset.en;});
    const keep=['accueil','a-propos','expertises','fellowship','contact'];doc.querySelectorAll('#nav li').forEach(item=>{const link=item.querySelector('a');if(!keep.includes(link?.dataset.pg))item.remove();else if(link.dataset.pg==='fellowship'){link.textContent=locale==='en'?'Programmes':'Programmes';link.removeAttribute('data-en');}});doc.querySelector('.tools .cta')?.remove();
    doc.querySelectorAll('footer [data-en*="Headquarters"]').forEach(node=>{node.textContent=locale==='en'?'West Africa':'Afrique de l’Ouest';node.removeAttribute('data-en');});
    doc.querySelectorAll('.soc a').forEach(node=>{const span=doc.createElement('span');span.className='social-placeholder';span.innerHTML=node.innerHTML;span.setAttribute('aria-label',node.getAttribute('aria-label')+' — '+(locale==='en'?'link pending':'lien à compléter'));node.replaceWith(span);});
    doc.querySelector('footer .fine')?.append(doc.createTextNode(locale==='en'?' · Illustrative visuals and simulations.':' · Visuels et simulations illustratifs.'));
    const columns=doc.querySelector('.fcols');if(columns){[...columns.children].slice(1).forEach(node=>node.remove());const column=doc.createElement('div');const title=doc.createElement('h4');title.textContent='Navigation';column.append(title);for(const [name,label]of [['a-propos',locale==='en'?'About':'À propos'],['expertises',locale==='en'?'Expertise':'Expertises'],['fellowship','Programmes'],['contact','Contact']]){const link=doc.createElement('a');link.href=target(name);link.textContent=label;column.append(link);}columns.append(column);}
    const skip=doc.createElement('a');skip.className='skip';skip.href='#app';skip.textContent=locale==='en'?'Skip to content':'Aller au contenu';doc.body.prepend(skip);
    const json=(id,data)=>{const node=doc.createElement('script');node.type='application/json';node.id=id;node.textContent=JSON.stringify(data).replaceAll('<','\\u003c');doc.body.append(node);};
    json('pages-data',{[slug]:pageData});json('site-data',{ticker:[]});json('page-state',{slug,locale,slugs,spa:false,home:'/'+locale});
    return doc.body.innerHTML;
   },{html,locale,slug,slugs,pageData:safePages[slug],assets});
   await page.setContent('<!doctype html><html lang="'+locale+'"><head></head><body>'+body+'</body></html>');
   // Only the reviewed, patched engine above is executed, in a network-blocked page.
   await page.evaluate(engine);
   await page.locator('#app h1').waitFor();
   if(safePages[slug].sections.some(section=>section.type==='manifesto'))await page.waitForFunction(()=>Boolean(document.querySelector('.mf-q')?.textContent));
   variants[slug].locales[locale]=await page.evaluate(()=>{
    document.querySelectorAll('#app canvas,#app .scene,#app .sn,#pages-data,#site-data').forEach(node=>node.remove());
    document.querySelectorAll('form').forEach(form=>{form.method='dialog';form.querySelectorAll('[type=submit]').forEach(button=>button.disabled=true);});
    return document.body.innerHTML;
   });
   await context.close();
  }
 }
}finally{await browser.close();}
await fs.writeFile(new URL('../web/content/interior-layouts.json',import.meta.url),JSON.stringify({sourceHash:hash,pages:variants},null,2));
await fs.writeFile(new URL('../web/content/interior-content.json',import.meta.url),JSON.stringify(safePages,null,2));
console.log(`Imported ${slugs.length} interior pages in FR/EN and ${imageMap.size} local images; no messages sent.`);
