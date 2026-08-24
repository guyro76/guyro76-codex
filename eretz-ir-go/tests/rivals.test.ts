import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  applyOutcome,
  emptyRival,
  overallRecord,
  rivalLabel,
  sortRivals,
  totalGames,
  type RivalRow
} from '../src/lib/rivals';

const root = resolve(__dirname, '..');
const read = (p: string) => readFileSync(resolve(root, p), 'utf8');

const row = (over: Partial<RivalRow> = {}): RivalRow => ({ ...emptyRival(1, 'אורי'), ...over });

describe('צבירת התוצאות', () => {
  it('ניצחון, הפסד ותיקו נספרים בנפרד', () => {
    let r = emptyRival(1, 'אורי');
    r = applyOutcome(r, 'win', 40);
    r = applyOutcome(r, 'win', 30);
    r = applyOutcome(r, 'lose', 10);
    r = applyOutcome(r, 'tie', 25);
    expect(r.wins).toBe(2);
    expect(r.losses).toBe(1);
    expect(r.ties).toBe(1);
    expect(totalGames(r)).toBe(4);
  });

  it('השיא האישי מול היריב נשמר ולא יורד', () => {
    let r = applyOutcome(emptyRival(1, 'אורי'), 'win', 80);
    r = applyOutcome(r, 'lose', 12);
    expect(r.bestScore).toBe(80);
  });

  it('ניקוד שלילי או שבור לא מזהם את השיא', () => {
    expect(applyOutcome(emptyRival(1, 'א'), 'win', -5).bestScore).toBe(0);
    expect(applyOutcome(emptyRival(1, 'א'), 'win', 12.6).bestScore).toBe(13);
  });

  it('הרישום אינו משנה את השורה המקורית', () => {
    const before = emptyRival(1, 'אורי');
    applyOutcome(before, 'win', 40);
    expect(before.wins).toBe(0);
  });
});

describe('הניסוח למסך', () => {
  it('אומר מי מוביל, בשם', () => {
    expect(rivalLabel(row({ wins: 3, losses: 1 }))).toContain('אתה מוביל');
    expect(rivalLabel(row({ wins: 1, losses: 3 }))).toContain('אורי מוביל');
    expect(rivalLabel(row({ wins: 2, losses: 2 }))).toContain('שוויון');
  });

  it('יריב בלי משחקים אינו מוצג כתיקו', () => {
    expect(rivalLabel(emptyRival(1, 'אורי'))).toBe('עוד לא שיחקתם');
  });

  /** תיקו נספר, ולכן הוא חייב להופיע בסך המשחקים */
  it('תיקו נכלל בספירת המשחקים', () => {
    expect(totalGames(row({ wins: 1, losses: 1, ties: 2 }))).toBe(4);
  });
});

describe('סדר התצוגה', () => {
  /**
   * מיון לפי הצלחה היה מציב בראש את מי שקל לנצח, וקובר למטה את
   * היריבות שבאמת מעניינת. לכן — לפי מי ששיחקנו איתו לאחרונה.
   */
  it('האחרון ששיחקנו מולו ראשון', () => {
    const sorted = sortRivals([
      row({ name: 'ישן', lastPlayedAt: '2026-01-01T00:00:00.000Z', wins: 9 }),
      row({ name: 'חדש', lastPlayedAt: '2026-08-01T00:00:00.000Z', wins: 0, losses: 5 })
    ]);
    expect(sorted[0].name).toBe('חדש');
  });

  it('המיון אינו משנה את המערך שהתקבל', () => {
    const input = [row({ name: 'א', lastPlayedAt: '2026-01-01T00:00:00.000Z' }), row({ name: 'ב' })];
    const copy = [...input];
    sortRivals(input);
    expect(input).toEqual(copy);
  });
});

describe('הסיכום הכולל', () => {
  it('מחבר את כל היריבים', () => {
    const all = overallRecord([row({ wins: 2, losses: 1 }), row({ name: 'מאיה', wins: 1, ties: 1 })]);
    expect(all).toEqual({ wins: 3, losses: 1, ties: 1, rivals: 2 });
  });

  it('יריב בלי משחקים אינו נספר', () => {
    expect(overallRecord([emptyRival(1, 'אורי')]).rivals).toBe(0);
  });
});

describe('החוזה של הרישום', () => {
  const src = read('src/lib/rivals.ts');

  /**
   * אי-הכפילות היא הדבר שמחזיק את היומן כן. אפקט ב-React יכול
   * לרוץ פעמיים, ומסך אפשר לטעון מחדש — ואז ניצחון אחד היה נספר
   * כשניים, והיומן משקר בלי שאף אחד ישים לב.
   */
  it('אותו אתגר לא נספר פעמיים', () => {
    expect(src).toContain('rival-seen-');
    expect(src).toMatch(/if \(already\) return;/);
  });

  it('הקריאה והכתיבה באותה טרנזקציה', () => {
    // בלי זה שתי לחיצות מהירות היו קוראות "עוד לא נספר" בו-זמנית
    expect(src).toContain("db.transaction('rw', [db.rivals, db.settings]");
  });

  it('מחיקת פרופיל מוחקת גם את היומן', () => {
    const dbSrc = read('src/db/db.ts');
    expect(dbSrc).toContain("db.rivals.where('profileId').equals(profileId).delete()");
    expect(dbSrc).toMatch(/db\.transaction\('rw', \[[^\]]*db\.rivals\]/);
  });

  /** היומן שייך לילד ולא למכשיר — אחרת אח ואחות חולקים יריבים */
  it('היומן מפולח לפי פרופיל', () => {
    expect(src).toContain('profileId');
    const dbSrc = read('src/db/db.ts');
    expect(dbSrc).toContain('[profileId+name]');
  });
});

describe('המסך אומר את האמת על מה שנספר', () => {
  /**
   * כל מכשיר סופר רק את הסיבובים ש*הוא* שיחק, ולכן המספרים בשני
   * המכשירים אינם חייבים להיות זהים. כרטיס שמתיימר להיות "התוצאה
   * המשותפת" הוא שקר קטן שילדים יתפסו מיד.
   */
  it('הכרטיס מסייג שמדובר באתגרים שהתקבלו', () => {
    const card = read('src/components/RivalsCard.tsx');
    expect(card).toContain('מהאתגרים שהם שלחו לך');
  });

  it('כרטיס ריק לא מוצג בכלל', () => {
    const card = read('src/components/RivalsCard.tsx');
    expect(card).toMatch(/if \(!rows\.length\) return null;/);
  });
});
