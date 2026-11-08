import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';import path from 'node:path';import net from 'node:net';
import {randomBytes} from 'node:crypto';import {fork} from 'node:child_process';import {fileURLToPath} from 'node:url';import {once} from 'node:events';
import EmbeddedPostgres from 'embedded-postgres';
const toolsRoot=path.dirname(fileURLToPath(import.meta.url)),pilotRoot=path.dirname(toolsRoot),appDir=path.join(pilotRoot,'cms');
await fs.mkdir(path.join(pilotRoot,'.local'),{recursive:true,mode:0o700});
const state=await fs.mkdtemp(path.join(pilotRoot,'.local','isolated-security-'));
const report={completed:false,environment:'Fresh isolated PostgreSQL and actual CMS application; no user database or pilot credentials reused',checks:[],limits:['Not a production hosting verification','Not a migration of the user CMS database','Dependency advisories remain unless separately patched']};
const check=(name,actual,expected)=>{assert.deepEqual(actual,expected,name);report.checks.push({name,result:'PASS'});console.log('PASS '+name)};
const secret=()=>randomBytes(32).toString('hex');
async function freePort(){const server=net.createServer();server.listen(0,'127.0.0.1');await once(server,'listening');const port=server.address().port;await new Promise(resolve=>server.close(resolve));return port}
const dbPort=await freePort(),cmsPort=await freePort(),dbPassword=secret(),passwords=Object.fromEntries(['admin','editor','publisher'].map(k=>[k,randomBytes(24).toString('hex')+'Aa!9']));
const secrets=[dbPassword,...Object.values(passwords)];const redact=value=>{let text=String(value);for(const item of secrets)text=text.replaceAll(item,'[redacted]');return text};
const database=new EmbeddedPostgres({databaseDir:path.join(state,'postgres'),user:'agropulse_security',password:dbPassword,port:dbPort,persistent:true,authMethod:'scram-sha-256',createPostgresUser:false,postgresFlags:['-h','127.0.0.1'],onLog:()=>{},onError:message=>void fs.appendFile(path.join(state,'database.log'),redact(message)+'\n')});
let child,browser,started=false;
const uiPages={};
const base='http://127.0.0.1:'+cmsPort;
async function call(route,{token,method='GET',body,origin}={}){const response=await fetch(base+route,{method,headers:{...(token?{Authorization:'Bearer '+token}:{}),...(body?{'Content-Type':'application/json'}:{}),...(origin?{Origin:origin}:{})},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(15000)});return{status:response.status,headers:response.headers,data:await response.json().catch(()=>({}))}}
const cm=(type,id)=>'/content-manager/collection-types/api::'+type+'.'+type+(id?'/'+id:'');
try{
 await database.initialise();await database.start();started=true;await database.createDatabase('agropulse_security_isolated');console.log('Isolated database ready; user database untouched.');
 const env={...process.env,HOST:'127.0.0.1',PORT:String(cmsPort),DATABASE_URL:'',DATABASE_CLIENT:'postgres',DATABASE_HOST:'127.0.0.1',DATABASE_PORT:String(dbPort),DATABASE_NAME:'agropulse_security_isolated',DATABASE_USERNAME:'agropulse_security',DATABASE_PASSWORD:dbPassword,DATABASE_SSL:'false',AGROPULSE_PILOT_MODE:'false',STRAPI_TELEMETRY_DISABLED:'true',STRAPI_DISABLE_UPDATE_NOTIFICATION:'true',PUBLIC_CMS_URL:base,VITE_AGROPULSE_SITE_URL:'http://127.0.0.1:4191',AGROPULSE_SECURITY_APP_DIR:appDir,AGROPULSE_SECURITY_PASSWORDS:JSON.stringify(passwords),APP_KEYS:[secret(),secret()].join(','),ADMIN_JWT_SECRET:secret(),API_TOKEN_SALT:secret(),TRANSFER_TOKEN_SALT:secret(),ENCRYPTION_KEY:secret(),JWT_SECRET:secret(),PREVIEW_SECRET:secret(),AGROPULSE_RECIPIENT_EMAIL:'',RESEND_API_KEY:'',EMAIL_FROM:''};
 for(const key of ['APP_KEYS','ADMIN_JWT_SECRET','API_TOKEN_SALT','TRANSFER_TOKEN_SALT','ENCRYPTION_KEY','JWT_SECRET','PREVIEW_SECRET'])secrets.push(env[key]);
 child=fork(path.join(toolsRoot,'cms-isolated-security-worker.cjs'),[],{cwd:appDir,env,stdio:['ignore','pipe','pipe','ipc'],windowsHide:true});
 for(const stream of [child.stdout,child.stderr])stream.on('data',chunk=>void fs.appendFile(path.join(state,'cms.log'),redact(chunk)));
 const ready=await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Isolated CMS startup exceeded 150 seconds')),150000);child.on('message',message=>{if(message?.type==='ready'){clearTimeout(timer);resolve(message)}else if(message?.type==='failed'){clearTimeout(timer);reject(Error(redact(message.error)))}});child.once('exit',code=>{clearTimeout(timer);reject(Error('Isolated CMS exited before readiness: '+code))});child.once('error',reject)});
 secrets.push(ready.readToken);check('FR and EN configured',ready.locales.sort(),['en','fr']);
 const {chromium}=createRequire(import.meta.url)(process.env.AGROPULSE_PLAYWRIGHT_MODULE||'playwright');
 browser=await chromium.launch({headless:true,...(process.platform==='win32'?{channel:'msedge'}:{})});
 const tokens={};for(const role of ['admin','editor','publisher']){
  let login;
  if(role==='admin')login=await call('/admin/login',{method:'POST',body:{email:role+'@security.agropulse.test',password:passwords[role]}});
  else{
   const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});const page=await context.newPage();uiPages[role]=page;
   await page.goto(base+'/admin/auth/login');await page.locator('input[name=email]').fill(role+'@security.agropulse.test');await page.locator('input[name=password]').fill(passwords[role]);
   const response=page.waitForResponse(r=>r.url().endsWith('/admin/login')&&r.request().method()==='POST');await page.locator('button[type=submit]').click();const result=await response;
   login={status:result.status(),data:await result.json()};await page.waitForURL(url=>!url.pathname.includes('/auth/login'));
  }
  check('Native login '+role,login.status,200);tokens[role]=login.data.data.token;secrets.push(tokens[role]);
 }
 check('Anonymous content-manager denied',(await call(cm('page'))).status,401);
 check('Anonymous content API denied',(await call('/api/pages')).status,403);
 check('Read token cannot write',[401,403,405].includes((await call('/api/pages',{method:'POST',token:ready.readToken,body:{data:{title:'forbidden'}}})).status),true);
 const created=await call(cm('page'),{method:'POST',token:tokens.editor,body:{locale:'fr',key:'home',title:'Isolated draft'}});check('Editor may create draft',created.status,201);const id=created.data.data.documentId;assert.ok(id);
 check('Editor cannot publish',(await call(cm('page',id)+'/actions/publish',{method:'POST',token:tokens.editor,body:{locale:'fr'}})).status,403);
 check('Publisher cannot publish incomplete page',(await call(cm('page',id)+'/actions/publish',{method:'POST',token:tokens.publisher,body:{locale:'fr'}})).status,400);
 for(const locale of ['fr','en']){
  const title='Published security fixture '+locale;
  const update=await call(cm('page',id),{method:'PUT',token:tokens.editor,body:{locale,title,slug:'security-home-'+locale,summary:'Fictional security fixture only',seo:{title,description:'Isolated fictional security content'},sections:[{__component:'content.hero',title,intro:'Fictional introduction'},{__component:'content.rich-text',heading:'Fictional body',body:[{type:'paragraph',children:[{type:'text',text:'Security fixture only'}]}]},{__component:'content.cta',title:'Contact',label:'Contact',path:'/'+locale+'/contact'}]}});check('Editor saves complete '+locale,update.status,200);
  check('Publisher publishes '+locale,(await call(cm('page',id)+'/actions/publish',{method:'POST',token:tokens.publisher,body:{locale}})).status,200);
  const read=await call('/api/pages/'+id+'?locale='+locale,{token:ready.readToken});check('Published read '+locale,read.status,200);check('Correct published title '+locale,read.data.data.title,title);
  check('Draft update saved '+locale,(await call(cm('page',id),{method:'PUT',token:tokens.editor,body:{locale,title:'PRIVATE UNPUBLISHED '+locale}})).status,200);
  check('Draft endpoint refused '+locale,(await call('/api/pages/'+id+'?locale='+locale+'&status=draft',{token:ready.readToken})).status,403);
  check('Published stays unchanged '+locale,(await call('/api/pages/'+id+'?locale='+locale,{token:ready.readToken})).data.data.title,title);
 }
 const campaign=await call(cm('campaign'),{method:'POST',token:tokens.editor,body:{key:'isolated-closed-campaign',notice:{fr:'Fermée',en:'Closed'}}});check('Editor creates closed campaign draft',campaign.status,201);const campaignId=campaign.data.data.documentId;
 for(const body of [{state:'open'},{opensAt:'2030-01-01T00:00:00Z'}])check('Editor cannot change '+Object.keys(body)[0],(await call(cm('campaign',campaignId),{method:'PUT',token:tokens.editor,body})).status,403);
 const partner=await call(cm('partner'),{method:'POST',token:tokens.editor,body:{key:'isolated-partner',locale:'fr',name:'Fictional organisation'}});check('Editor creates unconfirmed partner',partner.status,201);
 check('Editor cannot confirm partner',(await call(cm('partner',partner.data.data.documentId),{method:'PUT',token:tokens.editor,body:{locale:'fr',confirmationStatus:'confirmed'}})).status,403);
 check('Media import denied to admin',(await call('/upload',{method:'POST',token:tokens.admin,body:{}})).status,403);
 check('Anonymous media import denied',(await call('/api/upload',{method:'POST',body:{}})).status,403);
 for(const route of ['/upload','/api/upload']){const response=await fetch(base+route,{method:'POST',headers:{'content-type':'application/json'},body:'{invalid-json',signal:AbortSignal.timeout(10000)});check('Closed route rejects before parsing '+route,response.status,403);}
 const trusted=await call('/admin/init',{origin:'http://127.0.0.1:4191'});check('Configured preview origin allowed',trusted.headers.get('access-control-allow-origin'),'http://127.0.0.1:4191');
 const untrusted=await call('/admin/init',{origin:'https://untrusted.example'});check('Untrusted origin not granted CORS',untrusted.headers.get('access-control-allow-origin'),null);
 check('Preview endpoint rejects missing secret',(await call('/api/pilot-preview/not-a-real-document?locale=fr')).status,401);
 for(const role of ['editor','publisher']){
  const page=uiPages[role];await page.goto(base+'/admin/content-manager/collection-types/api::page.page/'+id+'?plugins[i18n][locale]=fr');await page.locator('input[name=title]').waitFor();
  const publish=page.getByRole('button',{name:/^Publier$|^Publish$/});
  if(role==='editor'){const permitted=await publish.count()?await publish.first().isEnabled():false;check('Editor UI cannot publish',permitted,false);}
  else{await publish.first().waitFor();check('Publisher UI can publish',await publish.first().isEnabled(),true);}
 }
 report.completed=true;
}catch(error){report.error=redact(error.message);process.exitCode=1;console.error(report.error)}finally{
 if(browser)await browser.close();
 if(child&&child.exitCode===null){const exited=once(child,'exit');child.send({type:'stop'});const timer=setTimeout(()=>child.kill(),15000);await exited;clearTimeout(timer)}
 if(started)await database.stop();
 const local=path.resolve(pilotRoot,'.local'),databaseDirectory=path.resolve(state,'postgres');
 if(path.dirname(path.resolve(state))!==local||!path.basename(state).startsWith('isolated-security-')||path.dirname(databaseDirectory)!==path.resolve(state))throw Error('Refusing cleanup outside the newly created isolated cluster');
 await fs.rm(databaseDirectory,{recursive:true,force:true});
 await fs.writeFile(path.join(state,'report.json'),JSON.stringify(report,null,2));
 await fs.writeFile(path.join(pilotRoot,'.local','latest-isolated-security.json'),JSON.stringify({directory:state,completed:report.completed,checks:report.checks.length}));
 console.log(JSON.stringify({completed:report.completed,checks:report.checks.length,isolatedServicesStopped:true}));
}
