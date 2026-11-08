import {mkdtemp,mkdir,copyFile,writeFile,symlink,rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import net from 'node:net';
import {fileURLToPath} from 'node:url';
import test from 'node:test';
const cwd=fileURLToPath(new URL('../',import.meta.url));
async function withSite(run,siteDirectory=cwd){
 const child=spawn(process.execPath,['scripts/serve.mjs'],{cwd:siteDirectory,env:{...process.env,HOST:'127.0.0.1',PORT:'0',AGROPULSE_CMS_URL:'',AGROPULSE_CMS_READ_TOKEN:'',AGROPULSE_CMS_HOME_DOCUMENT_ID:'',AGROPULSE_CMS_ENABLE_PAGES:'false',AGROPULSE_RECIPIENT_EMAIL:'',EMAIL_FROM:'',RESEND_API_KEY:''},stdio:['ignore','pipe','pipe'],windowsHide:true});
 let errors='';child.stderr.on('data',chunk=>errors+=chunk);
 try{
  const port=await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Local test site did not start')),10000);child.once('error',reject);child.stdout.on('data',chunk=>{const match=String(chunk).match(/127\.0\.0\.1:(\d+)/);if(match){clearTimeout(timer);resolve(Number(match[1]));}});});
  await run({port,base:'http://127.0.0.1:'+port,child});assert.equal(errors,'');
 }finally{if(child.exitCode===null){const exited=once(child,'exit');child.kill();await exited;}}
}
async function rawGet(port,target){
 return new Promise((resolve,reject)=>{let response='';const socket=net.createConnection({host:'127.0.0.1',port},()=>socket.write('GET '+target+' HTTP/1.1\r\nHost: localhost\r\nConnection: close\r\n\r\n'));socket.setEncoding('utf8');socket.on('data',chunk=>response+=chunk);socket.on('error',reject);socket.on('close',()=>resolve(response));socket.setTimeout(5000,()=>socket.destroy(Error('Local request timed out')));});
}
test('malformed HTTP request targets return 400 without terminating the site',async()=>withSite(async({port,base,child})=>{
 for(const target of ['http://[','//[']){const response=await rawGet(port,target);assert.match(response,/^HTTP\/1\.1 400/u);assert.ok(!response.includes('TypeError'));assert.equal((await fetch(base+'/healthz')).status,200);assert.equal(child.exitCode,null);}
}));
test('file traversal, source files and malformed encodings do not expose private files',async()=>withSite(async({port,base})=>{
 for(const target of ['/..%5c.env','/%2e%2e%5cpilot%5c.local%5cruntime.json','/scripts/serve.mjs','/.git/config','/docs/ressources/source.pdf','/%E0%A4%A']){const response=await rawGet(port,target);assert.match(response,/^HTTP\/1\.1 (?:403|404)/u);assert.ok(!response.includes('APP_KEYS'));assert.ok(!response.includes('adminPassword'));}
 assert.equal((await fetch(base+'/healthz')).status,200);
}));
test('frame policy allows the configured CMS origin and blocks unrelated parents',async()=>withSite(async({base})=>{
 const response=await fetch(base+'/');assert.equal(response.headers.get('x-content-type-options'),'nosniff');assert.equal(response.headers.get('referrer-policy'),'strict-origin-when-cross-origin');const policy=response.headers.get('content-security-policy');assert.match(policy,/frame-ancestors 'self'/u);assert.ok(!policy.includes('*'));assert.ok(policy.includes("object-src 'none'"));assert.ok(!response.headers.has('x-frame-options'));
}));

test('public links cannot escape the real static root, while internal asset links still work',async()=>{
 const parent=path.resolve(os.tmpdir());
 const fixture=await mkdtemp(path.join(parent,'agropulse-static-security-'));
 // Only a newly created child of the system temp directory may be cleaned up.
 assert.equal(path.dirname(path.resolve(fixture)),parent);
 try{
  for(const directory of ['scripts','public','public/assets','public-neighbour'])await mkdir(path.join(fixture,directory));
  for(const name of ['serve.mjs','contact-handler.mjs','home-content.mjs','page-content.mjs'])await copyFile(path.join(cwd,'scripts',name),path.join(fixture,'scripts',name));
  await copyFile(path.join(cwd,'public/style-policy.mjs'),path.join(fixture,'public/style-policy.mjs'));
  await writeFile(path.join(fixture,'public/index.html'),'<html><head></head><body>Isolated security fixture</body></html>');
  await writeFile(path.join(fixture,'public-neighbour/proof.txt'),'FICTITIOUS-PRIVATE-MARKER');
  await writeFile(path.join(fixture,'public/assets/allowed.txt'),'PUBLIC-ASSET');
  await symlink(path.join(fixture,'public-neighbour'),path.join(fixture,'public/private-hop'),process.platform==='win32'?'junction':'dir');
  await symlink(path.join(fixture,'public/assets'),path.join(fixture,'public/asset-alias'),process.platform==='win32'?'junction':'dir');
  await withSite(async({base})=>{
   for(const name of ['/private-hop/proof.txt','/private-hop/proof.txt?download=1']){
    const response=await fetch(base+name);assert.equal(response.status,403);assert.ok(!(await response.text()).includes('FICTITIOUS-PRIVATE-MARKER'));
   }
   for(const name of ['/assets/allowed.txt','/asset-alias/allowed.txt']){const response=await fetch(base+name);assert.equal(response.status,200);assert.equal(await response.text(),'PUBLIC-ASSET');}
   assert.equal((await fetch(base+'/healthz')).status,200);
  },fixture);
 }finally{
  if(path.dirname(path.resolve(fixture))!==parent)throw Error('Refusing cleanup outside the isolated fixture parent');
  await rm(fixture,{recursive:true,force:true});
 }
});
