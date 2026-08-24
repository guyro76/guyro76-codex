import type { ChallengeOutcome } from './challenge';

/**
 * יומן ראש-בראש מול חברים.
 *
 * ## מה זה סופר בדיוק, ולמה זה חשוב
 *
 * השורה במסך אומרת "אורי 3 — אתה 2", ולכן חייב להיות ברור מה
 * נספר: **סיבובים ששיחקת מול אתגר שאורי שלח לך**. האתגר אסינכרוני,
 * ולכן מי ששולח אתגר לא יודע לעולם איך החבר הסתדר איתו — הוא
 * ילמד על זה רק אם החבר יאתגר בחזרה, וגם אז רק בתור השחקן.
 *
 * מכאן נובע דבר אחד שאסור לטשטש: **המספרים בשני המכשירים אינם
 * חייבים להיות זהים**, כי כל מכשיר סופר את מה ש*הוא* שיחק. זו לא
 * תקלה אלא ההגדרה, והניסוח במסך חייב לשקף אותה. טבלה שמתיימרת
 * להיות "התוצאה המשותפת" ואינה כזו היא שקר קטן שילדים יתפסו מיד.
 *
 * ## הכול מקומי
 *
 * אין כאן שרת, אין רשימת חברים, ואין מזהה של אף אחד — רק שם תצוגה
 * שכבר עבר את `wordFilter` לפני שהגיע לכאן. מחיקת הפרופיל מוחקת
 * גם את היומן.
 */

export interface RivalRow {
  id?: number;
  /** מי מהמשפחה משחק. היומן הוא של הילד, לא של המכשיר. */
  profileId: number;
  /** שם היריב כפי שהגיע בקישור — כבר מסונן */
  name: string;
  /** ניצחונות שלי מולו */
  wins: number;
  losses: number;
  ties: number;
  /** הניקוד הגבוה ביותר שלי באתגר שלו */
  bestScore: number;
  lastPlayedAt: string;
}

/** יריב חדש, לפני שנרשם ולו סיבוב */
export function emptyRival(profileId: number, name: string): RivalRow {
  return {
    profileId,
    name,
    wins: 0,
    losses: 0,
    ties: 0,
    bestScore: 0,
    lastPlayedAt: new Date().toISOString()
  };
}

/**
 * מוסיף תוצאה ליומן ומחזיר שורה חדשה.
 *
 * פונקציה טהורה בכוונה: כל החישוב נבדק בלי מסד נתונים, והקריאה
 * ל-Dexie נשארת שורה אחת של כתיבה.
 */
export function applyOutcome(row: RivalRow, outcome: ChallengeOutcome, myScore: number, now = new Date()): RivalRow {
  return {
    ...row,
    wins: row.wins + (outcome === 'win' ? 1 : 0),
    losses: row.losses + (outcome === 'lose' ? 1 : 0),
    ties: row.ties + (outcome === 'tie' ? 1 : 0),
    bestScore: Math.max(row.bestScore, Math.max(0, Math.round(myScore))),
    lastPlayedAt: now.toISOString()
  };
}

/** כמה סיבובים שוחקו מול היריב הזה */
export function totalGames(row: RivalRow): number {
  return row.wins + row.losses + row.ties;
}

/**
 * סדר התצוגה: קודם מי ששיחקנו איתו לאחרונה.
 *
 * לא לפי מספר ניצחונות — טבלה שמסדרת לפי הצלחה מציבה את מי שאתה
 * מנצח בקלות בראש, ואת היריבות המעניינת קוברת למטה.
 */
export function sortRivals(rows: RivalRow[]): RivalRow[] {
  return [...rows].sort((a, b) => b.lastPlayedAt.localeCompare(a.lastPlayedAt));
}

/** ניסוח התוצאה, מנקודת המבט של השחקן */
export function rivalLabel(row: RivalRow): string {
  if (totalGames(row) === 0) return 'עוד לא שיחקתם';
  if (row.wins > row.losses) return `אתה מוביל ${row.wins}:${row.losses}`;
  if (row.losses > row.wins) return `${row.name} מוביל ${row.losses}:${row.wins}`;
  return `שוויון ${row.wins}:${row.losses}`;
}

/** סיכום לכל היריבים יחד, לשורה אחת במסך הבית */
export function overallRecord(rows: RivalRow[]): { wins: number; losses: number; ties: number; rivals: number } {
  return {
    wins: rows.reduce((n, r) => n + r.wins, 0),
    losses: rows.reduce((n, r) => n + r.losses, 0),
    ties: rows.reduce((n, r) => n + r.ties, 0),
    rivals: rows.filter((r) => totalGames(r) > 0).length
  };
}

/**
 * רושם תוצאת אתגר ליומן.
 *
 * `challengeId` הוא מפתח האי-כפילות: אותו אתגר לא נספר פעמיים גם
 * אם המסך נטען מחדש, אם React מריץ אפקט פעמיים במצב פיתוח, או אם
 * הילד חזר אחורה וקדימה. בלי זה מספיק רענון אחד כדי שהיומן ישקר.
 */
export async function recordChallengeResult(params: {
  profileId: number;
  name: string;
  challengeId: string;
  outcome: ChallengeOutcome;
  myScore: number;
}): Promise<void> {
  const { db } = await import('../db/db');
  const seenKey = `rival-seen-${params.challengeId}`;

  await db.transaction('rw', [db.rivals, db.settings], async () => {
    const already = await db.settings.get(seenKey);
    if (already) return;

    const existing = await db.rivals.where({ profileId: params.profileId, name: params.name }).first();
    const next = applyOutcome(existing ?? emptyRival(params.profileId, params.name), params.outcome, params.myScore);
    if (existing?.id) await db.rivals.update(existing.id, next);
    else await db.rivals.add(next);

    await db.settings.put({ key: seenKey, value: '1' });
  });
}

/** היומן של הילד, ממוין לתצוגה */
export async function loadRivals(profileId: number): Promise<RivalRow[]> {
  const { db } = await import('../db/db');
  return sortRivals(await db.rivals.where('profileId').equals(profileId).toArray());
}
