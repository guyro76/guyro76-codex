import type { AnswerValidation, Category, KnowledgeItem } from '../types';
import { looksLikeGibberish, normalizeHebrew, startsWithLetter } from './hebrew';
import { isCloseMatch } from './fuzzy';
import type { KnowledgeBase } from './knowledge';

/**
 * מנוע בדיקת התשובות ההיברידי — לפי שלבי האפיון:
 * 1) נרמול  2) בדיקת אות  3) בדיקת קטגוריה במאגר
 * 4) שגיאות כתיב (Fuzzy)  5) לא במאגר -> "נדרשת בדיקה" (אימות אונליין/הורה)
 * 6) חסימת ג'יבריש וכפילויות.
 */
export function validateAnswer(params: {
  raw: string;
  letter: string;
  category: Category;
  kb: KnowledgeBase;
  usedInRound: Set<string>; // תשובות שכבר הוגשו בסיבוב (מנורמלות) למניעת כפילות
  personalDictionary: Set<string>; // תשובות שאושרו בעבר לשחקן בקטגוריה זו
}): AnswerValidation {
  const { raw, letter, category, kb, usedInRound, personalDictionary } = params;
  const normalized = normalizeHebrew(raw);

  if (!normalized) {
    return { status: 'empty', reason: 'לא הוקלדה תשובה', verificationSource: 'none' };
  }

  // שלב 6 (מוקדם): ג'יבריש
  if (looksLikeGibberish(raw)) {
    return {
      status: 'gibberish',
      reason: 'זו לא נראית כמו מילה אמיתית. אפשר לנסות שוב!',
      verificationSource: 'none'
    };
  }

  // מניעת אותה תשובה פעמיים באותו סיבוב
  if (usedInRound.has(normalized)) {
    return {
      status: 'duplicate',
      reason: 'כבר השתמשתם בתשובה הזו בסיבוב הזה',
      verificationSource: 'none'
    };
  }

  // תשובה רב-מילית בקטגוריה שלא מאפשרת
  if (!category.allowMultiWord && normalized.includes(' ')) {
    return {
      status: 'wrong-category',
      reason: 'בקטגוריה הזו התשובה צריכה להיות מילה אחת',
      verificationSource: 'none'
    };
  }

  // אותיות לועזיות בקטגוריה שלא מתירה
  if (!category.allowLatin && /[a-z]/.test(normalized)) {
    return {
      status: 'wrong-category',
      reason: 'בקטגוריה הזו כותבים בעברית',
      verificationSource: 'none'
    };
  }

  // שלב 2: בדיקת האות
  if (!startsWithLetter(raw, letter, { allowHeHaydia: category.allowProperNames || category.allowMultiWord })) {
    return {
      status: 'wrong-letter',
      reason: `התשובה צריכה להתחיל באות ${letter}`,
      verificationSource: 'none'
    };
  }

  // שלב 3: חיפוש מדויק במאגר
  const exact = kb.findExact(normalized);
  const inCategory = exact.find((item) => item.categoryIds.includes(category.id));
  if (inCategory) {
    return {
      status: 'valid',
      reason: 'תשובה נכונה!',
      matchedItem: inCategory,
      verificationSource: 'local-db'
    };
  }

  // נמצא במאגר אבל בקטגוריה אחרת — "בננה היא לא עיר"
  if (exact.length > 0 && !category.custom) {
    return {
      status: 'wrong-category',
      reason: 'התשובה מתחילה באות הנכונה, אבל אינה מתאימה לקטגוריה',
      verificationSource: 'local-db'
    };
  }

  // מילון אישי (תשובות שאושרו בעבר, למשל בקטגוריה אישית)
  if (personalDictionary.has(normalized)) {
    return {
      status: 'valid',
      reason: 'תשובה נכונה! (מהמילון האישי שלך)',
      verificationSource: 'personal'
    };
  }

  // שלב 4: שגיאות כתיב — חיפוש התאמה קרובה בקטגוריה ובאות
  const candidates = kb.byLetter(category.id, normalizeHebrew(letter).charAt(0));
  let best: KnowledgeItem | undefined;
  for (const item of candidates) {
    if (isCloseMatch(normalized, item.normalizedName) || item.aliases.some((a) => isCloseMatch(normalized, a))) {
      if (!best || item.popularityScore > best.popularityScore) best = item;
    }
  }
  if (best) {
    return {
      status: 'spelling',
      reason: `אולי התכוונת ל"${best.canonicalName}"?`,
      matchedItem: best,
      suggestion: best.canonicalName,
      verificationSource: 'local-db'
    };
  }

  // שלב 5: לא במאגר — נדרשת בדיקה (אונליין כשאפשר, אחרת ערעור/אישור הורה)
  return {
    status: 'needs-review',
    reason: 'התשובה לא מוכרת לי עדיין — בודקים אותה!',
    verificationSource: 'none'
  };
}
