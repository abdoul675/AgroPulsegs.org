import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import net from 'node:net';
import {fileURLToPath} from 'node:url';
import test from 'node:test';
const cwd=fileURLToPath(new URL('../',import.meta.url));
async function withSite(run){
 const child=spawn(process.execPath,['scripts/serve.mjs'],{cwd,env:{...process.env,HOST:'127.0.0.1',PORT:'0',AGROPULSE_CMS_URL:'',AGROPULSE_CMS_READ_TOKEN:'',AGROPULSE_CMS_HOME_DOCUMENT_ID:'',AGROPULSE_CMS_ENABLE_PAGES:'false',AGROPULSE_RECIPIENT_EMAIL:'',EMAIL_FROM:'',RESEND_API_KEY:''},stdio:['ignore','pipe','pipe'],windowsHide:true});
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
