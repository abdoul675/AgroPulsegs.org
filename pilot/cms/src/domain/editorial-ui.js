'use strict';
const labels={siteText:'Textes du pilotage visuel / Visual editor text',siteLayout:'Disposition du pilotage visuel / Visual editor layout',title:'Titre / Title',slug:'Adresse de la page / Page address',key:'Type ou référence / Type or reference',summary:'Introduction / Introduction',heroTitle:'Grand titre / Main heading',mainContent:'Texte principal / Main text',body:'Contenu / Content',objective:'Objectif / Purpose',audience:'Public concerné / Audience',durationDescription:'Durée présentée / Duration',name:'Nom / Name',description:'Description / Description',website:'Site officiel / Official website',confirmationStatus:'Partenariat confirmé / Partnership confirmation',state:'État des inscriptions / Application status',opensAt:'Ouverture des inscriptions / Opening date',closesAt:'Fermeture des inscriptions / Closing date',criteria:'Conditions FR et EN / FR and EN conditions',notice:'Message affiché FR et EN / FR and EN notice',programme:'Programme associé / Related programme',partners:'Partenaires / Partners',expertise:'Pôle associé / Related expertise',language:'Langue du document / Document language',releaseVersion:'Version du document / Document version',brandName:'Nom de l’organisation / Organisation name',tagline:'Slogan / Tagline',navigation:'Liens du menu / Menu links',publicContact:'Coordonnées publiques / Public contact',socialLinks:'Réseaux sociaux / Social links',logo:'Logo autorisé / Approved logo',file:'Document public / Public document',label:'Texte du lien / Link text',path:'Page de destination / Destination page',email:'Adresse courriel / Email address',phone:'Téléphone / Phone',address:'Adresse publique / Public address',network:'Réseau / Network',url:'Adresse officielle / Official address',fr:'Texte en français / French text',en:'Texte en anglais / English text',media:'Image autorisée / Approved image',alt:'Description de l’image / Image description',caption:'Légende / Caption',kind:'Photo ou illustration / Photo or illustration',rightsConfirmed:'Droits vérifiés / Rights checked',intro:'Introduction / Introduction',heading:'Sous-titre / Subheading',items:'Éléments / Items',code:'Numéro du pôle / Expertise number'};
const hints={key:'Choisir le type de contenu une seule fois. Sa référence reste stable. / Choose the content type once; its reference stays fixed.',slug:'Utiliser des mots courts sans espace. / Use short words without spaces.',heroTitle:'Le grand titre visible en haut de la page. / The heading shown at the top of the page.',mainContent:'Écrire directement le texte. Les cartes et boutons existants sont conservés. / Write the text directly; existing cards and buttons are preserved.',summary:'Une ou deux phrases pour présenter la page. / One or two introductory sentences.',body:'Écrire le contenu du programme, comme dans un traitement de texte. / Write the programme content as in a word processor.',confirmationStatus:'Réservé au responsable de publication. / Managed by the publisher.',file:'Import temporairement désactivé ; ne pas déposer de document confidentiel. / Upload is temporarily disabled; do not upload private files.',logo:'Import des médias encore désactivé. / Media upload is not enabled yet.',state:'Fermé par défaut ; aucune candidature réelle n’est activée. / Closed by default; real applications are not enabled.',publicContact:'Seulement les coordonnées approuvées pour le public. / Only contact details approved for public display.'};
const forms={
 'api::page.page':{main:'title',fields:['title','heroTitle','summary','mainContent','key','slug'],hidden:['sections','seo','siteText','siteLayout']},
 'api::programme.programme':{main:'title',fields:['title','objective','audience','durationDescription','body','key','slug','partners','expertise'],hidden:['seo','campaigns','visual','siteText','siteLayout']},
 'api::expertise.expertise':{main:'title',fields:['title','summary','body','code','slug'],hidden:['programmes','siteText','siteLayout']},
 'api::partner.partner':{main:'name',fields:['name','description','website','key','confirmationStatus'],hidden:['programmes','logo']},
 'api::campaign.campaign':{main:'key',fields:['key','programme','notice','criteria','state','opensAt','closesAt'],hidden:['applicationRoute']},
 'api::resource.resource':{main:'title',fields:['title','language','description','releaseVersion','key','file','programme','expertise'],hidden:['format','sizeBytes']},
 'api::site-setting.site-setting':{main:'brandName',fields:['brandName','tagline','publicContact','navigation','socialLinks','logo'],hidden:[]}
};
async function configure(strapi){
 const manager=strapi.plugin('content-manager').service('content-types');
 for(const [uid,form] of Object.entries(forms)){
  const model=strapi.contentType(uid),config=await manager.findConfiguration(model);
  for(const [field,meta] of Object.entries(config.metadatas)){
   if(labels[field]){meta.edit={...meta.edit,label:labels[field],description:hints[field]||'',visible:!form.hidden.includes(field)};meta.list={...meta.list,label:labels[field]};}
   if(form.hidden.includes(field))meta.edit={...meta.edit,visible:false};
  }
  await manager.updateConfiguration(model,{...config,settings:{...config.settings,mainField:form.main},layouts:{...config.layouts,list:form.fields.filter(field=>['title','name','key','language','confirmationStatus','state','code'].includes(field)).slice(0,4),edit:form.fields.map(name=>[{name,size:12}])}});
 }
 const components=strapi.plugin('content-manager').service('components');
 for(const model of Object.values(strapi.components)){
  const config=await components.findConfiguration(model);
  for(const [field,meta] of Object.entries(config.metadatas||{}))if(labels[field]){meta.edit={...meta.edit,label:labels[field],description:hints[field]||''};meta.list={...meta.list,label:labels[field]};}
  await components.updateConfiguration(model,config);
 }
}
module.exports={configure,forms,labels,hints};
