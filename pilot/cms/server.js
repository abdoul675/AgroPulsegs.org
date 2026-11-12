const http = require('node:http');
const strapi = require('@strapi/strapi');
const { acquireStartupLock } = require('./startup-lock');

const host = process.env.HOST || '0.0.0.0';
const port = Number(process.env.PORT || 3000);
const startupRequestTimeoutMs = Number(process.env.STARTUP_REQUEST_TIMEOUT_MS || 20000);

let app;
let strapiHandler = null;
let startupError = null;
let shuttingDown = false;

function sendStartupUnavailable(res, message = 'Strapi is starting') {
  if (res.writableEnded || res.destroyed) return;

  const body = JSON.stringify({
    data: null,
    error: {
      status: 503,
      name: 'ServiceUnavailableError',
      message,
    },
  });

  res.statusCode = 503;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Retry-After', '2');
  res.end(body);
}

function waitForStrapi(req, res) {
  const startedAt = Date.now();

  const forwardWhenReady = () => {
    if (res.writableEnded || res.destroyed) return;

    if (strapiHandler) {
      strapiHandler(req, res);
      return;
    }

    if (startupError) {
      sendStartupUnavailable(res, 'Strapi failed to start');
      return;
    }

    if (Date.now() - startedAt >= startupRequestTimeoutMs) {
      sendStartupUnavailable(res);
      return;
    }

    setTimeout(forwardWhenReady, 100);
  };

  forwardWhenReady();
}

const server = http.createServer((req, res) => waitForStrapi(req, res));

server.listen(port, host, () => {
  console.log(`[bootstrap] listening on ${host}:${port}`);
});

async function startStrapi() {
  const signals = ['SIGTERM', 'SIGINT'];
  const existing = new Map(signals.map(signal => [signal, process.listeners(signal)]));
  app = strapi.createStrapi();
  // This launcher owns the HTTP server and shutdown. Strapi also installs native
  // handlers in createStrapi(); letting both run destroys every plugin twice.
  for (const signal of signals) {
    for (const listener of process.listeners(signal)) {
      if (!existing.get(signal).includes(listener)) process.removeListener(signal, listener);
    }
  }
  console.log('[bootstrap] waiting for database startup lock');
  const release = await acquireStartupLock(app.config.get('database.connection'));
  try {
    console.log('[bootstrap] loading Strapi');
    await app.load();
  } finally {
    await release();
  }
  if (shuttingDown) return;
  app.server.mount();

  strapiHandler = app.server.app.callback();

  if (typeof app.postListen === 'function') {
    await app.postListen();
  }

  console.log('[bootstrap] Strapi is ready');
}

async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  strapiHandler = null;
  console.log(`[bootstrap] received ${signal}, shutting down`);
  setTimeout(() => process.exit(1), 10000).unref();

  try {
    if (app) {
      await app.destroy();
    }
  } catch (error) {
    console.error('[bootstrap] Strapi shutdown error:', error);
  }

  server.close(() => process.exit(0));
}

process.once('SIGTERM', () => void shutdown('SIGTERM'));
process.once('SIGINT', () => void shutdown('SIGINT'));

process.on('uncaughtException', (error) => {
  console.error('[bootstrap] uncaught exception:', error);
  void shutdown('uncaughtException');
});

process.on('unhandledRejection', (error) => {
  console.error('[bootstrap] unhandled rejection:', error);
  void shutdown('unhandledRejection');
});

startStrapi().catch((error) => {
  startupError = error;
  console.error('[bootstrap] Strapi failed to start:', error);
  void shutdown('startup failure');
});
