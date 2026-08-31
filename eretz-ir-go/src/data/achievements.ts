import type { Achievement } from '../types';

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-win',
    name: 'ניצחון ראשון',
    icon: '🏅',
    description: 'ניצחון ראשון במשחק',
    check: (p) => p.wins >= 1,
    progress: (p) => ({ have: p.wins, need: 1 })
  },
  {
    id: 'five-wins-streak',
    name: 'חמישה ניצחונות',
    icon: '🏆',
    description: 'חמישה ניצחונות במשחקים',
    check: (p) => p.wins >= 5,
    progress: (p) => ({ have: p.wins, need: 5 })
  },
  {
    id: 'world-explorer',
    name: 'חוקרי העולם',
    icon: '🌍',
    description: '10 משחקים הושלמו',
    check: (p) => p.gamesPlayed >= 10,
    progress: (p) => ({ have: p.gamesPlayed, need: 10 })
  },
  {
    id: 'originality-crown',
    name: 'כתר המקוריות',
    icon: '👑',
    description: 'ממוצע מקוריות מעל 60',
    check: (p) => p.totalAnswers > 10 && p.originalitySum / Math.max(1, p.correctAnswers) >= 60,
    // אחוזים ולא ספירה: היעד הוא ממוצע, לא כמות
    progress: (p) => ({
      have: Math.round(p.originalitySum / Math.max(1, p.correctAnswers)),
      need: 60
    })
  },
  {
    id: 'hundred-words',
    name: 'מאה מילים באוסף',
    icon: '📚',
    description: '100 מילים באוסף האישי',
    check: (_p, extra) => extra.collectionSize >= 100,
    progress: (_p, extra) => ({ have: extra.collectionSize, need: 100 })
  },
  {
    id: 'thirty-words',
    name: 'אוסף מתחיל',
    icon: '🃏',
    description: '30 מילים באוסף האישי',
    check: (_p, extra) => extra.collectionSize >= 30,
    progress: (_p, extra) => ({ have: extra.collectionSize, need: 30 })
  },
  {
    id: 'week-streak',
    name: 'שבוע של אתגרים',
    icon: '🔥',
    description: 'רצף 7 ימים באתגר היומי',
    check: (p) => p.dailyStreak >= 7,
    progress: (p) => ({ have: p.dailyStreak, need: 7 })
  },
  {
    id: 'three-streak',
    name: 'רצף שלושה ימים',
    icon: '✨',
    description: 'רצף 3 ימים באתגר היומי',
    check: (p) => p.dailyStreak >= 3,
    progress: (p) => ({ have: p.dailyStreak, need: 3 })
  },
  {
    id: 'sharp-shooter',
    name: 'דיוק מרשים',
    icon: '🎯',
    description: 'מעל 80% תשובות נכונות (אחרי 20 תשובות)',
    check: (p) => p.totalAnswers >= 20 && p.correctAnswers / p.totalAnswers >= 0.8,
    progress: (p) => ({ have: p.totalAnswers, need: 20 })
  },
  {
    id: 'high-score',
    name: 'שיא נקודות',
    icon: '💎',
    description: 'מעל 100 נקודות בסיבוב אחד',
    check: (p) => p.bestRoundScore >= 100,
    progress: (p) => ({ have: p.bestRoundScore, need: 100 })
  },

  // ===== הישגים למערכות החדשות: הארנק ומשימות הביניים =====
  {
    id: 'first-bills',
    name: 'הארנק נפתח',
    icon: '💵',
    description: '10 שטרות בארנק',
    check: (_p, extra) => extra.bills >= 10,
    progress: (_p, extra) => ({ have: extra.bills, need: 10 })
  },
  {
    id: 'rich-wallet',
    name: 'קופה מלאה',
    icon: '🏦',
    description: '50 שטרות בארנק',
    check: (_p, extra) => extra.bills >= 50,
    progress: (_p, extra) => ({ have: extra.bills, need: 50 })
  },
  {
    id: 'gem-collector',
    name: 'אספן יהלומים',
    icon: '💠',
    description: '10 יהלומים — רק תשובות מקוריות במיוחד מזכות בהם',
    check: (_p, extra) => extra.gems >= 10,
    progress: (_p, extra) => ({ have: extra.gems, need: 10 })
  },
  {
    id: 'mini-game-first',
    name: 'משימה ראשונה',
    icon: '🎲',
    description: 'השלמת משימת ביניים אחת',
    check: (_p, extra) => extra.miniGameWins >= 1,
    progress: (_p, extra) => ({ have: extra.miniGameWins, need: 1 })
  },
  {
    id: 'mini-game-master',
    name: 'אלוף המשימות',
    icon: '🕹️',
    description: 'עשר משימות ביניים הושלמו',
    check: (_p, extra) => extra.miniGameWins >= 10,
    progress: (_p, extra) => ({ have: extra.miniGameWins, need: 10 })
  }
];
