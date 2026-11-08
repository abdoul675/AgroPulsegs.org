import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import path from 'node:path';
import {once} from 'node:events';
import test from 'node:test';
const require=createRequire(new URL('../cms/package.json',import.meta.url));
const Koa=require('koa');
const body=require('koa-body');
const session=require('koa-session');
const bodyTypes=require(path.join(path.dirname(require.resolve('koa-body')),'types.js'));

test('Zod in the installed body/session consumers validates trusted setup, not submitted request arrays',async()=>{
 const bodyParse=bodyTypes.KoaBodyMiddlewareOptionsSchema.parse,sessionParse=session.SessionOptions.parse;
 let bodyCalls=0,sessionCalls=0;
 bodyTypes.KoaBodyMiddlewareOptionsSchema.parse=function(...args){bodyCalls++;return bodyParse.apply(this,args);};
 session.SessionOptions.parse=function(...args){sessionCalls++;return sessionParse.apply(this,args);};
 const app=new Koa();const unexpected=[];app.on('error',error=>{if(![400,413].includes(error.status))unexpected.push(error.message);});app.keys=['isolated-test-key-not-used-by-any-cms'];
 // Use the actual application parser limits, not a separate guessed configuration.
 const config=require('../cms/config/middlewares.js').find(entry=>entry?.name==='strapi::body')?.config||{};
 app.use(body.koaBody(config));app.use(session.createSession({sameSite:'lax',httpOnly:true,signed:true},app));
 app.use(ctx=>{ctx.session.visits=(ctx.session.visits||0)+1;ctx.body={accepted:true,items:ctx.request.body?.items?.length||0};});
 assert.equal(bodyCalls,1);assert.equal(sessionCalls,1);
 const server=app.listen(0,'127.0.0.1');await once(server,'listening');const url='http://127.0.0.1:'+server.address().port;
 try{
  for(const items of [[1,2,3],Array.from({length:100},(_,i)=>({value:i}))]){
   const response=await fetch(url,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({items})});assert.equal(response.status,200);assert.equal((await response.json()).items,items.length);
  }
  assert.equal(bodyCalls,1,'Request arrays must not enter the Zod body-options schema');
  assert.equal(sessionCalls,1,'Request data must not enter the Zod session-options schema');
  const invalid=await fetch(url,{method:'POST',headers:{'content-type':'application/json'},body:'{bad-json'});assert.equal(invalid.status,400);
  const oversized=await fetch(url,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({text:'x'.repeat(1024*1024+1)})});assert.equal(oversized.status,413);
  assert.equal(bodyCalls,1);assert.equal(sessionCalls,1);assert.deepEqual(unexpected,[]);
 }finally{await new Promise(resolve=>server.close(resolve));bodyTypes.KoaBodyMiddlewareOptionsSchema.parse=bodyParse;session.SessionOptions.parse=sessionParse;}
});

test('closed media routes reject requests before parsing their body',async()=>{
 const middleware=require('../cms/config/middlewares.js');
 const deny=require('../cms/src/middlewares/media-import-closed.js')();
 const app=new Koa();let parses=0;
 app.on('error',()=>{});
 app.context.forbidden=function(){this.status=403;this.body={error:'media_closed'};};
 for(const entry of middleware){
  const name=typeof entry==='string'?entry:entry.name;
  if(name==='global::media-import-closed')app.use(deny);
  if(name==='strapi::body'){
   const parse=body.koaBody(entry?.config||{});
   app.use(async(ctx,next)=>{parses++;return parse(ctx,next);});
  }
 }
 app.use(ctx=>{ctx.body={ok:true};});
 const server=app.listen(0,'127.0.0.1');await once(server,'listening');const base='http://127.0.0.1:'+server.address().port;
 try{
  for(const route of ['/upload','/api/upload']){
   const response=await fetch(base+route,{method:'POST',headers:{'content-type':'application/json'},body:'{invalid-json'});
   assert.equal(response.status,403,'Disabled media route must reject before JSON parsing');
  }
  assert.equal(parses,0,'Disabled media routes must not reach body parsing');
  assert.equal((await fetch(base+'/ordinary',{method:'POST',headers:{'content-type':'application/json'},body:'{}'})).status,200);
  assert.equal(parses,1,'Normal routes still parse their body');
 }finally{await new Promise(resolve=>server.close(resolve));}
});

test('CMS binds to loopback by default while preserving explicit deployment configuration',()=>{
 const configure=require('../cms/config/server.js');
 const environment=values=>Object.assign((name,fallback)=>values[name]??fallback,{int:(name,fallback)=>Number(values[name]??fallback),array:name=>String(values[name]||'').split(','),bool:(name,fallback)=>values[name]===undefined?fallback:values[name]==='true'});
 assert.equal(configure({env:environment({})}).host,'127.0.0.1');
 assert.equal(configure({env:environment({HOST:'0.0.0.0'})}).host,'0.0.0.0');
});
