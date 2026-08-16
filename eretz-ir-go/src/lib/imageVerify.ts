import { normalizeHebrew } from './hebrew';

/**
 * מנגנון אימות תמונות.
 *
 * למה זה נחוץ: חיפוש חופשי בוויקיפדיה מחזיר לא פעם את הערך הלא נכון.
 * "כרוב" הוא גם ירק וגם יצור מיתולוגי; "כלנית" הוא גם פרח, גם מושב בגליל
 * וגם שם של ילדה. בלי בדיקה מתקבלות תמונות שגויות — עץ במקום כרוב,
 * מפה במקום כלנית.
 *
 * הכלל המנחה: **מוטב בלי תמונה מאשר תמונה שגויה.** כל מועמד חייב לעבור
 * את כל השערים; מי שנופל באחד מהם פשוט לא מוצג.
 */

export type RejectReason =
  | 'no-image'
  | 'name-category'
  | 'title-mismatch'
  | 'disambiguation'
  | 'category-mismatch'
  | 'bad-image-kind';

export interface ImageCandidate {
  /** כותרת הערך בוויקיפדיה, למשל "כלנית (מושב)" */
  title: string;
  /** תיאור קצר מוויקינתונים, למשל "מין של צמח" */
  description?: string;
  /** המשפטים הראשונים של הערך */
  extract?: string;
  /** קטגוריות הערך בוויקיפדיה */
  wikiCategories?: string[];
  imageUrl?: string;
  isDisambiguation?: boolean;
}

export type VerifyResult = { ok: true } | { ok: false; reason: RejectReason };

/**
 * קטגוריות שבהן תמונה היא תמיד שגיאה: שם פרטי אינו "דבר" שיש לו תמונה.
 * חיפוש "כלנית" כשם של בת יחזיר את הפרח או את המושב — שניהם לא נכונים.
 * מעבר לזה, הצגת תמונה של אדם אמיתי עבור שם של ילד אינה ראויה.
 */
const NO_IMAGE_CATEGORIES = new Set(['boyname', 'girlname']);

/**
 * סימנים מבדילים לכל קטגוריה. נדרש לפחות אחד מהם בתיאור/בפתיח/בקטגוריות
 * של הערך. הסימנים נבחרו כך שלא יחפפו בין קטגוריות: "ממשפחת" ו"מין",
 * למשל, מופיעים גם אצל חיות וגם אצל צמחים ולכן אינם משמשים כאן.
 */
const CATEGORY_MARKERS: Record<string, string[]> = {
  country: ['מדינה', 'מדינת', 'ארץ ב', 'רפובליקה', 'ממלכה', 'קיסרות', 'מדינות'],
  city: ['עיר', 'עיירה', 'יישוב', 'ישוב', 'כפר', 'מושב', 'קיבוץ', 'בירת', 'מטרופולין'],
  animal: [
    'בעל חיים', 'בעלי חיים', 'בעל החיים', 'יונק', 'יונקים', 'ציפור', 'ציפורים', 'עוף', 'עופות',
    'דג', 'דגים', 'זוחל', 'זוחלים', 'דו-חיים', 'דו חיים', 'חרק', 'חרקים', 'עכביש', 'רכיכה',
    'טורף', 'חסרי חוליות', 'סרטן', 'נחש', 'לטאה', 'פרפר', 'חיית'
  ],
  plant: [
    'צמח', 'צמחים', 'עץ', 'עצים', 'פרח', 'פרחים', 'פרי', 'פירות', 'ירק', 'ירקות',
    'שיח', 'עשב', 'גידול חקלאי', 'זן', 'דגן', 'קטנית', 'פקעת', 'אצה', 'פטריי'
  ],
  inanimate: [
    'חפץ', 'כלי', 'מכשיר', 'מוצר', 'רהיט', 'ריהוט', 'חומר', 'ציוד', 'אביזר', 'מבנה',
    'כלי נגינה', 'כלי עבודה', 'בגד', 'נעל', 'רכב', 'צעצוע', 'מזון', 'משקה', 'מאכל',
    'משמש ל', 'עשוי מ', 'התקן', 'מכונה'
  ],
  profession: ['מקצוע', 'עיסוק', 'תפקיד', 'בעל מקצוע', 'העוסק', 'העוסקת', 'האחראי', 'מי שעוסק'],
  // שמות פרטיים: הסימנים משמשים רק לאימות תשובות. תמונות לשמות
  // חסומות ממילא ב-NO_IMAGE_CATEGORIES ולא מגיעות לכאן.
  boyname: ['שם פרטי', 'שם זכר', 'שם עברי', 'שם ישראלי', 'שמות פרטיים'],
  girlname: ['שם פרטי', 'שם נקבה', 'שם עברי', 'שם ישראלי', 'שמות פרטיים'],
  celebrity: [
    'יליד', 'ילידת', 'נולד', 'נולדה', 'שחקן', 'שחקנית', 'זמר', 'זמרת', 'סופר', 'סופרת',
    'פוליטיקאי', 'פוליטיקאית', 'מדען', 'מדענית', 'שחיין', 'כדורגלן', 'ראש הממשלה', 'נשיא',
    'אישיות', 'שהיה', 'שהייתה', 'במאי', 'צייר', 'ממציא', 'פילוסוף'
  ]
};

/**
 * תמונות שאינן מה שילד מצפה לראות: מפות, דגלים, סמלים, לוגואים וחתימות.
 * זה בדיוק המקרה של "כלנית" שהחזיר מפה.
 */
const BAD_IMAGE_PATTERNS = [
  'map', 'karte', 'mapa', 'carte', 'location', 'locator', 'locationmap',
  'flag', 'flagge', 'bandera', 'coat_of_arms', 'coa_', 'wappen', 'seal_of',
  'emblem', 'logo', 'signature', 'disambig', 'question_book', 'blank',
  'no_image', 'noimage', 'placeholder', 'icon', 'symbol',
  'מפה', 'דגל', 'סמל', 'לוגו'
];

/** "כלנית (מושב)" -> { base: "כלנית", qualifier: "מושב" } */
export function splitTitle(title: string): { base: string; qualifier?: string } {
  const m = /^(.*?)\s*\(([^)]*)\)\s*$/.exec(title.trim());
  if (!m) return { base: title.trim() };
  return { base: m[1].trim(), qualifier: m[2].trim() };
}

/** האם שם התמונה נראה כמו מפה/דגל/סמל ולא כמו צילום אמיתי */
export function isBadImageKind(url: string): boolean {
  const file = decodeURIComponent(url).toLowerCase();
  const name = file.slice(file.lastIndexOf('/') + 1);
  return BAD_IMAGE_PATTERNS.some((p) => name.includes(p));
}

/** האם הטקסט של הערך מעיד שהוא באמת מהקטגוריה שבה ענו */
export function matchesCategory(text: string, categoryId: string): boolean {
  const markers = CATEGORY_MARKERS[categoryId];
  if (!markers) return true; // קטגוריה מותאמת אישית — אין לנו סימנים, לא חוסמים
  const haystack = text.toLowerCase();
  return markers.some((m) => haystack.includes(m));
}

/**
 * השער המלא. מחזיר ok רק כשכל הבדיקות עברו:
 * 1. הקטגוריה בכלל מרשה תמונות
 * 2. יש תמונה, והיא לא מפה/דגל/סמל
 * 3. הערך אינו דף פירושונים
 * 4. כותרת הערך זהה לתשובה (לא דומה — זהה)
 * 5. תוכן הערך מעיד שהוא מהקטגוריה הנכונה
 */
export function verifyImageCandidate(
  answer: string,
  categoryId: string,
  candidate: ImageCandidate
): VerifyResult {
  if (NO_IMAGE_CATEGORIES.has(categoryId)) return { ok: false, reason: 'name-category' };
  if (!candidate.imageUrl) return { ok: false, reason: 'no-image' };
  if (isBadImageKind(candidate.imageUrl)) return { ok: false, reason: 'bad-image-kind' };
  if (candidate.isDisambiguation) return { ok: false, reason: 'disambiguation' };

  const { base, qualifier } = splitTitle(candidate.title);
  if (normalizeHebrew(base) !== normalizeHebrew(answer)) return { ok: false, reason: 'title-mismatch' };

  const evidence = [qualifier, candidate.description, candidate.extract, ...(candidate.wikiCategories ?? [])]
    .filter(Boolean)
    .join(' | ');
  if (!matchesCategory(evidence, categoryId)) return { ok: false, reason: 'category-mismatch' };

  return { ok: true };
}

/** הסבר קצר — מוצג במסך ההורה, לא באמצע המשחק */
export function rejectReasonText(reason: RejectReason): string {
  switch (reason) {
    case 'no-image':
      return 'לא נמצאה תמונה בערך';
    case 'name-category':
      return 'שם פרטי — לא מוצגת תמונה בכוונה';
    case 'title-mismatch':
      return 'הערך שנמצא אינו בדיוק המילה שנכתבה';
    case 'disambiguation':
      return 'דף פירושונים — לא ברור לאיזה ערך הכוונה';
    case 'category-mismatch':
      return 'הערך שנמצא שייך לנושא אחר';
    case 'bad-image-kind':
      return 'התמונה היא מפה/דגל/סמל ולא צילום של הדבר עצמו';
  }
}
