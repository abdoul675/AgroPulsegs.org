import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {runtime,localRoot,pilotRoot} from './runtime.mjs';
const {chromium}=createRequire(import.meta.url)('playwright');const r=await runtime();const f=JSON.parse(await fs.readFile(path.join(localRoot,'content-fixtures.json'),'utf8'));
const results=[];let completed=false;let token;let originalLanguage='fr';
function check(name,actual,expected){assert.equal(actual,expected,name);results.push({name,result:'PASS',actual});console.log(`PASS ${name}: ${actual}`);}
const b=await chromium.launch({channel:'msedge',headless:true});const context=await b.newContext();const page=await context.newPage();const base='http://127.0.0.1:1338';
try{
 await page.goto(base+'/admin/auth/login');await page.locator('input[name=email]').waitFor();
 check('Interface française par défaut',await page.locator('html').getAttribute('lang'),'fr');
 await page.getByRole('combobox').click();await page.getByRole('option',{name:'English',exact:true}).click();
 await page.getByRole('button',{name:'Login',exact:true}).waitFor();check('Interface anglaise disponible',await page.locator('html').getAttribute('lang'),'en');
 await page.getByRole('combobox').click();await page.getByRole('option',{name:'Français',exact:true}).click();
 await page.locator('input[name=email]').fill('editor@agropulse.test');await page.locator('input[name=password]').fill(r.editorPassword);
 const loginResponse=page.waitForResponse(response=>response.url().endsWith('/admin/login')&&response.request().method()==='POST');
 await page.getByRole('button',{name:'Se connecter',exact:true}).click();const login=await loginResponse;check('Connexion du community manager',login.status(),200);
 const loginData=(await login.json()).data;token=loginData.token;originalLanguage=loginData.user.preferedLanguage||'fr';
 await page.waitForURL(url=>!url.pathname.includes('/auth/login'));
 const editorPath=`/admin/content-manager/collection-types/api::page.page/${f.page}?plugins[i18n][locale]=fr`;
 await page.goto(base+editorPath);const heading=page.locator('input[name=heroTitle]');await heading.waitFor();
 check('Grand titre en saisie directe',await heading.isVisible(),true);
 check('Libellé français sans mélange anglais',await page.getByLabel('Grand titre',{exact:true}).isVisible(),true);
 check('Introduction en saisie directe',await page.locator('textarea[name=summary]').isVisible(),true);
 check('Blocs techniques absents du formulaire',await page.locator('input[name^="sections."],textarea[name^="sections."]').count(),0);
 check('Référencement imbriqué masqué',await page.locator('input[name="seo.title"]').count(),0);
 const title=`Grand titre fictif — essai ${Date.now()}`;await heading.fill(title);
 const saved=page.waitForResponse(response=>response.request().method()==='PUT'&&response.url().includes('/content-manager/collection-types/api::page.page/'));
 await page.getByRole('button',{name:/^(Enregistrer|Save)$/}).click();check('Enregistrement réel par le formulaire', (await saved).status(),200);
 await page.screenshot({path:path.join(pilotRoot,'evidence','cms-saisie-simple-fr.png'),fullPage:true});
 const view=await context.request.get(base+`/content-manager/collection-types/api::page.page/${f.page}?locale=fr`,{headers:{Authorization:'Bearer '+token}});const document=(await view.json()).data;
 check('Texte du formulaire transmis au bon bloc',document.sections.find(section=>section.__component==='content.hero').title,title);
 const profile=await context.request.put(base+'/admin/users/me',{headers:{Authorization:'Bearer '+token},data:{preferedLanguage:'en'}});check('Choix anglais sur le profil',profile.status(),200);
 await page.reload();await heading.waitFor();await page.getByRole('button',{name:'Save',exact:true}).waitFor();check('Administration authentifiée en anglais',await page.locator('html').getAttribute('lang'),'en');
 check('Libellé anglais après choix de langue',await page.getByLabel('Main heading',{exact:true}).isVisible(),true);
 await page.screenshot({path:path.join(pilotRoot,'evidence','cms-saisie-simple-en.png'),fullPage:true});
 await page.goto(base+editorPath.replace('locale]=fr','locale]=en'));await page.locator('input[name=title]').waitFor();check('Traduction anglaise du contenu accessible',await page.locator('input[name=title]').inputValue(),'Fictional pilot home');
 completed=true;
}finally{
 if(token)await context.request.put(base+'/admin/users/me',{headers:{Authorization:'Bearer '+token},data:{preferedLanguage:originalLanguage}}).catch(()=>{});
 await b.close();await fs.writeFile(path.join(pilotRoot,'evidence','editorial-ui-tests.json'),JSON.stringify({executedAt:new Date().toISOString(),completed,browser:'Microsoft Edge headless',results},null,2));
}
