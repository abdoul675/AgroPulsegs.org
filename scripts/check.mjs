import assert from 'node:assert/strict';
import { readFile, access, readdir } from 'node:fs/promises';
import vm from 'node:vm';
const root=new URL('../public/',import.meta.url);
const html=await readFile(new URL('index.html',root),'utf8');
const app=await readFile(new URL('app.js',root),'utf8');
const homepageScript=await readFile(new URL('homepage.js',root),'utf8');
const sitePagesScript=await readFile(new URL('site-pages.js',root),'utf8');
const data=app.slice(0,app.indexOf('let language ='));
const {copy,services}=vm.runInNewContext(`${data}\n({copy,services})`);
const homepageCopyMatch=html.match(/<script id="homepage-copy" type="application\/json">([\s\S]*?)<\/script>/);
assert.ok(homepageCopyMatch,'Homepage translations must be embedded as JSON');
const homepageCopy=JSON.parse(homepageCopyMatch[1]);
assert.deepEqual(Object.keys(homepageCopy.fr).sort(),Object.keys(homepageCopy.en).sort(),'Homepage translation keys must match');
assert.deepEqual(Object.keys(copy.fr).sort(),Object.keys(copy.en).sort(),'Translation keys must match');
for(const lang of ['fr','en']){
 for(const [,key] of html.matchAll(/data-i18n="([^"]+)"/g))assert.ok(homepageCopy[lang][key],`Missing homepage ${lang}: ${key}`);
 for(const [,key] of html.matchAll(/data-i18n-aria-label="([^"]+)"/g))assert.ok(homepageCopy[lang][key],`Missing homepage aria ${lang}: ${key}`);
 for(const [,key] of html.matchAll(/data-i18n-alt="([^"]+)"/g))assert.ok(homepageCopy[lang][key],`Missing homepage image alternative ${lang}: ${key}`);
 assert.equal(services[lang].length,6);
}
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);
assert.equal(ids.length,new Set(ids).size,'Duplicate IDs');
for(const [,id]of html.matchAll(/href="#([^"]+)"/g))assert.ok(ids.includes(id),`Broken anchor: ${id}`);
for(const [,asset]of html.matchAll(/(?:src|href)="([^"#]+)"/g))if(!asset.includes(':'))await access(new URL(asset,root));
assert.ok(!app.includes('fetch('),'This preview must not send requests');
assert.ok(!homepageScript.includes('fetch('),'The homepage preview must not send requests');
console.log('OK — French/English homepage content, six services, anchors and assets. No form transmission.');
for(const file of ['apropos.html','expertises.html','yida-cashew.html','agir-ia.html','contact.html'])await access(new URL(file,root));
const deploymentPages=await Promise.all(['apropos.html','expertises.html','yida-cashew.html','agir-ia.html','contact.html'].map(file=>readFile(new URL(file,root),'utf8')));
assert.ok(deploymentPages[1].includes('pole-6'),'Expertise page must expose all six approved poles');
assert.ok(deploymentPages[2].includes('Candidatures fermées'),'YIDA-Cashew applications must remain closed');
assert.ok(deploymentPages[3].includes('distinct'),'AGIR-IA must remain separate from YIDA-Cashew');
assert.ok(deploymentPages[4].includes('request-form'),'Contact page must provide a local request draft');
assert.ok(!sitePagesScript.includes('fetch('),'Contact preview must not transmit requests');
console.log('OK — About, expertise, YIDA-Cashew, AGIR-IA and local-draft contact pages are generated.');
const pages = (await readdir(root)).filter(file=>file.endsWith('.html'));
for(const file of pages){
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
 const pageCopy=file==='index.html'?homepageCopy:copy;
 for(const [,key] of page.matchAll(/data-i18n(?:-html|-placeholder)?="([^"]+)"/g))for(const lang of ['fr','en'])assert.ok(pageCopy[lang][key],`${file}: missing ${lang} ${key}`);
 for(const img of page.matchAll(/<img\b[^>]*>/g))assert.match(img[0],/\balt="[^"]*"/,`${file}: image without alt`);
}
const visualCSS=await readFile(new URL('content-media.css',root),'utf8');
for(const [,asset] of visualCSS.matchAll(/url\('([^']+)'\)/g))await access(new URL(asset,root));
assert.match(await readFile(new URL('homepage.css',root),'utf8'),/prefers-reduced-motion/);
console.log(`OK — ${pages.length} pages: H1, translations, internal links, anchors, image alternatives and CSS assets.`);
