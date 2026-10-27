'use strict';
const {timingSafeEqual}=require('node:crypto');
module.exports={
  async show(ctx){
    const expected=Buffer.from(process.env.PREVIEW_SECRET||'');
    const supplied=Buffer.from(ctx.get('x-pilot-preview-secret')||'');
    if(!expected.length || expected.length!==supplied.length || !timingSafeEqual(expected,supplied))return ctx.unauthorized();
    const locale=ctx.query.locale;
    if(!['fr','en'].includes(locale))return ctx.badRequest('Unsupported locale.');
    if(ctx.params.documentId!==strapi.pilotFixtureId)return ctx.notFound();
    const entity=await strapi.documents('api::expertise.expertise').findOne({documentId:ctx.params.documentId,locale,status:'draft',fields:['code','title','slug','summary','body']});
    if(!entity)return ctx.notFound();
    ctx.set('Cache-Control','private, no-store');
    ctx.body={data:entity};
  }
};
