import { describe, expect, it } from 'vitest';
import { MEMORY, blockList, remember } from '../src/lib/recentLetters';

/**
 * "אם כבר עשיתי את האות, רצוי שהיא לא תחזור שוב" — דיווח מהשטח על
 * ראש בראש, שבו כל הגרלה התחילה מאפס ואותה אות חזרה שוב ושוב.
 */
describe('זיכרון אותיות אחרונות', () => {
  it('האות האחרונה נכנסת בראש הרשימה', () => {
    expect(remember(['ב', 'ג'], 'א')).toEqual(['א', 'ב', 'ג']);
  });

  it('אות שחוזרת עולה לראש ולא נכפלת', () => {
    expect(remember(['ב', 'ג', 'ד'], 'ג')).toEqual(['ג', 'ב', 'ד']);
  });

  it('הזיכרון קצוב ולא גדל בלי גבול', () => {
    let list: string[] = [];
    for (const l of 'אבגדהוזחטיכלמנס') list = remember(list, l);
    expect(list.length).toBe(MEMORY);
    expect(list[0]).toBe('ס');
  });

  /**
   * הבדיקה החשובה: אסור לחסום כמעט את כל המאגר. אם נחסום הכול,
   * ההגרלה תיפול חזרה על "אין מועמדים" ותחזיר אות אקראית לגמרי —
   * כלומר בדיוק ההפך ממה שרצינו.
   */
  it('לעולם לא חוסמים יותר ממחצית מהמאגר', () => {
    const recent = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח'];
    expect(blockList(recent, 6).length).toBe(3);
    expect(blockList(recent, 22).length).toBe(8);
    expect(blockList(recent, 1).length).toBe(0);
    expect(blockList(recent, 0).length).toBe(0);
  });
});
