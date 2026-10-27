import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {runtime,localRoot,pilotRoot} from './runtime.mjs';
const r=await runtime();
const {documentId:id}=JSON.parse(await fs.readFile(path.join(localRoot,'fixture.json'),'utf8'));
const {accessKey}=JSON.parse(await fs.readFile(path.join(localRoot,'read-token.json'),'utf8'));
const base='http://127.0.0.1:1338';const uid='api::expertise.expertise';
const cm=`/content-manager/collection-types/${uid}/${id}`;
const results=[];let completed=false;
async function call(url,{token,method='GET',body,headers={}}={}){
  const response=await fetch(base+url,{method,headers:{...(token?{Authorization:`Bearer ${token}`} :{}),...(body?{'Content-Type':'application/json'}:{}),...headers},body:body?JSON.stringify(body):undefined});
  const text=await response.text();let data;try{data=JSON.parse(text);}catch{data={};}
  return {status:response.status,data,headers:response.headers};
}
function check(name,actual,expected){assert.equal(actual,expected,name);results.push({name,result:'PASS',actual});console.log(`PASS ${name}: ${actual}`);}
async function login(name){const res=await call('/admin/login',{method:'POST',body:{email:`${name}@agropulse.test`,password:r[`${name}Password`]}});check(`Connexion ${name}`,res.status,200);return res.data.data.token;}
try{
  const admin=await login('admin'),editor=await login('editor'),publisher=await login('publisher');
  check('Administrateur : gestion des rôles', (await call('/admin/roles',{token:admin})).status,200);
  check('Éditeur : gestion des rôles interdite',(await call('/admin/roles',{token:editor})).status,403);
  check('Publieur : gestion des rôles interdite',(await call('/admin/roles',{token:publisher})).status,403);
  const temporary=await call(`/content-manager/collection-types/${uid}`,{method:'POST',token:editor,body:{locale:'fr',title:'Brouillon incomplet temporaire'}});
  check('Éditeur : création d’un brouillon incomplet',temporary.status,201);
  const temporaryId=temporary.data.data.documentId;
  try{
    check('Éditeur : publication du nouveau brouillon refusée',(await call(`/content-manager/collection-types/${uid}/${temporaryId}/actions/publish`,{method:'POST',token:editor,body:{locale:'fr'}})).status,403);
    check('Nouveau brouillon invisible à la lecture publiée',(await call(`/api/expertises/${temporaryId}?locale=fr`,{token:accessKey})).status,404);
  }finally{
    check('Nettoyage du seul brouillon de test temporaire',(await call(`/content-manager/collection-types/${uid}/${temporaryId}?locale=fr`,{method:'DELETE',token:admin})).status,200);
  }
  check('Lecture anonyme refusée',(await call(`/api/expertises/${id}?locale=fr`)).status,403);
  check('Preview CMS sans secret refusée',(await call(`/api/pilot-preview/${id}?locale=fr`)).status,401);
  check('Brouillon FR incomplet enregistré',(await call(cm,{method:'PUT',token:editor,body:{locale:'fr',summary:''}})).status,200);
  check('Éditeur : publication directe refusée',(await call(`${cm}/actions/publish`,{method:'POST',token:editor,body:{locale:'fr'}})).status,403);
  check('Publieur : publication incomplète refusée',(await call(`${cm}/actions/publish`,{method:'POST',token:publisher,body:{locale:'fr'}})).status,400);
  for(const locale of ['fr','en']){
    const data=locale==='fr'?{title:'Expertise fictive du pilote',slug:'expertise-fictive-pilote',summary:'Version publiée FR — démonstration.',body:'Contenu fictif publié pour la vérification.'}:{title:'Fictional pilot expertise',slug:'fictional-pilot-expertise',summary:'Published EN version — demonstration.',body:'Fictional published content for verification.'};
    check(`Enregistrement ${locale}`,(await call(cm,{method:'PUT',token:editor,body:{...data,locale}})).status,200);
    check(`Publication autorisée ${locale}`,(await call(`${cm}/actions/publish`,{method:'POST',token:publisher,body:{locale}})).status,200);
    const read=await call(`/api/expertises/${id}?locale=${locale}`,{token:accessKey});
    check(`Lecture publiée ${locale}`,read.status,200);check(`Identité métier ${locale}`,read.data.data.documentId,id);check(`Locale ${locale}`,read.data.data.locale,locale);
  }
  check('Nouvelle révision FR non publiée',(await call(cm,{method:'PUT',token:editor,body:{locale:'fr',summary:'BROUILLON_CONFIDENTIEL_PILOTE'}})).status,200);
  const pub=await call(`/api/expertises/${id}?locale=fr&populate=*`,{token:accessKey});
  check('La lecture publiée ne fuit pas la révision',pub.data.data.summary,'Version publiée FR — démonstration.');
  check('Aucun compte administrateur exposé',JSON.stringify(pub.data).includes('@agropulse.test'),false);
  check('Statut brouillon refusé au jeton de lecture',(await call(`/api/expertises/${id}?locale=fr&status=draft`,{token:accessKey})).status,403);
  check('Écriture interdite au jeton de lecture',[403,405].includes((await call(`/api/expertises/${id}`,{token:accessKey,method:'PUT',body:{data:{summary:'forbidden'}}})).status),true);
  const draft=await call(`/api/pilot-preview/${id}?locale=fr`,{headers:{'x-pilot-preview-secret':r.previewSecret}});
  check('Lecture serveur du brouillon',draft.data.data.summary,'BROUILLON_CONFIDENTIEL_PILOTE');
  check('Brouillon sans cache',draft.headers.get('cache-control'),'private, no-store');
  check('Autre document refusé en preview',(await call('/api/pilot-preview/unknown?locale=fr',{headers:{'x-pilot-preview-secret':r.previewSecret}})).status,404);
  check('Locale non autorisée refusée en preview',(await call(`/api/pilot-preview/${id}?locale=de`,{headers:{'x-pilot-preview-secret':r.previewSecret}})).status,400);
  const link=await call(`/content-manager/preview/url/${uid}?documentId=${id}&locale=fr&status=draft`,{token:editor});
  check('Éditeur : génération native du lien de preview',link.status,200);
  check('Lien signé produit',Boolean(link.data.data?.url?.includes('signature=')),true);
  check('Lien natif anonyme refusé',(await call(`/content-manager/preview/url/${uid}?documentId=${id}&locale=fr&status=draft`)).status,401);
  completed=true;
}finally{
  await fs.mkdir(path.join(pilotRoot,'evidence'),{recursive:true});
  await fs.writeFile(path.join(pilotRoot,'evidence','cms-tests.json'),JSON.stringify({executedAt:new Date().toISOString(),completed,environment:'Local isolated fictional fixture',results},null,2));
}
