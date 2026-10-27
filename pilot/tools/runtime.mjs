import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomBytes} from 'node:crypto';

export const pilotRoot = path.resolve(fileURLToPath(new URL('../', import.meta.url)));
export const localRoot = path.join(pilotRoot, '.local');
export async function runtime() {
  await fs.mkdir(localRoot, {recursive:true});
  const filename=path.join(localRoot,'runtime.json');
  try{return JSON.parse(await fs.readFile(filename,'utf8'));}
  catch(error){if(error.code!=='ENOENT')throw error;}
  const secret=()=>randomBytes(32).toString('hex');
  const value={database:{host:'127.0.0.1',port:55437,name:'agropulse_pilot',user:'agropulse_pilot',password:secret()},cmsPort:1338,webPort:3100,appKeys:[secret(),secret()],adminJwtSecret:secret(),apiTokenSalt:secret(),transferTokenSalt:secret(),encryptionKey:secret(),jwtSecret:secret(),previewSecret:secret(),adminPassword:secret()+'Aa!9',editorPassword:secret()+'Aa!9',publisherPassword:secret()+'Aa!9'};
  await fs.writeFile(filename,JSON.stringify(value,null,2),{flag:'wx'});
  return value;
}

if(process.argv[1]===fileURLToPath(import.meta.url)){
  const r=await runtime();
  const cmsEnv=[['HOST','127.0.0.1'],['PORT',r.cmsPort],['APP_KEYS',r.appKeys.join(',')],['ADMIN_JWT_SECRET',r.adminJwtSecret],['API_TOKEN_SALT',r.apiTokenSalt],['TRANSFER_TOKEN_SALT',r.transferTokenSalt],['ENCRYPTION_KEY',r.encryptionKey],['JWT_SECRET',r.jwtSecret],['DATABASE_CLIENT','postgres'],['DATABASE_HOST',r.database.host],['DATABASE_PORT',r.database.port],['DATABASE_NAME',r.database.name],['DATABASE_USERNAME',r.database.user],['DATABASE_PASSWORD',r.database.password],['DATABASE_SSL','false'],['STRAPI_TELEMETRY_DISABLED','true'],['STRAPI_DISABLE_UPDATE_NOTIFICATION','true']].map(([k,v])=>`${k}=${v}`).join('\n')+'\n';
  await fs.mkdir(path.join(pilotRoot,'cms'),{recursive:true});
  await fs.writeFile(path.join(pilotRoot,'cms','.env'),cmsEnv.replaceAll('\\n','\n')+`PREVIEW_SECRET=${r.previewSecret}\n`);
  console.log('Local credentials generated in pilot/.local/runtime.json; CMS .env prepared. No credentials printed.');
}
