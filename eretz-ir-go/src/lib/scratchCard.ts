/**
 * הלוגיקה של כרטיס הגירוד, בנפרד מהתצוגה.
 *
 * חשוב לילדים: אין כאן שום היבט של הימורים אמיתיים — אין כסף אמיתי,
 * אין קנייה, אין הפסד ואין "עוד ניסיון בתשלום". הכרטיס מוגרל מראש
 * והתוצאה קבועה מרגע הפתיחה, כך שמה שמתגלה הוא מה שהיה שם מלכתחילה
 * והמשחק לא "מחליט" תוך כדי.
 */
export const SYMBOLS = ['🍀', '⭐', '💎', '🍒', '🔔', '🎁'];
export const CELLS = 6;
export const PICKS = 3;
/** שיעור הכרטיסים הזוכים */
export const WIN_RATE = 0.34;

/**
 * כרטיס זוכה מכיל בדיוק שלושה סמלים זהים; כרטיס מפסיד לא מכיל
 * שלושה זהים בשום מקרה — כך שהתוצאה נקבעת בהגרלה ולא בגירוד.
 *
 * הבנייה חסומה מראש (בלי הגרלה חוזרת עד שמתקבל סמל מתאים), כדי שלא
 * יהיה מצב שבו מקור אקראיות חריג משאיר את הפונקציה בלולאה.
 */
export function buildCard(random: () => number = Math.random): string[] {
  const pool = shuffle(SYMBOLS, random);

  if (random() < WIN_RATE) {
    // שלושה זהים ועוד שלושה סמלים שונים ממנו וזה מזה
    const [winner, ...rest] = pool;
    return shuffle([winner, winner, winner, ...rest.slice(0, CELLS - PICKS)], random);
  }

  // כרטיס מפסיד: לכל היותר שני סמלים זהים, בשלוש צורות שונות כדי
  // שלא כל הפסד ייראה אותו דבר
  const shape = random();
  const cells =
    shape < 0.5
      ? [pool[0], pool[0], pool[1], pool[1], pool[2], pool[3]]
      : shape < 0.8
        ? [pool[0], pool[0], pool[1], pool[2], pool[3], pool[4]]
        : pool.slice(0, CELLS);

  return shuffle(cells, random);
}

function shuffle(cells: string[], random: () => number): string[] {
  const out = [...cells];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** כמה פעמים חוזר הסמל הנפוץ ביותר מבין השדות שנחשפו */
export function bestStreak(picked: string[]): number {
  if (picked.length === 0) return 0;
  const counts = new Map<string, number>();
  for (const s of picked) counts.set(s, (counts.get(s) ?? 0) + 1);
  return Math.max(...counts.values());
}

/** שלושה זהים = בונוס מלא, שניים = חצי, אחרת בונוס קטן על ההשתתפות */
export function progressFor(picked: string[]): number {
  const best = bestStreak(picked);
  if (best >= PICKS) return 1;
  if (best === 2) return 0.5;
  return 0.2;
}
