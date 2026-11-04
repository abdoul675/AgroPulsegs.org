import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createContactHandler } from './contact-handler.mjs';

const root = path.resolve(fileURLToPath(new URL('../public/', import.meta.url)));
const types = { '.pdf': 'application/pdf', '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.avif': 'image/avif' };
const handleContact = createContactHandler();
const maquetteRoutes = new Map([
  ['/apropos.html', 'a-propos'],
  ['/expertises.html', 'expertises'],
  ['/formation-talents.html', 'pole-1'],
  ['/systemes-donnees.html', 'pole-2'],
  ['/ia-analytics.html', 'pole-3'],
  ['/climat-economie-verte.html', 'pole-4'],
  ['/incubation-agritech.html', 'pole-5'],
  ['/conseil-mecanisation.html', 'pole-6'],
  ['/programmes.html', 'fellowship'],
  ['/fellowship.html', 'fellowship'],
  ['/fellowship-concept.html', 'fellowship'],
  ['/yida-cashew.html', 'fellowship'],
  ['/agir-ia.html', 'agir-ia'],
  ['/contact.html', 'contact'],
  ['/partenaires.html', 'partenaires'],
  ['/ressources.html', 'ressources'],
]);
const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url, 'http://localhost');
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
    const body = await readFile(target);
    const download = pathname.startsWith('/documents/') && path.extname(target) === '.pdf';
    res.writeHead(200, {
      'Content-Type': types[path.extname(target)] || 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff',
      'Content-Length': body.length,
      ...(download ? { 'Content-Disposition': 'attachment; filename="' + path.basename(target).replace(/[^a-zA-Z0-9._-]/gu, '_') + '"' } : {}),
    });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('404 — Page introuvable'); }
});
server.requestTimeout = 15_000;
server.headersTimeout = 10_000;
const host = process.env.HOST || (process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1');
server.listen(Number(process.env.PORT || 4173), host, () => console.log(`Local: http://${host}:${server.address().port}`));
