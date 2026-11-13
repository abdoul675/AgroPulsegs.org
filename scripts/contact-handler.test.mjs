import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import test from 'node:test';
import { createContactHandler as realContactHandler } from './contact-handler.mjs';

const storageEnvironment = { AGROPULSE_CMS_URL: 'https://cms.example.org', AGROPULSE_FORM_INGEST_TOKEN: 'test-ingest-secret' };
function createContactHandler(options) {
 const provider=options.fetchImpl;
 return realContactHandler({...options,fetchImpl:async(url,config)=>{
  if(String(url).endsWith('/api/inquiries/intake')) {
   const body=JSON.parse(config.body);
   assert.equal(config.headers.Authorization,'Bearer test-ingest-secret');
   return Response.json({documentId:'test-document',reference:body.reference},{status:201});
  }
  if(config.method==='PATCH')return Response.json({ok:true});
  return provider(url,config);
 }});
}
const mailEnvironment = {
 ...storageEnvironment,
  AGROPULSE_RECIPIENT_EMAIL: 'programsagropulsegs@gmail.com',
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
      const result=await response.json(); assert.equal(result.ok,true); if(result.reference)assert.match(result.reference,/^AGP-/u);
    }
  });

  assert.equal(sent.length, 5);
  for (const { url, options, payload } of sent) {
    assert.equal(url, 'https://api.resend.com/emails');
    assert.equal(options.headers.Authorization, 'Bearer test-key');
    assert.deepEqual(payload.to, ['programsagropulsegs@gmail.com']);
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
    const result=await response.json(); assert.equal(result.ok,true); if(result.reference)assert.match(result.reference,/^AGP-/u);
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
    assert.deepEqual(await response.json(), { error: 'service_not_configured' });
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
    const result=await response.json(); assert.equal(result.ok,true); if(result.reference)assert.match(result.reference,/^AGP-/u);
  });

  assert.equal(called, false);
});

test('limits distinct submissions per email and rejects oversized payloads', async () => {
  const handler = createContactHandler({
    env: mailEnvironment,
    fetchImpl: async () => new Response(null, { status: 200 }),
  });

  await withServer((req, res) => void handler(req, res), async base => {
    for (let count = 0; count < 5; count += 1) {
      const response = await request(`${base}/api/contact`, { ...validSubmission, message: validSubmission.message + count });
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
      assert.equal(response.status, 202);
      const result=await response.json(); assert.equal(result.ok,true); assert.equal(result.delivery,'stored_email_failed');
    });
  } finally {
    console.error = originalError;
  }
});

test('untrusted contact text is escaped in email HTML and cannot choose recipients',async()=>{
 let email;
 const handler=createContactHandler({env:mailEnvironment,fetchImpl:async(_url,options)=>{email=JSON.parse(options.body);return new Response(null,{status:200});}});
 const marker='<img src=x onerror="auditCanary()">';
 await withServer((req,res)=>void handler(req,res),async base=>{
  const response=await request(base+'/api/contact',{...validSubmission,name:marker,organization:'<b>fictional</b>',message:marker,to:'other@example.org',bcc:['other@example.org']});
  assert.equal(response.status,200);
 });
 assert.ok(!email.html.includes('<img'));
 assert.ok(email.html.includes('&lt;img'));
 assert.ok(!email.html.includes('<b>fictional</b>'));
 assert.deepEqual(email.to,[mailEnvironment.AGROPULSE_RECIPIENT_EMAIL]);
 assert.equal(email.bcc,undefined);
 assert.equal(email.reply_to,validSubmission.email);
});

test('email header injection is rejected before contacting the provider',async()=>{
 let calls=0;
 const handler=createContactHandler({env:mailEnvironment,fetchImpl:async()=>{calls++;throw Error('Provider must not be called');}});
 await withServer((req,res)=>void handler(req,res),async base=>{
  const response=await request(base+'/api/contact',{...validSubmission,email:'aicha@example.org\r\nBcc: other@example.org'});
  assert.equal(response.status,400);
 });
 assert.equal(calls,0);
});

test('storage precedes mail and delivery history is updated', async () => {
  const calls = [];
  const handler = realContactHandler({ env: mailEnvironment, fetchImpl: async (url, options) => {
    const payload = JSON.parse(options.body);
    calls.push({ url: String(url), method: options.method, payload });
    if (calls.length === 1) return Response.json({ documentId: 'stored-doc', reference: payload.reference }, { status: 201 });
    if (options.method === 'PATCH') return Response.json({ ok: true });
    return Response.json({ id: 'resend-message' });
  }});
  await withServer(handler, async base => {
    const response = await request(base, validSubmission);
    assert.equal(response.status, 200);
    assert.match((await response.json()).reference, /^AGP-/);
  });
  assert.deepEqual(calls.map(call => call.method), ['POST', 'POST', 'PATCH']);
  assert.match(calls[0].url, /inquiries\/intake$/);
  assert.equal(calls[0].payload.email, validSubmission.email);
  assert.ok(Number.isFinite(Date.parse(calls[0].payload.receivedAt)));
  assert.equal(calls[2].payload.status, 'sent');
  assert.equal(calls[2].payload.providerMessageId, 'resend-message');
});

test('logs delivery history failures without exposing details or losing the stored request', async () => {
  const originalError = console.error;
  for (const mode of ['http', 'network']) {
    const errors = [];
    const calls = [];
    console.error = message => errors.push(String(message));
    try {
      const handler = realContactHandler({ env: mailEnvironment, fetchImpl: async (url, options) => {
        calls.push({ url: String(url), method: options.method });
        if (String(url).endsWith('/intake') && options.method !== 'PATCH') {
          const data = JSON.parse(options.body);
          return Response.json({ documentId: 'stored-doc', reference: data.reference }, { status: 201 });
        }
        if (options.method === 'PATCH') {
          if (mode === 'network') throw Error('private-ingest-secret');
          return new Response('private database error', { status: 503 });
        }
        return Response.json({ id: 'resend-message' });
      }});

      await withServer(handler, async base => {
        const response = await request(base, validSubmission);
        assert.equal(response.status, 200);
        assert.equal((await response.json()).delivery, 'sent');
      });
    } finally {
      console.error = originalError;
    }

    assert.deepEqual(calls.map(call => call.method), ['POST', 'POST', 'PATCH']);
    assert.deepEqual(errors, [mode === 'network'
      ? 'AgroPulse delivery history update failed (network error).'
      : 'AgroPulse delivery history update failed with HTTP 503.']);
    assert.doesNotMatch(errors.join(' '), /private-ingest-secret|private database error/u);
  }
});

for (const mode of ['unconfigured', 'mail_http_error', 'mail_network_error', 'patch_error']) {
  test(`durable request survives ${mode}`, async () => {
    const saved = [];
    const events = [];
    const env = mode === 'unconfigured' || mode === 'patch_error' ? storageEnvironment : mailEnvironment;
    const handler = realContactHandler({ env, fetchImpl: async (url, options) => {
      const data = JSON.parse(options.body);
      if (String(url).endsWith('/intake')) {
        saved.push(data);
        return Response.json({ documentId: 'saved', reference: data.reference }, { status: 201 });
      }
      if (options.method === 'PATCH') {
        events.push(data);
        if (mode === 'patch_error') throw Error('private-token');
        return Response.json({ ok: true });
      }
      assert.equal(saved.length, 1);
      if (mode === 'mail_network_error') throw Error('private-token');
      return new Response('private-token', { status: 503 });
    }});
    await withServer(handler, async base => {
      const response = await request(base, validSubmission);
      assert.equal(response.status, 202);
      const body = await response.text();
      assert.equal(JSON.parse(body).ok, true);
      assert.doesNotMatch(body, /private-token|test-key|test-ingest-secret/);
    });
    assert.equal(saved.length, 1);
    assert.equal(events[0].status, mode.startsWith('mail_') ? 'failed' : 'not_configured');
  });
}

for (const mode of ['401', '503', 'network', 'invalid_json', 'missing_id', 'missing_token']) {
  test(`storage ${mode} never sends email or claims receipt`, async () => {
    let calls = 0;
    const handler = realContactHandler({ env: { ...mailEnvironment, ...(mode === 'missing_token' ? { AGROPULSE_FORM_INGEST_TOKEN: '' } : {}) }, fetchImpl: async (url) => {
      calls++;
      assert.match(String(url), /inquiries\/intake$/);
      if (mode === 'network') throw Error('private-secret');
      if (mode === 'invalid_json') return new Response('private-secret');
      if (mode === 'missing_id') return Response.json({});
      return new Response('private-secret', { status: Number(mode) });
    }});
    await withServer(handler, async base => {
      const response = await request(base, validSubmission);
      assert.equal(response.status, 503);
      const body = await response.text();
      assert.doesNotMatch(body, /private-secret|test-ingest-secret|test-key/);
      assert.equal(JSON.parse(body).ok, undefined);
    });
    assert.equal(calls, mode === 'missing_token' ? 0 : 1);
  });
}


test('independent visitors behind the same proxy do not share the normal quota', async () => {
 const handler=createContactHandler({env:mailEnvironment,fetchImpl:async()=>Response.json({id:'test'})});
 await withServer(handler,async base=>{
  for(let i=0;i<12;i++)assert.equal((await request(base,{...validSubmission,email:'visitor'+i+'@example.org'})).status,200);
 });
});

test('invalid and honeypot submissions do not exhaust a valid email quota', async () => {
 let sends=0;
 const handler=createContactHandler({env:mailEnvironment,fetchImpl:async()=>{sends++;return Response.json({id:'test'});}});
 await withServer(handler,async base=>{
  for(let i=0;i<6;i++){
   assert.equal((await request(base,{...validSubmission,consent:false})).status,400);
   assert.equal((await request(base,{...validSubmission,website:'spam.example'})).status,202);
  }
  assert.equal((await request(base,validSubmission)).status,200);
 });
 assert.equal(sends,1);
});

test('quota normalizes email, ignores forged forwarding headers and reports when to retry', async () => {
 let clock=0;
 const handler=createContactHandler({env:mailEnvironment,now:()=>clock,fetchImpl:async()=>Response.json({id:'test'})});
 await withServer(handler,async base=>{
  for(let i=0;i<5;i++)assert.equal((await request(base,{...validSubmission,message:'Request '+i})).status,200);
  clock=61_000;
  const blocked=await request(base,{...validSubmission,email:'  AICHA@EXAMPLE.ORG  ',message:'Another request'},{headers:{'X-Forwarded-For':'192.0.2.99','X-Real-IP':'192.0.2.100'}});
  assert.equal(blocked.status,429);
  assert.equal(blocked.headers.get('Retry-After'),'839');
  assert.equal((await blocked.json()).retryAfter,839);
  clock=900_000;
  assert.equal((await request(base,{...validSubmission,message:'After cooldown'})).status,200);
 });
});

test('short flood guard still stops bursts and recovers after one minute', async () => {
 let clock=0;
 const handler=createContactHandler({env:mailEnvironment,now:()=>clock,fetchImpl:async()=>Response.json({id:'test'})});
 await withServer(handler,async base=>{
  for(let i=0;i<60;i++)assert.equal((await request(base,{...validSubmission,consent:false})).status,400);
  const blocked=await request(base,validSubmission);
  assert.equal(blocked.status,429);assert.equal(blocked.headers.get('Retry-After'),'60');
  clock=60_000;
  assert.equal((await request(base,validSubmission)).status,200);
 });
});

test('identical simultaneous retries share durable storage and notification, then expire', async () => {
 let clock=0,stored=0,sent=0,release;
 const gate=new Promise(resolve=>release=resolve);
 const handler=realContactHandler({env:mailEnvironment,now:()=>clock,fetchImpl:async(url,config)=>{
  if(config.method==='PATCH')return Response.json({ok:true});
  if(String(url).endsWith('/api/inquiries/intake')){stored++;await gate;return Response.json({documentId:'test',reference:JSON.parse(config.body).reference},{status:201});}
  sent++;return Response.json({id:'test'});
 }});
 await withServer(handler,async base=>{
  const first=request(base,validSubmission),second=request(base,validSubmission);
  // The barrier keeps the first persistence pending while the retry arrives.
  await new Promise(resolve=>setTimeout(resolve,30));release();
  const results=await Promise.all([first,second]);const bodies=await Promise.all(results.map(r=>r.json()));
  assert.equal(stored,1);assert.equal(sent,1);assert.equal(bodies[0].reference,bodies[1].reference);
  assert.equal(bodies.filter(b=>b.duplicate===true).length,1);
  const retry=await (await request(base,{...validSubmission,email:'AICHA@example.org'})).json();
  assert.equal(retry.duplicate,true);assert.equal(retry.reference,bodies[0].reference);assert.equal(sent,1);
  for(let i=0;i<4;i++)assert.equal((await request(base,{...validSubmission,message:'Distinct '+i})).status,200);
  assert.equal((await request(base,{...validSubmission,message:'Sixth distinct'})).status,429);
  clock=900_000;
  assert.equal((await request(base,validSubmission)).status,200);assert.equal(stored,6);
 });
});

test('failed storage retries do not consume the durable submission allowance', async () => {
 let unavailable=true;
 const handler=realContactHandler({env:mailEnvironment,fetchImpl:async(url,config)=>{
  if(config.method==='PATCH')return Response.json({ok:true});
  if(String(url).endsWith('/api/inquiries/intake'))return unavailable?new Response(null,{status:503}):Response.json({documentId:'test',reference:JSON.parse(config.body).reference},{status:201});
  return Response.json({id:'test'});
 }});
 await withServer(handler,async base=>{
  for(let i=0;i<7;i++)assert.equal((await request(base,validSubmission)).status,503);
  unavailable=false;
  assert.equal((await request(base,validSubmission)).status,200);
 });
});
