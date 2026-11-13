/* Published copy and layout bridge. No CMS credential is sent to this script. */
(async()=>{
 const {compileStyles}=await import('./style-policy.js?v=eb04af4ec0bb');
 if(typeof PAGES==='undefined'||typeof render!=='function')return;
 const originals=structuredClone(PAGES),nativeRender=render;
 const locale=()=>document.documentElement.lang==='en'?'en':'fr';
 const local=(value,language)=>typeof value==='string'?value:(value?.[language]||value?.fr||'');
 const update=(value,text,language)=>({...((value&&typeof value==='object')?value:{}),[language]:text});
 const lines=(value,language)=>String(value).split(/\n\s*\n/u).filter(Boolean).map(text=>({[language]:text}));
 const ordered=(items,order,key)=>{const used=new Set(),result=[];for(const token of order||[]){const item=items.find((value,index)=>key(value,index)===token);if(item&&!used.has(item)){used.add(item);result.push(item);}}return result.concat(items.filter(item=>!used.has(item)));};
 let sequence=0,requestKey='',applying=false,draft=null,drag=null,referenceCache=null,revision=0;
 const parameters=new URLSearchParams(location.search);
 const preview=parameters.get('editor')==='1'&&window.parent!==window;
 const previewSectionOrder=(parameters.get('sections')||'').split(',').filter(value=>/^[a-z][a-z0-9-]{0,79}$/u.test(value));

 let adminOrigin;
 const trustedAdmin=value=>{
  try{
   const url=new URL(value,location.href);
   if(url.username||url.password)return null;
   if(url.protocol==='http:'&&!['127.0.0.1','localhost','[::1]'].includes(url.hostname))return null;
   if(!['http:','https:'].includes(url.protocol))return null;
   return url.origin;
  }catch{return null;}
 };
 try{
  const configured=document.querySelector('meta[name="agropulse-cms-admin-origin"]')?.content?.trim();
  const baseHost=location.hostname.replace(/^www\./u,'');
  const automatic=location.protocol==='https:'?'https://cms.'+baseHost:'';
  adminOrigin=trustedAdmin(configured)||trustedAdmin(document.referrer)||trustedAdmin(automatic);
 }catch{}
 const send=data=>{if(preview&&adminOrigin)window.parent.postMessage({channel:'agropulse-editor',page:CUR,locale:locale(),revision,...data},adminOrigin);};


 const cardSelectors='.pole-grid > .pole-card, .fx > .fr, .tl4 > .tc, .pl > a, .steps > li, .jn > .js, .lk > a, .mo > .mt, .country-list > .country-card, .programme-facts > .programme-fact, .programme-questions > .programme-question, .lg2 > div > article';
 function markComponents(){
  const title=document.querySelector('#app h1');if(title){title.classList.add('agp-page-title');title.parentElement.querySelectorAll('p').forEach(element=>element.classList.add('agp-intro'));}
  for(const section of PAGES[CUR]?.sections||[]){const element=document.getElementById('sec-'+section.id);if(!element)continue;element.classList.add('agp-section');element.querySelector('h2')?.classList.add('agp-section-title');const cards=[...element.querySelectorAll(cardSelectors)];if(cards.length===(section.groups||[]).length)for(const card of cards){card.classList.add('agp-card');card.parentElement.classList.add('agp-card-grid');}}
 }
 function pageStyles(value={}){
  const previous=document.getElementById('agropulse-page-style');let css='';try{css=compileStyles(value);}catch(error){send({type:'style-error',message:error.message});previous?.remove();return;}
  send({type:'style-error',message:''});if(!css){previous?.remove();return;}const element=previous||document.createElement('style');element.id='agropulse-page-style';element.textContent=css;if(!previous)document.head.append(element);
 }
 function focusPreview(section,card){
  if(section==='hero'){document.querySelector('#app h1')?.scrollIntoView({block:'center'});return;}
  if(!(originals[CUR]?.sections||[]).some(item=>item.id===section))return;
  let target=document.getElementById('sec-'+section);if(Number.isInteger(card))target=[...document.querySelectorAll('.ap-editor-target[data-editor-kind=card]')].find(item=>item.dataset.editorSection===section&&item.dataset.editorToken===String(card))||target;
  target?.scrollIntoView({block:'start'});
 }

 function reference(){
  const page=originals[CUR],language=locale();if(!page)return null;
  let heroTitle=local(page.hero?.title,language),intro=(page.hero?.lead||[]).map(x=>local(x,language)).join('\n\n');
  if(CUR==='accueil'&&typeof HOME_HERO==='string'){
   const template=document.createElement('template');template.innerHTML=HOME_HERO;
   const text=selector=>{const element=template.content.querySelector(selector);if(!element)return '';const copy=document.createElement('div');copy.innerHTML=language==='en'?(element.dataset.en||element.innerHTML):element.innerHTML;return copy.textContent.trim();};
   heroTitle=text('[data-cms="hero.title"]');intro=text('[data-cms="hero.subtitle"]');
  }
  return {page:CUR,locale:language,title:local(page.title,language),hero:{title:heroTitle,intro},sections:page.sections.map(section=>({id:section.id,type:section.type,title:local(section.title,language),kicker:local(section.kicker,language),lead:(section.lead||[]).map(x=>local(x,language)).join('\n\n'),groups:(section.groups||[]).map(group=>({title:local(group.title,language),text:(group.text||[]).map(x=>local(x,language)).join('\n\n')}))}))};
 }
 function reorderRenderedSections(order){
  if(!Array.isArray(order)||!order.length)return;
  const app=document.querySelector('#app');if(!app)return;
  const elements=new Map();
  for(const element of app.querySelectorAll(':scope > section[id^="sec-"]')){
   elements.set(element.id.slice(4),element);
  }
  const seen=new Set();
  for(const id of order){
   const element=elements.get(id);
   if(element){app.append(element);seen.add(id);}
  }
  for(const [id,element] of elements){
   if(!seen.has(id))app.append(element);
  }
 }
 function apply(copy={},layout={}){
  const page=structuredClone(originals[CUR]),language=locale();if(!page)return;
  if(typeof copy.title==='string')page.title=update(page.title,copy.title,language);
  if(page.hero){if(typeof copy.hero?.title==='string')page.hero.title=update(page.hero.title,copy.hero.title,language);if(typeof copy.hero?.intro==='string')page.hero.lead=lines(copy.hero.intro,language);}
  for(const section of page.sections){
   const text=copy.sections?.[section.id];
   if(text){for(const field of ['title','kicker'])if(typeof text[field]==='string')section[field]=update(section[field],text[field],language);if(typeof text.lead==='string')section.lead=lines(text.lead,language);for(const[groupIndex,group]of(section.groups||[]).entries()){const entry=text.groups?.[groupIndex];if(!entry)continue;if(typeof entry.title==='string')group.title=update(group.title,entry.title,language);if(typeof entry.text==='string')group.text=lines(entry.text,language);}}
   if(section.groups)section.groups=ordered(section.groups,layout.cards?.[section.id],(_group,index)=>index);
  }
  page.sections=ordered(page.sections,layout.sections,section=>section.id);
  PAGES[CUR]=page;applying=true;nativeRender();applying=false;
  reorderRenderedSections(layout.sections);
  if(CUR==='accueil'){
   if(typeof homeContentRequest!=='undefined')homeContentRequest++;
   for(const[key,selector]of [['title','[data-cms="hero.title"]'],['intro','[data-cms="hero.subtitle"]']]){const element=document.querySelector('.home-hero '+selector);if(element&&typeof copy.hero?.[key]==='string')element.textContent=copy.hero[key];}
   window.AGROPULSE_PAGE_CONTENT_READY=true;
  }
  markComponents();pageStyles(layout.styles||{});
  if(preview){installHandles();send({type:'selection',reference:referenceCache});}
 }
 async function refresh(){
  if(applying||!originals[CUR])return;
  const key=CUR+':'+locale();referenceCache=reference();
  if(preview){
   if(draft?.page===CUR&&draft.locale===locale())apply(draft.copy,draft.layout);
   else if(previewSectionOrder.length)apply({}, {sections:previewSectionOrder});
   else installHandles();
   send({type:'reference',reference:referenceCache});
   return;
  }
  if(requestKey===key)return;requestKey=key;const request=++sequence,page=CUR,language=locale();
  try{const response=await fetch('/api/page-content?'+new URLSearchParams({page,locale:language}),{cache:'no-store'});const body=await response.json();if(request!==sequence||CUR!==page||locale()!==language)return;if(!response.ok)throw Error('unavailable');if(body.status==='published'){apply(body.copy,body.layout);document.querySelector('#app').dataset.cmsPageState='published';}else{window.AGROPULSE_PAGE_CONTENT_READY=false;document.querySelector('#app').dataset.cmsPageState='reference';if(CUR==='accueil'&&typeof loadPublishedHome==='function')loadPublishedHome();}}catch{if(CUR===page)document.querySelector('#app').dataset.cmsPageState='unavailable';}
 }

 function move(kind,section,from,to,absolute=false){
  const page=originals[CUR];if(!page)return;
  const state=draft||{page:CUR,locale:locale(),copy:{},layout:{}};state.layout||={};
  let order;
  if(kind==='section')order=ordered(page.sections,state.layout.sections,item=>item.id).map(item=>item.id);
  else{state.layout.cards||={};const groups=page.sections.find(item=>item.id===section)?.groups||[];order=ordered(groups,state.layout.cards[section],(_item,index)=>index).map(group=>groups.indexOf(group));}
  const position=order.indexOf(from);if(position<0)return;
  let destination=absolute?order.indexOf(to):position+to;
  if(destination<0||destination>=order.length)return;
  order.splice(destination,0,order.splice(position,1)[0]);
  if(kind==='section')state.layout.sections=order;else state.layout.cards[section]=order;
  revision++;draft=state;apply(state.copy,state.layout);send({type:'layout',layout:state.layout});
 }
 function handle(target,kind,section,token,label){
  target.classList.add('ap-editor-target');target.dataset.editorKind=kind;target.dataset.editorToken=String(token);target.dataset.editorSection=section;
  const tools=document.createElement('div');tools.className='ap-editor-tools';tools.onclick=event=>{event.preventDefault();event.stopPropagation();};
  const grip=document.createElement('button');grip.type='button';grip.draggable=true;grip.textContent='⠿ '+label;grip.setAttribute('aria-label',(locale()==='fr'?'Déplacer ':'Move ')+label);
  const startDrag=event=>{event.stopPropagation();drag={kind,section,token};event.dataTransfer.effectAllowed='move';event.dataTransfer.setData('text/plain','AgroPulse');};grip.ondragstart=startDrag;grip.ondragend=()=>{drag=null;};target.addEventListener('dragstart',event=>{if(kind==='card'&&event.target===target)startDrag(event);});target.addEventListener('dragend',()=>{drag=null;});grip.style.setProperty('-webkit-user-drag','element','important');
  grip.onkeydown=event=>{if(['ArrowUp','ArrowLeft','ArrowDown','ArrowRight'].includes(event.key)){event.preventDefault();move(kind,section,token,['ArrowUp','ArrowLeft'].includes(event.key)?-1:1);}};
  const select=document.createElement('button');select.type='button';select.textContent=locale()==='fr'?'Modifier':'Edit';select.onclick=()=>send({type:'select',section,card:kind==='card'?token:null});
  const action=(symbol,direction)=>{const button=document.createElement('button');button.type='button';button.textContent=symbol;button.setAttribute('aria-label',(locale()==='fr'?'Déplacer ':'Move ')+label+(direction<0?(locale()==='fr'?' avant':' before'):(locale()==='fr'?' après':' after')));button.onclick=()=>move(kind,section,token,direction);return button;};
  tools.append(grip,action('← ↑',-1),action('↓ →',1),select);target.prepend(tools);
  target.addEventListener('dragover',event=>{if(drag?.kind===kind&&(kind==='section'||drag.section===section)){event.preventDefault();event.stopPropagation();}});
  target.addEventListener('drop',event=>{if(drag?.kind!==kind||(kind==='card'&&drag.section!==section))return;event.preventDefault();event.stopPropagation();const source=drag;drag=null;move(kind,section,source.token,token,true);});
 }
 function installHandles(){
  if(!preview||!adminOrigin)return;
  document.querySelectorAll('.ap-editor-tools').forEach(element=>element.remove());
  if(!document.querySelector('#ap-editor-note')){const note=document.createElement('div');note.id='ap-editor-note';note.textContent=locale()==='fr'?'Aperçu de travail — modifications non publiées':'Working preview — unpublished changes';document.body.prepend(note);}
  const base=originals[CUR],layout=draft?.layout||{};
  for(const section of PAGES[CUR].sections){
   const element=document.getElementById('sec-'+section.id);if(!element)continue;
   handle(element,'section',section.id,section.id,local(section.title,locale())||section.id);
   const groups=base.sections.find(item=>item.id===section.id)?.groups||[];
   const candidates=[...element.querySelectorAll(cardSelectors)];
   if(candidates.length!==groups.length||!groups.length)continue;
   const order=ordered(groups,layout.cards?.[section.id],(_item,index)=>index).map(group=>groups.indexOf(group));
   candidates.forEach((card,index)=>handle(card,'card',section.id,order[index],local(groups[order[index]].title,locale())||String(index+1)));
  }
 }
 window.addEventListener('message',event=>{
  if(!preview||event.source!==window.parent||event.data?.channel!=='agropulse-editor')return;
  if(!adminOrigin){
   const candidate=trustedAdmin(event.origin);
   const baseHost=location.hostname.replace(/^www\./u,'');
   if(candidate&&(new URL(candidate).hostname==='cms.'+baseHost||['127.0.0.1','localhost','[::1]'].includes(new URL(candidate).hostname)))adminOrigin=candidate;
  }
  if(!adminOrigin||event.origin!==adminOrigin)return;
  if(event.data.type==='focus'){focusPreview(event.data.section,event.data.card);return;}
  if(event.data.type==='hello'){send({type:'ready'});send({type:'reference',reference:reference()});return;}
  if(event.data.type==='draft'&&event.data.page===CUR&&event.data.locale===locale()){
   // A delayed parent echo must never undo a newer move in this frame.
   if(event.data.revision!==undefined&&event.data.revision!==revision)return;
   try{if(JSON.stringify(event.data).length>200000)return;}catch{return;}
   const next={page:CUR,locale:locale(),copy:event.data.copy||{},layout:event.data.layout||{}};if(draft&&JSON.stringify(draft)===JSON.stringify(next))return;draft=next;apply(draft.copy,draft.layout);
  }
 });
 window.render=function(){document.getElementById('agropulse-page-style')?.remove();nativeRender();markComponents();refresh();};
 if(preview){const style=document.createElement('style');style.textContent='#ap-editor-note{position:sticky;top:0;z-index:100000;background:#0f2f44;color:white;padding:10px 18px;font:600 14px Arial}.ap-editor-target{position:relative!important;outline:1px dashed #3f9a3c;outline-offset:-2px}.ap-editor-target[data-editor-kind=card]{padding-top:104px!important;box-sizing:border-box!important}.ap-editor-target>.ap-editor-tools{all:initial!important;position:absolute!important;top:6px!important;left:6px!important;right:6px!important;z-index:100!important;display:flex!important;align-items:center!important;flex-wrap:wrap!important;gap:4px!important;padding:5px!important;background:#edf7ed!important;color:#0f2f44!important;font:14px Arial!important;box-sizing:border-box!important;width:auto!important;height:auto!important;min-height:0!important;max-height:none!important;border-radius:6px!important}.ap-editor-target>.ap-editor-tools>button{all:initial!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;min-height:44px!important;min-width:38px!important;box-sizing:border-box!important;border:1px solid #b4d3b3!important;border-radius:5px!important;background:white!important;color:#163b29!important;padding:6px 8px!important;font:600 12px Arial!important;cursor:pointer!important;flex:0 1 auto!important;max-width:100%!important}.ap-editor-target>.ap-editor-tools>button:focus-visible{outline:3px solid #157bb8!important;outline-offset:1px!important}.ap-editor-target>.ap-editor-tools>button[draggable]{cursor:grab!important;max-width:180px!important;overflow:hidden!important;white-space:nowrap!important;text-overflow:ellipsis!important;display:block!important}';document.head.append(style);}
 document.addEventListener('visibilitychange',()=>{if(!preview&&!document.hidden){requestKey='';refresh();}});
 window.addEventListener('focus',()=>{if(!preview){requestKey='';refresh();}});
 markComponents();refresh();
})();
