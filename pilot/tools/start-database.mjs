import EmbeddedPostgres from 'embedded-postgres';
import fs from 'node:fs/promises';
import path from 'node:path';
import {runtime,localRoot} from './runtime.mjs';

const r=await runtime();
const directory=path.join(localRoot,'postgres');
const database=new EmbeddedPostgres({databaseDir:directory,user:r.database.user,password:r.database.password,port:r.database.port,persistent:true,authMethod:'scram-sha-256',createPostgresUser:false,postgresFlags:['-h','127.0.0.1'],onLog:()=>{},onError:message=>console.error(String(message).replaceAll(r.database.password,'[redacted]'))});
try{await fs.access(path.join(directory,'PG_VERSION'));}catch{await database.initialise();}
await database.start();
const client=database.getPgClient();await client.connect();
if(!(await client.query('SELECT 1 FROM pg_database WHERE datname=$1',[r.database.name])).rowCount)await database.createDatabase(r.database.name);
const result=await client.query('SELECT version()');await client.end();
console.log(`PostgreSQL ready on 127.0.0.1:${r.database.port}; database=${r.database.name}; ${result.rows[0].version.split(',')[0]}`);
let stopping=false;
async function stop(){if(stopping)return;stopping=true;await database.stop();process.exit(0);}
process.on('SIGINT',stop);process.on('SIGTERM',stop);
setInterval(()=>{},60000);
