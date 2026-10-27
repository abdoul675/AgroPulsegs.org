'use strict';
const {labels,hints}=require('../domain/editorial-ui');
const dictionary=new Map(Object.values({...labels,...Object.fromEntries(Object.entries(hints).map(([key,value])=>['hint.'+key,value]))}).map(value=>{
 const separator=value.indexOf(' / ');
 return [value,{fr:value.slice(0,separator),en:value.slice(separator+3)}];
}));
function translate(value,language){
 if(Array.isArray(value))return value.map(item=>translate(item,language));
 if(!value||typeof value!=='object')return value;
 return Object.fromEntries(Object.entries(value).map(([key,item])=>[
  key,['label','description','hint'].includes(key)&&typeof item==='string'&&dictionary.has(item)
   ?dictionary.get(item)[language]:translate(item,language)
 ]));
}
module.exports=()=>async(ctx,next)=>{
 await next();
 // Translate only administrative form configuration, never saved content or API data.
 if(ctx.method==='GET'&&ctx.state.user&&/^\/content-manager\/(content-types|components)\/[^/]+\/configuration$/.test(ctx.path)&&ctx.status===200){
  const language=ctx.state.user.preferedLanguage==='en'?'en':'fr';
  ctx.body=translate(ctx.body,language);
 }
};
