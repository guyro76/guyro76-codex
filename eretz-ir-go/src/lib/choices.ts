import type { KnowledgeItem } from '../types';
import { unfinalize } from './hebrew';

/**
 * מצב בחירה — לילדים שעדיין לא כותבים.
 *
 * ארץ-עיר דורש הקלדה, ובגיל ארבע-חמש זה החסם היחיד: הילד יודע
 * שאריה הוא חיה בהרבה לפני שהוא יודע לכתוב "אריה". במצב הזה הוא
 * מקבל ארבע אפשרויות ובוחר אחת.
 *
 * המסיחים נבחרים **מאותה קטגוריה אבל מאות אחרת**, וזה לא במקרה:
 * כך השאלה האמיתית היא "מה מתחיל באות הזאת", שזה בדיוק מה שהמשחק
 * מלמד. מסיחים מקטגוריה אחרת היו הופכים את זה למשחק קל מדי.
 *
 * הכול מהמאגר שבמכשיר — בלי רשת ובלי שירות חיצוני.
 */
export interface ChoiceSet {
  correct: string;
  options: string[];
}

const OPTIONS = 4;

/** ערבוב Fisher-Yates עם מקור אקראיות שאפשר להזריק */
function shuffle<T>(list: T[], rng: () => number): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * בניית מערך אפשרויות לקטגוריה ולאות.
 *
 * מחזיר null כשאין חומר מספיק — ואז המסך נופל בחזרה להקלדה רגילה
 * במקום להציג שתי אפשרויות שאחת מהן ברורה מאליה.
 */
export function buildChoices(opts: {
  categoryId: string;
  letter: string;
  items: KnowledgeItem[];
  /** מילים שכבר בשימוש בקטגוריות אחרות בסיבוב */
  exclude?: Set<string>;
  rng?: () => number;
}): ChoiceSet | null {
  const rng = opts.rng ?? Math.random;
  const target = unfinalize(opts.letter);
  const exclude = opts.exclude ?? new Set<string>();

  const inCategory = opts.items.filter((i) => i.categoryIds.includes(opts.categoryId));
  const matching = inCategory.filter(
    (i) => unfinalize(i.firstLetter) === target && !exclude.has(i.normalizedName)
  );
  if (matching.length === 0) return null;

  // התשובה הנכונה: מהמוכרות, כדי שילד בן ארבע יזהה אותה
  const byFame = [...matching].sort((a, b) => b.popularityScore - a.popularityScore);
  const correct = byFame[Math.floor(rng() * Math.min(3, byFame.length))] ?? byFame[0];

  const distractorPool = inCategory.filter(
    (i) =>
      unfinalize(i.firstLetter) !== target &&
      i.normalizedName !== correct.normalizedName &&
      !exclude.has(i.normalizedName)
  );
  if (distractorPool.length < OPTIONS - 1) return null;

  // גם המסיחים מהמוכרים: מילה שהילד לא מכיר בכלל אינה מסיח אמיתי,
  // היא רק רעש שמסמן את עצמה כ"לא זה"
  const distractors = shuffle(
    [...distractorPool].sort((a, b) => b.popularityScore - a.popularityScore).slice(0, 10),
    rng
  ).slice(0, OPTIONS - 1);

  return {
    correct: correct.canonicalName,
    options: shuffle([correct, ...distractors].map((i) => i.canonicalName), rng)
  };
}
