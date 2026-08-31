import { create } from 'zustand';
import type { Category, Profile } from '../types';
import { db, ensureDefaultProfiles } from '../db/db';

export type Screen =
  | 'splash'
  | 'profile-edit'
  | 'home'
  | 'mode-select'
  | 'categories'
  | 'category-create'
  | 'letter-draw'
  | 'game'
  | 'pass-device'
  | 'bot-turn'
  | 'round-results'
  | 'match-results'
  | 'leaderboard'
  | 'album'
  | 'puzzles'
  | 'achievements'
  | 'daily'
  | 'settings'
  | 'parent'
  | 'credits'
  | 'privacy'
  | 'multiplayer-info'
  | 'blitz'
  | 'chain'
  | 'mini-game'
  | 'admin'
  | 'account'
  | 'pricing'
  | 'challenge';

interface AppState {
  screen: Screen;
  editingProfileId: number | null;
  profiles: Profile[];
  activeProfile: Profile | null;
  secondProfile: Profile | null; // לשחקן שני בדו-קרב/שיתוף פעולה
  customCategories: Category[];
  navigate: (screen: Screen) => void;
  /** מציבה מסך בלי לדחוף היסטוריה — לשימוש המאזין ל-popstate בלבד */
  goBackTo: (screen: Screen) => void;
  setEditingProfile: (id: number | null) => void;
  loadProfiles: () => Promise<void>;
  selectProfile: (p: Profile) => void;
  selectSecondProfile: (p: Profile | null) => void;
  refreshActive: () => Promise<void>;
  loadCustomCategories: () => Promise<void>;
}

export const useApp = create<AppState>((set, get) => ({
  screen: 'splash',
  editingProfileId: null,
  profiles: [],
  activeProfile: null,
  secondProfile: null,
  customCategories: [],

  /**
   * מעבר מסך — **ועם רישום בהיסטוריה**.
   *
   * ## למה זה קריטי דווקא באנדרואיד
   *
   * עד עכשיו זה היה `set({ screen })` בלבד: מצב, בלי היסטוריה. לכן
   * ב-WebView לא הצטברה שום היסטוריה, וכשילד לחץ על כפתור
   * ה"חזרה" של אנדרואיד — Capacitor לא מצא לאן לחזור **וסגר את
   * האפליקציה**. באמצע משחק. בלי אזהרה.
   *
   * זה גם אחד הדברים שבודק בחנות מקיש עליו ראשון, ו"כפתור החזרה
   * אינו מתנהג כמצופה" הוא ליקוי מוכר בבדיקת איכות.
   *
   * `pushState` פותר את שניהם בבת אחת ובלי קוד נייטיבי: החזרה של
   * אנדרואיד קוראת ל-`goBack()` של ה-WebView, זה מפעיל `popstate`,
   * והמאזין ב-`App.tsx` מחזיר מסך אחד אחורה. אותו מנגנון בדיוק
   * נותן גם למחוות החזרה ב-PWA ולכפתור החזרה בדפדפן לעבוד.
   */
  navigate: (screen) => {
    if (get().screen === screen) return;
    try {
      window.history.pushState({ screen }, '');
    } catch {
      /* דפדפן שחוסם היסטוריה — המשחק ממשיך, פשוט בלי חזרה */
    }
    set({ screen });
  },

  /**
   * חזרה מסך אחד, כתגובה ל-`popstate`.
   *
   * לא דוחפת היסטוריה בעצמה — אחרת כל חזרה הייתה יוצרת רשומה חדשה
   * והלולאה לא הייתה נגמרת.
   */
  goBackTo: (screen) => set({ screen }),
  setEditingProfile: (id) => set({ editingProfileId: id }),

  loadProfiles: async () => {
    await ensureDefaultProfiles();
    const profiles = await db.profiles.toArray();
    set({ profiles });
  },

  selectProfile: (p) => set({ activeProfile: p }),
  selectSecondProfile: (p) => set({ secondProfile: p }),

  refreshActive: async () => {
    const { activeProfile, secondProfile } = get();
    const profiles = await db.profiles.toArray();
    set({
      profiles,
      activeProfile: activeProfile?.id ? profiles.find((p) => p.id === activeProfile.id) ?? null : null,
      secondProfile: secondProfile?.id ? profiles.find((p) => p.id === secondProfile.id) ?? null : null
    });
  },

  loadCustomCategories: async () => {
    const rows = await db.customCategories.toArray();
    set({ customCategories: rows.map((r) => ({ ...r.category, custom: true })) });
  }
}));
