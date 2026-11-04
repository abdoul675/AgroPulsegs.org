const environmentKeys = [
  'AGROPULSE_CMS_URL',
  'AGROPULSE_CMS_HOME_DOCUMENT_ID',
  'AGROPULSE_CMS_READ_TOKEN',
];

export class HomeContentError extends Error {
  constructor(code, statusCode = 502) {
    super(code);
    this.name = 'HomeContentError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

function configuration(env) {
  const values = environmentKeys.map(key => env[key]?.trim() || '');
  if (values.every(value => !value)) return null;
  if (values.some(value => !value)) throw new HomeContentError('cms_configuration_incomplete', 503);

  const [cmsUrl, documentId, token] = values;
  let baseUrl;
  try {
    baseUrl = new URL(cmsUrl);
  } catch {
    throw new HomeContentError('cms_configuration_invalid', 503);
  }

  const localHttpHosts = new Set(['localhost', '127.0.0.1', '[::1]']);
  if (
    !['https:', 'http:'].includes(baseUrl.protocol)
    || (baseUrl.protocol === 'http:' && !localHttpHosts.has(baseUrl.hostname))
    || baseUrl.username
    || baseUrl.password
    || baseUrl.pathname !== '/'
    || baseUrl.search
    || baseUrl.hash
    || !/^[a-zA-Z0-9_-]{1,200}$/u.test(documentId)
    || /[\r\n]/u.test(token)
  ) {
    throw new HomeContentError('cms_configuration_invalid', 503);
  }

  return { baseUrl, documentId, token };
}

function text(value, maximumLength) {
  if (typeof value !== 'string') return null;
  const clean = value.trim();
  return clean && clean.length <= maximumLength ? clean : null;
}

export async function readPublishedHome({ locale, env = process.env, fetchImpl = fetch }) {
  if (!['fr', 'en'].includes(locale)) throw new HomeContentError('unsupported_locale', 400);
  const config = configuration(env);
  if (!config) return { status: 'reference' };

  const endpoint = new URL(`/api/pages/${encodeURIComponent(config.documentId)}`, config.baseUrl);
  endpoint.searchParams.set('locale', locale);
  endpoint.searchParams.set('populate', '*');

  let response;
  try {
    response = await fetchImpl(endpoint, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${config.token}`,
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(5_000),
    });
  } catch {
    throw new HomeContentError('cms_unreachable');
  }

  if (response.status === 404) return { status: 'reference' };
  if (!response.ok) {
    throw new HomeContentError(response.status === 401 || response.status === 403 ? 'cms_auth_rejected' : 'cms_upstream_error');
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new HomeContentError('cms_invalid_response');
  }

  const hero = payload?.data?.sections?.find(section => section?.__component === 'content.hero');
  const title = text(hero?.title, 500);
  if (!title) throw new HomeContentError('cms_home_title_missing');

  return {
    status: 'published',
    content: {
      title,
      intro: text(hero.intro, 2000),
    },
  };
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
  });
  res.end(JSON.stringify(payload));
}

export function createHomeContentHandler({ env = process.env, fetchImpl = fetch, logError = console.error } = {}) {
  return async (req, res) => {
    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET');
      sendJson(res, 405, { error: 'method_not_allowed' });
      return;
    }

    const locale = new URL(req.url, 'http://localhost').searchParams.get('locale');
    if (!['fr', 'en'].includes(locale)) {
      sendJson(res, 400, { error: 'unsupported_locale' });
      return;
    }

    try {
      sendJson(res, 200, await readPublishedHome({ locale, env, fetchImpl }));
    } catch (error) {
      const code = error instanceof HomeContentError ? error.code : 'cms_unexpected_error';
      logError(`AgroPulse published homepage content unavailable (${code}).`);
      sendJson(res, error instanceof HomeContentError ? error.statusCode : 502, { status: 'unavailable' });
    }
  };
}
