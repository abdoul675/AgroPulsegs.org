import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import QRCode from 'qrcode';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const assets = path.join(root, 'public/assets');
const socialAssets = path.join(assets, 'social');
const destination = 'https://abdoul675.github.io/AgroPulsegs.org/';

await mkdir(socialAssets, { recursive: true });
await QRCode.toFile(path.join(assets, 'agropulse-access-qr.png'), destination, {
  type: 'png',
  errorCorrectionLevel: 'H',
  margin: 5,
  width: 1200,
  color: { dark: '#0F2F44', light: '#FFFFFF' },
});
const svg = await QRCode.toString(destination, {
  type: 'svg',
  errorCorrectionLevel: 'H',
  margin: 5,
  width: 1200,
  color: { dark: '#0F2F44', light: '#FFFFFF' },
});
await writeFile(path.join(assets, 'agropulse-access-qr.svg'), svg, 'utf8');

const brands = [
  ['facebook', '0866FF'],
  ['x', 'FFFFFF'],
  ['tiktok', 'FFFFFF'],
  ['youtube', 'FFFFFF'],
];
for (const [name, color] of brands) {
  const source = path.join(root, 'node_modules/simple-icons/icons', `${name}.svg`);
  const icon = await readFile(source, 'utf8');
  const branded = icon
    .replace('<svg role="img"', `<svg role="img" fill="#${color}"`)
    .replace(`<title>${name[0].toUpperCase()}${name.slice(1)}</title>`, `<title>${name}</title>`);
  await writeFile(path.join(socialAssets, `${name}.svg`), branded, 'utf8');
}

console.log(`QR created for ${destination}`);
