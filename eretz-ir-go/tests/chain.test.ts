import { describe, expect, it } from 'vitest';
import { lastLetterOf } from '../src/lib/hebrew';
import { validateAnswer } from '../src/lib/validation';
import { getKnowledgeBase } from '../src/lib/knowledge';
import { CATEGORIES } from '../src/data/categories';

const kb = getKnowledgeBase();
const cat = (id: string) => CATEGORIES.find((c) => c.id === id)!;

describe('מצב שרשרת — האות האחרונה', () => {
  it('אות סופית מומרת לרגילה', () => {
    expect(lastLetterOf('קיפוד')).toBe('ד');
    expect(lastLetterOf('תמנון')).toBe('נ'); // ן -> נ
    expect(lastLetterOf('דולפין')).toBe('נ');
  });

  it('מתעלם מרווחים ופיסוק בסוף', () => {
    expect(lastLetterOf('תל אביב ')).toBe('ב');
    expect(lastLetterOf('באר שבע!')).toBe('ע');
  });

  it('שרשרת חוקית: פיל → לביאה → היפופוטם', () => {
    const links = ['פיל', 'לביאה', 'היפופוטם'];
    const used = new Set<string>();
    let required = 'פ';
    for (const link of links) {
      const r = validateAnswer({
        raw: link,
        letter: required,
        category: cat('animal'),
        kb,
        usedInRound: used,
        personalDictionary: new Set()
      });
      expect(r.status, `${link} נפסל באות ${required}`).toBe('valid');
      used.add(link);
      required = lastLetterOf(link);
    }
    expect(required).toBe('מ'); // היפופוטם -> ם -> מ
  });

  it('חוליה שלא מתחילה באות הנדרשת נפסלת', () => {
    const r = validateAnswer({
      raw: 'זברה',
      letter: lastLetterOf('פיל'), // ל
      category: cat('animal'),
      kb,
      usedInRound: new Set(),
      personalDictionary: new Set()
    });
    expect(r.status).toBe('wrong-letter');
  });
});
