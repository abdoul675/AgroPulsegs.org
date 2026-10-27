import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {runtime,localRoot,pilotRoot} from './runtime.mjs';
const {chromium}=createRequire(import.meta.url)('playwright');
const r=await runtime();const {documentId:id}=JSON.parse(await fs.readFile(path.join(localRoot,'fixture.json'),'utf8'));
const evidence=path.join(pilotRoot,'evidence');const results=[];let completed=false;
function check(name,actual,expected){assert.equal(actual,expected,name);results.push({name,result:'PASS',actual});console.log(`PASS ${name}: ${actual}`);}
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
  const publicContext=await browser.newContext();const page=await publicContext.newPage();
  for(const width of [375,768,1440]){
    await page.setViewportSize({width,height:900});
    await page.goto(`http://127.0.0.1:3100/fr/expertise/${id}`);
    await page.getByRole('heading',{level:1}).waitFor();
    check(`Débordement horizontal ${width}px`,await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    await page.screenshot({path:path.join(evidence,`public-fr-${width}.png`),fullPage:true});
  }
  await page.keyboard.press('Tab');check('Navigation clavier : premier lien',await page.locator(':focus').getAttribute('href'),`/fr/expertise/${id}`);
  await page.getByRole('link',{name:'EN',exact:true}).click();
  await page.waitForURL(`**/en/expertise/${id}`);
  await page.getByRole('heading',{name:'Fictional pilot expertise',exact:true}).waitFor();
  check('Changement de langue conserve le document',new URL(page.url()).pathname,`/en/expertise/${id}`);
  check('Langue EN dans le DOM',await page.locator('html').getAttribute('lang'),'en');
  check('Titre traduit visible',await page.getByRole('heading',{level:1}).innerText(),'Fictional pilot expertise');
  for(const name of ['editor','publisher','admin']){
    const context=await browser.newContext();const cms=await context.newPage();
    await cms.goto('http://127.0.0.1:1338/admin/auth/login');
    await cms.locator('input[name=email]').fill(`${name}@agropulse.test`);
    await cms.locator('input[name=password]').fill(r[`${name}Password`]);
    await cms.getByRole('button',{name:/^(Login|Se connecter)$/}).click();
    await cms.waitForURL(url=>!url.pathname.includes('/auth/login'));
    await cms.goto(`http://127.0.0.1:1338/admin/content-manager/collection-types/api::expertise.expertise/${id}?plugins[i18n][locale]=fr`);
    await cms.locator('input[name=title]').waitFor({timeout:30000});
    const publish=cms.getByRole('button',{name:/^(Publish|Publier)$/});
    if(name!=='editor')await publish.click({trial:true,timeout:15000});
    const allowed=await publish.count()>0&&await publish.isEnabled();
    check(`Interface ${name} : publication disponible`,allowed,name!=='editor');
    await cms.screenshot({path:path.join(evidence,`cms-${name}.png`),fullPage:true});
    if(name==='editor'){
      const login=await context.request.post('http://127.0.0.1:1338/admin/login',{data:{email:'editor@agropulse.test',password:r.editorPassword}});const {data}=await login.json();
      const response=await context.request.get(`http://127.0.0.1:1338/content-manager/preview/url/api::expertise.expertise?documentId=${id}&locale=fr&status=draft`,{headers:{Authorization:`Bearer ${data.token}`}});
      const link=(await response.json()).data.url;
      const preview=await context.newPage();await preview.goto(link);
      await preview.getByRole('status').waitFor();
      check('Navigateur : brouillon visible après lien signé',await preview.locator('article').innerText().then(text=>text.includes('BROUILLON_CONFIDENTIEL_PILOTE')),true);
      await preview.screenshot({path:path.join(evidence,'preview-fr.png'),fullPage:true});
      check('Navigateur : autre session reste publique',await page.locator('article').innerText().then(text=>text.includes('BROUILLON_CONFIDENTIEL_PILOTE')),false);
      await preview.getByRole('link',{name:'Quitter la prévisualisation'}).click();
      await preview.getByRole('heading',{level:1}).waitFor();
      check('Navigateur : sortie revient à la version publiée',await preview.locator('article').innerText().then(text=>text.includes('BROUILLON_CONFIDENTIEL_PILOTE')),false);
    }
    await context.close();
  }
  completed=true;
}finally{
  await browser.close();
  await fs.writeFile(path.join(evidence,'browser-tests.json'),JSON.stringify({executedAt:new Date().toISOString(),browser:'Microsoft Edge headless',completed,results},null,2));
}
