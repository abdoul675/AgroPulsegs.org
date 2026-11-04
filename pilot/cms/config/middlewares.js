const previewAddress = new URL(process.env.VITE_AGROPULSE_SITE_URL || 'http://127.0.0.1:4173');
const previewOrigin = previewAddress.protocol === 'https:' || (previewAddress.protocol === 'http:' && ['127.0.0.1','localhost','[::1]'].includes(previewAddress.hostname)) ? previewAddress.origin : null;
module.exports = [
  'strapi::logger',
  'strapi::errors',
  { name: 'strapi::security', config: { contentSecurityPolicy: { directives: { 'frame-src': ["'self'", ...(previewOrigin ? [previewOrigin] : [])] } } } },
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'global::media-import-closed',
  'global::editorial-language',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
