import {randomBytes} from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
const directory=path.resolve(process.argv[2]||'.work/deployment');
const secret=()=>randomBytes(32).toString('hex');
await fs.mkdir(directory,{recursive:true,mode:0o700});
const cmsFile=path.join(directory,'cms.env'),siteFile=path.join(directory,'site.env');
for(const file of [cmsFile,siteFile]){try{await fs.access(file);throw new Error('Refus d’écraser un fichier de configuration existant.');}catch(error){if(error.code!=='ENOENT')throw error;}}
const cms=[
 'NODE_ENV=production','HOST=127.0.0.1','PORT=1337','AGROPULSE_PILOT_MODE=false',
 'APP_KEYS='+secret()+','+secret(),'ADMIN_JWT_SECRET='+secret(),'API_TOKEN_SALT='+secret(),
 'TRANSFER_TOKEN_SALT='+secret(),'ENCRYPTION_KEY='+secret(),'JWT_SECRET='+secret(),
 'DATABASE_CLIENT=postgres','DATABASE_HOST=127.0.0.1','DATABASE_PORT=5432',
 'DATABASE_NAME=agropulse_institutional','DATABASE_USERNAME=agropulse','DATABASE_PASSWORD='+secret(),
 'DATABASE_SSL=false','PUBLIC_CMS_URL=http://127.0.0.1:1337',
 'VITE_AGROPULSE_SITE_URL=http://127.0.0.1:4173','STRAPI_TELEMETRY_DISABLED=true',
].join('\n')+'\n';
const site=[
 'NODE_ENV=production','HOST=127.0.0.1','PORT=4173',
 'AGROPULSE_CMS_URL=http://127.0.0.1:1337','AGROPULSE_CMS_ADMIN_ORIGIN=http://127.0.0.1:1337',
 'AGROPULSE_CMS_ENABLE_PAGES=true','AGROPULSE_CMS_READ_TOKEN=',
 'AGROPULSE_RECIPIENT_EMAIL=','EMAIL_FROM=','RESEND_API_KEY=',
].join('\n')+'\n';
await fs.writeFile(cmsFile,cms,{flag:'wx',mode:0o600});
await fs.writeFile(siteFile,site,{flag:'wx',mode:0o600});
console.log('Configuration institutionnelle créée dans '+directory+'. Aucun secret affiché. Adapter la base, les adresses et l’envoi avant lancement.');
