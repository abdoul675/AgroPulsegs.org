'use strict';

const { timingSafeEqual } = require('node:crypto');

const UID = 'api::inquiry.inquiry';
const TYPES = new Set(['contact', 'partnership', 'training', 'quote', 'resources']);
const LOCALES = new Set(['fr', 'en']);
const DELIVERY_STATUSES = new Set(['sent', 'failed', 'not_configured']);
const EMAIL_PATTERN = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/u;

function sameSecret(left, right) {
  if (typeof left !== 'string' || typeof right !== 'string' || !left || !right) return false;
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

function authorised(ctx) {
  const expected = process.env.AGROPULSE_FORM_INGEST_TOKEN || '';
  const header = ctx.request.headers.authorization;
  const supplied = typeof header === 'string' && header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  return sameSecret(expected, supplied);
}

function text(value, maximum, required = false) {
  if (value === undefined || value === null) return required ? null : '';
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if ((required && !trimmed) || trimmed.length > maximum || /[\u0000\u0008\u000b\u000c\u007f]/u.test(trimmed)) return null;
  return trimmed;
}

function isoDate(value) {
  if (typeof value !== 'string') return null;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null;
}

function validateSubmission(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;

  const reference = text(body.reference, 80, true);
  const email = text(body.email, 254, true);
  const message = text(body.message, 5000, true);
  const name = text(body.name, 120);
  const organization = text(body.organization, 160);
  const receivedAt = isoDate(body.receivedAt);

  if (!reference || !/^[A-Za-z0-9._:-]+$/u.test(reference)) return null;
  if (!email || !EMAIL_PATTERN.test(email)) return null;
  if (!message || name === null || organization === null || !receivedAt) return null;
  if (!TYPES.has(body.type) || !LOCALES.has(body.locale)) return null;

  return {
    reference,
    receivedAt,
    type: body.type,
    locale: body.locale,
    name,
    email,
    organization,
    message,
    source: 'website',
    workflowStatus: 'new',
    deliveryStatus: 'received',
    deliveryEvents: [{ at: receivedAt, status: 'received' }],
  };
}

function deliveryUpdate(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body) || !DELIVERY_STATUSES.has(body.status)) return null;

  const provider = text(body.provider, 50);
  const providerMessageId = text(body.providerMessageId, 255);
  const error = text(body.error, 500);
  const at = isoDate(body.at) || new Date().toISOString();

  if (provider === null || providerMessageId === null || error === null) return null;

  return {
    status: body.status,
    provider,
    providerMessageId,
    error,
    at,
  };
}

function deny(ctx) {
  ctx.status = 401;
  ctx.body = { error: 'unauthorized' };
}

function oversized(ctx) {
  if (Buffer.byteLength(JSON.stringify(ctx.request.body ?? null), 'utf8') <= 16 * 1024) return false;
  ctx.status = 413;
  ctx.body = { error: 'payload_too_large' };
  return true;
}

module.exports = {
  async create(ctx) {
    if (!authorised(ctx)) return deny(ctx);
    if (oversized(ctx)) return;

    const data = validateSubmission(ctx.request.body);
    if (!data) {
      ctx.status = 400;
      ctx.body = { error: 'invalid_submission' };
      return;
    }

    try {
      const document = await strapi.documents(UID).create({ data });
      ctx.status = 201;
      ctx.body = { documentId: document.documentId, reference: document.reference };
    } catch (error) {
      strapi.log.error('AgroPulse inquiry intake failed.');
      ctx.status = 500;
      ctx.body = { error: 'storage_failed' };
    }
  },

  async updateDelivery(ctx) {
    if (!authorised(ctx)) return deny(ctx);
    if (oversized(ctx)) return;

    const documentId = text(ctx.params.documentId, 64, true);
    const update = deliveryUpdate(ctx.request.body);
    if (!documentId || !update) {
      ctx.status = 400;
      ctx.body = { error: 'invalid_delivery_update' };
      return;
    }

    try {
      const current = await strapi.documents(UID).findOne({ documentId });
      if (!current) {
        ctx.status = 404;
        ctx.body = { error: 'not_found' };
        return;
      }

      const previousEvents = Array.isArray(current.deliveryEvents) ? current.deliveryEvents.slice(-29) : [];
      const event = {
        at: update.at,
        status: update.status,
        ...(update.provider ? { provider: update.provider } : {}),
        ...(update.providerMessageId ? { providerMessageId: update.providerMessageId } : {}),
        ...(update.error ? { error: update.error } : {}),
      };

      const data = {
        deliveryStatus: update.status,
        deliveryProvider: update.provider || current.deliveryProvider || '',
        providerMessageId: update.providerMessageId || current.providerMessageId || '',
        deliveryError: update.error || '',
        deliveryEvents: [...previousEvents, event],
        ...(update.status === 'sent' ? { emailSentAt: update.at } : {}),
      };

      await strapi.documents(UID).update({ documentId, data });
      ctx.body = { ok: true };
    } catch {
      strapi.log.error('AgroPulse inquiry delivery update failed.');
      ctx.status = 500;
      ctx.body = { error: 'storage_failed' };
    }
  },
};
