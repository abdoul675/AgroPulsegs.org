import http from 'node:http';
import { readFile, realpath } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createContactHandler } from './contact-handler.mjs';
import { createHomeContentHandler } from './home-content.mjs';
import { createPageContentHandler } from './page-content.mjs';

const root = path.resolve(fileURLToPath(new URL('../public/', import.meta.url)));
const realPublicRoot = await realpath(root);
const types = { '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.mjs': 'application/javascript; charset=utf-8', '.pdf': 'application/pdf', '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.avif': 'image/avif' };
const handleContact = createContactHandler();
const handleHomeContent = createHomeContentHandler();
const handlePageContent = createPageContentHandler();
const handleEditorReference = async (req, res, requestUrl) => {
  if (!['GET','HEAD'].includes(req.method)) {
    res.writeHead(405, { Allow: 'GET, HEAD' }).end();
    return;
  }
  const page = String(requestUrl.searchParams.get('page') || '');
  const locale = requestUrl.searchParams.get('locale') === 'en' ? 'en' : 'fr';
  if (!/^[a-z0-9-]+$/u.test(page)) {
    res.writeHead(400, {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','Access-Control-Allow-Origin':'*'}).end(JSON.stringify({error:'invalid_page'}));
    return;
  }
  try {
    const source = await readFile(path.join(root, 'index.html'), 'utf8');
    const match = source.match(/<script id="pages-data" type="application\/json">([\s\S]*?)<\/script>/u);
    if (!match) throw new Error('pages-data missing');
    const pages = JSON.parse(match[1]);
    const value = pages[page];
    if (!value) {
      res.writeHead(404, {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','Access-Control-Allow-Origin':'*'}).end(JSON.stringify({error:'not_found'}));
      return;
    }
    const local = input => typeof input === 'string' ? input : (input?.[locale] || input?.fr || '');
    const paragraphs = input => Array.isArray(input) ? input.map(local).filter(Boolean).join('\n\n') : local(input);
    const reference = {
      page,
      locale,
      title: local(value.title),
      hero: {
        title: local(value.hero?.title) || local(value.title),
        intro: paragraphs(value.hero?.lead),
      },
      sections: (value.sections || []).map(section => ({
        id: section.id,
        type: section.type,
        title: local(section.title),
        kicker: local(section.kicker),
        lead: paragraphs(section.lead),
        groups: (section.groups || []).map(group => ({
          title: local(group.title),
          text: paragraphs(group.text),
        })),
      })),
    };
    const body = JSON.stringify(reference);
    res.writeHead(200, {
      'Content-Type':'application/json; charset=utf-8',
      'Cache-Control':'no-store',
      'Access-Control-Allow-Origin':'*',
      'Content-Length':Buffer.byteLength(body),
    });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch {
    res.writeHead(500, {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','Access-Control-Allow-Origin':'*'}).end(JSON.stringify({error:'reference_unavailable'}));
  }
};
const maquetteRoutes = new Map([
  ['/apropos.html', 'a-propos'],
  ['/expertises.html', 'expertises'],
  ['/formation-talents.html', 'pole-1'],
  ['/systemes-donnees.html', 'pole-2'],
  ['/ia-analytics.html', 'pole-3'],
  ['/climat-economie-verte.html', 'pole-4'],
  ['/incubation-agritech.html', 'pole-5'],
  ['/conseil-mecanisation.html', 'pole-6'],
  ['/experts-services.html', 'pole-7'],
  ['/mecanisation-agricole.html', 'pole-8'],
  ['/programmes.html', 'fellowship'],
  ['/fellowship.html', 'fellowship'],
  ['/fellowship-concept.html', 'fellowship'],
  ['/yida-cashew.html', 'fellowship'],
  ['/agir-ia.html', 'agir-ia'],
  ['/contact.html', 'contact'],
  ['/partenaires.html', 'partenaires'],
  ['/ressources.html', 'ressources'],
]);
// Every request is contained: malformed targets and rejected async handlers must not stop the process.
async function handleRequest(req, res) {
  let requestUrl;
  try { requestUrl = new URL(req.url, 'http://localhost'); }
  catch { res.writeHead(400, {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}).end(JSON.stringify({error:'invalid_request_target'})); return; }
  const host = String(req.headers.host || '').replace(/:\d+$/u, '').toLowerCase();
  if (host === 'www.agropulsegs.org') {
    res.writeHead(308, { Location: `https://agropulsegs.org${requestUrl.pathname}${requestUrl.search}` }).end();
    return;
  }
  if (requestUrl.pathname === '/healthz') {
    if (!['GET','HEAD'].includes(req.method)) { res.writeHead(405, {Allow:'GET, HEAD'}).end(); return; }
    res.writeHead(200, {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}).end(req.method==='HEAD'?undefined:JSON.stringify({status:'ok'}));
    return;
  }
  if (requestUrl.pathname.toLowerCase() === '/documents/revue-yida-cashew-n01.pdf') {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' }).end('404 — Document indisponible');
    return;
  }
  if (requestUrl.pathname === '/api/contact') {
    try {
      await handleContact(req, res);
    } catch (error) {
      console.error(`AgroPulse contact endpoint failed (${error.name || 'unexpected error'}).`);
      if (res.headersSent) {
        res.destroy();
      } else {
        res.writeHead(500, {
          'Cache-Control': 'no-store',
          'Content-Type': 'application/json; charset=utf-8',
          'X-Content-Type-Options': 'nosniff',
        });
        res.end(JSON.stringify({ error: 'internal_error' }));
      }
    }
    return;
  }

  if (requestUrl.pathname === '/api/editor-reference') {
    await handleEditorReference(req, res, requestUrl);
    return;
  }
  if (requestUrl.pathname === '/api/page-content') {
    await handlePageContent(req, res);
    return;
  }
  if (requestUrl.pathname === '/api/home-content') {
    await handleHomeContent(req, res);
    return;
  }

  const maquettePage = maquetteRoutes.get(requestUrl.pathname);
  if (maquettePage) {
    res.writeHead(302, {
      'Cache-Control': 'no-store',
      Location: `/#p-${maquettePage}`,
    });
    res.end();
    return;
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    res.writeHead(405).end();
    return;
  }

  try {
    const pathname = decodeURIComponent(requestUrl.pathname);
    const target = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!target.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    // A public symlink/junction must never expose a file outside the real public tree.
    const realTarget = await realpath(target);
    const relativeTarget = path.relative(realPublicRoot, realTarget);
    if (relativeTarget === '..' || relativeTarget.startsWith('..' + path.sep) || path.isAbsolute(relativeTarget)) {
      res.writeHead(403).end();
      return;
    }
    let body = await readFile(realTarget);
    if (target === path.join(root, 'index.html')) {
      let editorOrigin = '';
      try {
        const source = new URL(process.env.AGROPULSE_CMS_ADMIN_ORIGIN || process.env.AGROPULSE_CMS_URL || 'http://127.0.0.1:1338');
        if (!source.username && !source.password && (source.protocol === 'https:' || (source.protocol === 'http:' && ['127.0.0.1','localhost','[::1]'].includes(source.hostname)))) editorOrigin = source.origin;
      } catch {}
      body = Buffer.from(body.toString('utf8').replace('</head>', '<meta name="agropulse-cms-admin-origin" content="' + editorOrigin.replace(/[&<>"']/gu, '') + '"></head>'));
      if (requestUrl.searchParams.get('editor') === '1') res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
    }
    const download = pathname.startsWith('/documents/') && path.extname(target) === '.pdf';
    const noStore = requestUrl.searchParams.get('editor') === '1' || path.basename(target) === 'editorial-client.js';
    res.writeHead(200, {
      'Content-Type': types[path.extname(target)] || 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff',
      'Content-Length': body.length,
      ...(noStore ? { 'Cache-Control': 'no-store' } : {}),
      ...(download ? { 'Content-Disposition': 'attachment; filename="' + path.basename(target).replace(/[^a-zA-Z0-9._-]/gu, '_') + '"' } : {}),
    });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('404 — Page introuvable'); }
}
const server = http.createServer((req, res) => {
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');
  let frameOrigin='';
  try {
    const origin=new URL(process.env.AGROPULSE_CMS_ADMIN_ORIGIN||process.env.AGROPULSE_CMS_URL||'http://127.0.0.1:1338');
    if(!origin.username&&!origin.password&&(origin.protocol==='https:'||(origin.protocol==='http:'&&['127.0.0.1','localhost','[::1]'].includes(origin.hostname))))frameOrigin=' '+origin.origin;
  } catch {}
  // Permit the trusted CMS preview while denying unrelated frame parents and embedded objects.
  res.setHeader('Content-Security-Policy',"object-src 'none'; base-uri 'none'; frame-ancestors 'self'"+frameOrigin);
  void handleRequest(req,res).catch(()=>{
    if(res.headersSent){res.destroy();return;}
    res.writeHead(500,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}).end(JSON.stringify({error:'internal_error'}));
  });
});
server.requestTimeout = 15_000;
server.headersTimeout = 10_000;
const host = process.env.HOST || (process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1');
server.listen(Number(process.env.PORT || 4173), host, () => console.log(`Local: http://${host}:${server.address().port}`));
