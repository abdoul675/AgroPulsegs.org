import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {runtime,localRoot,pilotRoot} from './runtime.mjs';
const runtimeData=await runtime();const base='http://127.0.0.1:1338';
const results=[];let completed=false;let current='initialisation';
const filename=path.join(localRoot,'content-fixtures.json');let fixtures={};
try{fixtures=JSON.parse(await fs.readFile(filename,'utf8'));}catch(error){if(error.code!=='ENOENT')throw error;}
const uid=name=>`api::${name}.${name}`;
const cm=(name,id)=>`/content-manager/collection-types/${uid(name)}${id?'/'+id:''}`;
async function call(url,{token,method='GET',body}={}){
  const response=await fetch(base+url,{method,headers:{...(token?{Authorization:`Bearer ${token}`} :{}),...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined});
  const data=await response.json().catch(()=>({}));return {status:response.status,data};
}
function check(name,actual,expected){current=name;assert.equal(actual,expected,name);results.push({name,result:'PASS',actual});console.log(`PASS ${name}: ${actual}`);}
async function login(name){const response=await call('/admin/login',{method:'POST',body:{email:`${name}@agropulse.test`,password:runtimeData[`${name}Password`]}});check(`Connexion ${name}`,response.status,200);return response.data.data.token;}
const blocks=text=>[{type:'paragraph',children:[{type:'text',text}]}];
const seo=locale=>({title:locale==='fr'?'Démonstration AgroPulse':'AgroPulse demonstration',description:locale==='fr'?'Contenu entièrement fictif du pilote local.':'Entirely fictional content for the local pilot.'});
try{
  const deadline=Date.now()+45000;
  while(true){try{const response=await fetch(base+'/admin/init',{signal:AbortSignal.timeout(2000)});if(response.ok)break;}catch{}if(Date.now()>deadline)throw new Error('Le CMS local ne répond pas ; démarrer Strapi avant les contrôles.');await new Promise(resolve=>setTimeout(resolve,1000));}
  const admin=await login('admin'),editor=await login('editor'),publisher=await login('publisher');
  const {accessKey:read}=JSON.parse(await fs.readFile(path.join(localRoot,'content-read-token.json'),'utf8'));
  async function ensure(name,body,fixtureName=name){if(fixtures[fixtureName])return fixtures[fixtureName];const response=await call(cm(name),{method:'POST',token:editor,body});check(`Création du brouillon ${fixtureName}`,response.status,201);const id=response.data.data.documentId;assert.ok(id);fixtures[fixtureName]=id;await fs.writeFile(filename,JSON.stringify(fixtures,null,2));return id;}
  const page=await ensure('page',{locale:'fr',key:'home',title:'Accueil fictif du pilote'});
  const programme=await ensure('programme',{locale:'fr',key:'fellowship',title:'Programme fictif du pilote'});
  const partner=await ensure('partner',{locale:'fr',key:'pilot-fictional-partner',name:'Organisation fictive du pilote'});
  const unconfirmedPartner=await ensure('partner',{locale:'fr',key:'pilot-unconfirmed-partner',name:'Organisation fictive non confirmée'},'unconfirmedPartner');
  const resource=await ensure('resource',{key:'pilot-missing-resource',language:'fr',title:'Ressource fictive sans fichier'});
  const campaign=await ensure('campaign',{key:'pilot-closed-campaign',notice:{fr:'Aucune candidature ouverte.',en:'Applications are closed.'}});
  for(const [name,id] of Object.entries(fixtures).filter(([name])=>name!=='unconfirmedPartner')){
    const response=await call(`${cm(name,id)}/actions/publish`,{method:'POST',token:editor,body:{locale:['page','programme','partner'].includes(name)?'fr':undefined}});
    check(`Éditeur : publication interdite ${name}`,response.status,403);
  }
  check('Éditeur : modification des dates interdite',(await call(cm('campaign',campaign),{method:'PUT',token:editor,body:{opensAt:'2030-01-01T00:00:00Z'}})).status,403);
  check('Éditeur : ouverture interdite',(await call(cm('campaign',campaign),{method:'PUT',token:editor,body:{state:'open'}})).status,403);
  check('Éditeur : confirmation partenaire interdite',(await call(cm('partner',partner),{method:'PUT',token:editor,body:{locale:'fr',confirmationStatus:'confirmed'}})).status,403);
  check('Préparation du brouillon de page incomplet',(await call(cm('page',page),{method:'PUT',token:editor,body:{locale:'fr',sections:[],seo:null}})).status,200);
  check('Publieur : page incomplète refusée',(await call(`${cm('page',page)}/actions/publish`,{method:'POST',token:publisher,body:{locale:'fr'}})).status,400);
  check('Partenaire non confirmé refusé',(await call(`${cm('partner',unconfirmedPartner)}/actions/publish`,{method:'POST',token:publisher,body:{locale:'fr'}})).status,400);
  check('Ressource sans fichier refusée',(await call(`${cm('resource',resource)}/actions/publish`,{method:'POST',token:publisher,body:{}})).status,400);
  check('Aucun faux téléchargement publié',(await call(`/api/resources/${resource}`,{token:read})).status,404);
  for(const locale of ['fr','en']){
    const pageData={locale,title:locale==='fr'?'Accueil fictif du pilote':'Fictional pilot home',slug:`pilot-home-${locale}`,seo:seo(locale),sections:[{__component:'content.hero',title:locale==='fr'?'Bienvenue — démonstration':'Welcome — demonstration',intro:locale==='fr'?'Exemple sans contenu client.':'Example without client data.'},{__component:'content.rich-text',heading:'Démonstration / Demonstration',body:blocks('Fictional text / Texte fictif')},{__component:'content.card-grid',title:'Services fictifs / Fictional services',items:[{title:'Exemple / Example',description:'Démonstration / Demonstration'}]},{__component:'content.cta',title:'Contact',label:'Contact',path:`/${locale}/contact`}]};
    check(`Sauvegarde des blocs de page ${locale}`,(await call(cm('page',page),{method:'PUT',token:editor,body:pageData})).status,200);
    check(`Publication de page ${locale}`,(await call(`${cm('page',page)}/actions/publish`,{method:'POST',token:publisher,body:{locale}})).status,200);
    const pageRead=await call(`/api/pages/${page}?locale=${locale}&populate=*`,{token:read});
    check(`Lecture des blocs publiés ${locale}`,pageRead.status,200);
    check(`Quatre blocs publiés ${locale}`,pageRead.data.data.sections.length,4);
    check(`Titre SEO dérivé ${locale}`,pageRead.data.data.seo.title,pageData.title);
    check(`Description SEO dérivée ${locale}`,pageRead.data.data.seo.description,pageRead.data.data.summary||'Fictional text / Texte fictif');
    const programmeData={locale,title:locale==='fr'?'Fellowship — exemple fictif':'Fellowship — fictional example',slug:`pilot-fellowship-${locale}`,objective:'Objectif fictif / Fictional objective',audience:'Public fictif / Fictional audience',body:blocks('Programme fictif sans campagne réelle / Fictional programme without a real campaign'),seo:seo(locale)};
    check(`Sauvegarde du programme ${locale}`,(await call(cm('programme',programme),{method:'PUT',token:editor,body:programmeData})).status,200);
    if(locale==='fr'){
      check('Ajout d’un partenaire non confirmé au brouillon',(await call(cm('programme',programme),{method:'PUT',token:editor,body:{locale,partners:{set:[{documentId:unconfirmedPartner,locale}]}}})).status,200);
      check('Programme lié à un partenaire non confirmé refusé',(await call(`${cm('programme',programme)}/actions/publish`,{method:'POST',token:publisher,body:{locale}})).status,400);
    }
    check(`Confirmation du partenaire ${locale}`,(await call(cm('partner',partner),{method:'PUT',token:publisher,body:{locale,key:'pilot-fictional-partner',name:locale==='fr'?'Partenaire fictif — démonstration':'Fictional partner — demonstration',confirmationStatus:'confirmed',website:'https://example.org'}})).status,200);
    check(`Publication du partenaire confirmé ${locale}`,(await call(`${cm('partner',partner)}/actions/publish`,{method:'POST',token:publisher,body:{locale}})).status,200);
    check(`Relation au partenaire confirmé ${locale}`,(await call(cm('programme',programme),{method:'PUT',token:editor,body:{locale,partners:{set:[{documentId:partner,locale}]}}})).status,200);
    check(`Publication du programme ${locale}`,(await call(`${cm('programme',programme)}/actions/publish`,{method:'POST',token:publisher,body:{locale}})).status,200);
    const readProgramme=await call(`/api/programmes/${programme}?locale=${locale}&populate[partners][status]=draft`,{token:read});
    check(`Lecture du programme ${locale}`,readProgramme.status,200);
    check(`Identité du programme ${locale}`,readProgramme.data.data.documentId,programme);
    check(`Relations arbitraires non exposées ${locale}`,Object.hasOwn(readProgramme.data.data,'partners'),false);
  }
  check('Création d’une identité programme en doublon refusée',(await call(cm('programme'),{method:'POST',token:editor,body:{locale:'fr',key:'fellowship',title:'Doublon fictif'}})).status,400);
  check('Identité métier du programme immuable',(await call(cm('programme',programme),{method:'PUT',token:editor,body:{locale:'fr',key:'agir-ia'}})).status,400);
  const parallelKey=`pilot-concurrency-${Date.now()}`;
  const competing=await Promise.all([1,2].map(()=>call(cm('partner'),{method:'POST',token:editor,body:{locale:'fr',key:parallelKey,name:'Contrôle temporaire d’unicité'}})));
  try{check('Deux créations concurrentes : une seule identité créée',JSON.stringify(competing.map(response=>response.status).sort()),'[201,400]');}
  finally{for(const response of competing.filter(response=>response.status===201))check('Suppression du partenaire temporaire de concurrence',(await call(cm('partner',response.data.data.documentId),{method:'DELETE',token:admin})).status,200);}
  check('Campagne fermée : relation au programme',(await call(cm('campaign',campaign),{method:'PUT',token:publisher,body:{state:'closed',opensAt:null,closesAt:null,programme:{connect:[{documentId:programme,locale:'fr'}]}}})).status,200);
  check('Publication de campagne fermée',(await call(`${cm('campaign',campaign)}/actions/publish`,{method:'POST',token:publisher,body:{}})).status,200);
  check('Brouillon de campagne ouverte incomplet conservé',(await call(cm('campaign',campaign),{method:'PUT',token:publisher,body:{state:'open',opensAt:null,closesAt:null}})).status,200);
  check('Ouverture sans circuit de candidature refusée',(await call(`${cm('campaign',campaign)}/actions/publish`,{method:'POST',token:publisher,body:{}})).status,400);
  const campaignRead=await call(`/api/campaigns/${campaign}?populate=*`,{token:read});
  check('La campagne publique reste fermée',campaignRead.data.data.state,'closed');
  check('Aucune route de dépôt active',[404,405].includes((await call(`/api/campaigns/${campaign}/apply`,{method:'POST',body:{}})).status),true);
  check('Dates inversées : brouillon conservé',(await call(cm('campaign',campaign),{method:'PUT',token:publisher,body:{state:'closed',opensAt:'2030-02-01T00:00:00Z',closesAt:'2030-01-01T00:00:00Z'}})).status,200);
  check('Dates inversées : publication refusée',(await call(`${cm('campaign',campaign)}/actions/publish`,{method:'POST',token:publisher,body:{}})).status,400);
  check('Retour du brouillon de campagne à fermé',(await call(cm('campaign',campaign),{method:'PUT',token:publisher,body:{state:'closed',opensAt:null,closesAt:null}})).status,200);
  const single=`/content-manager/single-types/${uid('site-setting')}`;
  check('Paramètres : brouillon FR incomplet possible',(await call(single,{method:'PUT',token:editor,body:{locale:'fr',brandName:'AgroPulse — démonstration',tagline:'Configuration fictive du pilote',navigation:[{label:'Accueil',path:'/fr'}]}})).status,200);
  check('Paramètres : publication sans logo refusée',(await call(`${single}/actions/publish`,{method:'POST',token:publisher,body:{locale:'fr'}})).status,400);
  check('Import public de média désactivé même pour admin',(await call('/upload',{method:'POST',token:admin,body:{}})).status,403);
  check('Import API de média désactivé',(await call('/api/upload',{method:'POST',body:{}})).status,403);
  for(const name of ['pages','programmes','campaigns','resources','partners']){
    check(`API anonyme refusée ${name}`,(await call(`/api/${name}`)).status,403);
    check(`Brouillons refusés au jeton de lecture ${name}`,(await call(`/api/${name}?status=draft`,{token:read})).status,403);
  }
  check('Page : remplacement par lien exécutable sauvegardé comme brouillon',(await call(cm('page',page),{method:'PUT',token:editor,body:{locale:'fr',sections:[{__component:'content.cta',title:'Test refus',label:'Test',path:'javascript:alert(1)'}]}})).status,200);
  check('Page : lien exécutable interdit à la publication',(await call(`${cm('page',page)}/actions/publish`,{method:'POST',token:publisher,body:{locale:'fr'}})).status,400);
  const publicPage=await call(`/api/pages/${page}?locale=fr`,{token:read});
  check('L’échec ne remplace pas la page publique',publicPage.data.data.sections.length,4);
  check('Restauration du brouillon de page depuis la version publiée',(await call(cm('page',page),{method:'PUT',token:editor,body:{locale:'fr',sections:publicPage.data.data.sections.map(({id,...section})=>section)}})).status,200);
  completed=true;
}catch(error){results.push({name:current,result:'FAIL',message:error.message});throw error;}
finally{await fs.writeFile(path.join(pilotRoot,'evidence','content-model-tests.json'),JSON.stringify({executedAt:new Date().toISOString(),completed,environment:'Isolated local fictional content fixtures',results},null,2));}
