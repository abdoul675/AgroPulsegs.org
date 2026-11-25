import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import QRCode from 'qrcode';
import { PNG } from 'pngjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const assets = path.join(root, 'public/assets');
const socialAssets = path.join(assets, 'social');
const destination = 'https://abdoul675.github.io/AgroPulsegs.org/';

await mkdir(socialAssets, { recursive: true });
const qrOptions = {
  errorCorrectionLevel: 'H',
  margin: 5,
  width: 1200,
  color: { dark: '#0F2F44', light: '#FFFFFF' },
};
const qrImage = PNG.sync.read(await QRCode.toBuffer(destination, qrOptions));

// Use the square AgroPulse emblem from the existing favicon for the QR badge.
const emblem = PNG.sync.read(await readFile(path.join(assets, 'favicon.png')));
const emblemBuffer = PNG.sync.write(emblem);

const badgeSize = 260;
const badgeRadius = 38;
const badgeBorder = 8;
const badgeX = Math.round((qrImage.width - badgeSize) / 2);
const badgeY = Math.round((qrImage.height - badgeSize) / 2);
const insideRoundRect = (px, py, x, y, size, radius) => {
  const cx = Math.max(x + radius, Math.min(px, x + size - radius));
  const cy = Math.max(y + radius, Math.min(py, y + size - radius));
  return (px - cx) ** 2 + (py - cy) ** 2 <= radius ** 2;
};
for (let y = badgeY; y < badgeY + badgeSize; y += 1) {
  for (let x = badgeX; x < badgeX + badgeSize; x += 1) {
    const px = x + 0.5;
    const py = y + 0.5;
    const at = (y * qrImage.width + x) * 4;
    if (insideRoundRect(px, py, badgeX, badgeY, badgeSize, badgeRadius)) {
      qrImage.data[at] = 63;
      qrImage.data[at + 1] = 154;
      qrImage.data[at + 2] = 60;
      qrImage.data[at + 3] = 255;
    }
    const inset = badgeBorder;
    if (insideRoundRect(px, py, badgeX + inset, badgeY + inset, badgeSize - inset * 2, badgeRadius - inset)) {
      qrImage.data[at] = 255;
      qrImage.data[at + 1] = 255;
      qrImage.data[at + 2] = 255;
      qrImage.data[at + 3] = 255;
    }
  }
}

const emblemSize = 158;
const emblemLeft = Math.round((qrImage.width - emblemSize) / 2);
const emblemTop = Math.round((qrImage.height - emblemSize) / 2);
const cropX = 0;
const cropY = 0;
const cropSize = emblem.width;
for (let y = 0; y < emblemSize; y += 1) {
  for (let x = 0; x < emblemSize; x += 1) {
    const sourceX = Math.max(0, Math.min(emblem.width - 1, cropX + ((x + 0.5) * cropSize) / emblemSize - 0.5));
    const sourceY = Math.max(0, Math.min(emblem.height - 1, cropY + ((y + 0.5) * cropSize) / emblemSize - 0.5));
    const x0 = Math.floor(sourceX);
    const y0 = Math.floor(sourceY);
    const dx = sourceX - x0;
    const dy = sourceY - y0;
    const samples = [
      [x0, y0, (1 - dx) * (1 - dy)],
      [x0 + 1, y0, dx * (1 - dy)],
      [x0, y0 + 1, (1 - dx) * dy],
      [x0 + 1, y0 + 1, dx * dy],
    ];
    const channels = [0, 0, 0, 0];
    for (const [sx, sy, weight] of samples) {
      const sourceAt = (sy * emblem.width + sx) * 4;
      for (let channel = 0; channel < 4; channel += 1) channels[channel] += emblem.data[sourceAt + channel] * weight;
    }
    const alpha = channels[3] / 255;
    const targetAt = ((emblemTop + y) * qrImage.width + emblemLeft + x) * 4;
    for (let channel = 0; channel < 3; channel += 1) {
      qrImage.data[targetAt + channel] = Math.round(channels[channel] * alpha + 255 * (1 - alpha));
    }
    qrImage.data[targetAt + 3] = 255;
  }
}
await writeFile(path.join(assets, 'agropulse-access-qr.png'), PNG.sync.write(qrImage));

const svg = await QRCode.toString(destination, {
  ...qrOptions,
  type: 'svg',
});
const viewBox = Number(/viewBox="0 0 (\d+) \d+"/u.exec(svg)?.[1]);
const badgeUnits = badgeSize / (qrImage.width / viewBox);
const emblemUnits = emblemSize / (qrImage.width / viewBox);
const badgePosition = (viewBox - badgeUnits) / 2;
const emblemPosition = (viewBox - emblemUnits) / 2;
const logoData = emblemBuffer.toString('base64');
const svgBadge = `<rect x="${badgePosition}" y="${badgePosition}" width="${badgeUnits}" height="${badgeUnits}" rx="1.4" fill="#fff" stroke="#3F9A3C" stroke-width="0.32"/><image x="${emblemPosition}" y="${emblemPosition}" width="${emblemUnits}" height="${emblemUnits}" href="data:image/png;base64,${logoData}"/>`;
await writeFile(path.join(assets, 'agropulse-access-qr.svg'), svg.replace('</svg>', `${svgBadge}</svg>`), 'utf8');

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
