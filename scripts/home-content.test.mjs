import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import test from 'node:test';
import { createHomeContentHandler, readPublishedHome } from './home-content.mjs';

const config = {
  AGROPULSE_CMS_URL: 'http://127.0.0.1:1338',
  AGROPULSE_CMS_HOME_DOCUMENT_ID: 'local-home-document',
  AGROPULSE_CMS_READ_TOKEN: 'server-only-test-token',
};

async function withServer(handler, run) {
  const server = createServer(handler);
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  try {
    return await run(`http://127.0.0.1:${server.address().port}`);
  } finally {
    await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
}

test('keeps the approved reference copy when CMS settings are absent', async () => {
  assert.deepEqual(await readPublishedHome({ locale: 'fr', env: {} }), { status: 'reference' });
});

test('rejects incomplete or insecure CMS configuration', async () => {
  await assert.rejects(
    readPublishedHome({ locale: 'fr', env: { ...config, AGROPULSE_CMS_READ_TOKEN: '' } }),
    error => error.code === 'cms_configuration_incomplete',
  );
  await assert.rejects(
    readPublishedHome({ locale: 'fr', env: { ...config, AGROPULSE_CMS_URL: 'http://cms.example.org' } }),
    error => error.code === 'cms_configuration_invalid',
  );
});

test('requests only published locale content and returns the two hero strings', async () => {
  let requestedUrl;
  let requestedOptions;
  const result = await readPublishedHome({
    locale: 'en',
    env: config,
    fetchImpl: async (url, options) => {
      requestedUrl = new URL(url);
      requestedOptions = options;
      return Response.json({
        data: {
          sections: [
            { __component: 'content.hero', title: '  Published heading  ', intro: 'Published introduction' },
            { __component: 'content.rich-text', body: 'Must not be exposed' },
          ],
        },
      });
    },
  });

  assert.equal(requestedUrl.pathname, '/api/pages/local-home-document');
  assert.equal(requestedUrl.searchParams.get('locale'), 'en');
  assert.equal(requestedUrl.searchParams.get('populate'), '*');
  assert.equal(requestedUrl.searchParams.has('status'), false);
  assert.equal(requestedOptions.headers.Authorization, 'Bearer server-only-test-token');
  assert.deepEqual(result, {
    status: 'published',
    content: { title: 'Published heading', intro: 'Published introduction' },
  });
});

test('treats a hidden or unpublished home document as reference content', async () => {
  const result = await readPublishedHome({
    locale: 'fr',
    env: config,
    fetchImpl: async () => new Response(null, { status: 404 }),
  });
  assert.deepEqual(result, { status: 'reference' });
});

test('the HTTP handler limits locale, method, caching, and returned fields', async () => {
  const handler = createHomeContentHandler({
    env: config,
    fetchImpl: async () => Response.json({
      data: { sections: [{ __component: 'content.hero', title: 'Titre publié', intro: 'Introduction publiée' }] },
    }),
    logError: () => assert.fail('Unexpected CMS read error'),
  });

  await withServer(handler, async base => {
    const response = await fetch(`${base}/?locale=fr`);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.deepEqual(await response.json(), {
      status: 'published',
      content: { title: 'Titre publié', intro: 'Introduction publiée' },
    });

    const unsupportedLocale = await fetch(`${base}/?locale=de`);
    assert.equal(unsupportedLocale.status, 400);
    assert.deepEqual(await unsupportedLocale.json(), { error: 'unsupported_locale' });

    const wrongMethod = await fetch(base, { method: 'POST' });
    assert.equal(wrongMethod.status, 405);
    assert.equal(wrongMethod.headers.get('allow'), 'GET');
  });
});

test('reports CMS outages without returning configuration or credentials', async () => {
  const errors = [];
  const handler = createHomeContentHandler({
    env: config,
    fetchImpl: async () => { throw new Error('private upstream details'); },
    logError: message => errors.push(message),
  });

  await withServer(handler, async base => {
    const response = await fetch(`${base}/?locale=fr`);
    assert.equal(response.status, 502);
    assert.deepEqual(await response.json(), { status: 'unavailable' });
  });

  assert.deepEqual(errors, ['AgroPulse published homepage content unavailable (cms_unreachable).']);
});

test('finds the published homepage by identity without a local document identifier', async () => {
  const env = {AGROPULSE_CMS_ENABLE_PAGES:'true',AGROPULSE_CMS_URL:config.AGROPULSE_CMS_URL,AGROPULSE_CMS_READ_TOKEN:config.AGROPULSE_CMS_READ_TOKEN};
  let requested;
  const result=await readPublishedHome({locale:'fr',env,fetchImpl:async url=>{
    requested=new URL(url);
    return Response.json({data:[{key:'home',locale:'fr',heroTitle:'Accueil publié',summary:'Introduction publiée'}]});
  }});
  assert.equal(requested.pathname,'/api/pages');
  assert.equal(requested.searchParams.get('status'),'published');
  assert.equal(requested.searchParams.get('filters[key][$eq]'),'home');
  assert.deepEqual(result,{status:'published',content:{title:'Accueil publié',intro:'Introduction publiée'}});
});
