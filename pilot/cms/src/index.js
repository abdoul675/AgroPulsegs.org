'use strict';
const fs=require('node:fs/promises');
const path=require('node:path');
const {errors:{ValidationError}}=require('@strapi/utils');
const uid='api::expertise.expertise';
const fields=['code','title','slug','summary','body'];
const local=path.resolve(__dirname,'../../.local');
const contentPolicy=require('./domain/content-policy');
module.exports={
  register({strapi}){
    contentPolicy.install(strapi);
    strapi.documents.use(async(context,next)=>{
      if(context.uid===uid&&(context.action==='publish'||(['create','update'].includes(context.action)&&context.params.status==='published'))){
        const p=context.params;
        const locales=p.locale==='*'?['fr','en']:[p.locale||'fr'];
        for(const locale of locales){
          const draft=p.documentId?await strapi.documents(uid).findOne({documentId:p.documentId,locale,status:'draft'}):{};
          const candidate={...draft,...p.data};
          if(['title','slug','summary'].some(key=>!String(candidate[key]||'').trim()))throw new ValidationError('Publication refusée : titre, slug et résumé requis.');
        }
      }
      return next();
    });
  },
  async bootstrap({strapi}){
    if(process.env.HOST!=='127.0.0.1'||process.env.DATABASE_NAME!=='agropulse_pilot')throw new Error('This fixture is restricted to the isolated local pilot.');
    const runtime=JSON.parse(await fs.readFile(path.join(local,'runtime.json'),'utf8'));
    const locales=strapi.plugin('i18n').service('locales');
    for(const [code,name] of [['fr','French (fr)'],['en','English (en)']])if(!await locales.findByCode(code))await locales.create({code,name});
    await locales.setDefaultLocale({code:'fr'});
    await require('./domain/simple-entry').backfill(strapi);
    await require('./domain/editorial-ui').configure(strapi);
    const manager=strapi.plugin('content-manager').service('content-types');
    const mainFields={'site-setting':'brandName',page:'title',programme:'title',campaign:'key',resource:'title',partner:'name'};
    for(const [name,mainField] of Object.entries(mainFields)){
      const model=strapi.contentType(contentPolicy.uidFor(name));
      const config=await manager.findConfiguration(model);
      if(config.settings.mainField!==mainField)await manager.updateConfiguration(model,{...config,settings:{...config.settings,mainField}});
    }
    const roles=strapi.admin.services.role;
    for(const [code,name,publish] of [['agropulse-editor','AgroPulse Éditeur',false],['agropulse-publisher','AgroPulse Publieur',true]]){
      let role=await roles.findOne({code});
      if(!role)role=await roles.create({code,name,description:'Rôle du pilote fictif local'});
      const permissions=['read','create','update',...(publish?['publish']:[])].map(action=>({action:`plugin::content-manager.explorer.${action}`,subject:uid,properties:{fields,locales:['fr','en']},conditions:[]}));
      for(const name of contentPolicy.names){
        const subject=contentPolicy.uidFor(name),spec=contentPolicy.definitions[name];
        const nestedFields=strapi.admin.services['content-type'].getNestedFields(strapi.contentType(subject),{components:strapi.components});
        for(const action of ['read','create','update',...(publish?['publish']:[])]){
          const allowedFields=!publish&&['create','update'].includes(action)?nestedFields.filter(field=>!(spec.restricted||[]).includes(field)):nestedFields;
          permissions.push({action:`plugin::content-manager.explorer.${action}`,subject,properties:{fields:allowedFields,...(strapi.contentType(subject).pluginOptions?.i18n?.localized?{locales:['fr','en']}:{})},conditions:[]});
        }
      }
      await roles.assignPermissions(role.id,permissions);
    }
    for(const [name,roleCode,password] of [['admin','strapi-super-admin',runtime.adminPassword],['editor','agropulse-editor',runtime.editorPassword],['publisher','agropulse-publisher',runtime.publisherPassword]]){
      const email=`${name}@agropulse.test`;
      if(!await strapi.db.query('admin::user').findOne({where:{email}})){
        const role=await roles.findOne({code:roleCode});
        await strapi.admin.services.user.create({email,firstname:'Pilote',lastname:name,isActive:true,blocked:false,password,roles:[role.id],preferedLanguage:'fr'});
      }
      const user=await strapi.db.query('admin::user').findOne({where:{email}});
      if(!user.preferedLanguage)await strapi.db.query('admin::user').update({where:{id:user.id},data:{preferedLanguage:'fr'}});
    }
    const statePath=path.join(local,'fixture.json');let state;
    try{state=JSON.parse(await fs.readFile(statePath,'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;}
    if(!state){
      const doc=await strapi.documents(uid).create({locale:'fr',data:{code:'01',title:'Expertise fictive du pilote',slug:'expertise-fictive-pilote',summary:'Donnée de démonstration uniquement.',body:'Contenu fictif sans référence client.'}});
      await strapi.documents(uid).update({documentId:doc.documentId,locale:'en',data:{title:'Fictional pilot expertise',slug:'fictional-pilot-expertise',summary:'Demonstration data only.',body:'Fictional content without client references.'}});
      state={documentId:doc.documentId};await fs.writeFile(statePath,JSON.stringify(state));
    }
    strapi.pilotFixtureId=state.documentId;
    const contentTokenPath=path.join(local,'content-read-token.json');
    try{await fs.access(contentTokenPath);}catch(error){
      if(error.code!=='ENOENT')throw error;
      const permissions=contentPolicy.names.flatMap(name=>[`${contentPolicy.uidFor(name)}.find`,...(name==='site-setting'?[]:[`${contentPolicy.uidFor(name)}.findOne`])]);
      const created=await strapi.admin.services['api-token'].create({name:'AgroPulse content models local read',description:'Local content model tests; server only',kind:'content-api',type:'custom',lifespan:null,permissions});
      await fs.writeFile(contentTokenPath,JSON.stringify({accessKey:created.accessKey}));
    }
    const tokenPath=path.join(local,'read-token.json');let token;
    try{token=JSON.parse(await fs.readFile(tokenPath,'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;}
    if(!token){
      const created=await strapi.admin.services['api-token'].create({name:'AgroPulse pilot server read',description:'Local Next server only',kind:'content-api',type:'custom',lifespan:null,permissions:[`${uid}.find`,`${uid}.findOne`]});
      token={accessKey:created.accessKey};await fs.writeFile(tokenPath,JSON.stringify(token));
    }
    const env=`CMS_URL=http://127.0.0.1:1338\nCMS_READ_TOKEN=${token.accessKey}\nPILOT_DOCUMENT_ID=${state.documentId}\nPREVIEW_SECRET=${runtime.previewSecret}\nNEXT_TELEMETRY_DISABLED=1\n`;
    await fs.writeFile(path.resolve(__dirname,'../../web/.env.local'),env);
    strapi.log.info('Fictional FR/EN pilot fixture and isolated roles ready. Credentials remain local.');
  }
};
