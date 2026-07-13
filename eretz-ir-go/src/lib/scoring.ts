import type { SubmittedAnswer } from '../types';

/**
 * שיטת הניקוד הקלאסית + הרחבות:
 * 10 — תשובה נכונה וייחודית, 5 — נכונה אך זהה לשחקן אחר, 0 — שגויה/ריקה.
 */
export const BASE_UNIQUE = 10;
export const BASE_SHARED = 5;

/** הפחתות רמז — עדינות, כדי לעודד למידה ולא להעניש */
export const HINT_PENALTIES = [0, 2, 4, 7]; // לפי מספר הרמזים שנוצלו

export interface OriginalityInput {
  popularityScore: number; // 0-100 מהמאגר (גבוה = נפוץ)
  timesUsedBefore: number; // כמה פעמים השחקן עצמו השתמש בזו בעבר
  duplicateWithOtherPlayer: boolean;
  isNewDiscovery: boolean; // תשובה שאושרה עכשיו לראשונה
  usedHint: boolean;
}

/** מדד מקוריות 0-100 */
export function originalityScore(input: OriginalityInput): number {
  if (input.duplicateWithOtherPlayer) return Math.min(25, 100 - input.popularityScore);
  let score = 100 - input.popularityScore; // תשובה נדירה במאגר = מקורית
  score -= Math.min(30, input.timesUsedBefore * 6); // שחיקה על שימוש חוזר
  if (input.isNewDiscovery) score += 20;
  if (input.usedHint) score -= 15;
  return Math.max(0, Math.min(100, Math.round(score)));
}

/** בונוס מקוריות בנקודות לפי המדד */
export function originalityBonus(originality: number): number {
  if (originality >= 85) return 10;
  if (originality >= 65) return 6;
  if (originality >= 40) return 3;
  return 0;
}

/** בונוס מהירות: עד 5 נקודות אם התשובה הוקלדה ברבע הראשון של הזמן */
export function speedBonus(typedAtMs: number, roundSeconds: number): number {
  if (roundSeconds <= 0) return 0;
  const frac = typedAtMs / (roundSeconds * 1000);
  if (frac <= 0.25) return 5;
  if (frac <= 0.5) return 3;
  if (frac <= 0.75) return 1;
  return 0;
}

export interface ScoreInput {
  isValid: boolean;
  revealed: boolean;
  duplicateWithOtherPlayer: boolean;
  hintsUsed: number;
  originality: number;
  typedAtMs: number;
  roundSeconds: number;
  isNewDiscovery: boolean;
}

export interface ScoreBreakdown {
  base: number;
  hintPenalty: number;
  originalityBonus: number;
  speedBonus: number;
  noHintBonus: number;
  discoveryBonus: number;
  total: number;
}

export function scoreAnswer(input: ScoreInput): ScoreBreakdown {
  if (!input.isValid || input.revealed) {
    // חשיפת תשובה = למידה, לא ניקוד
    return { base: 0, hintPenalty: 0, originalityBonus: 0, speedBonus: 0, noHintBonus: 0, discoveryBonus: 0, total: 0 };
  }
  const base = input.duplicateWithOtherPlayer ? BASE_SHARED : BASE_UNIQUE;
  const hintPenalty = HINT_PENALTIES[Math.min(input.hintsUsed, HINT_PENALTIES.length - 1)];
  const oBonus = originalityBonus(input.originality);
  const sBonus = speedBonus(input.typedAtMs, input.roundSeconds);
  const noHintBonus = input.hintsUsed === 0 ? 3 : 0;
  const discoveryBonus = input.isNewDiscovery ? 5 : 0;
  const total = Math.max(0, base - hintPenalty + oBonus + sBonus + noHintBonus + discoveryBonus);
  return { base, hintPenalty, originalityBonus: oBonus, speedBonus: sBonus, noHintBonus, discoveryBonus, total };
}

/** בונוס השלמה: כל הקטגוריות מולאו נכון */
export function completionBonus(answers: SubmittedAnswer[], categoryCount: number): number {
  const valid = answers.filter((a) => a.validation.status === 'valid' && !a.revealed).length;
  return valid === categoryCount && categoryCount > 0 ? 8 : 0;
}

/** תיאור מילולי למדד המקוריות */
export function originalityLabel(originality: number, duplicate: boolean): string {
  if (duplicate) return 'גם השחקן השני חשב על זה';
  if (originality >= 85) return 'תשובה נדירה! בחירה מבריקה';
  if (originality >= 65) return 'תשובה יצירתית';
  if (originality >= 40) return 'תשובה טובה';
  return 'תשובה נפוצה';
}
