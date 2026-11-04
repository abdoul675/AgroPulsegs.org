import assert from 'node:assert/strict';
import test from 'node:test';
import {createServer} from 'node:http';
import {once} from 'node:events';
import {presentation,readPublishedPage,createPageContentHandler} from './page-content.mjs';
const env={AGROPULSE_CMS_ENABLE_PAGES:'true',AGROPULSE_CMS_URL:'http://127.0.0.1:1338',AGROPULSE_CMS_READ_TOKEN:'test-private-token'};
test('does not contact the CMS until the published-page bridge is explicitly enabled',async()=>{
 const result=await readPublishedPage({page:'pole-8',locale:'fr',env:{},fetchImpl:()=>assert.fail('Unexpected CMS read')});
 assert.deepEqual(result,{http:200,body:{status:'reference'}});
});
test('reads only the published identity and locale for the eighth area',async()=>{
 let requested;
 const result=await readPublishedPage({page:'pole-8',locale:'en',env,fetchImpl:async(url,options)=>{
  requested=new URL(url);assert.equal(options.headers.Authorization,'Bearer test-private-token');
  return Response.json({data:[{code:'08',locale:'en',title:'Published eighth area',summary:'Public description',siteText:{sections:{faire:{title:'Services',groups:[{title:'First card',text:'Safe text'}]}}},siteLayout:{sections:['cta','faire'],cards:{faire:[1,0]}},privateNotes:'not public',secret:'not public'}]});
 }});
 assert.equal(requested.pathname,'/api/expertises');assert.equal(requested.searchParams.get('status'),'published');assert.equal(requested.searchParams.get('locale'),'en');assert.equal(requested.searchParams.get('filters[code][$eq]'),'08');assert.equal(requested.searchParams.has('populate'),false);
 assert.equal(result.body.status,'published');assert.deepEqual(result.body.layout.cards.faire,[1,0]);assert.equal(JSON.stringify(result).includes('not public'),false);assert.equal(JSON.stringify(result).includes('test-private-token'),false);
});
test('rejects unknown routes, unsafe configuration and mismatched published content',async()=>{
 assert.equal((await readPublishedPage({page:'../../admin',locale:'fr',env})).http,400);
 assert.equal((await readPublishedPage({page:'accueil',locale:'de',env})).http,400);
 assert.equal((await readPublishedPage({page:'accueil',locale:'fr',env:{...env,AGROPULSE_CMS_URL:'http://external.example'}})).http,503);
 for(const data of [[{key:'about',locale:'fr',title:'Wrong identity'}],[{key:'home',locale:'en',title:'Wrong locale'}],[{key:'home',locale:'fr'},{key:'home',locale:'fr'}]])assert.equal((await readPublishedPage({page:'accueil',locale:'fr',env,fetchImpl:async()=>Response.json({data})})).http,502);
});
test('hidden content and unavailable CMS do not expose upstream details',async()=>{
 assert.deepEqual((await readPublishedPage({page:'fellowship',locale:'fr',env,fetchImpl:async()=>Response.json({data:[]})})).body,{status:'reference'});
 assert.deepEqual((await readPublishedPage({page:'fellowship',locale:'fr',env,fetchImpl:async()=>new Response('private upstream error',{status:403})})).body,{status:'unavailable'});
});
test('normalises layout and returns copy only, never arbitrary HTML or media instructions',()=>{
 const value=presentation({title:'Page',siteText:{hero:{title:'Heading',intro:'Intro',html:'<script>private</script>'},sections:{faire:{title:'Services',script:'private',groups:[{title:'One',text:'Text',href:'javascript:private'}]}}},siteLayout:{sections:['faire','faire','../../'],cards:{faire:[1,0,1,-1,'bad']},css:'private'}});
 assert.deepEqual(value.layout,{sections:['faire'],cards:{faire:[1,0]}});assert.equal(JSON.stringify(value).includes('private'),false);
});
test('HTTP reads are uncached and unsupported methods are rejected',async()=>{
 const server=createServer(createPageContentHandler({env:{}}));server.listen(0,'127.0.0.1');await once(server,'listening');
 try{const url=`http://127.0.0.1:${server.address().port}/api/page-content?page=accueil&locale=fr`;const response=await fetch(url);assert.equal(response.status,200);assert.equal(response.headers.get('cache-control'),'no-store');assert.equal((await fetch(url,{method:'POST'})).status,405);}finally{await new Promise(resolve=>server.close(resolve));}
});
