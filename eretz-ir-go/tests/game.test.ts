import { describe, expect, it } from 'vitest';
import { dailyChallenge } from '../src/lib/daily';
import { drawLetter, buildLetterIndex, seededRandom } from '../src/lib/letters';
import { getKnowledgeBase } from '../src/lib/knowledge';
import { CLASSIC_CATEGORY_IDS } from '../src/data/categories';
import { GAME_LETTERS } from '../src/lib/hebrew';
import { pickHintTarget, buildHint } from '../src/lib/artzi';
import { CATEGORIES } from '../src/data/categories';
import { levenshtein, isCloseMatch } from '../src/lib/fuzzy';

describe('האתגר היומי', () => {
  it('דטרמיניסטי לאותו תאריך', () => {
    const a = dailyChallenge('2026-07-13');
    const b = dailyChallenge('2026-07-13');
    expect(a).toEqual(b);
  });
  it('משתנה בין תאריכים', () => {
    const a = dailyChallenge('2026-07-13');
    const b = dailyChallenge('2026-07-14');
    expect(a.letter !== b.letter || a.categoryIds.join() !== b.categoryIds.join()).toBe(true);
  });
  it('אות חוקית וללא סופיות', () => {
    const spec = dailyChallenge('2026-01-01');
    expect(GAME_LETTERS).toContain(spec.letter);
  });
});

describe('הגרלת אות הוגנת', () => {
  const kb = getKnowledgeBase();
  const index = buildLetterIndex(kb.items);

  it('לא בוחרת אות ללא כיסוי במאגר', () => {
    const rng = seededRandom(42);
    for (let i = 0; i < 50; i++) {
      const letter = drawLetter(CLASSIC_CATEGORY_IDS, 'medium', index, [], rng);
      // לפחות 60% מהקטגוריות הקלאסיות מכוסות
      let covered = 0;
      for (const cat of CLASSIC_CATEGORY_IDS) {
        if ((index.get(`${cat}|${letter}`)?.size ?? 0) > 0) covered++;
      }
      expect(covered).toBeGreaterThanOrEqual(Math.ceil(CLASSIC_CATEGORY_IDS.length * 0.6));
    }
  });

  it('מכבדת אותיות שכבר שוחקו', () => {
    const used = ['א', 'ב', 'מ'];
    const letter = drawLetter(CLASSIC_CATEGORY_IDS, 'easy', index, used, seededRandom(7));
    expect(used).not.toContain(letter);
  });
});

describe('ארצי — מנוע הרמזים המקומי', () => {
  const kb = getKnowledgeBase();

  it('מוצא יעד רמז לכל קטגוריה קלאסית באות מ', () => {
    for (const catId of CLASSIC_CATEGORY_IDS) {
      const target = pickHintTarget(kb, catId, 'מ', new Set(), seededRandom(1));
      expect(target, `אין יעד רמז ל-${catId} באות מ`).not.toBeNull();
    }
  });

  it('רמז דרגה 1 לא מסגיר את התשובה', () => {
    const country = CATEGORIES.find((c) => c.id === 'country')!;
    const target = kb.byLetter('country', 'צ').find((x) => x.canonicalName === 'צרפת')!;
    const hint = buildHint(target, 1, country, kb, seededRandom(3));
    expect(hint.text).not.toContain('צרפת');
  });

  it('רמז דרגה 3 כולל אפשרויות בחירה עם התשובה הנכונה', () => {
    const country = CATEGORIES.find((c) => c.id === 'country')!;
    const target = kb.byLetter('country', 'צ')[0];
    const hint = buildHint(target, 3, country, kb, seededRandom(5));
    expect(hint.choices).toContain(target.canonicalName);
    expect(hint.choices!.length).toBeGreaterThanOrEqual(2);
  });
});

describe('Fuzzy Matching', () => {
  it('מרחק לוינשטיין', () => {
    expect(levenshtein('פריז', 'פריז')).toBe(0);
    expect(levenshtein('פריז', 'פריס')).toBe(1);
  });
  it('סף לפי אורך', () => {
    expect(isCloseMatch('זימבבוה', 'זימבבואה')).toBe(true);
    expect(isCloseMatch('כן', 'לא')).toBe(false);
  });
});

describe('כיסוי המאגר', () => {
  const kb = getKnowledgeBase();
  it('לכל אות משחק יש תשובה בלפחות 6 מ-9 הקטגוריות הקלאסיות', () => {
    const index = buildLetterIndex(kb.items);
    for (const letter of GAME_LETTERS) {
      let covered = 0;
      for (const cat of CLASSIC_CATEGORY_IDS) {
        if ((index.get(`${cat}|${letter}`)?.size ?? 0) > 0) covered++;
      }
      expect(covered, `כיסוי חלש לאות ${letter}: ${covered}/9`).toBeGreaterThanOrEqual(6);
    }
  });
});
