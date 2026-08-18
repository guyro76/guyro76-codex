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
  return /(map|karte|flag|coat[_ ]of[_ ]arms|crest|seal|logo|locator|blank|icon|\.svg$|\.png$)/i.test(file);
}

/**
 * צילום לוויין — פסול לפאזל, גם כשהוא צילום אמיתי לגמרי.
 *
 * הכנרת וים המלח חזרו בדיוק כך: תצלומי לוויין נכונים ומרשימים, אבל
 * ילד שמרכיב פאזל אמור לזהות את המקום, ומלמעלה הם נראים כמו מפה —
 * וזה בדיוק מה שהכלל פוסל.
 *
 * שם הקובץ לבדו לא מספיק ("Dead_sea.jpg" הוא תצלום לוויין של נאס"א),
 * ולכן נבדק גם הייחוס.
 */
function isSatellite(file, credit) {
  const hay = `${file} ${credit}`;
  return /(satellite|landsat|sentinel|copernicus|modis|earthobservatory|from[_ ]space|astronaut|\bISS\b|\bESA\b|NASA)/i.test(hay);
}

/** שולף את הייחוס של קובץ בודד, ומחזיר null אם הוא לא עובר את השערים */
async function candidate(file) {
  if (isBadImageKind(file)) return null;

  const info = await api({
    action: 'query',
    prop: 'imageinfo',
    iiprop: 'extmetadata|url',
    iiurlwidth: '1200',
    titles: `File:${file}`
  });
  const ii = Object.values(info.query.pages)[0]?.imageinfo?.[0];
  if (!ii) return null;
  const em = ii.extmetadata ?? {};

  const license = strip(em.LicenseShortName?.value) || strip(em.UsageTerms?.value);
  const pageUrl = ii.descriptionurl;
  const src = ii.thumburl || ii.url;
  if (!license || !pageUrl || !src) return null;

  /**
   * דורשים יוצר בשם — גם ביצירות בנחלת הכלל, שבהן אין חובה חוקית כזו.
   *
   * שתי סיבות. הראשונה: קרדיט "יוצר לא מצוין" לא אומר לילד כלום.
   * השנייה, והמעשית: תצלום של אתר מפורסם בלי שום יוצר הוא כמעט תמיד
   * צילום מוסדי מלמעלה. כך בדיוק נבחרה הכנרת בריצה הקודמת — תצלום
   * לוויין ששום דבר בשמו או בייחוסו לא הסגיר. הדרישה הזו פוסלת אותו
   * בלי צורך לזהות את סוג הצילום, והמעבר על שאר תמונות הערך ממילא
   * מוצא צילום קרקע במקומו.
   */
  const author = strip(em.Artist?.value) || strip(em.Credit?.value);
  if (!author) return null;

  if (isSatellite(file, `${author} ${strip(em.Credit?.value)}`)) return null;
  return { author, license, pageUrl, src };
}

async function fetchOne(puzzle) {
  const q = await api({
    action: 'query',
    prop: 'pageimages|pageprops|images',
    piprop: 'name',
    imlimit: '60',
    titles: puzzle.lookup
  });
  const page = Object.values(q.query.pages)[0];

  if (!page || page.missing !== undefined) throw new Error('אין ערך כזה');
  if (page.title !== puzzle.lookup) throw new Error(`כותרת שונה: ${page.title}`);
  if (page.pageprops?.disambiguation !== undefined) throw new Error('דף פירושונים');

  // התמונה הראשית נבדקת ראשונה, ואם היא נפסלת עוברים על שאר תמונות
  // הערך. בלי המעבר הזה פאזל שהתמונה הראשית שלו היא לוויין או סמל
  // נשאר בלי צילום, למרות שבערך עצמו יש צילומים מצוינים.
  const lead = page.pageimage;
  const rest = (page.images ?? [])
    .map((i) => i.title.replace(/^File:|^קובץ:/, ''))
    .filter((f) => f !== lead);
  const order = [...(lead ? [lead] : []), ...rest];

  let picked = null;
  let file = null;
  for (const cand of order) {
    picked = await candidate(cand);
    if (picked) {
      file = cand;
      break;
    }
  }
  if (!picked) throw new Error(`אף אחת מ-${order.length} התמונות בערך לא עברה את השערים`);

  const bytes = Buffer.from(
    await fetch(picked.src, { headers: { 'User-Agent': UA } }).then((r) => r.arrayBuffer())
  );

  // חיתוך ליחס הלוח לפני ההקטנה: פאזל 3×2 שמקבל תמונה מרובעת נמתח
  const [w, h] = puzzle.cols === puzzle.rows ? [500, 500] : [600, 400];
  const webp = await sharp(bytes)
    .resize(w, h, { fit: 'cover', position: 'attention' })
    .webp({ quality: 70, effort: 6 })
    .toBuffer();

  const name = `${puzzle.id}.webp`;
  await writeFile(resolve(OUT_DIR, name), webp);
  return { file: name, source: file, ...picked, bytes: webp.length };
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
    console.log(`  ✓ ${puzzle.id.padEnd(14)} ${String(got.bytes).padStart(6)}B  ${got.source}  ${got.license} · ${got.author}`);
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
  /export const PUZZLE_PHOTOS: Record<string, PuzzlePhoto> = \{[\s\S]*?\};/,
  `export const PUZZLE_PHOTOS: Record<string, PuzzlePhoto> = {${body ? `\n${body}\n` : ''}};`
);
if (next === current && body) throw new Error('לא נמצאה טבלת PUZZLE_PHOTOS להחלפה');
await writeFile(MANIFEST, next);

console.log(`\nנארזו ${Object.keys(entries).length} מתוך ${puzzles.length} צילומים.`);
