import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {runtime,localRoot,pilotRoot} from './runtime.mjs';
const {chromium}=createRequire(import.meta.url)('playwright');
const r=await runtime();const fixtures=JSON.parse(await fs.readFile(path.join(localRoot,'content-fixtures.json'),'utf8'));
const results=[];let completed=false;
function check(name,actual,expected){assert.equal(actual,expected,name);results.push({name,result:'PASS',actual});console.log(`PASS ${name}: ${actual}`);}
const browser=await chromium.launch({channel:'msedge',headless:true});
const sessions=new Map();
try{
  for(const [name,type] of [['editor','page'],['editor','campaign'],['publisher','programme']]){
    let session=sessions.get(name);
    if(!session){
      const context=await browser.newContext();const page=await context.newPage();
      await page.goto('http://127.0.0.1:1338/admin/auth/login');
      await page.locator('input[name=email]').fill(`${name}@agropulse.test`);await page.locator('input[name=password]').fill(r[`${name}Password`]);
      const loginResponse=page.waitForResponse(response=>response.url().endsWith('/admin/login')&&response.request().method()==='POST');
      await page.getByRole('button',{name:/^(Login|Se connecter)$/}).click();
      const response=await loginResponse;
      if(response.status()===429)throw new Error('Limite de connexions atteinte : laisser expirer la fenêtre de cinq minutes avant de reprendre.');
      assert.equal(response.status(),200,'Connexion navigateur');
      await page.waitForURL(url=>!url.pathname.includes('/auth/login'));
      session={context,page};sessions.set(name,session);
    }
    const {page}=session;
    await page.goto(`http://127.0.0.1:1338/admin/content-manager/collection-types/api::${type}.${type}/${fixtures[type]}${type==='campaign'?'':'?plugins[i18n][locale]=fr'}`);
    const input=page.locator(`input[name="${type==='campaign'?'key':'title'}"]`);await input.waitFor();
    check(`Interface ${name} : ${type} chargé`,Boolean(await input.inputValue()),true);
    const publish=page.getByRole('button',{name:/^(Publish|Publier)$/});
    if(name==='publisher'){
      await publish.waitFor({state:'visible',timeout:15000});
      check(`Interface ${name} : commande de publication présente ${type}`,await publish.count()>0,true);
    }else check(`Interface ${name} : publication interdite ${type}`,await publish.count()>0&&await publish.isEnabled(),false);
    if(type==='campaign'){
      check('Interface Éditeur : ouverture non modifiable',await page.locator('input[name="state"]:not([disabled]):not([readonly]), button[role="combobox"][name="state"]:not([disabled])').count(),0);
      check('Interface Éditeur : dates non modifiables',await page.locator('input[name^="opensAt"]:not([disabled]):not([readonly]), input[name^="closesAt"]:not([disabled]):not([readonly])').count(),0);
    }
    await page.screenshot({path:path.join(pilotRoot,'evidence',`content-${type}-${name}.png`),fullPage:true});
  }
  completed=true;
}finally{await browser.close();await fs.writeFile(path.join(pilotRoot,'evidence','content-browser-tests.json'),JSON.stringify({executedAt:new Date().toISOString(),completed,browser:'Microsoft Edge headless',results},null,2));}
