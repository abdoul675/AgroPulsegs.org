import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
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
