import type { Achievement } from '../types';

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-win',
    name: 'ניצחון ראשון',
    icon: '🏅',
    description: 'ניצחון ראשון במשחק',
    check: (p) => p.wins >= 1
  },
  {
    id: 'five-wins-streak',
    name: 'חמישה ניצחונות',
    icon: '🏆',
    description: 'חמישה ניצחונות במשחקים',
    check: (p) => p.wins >= 5
  },
  {
    id: 'world-explorer',
    name: 'חוקרי העולם',
    icon: '🌍',
    description: '10 משחקים הושלמו',
    check: (p) => p.gamesPlayed >= 10
  },
  {
    id: 'originality-crown',
    name: 'כתר המקוריות',
    icon: '👑',
    description: 'ממוצע מקוריות מעל 60',
    check: (p) => p.totalAnswers > 10 && p.originalitySum / Math.max(1, p.correctAnswers) >= 60
  },
  {
    id: 'hundred-words',
    name: 'מאה מילים באוסף',
    icon: '📚',
    description: '100 מילים באוסף האישי',
    check: (_p, extra) => extra.collectionSize >= 100
  },
  {
    id: 'thirty-words',
    name: 'אוסף מתחיל',
    icon: '🃏',
    description: '30 מילים באוסף האישי',
    check: (_p, extra) => extra.collectionSize >= 30
  },
  {
    id: 'week-streak',
    name: 'שבוע של אתגרים',
    icon: '🔥',
    description: 'רצף 7 ימים באתגר היומי',
    check: (p) => p.dailyStreak >= 7
  },
  {
    id: 'three-streak',
    name: 'רצף שלושה ימים',
    icon: '✨',
    description: 'רצף 3 ימים באתגר היומי',
    check: (p) => p.dailyStreak >= 3
  },
  {
    id: 'sharp-shooter',
    name: 'דיוק מרשים',
    icon: '🎯',
    description: 'מעל 80% תשובות נכונות (אחרי 20 תשובות)',
    check: (p) => p.totalAnswers >= 20 && p.correctAnswers / p.totalAnswers >= 0.8
  },
  {
    id: 'high-score',
    name: 'שיא נקודות',
    icon: '💎',
    description: 'מעל 100 נקודות בסיבוב אחד',
    check: (p) => p.bestRoundScore >= 100
  }
];
