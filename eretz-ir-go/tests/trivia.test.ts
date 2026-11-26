import { describe, expect, it } from 'vitest';
import { RIDDLES, isRiddleAnswerCorrect, pickRiddle, questionPool } from '../src/data/riddles';
import { RECENT_TTL_DAYS, TRIVIA, TRIVIA_WORLDS, activeTrivia, isTriviaActive } from '../src/data/trivia';

const DAY = 86_400_000;
const recent = TRIVIA.filter((q) => q.recent);

describe('מאגר שאלות הידע', () => {
  it('המזהים ייחודיים, גם מול החידות הקלאסיות', () => {
    const ids = [...RIDDLES, ...TRIVIA].map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('לכל שאלה עולם מוכר, שאלה ותשובה, ותאריך אימות תקין', () => {
    for (const q of TRIVIA) {
      expect(TRIVIA_WORLDS[q.world], q.id).toBeDefined();
      expect(q.question.length, q.id).toBeGreaterThan(10);
      expect(q.answers[0].trim(), q.id).not.toBe('');
      expect(Number.isNaN(Date.parse(q.asOf)), `${q.id}: asOf`).toBe(false);
    }
  });

  it('כל תשובה רשמית מתקבלת', () => {
    for (const q of TRIVIA) {
      for (const a of q.answers) expect(isRiddleAnswerCorrect(q, a), `${q.id}: ${a}`).toBe(true);
    }
  });

  /** תשובה שנכתבה מהזיכרון היא בדיוק איך שמתפרסמת שגיאה שנראית בטוחה */
  it('שאלה עדכנית חייבת מקור בקישור', () => {
    expect(recent.length).toBeGreaterThan(5);
    for (const q of recent) expect(q.source, q.id).toMatch(/^https:\/\//);
  });

  it('השאלה מהבקשה המקורית קיימת: מי הייתה העגבנייה', () => {
    const q = TRIVIA.find((t) => t.id === 'tv-masked-tomato')!;
    expect(q.question).toContain('עגבנייה');
    for (const guess of ['ליאם גולן', 'ליאם', ' ליאם גולן. ']) expect(isRiddleAnswerCorrect(q, guess), guess).toBe(true);
    expect(isRiddleAnswerCorrect(q, 'אייל גולן')).toBe(false);
  });

  it('ילד שמתבלבל בכתיב נורווגיה/נורבגיה עדיין צודק', () => {
    const q = TRIVIA.find((t) => t.id === 'sport-winter-2026-medals')!;
    for (const guess of ['נורווגיה', 'נורבגיה', 'הנורבגיה']) expect(isRiddleAnswerCorrect(q, guess), guess).toBe(true);
  });

  it('תשובה לא קשורה נדחית', () => {
    for (const q of TRIVIA) expect(isRiddleAnswerCorrect(q, 'בננה בפיג׳מה'), q.id).toBe(false);
  });
});

describe('רענון: שאלות עדכניות פוקעות לבד', () => {
  const q = recent[0];
  const verified = Date.parse(q.asOf);

  it('בתוקף ביום האימות ובסוף התקופה, ופגה יום אחרי', () => {
    expect(isTriviaActive(q, new Date(verified))).toBe(true);
    expect(isTriviaActive(q, new Date(verified + RECENT_TTL_DAYS * DAY))).toBe(true);
    expect(isTriviaActive(q, new Date(verified + (RECENT_TTL_DAYS + 1) * DAY))).toBe(false);
  });

  it('שאלה נצחית לעולם לא פגה', () => {
    const evergreen = TRIVIA.find((t) => !t.recent)!;
    expect(isTriviaActive(evergreen, new Date('2040-01-01'))).toBe(true);
  });

  it('בעוד שנתיים נשארות רק השאלות הנצחיות, והמשחק ממשיך לעבוד', () => {
    const later = new Date(verified + 2 * RECENT_TTL_DAYS * DAY);
    expect(activeTrivia(later).every((t) => !t.recent)).toBe(true);
    expect(questionPool(later).length).toBeGreaterThan(RIDDLES.length);
    expect(pickRiddle([], later).id).toBeTruthy();
  });

  it('שאלה שפגה לא נשלפת, גם כשהרנדום פוגע בסוף הרשימה', () => {
    const later = new Date(verified + 2 * RECENT_TTL_DAYS * DAY);
    const expired = new Set(recent.map((t) => t.id));
    for (const r of [0, 0.25, 0.5, 0.75, 0.999]) expect(expired.has(pickRiddle([], later, () => r).id)).toBe(false);
  });
});

describe('בטיחות ילדים', () => {
  const banned = /מלחמ|פיגוע|רצח|הרג|נרצח|מחבל|בחירות|ממשלה|כנסת|סמים|אלכוהול|מין\b|סרטן/;
  it('אף שאלה או תשובה אינן נוגעות בפוליטיקה, אלימות או נושאים למבוגרים', () => {
    for (const q of TRIVIA) {
      const text = `${q.question} ${q.answers.join(' ')}`;
      expect(text, q.id).not.toMatch(banned);
    }
  });
});
