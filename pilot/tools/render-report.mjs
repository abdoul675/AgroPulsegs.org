import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
const {marked}=createRequire(import.meta.url)('marked');
const filename=process.argv[2]||'AgroPulse_Pilote_technique_v1.0.md';
if(!/^AgroPulse_[A-Za-z0-9_.-]+\.md$/.test(filename))throw new Error('A report filename inside docs is required.');
const source=new URL(`../../docs/${filename}`,import.meta.url);
const target=new URL(`../../docs/${filename.replace(/\.md$/,'.html')}`,import.meta.url);
const markdown=await fs.readFile(source,'utf8');
const body=marked.parse(markdown);
const title=(markdown.match(/^#\s+(.+)$/m)?.[1]||'AgroPulse').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
await fs.writeFile(target,`<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>
:root{color-scheme:light}*{box-sizing:border-box}body{margin:0;background:#edf3ed;color:#173f35;font:17px/1.65 'Segoe UI',sans-serif}main{max-width:1080px;margin:36px auto;padding:40px 48px;background:white;border-radius:16px;border:1px solid #d5e2d5}h1{font-size:2.1rem;line-height:1.2}h2{margin-top:2.3em;border-top:2px solid #d5e2d5;padding-top:1em;line-height:1.3}a{color:#086050;text-underline-offset:3px}table{border-collapse:collapse;width:100%;font-size:.91em;margin:24px 0}th,td{border:1px solid #d5e2d5;padding:10px 13px;text-align:left;vertical-align:top}th{background:#eaf3e8}code{background:#edf3ed;padding:2px 5px;border-radius:4px;overflow-wrap:anywhere}li{margin:.6em 0}@media(max-width:700px){main{margin:0;padding:22px 16px;border-radius:0}body{font-size:16px}h1{font-size:1.7rem}table{font-size:.8em}td,th{padding:6px;overflow-wrap:anywhere}}@media print{body{background:white}main{border:0;margin:0;padding:0}h2{break-after:avoid}tr{break-inside:avoid}}
</style></head><body><main>${body}</main></body></html>`);
console.log('HTML report generated from the Markdown source.');
