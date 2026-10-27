import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {pilotRoot} from './runtime.mjs';
const {chromium}=createRequire(import.meta.url)('playwright');
const base='http://127.0.0.1:3100',slugs=['a-propos','expertises','pole-1','pole-2','pole-3','pole-4','pole-5','pole-6'];
const results=[];let completed=false;
function check(name,value,expected){assert.equal(value,expected,name);results.push({name,result:'PASS'});console.log('PASS '+name);}
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const context=await browser.newContext();const page=await context.newPage();const errors=[],fontRequests=[];
 page.on('pageerror',error=>errors.push(error.message));page.on('request',request=>{if(request.url().includes('fonts.googleapis.com'))fontRequests.push(request.url());});
 for(const locale of ['fr','en'])for(const slug of slugs){
  await page.setViewportSize({width:locale==='fr'?1440:375,height:950});const response=await page.goto(`${base}/${locale}/${slug}`);await page.waitForFunction(slug=>document.documentElement.dataset.interiorReady===slug,slug);
  check(`${locale}/${slug} disponible`,response.status(),200);check(`${locale}/${slug} langue`,await page.locator('html').getAttribute('lang'),locale);
  check(`${locale}/${slug} texte sans onglets ni texte replié`,await page.locator('#app .tb2,#app .or,#app .mf-dots,#app .sn,#app .mb,#app details,#app .cm').count(),0);
  check(`${locale}/${slug} menu de cinq entrées`,await page.locator('#nav li').count(),5);
  check(`${locale}/${slug} aucun débordement`,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  check(`${locale}/${slug} police lisible`,await page.locator('h1').evaluate(node=>getComputedStyle(node).fontFamily.startsWith('Arial')),true);
  if(slug!=='expertises')check(`${locale}/${slug} page courte`,(await page.locator('#app').innerText()).split(/\s+/).length<=200,true);
  if(slug.startsWith('pole-')){const offers=page.locator('#sec-services .fx>div');check(`${locale}/${slug} trois services visibles`,await offers.count(),3);for(let i=0;i<3;i++)check(`${locale}/${slug} service ${i+1} directement lisible`,await offers.nth(i).isVisible(),true);}
  if(locale==='fr'&&['a-propos','expertises','pole-1'].includes(slug))await page.screenshot({path:path.join(pilotRoot,'evidence',`concise-${slug}-1440.png`),fullPage:true});
 }
 await page.setViewportSize({width:375,height:844});await page.goto(base+'/fr/a-propos');await page.waitForFunction(()=>document.documentElement.dataset.interiorReady==='a-propos');
 check('À propos mobile lisible',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await page.screenshot({path:path.join(pilotRoot,'evidence','concise-a-propos-375.png'),fullPage:true});
 await page.locator('#bg').click();check('Menu mobile ouvert',await page.locator('#bg').getAttribute('aria-expanded'),'true');await page.locator('#nav a[data-pg=expertises]').click();await page.waitForURL('**/fr/expertises');
 check('Les six domaines se lisent sans carrousel',await page.locator('.pl a').count(),6);await page.locator('.pl a').nth(1).click();await page.waitForURL('**/fr/pole-2');await page.waitForFunction(()=>document.documentElement.dataset.interiorReady==='pole-2');
 await page.locator('#lang').click();await page.waitForURL('**/en/pole-2');await page.waitForFunction(()=>document.documentElement.dataset.interiorReady==='pole-2');check('La langue conserve le domaine',new URL(page.url()).pathname,'/en/pole-2');
 await page.locator('#sec-contact a.btn').click();await page.waitForURL('**/en#contact');await page.locator('#f').waitFor();check('Un lien conduit au contact commun',await page.locator('#f').count(),1);
 await page.goto(base+'/fr');await page.locator('[data-enable-draft]:not([disabled])').waitFor();check('Accueil : menu simplifié',await page.locator('#nav li').count(),5);check('Accueil : police cohérente',await page.locator('h1').evaluate(node=>getComputedStyle(node).fontFamily.startsWith('Arial')),true);
 check('Accueil : rubriques essentielles directement accessibles',await page.locator('#expertises,#programmes,#apropos,#contact').count(),4);
 check('Aucune police à télécharger',fontRequests.length,0);check('Aucune erreur JavaScript',errors.length,0);completed=true;
}finally{await browser.close();await fs.writeFile(path.join(pilotRoot,'evidence','concise-ui-tests.json'),JSON.stringify({executedAt:new Date().toISOString(),completed,results},null,2));}
