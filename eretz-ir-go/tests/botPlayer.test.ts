import { describe, expect, it } from 'vitest';
import { planBotRound, totalThinkMs } from '../src/lib/botPlayer';
import { ARTZI_PROFILE } from '../src/data/botProfile';
import type { KnowledgeItem } from '../src/types';

const item = (
  name: string,
  categoryId: string,
  firstLetter: string,
  popularityScore: number
): KnowledgeItem => ({
  id: `${categoryId}-${name}`,
  canonicalName: name,
  normalizedName: name,
  aliases: [],
  categoryIds: [categoryId],
  firstLetter,
  popularityScore,
  rarityScore: 100 - popularityScore,
  language: 'he',
  sources: [],
  childSafe: true,
  lastVerifiedAt: new Date(0).toISOString()
});

const items: KnowledgeItem[] = [
  item('אנגליה', 'country', 'א', 95),
  item('ארגנטינה', 'country', 'א', 70),
  item('אנדורה', 'country', 'א', 12),
  item('אשדוד', 'city', 'א', 90),
  item('אילת', 'city', 'א', 80),
  item('אריה', 'animal', 'א', 98),
  item('אנטילופה', 'animal', 'א', 30),
  item('בלגיה', 'country', 'ב', 60)
];

const cats = ['country', 'city', 'animal', 'profession'];

/** גנרטור קבוע, כדי שהתרחיש יהיה זהה בכל הרצה */
const seq = (values: number[]) => {
  let i = 0;
  return () => values[i++ % values.length];
};

describe('ארצי כיריב', () => {
  it('עונה רק על מה שקיים במאגר באות שהוגרלה', () => {
    const moves = planBotRound({
      categoryIds: cats,
      letter: 'א',
      difficulty: 'hard',
      items,
      rng: seq([0])
    });

    expect(moves.map((m) => m.categoryId)).toEqual(cats);
    // "מקצוע" אין במאגר — ארצי לא ממציא
    expect(moves.find((m) => m.categoryId === 'profession')?.answer).toBeNull();
    for (const m of moves) {
      if (m.answer) expect(items.some((i) => i.canonicalName === m.answer)).toBe(true);
    }
  });

  it('לא עונה באות אחרת', () => {
    const moves = planBotRound({
      categoryIds: ['country'],
      letter: 'ב',
      difficulty: 'hard',
      items,
      rng: seq([0])
    });
    expect(moves[0].answer).toBe('בלגיה');
  });

  it('לא חוזר על אותה תשובה פעמיים בסיבוב', () => {
    const shared = [item('אור', 'a', 'א', 50), item('אור', 'b', 'א', 50)];
    // אותו שם, שתי קטגוריות: המילון של הסיבוב חוסם את השנייה
    const moves = planBotRound({
      categoryIds: ['a', 'b'],
      letter: 'א',
      difficulty: 'hard',
      items: shared,
      rng: seq([0])
    });
    const answers = moves.map((m) => m.answer).filter(Boolean);
    expect(new Set(answers).size).toBe(answers.length);
  });

  it('ברמה קלה ארצי בוחר את המילה המובנת מאליה, ובקשה את הנדירה', () => {
    const easy = planBotRound({
      categoryIds: ['animal'],
      letter: 'א',
      difficulty: 'easy',
      items,
      rng: seq([0])
    });
    const hard = planBotRound({
      categoryIds: ['animal'],
      letter: 'א',
      difficulty: 'hard',
      items,
      rng: seq([0])
    });
    expect(easy[0].answer).toBe('אריה');
    expect(hard[0].answer).toBe('אנטילופה');
  });

  it('ברמה קלה ארצי מפספס לפעמים, ברמה קשה כמעט אף פעם', () => {
    const miss = (difficulty: 'easy' | 'hard') => {
      let misses = 0;
      for (let seed = 0; seed < 200; seed++) {
        // rng פסאודו-אקראי דטרמיניסטי לפי seed
        let x = seed + 1;
        const rng = () => {
          x = (x * 1103515245 + 12345) % 2147483648;
          return x / 2147483648;
        };
        const moves = planBotRound({ categoryIds: ['animal'], letter: 'א', difficulty, items, rng });
        if (!moves[0].answer) misses++;
      }
      return misses / 200;
    };

    expect(miss('easy')).toBeGreaterThan(0.25);
    expect(miss('hard')).toBeLessThan(0.15);
  });

  it('התור נמשך זמן סביר — לא הבזק ולא נצח', () => {
    const moves = planBotRound({
      categoryIds: [...cats, 'plant', 'inanimate'],
      letter: 'א',
      difficulty: 'medium',
      items,
      rng: seq([0.5])
    });
    const total = totalThinkMs(moves);
    expect(total).toBeGreaterThan(2000);
    expect(total).toBeLessThan(12_000);
  });

  it('רשימה ריקה של קטגוריות לא מפילה כלום', () => {
    expect(planBotRound({ categoryIds: [], letter: 'א', difficulty: 'medium', items })).toEqual([]);
  });

  /**
   * ארצי הוא יריב לסיבוב ולא משתמש. אם יהיה לו id הוא יתחיל לצבור
   * ניקוד בפרופילים ולהופיע בטבלאות, וזה לא מה שהוא.
   */
  it('לארצי אין id ולכן הוא לא נשמר כפרופיל', () => {
    expect(ARTZI_PROFILE.id).toBeUndefined();
    expect(ARTZI_PROFILE.name).toBe('ארצי');
  });
});
