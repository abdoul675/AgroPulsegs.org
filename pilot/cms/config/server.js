module.exports = ({ env }) => ({
  logger:{updates:{enabled:false}},
  host: env('HOST', '127.0.0.1'),
  port: env.int('PORT', 1337),
  ...(env('PUBLIC_CMS_URL') ? {url:env('PUBLIC_CMS_URL')} : {}),
  app: {
    keys: env.array('APP_KEYS'),
  },
  webhooks: {
    populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  },
});
