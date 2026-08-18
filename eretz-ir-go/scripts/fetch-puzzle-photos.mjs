/**
 * מושך את צילומי הפאזלים מוויקיפדיה העברית ואורז אותם לתוך החבילה.
 *
 * למה סקריפט ולא הורדה ידנית: כל צילום חייב לבוא עם יוצר, רישיון
 * וקישור לדף המקור. כשמורידים ביד, המידע הזה הולך לאיבוד בדיוק ברגע
 * שהוא הכי חשוב. כאן הוא נמשך מאותה קריאה שמביאה את התמונה, ונכתב
 * לצד הקובץ — כך אי אפשר לארוז תמונה בלי לדעת מאיפה היא.
 *
 * איפה זה רץ: ב-GitHub Actions. לסביבת הפיתוח אין גישה לשרתי ויקימדיה,
 * ולכן אין טעם להריץ את זה מקומית.
 *
 * שערי האימות זהים לאלה של תמונות התשובות במשחק, ובכוונה:
 *   1. הכותרת שחוזרת חייבת להיות **בדיוק** מה שביקשנו — לא ערך אחר
 *      שוויקיפדיה החליטה להציע.
 *   2. לא דף פירושונים.
 *   3. לא מפה, לא דגל ולא סמל — אלה חוזרים לא מעט, ואינם צילום.
 *   4. חייבים להיות יוצר ורישיון. בלעדיהם התמונה נפסלת.
 *
 * פאזל שנכשל באחד מהם פשוט לא נכנס למניפסט. זו התנהגות רצויה: עדיף
 * איור מאשר תמונה שאי אפשר לייחס.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const OUT_DIR = resolve(ROOT, 'public/puzzles');
const MANIFEST = resolve(ROOT, 'src/data/puzzlePhotos.ts');

const API = 'https://he.wikipedia.org/w/api.php';
// ויקימדיה דורשת User-Agent מזהה, ומחזירה 403 בלעדיו
const UA = 'eretz-ir-go/1.0 (https://eretz-ir-go.vercel.app; puzzle photo vendoring)';

/** נשלף מ-puzzles.ts כדי שלא יהיה כאן עותק שני של רשימת הפאזלים */
async function readPuzzles() {
  const src = await import('node:fs/promises').then((fs) =>
    fs.readFile(resolve(ROOT, 'src/data/puzzles.ts'), 'utf8')
  );
  const puzzles = [];
  const re = /\{\s*id:\s*'([^']+)',\s*name:\s*'([^']+)',(?:\s*lookup:\s*'([^']+)',)?[\s\S]*?cols:\s*(\d+),\s*rows:\s*(\d+)/g;
  let m;
  while ((m = re.exec(src))) {
    puzzles.push({ id: m[1], name: m[2], lookup: m[3] ?? m[2], cols: +m[4], rows: +m[5] });
  }
  return puzzles;
}

async function api(params) {
  const url = `${API}?${new URLSearchParams({ format: 'json', ...params })}`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

const strip = (html) => String(html ?? '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

/** מפה/דגל/סמל — נפוץ מספיק כדי להצדיק שער ייעודי */
function isBadImageKind(file) {
  return /(map|karte|flag|coat[_ ]of[_ ]arms|crest|seal|logo|locator|blank|\.svg$)/i.test(file);
}

async function fetchOne(puzzle) {
  const q = await api({
    action: 'query',
    prop: 'pageimages|pageprops',
    piprop: 'thumbnail|name',
    pithumbsize: '1200',
    titles: puzzle.lookup
  });
  const page = Object.values(q.query.pages)[0];

  if (!page || page.missing !== undefined) throw new Error('אין ערך כזה');
  if (page.title !== puzzle.lookup) throw new Error(`כותרת שונה: ${page.title}`);
  if (page.pageprops?.disambiguation !== undefined) throw new Error('דף פירושונים');

  const file = page.pageimage;
  const src = page.thumbnail?.source;
  if (!file || !src) throw new Error('אין תמונה ראשית');
  if (isBadImageKind(file)) throw new Error(`לא צילום: ${file}`);

  const info = await api({
    action: 'query',
    prop: 'imageinfo',
    iiprop: 'extmetadata|url',
    titles: `File:${file}`
  });
  const ii = Object.values(info.query.pages)[0]?.imageinfo?.[0];
  const em = ii?.extmetadata ?? {};

  const author = strip(em.Artist?.value) || strip(em.Credit?.value);
  const license = strip(em.LicenseShortName?.value) || strip(em.UsageTerms?.value);
  const pageUrl = ii?.descriptionurl;
  if (!author || !license || !pageUrl) throw new Error('חסר יוצר או רישיון');

  const bytes = Buffer.from(
    await fetch(src, { headers: { 'User-Agent': UA } }).then((r) => r.arrayBuffer())
  );

  // חיתוך ליחס הלוח לפני ההקטנה: פאזל 3×2 שמקבל תמונה מרובעת נמתח
  const [w, h] = puzzle.cols === puzzle.rows ? [560, 560] : [660, 440];
  const webp = await sharp(bytes)
    .resize(w, h, { fit: 'cover', position: 'attention' })
    .webp({ quality: 76, effort: 6 })
    .toBuffer();

  const name = `${puzzle.id}.webp`;
  await writeFile(resolve(OUT_DIR, name), webp);
  return { file: name, author, license, pageUrl, bytes: webp.length };
}

const puzzles = await readPuzzles();
if (puzzles.length === 0) throw new Error('לא נמצאו פאזלים ב-puzzles.ts — כנראה המבנה השתנה');
console.log(`נמצאו ${puzzles.length} פאזלים`);
await mkdir(OUT_DIR, { recursive: true });

const entries = {};
for (const puzzle of puzzles) {
  try {
    const got = await fetchOne(puzzle);
    entries[puzzle.id] = got;
    console.log(`  ✓ ${puzzle.id.padEnd(14)} ${String(got.bytes).padStart(6)}B  ${got.license} · ${got.author}`);
  } catch (err) {
    console.log(`  ✗ ${puzzle.id.padEnd(14)} ${err.message} — נשאר עם האיור`);
  }
}

const header = (await import('node:fs/promises')).readFile;
const current = await header(MANIFEST, 'utf8');
// שומרים על התיעוד והטיפוסים שבראש הקובץ; מחליפים רק את הטבלה
const body = Object.entries(entries)
  .map(
    ([id, e]) =>
      `  '${id}': {\n    file: '${e.file}',\n    author: ${JSON.stringify(e.author)},\n    license: ${JSON.stringify(e.license)},\n    pageUrl: ${JSON.stringify(e.pageUrl)}\n  }`
  )
  .join(',\n');

const next = current.replace(
  /export const PUZZLE_PHOTOS: Record<string, PuzzlePhoto> = \{[\s\S]*?\n\};/,
  `export const PUZZLE_PHOTOS: Record<string, PuzzlePhoto> = {${body ? `\n${body}\n` : ''}};`
);
if (next === current && body) throw new Error('לא נמצאה טבלת PUZZLE_PHOTOS להחלפה');
await writeFile(MANIFEST, next);

console.log(`\nנארזו ${Object.keys(entries).length} מתוך ${puzzles.length} צילומים.`);
