import catalogue from '../content-pages.json';
import AppearanceEditor from './AppearanceEditor';
import {normalizeStyles} from '../../domain/style-policy.mjs';
import React, {useEffect, useRef, useState} from 'react';
import {useFetchClient} from '@strapi/strapi/admin';
import {useIntl} from 'react-intl';
import './editor.css';

const types=[['api::page.page','Pages du site','Website pages'],['api::expertise.expertise','Pôles d’expertise','Expertise areas'],['api::programme.programme','Initiatives','Initiatives']];
const pageKeys={expertises:'expertises',home:'accueil',about:'a-propos',contact:'contact',legal:'mentions-legales',privacy:'confidentialite',resources:'ressources',partners:'partenaires'};
const slugOf=entry=>entry.uid==='api::page.page'?pageKeys[entry.key]:entry.uid==='api::expertise.expertise'?/^0[1-8]$/.test(entry.code)?'pole-'+Number(entry.code):null:entry.key;
const emptyCopy=()=>({hero:{},sections:{}});
export default function VisualEditor(){
 const {locale:uiLocale}=useIntl(),t=(fr,en)=>uiLocale.startsWith('en')?en:fr;
 const {get,put,post}=useFetchClient();
 const frame=useRef(null),pending=useRef(false);
 const [entries,setEntries]=useState([]),[chosen,setChosen]=useState(''),[document,setDocument]=useState(null),[language,setLanguage]=useState('fr');
 const [reference,setReference]=useState(null),[copy,setCopy]=useState(emptyCopy),[layout,setLayout]=useState({}),[active,setActive]=useState({section:'hero',card:null});
 const [busy,setBusy]=useState(false),[dirty,setDirty]=useState(false),[status,setStatus]=useState(''),[mobile,setMobile]=useState(false);
 let styleError='';try{normalizeStyles(layout.styles||{});}catch(error){styleError=error.message;}
 const setStyles=styles=>{setLayout(previous=>({...previous,styles}));setDirty(true);};
 const site=new URL(import.meta.env.VITE_AGROPULSE_SITE_URL||'http://127.0.0.1:4173');
 const entry=entries.find(item=>item.option===chosen),slug=entry?slugOf(entry):null;
 const previewUrl=slug?new URL('?'+new URLSearchParams({lang:language,editor:'1'})+'#p-'+slug,site).href:'';
 const publishUrl=entry?'/admin/content-manager/collection-types/'+entry.uid+'/'+entry.documentId+'?plugins[i18n][locale]='+language:'#';
 const message=data=>frame.current?.contentWindow?.postMessage({channel:'agropulse-editor',...data},site.origin);
 useEffect(()=>{
  let live=true;
  (async()=>{
   setStatus(t('Chargement de vos contenus…','Loading your content…'));
   const lists=await Promise.all(types.map(async([uid])=>{
    try{const responses=await Promise.all([language,language==='fr'?'en':'fr'].map(locale=>get('/content-manager/collection-types/'+uid,{params:{locale,pageSize:100}})));return responses.flatMap((response,index)=>(response.data.results||response.data.data?.results||[]).map(item=>({...item,uid,otherLanguage:index===1,option:uid+':'+item.documentId})));}catch{return[];}
   }));
   if(!live)return;const available=catalogue.map(template=>{const matching=lists.flat().filter(item=>slugOf(item)===template.slug);const existing=matching.find(item=>!item.otherLanguage);return existing?{...existing,catalogueTitle:template.title}:{...template,translationDocumentId:matching[0]?.documentId,option:template.uid+':new:'+template.slug,catalogueTitle:template.title};});setEntries(available);setStatus(available.length?'':t('Aucun contenu disponible dans cette langue. Créez ou traduisez une fiche dans Contenus.','No content is available in this language. Create or translate an entry in Content.'));
  })();return()=>{live=false;};
 },[language]);
 useEffect(()=>{
  let live=true;if(!entry?.documentId){setDocument(null);setReference(null);setCopy(emptyCopy());setLayout({});setActive({section:'hero',card:null});setDirty(false);setBusy(false);return;}
  setBusy(true);setReference(null);
  (async()=>{try{
   const response=await get('/content-manager/collection-types/'+entry.uid+'/'+entry.documentId,{params:{locale:language}});
   if(!live)return;const value=response.data.data;setDocument(value);setCopy({...value.siteText,hero:{...value.siteText?.hero,title:value.heroTitle||value.title||'',intro:value.summary||value.objective||''},sections:value.siteText?.sections||{}});setLayout(value.siteLayout||{});setActive({section:'hero',card:null});setDirty(false);
  }catch{if(live)setStatus(t('Cette fiche n’est pas accessible avec vos droits.','This entry is not accessible with your permissions.'));}finally{if(live)setBusy(false);}})();
  return()=>{live=false;};
 },[chosen,language]);
 useEffect(()=>{
  const receive=event=>{
   if(event.source!==frame.current?.contentWindow||event.origin!==site.origin||event.data?.channel!=='agropulse-editor')return;
   const data=event.data;
   if(data.type==='reference'&&data.reference?.page===slug&&data.reference?.locale===language)setReference(data.reference);
   if(data.type==='layout'){setLayout(data.layout||{});setDirty(true);setStatus(t('Disposition modifiée dans le brouillon.','Layout changed in the draft.'));}
   if(data.type==='select')setActive({section:data.section,card:data.card});
  };window.addEventListener('message',receive);return()=>window.removeEventListener('message',receive);
 },[slug,language,site.origin]);
 useEffect(()=>{if(!reference||!entry)return;const timer=setTimeout(()=>message({type:'draft',page:slug,locale:language,copy,layout}),120);return()=>clearTimeout(timer);},[reference,document,copy,layout,slug,language]);
 useEffect(()=>{if(reference)message({type:'focus',section:active.section,card:active.card});},[active,reference]);
 useEffect(()=>{const guard=event=>{if(dirty){event.preventDefault();event.returnValue='';}};window.addEventListener('beforeunload',guard);return()=>window.removeEventListener('beforeunload',guard);},[dirty]);
 useEffect(()=>{if(entry&&!reference)message({type:'hello'});},[entry,reference,previewUrl]);
 useEffect(()=>{
  let cancelled=false;
  if(!entry||!slug||reference)return()=>{};
  const timer=setTimeout(async()=>{
   try{
    const response=await fetch(new URL('/api/editor-reference?'+new URLSearchParams({page:slug,locale:language}),site).href,{cache:'no-store'});
    if(!response.ok)throw new Error('reference unavailable');
    const data=await response.json();
    if(!cancelled&&data?.page===slug&&data?.locale===language)setReference(data);
   }catch{
    if(!cancelled)setStatus(t('Impossible de charger les sections de cette page. Rechargez le site public puis réessayez.','Unable to load this page sections. Reload the public site and try again.'));
   }
  },900);
  return()=>{cancelled=true;clearTimeout(timer);};
 },[entry,slug,language,reference,site.origin]);
 const edit=(field,value)=>{setCopy(previous=>{
  const next=structuredClone(previous||emptyCopy());
  if(active.section==='hero'){next.hero||={};next.hero[field]=value;}
  else{next.sections||={};next.sections[active.section]||={};const section=next.sections[active.section];if(active.card===null)section[field]=value;else{const original=reference.sections.find(item=>item.id===active.section);section.groups||=original.groups.map(()=>({}));section.groups[active.card]||={};section.groups[active.card][field]=value;}}
  return next;
 });setDirty(true);};
 const selectedReference=active.section==='hero'?reference?.hero:active.card===null?reference?.sections.find(item=>item.id===active.section):reference?.sections.find(item=>item.id===active.section)?.groups?.[active.card];
 const selectedCopy=active.section==='hero'?copy.hero:active.card===null?copy.sections?.[active.section]:copy.sections?.[active.section]?.groups?.[active.card];
 const value=field=>selectedCopy?.[field]??selectedReference?.[field]??'';
 const choose=next=>{if(dirty&&!window.confirm(t('Quitter sans enregistrer les modifications ?','Leave without saving your changes?')))return;setChosen(next);setDirty(false);setStatus('');};
 const changeLanguage=next=>{if(dirty&&!window.confirm(t('Changer de langue sans enregistrer ?','Change language without saving?')))return;setEntries([]);setLanguage(next);setChosen('');setDirty(false);setStatus('');};
 const orderedSections=reference?(()=>{
  const byId=new Map(reference.sections.map(section=>[section.id,section]));
  const result=[];
  for(const id of layout.sections||[]){const section=byId.get(id);if(section){result.push(section);byId.delete(id);}}
  return result.concat([...byId.values()]);
 })():[];
 const moveSectionFromPanel=(sectionId,direction)=>{
  if(!reference)return;
  const base=reference.sections.map(section=>section.id);
  const current=(layout.sections||[]).filter(id=>base.includes(id));
  const order=[...current,...base.filter(id=>!current.includes(id))];
  const index=order.indexOf(sectionId),next=index+direction;
  if(index<0||next<0||next>=order.length)return;
  [order[index],order[next]]=[order[next],order[index]];
  const nextLayout={...layout,sections:order};
  setLayout(nextLayout);
  setDirty(true);
  setStatus(t('Section déplacée. Enregistrez le brouillon pour conserver ce nouvel ordre.','Section moved. Save the draft to keep this new order.'));
  message({type:'draft',page:slug,locale:language,copy,layout:nextLayout});
 };
 async function publish(){
  if(!entry?.documentId||dirty||pending.current||busy)return;
  if(!window.confirm(t('Publier maintenant cette version sur le site ?','Publish this version on the website now?')))return;
  pending.current=true;setBusy(true);setStatus(t('Publication en cours…','Publishing…'));
  try{
   const response=await post('/content-manager/collection-types/'+entry.uid+'/'+entry.documentId+'/actions/publish?locale='+encodeURIComponent(language),{});
   if(response?.data?.data)setDocument(response.data.data);
   setStatus(t('Publié sur le site. Les visiteurs voient maintenant cette version.','Published on the website. Visitors now see this version.'));
  }catch(error){
   const message=error?.response?.data?.error?.message;
   setStatus(message||t('La publication a échoué. Le brouillon reste enregistré.','Publishing failed. The draft remains saved.'));
  }finally{pending.current=false;setBusy(false);}
 }
 async function save(){
  if(!entry||!reference||pending.current||styleError)return;pending.current=true;setBusy(true);setStatus(t('Enregistrement du brouillon…','Saving the draft…'));
  if(!document){
   try{
    const snapshot={title:reference.title,hero:{...reference.hero,...copy.hero},sections:Object.fromEntries(reference.sections.map(section=>[section.id,{title:section.title,kicker:section.kicker,lead:section.lead,...copy.sections?.[section.id],groups:section.groups.map((group,index)=>({...group,...copy.sections?.[section.id]?.groups?.[index]}))}]))};
    const paragraphs=reference.sections.flatMap(section=>[section.title,section.lead,...section.groups.flatMap(group=>[group.title,group.text])]).filter(Boolean);
    const blocks=paragraphs.map(text=>({type:'paragraph',children:[{type:'text',text}]}));
    const body={locale:language,title:reference.title,slug:slug+'-'+language,siteText:snapshot,siteLayout:layout};
    if(entry.uid==='api::page.page')Object.assign(body,{key:entry.key,heroTitle:snapshot.hero.title,summary:snapshot.hero.intro||reference.title,mainContent:blocks});
    else if(entry.uid==='api::expertise.expertise')Object.assign(body,{code:entry.code,title:snapshot.hero.title,summary:snapshot.hero.intro||reference.title,body:paragraphs.join('\n\n')});
    else Object.assign(body,{key:entry.key,title:snapshot.hero.title,objective:snapshot.hero.intro||reference.title,audience:reference.sections.find(section=>section.id==='publics')?.groups.map(group=>group.title).join(', ')||t('Public présenté sur la page du programme','Audience described on the programme page'),body:blocks});
    const response=entry.translationDocumentId?await put('/content-manager/collection-types/'+entry.uid+'/'+entry.translationDocumentId,body):await post('/content-manager/collection-types/'+entry.uid,body);
    const created=response.data.data;const option=entry.uid+':'+created.documentId;
    setEntries(previous=>previous.map(item=>item.option===chosen?{...item,...created,uid:entry.uid,option}:item));setChosen(option);setDocument(created);setCopy(snapshot);setDirty(false);setStatus(t('Brouillon préparé à partir du site. Vous pouvez le modifier avant publication.','Draft prepared from the website. You can edit it before publishing.'));
   }catch{setStatus(t('Le brouillon n’a pas été créé. Vérifiez vos droits ou ouvrez la fiche dans Contenus.','The draft could not be created. Check your permissions or open the entry in Content.'));}
   finally{pending.current=false;setBusy(false);}
   return;
  }
  const body={locale:language,siteText:copy,siteLayout:layout};
  if(copy.hero?.title!==undefined){if(entry.uid==='api::page.page')body.heroTitle=copy.hero.title;else body.title=copy.hero.title;}
  if(copy.hero?.intro!==undefined)body[entry.uid==='api::programme.programme'?'objective':'summary']=copy.hero.intro;
  try{const response=await put('/content-manager/collection-types/'+entry.uid+'/'+entry.documentId,body);setDocument(response.data.data);setDirty(false);setStatus(t('Brouillon enregistré. La version publique n’a pas changé.','Draft saved. The public version has not changed.'));}
  catch{setStatus(t('Le brouillon n’a pas été enregistré. Vérifiez vos droits et les champs saisis. Vos modifications sont conservées dans cet écran.','The draft was not saved. Check your permissions and entries. Your changes remain in this screen.'));}
  finally{pending.current=false;setBusy(false);}
 }
 return <main className="agp-editor">
  <header className="agp-heading"><div><p className="agp-eyebrow">AGROPULSE · {t('VOTRE ESPACE ÉDITORIAL','YOUR EDITORIAL SPACE')}</p><h1>{t('Votre site, simplement.','Your website, made simple.')}</h1><p>{t('Choisissez une page, modifiez-la dans l’aperçu, enregistrez puis publiez quand vous êtes prêt.','Choose a page, edit it in the preview, save, then publish when you are ready.')}</p></div><span className="agp-badge">{t('Vous décidez quand publier','You choose when to publish')}</span></header>
  <section className="agp-toolbar" aria-label={t('Choix du contenu','Content selection')}>
   <label>{t('Page à modifier','Page to edit')}<select value={chosen} onChange={event=>choose(event.target.value)}><option value="">{t('Choisir une page…','Choose a page…')}</option>{types.map(([uid,fr,en])=><optgroup key={uid} label={t(fr,en)}>{entries.filter(item=>item.uid===uid).map(item=><option key={item.option} value={item.option}>{item.catalogueTitle?t(item.catalogueTitle.fr,item.catalogueTitle.en):(item.title||item.code||item.key)}{!item.documentId?t(' · à préparer',' · prepare draft'):''}</option>)}</optgroup>)}</select></label>
   <label>{t('Langue du contenu','Content language')}<select value={language} onChange={event=>changeLanguage(event.target.value)}><option value="fr">Français</option><option value="en">English</option></select></label>
   <div className="agp-actions"><button className="agp-secondary" disabled={!entry||busy} onClick={()=>setMobile(!mobile)}>{mobile?t('Vue ordinateur','Desktop view'):t('Vue mobile','Mobile view')}</button><button className="agp-primary" disabled={!reference||busy||!!styleError||(!dirty&&!!document)} onClick={save}>{busy?t('En cours…','Working…'):!document?t('Créer le brouillon','Create draft'):t('Enregistrer le brouillon','Save draft')}</button><button className="agp-primary" disabled={!document||dirty||busy||!!styleError} onClick={publish}>{t('Publier sur le site','Publish on website')}</button>{entry?.documentId&&<a className="agp-link" href={publishUrl}>{t('Options avancées','Advanced options')}</a>}</div>
  </section>
  <p className="agp-status" role="status" aria-live="polite">{status||(!reference&&entry?t('Chargement des sections de la page…','Loading page sections…'):!dirty?t('Vos changements restent privés jusqu’à leur publication par le rôle autorisé.','Your changes stay private until published by an authorised role.'):t('Modifications non enregistrées','Unsaved changes'))}</p>
  {!entry?<section className="agp-empty"><div className="agp-empty-symbol" aria-hidden="true">↗</div><h2>{t('Commencez par choisir une page','Start by choosing a page')}</h2><p>{t('1. Choisissez une page. 2. Modifiez-la dans l’aperçu. 3. Enregistrez. 4. Publiez quand tout est prêt.','1. Choose a page. 2. Edit it in the preview. 3. Save. 4. Publish when everything is ready.')}</p></section>:<div className="agp-workspace">
   <aside className="agp-panel"><h2>{t('Le contenu de la page','Page content')}</h2>{reference&&<AppearanceEditor value={layout.styles||{}} onChange={setStyles} error={styleError} t={t}/>}<nav aria-label={t('Sections à modifier','Sections to edit')}><button aria-current={active.section==='hero'?'true':undefined} onClick={()=>setActive({section:'hero',card:null})}>{t('Présentation en haut de page','Top-of-page introduction')}</button>{orderedSections.map(section=><div key={section.id} className="agp-section-row"><button aria-current={active.section===section.id?'true':undefined} onClick={()=>setActive({section:section.id,card:null})}>{section.title||t('Section sans titre','Untitled section')}</button><div className="agp-section-move"><button type="button" title={t('Monter cette section','Move section up')} aria-label={t('Monter cette section','Move section up')} onClick={()=>moveSectionFromPanel(section.id,-1)}>↑</button><button type="button" title={t('Descendre cette section','Move section down')} aria-label={t('Descendre cette section','Move section down')} onClick={()=>moveSectionFromPanel(section.id,1)}>↓</button></div></div>)}</nav>
    {reference&&<div className="agp-fields"><h3>{active.card===null?t('Textes de la section','Section text'):t('Texte de la carte','Card text')}</h3><label>{t('Titre','Heading')}<input value={value('title')} maxLength={500} onChange={event=>edit('title',event.target.value)}/></label><label>{active.section==='hero'?t('Introduction','Introduction'):t('Description','Description')}<textarea rows={7} value={value(active.section==='hero'?'intro':active.card===null?'lead':'text')} onChange={event=>edit(active.section==='hero'?'intro':active.card===null?'lead':'text',event.target.value)}/></label><p className="agp-help">{t('Les poignées dans l’aperçu permettent de déplacer les éléments. Les flèches offrent la même action au clavier.','Use handles in the preview to move elements. Arrow buttons provide the same action by keyboard.')}</p><button className="agp-secondary" onClick={()=>{if(window.confirm(t('Rétablir la disposition d’origine ? Les textes seront conservés.','Restore the original layout? Text will be kept.'))){setLayout(previous=>previous.styles?{styles:previous.styles}:{});setDirty(true);}}}>{t('Rétablir la disposition','Restore original layout')}</button></div>}

   </aside><section className={'agp-preview '+(mobile?'agp-mobile':'')} aria-label={t('Aperçu du brouillon','Draft preview')}><iframe key={previewUrl} ref={frame} src={previewUrl} title={t('Aperçu modifiable du site AgroPulse','Editable AgroPulse website preview')} onLoad={()=>message({type:'hello'})}/>{!reference&&<p className="agp-preview-help">{t('L’aperçu se connecte au site. Si cet écran reste vide, vérifiez que le serveur de prévisualisation est démarré.','The preview is connecting to the website. If it remains empty, check that the preview server is running.')}</p>}</section>
  </div>}
 </main>;
}
