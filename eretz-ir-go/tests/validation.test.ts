import { describe, expect, it } from 'vitest';
import { validateAnswer } from '../src/lib/validation';
import { getKnowledgeBase } from '../src/lib/knowledge';
import { CATEGORIES } from '../src/data/categories';

const kb = getKnowledgeBase();
const cat = (id: string) => CATEGORIES.find((c) => c.id === id)!;
const base = { kb, usedInRound: new Set<string>(), personalDictionary: new Set<string>() };

describe('מנוע בדיקת תשובות', () => {
  it('תשובה נכונה מאושרת מהמאגר', () => {
    const r = validateAnswer({ ...base, raw: 'צרפת', letter: 'צ', category: cat('country') });
    expect(r.status).toBe('valid');
    expect(r.verificationSource).toBe('local-db');
  });

  it('בננה אינה עיר — נפסלת עם הסבר', () => {
    const r = validateAnswer({ ...base, raw: 'בננה', letter: 'ב', category: cat('city') });
    expect(r.status).toBe('wrong-category');
  });

  it('צרפת אינה צמח', () => {
    const r = validateAnswer({ ...base, raw: 'צרפת', letter: 'צ', category: cat('plant') });
    expect(r.status).toBe('wrong-category');
  });

  it('אות שגויה נפסלת', () => {
    const r = validateAnswer({ ...base, raw: 'צרפת', letter: 'מ', category: cat('country') });
    expect(r.status).toBe('wrong-letter');
  });

  it('שגיאת כתיב קלה מקבלת הצעת תיקון', () => {
    const r = validateAnswer({ ...base, raw: 'זימבבוה', letter: 'ז', category: cat('country') });
    expect(r.status).toBe('spelling');
    expect(r.suggestion).toBe('זימבבואה');
  });

  it('תשובה לא מוכרת מסומנת לבדיקה ולא נפסלת אוטומטית', () => {
    const r = validateAnswer({ ...base, raw: 'קריית טבעון', letter: 'ק', category: cat('city') });
    expect(r.status).toBe('needs-review');
  });

  it('כפילות באותו סיבוב נחסמת', () => {
    const used = new Set<string>(['צרפת']);
    const r = validateAnswer({ ...base, usedInRound: used, raw: 'צרפת', letter: 'צ', category: cat('country') });
    expect(r.status).toBe('duplicate');
  });

  it('ג׳יבריש נפסל', () => {
    const r = validateAnswer({ ...base, raw: 'קקקקק', letter: 'ק', category: cat('country') });
    expect(r.status).toBe('gibberish');
  });

  it('שם רב-מילי עובד: תל אביב באות ת', () => {
    const r = validateAnswer({ ...base, raw: 'תל אביב', letter: 'ת', category: cat('city') });
    expect(r.status).toBe('valid');
  });

  it('כינוי (alias) מזוהה: ביבי -> בנימין נתניהו', () => {
    const r = validateAnswer({ ...base, raw: 'ביבי', letter: 'ב', category: cat('celebrity') });
    expect(r.status).toBe('valid');
  });

  it('מילון אישי מאשר תשובות בקטגוריה אישית', () => {
    const custom = {
      id: 'custom-1', name: 'גיבורי על', icon: '🦸', color: '#fff', description: '', examples: [],
      allowProperNames: true, allowMultiWord: true, allowLatin: false, custom: true
    };
    const r = validateAnswer({
      ...base,
      personalDictionary: new Set(['אקוומנ']),
      raw: 'אקוומן',
      letter: 'א',
      category: custom
    });
    expect(r.status).toBe('valid');
    expect(r.verificationSource).toBe('personal');
  });
});
