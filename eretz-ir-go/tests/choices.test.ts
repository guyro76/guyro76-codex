import { describe, expect, it } from 'vitest';
import { buildChoices } from '../src/lib/choices';
import { getKnowledgeBase } from '../src/lib/knowledge';
import { unfinalize } from '../src/lib/hebrew';
import type { KnowledgeItem } from '../src/types';

const item = (name: string, categoryId: string, firstLetter: string, pop: number): KnowledgeItem => ({
  id: `${categoryId}-${name}`,
  canonicalName: name,
  normalizedName: name,
  aliases: [],
  categoryIds: [categoryId],
  firstLetter,
  popularityScore: pop,
  rarityScore: 100 - pop,
  language: 'he',
  sources: [],
  childSafe: true,
  lastVerifiedAt: new Date(0).toISOString()
});

const animals = [
  item('אריה', 'animal', 'א', 98),
  item('אנטילופה', 'animal', 'א', 30),
  item('זברה', 'animal', 'ז', 90),
  item('דולפין', 'animal', 'ד', 88),
  item('נמר', 'animal', 'נ', 85),
  item('פיל', 'animal', 'פ', 92),
  item('קוף', 'animal', 'ק', 87),
  item('סוס', 'animal', 'ס', 89)
];

const seq = (values: number[]) => {
  let i = 0;
  return () => values[i++ % values.length];
};

describe('מצב בחירה', () => {
  it('ארבע אפשרויות, ובהן בדיוק תשובה נכונה אחת', () => {
    const set = buildChoices({ categoryId: 'animal', letter: 'א', items: animals, rng: seq([0]) })!;
    expect(set).toBeTruthy();
    expect(set.options).toHaveLength(4);
    expect(new Set(set.options).size).toBe(4);
    expect(set.options).toContain(set.correct);

    const right = set.options.filter((o) => unfinalize(o[0]) === 'א');
    expect(right).toEqual([set.correct]);
  });

  /**
   * זה הלב של המצב: המסיחים הם מאותה קטגוריה ומאות אחרת, ולכן
   * השאלה שנשאלת היא "מה מתחיל באות הזאת" — בדיוק מה שהמשחק מלמד.
   */
  it('כל המסיחים מאותה קטגוריה אבל מאות אחרת', () => {
    const set = buildChoices({ categoryId: 'animal', letter: 'א', items: animals, rng: seq([0.3]) })!;
    for (const option of set.options) {
      expect(animals.some((a) => a.canonicalName === option)).toBe(true);
      if (option !== set.correct) expect(unfinalize(option[0])).not.toBe('א');
    }
  });

  it('מילים שכבר בשימוש בסיבוב לא מוצעות שוב', () => {
    const set = buildChoices({
      categoryId: 'animal',
      letter: 'א',
      items: animals,
      exclude: new Set(['זברה', 'פיל']),
      rng: seq([0])
    });
    expect(set).toBeTruthy();
    expect(set!.options).not.toContain('זברה');
    expect(set!.options).not.toContain('פיל');
  });

  it('בלי תשובה נכונה באות — אין מערך אפשרויות', () => {
    expect(buildChoices({ categoryId: 'animal', letter: 'ת', items: animals })).toBeNull();
  });

  it('בלי מספיק מסיחים — נופלים בחזרה להקלדה במקום להציג שתי אפשרויות', () => {
    const thin = [item('אריה', 'animal', 'א', 98), item('זברה', 'animal', 'ז', 90)];
    expect(buildChoices({ categoryId: 'animal', letter: 'א', items: thin })).toBeNull();
  });

  it('קטגוריה שאינה במאגר מחזירה null ולא נופלת', () => {
    expect(buildChoices({ categoryId: 'nope', letter: 'א', items: animals })).toBeNull();
  });

  it('סדר האפשרויות משתנה — התשובה לא תמיד באותו מקום', () => {
    const positions = new Set<number>();
    for (let seed = 1; seed <= 40; seed++) {
      let x = seed;
      const rng = () => {
        x = (x * 1103515245 + 12345) % 2147483648;
        return x / 2147483648;
      };
      const set = buildChoices({ categoryId: 'animal', letter: 'א', items: animals, rng });
      if (set) positions.add(set.options.indexOf(set.correct));
    }
    expect(positions.size).toBeGreaterThan(1);
  });

  /**
   * הבדיקה על המאגר האמיתי: מצב שנופל בחזרה להקלדה בכל קטגוריה
   * שנייה אינו מצב, הוא הבטחה שבורה לילד שלא יודע לכתוב.
   */
  it('על המאגר האמיתי — רוב הצירופים של קטגוריה קלאסית ואות עובדים', () => {
    const items = getKnowledgeBase().items;
    const cats = ['country', 'city', 'animal', 'plant', 'inanimate'];
    const letters = 'אבגדהוזחטיכלמנסעפצקרשת'.split('');
    let ok = 0;
    let total = 0;
    for (const categoryId of cats) {
      for (const letter of letters) {
        // רק צירופים שיש להם בכלל תשובה — אות בלי תשובה לא מוגרלת במשחק
        const has = items.some(
          (i) => i.categoryIds.includes(categoryId) && unfinalize(i.firstLetter) === letter
        );
        if (!has) continue;
        total++;
        if (buildChoices({ categoryId, letter, items })) ok++;
      }
    }
    expect(total).toBeGreaterThan(50);
    expect(ok / total).toBeGreaterThan(0.9);
  });
});
