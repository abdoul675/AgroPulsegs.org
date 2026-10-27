import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
const source=process.argv[2];
if(!source)throw Error('Provide the approved home HTML path.');
const html=await fs.readFile(source,'utf8');
const raw=html.match(/<script[^>]*id="cms-data"[^>]*>([\s\S]*?)<\/script>/)?.[1];
if(!raw)throw Error('Reference content not found.');
const sourceData=JSON.parse(raw);
const target=new URL('../web/public/reference/',import.meta.url);
await fs.mkdir(target,{recursive:true});
const images=new Map();
async function localImage(value){
 if(!value?.startsWith('data:image/'))return value;
 if(images.has(value))return images.get(value);
 const [,format,base64]=value.match(/^data:image\/(png|webp|jpeg);base64,([A-Za-z0-9+/=]+)$/)||[];
 if(!base64)throw Error('Unsupported embedded image.');
 const bytes=Buffer.from(base64,'base64');const file=createHash('sha256').update(bytes).digest('hex').slice(0,16)+'.'+format;
 await fs.writeFile(new URL(file,target),bytes);const url='/reference/'+file;images.set(value,url);return url;
}
const logo=html.match(/<header>[\s\S]*?<img src="([^"]+)"/)?.[1];
const reference={source:'files.zip / apercu-agropulse-accueil.html',logo:await localImage(logo),hero:{...sourceData.hero,image:await localImage(sourceData.hero.image)},expertises:sourceData.expertises,poles:sourceData.poles,fellowship:{title:sourceData.fellowship.title,images:await Promise.all(sourceData.fellowship.images.map(localImage))},agir:{title:sourceData.agir.title,text:sourceData.agir.text,image:await localImage(sourceData.agir.image)}};
await fs.mkdir(new URL('../web/content/',import.meta.url),{recursive:true});
await fs.writeFile(new URL('../web/content/home-reference.json',import.meta.url),JSON.stringify(reference,null,2));
console.log(`Imported selected reference content and ${images.size} local images; no source scripts executed.`);
