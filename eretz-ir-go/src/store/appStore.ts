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
  | 'account';

interface AppState {
  screen: Screen;
  editingProfileId: number | null;
  profiles: Profile[];
  activeProfile: Profile | null;
  secondProfile: Profile | null; // לשחקן שני בדו-קרב/שיתוף פעולה
  customCategories: Category[];
  navigate: (screen: Screen) => void;
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

  navigate: (screen) => set({ screen }),
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
