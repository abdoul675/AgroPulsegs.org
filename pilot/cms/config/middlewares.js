const previewAddress = new URL(process.env.VITE_AGROPULSE_SITE_URL || 'http://127.0.0.1:4173');
const previewOrigin = previewAddress.protocol === 'https:' || (previewAddress.protocol === 'http:' && ['127.0.0.1','localhost','[::1]'].includes(previewAddress.hostname)) ? previewAddress.origin : null;
const cmsAddress = new URL(process.env.PUBLIC_CMS_URL || 'http://127.0.0.1:' + (process.env.PORT || '1338'));
const trustedOrigins = [...new Set([previewOrigin, cmsAddress.origin].filter(Boolean))];
module.exports = [
  'strapi::logger',
  'strapi::errors',
  { name: 'strapi::security', config: { contentSecurityPolicy: { directives: { 'frame-src': ["'self'", ...(previewOrigin ? [previewOrigin] : [])] } } } },
  { name: 'strapi::cors', config: { origin: trustedOrigins, credentials: true, maxAge: 600 } },
  'strapi::poweredBy',
  'strapi::query',
  // Reject disabled media mutations before parsing or allocating their request body.
  'global::media-import-closed',
  'strapi::body',
  'global::editorial-language',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
