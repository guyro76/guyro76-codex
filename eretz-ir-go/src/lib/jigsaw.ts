/**
 * גזירת לוח לחלקי פאזל אמיתיים — עם פינים ושקעים, לא ריבועים.
 *
 * הרעיון: הלוח נחתך פעם אחת לרשת של **גבולות**, וכל חלק מורכב מארבעה
 * גבולות. שני חלקים שכנים מקבלים את **אותו אובייקט גבול בדיוק**, אחד
 * מהם עובר אותו הפוך — ולכן הפין של האחד הוא בהכרח השקע של השני, והם
 * מתחברים בלי רווח ובלי חפיפה. זו התכונה היחידה שחייבת להיות נכונה
 * כאן, והיא זו שנבדקת.
 *
 * גבולות חיצוניים של הלוח תמיד ישרים — לפאזל אין פינים בולטים החוצה.
 *
 * הצורה נגזרת מ-seed קבוע (מזהה הפאזל), ולכן החיתוך יציב: ילד שחוזר
 * מחר רואה בדיוק את אותם חלקים במקומות שהוא זוכר.
 */

export interface Point {
  x: number;
  y: number;
}

/** מקטע בזייה קובי: שתי נקודות בקרה ויעד */
export interface Seg {
  c1: Point;
  c2: Point;
  to: Point;
}

export interface Edge {
  from: Point;
  segs: Seg[];
}

/**
 * פרופיל הפין, ביחידות של הגבול עצמו: `t` לאורכו (0..1) ו-`n` בניצב.
 *
 * הצוואר צר מהראש (0.42..0.58 מול ראש שמגיע ל-0.32..0.68), וזה מה
 * שנותן ל"פאזל" את הצורה המוכרת — ראש שלא נשלף בלי להרים.
 */
const NECK_START = 0.42;
const NECK_END = 0.58;
const TAB_HEIGHT = 0.24;

/** גנרטור דטרמיניסטי קטן, כדי שאותו seed ייתן תמיד את אותו חיתוך */
function rngFrom(seed: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return ((h >>> 0) % 100000) / 100000;
  };
}

/**
 * בונה גבול מנקודה לנקודה.
 *
 * `dir` הוא 0 לגבול ישר (שפת הלוח), או 1/-1 לכיוון הפין. הצורה
 * מחושבת במערכת צירים מקומית — `u` לאורך הגבול ו-`nv` בניצב לו —
 * ולכן אותו קוד משרת גבולות אופקיים ואנכיים כאחד.
 */
function buildEdge(from: Point, to: Point, dir: number): Edge {
  const u = { x: to.x - from.x, y: to.y - from.y };
  const nv = { x: -u.y, y: u.x }; // סיבוב 90°, באותו קנה מידה כמו הגבול
  const at = (t: number, n: number): Point => ({
    x: from.x + u.x * t + nv.x * n,
    y: from.y + u.y * t + nv.y * n
  });

  if (dir === 0) {
    return { from, segs: [{ c1: at(1 / 3, 0), c2: at(2 / 3, 0), to: at(1, 0) }] };
  }

  const d = dir > 0 ? 1 : -1;
  const H = TAB_HEIGHT * d;
  return {
    from,
    segs: [
      // מהפינה עד הצוואר — ישר
      { c1: at(0.14, 0), c2: at(0.28, 0), to: at(NECK_START, 0) },
      // חצי ראש שמאלי: נקודת הבקרה יוצאת אחורה ויוצרת את התת-חיתוך
      { c1: at(0.36, H * 0.1), c2: at(0.32, H), to: at(0.5, H) },
      // חצי ראש ימני, סימטרי
      { c1: at(0.68, H), c2: at(0.64, H * 0.1), to: at(NECK_END, 0) },
      // מהצוואר עד הפינה
      { c1: at(0.72, 0), c2: at(0.86, 0), to: at(1, 0) }
    ]
  };
}

/**
 * אותו גבול, במעבר הפוך.
 *
 * זה הלב של ההתאמה בין שכנים: החלק מימין עובר את הגבול המשותף מלמעלה
 * למטה, והחלק משמאל עובר אותו מלמטה למעלה — אבל זו אותה עקומה.
 */
export function reverseEdge(edge: Edge): Edge {
  const points = [edge.from, ...edge.segs.map((s) => s.to)];
  const segs: Seg[] = [];
  for (let i = edge.segs.length - 1; i >= 0; i--) {
    segs.push({ c1: edge.segs[i].c2, c2: edge.segs[i].c1, to: points[i] });
  }
  return { from: points[points.length - 1], segs };
}

export interface JigsawCut {
  cols: number;
  rows: number;
  width: number;
  height: number;
  /** מסלול SVG סגור של חלק לפי אינדקס (שורות משמאל לימין, מלמעלה למטה) */
  piecePath(index: number): string;
  /** הגבול האופקי שמעל שורה r בעמודה c. r נע 0..rows */
  hEdge(r: number, c: number): Edge;
  /** הגבול האנכי שמשמאל לעמודה c בשורה r. c נע 0..cols */
  vEdge(r: number, c: number): Edge;
}

function fmt(n: number): string {
  return Math.abs(n) < 1e-9 ? '0' : String(Math.round(n * 1000) / 1000);
}

function pathOf(edges: Edge[]): string {
  const head = edges[0].from;
  let d = `M ${fmt(head.x)} ${fmt(head.y)}`;
  for (const edge of edges) {
    for (const s of edge.segs) {
      d += ` C ${fmt(s.c1.x)} ${fmt(s.c1.y)} ${fmt(s.c2.x)} ${fmt(s.c2.y)} ${fmt(s.to.x)} ${fmt(s.to.y)}`;
    }
  }
  return `${d} Z`;
}

export function jigsawCut(opts: {
  cols: number;
  rows: number;
  width: number;
  height: number;
  seed: string;
}): JigsawCut {
  const { cols, rows, width, height, seed } = opts;
  const w = width / cols;
  const h = height / rows;
  const rng = rngFrom(seed);

  // הגבולות נבנים פעם אחת ונשמרים. זה לא ייעול אלא דרישה: אם כל חלק
  // היה מגריל את הגבול שלו בעצמו, שני שכנים היו מקבלים צורות שונות.
  const hor: Edge[][] = [];
  for (let r = 0; r <= rows; r++) {
    hor.push([]);
    for (let c = 0; c < cols; c++) {
      const border = r === 0 || r === rows;
      hor[r].push(
        buildEdge({ x: c * w, y: r * h }, { x: (c + 1) * w, y: r * h }, border ? 0 : rng() < 0.5 ? 1 : -1)
      );
    }
  }

  const ver: Edge[][] = [];
  for (let r = 0; r < rows; r++) {
    ver.push([]);
    for (let c = 0; c <= cols; c++) {
      const border = c === 0 || c === cols;
      ver[r].push(
        buildEdge({ x: c * w, y: r * h }, { x: c * w, y: (r + 1) * h }, border ? 0 : rng() < 0.5 ? 1 : -1)
      );
    }
  }

  return {
    cols,
    rows,
    width,
    height,
    hEdge: (r, c) => hor[r][c],
    vEdge: (r, c) => ver[r][c],
    piecePath(index: number): string {
      const r = Math.floor(index / cols);
      const c = index % cols;
      return pathOf([
        hor[r][c], // עליון, משמאל לימין
        ver[r][c + 1], // ימני, מלמעלה למטה
        reverseEdge(hor[r + 1][c]), // תחתון, מימין לשמאל
        reverseEdge(ver[r][c]) // שמאלי, מלמטה למעלה
      ]);
    }
  };
}
