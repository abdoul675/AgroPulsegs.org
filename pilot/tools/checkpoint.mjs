import fs from 'node:fs/promises';
import path from 'node:path';
import {localRoot} from './runtime.mjs';
const source=path.join(localRoot,'postgres');
try{await fs.access(path.join(source,'postmaster.pid'));throw new Error('Stop PostgreSQL cleanly before making a cold checkpoint.');}catch(error){if(error.code!=='ENOENT')throw error;}
const name=`before-content-models-${new Date().toISOString().replaceAll(':','-')}`;
const destination=path.join(localRoot,'backups',name);
await fs.mkdir(destination,{recursive:true});
await fs.cp(source,path.join(destination,'postgres'),{recursive:true,errorOnExist:true,force:false});
for(const file of ['runtime.json','fixture.json','read-token.json'])await fs.copyFile(path.join(localRoot,file),path.join(destination,file));
await fs.writeFile(path.join(destination,'CHECKPOINT.txt'),'Cold local checkpoint. PostgreSQL was stopped. Restore requires stopping all pilot services and preserving current data first. Not a tested disaster recovery procedure.\n');
console.log('Cold checkpoint created in the ignored local backups directory.');
