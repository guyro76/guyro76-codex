import type { Difficulty, Profile } from '../types';

/**
 * הפרופיל של ארצי כשהוא משחק כיריב.
 *
 * שימו לב ל-`id` שאינו קיים: זה מכוון. `finishPlayer` מדלג על
 * עדכון סטטיסטיקות לכל שחקן בלי id, ולכן ארצי לא נשמר במסד, לא
 * צובר ניקוד בפרופילים, לא מופיע ברשימת השחקנים ולא מזכה את עצמו
 * בארנק. הוא יריב לסיבוב, לא משתמש.
 */
export const ARTZI_PROFILE: Profile = {
  name: 'ארצי',
  avatar: '🤖',
  color: '#33d6c3',
  gender: 'other',
  age: 10,
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
  createdAt: new Date(0).toISOString()
};

/** איך ארצי מציג את עצמו לפי הרמה שנבחרה */
export const BOT_LABEL: Record<Difficulty, string> = {
  easy: 'ארצי הרגוע',
  medium: 'ארצי',
  hard: 'ארצי האלוף'
};
