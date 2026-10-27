import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {runtime,localRoot,pilotRoot} from './runtime.mjs';
const r=await runtime();const f=JSON.parse(await fs.readFile(path.join(localRoot,'content-fixtures.json'),'utf8'));const base='http://127.0.0.1:1338';
const endpoint=`/content-manager/collection-types/api::page.page/${f.page}`;const results=[];let completed=false;
function check(name,actual,expected){assert.equal(actual,expected,name);results.push({name,result:'PASS',actual});console.log(`PASS ${name}: ${actual}`);}
async function call(url,{token,method='GET',body}={}){const res=await fetch(base+url,{method,headers:{...(token?{Authorization:'Bearer '+token}:{}),...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined});return {status:res.status,data:await res.json()};}
try{
 const tokens={};for(const name of ['editor','publisher']){const response=await call('/admin/login',{method:'POST',body:{email:`${name}@agropulse.test`,password:r[`${name}Password`]}});check(`Connexion ${name}`,response.status,200);tokens[name]=response.data.data.token;}
 const before=await call(endpoint+'?locale=fr',{token:tokens.editor});check('Page de démonstration disponible',before.status,200);
 const sectionsBefore=before.data.data.sections;const cardsBefore=sectionsBefore.filter(section=>['content.card-grid','content.cta'].includes(section.__component));
 const text=[{type:'paragraph',children:[{type:'text',text:'Texte fictif modifié depuis la saisie simplifiée.'}]}];
 const response=await call(endpoint,{token:tokens.editor,method:'PUT',body:{locale:'fr',heroTitle:'Grand titre fictif — saisie simplifiée',summary:'Introduction fictive mise à jour sans bloc technique.',mainContent:text}});
 check('Enregistrement sans fournir les blocs ni le SEO',response.status,200);
 const after=(await call(endpoint+'?locale=fr',{token:tokens.editor})).data.data;
 check('Grand titre répercuté',after.sections.find(section=>section.__component==='content.hero').title,'Grand titre fictif — saisie simplifiée');
 check('Introduction répercutée',after.sections.find(section=>section.__component==='content.hero').intro,'Introduction fictive mise à jour sans bloc technique.');
 check('Texte principal répercuté',after.sections.find(section=>section.__component==='content.rich-text').body[0].children[0].text,text[0].children[0].text);
 check('Cartes et boutons conservés',JSON.stringify(after.sections.filter(section=>['content.card-grid','content.cta'].includes(section.__component)).map(({id,...section})=>section)),JSON.stringify(cardsBefore.map(({id,...section})=>section)));
 check('Référencement préparé',after.seo.description,'Introduction fictive mise à jour sans bloc technique.');
 check('Éditeur toujours privé de publication',(await call(endpoint+'/actions/publish',{method:'POST',token:tokens.editor,body:{locale:'fr'}})).status,403);
 const wholeForm={...Object.fromEntries(['key','title','slug','summary','mainContent','sections','seo'].map(field=>[field,after[field]])),locale:'fr',heroTitle:'Titre fictif enregistré depuis un formulaire complet'};
 check('Formulaire complet accepté',(await call(endpoint,{method:'PUT',token:tokens.editor,body:wholeForm})).status,200);
 const wholeAfter=(await call(endpoint+'?locale=fr',{token:tokens.editor})).data.data;
 check('Le texte simple prime sur les anciens blocs inchangés',wholeAfter.sections.find(section=>section.__component==='content.hero').title,wholeForm.heroTitle);
 check('Le Publieur peut publier le contenu complet',(await call(endpoint+'/actions/publish',{method:'POST',token:tokens.publisher,body:{locale:'fr'}})).status,200);
 completed=true;
}finally{await fs.writeFile(path.join(pilotRoot,'evidence','simple-entry-tests.json'),JSON.stringify({executedAt:new Date().toISOString(),completed,results},null,2));}
