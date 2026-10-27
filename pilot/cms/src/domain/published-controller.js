'use strict';
const {createCoreController}=require('@strapi/strapi').factories;
const {specification}=require('./content-policy');
module.exports=uid=>createCoreController(uid,()=>({
  async find(ctx){
    if(ctx.query.status&&ctx.query.status!=='published')return ctx.forbidden();
    const {fields,populate}=specification(uid);
    ctx.query={...ctx.query,status:'published',fields,populate};
    const result=await super.find(ctx);
    return result;
  },
  async findOne(ctx){
    if(ctx.query.status&&ctx.query.status!=='published')return ctx.forbidden();
    const {fields,populate}=specification(uid);
    ctx.query={...ctx.query,status:'published',fields,populate};
    return super.findOne(ctx);
  }
}));
