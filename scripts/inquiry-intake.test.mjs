import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
const require = createRequire(import.meta.url);
const controller = require('../pilot/cms/src/api/inquiry/controllers/intake.js');
const { acquireStartupLock } = require('../pilot/cms/startup-lock.js');
const savedToken = process.env.AGROPULSE_FORM_INGEST_TOKEN;
const savedStrapi = global.strapi;
test.before(() => { process.env.AGROPULSE_FORM_INGEST_TOKEN = 'test-private-token'; });
test.after(() => {
  if (savedToken === undefined) delete process.env.AGROPULSE_FORM_INGEST_TOKEN;
  else process.env.AGROPULSE_FORM_INGEST_TOKEN = savedToken;
  global.strapi = savedStrapi;
});

function ctx(body, token = 'test-private-token') {
  return { request: { headers: { authorization: token ? `Bearer ${token}` : '' }, body }, params: { documentId: 'saved-document' } };
}
const valid = { reference: 'AGP-test-reference', receivedAt: '2026-11-12T00:00:00.000Z', type: 'contact', locale: 'fr', name: 'TEST', email: 'test@example.org', message: 'TEST de réception' };

test('intake rejects absent, wrong and unconfigured tokens without accessing records', async () => {
  global.strapi = { documents() { throw Error('Must not access database'); } };
  for (const token of ['', 'wrong', 'test-private-token-extra']) {
    const request = ctx(valid, token);
    await controller.create(request);
    assert.equal(request.status, 401);
    assert.deepEqual(request.body, { error: 'unauthorized' });
    await controller.updateDelivery(request);
    assert.equal(request.status, 401);
  }
  delete process.env.AGROPULSE_FORM_INGEST_TOKEN;
  const request = ctx(valid);
  await controller.create(request);
  assert.equal(request.status, 401);
  process.env.AGROPULSE_FORM_INGEST_TOKEN = 'test-private-token';
});

test('intake creates a private record with initial history and ignores injected internal fields', async () => {
  let data;
  global.strapi = { documents: () => ({ create: async input => { data = input.data; return { documentId: 'saved-document', reference: data.reference }; } }) };
  const request = ctx({ ...valid, workflowStatus: 'done', internalNotes: 'injected', deliveryStatus: 'sent' });
  await controller.create(request);
  assert.equal(request.status, 201);
  assert.equal(data.workflowStatus, 'new');
  assert.equal(data.deliveryStatus, 'received');
  assert.equal(data.internalNotes, undefined);
  assert.deepEqual(data.deliveryEvents, [{ at: valid.receivedAt, status: 'received' }]);
  assert.deepEqual(request.body, { documentId: 'saved-document', reference: valid.reference });
});

test('intake validates email, type, date and size', async () => {
  for (const changes of [{ email: 'invalid' }, { email: 'test@example.org\r\nBcc:a@example.org' }, { type: 'admin' }, { receivedAt: 'invalid' }, { message: '' }]) {
    const request = ctx({ ...valid, ...changes });
    await controller.create(request);
    assert.equal(request.status, 400);
  }
  const request = ctx({ ...valid, extra: 'x'.repeat(17000) });
  await controller.create(request);
  assert.equal(request.status, 413);
});

test('delivery updates preserve original content and append bounded history', async () => {
  let current = { ...valid, deliveryEvents: [{ at: valid.receivedAt, status: 'received' }] };
  global.strapi = { documents: () => ({ findOne: async () => current, update: async ({ data }) => { current = { ...current, ...data }; } }) };
  for (const status of ['not_configured', 'failed', 'sent']) {
    const request = ctx({ status, at: valid.receivedAt, provider: 'resend', providerMessageId: 'provider-id', internalNotes: 'injected' });
    await controller.updateDelivery(request);
    assert.deepEqual(request.body, { ok: true });
    assert.equal(current.deliveryStatus, status);
  }
  assert.deepEqual(current.deliveryEvents.map(event => event.status), ['received', 'not_configured', 'failed', 'sent']);
  assert.equal(current.emailSentAt, valid.receivedAt);
  assert.equal(current.message, valid.message);
  assert.equal(current.internalNotes, undefined);
  for (let i = 0; i < 35; i++) await controller.updateDelivery(ctx({ status: 'sent' }));
  assert.equal(current.deliveryEvents.length, 30);
});

test('delivery failures and missing records return bounded errors', async () => {
  global.strapi = { log: { error() {} }, documents: () => ({ findOne: async () => null }) };
  const missing = ctx({ status: 'sent' });
  await controller.updateDelivery(missing);
  assert.equal(missing.status, 404);
  global.strapi.documents = () => ({ findOne: async () => { throw Error('private-secret'); } });
  const failed = ctx({ status: 'sent' });
  await controller.updateDelivery(failed);
  assert.equal(failed.status, 500);
  assert.deepEqual(failed.body, { error: 'storage_failed' });
  const invalid = ctx({ status: 'invented' });
  await controller.updateDelivery(invalid);
  assert.equal(invalid.status, 400);
});

test('inquiry has no public list/read routes and requires no publication', async () => {
  const { routes } = require('../pilot/cms/src/api/inquiry/routes/intake.js');
  assert.deepEqual(routes.map(route => route.method), ['POST', 'PATCH']);
  const schema = JSON.parse(await readFile(new URL('../pilot/cms/src/api/inquiry/content-types/inquiry/schema.json', import.meta.url)));
  assert.equal(schema.options.draftAndPublish, false);
  assert.equal(schema.attributes.reference.unique, true);
});

test('startup lock is connection-scoped, released once and does not expose connection settings', async () => {
  const queries = [];
  let closed = 0;
  const connect = async () => ({ on() {}, execute: async (sql, values) => { queries.push({ sql, values }); return [[{ acquired: 1 }]]; }, destroy() { closed++; } });
  const release = await acquireStartupLock({ client: 'mysql', connection: { database: 'test-db', password: 'private-secret' } }, connect);
  assert.match(queries[0].sql, /GET_LOCK/);
  assert.doesNotMatch(JSON.stringify(queries), /private-secret|test-db/);
  await release();
  await release();
  assert.equal(queries.length, 2);
  assert.match(queries[1].sql, /RELEASE_LOCK/);
  assert.equal(closed, 1);
});

test('startup lock failure closes connection and prevents unsafe startup', async () => {
  let closed = 0;
  const connect = async () => ({ on() {}, execute: async () => [[{ acquired: 0 }]], destroy() { closed++; } });
  await assert.rejects(acquireStartupLock({ client: 'mysql', connection: { database: 'test' } }, connect), /timeout/);
  assert.equal(closed, 1);
  let connected = false;
  await (await acquireStartupLock({ client: 'postgres' }, async () => { connected = true; }))();
  assert.equal(connected, false);
});
