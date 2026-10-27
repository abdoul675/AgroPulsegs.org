import assert from 'node:assert/strict';
import { readFile, access, readdir } from 'node:fs/promises';
import vm from 'node:vm';
const root=new URL('../public/',import.meta.url);
const html=await readFile(new URL('index.html',root),'utf8');
const app=await readFile(new URL('app.js',root),'utf8');
const data=app.slice(0,app.indexOf('let language ='));
const {copy,services}=vm.runInNewContext(`${data}\n({copy,services})`);
assert.deepEqual(Object.keys(copy.fr).sort(),Object.keys(copy.en).sort(),'Translation keys must match');
for(const lang of ['fr','en']){
 for(const [,key] of html.matchAll(/data-i18n(?:-html|-placeholder)?="([^"]+)"/g))assert.ok(copy[lang][key],`Missing ${lang}: ${key}`);
 assert.equal(services[lang].length,6);
}
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);
assert.equal(ids.length,new Set(ids).size,'Duplicate IDs');
for(const [,id]of html.matchAll(/href="#([^"]+)"/g))assert.ok(ids.includes(id),`Broken anchor: ${id}`);
for(const [,asset]of html.matchAll(/(?:src|href)="([^"#]+)"/g))if(!asset.includes(':'))await access(new URL(asset,root));
assert.ok(!app.includes('fetch('),'This preview must not send requests');
console.log('OK — French/English content, six services, anchors and assets. No form transmission.');
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
 for(const [,key] of page.matchAll(/data-i18n(?:-html|-placeholder)?="([^"]+)"/g))for(const lang of ['fr','en'])assert.ok(copy[lang][key],`${file}: missing ${lang} ${key}`);
 for(const img of page.matchAll(/<img\b[^>]*>/g))assert.match(img[0],/\balt="[^"]*"/,`${file}: image without alt`);
}
const visualCSS=await readFile(new URL('content-media.css',root),'utf8');
for(const [,asset] of visualCSS.matchAll(/url\('([^']+)'\)/g))await access(new URL(asset,root));
assert.match(await readFile(new URL('styles.css',root),'utf8'),/prefers-reduced-motion/);
console.log(`OK — ${pages.length} pages: H1, translations, internal links, anchors, image alternatives and CSS assets.`);
