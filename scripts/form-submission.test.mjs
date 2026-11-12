import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import test from 'node:test';

const page = readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');
const liveCode = page.slice(page.indexOf('async function sendForm(f,m){'), page.indexOf('function bindStep(f,s){'));
const legacy = readFileSync(new URL('../public/site-pages.js', import.meta.url), 'utf8');
const legacyCode = legacy.slice(legacy.indexOf('async function submitContactForm(form) {'), legacy.indexOf('\nsetLanguage(language);'));

for (const [label, code, invoke] of [
  ['live', liveCode, 'sendForm(form,status)'],
  ['legacy', legacyCode, 'submitContactForm(form)'],
]) {
  for (const language of ['fr', 'en']) {
    test(`${label} ${language}: blocks double clicks, keeps inputs on 429 and restores controls`, async () => {
      let resolveFetch, calls = 0, reset = 0, payload;
      const button = { disabled: false };
      const attributes = new Map();
      const values = { name: 'Visitor', email: 'test@example.org', type: 'contact', message: 'Keep this message', consent: 'on', website: 'trap-value' };
      const form = {
        dataset: {}, checkValidity: () => true,
        querySelectorAll: () => [button], querySelector: () => button,
        setAttribute: (k, v) => attributes.set(k, v), removeAttribute: k => attributes.delete(k),
        reset: () => reset++, reportValidity: () => assert.fail('Unexpected invalid form'),
      };
      const status = {};
      const context = {
        form, status, language, CUR: 'contact', SITE: { settings: { formEndpoint: '/api/contact' } },
        document: { documentElement: { lang: language }, getElementById: () => status }, EN: () => language === 'en',
        FormData: class {
          [Symbol.iterator]() { return Object.entries(values)[Symbol.iterator](); }
          get(k) { return values[k]; }
        },
        fetch: (_url, options) => {
          calls++; payload = JSON.parse(options.body);
          return new Promise(resolve => { resolveFetch = resolve; });
        },
      };
      runInNewContext(code + '\nglobalThis.submit=()=>'+invoke, context);
      const pending = context.submit();
      assert.equal(button.disabled, true);
      assert.equal(attributes.get('aria-busy'), 'true');
      assert.match(status.textContent, language === 'fr' ? /Envoi/ : /Sending/);
      await context.submit();
      assert.equal(calls, 1);
      assert.equal(payload.website, 'trap-value');
      resolveFetch(Response.json({ error: 'too_many_requests', retryAfter: 125 }, { status: 429 }));
      await pending;
      assert.equal(button.disabled, false);
      assert.equal(attributes.has('aria-busy'), false);
      assert.equal(reset, 0);
      assert.equal(values.message, 'Keep this message');
      assert.match(status.textContent, /3 min/);
      assert.match(status.textContent, language === 'fr' ? /conservées/ : /kept/);
      const retry = context.submit();
      resolveFetch(Response.json({ ok: true, reference: 'TEST', duplicate: true }));
      await retry;
      assert.equal(reset, 1);
      assert.equal(button.disabled, false);
    });
  }
  test(`${label}: network error releases the guard and preserves the form`, async () => {
    let reset = 0;
    const button = { disabled: false }, status = {};
    const form = { dataset: {}, checkValidity: () => true, querySelectorAll: () => [button], querySelector: () => button, setAttribute() {}, removeAttribute() {}, reset() { reset++; } };
    const context = { form, status, language: 'fr', CUR: 'ressources', SITE: { settings: { formEndpoint: '/api/contact' } }, document: { documentElement: { lang: 'fr' }, getElementById: () => status }, EN: () => false, FormData: class { *[Symbol.iterator]() { yield ['email', 'test@example.org']; } get() { return ''; } }, fetch: async () => { throw new Error('offline'); } };
    runInNewContext(code + '\nglobalThis.submit=()=>'+invoke, context);
    await context.submit();
    assert.equal(reset, 0);
    assert.equal(button.disabled, false);
    assert.equal(form.dataset.submitting, undefined);
    assert.match(status.textContent, /Impossible/);
  });
}
