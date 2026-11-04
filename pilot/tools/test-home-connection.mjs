import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { localRoot, pilotRoot, runtime } from './runtime.mjs';

const runtimeData = await runtime();
const cmsBase = `http://127.0.0.1:${runtimeData.cmsPort}`;
const siteBase = process.env.AGROPULSE_TEST_SITE_URL || 'http://127.0.0.1:4175';
if(!/^http:\/\/127\.0\.0\.1:\d+$/u.test(siteBase))throw new Error('CMS integration checks require a loopback test site.');
const fixtures = JSON.parse(await fs.readFile(path.join(localRoot, 'content-fixtures.json'), 'utf8'));
const pageId = fixtures.page;
if (!pageId) throw new Error('Run test-content-models.mjs first to create the isolated home-page fixture.');

const pageEndpoint = `/content-manager/collection-types/api::page.page/${pageId}`;
const results = [];
function check(name, actual, expected) {
  assert.equal(actual, expected, name);
  results.push(name);
  console.log(`PASS ${name}`);
}

async function call(base, url, { token, method = 'GET', body } = {}) {
  const response = await fetch(base + url, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(10_000),
  });
  const data = await response.json().catch(() => ({}));
  return { status: response.status, data };
}

async function waitForServices() {
  const deadline = Date.now() + 30_000;
  let lastError;
  while (Date.now() < deadline) {
    try {
      const [cms, site] = await Promise.all([
        fetch(`${cmsBase}/admin/init`, { signal: AbortSignal.timeout(1000) }),
        fetch(`${siteBase}/api/home-content?locale=fr`, { signal: AbortSignal.timeout(1000) }),
      ]);
      if (cms.ok && site.ok) return;
    } catch (error) {
      lastError = error;
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  throw new Error(`The local Strapi and AgroPulse site servers must be running on loopback (${lastError?.name || 'unavailable'}).`);
}

await waitForServices();
const tokens = {};
for (const name of ['editor', 'publisher']) {
  const login = await call(cmsBase, '/admin/login', {
    method: 'POST',
    body: { email: `${name}@agropulse.test`, password: runtimeData[`${name}Password`] },
  });
  check(`Connexion ${name}`, login.status, 200);
  tokens[name] = login.data.data.token;
}

for (const locale of ['fr', 'en']) {
  const publicUrl = `/api/home-content?locale=${locale}`;
  const before = await call(siteBase, publicUrl);
  check(`Accueil ${locale} déjà publié`, before.status, 200);
  check(`Contenu public ${locale}`, before.data.status, 'published');
  check(`Réponse publique limitée ${locale}`, Object.keys(before.data.content).sort().join(','), 'intro,title');

  const updatedTitle = `Texte de test privé ${locale.toUpperCase()}`;
  const updatedIntro = `Introduction de test isolée ${locale.toUpperCase()}`;
  const draft = await call(cmsBase, pageEndpoint, {
    token: tokens.editor,
    method: 'PUT',
    body: { locale, heroTitle: updatedTitle, summary: updatedIntro },
  });
  check(`Modification du brouillon ${locale} depuis l’administration`, draft.status, 200);

  const stillPublished = await call(siteBase, publicUrl);
  check(`Brouillon privé ${locale}`, stillPublished.data.content.title, before.data.content.title);
  check(`Éditeur interdit de publication ${locale}`, (await call(cmsBase, `${pageEndpoint}/actions/publish`, {
    token: tokens.editor,
    method: 'POST',
    body: { locale },
  })).status, 403);

  check(`Publication autorisée ${locale}`, (await call(cmsBase, `${pageEndpoint}/actions/publish`, {
    token: tokens.publisher,
    method: 'POST',
    body: { locale },
  })).status, 200);

  const published = await call(siteBase, publicUrl);
  check(`Titre publié affiché ${locale}`, published.data.content.title, updatedTitle);
  check(`Introduction publiée affichée ${locale}`, published.data.content.intro, updatedIntro);
}

console.log(`Completed ${results.length} isolated homepage CMS checks.`);
