import { describe, expect, it } from 'vitest';
import { ANSWER_PRICE, canAfford, canBuyAnswer, roundEarnings } from '../src/lib/wallet';
import { MINI_GAMES, partialReward, pickMiniGame } from '../src/lib/miniGames';
import { ACHIEVEMENTS } from '../src/data/achievements';
import type { AchievementContext } from '../src/types';

describe('ארנק המשחק', () => {
  it('קונים רק כשיש מספיק — אין יתרה שלילית', () => {
    expect(canAfford({ bills: ANSWER_PRICE.bills, gems: 0 }, 'bills')).toBe(true);
    expect(canAfford({ bills: ANSWER_PRICE.bills - 1, gems: 0 }, 'bills')).toBe(false);
    expect(canAfford({ bills: 0, gems: ANSWER_PRICE.gems }, 'gems')).toBe(true);
    expect(canAfford({ bills: 0, gems: ANSWER_PRICE.gems - 1 }, 'gems')).toBe(false);
  });

  it('מספיק שאחד האמצעים מכסה כדי שאפשר יהיה לקנות', () => {
    expect(canBuyAnswer({ bills: 0, gems: 0 })).toBe(false);
    expect(canBuyAnswer({ bills: ANSWER_PRICE.bills, gems: 0 })).toBe(true);
    expect(canBuyAnswer({ bills: 0, gems: ANSWER_PRICE.gems })).toBe(true);
  });

  it('רווחי סיבוב: שטר לתשובה, בונוס ללוח מושלם, יהלום למקוריות', () => {
    expect(roundEarnings(3, 5, 0)).toEqual({ bills: 3, gems: 0 });
    expect(roundEarnings(5, 5, 0)).toEqual({ bills: 7, gems: 0 });
    expect(roundEarnings(4, 5, 2)).toEqual({ bills: 4, gems: 2 });
    expect(roundEarnings(0, 5, 0)).toEqual({ bills: 0, gems: 0 });
  });
});

describe('משימות הביניים', () => {
  it('בחירת המשימה יציבה לאותו סיבוב ואות', () => {
    expect(pickMiniGame(2, 'ג').id).toBe(pickMiniGame(2, 'ג').id);
  });

  it('סיבובים עוקבים מקבלים משימות שונות', () => {
    const seed = 'ל';
    expect(pickMiniGame(0, seed).id).not.toBe(pickMiniGame(1, seed).id);
  });

  it('הצלחה מלאה נותנת את הבונוס המלא', () => {
    for (const spec of MINI_GAMES) {
      expect(partialReward(spec, 1)).toEqual(spec.reward);
      expect(partialReward(spec, 1.5)).toEqual(spec.reward);
    }
  });

  it('הצלחה חלקית נותנת בונוס חלקי, בלי יהלומים', () => {
    const spec = MINI_GAMES[0];
    const half = partialReward(spec, 0.5);
    expect(half.points).toBe(Math.floor(spec.reward.points * 0.5));
    expect(half.wallet.gems).toBe(0);
    expect(partialReward(spec, 0)).toEqual({ points: 0, wallet: { bills: 0, gems: 0 } });
  });
});

describe('הישגים למערכות החדשות', () => {
  const profile = {
    wins: 0,
    gamesPlayed: 0,
    totalAnswers: 0,
    correctAnswers: 0,
    originalitySum: 0,
    bestRoundScore: 0,
    dailyStreak: 0
  } as unknown as Parameters<(typeof ACHIEVEMENTS)[number]['check']>[0];

  const ctx = (over: Partial<AchievementContext> = {}): AchievementContext => ({
    collectionSize: 0,
    bills: 0,
    gems: 0,
    miniGameWins: 0,
    ...over
  });

  const byId = (id: string) => ACHIEVEMENTS.find((a) => a.id === id)!;

  it('כל ההישגים החדשים קיימים ומזוהים ביחיד', () => {
    for (const id of ['first-bills', 'rich-wallet', 'gem-collector', 'mini-game-first', 'mini-game-master']) {
      expect(ACHIEVEMENTS.filter((a) => a.id === id)).toHaveLength(1);
    }
  });

  it('הישגי הארנק נפתחים בסכום הנכון בלבד', () => {
    expect(byId('first-bills').check(profile, ctx({ bills: 9 }))).toBe(false);
    expect(byId('first-bills').check(profile, ctx({ bills: 10 }))).toBe(true);
    expect(byId('rich-wallet').check(profile, ctx({ bills: 49 }))).toBe(false);
    expect(byId('rich-wallet').check(profile, ctx({ bills: 50 }))).toBe(true);
    expect(byId('gem-collector').check(profile, ctx({ gems: 10 }))).toBe(true);
  });

  it('הישגי משימות הביניים נפתחים לפי מספר ההצלחות', () => {
    expect(byId('mini-game-first').check(profile, ctx({ miniGameWins: 0 }))).toBe(false);
    expect(byId('mini-game-first').check(profile, ctx({ miniGameWins: 1 }))).toBe(true);
    expect(byId('mini-game-master').check(profile, ctx({ miniGameWins: 9 }))).toBe(false);
    expect(byId('mini-game-master').check(profile, ctx({ miniGameWins: 10 }))).toBe(true);
  });

  it('אף הישג לא נפתח בפרופיל ריק לגמרי', () => {
    expect(ACHIEVEMENTS.filter((a) => a.check(profile, ctx()))).toHaveLength(0);
  });
});

describe('שני משחקי הביניים החדשים', () => {
  it('איקס-עיגול וכרטיס גירוד רשומים ומוגרלים כמו השאר', () => {
    const ids = MINI_GAMES.map((g) => g.id);
    expect(ids).toContain('tictactoe');
    expect(ids).toContain('scratch');
    expect(new Set(ids).size).toBe(ids.length);
    // כל המשחקים אמורים לצאת בהגרלה על פני מספיק סיבובים
    const drawn = new Set(Array.from({ length: 24 }, (_, i) => pickMiniGame(i, 'ק').id));
    expect(drawn.size).toBe(MINI_GAMES.length);
  });

  it('לכל משחק יש שם, הסבר ובונוס חיובי', () => {
    for (const g of MINI_GAMES) {
      expect(g.name.length).toBeGreaterThan(2);
      expect(g.how.length).toBeGreaterThan(10);
      expect(g.reward.points).toBeGreaterThan(0);
    }
  });
});
