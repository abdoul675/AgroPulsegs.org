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
 const page=await browser.newPage({reducedMotion:'reduce'});const errors=[];const transmissions=[];
 page.on('pageerror',error=>errors.push(error.message));page.on('request',request=>{if(request.method()==='POST')transmissions.push(request.url());});
 await page.route('https://fonts.googleapis.com/**',route=>route.abort());
 for(const [locale,width] of [['fr',1440],['fr',375],['en',768]]){
  await page.setViewportSize({width,height:1000});const response=await page.goto(base+'/'+locale);await page.locator('[data-enable-draft]:not([disabled])').waitFor();
  check(`Accueil ${locale} ${width}`,response.status(),200);check(`Langue ${locale} ${width}`,await page.locator('html').getAttribute('lang'),locale);
  check(`Un titre principal ${locale} ${width}`,await page.locator('h1').count(),1);
  check(`Sans débordement ${locale} ${width}`,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await page.locator('img').evaluateAll(images=>Promise.all(images.map(async image=>{image.loading='eager';await image.decode().catch(()=>{});} )));
  check(`Images locales chargées ${locale} ${width}`,await page.locator('img').evaluateAll(images=>images.every(image=>image.complete&&image.naturalWidth>0)),true);
  const html=await page.content();check(`Aucun secret exposé ${locale} ${width}`,![r.previewSecret,r.adminPassword].some(secret=>html.includes(secret)),true);
  check(`Pas de logo superposé au hero ${locale} ${width}`,await page.locator('.hero img,.hero .hlogo').count(),0);
  await page.screenshot({path:path.join(pilotRoot,'evidence',`home-restored-${locale}-${width}.png`),fullPage:true});
 }
 await page.setViewportSize({width:375,height:844});await page.goto(base+'/fr');await page.locator('[data-enable-draft]:not([disabled])').waitFor();
 await page.locator('#bg').click();check('Menu mobile ouvert',await page.locator('#bg').getAttribute('aria-expanded'),'true');
 await page.locator('#nav').getByRole('link',{name:'Expertises',exact:true}).click();check('Menu fermé après navigation',await page.locator('#bg').getAttribute('aria-expanded'),'false');
 check('Ancre expertise atteinte',new URL(page.url()).hash,'#expertises');
 for(const id of ['circuit','expertises','fellowship','jeu','agir-ia','images','partenaires','ancrage','contact'])check(`Section de la maquette : ${id}`,await page.locator('#'+id).count(),1);
 const faq=page.locator('.qb').first();await faq.click();check('Question expertise dépliée',await faq.getAttribute('aria-expanded'),'true');
 await page.locator('.tb[data-m="1"]').click();check('Laboratoire : étape pratique sélectionnée',await page.locator('.tb[data-m="1"]').getAttribute('aria-pressed'),'true');
 check('Globe initialisé',await page.locator('#gb').evaluate(canvas=>canvas.width>0),true);
 check('Seul le partenaire confirmé est présenté',await page.locator('#plist .pb').count(),1);
 await page.locator('[data-game] [data-b]').click();check('Jeu démarré',await page.locator('[data-game] [data-ov]').getAttribute('hidden'),'');
 await page.locator('#n').fill('Essai fictif');await page.locator('#e').fill('demo@example.test');await page.locator('#m').fill('Brouillon de démonstration, à conserver.');
 await page.locator('#f button[type=submit]').click();check('Aucune fausse confirmation de réception',await page.locator('#st').innerText(),'Brouillon préparé sur cette page. Aucun message n’a été envoyé.');
 check('Le texte saisi reste disponible',await page.locator('#m').inputValue(),'Brouillon de démonstration, à conserver.');check('Aucun envoi de formulaire',transmissions.length,0);
 check('Ancres internes sans destination manquante',await page.locator('a[href^="#"]').evaluateAll(links=>links.filter(a=>a.hash&&a.hash!=='#'&&!document.getElementById(decodeURIComponent(a.hash.slice(1)))).length),0);
 await page.locator('#lang').click();await page.waitForURL('**/en#expertises');await page.locator('[data-enable-draft]:not([disabled])').waitFor();check('Équivalent anglais et ancre conservés',await page.locator('h1').innerText().then(text=>text.startsWith('Accelerating')),true);
 await page.goto(base+'/fr');await page.keyboard.press('Tab');check('Premier accès clavier : contenu',await page.evaluate(()=>document.activeElement.getAttribute('href')),'#main');
 check('Langue inconnue refusée',(await page.goto(base+'/de')).status(),404);
 check('Aucune erreur JavaScript',errors.length,0);completed=true;
}finally{await browser.close();await fs.writeFile(path.join(pilotRoot,'evidence','home-browser-tests.json'),JSON.stringify({executedAt:new Date().toISOString(),completed,fonts:'External Google Fonts blocked; system fallback tested',results},null,2));}
