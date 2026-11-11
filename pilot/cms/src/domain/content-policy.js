'use strict';
const {errors:{ValidationError,ForbiddenError}}=require('@strapi/utils');
const simpleEntry=require('./simple-entry');
const sitePresentation=require('./site-presentation-policy');
const definitions={
  'site-setting':{required:['brandName','tagline','logo','navigation'],fields:['brandName','tagline','locale'],populate:{navigation:true,publicContact:true,socialLinks:true}},
  page:{required:['key','slug','title','heroTitle'],identity:'key',fields:['key','slug','title','heroTitle','summary','mainContent','locale','siteText','siteLayout'],populate:{seo:true,sections:{on:{'content.hero':{fields:['title','intro']},'content.rich-text':{fields:['heading','body']},'content.card-grid':{populate:{items:true}},'content.cta':{fields:['title','description','label','path']}}}}},
  programme:{required:['key','slug','title','objective','audience','body','seo'],identity:'key',fields:['key','slug','title','objective','audience','durationDescription','body','locale','siteText','siteLayout'],populate:{seo:true}},
  campaign:{required:['key','state','notice','programme'],identity:'key',restricted:['state','opensAt','closesAt','applicationRoute'],fields:['key','state','opensAt','closesAt'],populate:{notice:true,criteria:true}},
  resource:{required:['key','language','title','file'],identity:'key',fields:['key','language','title','description','format','sizeBytes','releaseVersion'],populate:{}},
  partner:{required:['key','name','confirmationStatus'],identity:'key',restricted:['confirmationStatus'],fields:['key','name','description','website','confirmationStatus','locale'],populate:{}}
};
const names=Object.keys(definitions);
const uidFor=name=>`api::${name}.${name}`;
const specification=uid=>definitions[uid.split('::')[1]?.split('.')[0]];
const filled=value=>typeof value==='string'?Boolean(value.trim()):Array.isArray(value)?value.length>0:value!==undefined&&value!==null;
const fail=message=>{throw new ValidationError(message);};
function internalPath(value){return typeof value==='string'&&/^\/(?:fr|en)(?:\/[a-z0-9]+(?:[/-][a-z0-9]+)*)?\/?$/.test(value);}
function httpsUrl(value){try{const url=new URL(value);return url.protocol==='https:'&&!url.username&&!url.password;}catch{return false;}}
function validateStructured(value){
  if(!value||typeof value!=='object')return;
  if(Array.isArray(value)){for(const item of value)validateStructured(item);return;}
  if(value.__component==='content.cta'&&(!filled(value.label)||!internalPath(value.path)))fail('Le bouton doit avoir un libellé et une route interne autorisée.');
  if(value.media&&(!filled(value.alt)||!filled(value.caption)||!['illustration','photo'].includes(value.kind)||value.rightsConfirmed!==true))fail('Le visuel requiert alternative, légende, nature et droits confirmés.');
  for(const [key,child] of Object.entries(value)){
    if(key==='url'&&filled(child)&&!httpsUrl(child))fail('Une URL HTTPS est requise.');
    if(key==='type'&&child==='link'&&!httpsUrl(value.url))fail('Lien de texte non autorisé.');
    if(['text','title','description','heading','intro'].includes(key)&&typeof child==='string'&&/<\/?(?:script|iframe|object)\b/i.test(child))fail('Les blocs ne permettent pas de contenu exécutable.');
    validateStructured(child);
  }
}
async function assertIdentity(strapi,uid,documentId,data,field){
  if(!field||!filled(data[field]))return;
  if(documentId){
    const siblings=await strapi.documents(uid).findMany({status:'draft',...(strapi.contentType(uid).pluginOptions?.i18n?.localized?{locale:'*'}:{}),filters:{documentId},fields:[field],limit:10});
    if(siblings.some(sibling=>filled(sibling[field])&&sibling[field]!==data[field]))fail('L’identité métier existante ne peut pas être modifiée.');
  }
  const matches=await strapi.documents(uid).findMany({status:'draft',...(strapi.contentType(uid).pluginOptions?.i18n?.localized?{locale:'*'}:{}),filters:{[field]:data[field]},fields:[field],limit:10});
  if(matches.some(match=>match.documentId!==documentId))fail(`Identité ${field} déjà utilisée par un autre document métier.`);
}
async function assertPublishedRelation(strapi,target,value,locale){
  const values=Array.isArray(value)?value:[value];
  for(const entry of values.filter(Boolean)){
    if(!entry.documentId)fail('Relation invalide.');
    const doc=await strapi.documents(uidFor(target)).findOne({documentId:entry.documentId,status:'published',...(target==='programme'||target==='expertise'||target==='partner'?{locale:locale||'fr'}:{})});
    if(!doc||(target==='partner'&&doc.confirmationStatus!=='confirmed'))fail('La relation doit viser un contenu publié et confirmé dans cette langue.');
  }
}
function install(strapi){
  strapi.documents.use(async(context,next)=>{
    if(['api::page.page','api::expertise.expertise','api::programme.programme'].includes(context.uid)&&['create','update'].includes(context.action))await sitePresentation.validate(context.params?.data||{});
    const spec=specification(context.uid);if(!spec)return next();
    const params=context.params||{};const ctx=strapi.requestContext.get();
    await simpleEntry.prepare(strapi,context);
    const roles=ctx?.state?.user?.roles||[];
    const editorOnly=roles.some(role=>role.code==='agropulse-editor')&&!roles.some(role=>['agropulse-publisher','strapi-super-admin'].includes(role.code));
    if(editorOnly&&['create','update'].includes(context.action)){
      const raw=ctx.request.body?.data||ctx.request.body||{};
      if((spec.restricted||[]).some(field=>Object.hasOwn(raw,field)))throw new ForbiddenError('Ce rôle ne modifie pas les dates, états d’ouverture ou confirmations.');
    }
    if(['create','update'].includes(context.action)){
      const data=params.data||{};
      if(spec.identity&&filled(data[spec.identity]))return strapi.db.transaction(async({trx})=>{
        // Serialize competing identities until the actual document write commits.
        // PostgreSQL and MySQL/MariaDB use different advisory-lock primitives.
        const client=process.env.DATABASE_CLIENT||'sqlite';
        const identity=String(data[spec.identity]);
        let mysqlLockName=null;
        if(client==='postgres'){
          await trx.raw('SELECT pg_advisory_xact_lock(hashtext(?), hashtext(?))',[context.uid,identity]);
        }else if(client==='mysql'){
          const {createHash}=require('node:crypto');
          mysqlLockName='agropulse:'+createHash('sha256').update(context.uid+'|'+identity).digest('hex').slice(0,48);
          const raw=await trx.raw('SELECT GET_LOCK(?, 10) AS acquired',[mysqlLockName]);
          const rows=Array.isArray(raw)?raw[0]:raw;
          const acquired=Array.isArray(rows)?rows[0]?.acquired:rows?.acquired;
          if(Number(acquired)!==1)fail('Impossible de verrouiller temporairement cette identité métier.');
        }
        try{
          await assertIdentity(strapi,context.uid,params.documentId,data,spec.identity);
          if(params.status==='published')fail('Enregistrer le brouillon puis utiliser l’action de publication contrôlée.');
          return await next();
        }finally{
          if(mysqlLockName)await trx.raw('SELECT RELEASE_LOCK(?)',[mysqlLockName]);
        }
      });
    }
    const publishing=context.action==='publish'||(['create','update'].includes(context.action)&&params.status==='published');
    if(!publishing)return next();
    if(context.action!=='publish')fail('Enregistrer le brouillon puis utiliser l’action de publication contrôlée.');
    const localized=strapi.contentType(context.uid).pluginOptions?.i18n?.localized;
    const locales=localized?(params.locale==='*'?['fr','en']:Array.isArray(params.locale)?params.locale:[params.locale||'fr']):[null];
    for(const locale of locales){
      if(localized&&!['fr','en'].includes(locale))fail('Langue non autorisée.');
      const populate=context.uid===uidFor('page')?{seo:true,sections:{on:{'content.hero':{populate:{visual:{populate:{media:true}}}},'content.rich-text':{fields:['heading','body']},'content.card-grid':{populate:{items:true}},'content.cta':{fields:['title','description','label','path']}}}}:context.uid===uidFor('programme')?{seo:true,visual:{populate:{media:true}},expertise:true,partners:true}: '*';
      const doc=await strapi.documents(context.uid).findOne({documentId:params.documentId,status:'draft',...(locale?{locale}:{}),populate});
      if(!doc)fail('Brouillon absent.');
      const missing=spec.required.filter(field=>!filled(doc[field]));if(missing.length)fail(`Publication incomplète : ${missing.join(', ')}.`);
      await assertIdentity(strapi,context.uid,params.documentId,doc,spec.identity);
      await sitePresentation.validate(doc);
      validateStructured(doc);
      if(doc.seo&&(!filled(doc.seo.title)||!filled(doc.seo.description)))fail('Titre et description SEO requis.');
      if(context.uid===uidFor('page')){
        for(const section of doc.sections||[]){
          if(section.__component==='content.hero'&&!filled(section.title))fail('Titre du bloc principal requis.');
          if(section.__component==='content.rich-text'&&!filled(section.body))fail('Texte de section requis.');
          if(section.__component==='content.card-grid'&&(!filled(section.title)||!filled(section.items)||section.items.some(item=>!filled(item.title)||!filled(item.description))))fail('Cartes incomplètes.');
        }
      }
      if(context.uid===uidFor('site-setting')){
        if(doc.navigation.some(item=>!filled(item.label)||!internalPath(item.path)))fail('Navigation interne invalide.');
      }
      if(context.uid===uidFor('partner')){
        if(doc.confirmationStatus!=='confirmed')fail('Un partenaire non confirmé ne peut pas être publié.');
        if(doc.website&&!httpsUrl(doc.website))fail('Adresse partenaire HTTPS requise.');
      }
      if(context.uid===uidFor('programme')){
        await assertPublishedRelation(strapi,'expertise',doc.expertise,locale);
        await assertPublishedRelation(strapi,'partner',doc.partners,locale);
      }
      if(context.uid===uidFor('campaign')){
        if(!filled(doc.notice.fr)||!filled(doc.notice.en))fail('Message de statut FR/EN requis.');
        await assertPublishedRelation(strapi,'programme',doc.programme,'fr');
        await assertPublishedRelation(strapi,'programme',doc.programme,'en');
        if(doc.state==='open')fail('Ouverture désactivée : critères approuvés et circuit de candidature restent à raccorder.');
        if(doc.opensAt&&doc.closesAt&&Date.parse(doc.closesAt)<=Date.parse(doc.opensAt))fail('La date de fin doit être après la date de début.');
      }
      if(context.uid===uidFor('resource'))fail('Publication des fichiers désactivée tant que le circuit de médias publics et les métadonnées réelles ne sont pas vérifiés.');
    }
    return next();
  });
}
module.exports={definitions,names,uidFor,specification,install};
