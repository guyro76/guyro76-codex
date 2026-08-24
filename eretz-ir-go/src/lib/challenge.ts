import { GAME_LETTERS } from './hebrew';
import { GAME_URL } from './share';

/**
 * אתגר לחבר — משחק מול מישהו שלא נמצא לידך, בלי שרת ובלי צ'אט.
 *
 * הרעיון: הסיבוב כולו נארז לתוך הקישור עצמו. החבר פותח את הקישור,
 * משחק את **אותה אות ואותן קטגוריות**, ורואה מיד מי ניצח. אין חדר,
 * אין המתנה, ואין שום דבר שעובר דרך שרת שלנו — הקישור נוסע בוואטסאפ
 * מילד לילד, והמטען יושב ב-hash של הכתובת, שהדפדפן לעולם לא שולח
 * לשרת.
 *
 * ## שלוש החלטות שאסור להפוך אותן בלי לחשוב שוב
 *
 * 1. **התשובות עצמן לא נשלחות. רק הניקוד.**
 *    זו לא קמצנות בבתים. מטען שנושא טקסט חופשי שילד הקליד, ומגיע
 *    לילד אחר, הוא ערוץ צ'אט — לא משנה איך קוראים לו במסך. כללי
 *    הפרויקט אוסרים צ'אט פתוח בין ילדים, ולכן מה שנוסע הוא מספרים
 *    בלבד: כמה נקודות קיבל המאתגר בכל קטגוריה. ההשוואה נשארת מעניינת
 *    ("הוא קיבל 10 על 'חי' ואתה 5") בלי לפתוח דלת.
 *
 * 2. **הכינוי מנוקה בפענוח, לא רק בבנייה.**
 *    מי ששולח את הקישור יכול לערוך אותו. ניקוי בצד השולח הוא בקשה
 *    יפה; ניקוי בצד המקבל הוא מה שבאמת מגן. לכן `decodeChallenge`
 *    מנקה שוב, ותמיד.
 *
 * 3. **רק קטגוריות מובנות.**
 *    קטגוריה שההורה יצר קיימת רק במכשיר שלו. אתגר שמפנה אליה היה
 *    נפתח אצל החבר כקטגוריה ריקה בלי שם. עדיף לסנן אותה בבנייה
 *    ולומר את זה, מאשר לשלוח אתגר שבור.
 */

/** גרסת המטען. קישור מגרסה אחרת נדחה במפורש ולא מפוענח חלקית. */
export const CHALLENGE_VERSION = 1;

/** תקרות שפיות — מגבילות גם קישור שנערך ביד */
export const MAX_NICKNAME = 12;
export const MAX_CATEGORIES = 12;
export const MAX_SECONDS = 600;
/** ניקוד לקטגוריה בודדת אצלנו לא מתקרב לזה; זו הגנה, לא כלל משחק */
export const MAX_POINTS = 999;

export interface Challenge {
  /** גרסת מבנה */
  v: number;
  /** מזהה קצר, כדי לזהות שהחבר כבר שיחק את האתגר הזה */
  id: string;
  /** הכינוי של המאתגר, מנוקה */
  by: string;
  /** האות שהוגרלה */
  letter: string;
  /** מזהי הקטגוריות, בסדר המשחק */
  cats: string[];
  /** שניות לסיבוב. 0 = בלי הגבלת זמן */
  secs: number;
  /** הניקוד של המאתגר לכל קטגוריה, באותו סדר בדיוק כמו `cats` */
  pts: number[];
}

/**
 * ניקוי כינוי.
 *
 * מותר: אותיות עבריות, אותיות לטיניות, ספרות, רווח, גרש וגרשיים.
 * כל השאר יורד. זה מה שמונע מהשדה להפוך למחברת הודעות: אין ניקוד,
 * אין אימוג'י, אין שורות חדשות, ואורך קצוב.
 */
export function sanitizeNickname(raw: string): string {
  const cleaned = (raw ?? '')
    .replace(/[^֐-׿a-zA-Z0-9 '״׳"]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_NICKNAME)
    .trim();
  return cleaned || 'שחקן';
}

/** מזהה קצר וקריא. לא סוד ולא מפתח — רק כדי לזהות אתגר חוזר. */
export function challengeId(): string {
  const alphabet = 'abcdefghijkmnpqrstuvwxyz23456789';
  let out = '';
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  for (const b of bytes) out += alphabet[b % alphabet.length];
  return out;
}

export interface ChallengeInput {
  nickname: string;
  letter: string;
  /** קטגוריות ששוחקו, לפי הסדר. קטגוריות מותאמות אישית יסוננו. */
  categories: { id: string; custom?: boolean }[];
  seconds: number;
  /** ניקוד לכל קטגוריה, לפי מזהה */
  pointsByCategory: Record<string, number>;
}

/**
 * בונה אתגר מסיבוב שכבר שוחק.
 *
 * מחזיר `null` כשלא נשאר ממה לבנות אתגר — למשל סיבוב שכולו
 * קטגוריות מותאמות אישית. עדיף להסתיר כפתור מאשר לייצר קישור שבור.
 */
export function buildChallenge(input: ChallengeInput): Challenge | null {
  if (!isGameLetter(input.letter)) return null;

  const cats = input.categories
    .filter((c) => !c.custom)
    .map((c) => c.id)
    .filter(isCategoryId)
    .slice(0, MAX_CATEGORIES);
  if (!cats.length) return null;

  return {
    v: CHALLENGE_VERSION,
    id: challengeId(),
    by: sanitizeNickname(input.nickname),
    letter: input.letter,
    cats,
    secs: clampSeconds(input.seconds),
    pts: cats.map((id) => clampPoints(input.pointsByCategory[id] ?? 0))
  };
}

/** סך הניקוד של המאתגר */
export function challengeTotal(c: Challenge): number {
  return c.pts.reduce((sum, n) => sum + n, 0);
}

export type ChallengeOutcome = 'win' | 'lose' | 'tie';

export interface ChallengeResult {
  outcome: ChallengeOutcome;
  mine: number;
  theirs: number;
  /** הפרש מוחלט, לניסוח "בהפרש 12 נקודות" */
  gap: number;
}

/** משווה את הניקוד שלי לניקוד המאתגר */
export function compareToChallenge(c: Challenge, myPoints: number): ChallengeResult {
  const theirs = challengeTotal(c);
  const mine = Math.max(0, Math.round(myPoints));
  return {
    outcome: mine > theirs ? 'win' : mine < theirs ? 'lose' : 'tie',
    mine,
    theirs,
    gap: Math.abs(mine - theirs)
  };
}

// ===== קידוד =====

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(text: string): string | null {
  try {
    const base64 = text.replace(/-/g, '+').replace(/_/g, '/');
    // atob דורש אורך שמתחלק בארבע; ההשמטה של הריפוד היא שלנו
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}

export function encodeChallenge(c: Challenge): string {
  return toBase64Url(JSON.stringify(c));
}

/**
 * מפענח מטען אתגר.
 *
 * מחזיר `null` על כל חריגה — מטען פגום, גרסה אחרת, או שדה שלא
 * נראה כמו מה שהוא אמור להיות. **אין כאן פענוח חלקי**: אתגר
 * שמחציתו הגיונית הוא אתגר שבור, ומסך שמנסה לשחק אותו יתנהג מוזר
 * במקום להגיד "הקישור לא תקין".
 */
export function decodeChallenge(payload: string): Challenge | null {
  const json = fromBase64Url((payload ?? '').trim());
  if (!json) return null;

  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch {
    return null;
  }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;

  const o = raw as Record<string, unknown>;
  if (o.v !== CHALLENGE_VERSION) return null;
  if (typeof o.id !== 'string' || !/^[a-z0-9]{4,16}$/.test(o.id)) return null;
  if (typeof o.by !== 'string') return null;
  if (typeof o.letter !== 'string' || !isGameLetter(o.letter)) return null;
  if (typeof o.secs !== 'number' || !Number.isFinite(o.secs)) return null;

  if (!Array.isArray(o.cats) || !o.cats.length || o.cats.length > MAX_CATEGORIES) return null;
  if (!o.cats.every((id) => typeof id === 'string' && isCategoryId(id))) return null;
  // מזהה כפול היה מציג את אותה קטגוריה פעמיים ומכפיל ניקוד
  if (new Set(o.cats as string[]).size !== o.cats.length) return null;

  if (!Array.isArray(o.pts) || o.pts.length !== o.cats.length) return null;
  if (!o.pts.every((n) => typeof n === 'number' && Number.isFinite(n) && n >= 0 && n <= MAX_POINTS)) {
    return null;
  }

  return {
    v: CHALLENGE_VERSION,
    id: o.id,
    // מנוקה שוב, כי מי ששלח את הקישור יכול היה לערוך אותו
    by: sanitizeNickname(o.by),
    letter: o.letter,
    cats: o.cats as string[],
    secs: clampSeconds(o.secs),
    pts: (o.pts as number[]).map(clampPoints)
  };
}

/** הפרמטר ב-hash. ב-hash ולא ב-query — hash לא נשלח לשרת בבקשת הדף. */
export const CHALLENGE_PARAM = 'c';

export function challengeLink(c: Challenge): string {
  return `${GAME_URL}/#${CHALLENGE_PARAM}=${encodeChallenge(c)}`;
}

/**
 * שולף מטען אתגר מתוך hash של כתובת.
 *
 * מקבל את ה-hash כפרמטר ולא קורא ל-`location` בעצמו, כדי שיהיה
 * ניתן לבדיקה ולא יקרוס בסביבה בלי DOM.
 */
export function readChallengeFromHash(hash: string): Challenge | null {
  const clean = (hash ?? '').replace(/^#/, '');
  if (!clean) return null;
  const params = new URLSearchParams(clean);
  const payload = params.get(CHALLENGE_PARAM);
  return payload ? decodeChallenge(payload) : null;
}

/** טקסט ההזמנה שנשלח בוואטסאפ. בלי תשובות ובלי פרטים מזהים. */
export function challengeInviteText(c: Challenge): string {
  return [
    `${c.by} מאתגר אותך בארץ-עיר GO! 🎯`,
    '',
    `האות: ${c.letter}`,
    `${c.cats.length} קטגוריות · ${c.secs ? `${c.secs} שניות` : 'בלי הגבלת זמן'}`,
    `הניקוד שיש לנצח: ${challengeTotal(c)}`,
    '',
    challengeLink(c)
  ].join('\n');
}

// ===== עזר =====

function isGameLetter(letter: string): boolean {
  return (GAME_LETTERS as readonly string[]).includes(letter);
}

/** מזהי הקטגוריות שלנו הם לטיניים־קטנים; כל השאר אינו מזהה שלנו */
function isCategoryId(id: string): boolean {
  return /^[a-z][a-z0-9-]{1,23}$/.test(id);
}

function clampSeconds(secs: number): number {
  if (!Number.isFinite(secs) || secs <= 0) return 0;
  return Math.min(MAX_SECONDS, Math.round(secs));
}

function clampPoints(n: number): number {
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.min(MAX_POINTS, Math.round(n));
}
