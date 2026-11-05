import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {pilotRoot,localRoot} from './runtime.mjs';
const {chromium}=createRequire(import.meta.url)(process.env.AGROPULSE_PLAYWRIGHT_MODULE||'playwright');
const project=path.dirname(pilotRoot);
const cms='http://127.0.0.1:1338',site='http://127.0.0.1:4188',uid='api::page.page';
const output=path.join(localRoot,'visual-editor-verification'),checks=[];
const check=(name,actual,expected)=>{assert.deepEqual(actual,expected,name);checks.push(name);console.log('PASS '+name);};
(async()=>{
 await fs.mkdir(output,{recursive:true});const runtime=JSON.parse(await fs.readFile(project+'/pilot/.local/runtime.json','utf8'));
 assert.equal(runtime.database.name,'agropulse_pilot');
 async function call(url,{token,method='GET',body}={}){const response=await fetch(cms+url,{method,headers:{...(token?{Authorization:'Bearer '+token}:{}),...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(15000)});return {status:response.status,data:await response.json().catch(()=>({}))};}
 const tokens={};
 for(const role of ['admin','publisher']){const result=await call('/admin/login',{method:'POST',body:{email:role+'@agropulse.test',password:runtime[role+'Password']}});check('Connexion locale '+role,result.status,200);tokens[role]=result.data.data.token;}
 const list=await call('/content-manager/collection-types/'+uid+'?locale=fr&pageSize=100',{token:tokens.publisher});
 check('Liste des pages disponible pour préparer l’essai',list.status,200);
 let document=(list.data.results||[]).find(entry=>entry.key==='resources');
 if(!document){
  const body={locale:'fr',key:'resources',title:'Ressources — test isolé du pilotage',slug:'resources-visual-editor-local-test',heroTitle:'Ressources — test isolé du pilotage',summary:'Données de test locales, sans lien avec une publication institutionnelle.',sections:[{__component:'content.hero',title:'Ressources — test isolé du pilotage',intro:'Données fictives locales.'},{__component:'content.rich-text',heading:'Essai isolé',body:[{type:'paragraph',children:[{type:'text',text:'Contenu fictif réservé aux vérifications locales.'}]}]}],seo:{title:'Essai isolé du pilotage',description:'Fiche fictive du pilote local ; aucune donnée institutionnelle.'}};
  const created=await call('/content-manager/collection-types/'+uid,{token:tokens.publisher,method:'POST',body});check('Création du brouillon de test',created.status,201);document=created.data.data;
 }
 const endpoint='/content-manager/collection-types/'+uid+'/'+document.documentId;
 const unpublish=()=>call(endpoint+'/actions/unpublish',{token:tokens.admin,method:'POST',body:{locale:'fr'}});
 await unpublish();
 await call(endpoint,{token:tokens.publisher,method:'PUT',body:{locale:'fr',siteLayout:{},mainContent:[{type:'paragraph',children:[{type:'text',text:'Contenu fictif réservé aux vérifications locales.'}]}]}});
 const readPage=async()=>{const r=await fetch(site+'/api/page-content?page=ressources&locale=fr');return {status:r.status,data:await r.json()};};
 check('Un brouillon seul ne fournit pas de contenu public',(await readPage()).data.status,'reference');
 let browser;
 try{
  browser=await chromium.launch({channel:'msedge',headless:true});const context=await browser.newContext({viewport:{width:1500,height:1000},reducedMotion:'reduce'});await context.route('**/*',route=>/fonts\.googleapis\.com|fonts\.gstatic\.com/.test(route.request().url())?route.abort():route.continue());const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(cms+'/admin/auth/login');await page.locator('input[name=email]').fill('editor@agropulse.test');await page.locator('input[name=password]').fill(runtime.editorPassword);const loginResponse=page.waitForResponse(response=>response.url().endsWith('/admin/login')&&response.request().method()==='POST');await page.getByRole('button',{name:/se connecter|login|log in|connexion/i}).click();const login=await loginResponse;check('Connexion locale editor',login.status(),200);tokens.editor=(await login.json()).data.token;await page.waitForURL(url=>!url.pathname.includes('/auth/login'));
  await page.getByRole('link',{name:/^(pilotage visuel|visual editor)$/i}).click();await page.locator('.agp-editor h1').waitFor();
  const selection=page.locator('.agp-toolbar select').first();await page.waitForFunction(id=>[...document.querySelectorAll('.agp-toolbar select option')].some(option=>option.value.endsWith(id)),document.documentId);await selection.selectOption(uid+':'+document.documentId);
  const frame=page.frameLocator('.agp-preview iframe');
  await frame.locator('#ap-editor-note').waitFor({state:'visible',timeout:20000}).catch(async error=>{console.log('PREVIEW_DIAGNOSTIC',JSON.stringify({errors,frames:page.frames().map(f=>f.url()),help:await page.locator('.agp-preview-help').allTextContents()}));await page.screenshot({path:path.join(output,'preview-connection-diagnostic.png'),fullPage:true});throw error;});await frame.locator('#sec-exemples > .ap-editor-tools').waitFor();
  check('L’aperçu privé communique avec le CMS',await frame.locator('#ap-editor-note').count(),1);
  await page.locator('.agp-fields input').fill('Titre du brouillon visuel isolé');
  await frame.locator('#app h1').filter({hasText:'Titre du brouillon visuel isolé'}).waitFor();
  check('Les textes se modifient immédiatement dans l’aperçu',await frame.locator('#app h1').innerText(),'Titre du brouillon visuel isolé');
  await frame.locator('body').evaluate(element=>{window.dragTrace=[];for(const type of ['dragstart','drop','dragend'])element.addEventListener(type,event=>window.dragTrace.push({type,target:event.target.tagName,text:event.target.textContent.slice(0,60)}),true)});
  await page.locator('.agp-appearance > summary').click();
  await page.getByLabel('Arrondi des cartes').selectOption('24');
  await page.getByLabel('Fond des cartes',{exact:true}).fill('#ffffdd');
  await page.locator('.agp-advanced > summary').click();
  await page.locator('.agp-css-input').fill('.agp-card { background-color: url(https://untrusted.example.invalid/x); }');
  await page.locator('.agp-css-error').waitFor();
  check('Un CSS externe désactive l’enregistrement',await page.locator('button.agp-primary').isDisabled(),true);
  await page.locator('.agp-css-input').fill('.agp-card { border-width: 2px; border-style: solid; border-color: #123456; }');
  await page.locator('.agp-css-error').waitFor({state:'hidden'});
  await page.waitForFunction(()=>{const frame=document.querySelector('.agp-preview iframe');return frame?.contentWindow!==null;});
  await frame.locator('#agropulse-page-style').waitFor({state:'attached'});
  check('Arrondis visibles dans l’aperçu privé',await frame.locator('#app .agp-card').first().evaluate(e=>getComputedStyle(e).borderRadius),'24px');
  await page.frames().find(frame=>frame.url().startsWith(site)).waitForFunction(()=>getComputedStyle(document.querySelector('#app .agp-card')).borderTopWidth==='2px').catch(async error=>{console.log('STYLE_DIAGNOSTIC',JSON.stringify({input:await page.locator('.agp-css-input').inputValue(),css:await frame.locator('#agropulse-page-style').textContent(),card:await frame.locator('#app .agp-card').first().evaluate(e=>({classes:e.className,style:e.getAttribute('style'),border:getComputedStyle(e).border}))}));throw error;});
  check('CSS manuel visible dans l’aperçu privé',await frame.locator('#app .agp-card').first().evaluate(e=>getComputedStyle(e).borderTopWidth),'2px');
  const firstCard=frame.locator('#sec-exemples .lk > a').first();await firstCard.locator('.ap-editor-tools button[draggable]').focus();await page.keyboard.press('ArrowRight');
  await frame.locator('#sec-exemples .lk > a').first().locator('h3').filter({hasText:'AGIR-IA'}).waitFor();
  check('Déplacement horizontal des cartes au clavier',await frame.locator('#sec-exemples .lk > a h3').allTextContents(),['AGIR-IA','YIDA-Cashew']);

  await frame.locator('#sec-exemples .lk > a').first().locator('.ap-editor-tools button[draggable]').dragTo(frame.locator('#sec-exemples .lk > a').nth(1));
  await frame.locator('#sec-exemples .lk > a').first().locator('h3').filter({hasText:'YIDA-Cashew'}).waitFor({timeout:5000}).catch(async error=>{console.log('DRAG_TRACE',await frame.locator('body').evaluate(()=>window.dragTrace));await page.screenshot({path:path.join(output,'cms-drag-diagnostic.png'),fullPage:true});throw error;});
  check('Déplacement des cartes par glisser-déposer',await frame.locator('#sec-exemples .lk > a h3').allTextContents(),['YIDA-Cashew','AGIR-IA']);
  await frame.locator('#sec-exemples .lk > a').first().locator('.ap-editor-tools button[draggable]').focus();await page.keyboard.press('ArrowRight');
  await frame.locator('#sec-exemples > .ap-editor-tools button[draggable]').focus();await page.keyboard.press('ArrowDown');
  await page.getByRole('button',{name:/enregistrer le brouillon|save draft/i}).click();await page.locator('.agp-status').filter({hasText:/Brouillon enregistré|Draft saved/}).waitFor();
  const saved=await call(endpoint+'?locale=fr',{token:tokens.editor});
  check('Réglages d’apparence conservés dans le brouillon',saved.data.data.siteLayout.styles.cardRadius,24);
  const unsafeStyle=await call(endpoint,{token:tokens.editor,method:'PUT',body:{locale:'fr',siteLayout:{styles:{customCss:'body { color:red; }'}}}});
  check('Les styles globaux sont refusés côté serveur',unsafeStyle.status,400);
  check('Ordre des cartes conservé dans le brouillon',saved.data.data.siteLayout.cards.exemples,[1,0]);
  check('Ordre des sections conservé dans le brouillon',saved.data.data.siteLayout.sections,['notif','exemples']);
  check('Le brouillon n’a pas modifié le site public',(await readPage()).data.status,'reference');
  check('L’Éditeur ne peut pas publier',(await call(endpoint+'/actions/publish',{token:tokens.editor,method:'POST',body:{locale:'fr'}})).status,403);
  const invalid=await call(endpoint,{token:tokens.editor,method:'PUT',body:{locale:'fr',siteLayout:{sections:['__proto__']}}});check('Les dispositions non autorisées sont refusées',invalid.status,400);
  const publication=await call(endpoint+'/actions/publish',{token:tokens.publisher,method:'POST',body:{locale:'fr'}});if(publication.status!==200)console.log('PUBLICATION_ERROR',JSON.stringify(publication.data));check('Le Publieur peut publier le brouillon',publication.status,200);
  const published=await readPage();check('Le site lit la version publiée',published.data.status,'published');check('La disposition publiée arrive au site',published.data.layout.cards.exemples,[1,0]);
  const publicPage=await context.newPage();await publicPage.goto(site+'/?lang=fr#p-ressources');await publicPage.waitForFunction(()=>document.querySelector('#app h1')?.textContent==='Titre du brouillon visuel isolé');
  check('Le site affiche le titre publié',await publicPage.locator('#app h1').innerText(),'Titre du brouillon visuel isolé');
  check('Le site affiche le nouvel ordre des cartes',await publicPage.locator('#sec-exemples .lk > a h3').allTextContents(),['AGIR-IA','YIDA-Cashew']);
  check('Le site affiche le nouvel ordre des sections',await publicPage.locator('#app > section').evaluateAll(nodes=>nodes.map(node=>node.id)),['sec-notif','sec-exemples']);
  check('Le site affiche les arrondis publiés',await publicPage.locator('#app .agp-card').first().evaluate(e=>getComputedStyle(e).borderRadius),'24px');
  check('Le site affiche le CSS manuel publié',await publicPage.locator('#app .agp-card').first().evaluate(e=>getComputedStyle(e).borderTopWidth),'2px');
  await publicPage.evaluate(()=>location.hash='#p-contact');await publicPage.locator('#agropulse-page-style').waitFor({state:'detached'});
  check('Le style ne se propage pas à une autre page',await publicPage.locator('#agropulse-page-style').count(),0);
  await publicPage.evaluate(()=>location.hash='#p-ressources');await publicPage.locator('#agropulse-page-style').waitFor({state:'attached'});
  check('Les commandes d’édition ne sont pas publiques',await publicPage.locator('.ap-editor-tools').count(),0);
  await page.screenshot({path:path.join(output,'cms-visual-editor-desktop.png'),fullPage:true});
  await page.getByRole('button',{name:/vue mobile|mobile view/i}).click();await page.screenshot({path:path.join(output,'cms-visual-editor-mobile-preview.png'),fullPage:true});
  await publicPage.setViewportSize({width:375,height:812});check('La disposition publiée reste adaptée au mobile',await publicPage.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
  check('Aucune erreur JavaScript pendant le pilotage',errors,[]);

  page.once('dialog',dialog=>dialog.accept());
  await page.getByRole('button',{name:'Rétablir l’apparence d’origine',exact:true}).click();
  await frame.locator('#agropulse-page-style').waitFor({state:'detached'});
  check('Le retour à l’apparence initiale conserve les textes',await page.locator('.agp-fields input').inputValue(),'Titre du brouillon visuel isolé');
  await page.getByRole('button',{name:/Enregistrer le brouillon|Save draft/i}).click();await page.locator('.agp-status').filter({hasText:/Brouillon enregistré|Draft saved/}).waitFor();
  check('Le retour au design d’origine reste privé',(await readPage()).data.layout.styles.cardRadius,24);
  // Prepare the same unpublished business document in both languages through the UI.
  let sharedDocument;
  for(const language of ['fr','en']){
   if(language==='en'){
    await page.locator('.agp-toolbar select').nth(1).selectOption('en');
    await page.waitForFunction(()=>document.querySelector('.agp-toolbar select')?.value==='');
   }
   await page.waitForFunction(()=>[...document.querySelectorAll('.agp-toolbar select option')].some(option=>/Mobilisation|mobilisation/.test(option.textContent)));
   const selected=await page.locator('.agp-toolbar select').first().locator('option').evaluateAll(options=>options.find(option=>/Mobilisation|mobilisation/.test(option.textContent))?.value);
   await page.locator('.agp-toolbar select').first().selectOption(selected);
   await page.locator('.agp-fields input').waitFor();
   const heading=(language==='fr'?'Mobilisation d’experts — brouillon local ':'Expert mobilisation — local draft ')+Date.now();
   await page.locator('.agp-fields input').fill(heading);
   const written=page.waitForResponse(response=>response.url().includes('/content-manager/collection-types/api::expertise.expertise')&&['POST','PUT'].includes(response.request().method()));
   await page.locator('button.agp-primary').click();
   const response=await written;check('Brouillon du pôle 7 enregistré '+language,[200,201].includes(response.status()),true);
   const native=(await response.json()).data;check('Langue du brouillon '+language,native.locale,language);check('Aucune publication automatique '+language,Boolean(native.publishedAt),false);
   if(language==='fr')sharedDocument=native.documentId;else check('FR/EN utilisent le même document',native.documentId,sharedDocument);
   const publicResult=await(await fetch(site+'/api/page-content?page=pole-7&locale='+language)).json();check('Le nouveau brouillon reste privé '+language,publicResult.status,'reference');
   await page.locator('.agp-status').filter({hasText:/Brouillon préparé|Brouillon enregistré|Draft prepared|Draft saved/}).waitFor();
  }
  await page.screenshot({path:path.join(output,'cms-create-translation.png'),fullPage:true});

 }finally{await unpublish();if(browser)await browser.close();}
 check('La fiche de test est retirée de la lecture publique',(await readPage()).data.status,'reference');
  await fs.writeFile(path.join(output,'visual-editor-report.json'),JSON.stringify({completed:true,checks,notes:['Isolated test entry only; no customer data or real mail','Public content and layout tested after a Publisher action','The test entry is unpublished after verification']},null,2));
 console.log(JSON.stringify({completed:true,checks:checks.length},null,2));
})().catch(error=>{console.error(error);process.exitCode=1});
