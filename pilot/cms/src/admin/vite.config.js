const { mergeConfig } = require('vite');
module.exports = config => {
  const url = new URL(process.env.VITE_AGROPULSE_SITE_URL || 'http://127.0.0.1:4173');
  if (url.username || url.password || !['http:', 'https:'].includes(url.protocol) || (url.protocol === 'http:' && !['127.0.0.1','localhost','[::1]'].includes(url.hostname))) throw new Error('The visual editor requires HTTPS or a loopback preview address.');
  return mergeConfig(config, { define: { 'import.meta.env.VITE_AGROPULSE_SITE_URL': JSON.stringify(url.href) } });
};
