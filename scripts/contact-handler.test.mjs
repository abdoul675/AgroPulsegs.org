import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import test from 'node:test';
import { createContactHandler } from './contact-handler.mjs';

const mailEnvironment = {
  AGROPULSE_RECIPIENT_EMAIL: 'contact@example.org',
  EMAIL_FROM: 'AgroPulse <notifications@example.org>',
  RESEND_API_KEY: 'test-key',
};

const validSubmission = {
  name: 'Aïcha Test',
  email: 'aicha@example.org',
  organization: 'Coopérative Test',
  message: 'Bonjour, nous souhaitons échanger.',
  type: 'contact',
  locale: 'fr',
  consent: true,
};

async function withServer(handler, run) {
  const server = createServer(handler);
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  try {
    const address = server.address();
    return await run(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise((resolve, reject) => {
      server.close(error => error ? reject(error) : resolve());
    });
  }
}

function request(url, body, options = {}) {
  return fetch(url, {
    method: options.method || 'POST',
    headers: {
      Origin: options.origin || new URL(url).origin,
      'Content-Type': options.contentType || 'application/json',
      ...(options.headers || {}),
    },
    body: options.rawBody ?? JSON.stringify(body),
  });
}

test('sends each supported request category to the configured recipient', async () => {
  const sent = [];
  const handler = createContactHandler({
    env: mailEnvironment,
    fetchImpl: async (url, options) => {
      sent.push({ url, options, payload: JSON.parse(options.body) });
      return new Response(null, { status: 200 });
    },
  });

  await withServer((req, res) => void handler(req, res), async base => {
    for (const type of ['contact', 'partnership', 'training', 'quote', 'resources']) {
      const response = await request(`${base}/api/contact`, { ...validSubmission, type });
      assert.equal(response.status, 200);
      assert.deepEqual(await response.json(), { ok: true });
    }
  });

  assert.equal(sent.length, 5);
  for (const { url, options, payload } of sent) {
    assert.equal(url, 'https://api.resend.com/emails');
    assert.equal(options.headers.Authorization, 'Bearer test-key');
    assert.deepEqual(payload.to, ['contact@example.org']);
    assert.equal(payload.reply_to, validSubmission.email);
  }
  assert.match(sent[0].payload.text, /Contact général/u);
  assert.match(sent[4].payload.subject, /Demande d’information sur les ressources/u);
});

test('accepts a resource notification request with only email and consent', async () => {
  let sentEmail;
  const handler = createContactHandler({
    env: mailEnvironment,
    fetchImpl: async (_url, options) => {
      sentEmail = JSON.parse(options.body);
      return new Response(null, { status: 200 });
    },
  });

  await withServer((req, res) => void handler(req, res), async base => {
    const response = await request(`${base}/api/contact`, {
      email: 'reader@example.org',
      type: 'resources',
      locale: 'fr',
      consent: true,
    });
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { ok: true });
  });

  assert.equal(sentEmail.reply_to, 'reader@example.org');
  assert.match(sentEmail.text, /Demande à être informé/u);
  assert.match(sentEmail.text, /Name: —/u);
});

test('does not send email or expose credentials when delivery is not configured', async () => {
  let called = false;
  const handler = createContactHandler({ env: {}, fetchImpl: async () => { called = true; } });

  await withServer((req, res) => void handler(req, res), async base => {
    const response = await request(`${base}/api/contact`, validSubmission);
    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), { error: 'email_not_configured' });
  });

  assert.equal(called, false);
});

test('rejects cross-origin and invalid requests', async () => {
  const handler = createContactHandler({ env: mailEnvironment, fetchImpl: async () => new Response(null, { status: 200 }) });

  await withServer((req, res) => void handler(req, res), async base => {
    const crossOrigin = await request(`${base}/api/contact`, validSubmission, { origin: 'https://attacker.example' });
    assert.equal(crossOrigin.status, 403);

    const invalidType = await request(`${base}/api/contact`, { ...validSubmission, type: 'admin' });
    assert.equal(invalidType.status, 400);

    const wrongContentType = await request(`${base}/api/contact`, validSubmission, { contentType: 'text/plain' });
    assert.equal(wrongContentType.status, 415);

    const malformedJson = await request(`${base}/api/contact`, null, { rawBody: '{' });
    assert.equal(malformedJson.status, 400);
  });
});

test('silently accepts honeypot submissions without sending email', async () => {
  let called = false;
  const handler = createContactHandler({
    env: mailEnvironment,
    fetchImpl: async () => { called = true; return new Response(null, { status: 200 }); },
  });

  await withServer((req, res) => void handler(req, res), async base => {
    const response = await request(`${base}/api/contact`, { ...validSubmission, website: 'bot' });
    assert.equal(response.status, 202);
    assert.deepEqual(await response.json(), { ok: true });
  });

  assert.equal(called, false);
});

test('limits submissions per client and rejects oversized payloads', async () => {
  const handler = createContactHandler({
    env: mailEnvironment,
    fetchImpl: async () => new Response(null, { status: 200 }),
  });

  await withServer((req, res) => void handler(req, res), async base => {
    for (let count = 0; count < 5; count += 1) {
      const response = await request(`${base}/api/contact`, validSubmission);
      assert.equal(response.status, 200);
    }
    const limited = await request(`${base}/api/contact`, validSubmission);
    assert.equal(limited.status, 429);
  });

  const oversizedHandler = createContactHandler({
    env: mailEnvironment,
    fetchImpl: async () => new Response(null, { status: 200 }),
  });
  await withServer((req, res) => void oversizedHandler(req, res), async base => {
    const response = await request(`${base}/api/contact`, null, {
      rawBody: JSON.stringify({ ...validSubmission, message: 'x'.repeat(20_000) }),
    });
    assert.equal(response.status, 413);
  });
});

test('reports provider failure without returning provider details', async () => {
  const originalError = console.error;
  console.error = () => {};
  try {
    const handler = createContactHandler({
      env: mailEnvironment,
      fetchImpl: async () => new Response('private provider response', { status: 401 }),
    });

    await withServer((req, res) => void handler(req, res), async base => {
      const response = await request(`${base}/api/contact`, validSubmission);
      assert.equal(response.status, 502);
      assert.deepEqual(await response.json(), { error: 'email_delivery_failed' });
    });
  } finally {
    console.error = originalError;
  }
});
