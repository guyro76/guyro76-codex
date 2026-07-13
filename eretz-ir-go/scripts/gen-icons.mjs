/**
 * מחולל אייקוני PWA ללא תלות חיצונית: כותב PNG גולמי (RGBA + zlib).
 * מצייר עיגול בגרדיאנט סגול-טורקיז על רקע כהה — מיתוג בסיסי הניתן להחלפה.
 */
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'public', 'icons');
mkdirSync(outDir, { recursive: true });

function crc32(buf) {
  let table = crc32.table;
  if (!table) {
    table = crc32.table = new Int32Array(256).map((_, n) => {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      return c;
    });
  }
  let crc = -1;
  for (const b of buf) crc = (crc >>> 8) ^ table[(crc ^ b) & 0xff];
  return (crc ^ -1) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crc]);
}

function png(size, pixelFn) {
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0; // no filter
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = pixelFn(x, y);
      const off = y * (size * 4 + 1) + 1 + x * 4;
      raw[off] = r;
      raw[off + 1] = g;
      raw[off + 2] = b;
      raw[off + 3] = a;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

const lerp = (a, b, t) => Math.round(a + (b - a) * t);

function iconPixel(size) {
  const c = size / 2;
  return (x, y) => {
    const dx = x - c;
    const dy = y - c;
    const dist = Math.sqrt(dx * dx + dy * dy);
    // רקע: סגול לילה כהה (maskable — ממלא את כל הריבוע)
    if (dist > size * 0.42) return [27, 16, 53, 255];
    // טבעת זוהרת
    if (dist > size * 0.38) return [51, 214, 195, 255];
    // גרדיאנט פנימי: סגול -> טורקיז אלכסוני
    const t = Math.max(0, Math.min(1, (dx + dy + size * 0.8) / (size * 1.6)));
    // "כדור הארץ" — פסים בעדינות
    const band = Math.sin((y / size) * Math.PI * 5 + 1) > 0.75 ? 22 : 0;
    return [lerp(124, 51, t) - band, lerp(92, 214, t) - band, lerp(255, 195, t), 255];
  };
}

for (const size of [192, 512]) {
  writeFileSync(join(outDir, `icon-${size}.png`), png(size, iconPixel(size)));
  console.log(`✔ icon-${size}.png`);
}

// לוגו SVG לשימוש בתוך האפליקציה ובפאבייקון — קל להחלפה במיתוג עתידי
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#7c5cff"/><stop offset="1" stop-color="#33d6c3"/>
    </linearGradient>
  </defs>
  <rect width="128" height="128" rx="28" fill="#1b1035"/>
  <circle cx="64" cy="64" r="46" fill="url(#g)"/>
  <circle cx="64" cy="64" r="46" fill="none" stroke="#33d6c3" stroke-width="4"/>
  <text x="64" y="82" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="52" fill="#fff">ע</text>
</svg>`;
writeFileSync(join(outDir, 'logo.svg'), svg);
console.log('✔ logo.svg');
