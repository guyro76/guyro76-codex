/** טיפוסי הליבה של ארץ-עיר GO! */

export type Gender = 'girl' | 'boy' | 'other';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Category {
  id: string;
  name: string;
  icon: string; // אימוג'י — עובד בכל מכשיר ללא הורדות
  color: string;
  description: string;
  examples: string[];
  allowProperNames: boolean;
  allowMultiWord: boolean;
  allowLatin: boolean;
  classic?: boolean;
  custom?: boolean;
}

export interface KnowledgeItem {
  id: string;
  canonicalName: string;
  normalizedName: string;
  aliases: string[];
  categoryIds: string[];
  firstLetter: string;
  description?: string;
  facts?: string[];
  popularityScore: number; // 0-100, גבוה = נפוץ
  rarityScore: number; // 0-100, גבוה = נדיר
  language: string;
  image?: ImageAsset;
  sources: string[];
  childSafe: boolean;
  lastVerifiedAt: string;
}

export interface ImageAsset {
  url: string;
  thumbnailUrl: string;
  source: string;
  author?: string;
  license?: string;
  attributionRequired: boolean;
}

export interface Profile {
  id?: number;
  name: string;
  /** אמוג'י בלבד. תמונה אמיתית נשמרת ב-photo — ראו את ההערה שם */
  avatar: string;
  /**
   * תמונת פרופיל אמיתית כ-data URI, אם המשתמש בחר בה.
   *
   * השדה הזה נולד מבאג אמיתי: תמונת גוגל נשמרה בתוך `avatar`, וכל
   * מסך שהדפיס `{profile.avatar}` הציג מחרוזת base64 ענקית על פני
   * הקלף. `avatar` הוא טקסט להצגה, ולכן לתמונה מגיע שדה משלה.
   */
  photo?: string;
  color: string;
  gender: Gender;
  age: number;
  difficulty: Difficulty;
  soundOn: boolean;
  reducedMotion: boolean;
  favoriteCategories: string[];
  totalScore: number;
  wins: number;
  gamesPlayed: number;
  correctAnswers: number;
  totalAnswers: number;
  originalitySum: number;
  bestRoundScore: number;
  dailyStreak: number;
  lastDailyDate: string;
  achievements: string[];
  createdAt: string;
}

export interface PersonalAnswer {
  id?: number;
  profileId: number;
  categoryId: string;
  letter: string;
  text: string; // הצורה התקינה
  normalized: string;
  timesUsed: number;
  discoveredAt: string;
  viaHint: boolean;
  favorite: boolean;
  knowledgeId?: string;
}

export type AnswerStatus =
  | 'empty'
  | 'typing'
  | 'valid'
  | 'wrong-letter'
  | 'wrong-category'
  | 'gibberish'
  | 'duplicate'
  | 'spelling'
  | 'needs-review';

export interface AnswerValidation {
  status: AnswerStatus;
  reason: string;
  matchedItem?: KnowledgeItem;
  suggestion?: string; // תיקון כתיב מוצע
  verificationSource: 'local-db' | 'personal' | 'online' | 'none';
  /**
   * המילה מוכרת למאגר, אך רק בקטגוריה חופפת (בעיקר שמות פרטיים).
   * "כפיר" מופיע כשם של ילד, ובכל זאת הוא גם אריה צעיר. במקרה כזה
   * אין לפסול על הסף — בודקים אונליין שהערך באמת מהקטגוריה הנכונה.
   */
  crossCategory?: boolean;
}

export interface SubmittedAnswer {
  categoryId: string;
  rawText: string;
  normalizedText: string;
  letter: string;
  validation: AnswerValidation;
  hintsUsed: number;
  revealed: boolean;
  typedAtMs: number; // זמן מתחילת הסיבוב
  baseScore: number;
  originality: number; // 0-100
  originalityBonus: number;
  speedBonus: number;
  noHintBonus: number;
  discoveryBonus: number;
  totalScore: number;
  duplicateWithOtherPlayer: boolean;
}

export type GameMode = 'solo' | 'bot' | 'duel' | 'coop' | 'tournament' | 'daily' | 'practice' | 'blitz' | 'chain' | 'mystery';

export interface GameSettings {
  mode: GameMode;
  categoryIds: string[];
  roundSeconds: number; // 0 = ללא הגבלה
  rounds: number;
  difficulty: Difficulty;
  hintsPerRound: number;
  powerCards: boolean;
  /**
   * מצב בחירה: במקום הקלדה מוצגות ארבע אפשרויות.
   *
   * נועד לילדים שעדיין לא כותבים. אופציונלי כדי שמשחקים שמורים
   * מגרסאות קודמות ימשיכו לעבוד בלי המרה.
   */
  choiceMode?: boolean;
}

export interface PlayerRoundResult {
  profileId: number;
  answers: SubmittedAnswer[];
  roundScore: number;
  newWords: number;
}

export interface RoundResult {
  letter: string;
  players: PlayerRoundResult[];
}

export interface MatchRecord {
  id?: number;
  mode: GameMode;
  playerIds: number[];
  playerNames: string[];
  scores: number[];
  winnerName: string;
  letters: string[];
  categoryIds: string[];
  playedAt: string;
  coop: boolean;
}

export interface DailyResult {
  id?: number;
  profileId: number;
  date: string; // YYYY-MM-DD
  letter: string;
  score: number;
  completed: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  icon: string;
  description: string;
  check: (p: Profile, extra: AchievementContext) => boolean;
}

/** נתונים שאינם על הפרופיל עצמו ונדרשים לבדיקת הישגים */
export interface AchievementContext {
  collectionSize: number;
  /** הארנק: שטרות ויהלומים שנצברו במשחק */
  bills: number;
  gems: number;
  /** כמה משימות ביניים הושלמו בהצלחה מלאה */
  miniGameWins: number;
}
