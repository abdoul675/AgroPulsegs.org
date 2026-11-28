import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import QRCode from 'qrcode';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const assets = path.join(root, 'public/assets');
const destination = 'https://abdoul675.github.io/AgroPulsegs.org/yida-cashew.html';

await mkdir(assets, { recursive: true });

const options = {
  errorCorrectionLevel: 'H',
  margin: 5,
  width: 1600,
  color: { dark: '#123c31', light: '#ffffff' },
};

await QRCode.toFile(path.join(assets, 'yida-cashew-qr.png'), destination, options);
await writeFile(
  path.join(assets, 'yida-cashew-qr.svg'),
  await QRCode.toString(destination, { ...options, type: 'svg' }),
  'utf8',
);

console.log(`YIDA-Cashew QR generated for ${destination}`);
