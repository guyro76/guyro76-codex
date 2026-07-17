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

class EretzIrDB extends Dexie {
  profiles!: EntityTable<Profile, 'id'>;
  personalAnswers!: EntityTable<PersonalAnswer, 'id'>;
  matches!: EntityTable<MatchRecord, 'id'>;
  dailyResults!: EntityTable<DailyResult, 'id'>;
  userKnowledge!: EntityTable<UserKnowledgeRow, 'id'>;
  customCategories!: EntityTable<CustomCategoryRow, 'id'>;
  settings!: EntityTable<SettingsRow, 'key'>;
  contentItems!: EntityTable<ContentItemRow, 'id'>;

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

export async function getSetting(key: string): Promise<string | undefined> {
  return (await db.settings.get(key))?.value;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await db.settings.put({ key, value });
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
