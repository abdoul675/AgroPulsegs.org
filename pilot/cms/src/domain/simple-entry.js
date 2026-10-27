'use strict';
const pageUid='api::page.page';
const populate={seo:true,sections:{on:{'content.hero':{populate:{visual:{populate:{media:true}}}},'content.rich-text':{fields:['heading','body']},'content.card-grid':{populate:{items:true}},'content.cta':{fields:['title','description','label','path']}}}};
const plain=blocks=>(blocks||[]).map(block=>(block.children||[]).map(child=>child.text||'').join('')).join(' ').trim();
async function prepare(strapi,context){
  if(!['create','update'].includes(context.action)||!['api::page.page','api::programme.programme'].includes(context.uid))return;
  const p=context.params;const data=p.data||{};
  const existing=p.documentId?await strapi.documents(context.uid).findOne({documentId:p.documentId,status:'draft',locale:p.locale||'fr',populate:context.uid===pageUid?populate:{seo:true}}):null;
  if(context.uid===pageUid){
    const quickChanged=['heroTitle','mainContent','summary'].some(field=>Object.hasOwn(data,field)&&JSON.stringify(data[field])!==JSON.stringify(existing?.[field]));
    if(Object.hasOwn(data,'sections')&&!quickChanged){
      data.heroTitle=(data.sections||[]).find(section=>section.__component==='content.hero')?.title||'';
      data.mainContent=(data.sections||[]).find(section=>section.__component==='content.rich-text')?.body||[];
    }else if(quickChanged){
      const sections=structuredClone(existing?.sections||[]);
      let hero=sections.find(section=>section.__component==='content.hero');
      if(!hero){hero={__component:'content.hero',title:data.heroTitle||data.title||existing?.title||''};sections.unshift(hero);}
      if(Object.hasOwn(data,'heroTitle'))hero.title=data.heroTitle;
      if(Object.hasOwn(data,'summary'))hero.intro=data.summary;
      if(Object.hasOwn(data,'mainContent')){
        let text=sections.find(section=>section.__component==='content.rich-text');
        if(!text){text={__component:'content.rich-text',heading:''};sections.push(text);}
        text.body=data.mainContent;
      }
      data.sections=sections;
    }
  }
  // Derive search metadata from the editorial text; explicit API metadata is preserved.
  if(!Object.hasOwn(data,'seo')){
    const title=data.title??existing?.title;
    const description=[data.summary,data.objective,existing?.summary,existing?.objective,plain(data.mainContent??data.body??existing?.mainContent??existing?.body)].find(value=>String(value||'').trim());
    if(title&&description)data.seo={...(existing?.seo||{}),title,description:String(description).slice(0,160)};
  }
}
async function backfill(strapi){
  const documents=await strapi.documents(pageUid).findMany({locale:'*',status:'draft',populate});
  for(const doc of documents){
    if(doc.heroTitle!==null&&doc.heroTitle!==undefined&&doc.mainContent!==null&&doc.mainContent!==undefined)continue;
    await strapi.documents(pageUid).update({documentId:doc.documentId,locale:doc.locale,data:{heroTitle:doc.sections?.find(section=>section.__component==='content.hero')?.title||'',mainContent:doc.sections?.find(section=>section.__component==='content.rich-text')?.body||[],sections:doc.sections||[],seo:doc.seo||null}});
  }
}
module.exports={prepare,backfill};
