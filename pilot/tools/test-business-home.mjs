import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {pilotRoot,runtime} from './runtime.mjs';
const {chromium}=createRequire(import.meta.url)('playwright');
const r=await runtime(),base='http://127.0.0.1:3100';const results=[];let completed=false;
function check(name,value,expected){assert.equal(value,expected,name);results.push({name,result:'PASS'});console.log('PASS '+name);}
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const page=await browser.newPage();const errors=[],posts=[];page.on('pageerror',error=>errors.push(error.message));page.on('request',request=>{if(request.method()==='POST')posts.push(request.url());});
 for(const [locale,width]of [['fr',1440],['fr',375],['en',1440],['en',375]]){
  await page.setViewportSize({width,height:1000});const response=await page.goto(base+'/'+locale);await page.locator('[data-enable-draft]:not([disabled])').waitFor();
  check(`${locale} ${width}px : accueil`,response.status(),200);check(`${locale} ${width}px : langue`,await page.locator('html').getAttribute('lang'),locale);
  check(`${locale} ${width}px : pas de débordement`,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  check(`${locale} ${width}px : six cartes accessibles`,await page.locator('#expertises .business-card').count(),6);
  check(`${locale} ${width}px : deux programmes distincts`,await page.locator('#programmes article').count(),2);
  check(`${locale} ${width}px : logo hors du hero`,await page.locator('.business-hero img').count(),0);
  await page.locator('img').evaluateAll(images=>Promise.all(images.map(async image=>{image.loading='eager';await image.decode().catch(()=>{});} )));
  check(`${locale} ${width}px : images affichées`,await page.locator('img').evaluateAll(images=>images.every(image=>image.complete&&image.naturalWidth>0)),true);
  const html=await page.content();check(`${locale} ${width}px : secrets absents`,![r.adminPassword,r.previewSecret].some(secret=>html.includes(secret)),true);
  if(locale==='fr')await page.screenshot({path:path.join(pilotRoot,'evidence',`business-home-${width}.png`)});
 }
 await page.goto(base+'/fr');await page.locator('[data-enable-draft]:not([disabled])').waitFor();await page.keyboard.press('Tab');check('Premier lien clavier : contenu',await page.evaluate(()=>document.activeElement.getAttribute('href')),'#main');
 await page.locator('#bg').click();check('Menu mobile ouvert',await page.locator('#bg').getAttribute('aria-expanded'),'true');await page.locator('#bg').press('Escape');check('Menu fermé au clavier',await page.locator('#bg').getAttribute('aria-expanded'),'false');
 await page.locator('.business-actions a[href="#expertises"]').click();check('Accès direct aux expertises',new URL(page.url()).hash,'#expertises');
 await page.locator('#expertises .business-card').nth(2).click();await page.waitForURL('**/fr/pole-3');check('Une carte ouvre son pôle',new URL(page.url()).pathname,'/fr/pole-3');
 await page.goto(base+'/fr#contact');await page.locator('[data-enable-draft]:not([disabled])').waitFor();await page.locator('#n').fill('Essai fictif');await page.locator('#e').fill('demo@example.test');await page.locator('#m').fill('Brouillon local à conserver.');await page.locator('#f [type=submit]').click();
 check('Aucune fausse confirmation d’envoi',await page.locator('#st').innerText(),'Votre brouillon est prêt sur cette page. Aucun message n’a été envoyé.');check('Texte conservé',await page.locator('#m').inputValue(),'Brouillon local à conserver.');check('Aucune transmission',posts.length,0);
 await page.locator('#lang').click();await page.waitForURL('**/en#contact');check('Langue et section conservées',new URL(page.url()).pathname+new URL(page.url()).hash,'/en#contact');
 const plain=await browser.newContext({javaScriptEnabled:false});const nojs=await plain.newPage();await nojs.goto(base+'/fr');check('Présentation disponible sans JavaScript',await nojs.locator('h1').count(),1);check('Envoi désactivé sans JavaScript',await nojs.locator('#f [type=submit]').isDisabled(),true);await plain.close();
 check('Ancres valides',await page.locator('a[href^="#"]').evaluateAll(links=>links.filter(link=>link.hash&&!document.getElementById(link.hash.slice(1))).length),0);check('Aucune erreur JavaScript',errors.length,0);completed=true;
}finally{await browser.close();await fs.writeFile(path.join(pilotRoot,'evidence','business-home-tests.json'),JSON.stringify({executedAt:new Date().toISOString(),completed,reference:'SMAG visual organisation; original AgroPulse content and assets',results},null,2));}
