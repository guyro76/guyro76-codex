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

/**
 * `png(w, h, fn)` — לא רק ריבועים.
 *
 * תמונת הראשה של Google Play היא 1024×500, ולכן הרוחב והגובה נפרדים.
 */
function png(w, h, pixelFn) {
  const raw = Buffer.alloc(h * (w * 4 + 1));
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0; // no filter
    for (let x = 0; x < w; x++) {
      const [r, g, b, a] = pixelFn(x, y);
      const off = y * (w * 4 + 1) + 1 + x * 4;
      raw[off] = r;
      raw[off + 1] = g;
      raw[off + 2] = b;
      raw[off + 3] = a;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
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
  writeFileSync(join(outDir, `icon-${size}.png`), png(size, size, iconPixel(size)));
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

/* ===================== נכסים לחנות ===================== */

/**
 * אייקוני המשגר של אנדרואיד.
 *
 * Capacitor מייצר את הפרויקט עם הלוגו שלו, ואפליקציה שמוגשת עם
 * אייקון ברירת המחדל נראית כמו תבנית שלא נגעו בה. כאן הם נדרסים
 * באייקון של המשחק.
 *
 * שלושה קבצים בכל צפיפות, ולכל אחד תפקיד אחר:
 *  • `ic_launcher`           — ריבוע מלא, למשגרים ישנים.
 *  • `ic_launcher_round`     — עיגול, למשגרים שמבקשים צורה עגולה.
 *  • `ic_launcher_foreground`— שכבת החזית של אייקון אדפטיבי. היא
 *    נחתכת ומוגדלת על ידי המשגר, ולכן האיור יושב בשני שלישים
 *    המרכזיים ושאר השטח שקוף. בלי השוליים האלה הציור נחתך.
 */
const ANDROID_RES = join(root, 'android', 'app', 'src', 'main', 'res');

/** גודל בפיקסלים לכל צפיפות: [ic_launcher, ic_launcher_foreground] */
const DENSITIES = {
  mdpi: [48, 108],
  hdpi: [72, 162],
  xhdpi: [96, 216],
  xxhdpi: [144, 324],
  xxxhdpi: [192, 432]
};

/** עוטף ציור כך שיישב במרכז בקנה מידה קטן יותר, עם שוליים שקופים */
function inset(size, scale, pixelFn) {
  const inner = Math.round(size * scale);
  const pad = Math.round((size - inner) / 2);
  const draw = pixelFn(inner);
  return (x, y) => {
    const ix = x - pad;
    const iy = y - pad;
    if (ix < 0 || iy < 0 || ix >= inner || iy >= inner) return [0, 0, 0, 0];
    return draw(ix, iy);
  };
}

/**
 * הגלובוס בלבד, בלי ריבוע הרקע הכהה.
 *
 * באייקון אדפטיבי הרקע הוא שכבה נפרדת (`ic_launcher_background`),
 * ולכן שכבת החזית חייבת להיות שקופה מסביב לציור. אם היא נושאת רקע
 * משלה, המשגר מציג ריבוע כהה מרחף על גבי צבע הרקע — וזה נראה שבור.
 */
function globePixel(size) {
  const draw = iconPixel(size);
  const c = size / 2;
  return (x, y) => {
    const dx = x - c;
    const dy = y - c;
    if (Math.sqrt(dx * dx + dy * dy) > size * 0.42) return [0, 0, 0, 0];
    return draw(x, y);
  };
}

/** חותך ציור לעיגול; מחוץ לו שקוף */
function circular(size, pixelFn) {
  const draw = pixelFn(size);
  const c = size / 2;
  return (x, y) => {
    const dx = x - c;
    const dy = y - c;
    if (Math.sqrt(dx * dx + dy * dy) > size / 2) return [0, 0, 0, 0];
    return draw(x, y);
  };
}

let wrote = 0;
for (const [density, [launcher, foreground]] of Object.entries(DENSITIES)) {
  const dir = join(ANDROID_RES, `mipmap-${density}`);
  try {
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'ic_launcher.png'), png(launcher, launcher, iconPixel(launcher)));
    writeFileSync(
      join(dir, 'ic_launcher_round.png'),
      png(launcher, launcher, circular(launcher, iconPixel))
    );
    // 2/3 — אזור הבטיחות של אייקון אדפטיבי (72dp מתוך 108dp)
    writeFileSync(
      join(dir, 'ic_launcher_foreground.png'),
      png(foreground, foreground, inset(foreground, 2 / 3, globePixel))
    );
    wrote += 3;
  } catch {
    // הפרויקט הנייטיבי לא חייב להיות קיים בכל סביבה
  }
}
if (wrote) console.log(`✔ ${wrote} אייקוני אנדרואיד`);

/**
 * תמונת הראשה של Google Play — 1024×500, חובה בכל דף חנות.
 *
 * הרכב: רקע לילה עם זוהר סגול-טורקיז מהמרכז, והאייקון עצמו במרכז.
 * בלי טקסט בכוונה — Play מציג את שם האפליקציה מעליה, וטקסט כפול
 * נראה שגוי, ובנוסף היה צריך לגזור אותו לכל שפה.
 */
const FEATURE_W = 1024;
const FEATURE_H = 500;
const badge = iconPixel(320);
writeFileSync(
  join(outDir, 'play-feature-graphic.png'),
  png(FEATURE_W, FEATURE_H, (x, y) => {
    const bx = x - (FEATURE_W - 320) / 2;
    const by = y - (FEATURE_H - 320) / 2;
    if (bx >= 0 && by >= 0 && bx < 320 && by < 320) {
      const c = 160;
      const d = Math.sqrt((bx - c) ** 2 + (by - c) ** 2);
      if (d <= 152) return badge(bx, by);
    }
    // זוהר רדיאלי עדין סביב האייקון
    const dx = (x - FEATURE_W / 2) / (FEATURE_W / 2);
    const dy = (y - FEATURE_H / 2) / (FEATURE_H / 2);
    const t = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy));
    return [27 + Math.round(46 * t), 16 + Math.round(30 * t), 53 + Math.round(60 * t), 255];
  })
);
console.log('✔ play-feature-graphic.png (1024×500)');

/**
 * צבע הרקע של האייקון האדפטיבי.
 *
 * Capacitor מייצר אותו לבן. על רקע לבן הגלובוס הכהה של המשחק נראה
 * כמו טעות, ובמשגר עגול נוצרת טבעת לבנה סביבו. כאן הוא נצבע בסגול
 * הלילה של המשחק — אותו צבע שב-capacitor.config.json.
 */
const NIGHT = '#1B1035';
const bgXml = join(ANDROID_RES, 'values', 'ic_launcher_background.xml');
try {
  writeFileSync(
    bgXml,
    `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">${NIGHT}</color>\n</resources>\n`
  );
  console.log(`✔ רקע האייקון האדפטיבי → ${NIGHT}`);
} catch {
  /* אין פרויקט נייטיבי בסביבה הזו */
}
