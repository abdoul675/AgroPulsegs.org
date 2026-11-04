const {createHmac}=require('node:crypto');
module.exports = ({ env }) => ({
  preview: {
    enabled:true,
    config:{
      allowedOrigins:['http://127.0.0.1:3100'],
      async handler(uid,{documentId,locale,status}){
        const ctx=strapi.requestContext.get();
        if(!ctx?.state?.userAbility?.can('plugin::content-manager.explorer.read',uid))return null;
        if(uid!=='api::expertise.expertise'||documentId!==strapi.pilotFixtureId||!['fr','en'].includes(locale))return null;
        if(status==='published')return `http://127.0.0.1:3100/${locale}/expertise/${documentId}`;
        const expires=String(Date.now()+300000);
        const signature=createHmac('sha256',env('PREVIEW_SECRET')).update(`${documentId}|${locale}|${expires}`).digest('hex');
        return `http://127.0.0.1:3100/api/preview?${new URLSearchParams({documentId,locale,expires,signature})}`;
      }
    }
  },
  auth: {
    secret: env('ADMIN_JWT_SECRET'),
  },
  apiToken: {
    salt: env('API_TOKEN_SALT'),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT'),
    },
  },
  secrets: {
    encryptionKey: env('ENCRYPTION_KEY'),
  },
  flags: {
    nps: env.bool('FLAG_NPS', false),
    promoteEE: env.bool('FLAG_PROMOTE_EE', false),
    docLinks: env.bool('FLAG_DOC_LINKS', true),
  },
});
