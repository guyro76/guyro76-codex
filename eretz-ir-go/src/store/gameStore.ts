import { create } from 'zustand';
import type { Category, GameSettings, Profile, SubmittedAnswer } from '../types';
import type { Hint } from '../lib/artzi';
import { buildHint, pickHintTarget } from '../lib/artzi';
import { buildLetterIndex, drawLetter } from '../lib/letters';
import { getKnowledgeBase } from '../lib/knowledge';
import { processRound } from '../lib/roundEngine';
import { normalizeHebrew } from '../lib/hebrew';
import { completionBonus } from '../lib/scoring';
import { db } from '../db/db';
import { earn, roundEarnings } from '../lib/wallet';
import type { KnowledgeItem } from '../types';

export interface AnswerDraft {
  text: string;
  hintsUsed: number;
  revealed: boolean;
  typedAtMs: number;
  hintTarget?: KnowledgeItem;
  lastHint?: Hint;
}

export interface PlayerState {
  profile: Profile;
  answers: Record<string, AnswerDraft>;
  submitted: SubmittedAnswer[];
  roundScore: number;
  totalScore: number;
  done: boolean;
}

export type GamePhase = 'idle' | 'letter' | 'playing' | 'passing' | 'validating' | 'round-done' | 'match-done';

interface GameState {
  settings: GameSettings;
  categories: Category[];
  players: PlayerState[];
  currentPlayerIdx: number;
  letter: string;
  usedLetters: string[];
  roundIndex: number;
  phase: GamePhase;
  roundStartedAt: number;
  hintsLeft: number;
  coop: boolean;
  dailyDate: string | null;
  /** קלפי כוח — מאגר משותף למשחק; דגל true = הקלף נוצל */
  power: { extraTime: boolean; swap: boolean; freeHint: boolean; double: { playerIdx: number; categoryId: string } | null };
  /** נקודות בונוס ממשימות הביניים, נצברות למשחק כולו */
  bonusPoints: number;
  /** משך הסיבוב שנבחר, כדי שאפשר יהיה לחזור אליו אחרי "בלי לחץ" */
  lastTimedSeconds: number;

  startMatch: (settings: GameSettings, categories: Category[], profiles: Profile[], dailyDate?: string) => void;
  rollLetter: (forced?: string) => string;
  beginRound: () => void;
  setAnswer: (categoryId: string, text: string) => void;
  askHint: (categoryId: string) => Hint | null;
  revealAnswer: (categoryId: string) => string | null;
  /** קניית תשובה מהארנק — ממלאת את התשובה, בלי ניקוד על התשובה עצמה */
  buyAnswer: (categoryId: string) => string | null;
  /** מעבר בין משחק על זמן לבין משחק בלי הגבלת זמן — זמין בכל שלב */
  setTimed: (on: boolean) => void;
  addBonus: (points: number) => void;
  finishPlayer: () => Promise<void>;
  usePower: (kind: 'extraTime' | 'swap' | 'freeHint') => boolean;
  setDoubleCategory: (categoryId: string) => void;
  continueToNextPlayer: () => void;
  nextRound: () => void;
  endMatch: () => Promise<void>;
  reset: () => void;
}

const emptySettings: GameSettings = {
  mode: 'solo',
  categoryIds: [],
  roundSeconds: 180,
  rounds: 3,
  difficulty: 'medium',
  hintsPerRound: 3,
  powerCards: false
};

export const useGame = create<GameState>((set, get) => ({
  settings: emptySettings,
  bonusPoints: 0,
  lastTimedSeconds: 180,
  categories: [],
  players: [],
  currentPlayerIdx: 0,
  letter: '',
  usedLetters: [],
  roundIndex: 0,
  phase: 'idle',
  roundStartedAt: 0,
  hintsLeft: 3,
  coop: false,
  dailyDate: null,
  power: { extraTime: false, swap: false, freeHint: false, double: null },

  startMatch: (settings, categories, profiles, dailyDate) => {
    set({
      settings,
      categories,
      players: profiles.map((profile) => ({
        profile,
        answers: {},
        submitted: [],
        roundScore: 0,
        totalScore: 0,
        done: false
      })),
      currentPlayerIdx: 0,
      letter: '',
      usedLetters: [],
      roundIndex: 0,
      phase: 'letter',
      hintsLeft: settings.hintsPerRound,
      coop: settings.mode === 'coop',
      dailyDate: dailyDate ?? null,
      power: { extraTime: false, swap: false, freeHint: false, double: null },
      bonusPoints: 0,
      lastTimedSeconds: settings.roundSeconds > 0 ? settings.roundSeconds : 180
    });
  },

  rollLetter: (forced) => {
    const { settings, usedLetters } = get();
    const kb = getKnowledgeBase();
    const index = buildLetterIndex(kb.items);
    const letter = forced ?? drawLetter(settings.categoryIds, settings.difficulty, index, usedLetters);
    set({ letter, usedLetters: [...usedLetters, letter] });
    return letter;
  },

  beginRound: () => {
    set((state) => ({
      phase: 'playing',
      roundStartedAt: Date.now(),
      hintsLeft: state.settings.hintsPerRound,
      players: state.players.map((p) => ({ ...p, answers: {}, submitted: [], roundScore: 0, done: false }))
    }));
  },

  setAnswer: (categoryId, text) => {
    set((state) => {
      const players = [...state.players];
      const idx = state.coop ? 0 : state.currentPlayerIdx;
      const player = { ...players[idx] };
      const prev = player.answers[categoryId];
      player.answers = {
        ...player.answers,
        [categoryId]: {
          text,
          hintsUsed: prev?.hintsUsed ?? 0,
          revealed: prev?.revealed ?? false,
          typedAtMs: prev?.text ? prev.typedAtMs : Date.now() - state.roundStartedAt,
          hintTarget: prev?.hintTarget,
          lastHint: prev?.lastHint
        }
      };
      players[idx] = player;
      return { players };
    });
  },

  askHint: (categoryId) => {
    const state = get();
    if (state.hintsLeft <= 0) return null;
    const idx = state.coop ? 0 : state.currentPlayerIdx;
    const player = state.players[idx];
    const draft = player.answers[categoryId] ?? { text: '', hintsUsed: 0, revealed: false, typedAtMs: 0 };
    const kb = getKnowledgeBase();
    const category = state.categories.find((c) => c.id === categoryId);
    if (!category) return null;

    let target = draft.hintTarget;
    if (!target) {
      const exclude = new Set(
        Object.values(player.answers)
          .map((a) => normalizeHebrew(a.text))
          .filter(Boolean)
      );
      target = pickHintTarget(kb, categoryId, normalizeHebrew(state.letter).charAt(0), exclude) ?? undefined;
    }
    if (!target) return null;

    const level = Math.min(3, draft.hintsUsed + 1) as 1 | 2 | 3;
    const hint = buildHint(target, level, category, kb);

    set((s) => {
      const players = [...s.players];
      const p = { ...players[idx] };
      p.answers = {
        ...p.answers,
        [categoryId]: { ...draft, hintsUsed: draft.hintsUsed + 1, hintTarget: target, lastHint: hint }
      };
      players[idx] = p;
      return { players, hintsLeft: s.hintsLeft - 1 };
    });
    return hint;
  },

  revealAnswer: (categoryId) => {
    const state = get();
    const idx = state.coop ? 0 : state.currentPlayerIdx;
    const player = state.players[idx];
    const draft = player.answers[categoryId];
    const target = draft?.hintTarget;
    if (!target) return null;
    set((s) => {
      const players = [...s.players];
      const p = { ...players[idx] };
      p.answers = {
        ...p.answers,
        [categoryId]: { ...draft, text: target.canonicalName, revealed: true }
      };
      players[idx] = p;
      return { players };
    });
    return target.canonicalName;
  },

  /**
   * קניית תשובה: מבחינה מכנית זהה ל"גלו לי" — התשובה ממולאת ומסומנת
   * `revealed`, ולכן אינה מזכה בניקוד. ההבדל הוא שכאן משלמים מהארנק
   * במקום לבזבז רמזים, וזה זמין גם בלי לבקש רמז קודם.
   * החיוב עצמו נעשה במסך, אחרי שהשחקן בחר שטרות או יהלומים.
   */
  buyAnswer: (categoryId) => {
    const state = get();
    const idx = state.coop ? 0 : state.currentPlayerIdx;
    const player = state.players[idx];
    const draft = player.answers[categoryId] ?? { text: '', hintsUsed: 0, revealed: false, typedAtMs: 0 };
    const kb = getKnowledgeBase();

    let target = draft.hintTarget;
    if (!target) {
      const exclude = new Set(
        Object.values(player.answers)
          .map((a) => normalizeHebrew(a.text))
          .filter(Boolean)
      );
      target = pickHintTarget(kb, categoryId, normalizeHebrew(state.letter).charAt(0), exclude) ?? undefined;
    }
    if (!target) return null;
    const chosen = target;

    set((s) => {
      const players = [...s.players];
      const p = { ...players[idx] };
      p.answers = {
        ...p.answers,
        [categoryId]: { ...draft, text: chosen.canonicalName, revealed: true, hintTarget: chosen }
      };
      players[idx] = p;
      return { players };
    });
    return chosen.canonicalName;
  },

  setTimed: (on) => {
    set((s) => ({
      settings: { ...s.settings, roundSeconds: on ? s.lastTimedSeconds || 180 : 0 },
      lastTimedSeconds: s.settings.roundSeconds > 0 ? s.settings.roundSeconds : s.lastTimedSeconds,
      // מאתחלים את שעון הסיבוב, אחרת חזרה למצב מתוזמן מסיימת אותו מיד
      roundStartedAt: on ? Date.now() : s.roundStartedAt
    }));
  },

  addBonus: (points) => set((s) => ({ bonusPoints: s.bonusPoints + Math.max(0, points) })),

  finishPlayer: async () => {
    const state = get();
    const isDuel = state.settings.mode === 'duel' || state.settings.mode === 'tournament';

    if (isDuel && state.currentPlayerIdx < state.players.length - 1) {
      // מסמנים שהשחקן סיים ועוברים למסך "העברת מכשיר"
      set((s) => {
        const players = [...s.players];
        players[s.currentPlayerIdx] = { ...players[s.currentPlayerIdx], done: true };
        return { players, phase: 'passing' };
      });
      return;
    }

    set({ phase: 'validating' });
    const current = get();
    const activePlayers = current.coop ? [current.players[0]] : current.players;
    const results = await processRound({
      players: activePlayers.map((p) => ({
        profile: p.profile,
        answers: Object.fromEntries(
          Object.entries(p.answers).map(([k, v]) => [
            k,
            { text: v.text, hintsUsed: v.hintsUsed, revealed: v.revealed, typedAtMs: v.typedAtMs }
          ])
        )
      })),
      letter: current.letter,
      categories: current.categories,
      roundSeconds: current.settings.roundSeconds,
      coop: current.coop
    });

    set((s) => {
      const players = s.players.map((p, i) => {
        const submitted = s.coop ? results[0] : results[i];
        if (!submitted) return p;
        // קלף ניקוד כפול: מכפיל את הקטגוריה שסומנה על ידי השחקן שבחר בה
        if (s.power.double && s.power.double.playerIdx === i) {
          const target = submitted.find((a) => a.categoryId === s.power.double!.categoryId);
          if (target && target.totalScore > 0) target.totalScore *= 2;
        }
        const answersScore = submitted.reduce((sum, a) => sum + a.totalScore, 0);
        const bonus = completionBonus(submitted, s.categories.length);
        const roundScore = answersScore + bonus;
        return { ...p, submitted, roundScore, totalScore: p.totalScore + roundScore, done: true };
      });
      return { players, phase: 'round-done' };
    });

    // עדכון סטטיסטיקות פרופיל + זיכוי הארנק על הסיבוב
    for (const p of get().players) {
      if (!p.profile.id || (get().coop && p !== get().players[0])) continue;
      const valid = p.submitted.filter((a) => a.validation.status === 'valid');
      const answered = p.submitted.filter((a) => a.normalizedText);
      const earnings = roundEarnings(
        valid.length,
        p.submitted.length,
        valid.filter((a) => a.originality >= 90).length
      );
      await earn(p.profile.id, earnings.bills, earnings.gems);
      await db.profiles.update(p.profile.id, {
        totalScore: p.profile.totalScore + p.roundScore,
        correctAnswers: p.profile.correctAnswers + valid.length,
        totalAnswers: p.profile.totalAnswers + answered.length,
        originalitySum: p.profile.originalitySum + valid.reduce((s2, a) => s2 + a.originality, 0),
        bestRoundScore: Math.max(p.profile.bestRoundScore, p.roundScore)
      });
    }
  },

  usePower: (kind) => {
    const s0 = get();
    if (!s0.settings.powerCards || s0.power[kind]) return false;
    if (kind === 'extraTime') {
      // הזזת תחילת הסיבוב קדימה = 15 שניות נוספות על השעון
      set((s) => ({ roundStartedAt: s.roundStartedAt + 15000, power: { ...s.power, extraTime: true } }));
    } else if (kind === 'freeHint') {
      set((s) => ({ hintsLeft: s.hintsLeft + 1, power: { ...s.power, freeHint: true } }));
    } else {
      set((s) => ({ power: { ...s.power, swap: true } }));
    }
    return true;
  },

  setDoubleCategory: (categoryId) => {
    set((s) => {
      if (!s.settings.powerCards || s.power.double) return s;
      const playerIdx = s.coop ? 0 : s.currentPlayerIdx;
      return { power: { ...s.power, double: { playerIdx, categoryId } } };
    });
  },

  continueToNextPlayer: () => {
    set((s) => ({
      currentPlayerIdx: s.currentPlayerIdx + 1,
      phase: 'playing',
      roundStartedAt: Date.now(),
      hintsLeft: s.settings.hintsPerRound
    }));
  },

  nextRound: () => {
    const state = get();
    if (state.roundIndex + 1 >= state.settings.rounds) {
      set({ phase: 'match-done' });
      return;
    }
    set({ roundIndex: state.roundIndex + 1, currentPlayerIdx: 0, phase: 'letter' });
  },

  endMatch: async () => {
    // נקודות הבונוס ממשימות הביניים נזקפות בסיום המשחק. המשימה משותפת
    // לכל מי שיושב מול המכשיר, ולכן כולם מקבלים את אותו בונוס — בדו-קרב
    // זה שומר על הפרש הנקודות בין השחקנים ולא מכריע במקומם.
    if (get().bonusPoints > 0) {
      set((s) => ({
        players: s.players.map((p) => ({ ...p, totalScore: p.totalScore + s.bonusPoints }))
      }));
    }
    const state = get();
    const scores = state.players.map((p) => p.totalScore);
    const maxScore = Math.max(...scores);
    const winnerIdx = scores.indexOf(maxScore);
    const winnerName = state.coop ? 'כל הצוות' : state.players[winnerIdx]?.profile.name ?? '';

    await db.matches.add({
      mode: state.settings.mode,
      playerIds: state.players.map((p) => p.profile.id ?? -1),
      playerNames: state.players.map((p) => p.profile.name),
      scores,
      winnerName,
      letters: state.usedLetters,
      categoryIds: state.settings.categoryIds,
      playedAt: new Date().toISOString(),
      coop: state.coop
    });

    for (let i = 0; i < state.players.length; i++) {
      const p = state.players[i];
      if (!p.profile.id) continue;
      const won = !state.coop && state.players.length > 1 && i === winnerIdx && scores.filter((x) => x === maxScore).length === 1;
      await db.profiles.update(p.profile.id, {
        gamesPlayed: p.profile.gamesPlayed + 1,
        wins: p.profile.wins + (won ? 1 : 0)
      });
    }

    // תוצאת אתגר יומי
    if (state.dailyDate && state.players[0]?.profile.id) {
      const profile = state.players[0].profile;
      const already = await db.dailyResults
        .where('[profileId+date]')
        .equals([profile.id!, state.dailyDate])
        .first();
      if (!already) {
        await db.dailyResults.add({
          profileId: profile.id!,
          date: state.dailyDate,
          letter: state.letter,
          score: state.players[0].totalScore,
          completed: true
        });
        // חישוב רצף יומי
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
        const streak = profile.lastDailyDate === yKey ? profile.dailyStreak + 1 : 1;
        await db.profiles.update(profile.id!, { dailyStreak: streak, lastDailyDate: state.dailyDate });
      }
    }
  },

  reset: () => {
    set({
      settings: emptySettings,
      categories: [],
      players: [],
      currentPlayerIdx: 0,
      letter: '',
      usedLetters: [],
      roundIndex: 0,
      phase: 'idle',
      hintsLeft: 3,
      coop: false,
      dailyDate: null,
      power: { extraTime: false, swap: false, freeHint: false, double: null },
      bonusPoints: 0
    });
  }
}));
