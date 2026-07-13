import type { Category, Gender, KnowledgeItem } from '../types';
import type { KnowledgeBase } from './knowledge';
import { say } from './persona';

/**
 * "ארצי" 🤖 — הבוט של המשחק.
 * מנוע רמזים מקומי לחלוטין (LocalHintEngine): פועל על מאגר הידע המאונדקס,
 * ללא שום קריאת API בתשלום וללא שליחת מידע החוצה.
 * שלוש דרגות רמז + חשיפה, בדיוק לפי האפיון.
 */

export interface Hint {
  level: 1 | 2 | 3;
  text: string;
  letters?: string; // תצוגת "_ _ _" לדרגה 3
  choices?: string[]; // אפשרויות בחירה לדרגה 3
}

/** בחירת פריט יעד לרמז: מעדיף פריט פופולרי שקל לנחש */
export function pickHintTarget(
  kb: KnowledgeBase,
  categoryId: string,
  letter: string,
  excludeNormalized: Set<string>,
  rng: () => number = Math.random
): KnowledgeItem | null {
  const pool = kb
    .byLetter(categoryId, letter)
    .filter((item) => !excludeNormalized.has(item.normalizedName))
    .sort((a, b) => b.popularityScore - a.popularityScore);
  if (pool.length === 0) return null;
  // מתוך החמישייה הפופולרית — קצת גיוון
  const top = pool.slice(0, Math.min(5, pool.length));
  return top[Math.floor(rng() * top.length)];
}

function maskedLetters(name: string): string {
  return name
    .split('')
    .map((ch, i) => (ch === ' ' ? ' · ' : i === 0 ? ch : '_'))
    .join(' ');
}

export function buildHint(
  item: KnowledgeItem,
  level: 1 | 2 | 3,
  category: Category,
  kb: KnowledgeBase,
  rng: () => number = Math.random
): Hint {
  if (level === 1) {
    // רמז כללי — קטגוריה + תיאור מרומז ללא פרטים מזהים
    const desc = item.description ?? `${category.description} שמתחיל באות ${item.firstLetter}`;
    return { level, text: `זה ${category.description}. ${obscure(desc, item.canonicalName)}` };
  }
  if (level === 2) {
    // רמז מפורט — עובדה או תיאור מלא
    const fact = item.facts?.[0] ?? item.description ?? `יש בו ${item.canonicalName.length} אותיות`;
    return { level, text: obscure(fact, item.canonicalName) };
  }
  // דרגה 3 — אותיות + אפשרויות בחירה
  const distractors = kb
    .inCategory(category.id)
    .filter((x) => x.id !== item.id)
    .sort(() => rng() - 0.5)
    .slice(0, 2)
    .map((x) => x.canonicalName);
  const choices = [...distractors, item.canonicalName].sort(() => rng() - 0.5);
  return {
    level,
    text: `המילה נראית כך: ${maskedLetters(item.canonicalName)}`,
    letters: maskedLetters(item.canonicalName),
    choices
  };
}

/** מסתיר את שם הפריט עצמו בתוך טקסט הרמז */
function obscure(text: string, name: string): string {
  return text.split(name).join('✨');
}

/** משפטי הליווי של ארצי — עם אישיות, לפי מגדר הפונה */
export function artziSays(kind: 'intro' | 'hint' | 'noHint' | 'reveal' | 'cheer', gender: Gender): string {
  switch (kind) {
    case 'intro':
      return `היי! אני ארצי 🤖 למדתי את כל המאגר בעל־פה (טוב, אני המאגר). ${say('ready', gender)}`;
    case 'hint':
      return 'יש לי רעיון בשבילך…';
    case 'noHint':
      return 'הפעם אין לי רעיון טוב לאות הזו — אולי בקטגוריה אחרת אעזור יותר!';
    case 'reveal':
      return 'בסדר, מגלים! שווה לזכור את זה לפעם הבאה:';
    case 'cheer':
      return gender === 'girl' ? 'ידעתי שתמצאי לבד! 🎉' : gender === 'boy' ? 'ידעתי שתמצא לבד! 🎉' : 'ידעתי שתמצאו לבד! 🎉';
  }
}
