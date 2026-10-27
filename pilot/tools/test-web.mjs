import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHmac} from 'node:crypto';
import {runtime,localRoot,pilotRoot} from './runtime.mjs';
const r=await runtime();const {documentId:id}=JSON.parse(await fs.readFile(path.join(localRoot,'fixture.json'),'utf8'));
const {accessKey}=JSON.parse(await fs.readFile(path.join(localRoot,'read-token.json'),'utf8'));
const base='http://127.0.0.1:3100';const page=`/fr/expertise/${id}`;const results=[];let completed=false;
function check(name,actual,expected){assert.equal(actual,expected,name);results.push({name,result:'PASS',actual});console.log(`PASS ${name}: ${actual}`);}
function preview({documentId=id,locale='fr',expires=Date.now()+240000,signature}={}){
  const exp=String(expires);const sig=signature??createHmac('sha256',r.previewSecret).update(`${documentId}|${locale}|${exp}`).digest('hex');
  return `/api/preview?${new URLSearchParams({documentId,locale,expires:exp,signature:sig})}`;
}
async function get(url,headers={}){const res=await fetch(base+url,{redirect:'manual',headers});return {status:res.status,headers:res.headers,text:await res.text()};}
try{
  for(const locale of ['fr','en']){
    const res=await get(`/${locale}/expertise/${id}`);check(`Page ${locale}`,res.status,200);
    check(`Langue HTML ${locale}`,res.text.includes(`<html lang="${locale}">`),true);
    check(`Brouillon absent de la page publique ${locale}`,res.text.includes('BROUILLON_CONFIDENTIEL_PILOTE'),false);
    check(`Secrets absents du HTML ${locale}`,[accessKey,r.previewSecret,r.adminPassword].some(secret=>res.text.includes(secret)),false);
  }
  check('Document inconnu',(await get('/fr/expertise/unknown')).status,404);
  check('Locale non supportée',(await get(`/de/expertise/${id}`)).status,404);
  check('Signature incorrecte',(await get(preview({signature:'invalid'}))).status,401);
  check('Lien expiré',(await get(preview({expires:Date.now()-1000}))).status,401);
  check('Lien trop long',(await get(preview({expires:Date.now()+600000}))).status,401);
  check('Autre document même signé',(await get(preview({documentId:'unknown'}))).status,401);
  const entry=await get(preview());check('Lien valide redirige',entry.status,307);
  check('Destination interne',entry.headers.get('location'),base+page);
  check('Preview sans cache',entry.headers.get('cache-control'),'private, no-store');
  const cookies=entry.headers.getSetCookie().map(v=>v.split(';')[0]).join('; ');
  check('Cookie limité et HttpOnly',entry.headers.getSetCookie().some(v=>v.startsWith('agropulse-preview=')&&/HttpOnly/i.test(v)&&/Max-Age=/i.test(v)),true);
  const draft=await get(page,{cookie:cookies});check('Page brouillon',draft.status,200);
  check('Brouillon visible en session autorisée',draft.text.includes('BROUILLON_CONFIDENTIEL_PILOTE'),true);
  check('Page brouillon non stockable',/no-store/.test(draft.headers.get('cache-control')),true);
  check('Autre session reste publique',(await get(page)).text.includes('BROUILLON_CONFIDENTIEL_PILOTE'),false);
  const noScope=cookies.split('; ').filter(v=>!v.startsWith('agropulse-preview=')).join('; ');
  check('Cookie Next seul insuffisant',(await get(page,{cookie:noScope})).text.includes('BROUILLON_CONFIDENTIEL_PILOTE'),false);
  const past=String(Date.now()-1000);const pastSignature=createHmac('sha256',r.previewSecret).update(`scope|${id}|${past}`).digest('hex');
  check('Portée expirée refusée même avec cookie Next',(await get(page,{cookie:`${noScope}; agropulse-preview=${past}.${pastSignature}`})).text.includes('BROUILLON_CONFIDENTIEL_PILOTE'),false);
  const exit=await get('/api/exit-preview?locale=fr',{cookie:cookies});check('Sortie de preview',exit.status,307);
  check('Sortie supprime la portée',exit.headers.getSetCookie().some(v=>v.startsWith('agropulse-preview=')&&/expires=Thu, 01 Jan 1970/i.test(v)),true);
  let assetCount=0;
  async function scan(directory){for(const entry of await fs.readdir(directory,{withFileTypes:true})){const file=path.join(directory,entry.name);if(entry.isDirectory())await scan(file);else{assetCount++;const bytes=await fs.readFile(file);assert.equal([accessKey,r.previewSecret,r.adminPassword].some(secret=>bytes.includes(Buffer.from(secret))),false,'Secret absent du bundle navigateur');}}}
  await scan(path.join(pilotRoot,'web','.next','static'));
  check('Bundle navigateur inspecté sans secret',assetCount>0,true);
  completed=true;
}finally{await fs.writeFile(path.join(pilotRoot,'evidence','web-tests.json'),JSON.stringify({executedAt:new Date().toISOString(),completed,results},null,2));}
