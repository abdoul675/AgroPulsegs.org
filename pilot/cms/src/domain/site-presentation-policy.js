'use strict';
const {errors:{ValidationError}}=require('@strapi/utils');
const record=v=>v&&typeof v==='object'&&!Array.isArray(v);
const id=v=>typeof v==='string'&&/^[a-z][a-z0-9-]{0,79}$/.test(v);
const fail=()=>{throw new ValidationError('La présentation contient des valeurs non autorisées.');};
const keys=(v,allowed)=>{if(!record(v)||Object.keys(v).some(k=>!allowed.includes(k)))fail();};
const text=(v,max)=>{if(v!==undefined&&(typeof v!=='string'||v.length>max||/[\u0000\u0008\u000b\u000c\u007f]/.test(v)))fail();};
function validate(data){
 if(Object.hasOwn(data,'siteLayout')&&data.siteLayout!==null){
  const v=data.siteLayout;keys(v,['sections','cards']);
  if(v.sections!==undefined&&(!Array.isArray(v.sections)||v.sections.length>60||v.sections.some(x=>!id(x))||new Set(v.sections).size!==v.sections.length))fail();
  if(v.cards!==undefined){if(!record(v.cards)||Object.keys(v.cards).length>60)fail();for(const[k,a]of Object.entries(v.cards))if(!id(k)||!Array.isArray(a)||a.length>100||a.some(n=>!Number.isInteger(n)||n<0||n>=100)||new Set(a).size!==a.length)fail();}
 }
 if(Object.hasOwn(data,'siteText')&&data.siteText!==null){
  const v=data.siteText;if(JSON.stringify(v).length>150000)fail();keys(v,['title','hero','sections']);text(v.title,500);
  if(v.hero!==undefined){keys(v.hero,['title','intro']);text(v.hero.title,500);text(v.hero.intro,5000);}
  if(v.sections!==undefined){if(!record(v.sections)||Object.keys(v.sections).length>60)fail();for(const[k,s]of Object.entries(v.sections)){if(!id(k))fail();keys(s,['title','kicker','lead','groups']);text(s.title,500);text(s.kicker,300);text(s.lead,20000);if(s.groups!==undefined){if(!Array.isArray(s.groups)||s.groups.length>100)fail();for(const g of s.groups){keys(g,['title','text']);text(g.title,500);text(g.text,12000);}}}}
 }
}
module.exports={validate};
