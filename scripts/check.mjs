import assert from 'node:assert/strict';
import { readFile, access, readdir } from 'node:fs/promises';
import vm from 'node:vm';
const root=new URL('../public/',import.meta.url);
const html=await readFile(new URL('index.html',root),'utf8');
const app=await readFile(new URL('app.js',root),'utf8');
const homepageScript=await readFile(new URL('homepage.js',root),'utf8');
const sitePagesScript=await readFile(new URL('site-pages.js',root),'utf8');
const contactHandler=await readFile(new URL('../scripts/contact-handler.mjs',import.meta.url),'utf8');
const homeContentHandler=await readFile(new URL('../scripts/home-content.mjs',import.meta.url),'utf8');
const server=await readFile(new URL('../scripts/serve.mjs',import.meta.url),'utf8');
const siteBuilder=await readFile(new URL('../scripts/build-maquette-site.mjs',import.meta.url),'utf8');
const data=app.slice(0,app.indexOf('let language ='));
const {copy}=vm.runInNewContext(`${data}\n({copy})`);
for(const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gu)){
 if(/application\/json/u.test(match[1]))continue;
 new vm.Script(match[2],{filename:'public/index.html:inline-script'});
}
assert.match(html, /--g:#3F9A3C/u,'The homepage must retain the approved maquette color palette');
assert.match(html, /--n:#0F2F44/u,'The homepage must retain the approved maquette colors');
assert.match(html, /href="typography.css"/u,'The site must load the newly approved local typography');
assert.doesNotMatch(html, /href=["']https:\/\/fonts\.(?:googleapis|gstatic)\.com/u,'Typography must not depend on external font requests');
const typography=await readFile(new URL('typography.css',root),'utf8');
for(const family of ['Sora','Manrope']){
 assert.ok(typography.includes("font-family: '"+family+"'"),'Missing local font family: '+family);
 await access(new URL('assets/fonts/'+family+'-OFL.txt',root));
}
const fontFiles=new Set([...typography.matchAll(/url\((assets\/fonts\/[a-z-]+\.woff2)\)/gu)].map(match=>match[1]));
assert.equal(fontFiles.size,4,'Both typefaces must include their Latin and Latin Extended subsets');
for(const file of fontFiles){const bytes=await readFile(new URL(file,root));assert.equal(bytes.subarray(0,4).toString(),'wOF2','Invalid local webfont: '+file);}
assert.match(html, /<title>AgroPulse Global Solutions<\/title>/u);
assert.match(html, /home-hero/u,'The CMS connection must retain the approved homepage hero');
assert.match(html, /async function loadPublishedHome\(\)/u,'The homepage must load published copy through its server endpoint');
assert.match(html, /dataset\.cmsContentState/u,'The homepage must expose the CMS read status for diagnostics');
assert.match(html, /target\.textContent=value/u,'Published CMS copy must be inserted as text rather than markup');
assert.doesNotMatch(html, /data:image\/(?:webp|png);base64,/u,'Embedded images must be served as external assets');
const maquetteData=html.match(/<script id="pages-data" type="application\/json">([\s\S]*?)<\/script>/u);
assert.ok(maquetteData,'Maquette content must be embedded as JSON');
const maquettePages=JSON.parse(maquetteData[1]);
assert.match(html,/const PH=slug=>slug\.startsWith\('#'\)\?slug:/u,'Explicit route and section hashes must not be prefixed twice');
assert.match(siteBuilder,/appScript\.includes\(menuHandler\)\s*&&\s*!appScript\.includes\(keyboardDismissHandler\)/u,'Repeated builds must not duplicate the keyboard dismissal handler');
assert.match(html,/requestedLanguage=new URLSearchParams\(location\.search\)\.get\('lang'\)/u,'Direct links must restore the requested language');
assert.match(html,/url\.searchParams\.set\('lang',l\)/u,'The language switch must produce a shareable URL');
assert.match(html,/aria-controls="nav"/u,'The mobile navigation control must identify its controlled menu');
assert.match(html,/data-en="Skip to content"/u,'The skip link must be announced in English');
assert.match(html,/data-en-aria-label="Main navigation"/u,'The main navigation landmark must be named in English');
assert.match(html,/e\.key==='Escape'.{0,180}bg\.focus\(\)/u,'Escape must close the mobile menu and restore focus');
assert.match(html,/href="#lg\$\{i\}" data-go="lg\$\{i\}"/u,'Legal page contents links must target their sections');
assert.match(html,/aria-label="\$\{EN\(\)\?'Table of contents':'Sommaire'\}"/u,'The legal contents landmark must be named in the current language');
assert.match(html,/\.lg2\{grid-template-columns:minmax\(0,1fr\);gap:24px\}/u,'Legal content must fit narrow screens');
assert.match(html,/\.toc\{position:static;grid-template-columns:minmax\(0,1fr\)!important\}/u,'The legal contents navigation must fit narrow screens');
assert.match(html,/const target=document\.getElementById\(a\.dataset\.go\)\?a\.dataset\.go:'sec-'\+a\.dataset\.go;a\.setAttribute\('href','#'\+target\)/u,'Section links must receive real fragment destinations');
assert.match(html,/<\$\{g\.to\?'a':'div'\} class="mt"/u,'Informational mosaic cards must not be emitted as placeholder links');
assert.equal([...html.matchAll(/<span class="social-placeholder" aria-hidden="true">/gu)].length,4,'Unconfirmed social profiles must not be clickable links');
assert.doesNotMatch(html,/aria-label="(?:LinkedIn|Facebook|YouTube|TikTok)" href="#"/u,'Social icons must not point to placeholder URLs');
assert.doesNotMatch(html,/Headquarters: Abidjan/u,'The site must not imply an unconfirmed office location');
assert.doesNotMatch(html,/Our headquarters are in Abidjan|Notre siège est à Abidjan|AgroPulse headquarters · Abidjan|Regional office \(to be confirmed\)|Antenne \(à valider\)|rooted in Abidjan|ancré à Abidjan/iu,'The site and map must not imply unconfirmed offices or an Abidjan headquarters');
assert.match(html,/Countries of intervention: Côte d’Ivoire, Senegal and Guinea-Bissau\./u,'The country map must use validated intervention countries');
assert.doesNotMatch(html,/Siège ¦ HQ|Our countries of operation|Country of operation listed/u,'Contact locations must not imply an unconfirmed headquarters or operation status');
assert.match(html,/Countries of intervention: Côte d’Ivoire · Senegal · Guinea-Bissau/u,'The English footer must use validated intervention countries');
const getSection=(page,id)=>maquettePages[page].sections.find(section=>section.id===id);
for(const name of ['accueil','expertises','a-propos','fellowship','agir-ia','contact','partenaires','ressources'])assert.ok(maquettePages[name],`Missing maquette page ${name}`);
assert.equal(getSection('accueil','poles').groups.length,8,'Homepage must show the eight validated expertise areas');
assert.equal(getSection('expertises','poles').groups.length,8,'Expertise page must show the eight validated areas');
for(const name of ['accueil','expertises'])assert.deepEqual(getSection(name,'poles').groups.map(group=>group.to),['#p-pole-1','#p-pole-2','#p-pole-3','#p-pole-4','#p-pole-5','#p-pole-6','#p-pole-7','#p-pole-8'],`${name} expertise links must target their corresponding pages`);
for(const name of ['mentions-legales','confidentialite']){
 const page=maquettePages[name];
 assert.ok(page?.title?.en&&page.hero?.title?.en,`${name} must have an English title`);
 assert.ok(page.sections[0].groups.every(group=>group.title.en&&group.text.every(text=>text.en)),`${name} must not silently display French draft copy in English`);
 assert.match(JSON.stringify(page),/Draft pending legal review/u,`${name} must remain visibly marked as an unapproved draft`);
}
assert.doesNotMatch(JSON.stringify(maquettePages.confidentialite),/newsletter|lettre d’information/iu,'The privacy draft must not claim that a newsletter is offered');
assert.match(JSON.stringify(maquettePages.fellowship), /Candidatures sont fermées|Applications are closed/u);
assert.match(JSON.stringify(maquettePages['agir-ia']), /distinct du programme YIDA-Cashew|distinct from YIDA-Cashew/u);
assert.doesNotMatch(JSON.stringify(maquettePages.contact), /\[adresse à compléter\]|\[à valider\]/u,'Contact page must not show unconfirmed contact details');
assert.ok(maquettePages.contact.title.en,'The contact page must have an English browser title');
assert.equal(getSection('contact','canaux').title.en,'Countries of intervention');
assert.ok(getSection('contact','canaux').groups.every(group=>group.text.every(text=>text.en==='Country of intervention listed.')&&!group.meta?.some(value=>value.includes('HQ')||value.includes('Siège'))),'Contact locations must describe intervention only, without an unconfirmed office badge');
const yidaMosaic=maquettePages.fellowship.sections.find(section=>section.type==='mosaic');
assert.ok(yidaMosaic?.groups?.length&&yidaMosaic.groups.every(group=>!group.to),'YIDA information cards must remain non-interactive when they have no destination');
assert.notEqual(maquettePages.ressources.hero.variant,'docs','Resources must not suggest unavailable publications');
assert.doesNotMatch(JSON.stringify(getSection('accueil','reseau-international').lead),/Abidjan/u,'The homepage network copy must not imply an unconfirmed headquarters');
const requestFields=getSection('contact','form').fields;
assert.deepEqual(requestFields.filter(field=>field.name==='type')[0].options.map(option=>option.value),['','contact','partnership','training','quote']);
assert.ok(requestFields.some(field=>field.name==='consent'&&field.required),'Contact form must require consent');
const partnerForm=getSection('partenaires','form');
assert.deepEqual(partnerForm.fields.map(field=>field.name),['name','email','organization','message','consent']);
assert.equal(maquettePages.partenaires.hero.ctas[0].to,'#sec-form','Partner call to action must target its form');
assert.match(html,/SITE\.partners=SITE\.partners\.filter\(p=>p\.status==="confirmed"\)/u,'Partner map must hide unconfirmed placeholder entries');
const resourceForm=getSection('ressources','notif');
assert.deepEqual(resourceForm.fields.map(field=>field.name),['email','consent']);
assert.match(JSON.stringify(resourceForm.lead),/not automatically subscribe|ne vous inscrit pas automatiquement/u);
const imageReferences=new Set([...html.matchAll(/assets\/(?:maquette|stitch)\/[a-z0-9-]+\.(?:webp|png)/gu)].map(match=>match[0]));
for(const image of imageReferences)await access(new URL(image,root));
assert.ok(!app.includes('fetch('),'This preview must not send requests');
assert.ok(!homepageScript.includes('fetch('),'The homepage preview must not send requests');
assert.ok(sitePagesScript.includes("fetch('/api/contact'"),'Contact form must submit to the server API');
for(const name of ['AGROPULSE_RECIPIENT_EMAIL','EMAIL_FROM','RESEND_API_KEY'])assert.ok(contactHandler.includes(name),`Email handler must read ${name} from the server environment`);
for(const [route,slug] of [
 ['/apropos.html','a-propos'],['/expertises.html','expertises'],
 ['/formation-talents.html','pole-1'],['/systemes-donnees.html','pole-2'],
 ['/ia-analytics.html','pole-3'],['/climat-economie-verte.html','pole-4'],
 ['/incubation-agritech.html','pole-5'],['/conseil-mecanisation.html','pole-6'],
 ['/programmes.html','fellowship'],['/fellowship.html','fellowship'],
 ['/fellowship-concept.html','fellowship'],['/yida-cashew.html','fellowship'],
 ['/agir-ia.html','agir-ia'],['/contact.html','contact'],
 ['/partenaires.html','partenaires'],['/ressources.html','ressources'],
])assert.ok(server.includes(`['${route}', '${slug}']`),`Legacy route ${route} must redirect to the current ${slug} section`);
assert.match(html, /\/api\/contact/u,'Maquette forms must use the email API');
assert.ok(server.includes("requestUrl.pathname === '/api/home-content'"),'The existing Node server must expose the homepage content endpoint');
assert.ok(homeContentHandler.includes("endpoint.searchParams.set('locale', locale)"),'CMS content must be selected by the requested locale');
assert.ok(homeContentHandler.includes("endpoint.searchParams.set('populate', '*')"),'CMS reads must use the policy-limited page representation');
for(const secret of ['RESEND_API_KEY','AGROPULSE_RECIPIENT_EMAIL','AGROPULSE_CMS_READ_TOKEN'])assert.ok(!html.includes(secret),`No server setting ${secret} may appear in the public page`);
assert.ok(!sitePagesScript.includes('RESEND_API_KEY'),'No mail service key may appear in public scripts');
assert.ok(!sitePagesScript.includes('AGROPULSE_RECIPIENT_EMAIL'),'No recipient address may appear in public scripts');
const environmentExample=await readFile(new URL('../.env.example',import.meta.url),'utf8');
for(const name of ['AGROPULSE_RECIPIENT_EMAIL','EMAIL_FROM','RESEND_API_KEY','AGROPULSE_CMS_URL','AGROPULSE_CMS_HOME_DOCUMENT_ID','AGROPULSE_CMS_READ_TOKEN'])assert.match(environmentExample,new RegExp(`^${name}=$`,'m'),`.env.example must contain an empty ${name}`);
console.log(`OK — maquette design retained, eight approved expertise areas, API-backed forms and ${imageReferences.size} image assets.`);
for(const file of ['apropos.html','expertises.html','yida-cashew.html','agir-ia.html','contact.html'])await access(new URL(file,root));
const deploymentPages=await Promise.all(['apropos.html','expertises.html','yida-cashew.html','agir-ia.html','contact.html'].map(file=>readFile(new URL(file,root),'utf8')));
assert.ok(deploymentPages[1].includes('pole-8'),'Expertise page must expose all eight approved poles');
assert.ok(deploymentPages[2].includes('Candidatures fermées'),'YIDA-Cashew applications must remain closed');
assert.ok(deploymentPages[3].includes('distinct'),'AGIR-IA must remain separate from YIDA-Cashew');
assert.ok(deploymentPages[4].includes('request-form'),'Contact page must provide the request form');
assert.ok(deploymentPages[4].includes('partnership'),'Contact page must support partnership enquiries');
assert.ok(deploymentPages[4].includes('training'),'Contact page must support training enquiries');
assert.ok(deploymentPages[4].includes('quote'),'Contact page must support quote requests');
console.log('OK — About, expertise, YIDA-Cashew, AGIR-IA and API-backed contact pages are generated.');
const pages = (await readdir(root)).filter(file=>file.endsWith('.html'));
for(const file of pages){
 if(file==='index.html')continue;
 const page=await readFile(new URL(file,root),'utf8');
 const pageIds=[...page.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);
 assert.equal(pageIds.length,new Set(pageIds).size,`${file}: duplicate IDs`);
 assert.equal([...page.matchAll(/<h1\b/g)].length,1,`${file}: exactly one H1`);
 for(const [,asset] of page.matchAll(/(?:src|href)="([^"#]+)"/g)){
  if(asset.includes(':'))continue;
  const [path,hash]=asset.split('#');
  const target=new URL(path.split('?')[0],root);
  await access(target);
  if(hash){const text=await readFile(target,'utf8');assert.ok(text.includes(`id="${hash}"`),`${file}: broken link ${asset}`);}
 }
 for(const [,id] of page.matchAll(/href="#([^"]+)"/g))assert.ok(pageIds.includes(id),`${file}: broken anchor #${id}`);
 if(file!=='index.html')for(const [,key] of page.matchAll(/data-i18n(?:-html|-placeholder)?="([^"]+)"/g))for(const lang of ['fr','en'])assert.ok(copy[lang][key],`${file}: missing ${lang} ${key}`);
 for(const img of page.matchAll(/<img\b[^>]*>/g))assert.match(img[0],/\balt="[^"]*"/,`${file}: image without alt`);
}
const visualCSS=await readFile(new URL('content-media.css',root),'utf8');
for(const [,asset] of visualCSS.matchAll(/url\('([^']+)'\)/g))await access(new URL(asset,root));
assert.match(await readFile(new URL('homepage.css',root),'utf8'),/prefers-reduced-motion/);
console.log(`OK — ${pages.length} pages: H1, translations, internal links, anchors, image alternatives and CSS assets.`);

assert.match(html, /data-en="Initiatives" type="button">Initiatives<\/button>/u, 'The navigation must group programmes under Initiatives');
assert.doesNotMatch(html, /Yidacashew|YIDA-CASHEW|Yida-Cashew/u, 'The programme name must keep its exact spelling');
assert.ok(maquettePages.fellowship.sections.some(section => section.id === 'objectifs'), 'The programme objectives must be on the page');
assert.ok(maquettePages.fellowship.sections.some(section => section.id === 'publics'), 'Programme audiences must be on the page');
assert.ok(maquettePages.fellowship.sections.every(section => section.type !== 'downloads'), 'YIDA-Cashew must be an information page');
assert.ok(!html.includes('revue-yida-cashew-n01.pdf'), 'The review must not be offered as a public download');
assert.deepEqual(JSON.parse(await readFile(new URL('documents/catalog.json',root),'utf8')), [], 'No public document is currently approved');
for (let index=1; index<=8; index++) {
 const page=maquettePages['pole-'+index];
 assert.ok(page?.title?.fr&&page?.title?.en, 'Every expertise area must have both languages');
 assert.deepEqual(page.title, page.hero.title, 'Expertise page titles must agree');
}
console.log('OK — eight distinct areas, Initiatives, exact YIDA-Cashew spelling and programme content on page.');

// Programme facts must not turn a future YIDA target into an AGIR-IA achievement.
for (const locale of ['fr','en']) {
 const yida=JSON.stringify(maquettePages.fellowship);
 assert.match(yida,/2030/u);
 assert.match(maquettePages.fellowship.hero.notice[locale],locale==='fr'?/fermées/u:/closed/u);
 const agir=maquettePages['agir-ia'];
 const summary=agir.sections.find(section=>section.id==='crowd');
 assert.match(summary.title[locale],/20/u);
 assert.match(summary.kicker[locale],locale==='fr'?/26 septembre 2026/u:/26 September 2026/u);
 assert.match(summary.kicker[locale],/Côte d’Ivoire/u);
 const content=JSON.stringify(agir);
 assert.doesNotMatch(content,/Date à valider|Date to be confirmed|nombre de participantes et les sessions restent à confirmer/u);
 assert.doesNotMatch(content,/micro-crédit|micro-loan|Record your fields with GPS/u,'Unconfirmed training modules must not survive from the mockup');
}
console.log('OK — AGIR-IA completed session and closed YIDA applications remain distinct from future targets.');

const currentYida=maquettePages.fellowship.sections.find(section=>section.id==='anacarde');
assert.match(currentYida.title.fr,/1 000 personnes/u,'The owner-updated YIDA training target must be visible');
assert.match(currentYida.title.en,/1,000 people/u);
assert.match(currentYida.title.fr,/2030/u);
assert.match(currentYida.lead[0].fr,/projection initiale de 500\+/u,'The review must not be falsely attributed the updated figure');
console.log('OK — updated YIDA target: 1,000 people by 2030, distinct from the historical projection.');
