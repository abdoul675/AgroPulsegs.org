// Explicit runtime translation of the reviewed design; never load it as a Strapi schema.
import fs from 'node:fs/promises';
import path from 'node:path';
import {isDeepStrictEqual} from 'node:util';
import {pilotRoot} from './runtime.mjs';
const root=path.join(pilotRoot,'cms','src');
const translated=(field,localized=true)=>({...field,pluginOptions:{i18n:{localized}}});
const string=(localized=true)=>translated({type:'string'},localized);
const text=(localized=true)=>translated({type:'text'},localized);
const enumeration=(values,localized=false,extra={})=>translated({type:'enumeration',enum:values,...extra},localized);
const component=(name,repeatable=false,localized=true)=>translated({type:'component',component:name,repeatable},localized);
const relation=(target,kind,extra={})=>({type:'relation',relation:kind,target:`api::${target}.${target}`,...extra});
const slug=()=>translated({type:'uid',targetField:'title'});
const key=()=>translated({type:'uid'},false);
const image=()=>({type:'media',multiple:false,allowedTypes:['images']});
const components={
  'shared.seo':{title:{type:'string'},description:{type:'text'}},
  'shared.navigation-item':{label:{type:'string'},path:{type:'string'}},
  'shared.public-contact':{email:{type:'email'},phone:{type:'string'},address:{type:'text'}},
  'shared.social-link':{network:{type:'enumeration',enum:['linkedin','facebook','instagram','youtube']},url:{type:'string'}},
  'shared.localized-text':{fr:{type:'text'},en:{type:'text'}},
  'shared.visual':{media:image(),alt:{type:'string'},caption:{type:'text'},kind:{type:'enumeration',enum:['illustration','photo']},rightsConfirmed:{type:'boolean',default:false}},
  'shared.service-item':{title:{type:'string'},description:{type:'text'}},
  'content.hero':{title:{type:'string'},intro:{type:'text'},visual:{type:'component',component:'shared.visual',repeatable:false}},
  'content.rich-text':{heading:{type:'string'},body:{type:'blocks'}},
  'content.card-grid':{title:{type:'string'},items:{type:'component',component:'shared.service-item',repeatable:true}},
  'content.cta':{title:{type:'string'},description:{type:'text'},label:{type:'string'},path:{type:'string'}}
};
const models={
  'site-setting':{kind:'singleType',plural:'site-settings',display:'Paramètres du site',localized:true,attributes:{brandName:string(false),tagline:string(),logo:translated(image(),false),navigation:component('shared.navigation-item',true),publicContact:component('shared.public-contact',false,false),socialLinks:component('shared.social-link',true,false)}},
  page:{plural:'pages',display:'Page institutionnelle',localized:true,attributes:{key:enumeration(['home','about','contact','legal','privacy']),slug:slug(),title:string(),summary:text(),heroTitle:string(),mainContent:translated({type:'blocks'}),sections:translated({type:'dynamiczone',components:['content.hero','content.rich-text','content.card-grid','content.cta']}),seo:component('shared.seo')}},
  programme:{plural:'programmes',display:'Programme',localized:true,attributes:{key:enumeration(['fellowship','agir-ia']),slug:slug(),title:string(),objective:text(),audience:text(),durationDescription:text(),body:translated({type:'blocks'}),visual:component('shared.visual'),seo:component('shared.seo'),expertise:relation('expertise','manyToOne',{inversedBy:'programmes'}),campaigns:relation('campaign','oneToMany',{mappedBy:'programme'}),partners:relation('partner','manyToMany',{inversedBy:'programmes'})}},
  campaign:{plural:'campaigns',display:'Campagne — fermée par défaut',localized:false,attributes:{key:key(),state:enumeration(['closed','open'],false,{default:'closed'}),opensAt:{type:'datetime'},closesAt:{type:'datetime'},criteria:component('shared.localized-text',false,false),notice:component('shared.localized-text',false,false),applicationRoute:enumeration(['fellowship-v1']),programme:relation('programme','manyToOne',{inversedBy:'campaigns'})}},
  resource:{plural:'resources',display:'Ressource documentaire',localized:false,attributes:{key:key(),language:enumeration(['fr','en']),title:string(false),description:text(false),file:{type:'media',multiple:false,allowedTypes:['files']},format:{type:'string',configurable:false,writable:false},sizeBytes:{type:'biginteger',configurable:false,writable:false},releaseVersion:string(false),programme:relation('programme','manyToOne'),expertise:relation('expertise','manyToOne')}},
  partner:{plural:'partners',display:'Partenaire',localized:true,attributes:{key:translated({type:'string',regex:'^[a-z0-9]+(?:-[a-z0-9]+)*$'},false),name:string(),description:text(),confirmationStatus:enumeration(['unconfirmed','confirmed'],false,{default:'unconfirmed'}),logo:translated(image(),false),website:string(false),programmes:relation('programme','manyToMany',{mappedBy:'partners'})}}
};
async function write(relative,value){const target=path.join(root,relative);const data=typeof value==='string'?value:JSON.stringify(value,null,2)+'\n';await fs.mkdir(path.dirname(target),{recursive:true});try{const current=await fs.readFile(target,'utf8');if(current===data||(typeof value!=='string'&&isDeepStrictEqual(JSON.parse(current),value)))return;throw new Error(`Refusing to overwrite an existing different file: ${relative}`);}catch(error){if(error.code!=='ENOENT')throw error;}await fs.writeFile(target,data,{flag:'wx'});}
for(const [uid,attributes] of Object.entries(components)){const [category,name]=uid.split('.');await write(`components/${category}/${name}.json`,{collectionName:`agropulse_${category.replaceAll('-','_')}_${name.replaceAll('-','_')}`,info:{displayName:name},attributes});}
for(const [name,model] of Object.entries(models)){
  await write(`api/${name}/content-types/${name}/schema.json`,{kind:model.kind||'collectionType',collectionName:`agropulse_${model.plural.replaceAll('-','_')}`,info:{singularName:name==='site-setting'?'site-setting':name,pluralName:model.plural,displayName:model.display},options:{draftAndPublish:true},pluginOptions:{i18n:{localized:model.localized}},attributes:model.attributes});
  const uid=`api::${name}.${name}`;
  await write(`api/${name}/routes/${name}.js`,`'use strict';\nmodule.exports=require('@strapi/strapi').factories.createCoreRouter('${uid}',{only:${JSON.stringify(model.kind==='singleType'?['find']:['find','findOne'])}});\n`);
  await write(`api/${name}/services/${name}.js`,`'use strict';\nmodule.exports=require('@strapi/strapi').factories.createCoreService('${uid}');\n`);
  await write(`api/${name}/controllers/${name}.js`,`'use strict';\nmodule.exports=require('../../../domain/published-controller')('${uid}');\n`);
}
const expertisePath=path.join(root,'api/expertise/content-types/expertise/schema.json');
const expertise=JSON.parse(await fs.readFile(expertisePath,'utf8'));
const wanted=relation('programme','oneToMany',{mappedBy:'expertise'});
if(expertise.attributes.programmes&&JSON.stringify(expertise.attributes.programmes)!==JSON.stringify(wanted))throw new Error('Existing expertise relation differs; review before changing.');
expertise.attributes.programmes=wanted;await fs.writeFile(expertisePath,JSON.stringify(expertise,null,2)+'\n');
console.log('Six content schemas, eleven components and reciprocal relations prepared.');
