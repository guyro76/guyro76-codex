/**
 * פרסומות בגרסה החינמית.
 *
 * שלושה כללים שנצרבים כאן ולא ניתנים לכיבוי מלמעלה:
 *
 * 1. **פרסום שאינו מותאם אישית, נקודה.** אין כאן מזהה מפרסם, אין
 *    פרופיל, ואין שום נתון על הילד שיוצא החוצה. זו דרישה של
 *    Google Play Families לאפליקציות שהקהל שלהן ילדים, וגם הדבר
 *    הנכון בפני עצמו. אין דגל שמאפשר להפוך את זה.
 * 2. **הפרסומת מסומנת כפרסומת.** ילד צריך לדעת שמה שהוא רואה הוא
 *    מודעה ולא חלק מהמשחק.
 * 3. **אין לחיצה בטעות.** ההמשך נפתח רק אחרי השהיה קצרה, והכפתור
 *    להמשך מופרד מהמודעה עצמה — כדי שלחיצה על "הלאה" לא תיפול על
 *    המודעה. Google Play אוסר במפורש מיקום שמייצר קליקים מטעים.
 *
 * מי שמשלם לא רואה כלום מזה.
 */

/** איפה בזרימת המשחק מוצגת הפסקה */
export type AdSlot = 'before-round' | 'after-round';

export interface AdCreative {
  /** מה מוצג. בינתיים מודעת בית — ראו ההערה ב-`houseAd` */
  headline: string;
  body: string;
  cta: string;
  icon: string;
}

/**
 * ספק המודעות.
 *
 * מופרד כדי שאפשר יהיה לחבר רשת אמיתית (AdMob וכדומה) בלי לגעת
 * במסכים. עד שרשת כזו מוגדרת, מוצגת מודעת בית — וזה מצב תקין
 * ולא שגיאה: עדיף להראות משהו אמיתי מאשר מלבן ריק.
 */
export interface AdProvider {
  readonly name: string;
  /** מודעה להצגה, או null כשאין מה להציג כרגע */
  request(slot: AdSlot): Promise<AdCreative | null>;
}

/**
 * מודעת בית — מקדמת את הגרסה בתשלום.
 *
 * זו לא "מודעה מזויפת": היא מפרסמת מוצר אמיתי של אותו מפתח, וזה
 * בדיוק מה שמותר להציג בלי רשת חיצונית ובלי שום מעקב.
 */
const HOUSE: Record<AdSlot, AdCreative> = {
  'before-round': {
    icon: '💎',
    headline: 'רוצים לשחק בלי הפסקות?',
    body: 'בגרסה המלאה אין פרסומות — ויש פאזלים, פרסים ומשחק עם חברים.',
    cta: 'לצפייה בחבילות'
  },
  'after-round': {
    icon: '🧩',
    headline: 'בגרסה המלאה יש פאזלים',
    body: 'בסוף כל סיבוב נופל חלק, ואוספים תמונות אמיתיות מהארץ.',
    cta: 'לצפייה בחבילות'
  }
};

export const houseAdProvider: AdProvider = {
  name: 'house',
  request: async (slot) => HOUSE[slot]
};

/**
 * הספק הפעיל.
 *
 * משתנה יחיד ומכוון: כשתחובר רשת אמיתית, מחליפים כאן — ואף מסך
 * לא משתנה.
 */
let provider: AdProvider = houseAdProvider;

export function setAdProvider(next: AdProvider): void {
  provider = next;
}

export function adProvider(): AdProvider {
  return provider;
}

/** כמה שניות עד שאפשר להמשיך */
export const AD_HOLD_SECONDS = 5;

/**
 * האם להציג פרסומת בנקודה הזו.
 *
 * מרוכז בפונקציה אחת כדי שהתשובה תהיה זהה בכל המסכים — ובעיקר כדי
 * שיהיה מקום אחד לבדוק בו ש**מי שמשלם לא רואה פרסומות לעולם**.
 */
export function shouldShowAd(hasAds: boolean, slot: AdSlot): boolean {
  return hasAds && (slot === 'before-round' || slot === 'after-round');
}
