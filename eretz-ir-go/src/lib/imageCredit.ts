/**
 * קרדיט לתמונה — מה שרישיון Creative Commons באמת דורש.
 *
 * ## למה הקובץ הזה נולד
 *
 * המשחק שלף תמונות מוויקיפדיה והציג לצידן את המחרוזת
 * "ויקיפדיה/ויקישיתוף — הרישיון בעמוד המקור". זה נראה כמו קרדיט, אבל
 * זה לא היה קרדיט: **שם היוצר לא נשלף מעולם**, שם הרישיון לא נשלף,
 * ולא היה קישור לרישיון. הצינור אפילו לא ביקש את המידע הזה מה-API —
 * `pageimages` מחזיר כתובת תמונה בלבד.
 *
 * רישיונות CC BY ו-CC BY-SA דורשים ארבעה דברים כשמשתמשים ביצירה:
 * **שם היוצר**, **שם הרישיון עם קישור אליו**, **קישור למקור**,
 * ו**ציון אם נעשה שינוי**. צלמים בוויקישיתוף אוכפים את זה בפועל,
 * ואפליקציה מסחרית שמציגה את התמונות שלהם בלי קרדיט היא בדיוק
 * המקרה שבגינו נשלחות דרישות.
 *
 * ## הכלל שנקבע כאן
 *
 * **בלי יוצר ובלי רישיון — התמונה לא מוצגת.** לא "מוצגת עם קרדיט
 * חלקי". זה גם מה שכללי הפרויקט אמרו כל הזמן ("אין תמונה שמקורה לא
 * ידוע"), רק שהקוד לא קיים את זה. ההשלכה מקובלת: תמונה שאי אפשר
 * לתת עליה קרדיט פשוט לא תופיע, והמשחק כבר יודע להתנהג בלי תמונה.
 */

export interface ImageCredit {
  /** שם היוצר כפי שוויקישיתוף מדווח עליו */
  author: string;
  /** שם קצר של הרישיון, למשל "CC BY-SA 4.0" */
  license: string;
  /** קישור לנוסח הרישיון. ריק כשלא הצלחנו לגזור אותו. */
  licenseUrl?: string;
}

/**
 * שדות `extmetadata` של ויקישיתוף, כפי שהם חוזרים בפועל.
 *
 * כל ערך עטוף באובייקט עם `value`, ו-`Artist` מגיע כ-HTML — לרוב
 * עוגן עם שם בתוכו, ולפעמים כמה עוגנים או תגיות עיצוב.
 */
export interface ExtMetadata {
  Artist?: { value?: unknown };
  LicenseShortName?: { value?: unknown };
  LicenseUrl?: { value?: unknown };
  License?: { value?: unknown };
}

/** מסיר תגיות HTML ומנרמל רווחים. ויקישיתוף מחזיר את היוצר כ-HTML. */
export function stripHtml(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

/** אורך מרבי לשם יוצר בתצוגה. שמות בוויקישיתוף לפעמים ארוכים מאוד. */
export const MAX_AUTHOR = 60;

/**
 * מיפוי שם רישיון לכתובת הנוסח.
 *
 * נגזר מהשם ולא מרשימה קשיחה, כי ויקישיתוף מחזיר עשרות וריאנטים
 * (`CC BY-SA 4.0`, `CC BY 2.5`, `CC0`). מה שלא מזוהה מחזיר `undefined`
 * ואז מוצג שם הרישיון בלי קישור — עדיין קרדיט תקף.
 */
export function licenseDeedUrl(license: string): string | undefined {
  const s = license.trim().toLowerCase();
  if (!s) return undefined;
  if (s.startsWith('cc0') || s.includes('public domain dedication')) {
    return 'https://creativecommons.org/publicdomain/zero/1.0/';
  }
  // "CC BY-SA 4.0" → by-sa / 4.0
  const m = s.match(/^cc[ -]((?:by)(?:[ -]sa|[ -]nc|[ -]nd)*)[ -]([0-9]\.[0-9])/);
  if (m) {
    const parts = m[1].replace(/\s+/g, '-').replace(/-+/g, '-');
    return `https://creativecommons.org/licenses/${parts}/${m[2]}/`;
  }
  return undefined;
}

/**
 * בונה קרדיט מתוך `extmetadata`, או `null` כשאין ממה.
 *
 * מחזיר `null` בכל מקרה שבו חסר יוצר או רישיון — וזו הנקודה שבה
 * מתקבלת ההחלטה שלא להציג את התמונה. עדיף בלי תמונה מאשר עם קרדיט
 * שאינו עומד ברישיון.
 */
export function creditFromMetadata(meta: ExtMetadata | undefined | null): ImageCredit | null {
  if (!meta) return null;

  const author = stripHtml(String(meta.Artist?.value ?? '')).slice(0, MAX_AUTHOR).trim();
  const license = stripHtml(String(meta.LicenseShortName?.value ?? meta.License?.value ?? '')).trim();
  if (!author || !license) return null;

  /**
   * נחלת הכלל היא מקרה אמיתי ולגיטימי, אבל היא לא "רישיון CC" —
   * ולכן לא מנסים לגזור לה קישור לנוסח. הקרדיט עדיין מוצג, כי
   * ויקישיתוף מבקש לציין את היוצר גם כשאין חובה משפטית.
   */
  const fromMeta = stripHtml(String(meta.LicenseUrl?.value ?? '')).trim();
  const licenseUrl = fromMeta.startsWith('http') ? fromMeta : licenseDeedUrl(license);

  return { author, license, licenseUrl };
}

/**
 * השער: האם מותר להציג את התמונה.
 *
 * פונקציה נפרדת ולא `credit !== null` בכל מקום, כדי שיהיה מקום אחד
 * לבדוק בו — ובדיקה אחת שנופלת אם מישהו ירכך את התנאי.
 */
export function mayDisplay(credit: ImageCredit | null | undefined): credit is ImageCredit {
  return Boolean(credit?.author?.trim() && credit?.license?.trim());
}

/**
 * שורת הקרדיט לתצוגה, כטקסט רציף.
 *
 * `cropped` מוסיף את ציון השינוי שהרישיון דורש: המשחק מציג תמונות
 * ב-`object-fit: cover` ובחלקי פאזל, ושתיהן חיתוך.
 */
export function creditLine(credit: ImageCredit, opts: { source?: string; cropped?: boolean } = {}): string {
  const parts = [credit.author, credit.license];
  if (opts.source) parts.unshift(opts.source);
  const line = parts.join(' · ');
  return opts.cropped ? `${line} · התמונה מוצגת חתוכה` : line;
}


/**
 * מה הרישיון מתיר.
 *
 * ## למה זה קריטי דווקא כאן
 *
 * שני סוגי רישיונות CC **אסורים למשחק הזה**, ולא בגלל הידור אלא
 * בגלל מה שהמשחק עושה בפועל:
 *
 * - **NC (NonCommercial)** — המשחק נמכר במנוי. כל שימוש בו הוא
 *   שימוש מסחרי, ותמונה בלתי־מסחרית בתוכו היא הפרה ישירה.
 * - **ND (NoDerivatives)** — המשחק מציג ב-`object-fit: cover`
 *   וחותך תמונות לחלקי פאזל. שתיהן יצירת נגזרת, וזה בדיוק מה
 *   ש-ND אוסר.
 *
 * עד עכשיו לא נבדק אף אחד מהשניים. ויקישיתוף כמעט אינו מארח NC,
 * ולכן זה לא התפוצץ — אבל ברגע שנוסף מקור שכן מארח (וזה בדיוק מה
 * שקורה עם Openverse), זו הפרה שמחכה לקרות.
 */
export interface LicensePermissions {
  /** מותר בשימוש מסחרי */
  commercial: boolean;
  /** מותר לשנות, כולל חיתוך */
  derivatives: boolean;
}

export function licensePermissions(license: string): LicensePermissions {
  const s = license.trim().toLowerCase();
  // נחלת הכלל ו-CC0: הכול מותר
  if (!s || s.startsWith('cc0') || s.includes('public domain') || s.includes('pdm')) {
    return { commercial: true, derivatives: true };
  }
  return {
    commercial: !/\bnc\b|noncommercial|non-commercial/.test(s),
    derivatives: !/\bnd\b|noderiv|no-deriv/.test(s)
  };
}

/**
 * האם מותר להשתמש בתמונה במשחק הזה.
 *
 * "מותר" כאן פירושו: יש קרדיט מלא, **וגם** הרישיון מתיר שימוש
 * מסחרי ושינוי. תמונה שנכשלת באחד מהם פשוט לא מוצגת.
 */
export function mayUseInGame(credit: ImageCredit | null | undefined): credit is ImageCredit {
  if (!mayDisplay(credit)) return false;
  const p = licensePermissions(credit.license);
  return p.commercial && p.derivatives;
}
