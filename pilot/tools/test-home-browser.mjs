import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {runtime,pilotRoot} from './runtime.mjs';
const {chromium}=createRequire(import.meta.url)('playwright');
const r=await runtime();const base=process.env.HOME_TEST_URL||'http://127.0.0.1:3100';
const results=[];let completed=false;const check=(name,actual,expected)=>{assert.equal(actual,expected,name);results.push({name,result:'PASS'});console.log('PASS '+name);};
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const page=await browser.newPage({reducedMotion:'reduce'});const errors=[];page.on('pageerror',error=>errors.push(error.message));
 const external=[];await page.route('https://fonts.googleapis.com/**',route=>{external.push(route.request().url());return route.abort();});
 for(const [locale,width] of [['fr',1440],['fr',375],['en',768]]){
  await page.setViewportSize({width,height:1000});const response=await page.goto(base+'/'+locale);await page.locator('.site-header').waitFor();
  check(`Accueil ${locale} ${width}`,response.status(),200);check(`Langue ${locale} ${width}`,await page.locator('html').getAttribute('lang'),locale);
  check(`Un titre principal ${locale} ${width}`,await page.locator('h1').count(),1);
  check(`Sans débordement ${locale} ${width}`,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await page.locator('img').evaluateAll(images=>Promise.all(images.map(async image=>{image.loading='eager';await image.decode().catch(()=>{});} )));
  check(`Images locales chargées ${locale} ${width}`,await page.locator('img').evaluateAll(images=>images.every(image=>image.complete&&image.naturalWidth>0)),true);
  const html=await page.content();check(`Aucun secret exposé ${locale} ${width}`,![r.previewSecret,r.adminPassword].some(secret=>html.includes(secret)),true);
  await page.screenshot({path:path.join(pilotRoot,'evidence',`home-${locale}-${width}.png`),fullPage:true});
 }
 await page.setViewportSize({width:375,height:844});await page.goto(base+'/fr');
 await page.getByRole('button',{name:'Menu',exact:true}).click();check('Menu mobile ouvert',await page.getByRole('button',{name:'Menu',exact:true}).getAttribute('aria-expanded'),'true');
 await page.locator('#site-navigation').getByRole('link',{name:'Expertises',exact:true}).click();check('Menu fermé après navigation',await page.getByRole('button',{name:'Menu',exact:true}).getAttribute('aria-expanded'),'false');
 check('Ancre expertise atteinte',new URL(page.url()).hash,'#expertises');
 await page.getByRole('link',{name:'Switch to English'}).click();await page.waitForURL('**/en');check('Équivalent anglais accessible',await page.locator('h1').innerText().then(text=>text.startsWith('Accelerating')),true);
 await page.goto(base+'/fr');await page.keyboard.press('Tab');check('Premier accès clavier : contenu',await page.evaluate(()=>document.activeElement.getAttribute('href')),'#home-main');
 check('Langue inconnue refusée',(await page.goto(base+'/de')).status(),404);
 check('Aucune erreur JavaScript',errors.length,0);completed=true;
}finally{await browser.close();await fs.writeFile(path.join(pilotRoot,'evidence','home-browser-tests.json'),JSON.stringify({executedAt:new Date().toISOString(),completed,fonts:'External Google Fonts blocked; system fallback tested',results},null,2));}
