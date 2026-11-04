'use strict';
const {createCoreController}=require('@strapi/strapi').factories;
module.exports=createCoreController('api::expertise.expertise',()=>({
  async find(ctx){
    if(ctx.query.status && ctx.query.status!=='published')return ctx.forbidden('Drafts are not available through the published API.');
    ctx.query={...ctx.query,status:'published',fields:['code','title','slug','summary','body','locale','siteText','siteLayout'],populate:undefined};
    return super.find(ctx);
  },
  async findOne(ctx){
    if(ctx.query.status && ctx.query.status!=='published')return ctx.forbidden('Drafts are not available through the published API.');
    ctx.query={...ctx.query,status:'published',fields:['code','title','slug','summary','body','locale','siteText','siteLayout'],populate:undefined};
    return super.findOne(ctx);
  }
}));
