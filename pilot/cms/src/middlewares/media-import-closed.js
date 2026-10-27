'use strict';
// No private-file circuit exists yet. Keep all media mutations closed in this local lot.
module.exports=()=>async(ctx,next)=>{
  if(['POST','PUT','PATCH','DELETE'].includes(ctx.method)&&/^\/(?:api\/)?upload(?:\/|$)/.test(ctx.path))return ctx.forbidden('Import et modification de médias désactivés dans ce lot ; ne pas téléverser de document confidentiel.');
  return next();
};
