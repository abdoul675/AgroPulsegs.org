import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const pages = new Set(['qr-access','home','about','expertise','fellowship','agir-ia','partners','resources','contact','legal','privacy', ...Array.from({length:8},(_,i)=>`expertise-${i+1}`)]);
const sources = new Set(['direct','qr','facebook','x','tiktok','youtube']);
const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataFile = path.resolve(repositoryRoot, process.env.AGROPULSE_ANALYTICS_FILE || 'var/analytics.json');
let queue = Promise.resolve();
const rateWindow = new Map();
const rateCleanup = setInterval(() => {
  const now = Date.now();
  for (const [address,value] of rateWindow) if (now - value.start >= 60_000) rateWindow.delete(address);
}, 60_000);
rateCleanup.unref();

function json(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Length':Buffer.byteLength(payload)});
  res.end(payload);
}

async function load() {
  try {
    const value = JSON.parse(await readFile(dataFile, 'utf8'));
    return value && value.days && typeof value.days === 'object' ? value : {days:{}};
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    return {days:{}};
  }
}

function serialized(operation) {
  const next = queue.then(operation, operation);
  queue = next.catch(() => {});
  return next;
}

async function save(value) {
  await mkdir(path.dirname(dataFile), {recursive:true});
  const temporary = `${dataFile}.${randomUUID()}.tmp`;
  await writeFile(temporary, JSON.stringify(value), {encoding:'utf8', mode:0o600});
  await rename(temporary, dataFile);
}

function authorized(req) {
  const expected = process.env.AGROPULSE_ANALYTICS_ADMIN_TOKEN;
  const actual = String(req.headers.authorization || '');
  return Boolean(expected && expected.length >= 32 && actual === `Bearer ${expected}`);
}

export async function handleAnalyticsEvent(req, res) {
  if (req.method !== 'POST') { res.writeHead(405,{Allow:'POST','Cache-Control':'no-store'}).end(); return; }
  const host = String(req.headers.host || '').toLowerCase();
  let origin;
  try { origin = new URL(req.headers.origin || ''); } catch { res.writeHead(403,{'Cache-Control':'no-store'}).end(); return; }
  if (origin.host.toLowerCase() !== host) { res.writeHead(403,{'Cache-Control':'no-store'}).end(); return; }
  // Keep this short-lived abuse guard in memory only; client addresses never enter analytics data or logs.
  const now = Date.now();
  const address = req.socket.remoteAddress || 'unknown';
  const current = rateWindow.get(address);
  if (current && now - current.start < 60_000 && current.count >= 300) { res.writeHead(429,{'Cache-Control':'no-store','Retry-After':'60'}).end(); return; }
  if (!current || now - current.start >= 60_000) rateWindow.set(address,{start:now,count:1});
  else current.count++;
  if (rateWindow.size > 2000) for (const [key,value] of rateWindow) if (now - value.start >= 60_000) rateWindow.delete(key);
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 1024) { res.writeHead(413,{'Cache-Control':'no-store'}).end(); return; }
  }
  let event;
  try { event = JSON.parse(raw); } catch { json(res,400,{error:'invalid_event'}); return; }
  const pageView = event?.type === 'page_view' && pages.has(event.page) && sources.has(event.source);
  const socialClick = event?.type === 'social_click' && event.page === 'social-links' && ['facebook','x','tiktok','youtube'].includes(event.source);
  if (!pageView && !socialClick) { json(res,400,{error:'invalid_event'}); return; }
  const day = new Date().toISOString().slice(0,10);
  try {
    await serialized(async () => {
      const value = await load();
      const bucket = value.days[day] ||= {total:0,pages:{},sources:{},socialClicks:{}};
      if (pageView) {
        bucket.total++;
        bucket.pages[event.page] = (bucket.pages[event.page] || 0) + 1;
        bucket.sources[event.source] = (bucket.sources[event.source] || 0) + 1;
      } else bucket.socialClicks[event.source] = (bucket.socialClicks[event.source] || 0) + 1;
      await save(value);
    });
    res.writeHead(204,{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}).end();
  } catch {
    json(res,503,{error:'analytics_unavailable'});
  }
}

export async function handleAnalyticsSummary(req, res, requestUrl) {
  if (req.method !== 'GET') { res.writeHead(405,{Allow:'GET','Cache-Control':'no-store'}).end(); return; }
  if (!authorized(req)) { res.writeHead(process.env.AGROPULSE_ANALYTICS_ADMIN_TOKEN ? 401 : 503,{'Cache-Control':'no-store','WWW-Authenticate':'Bearer'}).end(); return; }
  const from = requestUrl.searchParams.get('from') || new Date(Date.now()-29*86400000).toISOString().slice(0,10);
  const to = requestUrl.searchParams.get('to') || new Date().toISOString().slice(0,10);
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(from) || !/^\d{4}-\d{2}-\d{2}$/u.test(to) || from > to) { json(res,400,{error:'invalid_range'}); return; }
  try {
    await queue;
    const value = await load();
    const days = Object.entries(value.days).filter(([date]) => date >= from && date <= to).sort(([a],[b]) => a.localeCompare(b)).map(([date,counts]) => ({date,...counts}));
    const pagesTotal = {}, sourcesTotal = {}, socialClicks = {};
    for (const day of days) {
      for (const [page,count] of Object.entries(day.pages || {})) pagesTotal[page] = (pagesTotal[page] || 0) + count;
      for (const [source,count] of Object.entries(day.sources || {})) sourcesTotal[source] = (sourcesTotal[source] || 0) + count;
      for (const [platform,count] of Object.entries(day.socialClicks || {})) socialClicks[platform] = (socialClicks[platform] || 0) + count;
    }
    json(res,200,{from,to,total:days.reduce((sum,day)=>sum+day.total,0),pages:pagesTotal,sources:sourcesTotal,socialClicks,days});
  } catch { json(res,503,{error:'analytics_unavailable'}); }
}
