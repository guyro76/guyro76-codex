import { describe, expect, it, vi, beforeEach } from 'vitest';
import { CLASSIC_CATEGORY_IDS } from '../src/data/categories';
import type { Profile } from '../src/types';

/**
 * המשחק המהיר — ההחלטות, בלי דפדפן.
 *
 * שני כללים כאן אינם נוחות אלא נכונות, ולכן הם נבדקים בנפרד:
 * מצב שדורש יריב לא יכול להתחיל בלחיצה אחת, ותקרת הסיבובים של
 * החבילה אינה נעקפת דרך קיצור דרך.
 */
const settings = { modeDraft: '', favoriteCategorySet: '' };

vi.mock('../src/db/db', () => ({
  getSetting: async (key: string) => (settings as Record<string, string>)[key] || null,
  setSetting: async () => undefined,
  db: {}
}));

/**
 * טעינה מחדש לכל בדיקה.
 *
 * `loadModeDraft` שומר את הטיוטה במטמון ברמת המודול — וזה נכון
 * במשחק, שם הוא נטען פעם אחת ולא ממתין ל-IndexedDB בכל מעבר מסך.
 * בבדיקות זה אומר שההגדרה של הבדיקה הראשונה דולפת לכל השאר, ולכן
 * המודולים נטענים מחדש בכל פעם במקום לחשוף פונקציית איפוס
 * שקיימת רק בשביל הבדיקות.
 */
async function load() {
  vi.resetModules();
  return import('../src/lib/quickPlay');
}

const profile = (over: Partial<Profile> = {}): Profile =>
  ({
    id: 1,
    name: 'אורי',
    avatar: '🦄',
    color: '#fff',
    difficulty: 'medium',
    wins: 0,
    gamesPlayed: 3,
    dailyStreak: 0,
    ...over
  }) as Profile;

beforeEach(() => {
  settings.modeDraft = '';
  settings.favoriteCategorySet = '';
});

describe('מתי הקיצור מוצג', () => {
  /** לשחקן חדש אין "כמו קודם" — ובשבילו המסלול המלא הוא הנכון */
  it('לא לשחקן חדש', async () => {
    expect((await load()).hasPlayedBefore(profile({ gamesPlayed: 0 }))).toBe(false);
    expect((await load()).hasPlayedBefore(null)).toBe(false);
    expect((await load()).hasPlayedBefore(undefined)).toBe(false);
  });

  it('כן אחרי משחק אחד', async () => {
    expect((await load()).hasPlayedBefore(profile({ gamesPlayed: 1 }))).toBe(true);
  });
});

describe('בניית המשחק המהיר', () => {
  it('בלי העדפות שמורות — הקלאסיקה', async () => {
    const plan = await (await load()).planQuickPlay(profile());
    expect(plan!.settings.categoryIds).toEqual(CLASSIC_CATEGORY_IDS);
    expect(plan!.categories.length).toBe(CLASSIC_CATEGORY_IDS.length);
  });

  it('ממשיך את הקטגוריות מהמשחק הקודם', async () => {
    settings.favoriteCategorySet = JSON.stringify(['country', 'city', 'animal', 'plant', 'food']);
    const plan = await (await load()).planQuickPlay(profile());
    expect(plan!.settings.categoryIds).toEqual(['country', 'city', 'animal', 'plant', 'food']);
  });

  it('ממשיך את הזמן ואת מספר הסיבובים', async () => {
    settings.modeDraft = JSON.stringify({ mode: 'solo', rounds: 5, seconds: 60 });
    const plan = await (await load()).planQuickPlay(profile());
    expect(plan!.settings.rounds).toBe(5);
    expect(plan!.settings.roundSeconds).toBe(60);
  });

  /**
   * הכלל החשוב כאן. כפתור שמתחיל משחק שדורש בן אדם שני — ואין
   * אותו — גרוע מכפתור שלא קיים.
   */
  it('מצב שדורש יריב הופך למשחק עצמי', async () => {
    for (const mode of ['duel', 'coop', 'bot', 'tournament', 'chain']) {
      settings.modeDraft = JSON.stringify({ mode, rounds: 1, seconds: 60 });
      const plan = await (await load()).planQuickPlay(profile());
      expect(plan!.settings.mode, mode).toBe('solo');
    }
  });

  it('מצב תרגול נשמר, כי אפשר לשחק אותו לבד', async () => {
    settings.modeDraft = JSON.stringify({ mode: 'practice', rounds: 1, seconds: 60 });
    const plan = await (await load()).planQuickPlay(profile());
    expect(plan!.settings.mode).toBe('practice');
    // בתרגול אין שעון ואין תקרת רמזים
    expect(plan!.settings.roundSeconds).toBe(0);
    expect(plan!.settings.hintsPerRound).toBe(99);
  });

  /** קיצור דרך אינו דלת אחורית לעקוף את תקרת החבילה */
  it('מספר הסיבובים נחתך לפי החבילה', async () => {
    settings.modeDraft = JSON.stringify({ mode: 'solo', rounds: 7, seconds: 60 });
    const plan = await (await load()).planQuickPlay(profile(), [], 3);
    expect(plan!.settings.rounds).toBe(3);
  });

  it('קטגוריה שנמחקה מאז מסוננת', async () => {
    settings.favoriteCategorySet = JSON.stringify(['country', 'city', 'animal', 'plant', 'food', 'קטגוריה-שנמחקה']);
    const plan = await (await load()).planQuickPlay(profile());
    expect(plan!.settings.categoryIds).not.toContain('קטגוריה-שנמחקה');
    expect(plan!.settings.categoryIds).toHaveLength(5);
  });

  /** רשימה שנשארה קצרה מדי אחרי הסינון — חוזרים לקלאסיקה */
  it('פחות מחמש קטגוריות אחרי סינון — הקלאסיקה', async () => {
    settings.favoriteCategorySet = JSON.stringify(['country', 'אין-כזו', 'גם-לא-זו']);
    const plan = await (await load()).planQuickPlay(profile());
    expect(plan!.settings.categoryIds).toEqual(CLASSIC_CATEGORY_IDS);
  });

  it('הגדרה פגומה לא מפילה כלום', async () => {
    settings.favoriteCategorySet = '{{{ זה לא JSON';
    settings.modeDraft = 'גם זה לא';
    const plan = await (await load()).planQuickPlay(profile());
    expect(plan!.settings.categoryIds).toEqual(CLASSIC_CATEGORY_IDS);
  });

  it('בלי פרופיל אין משחק', async () => {
    expect(await (await load()).planQuickPlay(null)).toBeNull();
  });
});
