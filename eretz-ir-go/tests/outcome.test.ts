import { describe, expect, it } from 'vitest';
import { outcomeFor, outcomeHint } from '../src/lib/outcome';

const player = { name: 'דביר', gender: 'boy' as const, age: 11 };

/**
 * הבאג שדווח: שרשרת של אפס חוליות ואפס נקודות הציגה "ניצחת! אלוף!"
 * עם גביע וקונפטי. מסך הסיום קרא תמיד לפונקציית החגיגה בלי להסתכל
 * על התוצאה.
 */
describe('מה אומרים בסוף סיבוב', () => {
  it('אפס הישגים אינו ניצחון — ואין גביע', () => {
    const r = outcomeFor(player, 0, 5);
    expect(r.celebrate).toBe(false);
    expect(r.title).not.toMatch(/ניצחת|אלוף|אלופה/);
  });

  it('אבל גם לא נוזפים — אפס הוא נקודת התחלה', () => {
    const r = outcomeFor(player, 0, 5);
    expect(r.title).toMatch(/בסדר גמור/);
    expect(outcomeHint(r.tone)).not.toMatch(/הפסדת|נכשל|גרוע/);
  });

  it('הגעה ליעד היא ניצחון מלא', () => {
    const r = outcomeFor(player, 5, 5);
    expect(r.celebrate).toBe(true);
    expect(r.title).toMatch(/ניצחת|ניצחון/);
  });

  it('מעבר ליעד גם הוא ניצחון', () => {
    expect(outcomeFor(player, 12, 5).tone).toBe('great');
  });

  it('חצי מהיעד נחשב הישג — עם עידוד אבל בלי גביע של אלוף', () => {
    const r = outcomeFor(player, 3, 5);
    expect(r.tone).toBe('good');
    expect(r.title).not.toMatch(/ניצחת/);
  });

  it('חוליה אחת היא התחלה, לא ניצחון', () => {
    const r = outcomeFor(player, 1, 5);
    expect(r.tone).toBe('start');
    expect(r.celebrate).toBe(false);
  });

  it('השם של השחקן תמיד מופיע', () => {
    for (const n of [0, 1, 3, 5, 9]) {
      expect(outcomeFor(player, n, 5).title).toContain('דביר');
    }
  });

  it('אף נוסח אינו מזלזל', () => {
    for (const n of [0, 1, 2, 3, 5, 10]) {
      const r = outcomeFor(player, n, 5);
      expect(r.title).not.toMatch(/גרוע|נכשל|טיפש|חבל עליך/);
      expect(outcomeHint(r.tone)).not.toMatch(/גרוע|נכשל|טיפש/);
    }
  });
});
