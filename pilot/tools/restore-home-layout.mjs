// Reproduce the supplied home composition. Imported scripts are reviewed separately.
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)('playwright');
const source=process.argv[2];if(!source)throw Error('Expected approved home HTML path.');
const original=await fs.readFile(source,'utf8');
const originalHash=createHash('sha256').update(original).digest('hex');
if(originalHash!=='32628ee7415bd4f8a941db4fde2b6b9203a89722fb3c2188ad49e2f44baff56d')throw Error('The reference changed. Review its interactions before importing a new version.');
const data=JSON.parse(original.match(/<script[^>]*id="cms-data"[^>]*>([\s\S]*?)<\/script>/)[1]);
const root=new URL('../web/public/reference/',import.meta.url);await fs.mkdir(root,{recursive:true});
const images=new Map();
let html=original;
for(const match of original.matchAll(/data:image\/(png|webp|jpeg);base64,([A-Za-z0-9+/=]+)/g)){
 if(images.has(match[0]))continue;
 const bytes=Buffer.from(match[2],'base64'),name=createHash('sha256').update(bytes).digest('hex').slice(0,16)+'.'+match[1];
 await fs.writeFile(new URL(name,root),bytes);images.set(match[0],'/reference/'+name);
}
for(const [embedded,url]of images)html=html.replaceAll(embedded,url);
function localizeImages(value){if(typeof value==='string')return images.get(value)||value;if(Array.isArray(value))return value.map(localizeImages);if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,localizeImages(item)]));return value;}
const content=localizeImages(data);
// Keep the visual composition while respecting confirmed project information.
content.fellowship.lead={fr:'Une formation de 2 à 3 mois, puis une certification et un accompagnement vers l’emploi. La durée totale du parcours reste à confirmer.',en:'Two to three months of training, followed by certification and support towards employment. Total programme duration remains to be confirmed.'};
content.fellowship.steps[2].title={fr:'Préparer son insertion',en:'Prepare for employment'};
content.fellowship.steps[2].desc={fr:'Un accompagnement vers l’insertion professionnelle ; aucun emploi n’est garanti.',en:'Support towards professional integration; employment is not guaranteed.'};
content.fellowship.note={fr:'Calendrier et conditions à confirmer. Les candidatures sont fermées.',en:'Dates and conditions to be confirmed. Applications are closed.'};
content.agir.tag={fr:'Initiative spécifique · 26 septembre 2026',en:'Specific initiative · 26 September 2026'};
content.ancrage.lead={fr:'Côte d’Ivoire, Sénégal et Guinée-Bissau : les pays d’intervention indiqués pour AgroPulse.',en:'Côte d’Ivoire, Senegal and Guinea-Bissau: AgroPulse’s stated countries of intervention.'};
content.ancrage.details=content.ancrage.details.map(item=>({code:item.code,role:{fr:'Pays d’intervention',en:'Country of intervention'},text:{fr:'',en:''},facts:[]}));
delete content.hq;
content.partners=(content.partners||[]).filter(partner=>/AWI/i.test(partner.name?.fr||''));
for(const partner of content.partners){partner.hq=null;partner.projects=(partner.projects||[]).filter(project=>/AGIR/i.test(project.title?.fr||''));for(const project of partner.projects){delete project.lat;delete project.lon;project.description={fr:'Formation destinée à 20 femmes agripreneures en Côte d’Ivoire. Conception, animation et suivi pédagogique : AgroPulse.',en:'Training for 20 women agripreneurs in Côte d’Ivoire. Design, delivery and educational follow-up: AgroPulse.'};}}
content.contact.lead={fr:'Présentez votre projet et vos besoins. Ce formulaire permet de préparer une demande ; aucun message n’est envoyé pour le moment.',en:'Tell us about your project and needs. This form prepares an enquiry; it does not send a message yet.'};
const scripts=[...original.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)].filter(match=>!match[1].includes('application/json'));
if(scripts.length!==1)throw Error('Unexpected source script inventory: review required.');
let script=scripts[0][2];
// Explicit patches to the reviewed reference behaviour: no false receipt or remote data feed.
const oldSubmit=/q\('#f'\)\.onsubmit=e=>\{[\s\S]*?if\(ok\)f\.reset\(\)\};/;
if(!oldSubmit.test(script))throw Error('Contact patch no longer matches; review source.');
script=script.replace(oldSubmit,"q('#f').onsubmit=e=>{e.preventDefault();const en=document.documentElement.lang==='en';q('#st').textContent=en?'Draft prepared locally. No message has been sent.':'Brouillon préparé sur cette page. Aucun message n’a été envoyé.';};");
script=script.replace(/fetch\('content\/site\.json'[^\n]+/,'');
script=script.replace("HQC='CI'","HQC=null");
script=script.replace("try{if(localStorage.getItem('ap-lang')=='en')setLang('en')}catch(e){}",'');
script=script.replace("q('#lang').onclick=()=>setLang(document.documentElement.lang=='en'?'fr':'en');","q('#lang').onclick=()=>location.assign('/'+(document.documentElement.lang==='en'?'fr':'en')+location.hash);");
script=script.replace("qa('[data-en]').forEach(el=>el.dataset.fr=el.innerHTML);","qa('[data-en]').forEach(el=>{if(!el.dataset.fr)el.dataset.fr=el.innerHTML});q('#lang').textContent=document.documentElement.lang==='en'?'FR':'EN';");
script=script.replaceAll('CERTIFIÉ AGROPULSE','SIMULATION TERMINÉE').replaceAll('AGROPULSE CERTIFIED','SIMULATION COMPLETE').replaceAll('Candidater au Fellowship','Découvrir le Fellowship').replaceAll('Apply to the Fellowship','Explore the Fellowship');
script=script.replaceAll('Bricolage Grotesque','Arial').replaceAll('Figtree','Arial');
if(/fetch\(|XMLHttpRequest|sendBeacon|eval\(|new Function/.test(script))throw Error('Unexpected network or dynamic execution in reference interaction code.');
await fs.writeFile(new URL('home-interactions.js',root),'// Adapted from the user-supplied home mockup. Source SHA-256: '+originalHash+'\n(()=>{\n'+script+'\n})();\n');
const css=html.match(/<style>([\s\S]*?)<\/style>/)[1];
await fs.writeFile(new URL('../web/app/reference-home.css',import.meta.url),css+'\n/* Explicit user change: no overlaid logo inside the hero. */\n.hero .hlogo{display:none}\nhtml{scroll-behavior:smooth}.reveal h2,.reveal .lead{opacity:1;transform:none}.steps li{opacity:1;transform:none}\n.soc .social-placeholder{width:40px;height:40px;border-radius:50%;border:1px solid #fff3;display:grid;place-items:center}\n@media(prefers-reduced-motion:reduce){.hero:after{display:none}*{scroll-behavior:auto!important}}\n');
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const page=await browser.newPage();await page.route('**/*',route=>route.abort());
 const variants={};
 for(const locale of ['fr','en']){
  variants[locale]=await page.evaluate(({html,content,locale})=>{
   const doc=new DOMParser().parseFromString(html,'text/html');
   doc.querySelectorAll('script,iframe,object,embed,base,link,style').forEach(node=>node.remove());
   doc.querySelector('.hero .hlogo')?.remove();
   const lookup=key=>key.split('.').reduce((value,part)=>value?.[part],content);
   doc.querySelectorAll('[data-cms]').forEach(node=>{const value=lookup(node.dataset.cms);if(value?.fr){node.innerHTML=value.fr;node.dataset.en=value.en||value.fr;}});
   doc.querySelectorAll('[data-en]').forEach(node=>{node.dataset.fr=node.innerHTML;if(locale==='en')node.innerHTML=node.dataset.en;});
   const keep=['accueil','a-propos','expertises','fellowship','contact'];doc.querySelectorAll('#nav li').forEach(item=>{const link=item.querySelector('a');if(!keep.includes(link?.dataset.pg))item.remove();else if(link.dataset.pg==='fellowship'){link.textContent='Programmes';link.removeAttribute('data-en');}});doc.querySelector('.tools .cta')?.remove();
   doc.querySelectorAll('[onload],[onclick],[onerror],[onsubmit]').forEach(node=>{for(const attr of [...node.attributes])if(attr.name.startsWith('on'))node.removeAttribute(attr.name);});
   for(const node of doc.querySelectorAll('*'))for(const attr of [...node.attributes])if(attr.name.startsWith('on')||/^(?:javascript|vbscript):/i.test(attr.value))node.removeAttribute(attr.name);
   doc.querySelectorAll('.hero [data-cms]').forEach(node=>node.removeAttribute('data-cms'));
   doc.querySelector('.hero h1').innerHTML='__AGROPULSE_HERO_TITLE__';
   doc.querySelector('.hero .w > p[data-en]')?.removeAttribute('data-cms');
   const heroIntro=doc.querySelector('.hero .w > p:not(.eyebrow):not(.rot)');if(heroIntro)heroIntro.innerHTML='__AGROPULSE_HERO_INTRO__';
   const first=doc.querySelector('.skip');if(first)first.href='#main';
   const aliases={'accueil':'top','a-propos':'ancrage','contact':'contact','partenaires':'partenaires','fellowship':'fellowship','agir-ia':'agir-ia','expertises':'expertises','ressources':'ressources','candidature':'fellowship','mentions-legales':'informations','confidentialite':'informations'};
   doc.querySelectorAll('a[href]').forEach(link=>{const raw=link.getAttribute('href');let slug;if(raw.startsWith('https://claude.ai/artifact/'))slug=raw.includes('#p-')?raw.split('#p-')[1]:'accueil';if(slug){if(['a-propos','expertises','pole-1','pole-2','pole-3','pole-4','pole-5','pole-6'].includes(slug))link.setAttribute('href','/'+locale+'/'+slug);else{const target=aliases[slug]||'contact';link.setAttribute('href','#'+target);}}});
   doc.querySelectorAll('.poles ol>li').forEach((item,index)=>{const link=doc.createElement('a');link.href='/'+locale+'/pole-'+(index+1);link.className='pole-page-link';link.textContent=locale==='en'?'Explore this area →':'Découvrir ce pôle →';item.append(link);});
   doc.querySelectorAll('.soc a').forEach(link=>{const span=doc.createElement('span');span.className='social-placeholder';span.setAttribute('aria-label',link.getAttribute('aria-label')+' — '+(locale==='en'?'link pending':'lien à compléter'));span.innerHTML=link.innerHTML;link.replaceWith(span);});
   const form=doc.querySelector('#f');form.removeAttribute('action');form.removeAttribute('novalidate');form.method='dialog';form.querySelector('button[type=submit]').textContent=locale==='en'?'Prepare my enquiry':'Préparer ma demande';
   const label=doc.createElement('p');label.className='nt';label.textContent=locale==='en'?'No transmission: keep your draft before leaving the page.':'Aucun envoi : conserve ton brouillon avant de quitter la page.';form.prepend(label);
   const safety=doc.createElement('noscript');safety.textContent=locale==='en'?'JavaScript is required to prepare a draft. No message can be sent.':'JavaScript est nécessaire pour préparer un brouillon. Aucun message ne peut être envoyé.';form.append(safety);
   const submit=form.querySelector('button[type=submit]');submit.setAttribute('disabled','');submit.dataset.enableDraft='';
   doc.querySelectorAll('footer [data-en*="Headquarters"]').forEach(node=>{node.textContent=locale==='en'?'West Africa':'Afrique de l’Ouest';node.removeAttribute('data-en');});
   doc.querySelectorAll('#agir-explain li').forEach(node=>{if(node.textContent.includes('date à valider')){node.textContent=locale==='en'?'With the AWI Foundation · 26 September 2026':'Avec la Fondation AWI · 26 septembre 2026';node.removeAttribute('data-en');}});
   const resource=doc.createElement('section');resource.id='ressources';resource.innerHTML='<div class="w"><h2>'+(locale==='en'?'Resources':'Ressources')+'</h2><p class="lead">'+(locale==='en'?'Approved public documents will be added here. No download is available yet.':'Les documents publics approuvés seront ajoutés ici. Aucun téléchargement n’est disponible pour le moment.')+'</p></div>';doc.querySelector('#contact').before(resource);
   const info=doc.createElement('div');info.id='informations';info.className='fine';info.textContent=locale==='en'?'Local review version. Legal information and privacy policy remain to be completed. Visuals and simulations are illustrative; no application is collected.':'Version locale de revue. Les informations légales et la politique de confidentialité restent à compléter. Visuels et simulations illustratifs ; aucune candidature collectée.';doc.querySelector('footer .w').append(info);
   doc.querySelectorAll('.lab-cta').forEach(link=>{link.href='#fellowship';link.textContent=locale==='en'?'Explore the Fellowship':'Découvrir le Fellowship';link.dataset.en='Explore the Fellowship';});
   doc.querySelector('#fellowship .stage')?.insertAdjacentHTML('afterend','<p class="nt">'+(locale==='en'?'Illustrative simulation using fictional data; this is not agricultural advice or a certification.':'Simulation illustrative sur des données fictives ; elle ne délivre ni conseil agricole ni certification.')+'</p>');
   const lang=doc.querySelector('#lang');lang.textContent=locale==='en'?'FR':'EN';lang.setAttribute('aria-label',locale==='en'?'Passer en français':'Switch to English');
   const json=doc.createElement('script');json.type='application/json';json.id='cms-data';json.textContent=JSON.stringify(content).replaceAll('<','\\u003c');doc.body.append(json);
   return doc.body.innerHTML;
  },{html,content,locale});
 }
 await fs.writeFile(new URL('../web/content/home-layout.json',import.meta.url),JSON.stringify({sourceHash:originalHash,variants},null,2));
}finally{await browser.close();}
// Enable preparation only once the safe submit handler has been installed.
const scriptPath=new URL('home-interactions.js',root);
await fs.appendFile(scriptPath,"\ndocument.querySelector('[data-enable-draft]')?.removeAttribute('disabled');\n");
console.log(`Restored full home composition in FR/EN with ${images.size} local images; source scripts were inspected, not executed by the importer.`);
