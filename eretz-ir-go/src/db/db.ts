import Dexie, { type EntityTable } from 'dexie';
import type { Category, DailyResult, MatchRecord, PersonalAnswer, Profile } from '../types';

/**
 * כל המידע נשמר מקומית בלבד ב-IndexedDB.
 * אין חשבונות, אין ענן, אין איסוף נתונים.
 */

export interface UserKnowledgeRow {
  id?: number;
  canonicalName: string;
  normalized: string;
  categoryId: string;
  source: string; // למשל URL של ערך ויקיפדיה או "parent-approved"
  description?: string;
  imageUrl?: string;
  imageAttribution?: string;
  addedAt: string;
}

export interface SettingsRow {
  key: string;
  value: string;
}

export interface CustomCategoryRow {
  id?: number;
  profileId: number;
  category: Category;
  starterWords: string[];
  createdAt: string;
}

/** ערך שהגיע מ-Content Pack (עדכון תוכן חתום) */
export interface ContentItemRow {
  id?: number;
  canonicalName: string;
  normalized: string;
  categoryId: string;
  source: string;
  addedAt: string;
}

/**
 * תמונה אמיתית שנמצאה לתשובה, אחרי שעברה את שערי `imageVerify.ts`.
 * נשמרת פעם אחת ואז זמינה גם בלי אינטרנט.
 * `found: false` = חיפשנו ולא התקבל מועמד תקין — כדי לא לשאול שוב כל משחק.
 */
export interface ImageCacheRow {
  /** `${normalized}|${categoryId}` — "כלנית" בצומח ובשם של בת אינם אותו דבר */
  key: string;
  normalized: string;
  categoryId: string;
  found: boolean;
  url?: string;
  pageUrl?: string;
  attribution?: string;
  /** כותרת הערך בוויקיפדיה שממנו נלקחה התמונה */
  title?: string;
  /** למה נדחתה — לעיון במסך ההורה */
  rejectReason?: string;
  /** נפסלה ידנית על ידי שחקן או הורה; לא תוצג שוב */
  rejectedByUser?: boolean;
  fetchedAt: string;
}

class EretzIrDB extends Dexie {
  profiles!: EntityTable<Profile, 'id'>;
  personalAnswers!: EntityTable<PersonalAnswer, 'id'>;
  matches!: EntityTable<MatchRecord, 'id'>;
  dailyResults!: EntityTable<DailyResult, 'id'>;
  userKnowledge!: EntityTable<UserKnowledgeRow, 'id'>;
  customCategories!: EntityTable<CustomCategoryRow, 'id'>;
  settings!: EntityTable<SettingsRow, 'key'>;
  contentItems!: EntityTable<ContentItemRow, 'id'>;
  imageCache!: EntityTable<ImageCacheRow, 'key'>;

  constructor() {
    super('eretz-ir-go');
    this.version(1).stores({
      profiles: '++id, name',
      personalAnswers: '++id, profileId, categoryId, letter, normalized, [profileId+categoryId]',
      matches: '++id, playedAt',
      dailyResults: '++id, profileId, date, [profileId+date]',
      userKnowledge: '++id, normalized, categoryId',
      customCategories: '++id, profileId',
      settings: 'key'
    });
    this.version(2).stores({
      contentItems: '++id, normalized, categoryId'
    });
    // מטמון תמונות. המפתח כולל את הקטגוריה, כי אותה מילה בקטגוריות
    // שונות היא דבר אחר לגמרי — וזה בדיוק מקור התמונות השגויות.
    this.version(3).stores({
      imageCache: 'key, normalized, categoryId, fetchedAt'
    });
  }
}

export const db = new EretzIrDB();

/** פרופילי ברירת המחדל — ניתנים לעריכה ולמחיקה */
export async function ensureDefaultProfiles(): Promise<void> {
  const count = await db.profiles.count();
  if (count > 0) return;
  const base: Omit<Profile, 'id' | 'name' | 'avatar' | 'color' | 'gender'> = {
    age: 11,
    difficulty: 'medium',
    soundOn: true,
    reducedMotion: false,
    favoriteCategories: [],
    totalScore: 0,
    wins: 0,
    gamesPlayed: 0,
    correctAnswers: 0,
    totalAnswers: 0,
    originalitySum: 0,
    bestRoundScore: 0,
    dailyStreak: 0,
    lastDailyDate: '',
    achievements: [],
    createdAt: new Date().toISOString()
  };
  await db.profiles.bulkAdd([
    { ...base, name: 'אורי', avatar: '🦄', color: '#33d6c3', gender: 'girl' },
    { ...base, name: 'מאיה', avatar: '🐬', color: '#ff5c9d', gender: 'girl' }
  ]);
}

/**
 * ספארי באייפון עלול להשאיר בקשת IndexedDB תלויה בלי לסיים ובלי לשגות —
 * ואז כל `await` עליה נתקע לנצח. כשזה קורה באמצע טיפול בלחיצה, הכפתור
 * פשוט "לא עושה כלום" בשקט. מגבלת הזמן הזו מבטיחה שהממשק תמיד ממשיך:
 * ההגדרות הן נוחות, לא תנאי להתקדמות במשחק.
 */
const DB_TIMEOUT_MS = 4000;

function withTimeout<T>(work: Promise<T>, fallback: T): Promise<T> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (value: T) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(value);
    };
    const timer = setTimeout(() => finish(fallback), DB_TIMEOUT_MS);
    work.then(finish, () => finish(fallback));
  });
}

export async function getSetting(key: string): Promise<string | undefined> {
  return withTimeout(
    db.settings.get(key).then((row) => row?.value),
    undefined
  );
}

export async function setSetting(key: string, value: string): Promise<void> {
  await withTimeout(db.settings.put({ key, value }).then(() => undefined), undefined);
}

/** ייצוא פרופיל מלא (כולל אוסף המילים) לקובץ JSON */
export async function exportProfile(profileId: number): Promise<string> {
  const profile = await db.profiles.get(profileId);
  const answers = await db.personalAnswers.where('profileId').equals(profileId).toArray();
  const custom = await db.customCategories.where('profileId').equals(profileId).toArray();
  return JSON.stringify({ version: 1, profile, answers, customCategories: custom }, null, 2);
}

export async function importProfile(json: string): Promise<void> {
  const data = JSON.parse(json) as {
    profile?: Profile;
    answers?: PersonalAnswer[];
    customCategories?: CustomCategoryRow[];
  };
  if (!data.profile?.name) throw new Error('קובץ לא תקין');
  const { id: _id, ...profile } = data.profile;
  const newId = (await db.profiles.add(profile as Profile)) as number;
  for (const ans of data.answers ?? []) {
    const { id: _aid, ...rest } = ans;
    await db.personalAnswers.add({ ...rest, profileId: newId });
  }
  for (const cat of data.customCategories ?? []) {
    const { id: _cid, ...rest } = cat;
    await db.customCategories.add({ ...rest, profileId: newId });
  }
}

/** מחיקת כל המידע של פרופיל — פרטיות מלאה */
export async function deleteProfileData(profileId: number): Promise<void> {
  await db.transaction('rw', [db.profiles, db.personalAnswers, db.customCategories, db.dailyResults], async () => {
    await db.profiles.delete(profileId);
    await db.personalAnswers.where('profileId').equals(profileId).delete();
    await db.customCategories.where('profileId').equals(profileId).delete();
    await db.dailyResults.where('profileId').equals(profileId).delete();
  });
}
