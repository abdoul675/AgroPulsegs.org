const http = require('node:http');
const strapi = require('@strapi/strapi');

const host = process.env.HOST || '0.0.0.0';
const port = Number(process.env.PORT || 3000);

let requestHandler = (_req, res) => {
  res.statusCode = 503;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Retry-After', '5');
  res.end('Strapi is starting');
};

const server = http.createServer((req, res) => requestHandler(req, res));

server.listen(port, host, () => {
  console.log(`[bootstrap] listening on ${host}:${port}`);
});

let app;

async function startStrapi() {
  app = strapi.createStrapi();

  await app.load();
  app.server.mount();

  requestHandler = app.server.app.callback();

  if (typeof app.postListen === 'function') {
    await app.postListen();
  }

  console.log('[bootstrap] Strapi is ready');
}

async function shutdown(signal) {
  console.log(`[bootstrap] received ${signal}, shutting down`);

  try {
    if (app) {
      await app.destroy();
    }
  } catch (error) {
    console.error('[bootstrap] Strapi shutdown error:', error);
  }

  server.close(() => process.exit(0));

  setTimeout(() => process.exit(1), 10000).unref();
}

process.once('SIGTERM', () => void shutdown('SIGTERM'));
process.once('SIGINT', () => void shutdown('SIGINT'));

process.on('uncaughtException', (error) => {
  console.error('[bootstrap] uncaught exception:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('[bootstrap] unhandled rejection:', error);
});

startStrapi().catch((error) => {
  console.error('[bootstrap] Strapi failed to start:', error);
  server.close(() => process.exit(1));
});
