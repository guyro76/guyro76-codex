import { describe, expect, it } from 'vitest';
import { otherProfiles, pickProfile } from '../src/lib/activePlayer';
import type { Profile } from '../src/types';

const profile = (id: number, name: string): Profile =>
  ({ id, name, avatar: '🙂', color: '#fff', gender: 'other', age: 10 }) as Profile;

const uri = profile(1, 'אורי');
const maya = profile(2, 'מאיה');
const dani = profile(3, 'דני');

describe('בחירת השחקן שנכנס', () => {
  it('בלי אף פרופיל אין את מי לבחור', () => {
    expect(pickProfile([], { firstName: 'דני' })).toBeNull();
  });

  it('פרופיל יחיד נבחר תמיד', () => {
    expect(pickProfile([uri], null)).toBe(uri);
    expect(pickProfile([uri], { firstName: 'דני' })).toBe(uri);
  });

  /**
   * הכלל שבגללו כל זה נכתב. במכשיר משפחתי שיש בו כמה פרופילים,
   * מי שנכנס בחשבון שלו חייב לקבל את **שלו** — לא את הראשון ברשימה.
   * זה בדיוק הבאג שהיה נוצר אם היו נשארים שני שחקני ברירת מחדל.
   */
  it('מי שנכנס מקבל את הפרופיל בשם שלו, גם כשיש אחרים לפניו', () => {
    expect(pickProfile([uri, maya, dani], { firstName: 'מאיה' })).toBe(maya);
    expect(pickProfile([uri, maya, dani], { firstName: 'דני' })).toBe(dani);
  });

  it('רווחים בשם לא מונעים התאמה', () => {
    expect(pickProfile([uri, profile(9, '  דני  ')], { firstName: 'דני' })?.id).toBe(9);
  });

  it('בלי זהות ובלי התאמה — הראשון, ולא קריסה', () => {
    expect(pickProfile([uri, maya], null)).toBe(uri);
    expect(pickProfile([uri, maya], { firstName: 'לא-קיים' })).toBe(uri);
  });
});

describe('שחקנים נוספים במכשיר', () => {
  /**
   * הם לא נמחקים. פרופיל של ילד עם התקדמות שנעלמת הוא אובדן נתונים,
   * ולכן הם נשארים במסד ונגישים להורה במסך ההורים.
   */
  it('מחזיר את כל מי שאינו הפעיל', () => {
    expect(otherProfiles([uri, maya, dani], uri)).toEqual([maya, dani]);
  });

  it('בלי שחקן פעיל כולם נחשבים נוספים', () => {
    expect(otherProfiles([uri, maya], null)).toEqual([uri, maya]);
  });

  it('שחקן יחיד לא מופיע כ"נוסף" לעצמו', () => {
    expect(otherProfiles([uri], uri)).toEqual([]);
  });
});
