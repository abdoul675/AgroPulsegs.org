const MAX_BODY_BYTES = 16 * 1024;
const RATE_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT = 5;
const EMAIL_PATTERN = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/u;
const REQUEST_TYPES = new Set(['contact', 'partnership', 'training', 'quote']);
const TYPE_LABELS = {
  fr: {
    contact: 'Contact général',
    partnership: 'Demande de partenariat',
    training: 'Formation / YIDA-Cashew / AGIR-IA',
    quote: 'Demande de devis',
  },
  en: {
    contact: 'General enquiry',
    partnership: 'Partnership enquiry',
    training: 'Training / YIDA-Cashew / AGIR-IA',
    quote: 'Quote request',
  },
};

function respond(res, status, payload) {
  res.writeHead(status, {
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
  });
  res.end(JSON.stringify(payload));
}

function isValidOrigin(req) {
  const origin = req.headers.origin;
  const host = req.headers.host;
  if (typeof origin !== 'string' || typeof host !== 'string') return false;

  try {
    const parsedOrigin = new URL(origin);
    return ['http:', 'https:'].includes(parsedOrigin.protocol)
      && parsedOrigin.host.toLowerCase() === host.toLowerCase();
  } catch {
    return false;
  }
}

async function readJsonBody(req) {
  const contentType = req.headers['content-type']?.split(';', 1)[0].trim().toLowerCase();
  if (contentType !== 'application/json') {
    return { error: 'unsupported_media_type' };
  }

  const declaredLength = Number(req.headers['content-length'] || 0);
  if (declaredLength > MAX_BODY_BYTES) {
    req.resume();
    return { error: 'payload_too_large' };
  }

  const chunks = [];
  let length = 0;
  for await (const chunk of req) {
    length += chunk.length;
    if (length > MAX_BODY_BYTES) {
      req.resume();
      return { error: 'payload_too_large' };
    }
    chunks.push(chunk);
  }

  try {
    return { value: JSON.parse(Buffer.concat(chunks).toString('utf8')) };
  } catch {
    return { error: 'invalid_json' };
  }
}

function validateSubmission(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null;

  const name = typeof input.name === 'string' ? input.name.trim() : '';
  const email = typeof input.email === 'string' ? input.email.trim() : '';
  const organization = typeof input.organization === 'string' ? input.organization.trim() : '';
  const message = typeof input.message === 'string' ? input.message.trim() : '';
  const type = input.type;
  const locale = input.locale;

  if (input.consent !== true) return null;
  if (name.length < 1 || name.length > 120 || /[\u0000-\u001f\u007f]/u.test(name)) return null;
  if (email.length > 254 || !EMAIL_PATTERN.test(email)) return null;
  if (organization.length > 160 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(organization)) return null;
  if (message.length < 1 || message.length > 5000 || /[\u0000\u0008\u000b\u000c\u000e\u007f]/u.test(message)) return null;
  if (!REQUEST_TYPES.has(type) || !['fr', 'en'].includes(locale)) return null;

  return { name, email, organization, message, type, locale };
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/gu, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);
}

function validRecipient(value) {
  return typeof value === 'string' && EMAIL_PATTERN.test(value.trim());
}

function validSender(value) {
  if (typeof value !== 'string' || value.length > 320 || /[\r\n]/u.test(value)) return false;
  const trimmed = value.trim();
  const angleAddress = trimmed.match(/<([^<>]+)>$/u);
  return EMAIL_PATTERN.test(angleAddress ? angleAddress[1] : trimmed);
}

function getClientKey(req) {
  return req.socket.remoteAddress || 'unknown';
}

function allowSubmission(req, limits, now) {
  const key = getClientKey(req);
  const current = limits.get(key);
  if (current && now - current.startedAt < RATE_WINDOW_MS) {
    if (current.count >= RATE_LIMIT) return false;
    current.count += 1;
    return true;
  }

  if (limits.size >= 10_000) {
    for (const [address, entry] of limits) {
      if (now - entry.startedAt >= RATE_WINDOW_MS) limits.delete(address);
    }
    if (limits.size >= 10_000 && !limits.has(key)) return false;
  }
  limits.set(key, { startedAt: now, count: 1 });
  return true;
}

function buildEmail(submission) {
  const label = TYPE_LABELS[submission.locale][submission.type];
  const lines = [
    `Type: ${label}`,
    `Name: ${submission.name}`,
    `Email: ${submission.email}`,
    `Organization: ${submission.organization || '—'}`,
    '',
    submission.message,
  ];
  const text = lines.join('\n');
  const html = `<h2>${escapeHtml(label)}</h2><dl><dt>Name</dt><dd>${escapeHtml(submission.name)}</dd><dt>Email</dt><dd>${escapeHtml(submission.email)}</dd><dt>Organization</dt><dd>${escapeHtml(submission.organization || '—')}</dd></dl><p>${escapeHtml(submission.message).replace(/\n/gu, '<br>')}</p>`;
  return { label, text, html };
}

export function createContactHandler({
  env = process.env,
  fetchImpl = fetch,
  now = Date.now,
  limits = new Map(),
} = {}) {
  return async function handleContact(req, res) {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      respond(res, 405, { error: 'method_not_allowed' });
      return;
    }

    if (!isValidOrigin(req) || req.headers['sec-fetch-site'] === 'cross-site') {
      respond(res, 403, { error: 'origin_not_allowed' });
      return;
    }

    if (!allowSubmission(req, limits, now())) {
      respond(res, 429, { error: 'too_many_requests' });
      return;
    }

    const body = await readJsonBody(req);
    if (body.error === 'unsupported_media_type') {
      respond(res, 415, { error: body.error });
      return;
    }
    if (body.error === 'payload_too_large') {
      respond(res, 413, { error: body.error });
      return;
    }
    if (body.error) {
      respond(res, 400, { error: body.error });
      return;
    }

    const submission = validateSubmission(body.value);
    if (!submission) {
      respond(res, 400, { error: 'invalid_submission' });
      return;
    }

    if (typeof body.value.website === 'string' && body.value.website.trim()) {
      respond(res, 202, { ok: true });
      return;
    }

    const recipient = env.AGROPULSE_RECIPIENT_EMAIL?.trim();
    const sender = env.EMAIL_FROM?.trim();
    const apiKey = env.RESEND_API_KEY?.trim();
    if (!validRecipient(recipient) || !validSender(sender) || !apiKey) {
      respond(res, 503, { error: 'email_not_configured' });
      return;
    }

    const email = buildEmail(submission);
    let delivery;
    try {
      delivery = await fetchImpl('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: sender,
          to: [recipient],
          reply_to: submission.email,
          subject: `[AgroPulse] ${email.label}`,
          text: email.text,
          html: email.html,
        }),
        signal: AbortSignal.timeout(10_000),
      });
    } catch (error) {
      console.error(`AgroPulse email delivery failed (${error.name || 'network error'}).`);
      respond(res, 502, { error: 'email_delivery_failed' });
      return;
    }

    if (!delivery.ok) {
      console.error(`AgroPulse email provider returned HTTP ${delivery.status}.`);
      respond(res, 502, { error: 'email_delivery_failed' });
      return;
    }

    respond(res, 200, { ok: true });
  };
}
