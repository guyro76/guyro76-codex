import { PUZZLES, pieceCount, puzzleById, type Puzzle } from '../data/puzzles';

/**
 * חלוקת חלקי הפאזל בסוף סיבוב.
 *
 * שני כללים שהוגדרו במפורש, ושניהם משנים את התחושה:
 *  1. חלק אחד בסוף כל סיבוב — פרס ודאי, לא הגרלה. ילד שסיים סיבוב
 *     תמיד מקבל משהו.
 *  2. **לא תמיד מאותו פאזל.** אוספים כמה לוחות במקביל, וכך יש כל
 *     הזמן כמה דברים "כמעט מוכנים" ולא לוח אחד ארוך ומשעמם.
 *
 * ההיגיון יושב כאן, בנפרד מהמסך ומהמסד, כדי שאפשר יהיה לבדוק את
 * ההתפלגות במספרים: פרס שנופל תמיד על אותו פאזל הוא באג שקשה
 * לראות בעין אבל קל למדוד.
 */

/** מצב האיסוף: לכל פאזל, אילו אינדקסים של חלקים כבר נאספו */
export type PuzzleProgress = Record<string, number[]>;

export interface Award {
  puzzleId: string;
  /** אינדקס החלק בלוח: שורה × עמודה, משמאל למעלה */
  piece: number;
  /** כמה חלקים יש עכשיו, אחרי הזכייה */
  have: number;
  total: number;
  completed: boolean;
}

export function isComplete(puzzle: Puzzle, owned: number[] | undefined): boolean {
  return (owned?.length ?? 0) >= pieceCount(puzzle);
}

/** הפאזלים שעדיין לא הושלמו */
export function openPuzzles(progress: PuzzleProgress): Puzzle[] {
  return PUZZLES.filter((p) => !isComplete(p, progress[p.id]));
}

/**
 * הענקת חלק אחד.
 *
 * `lastPuzzleId` הוא הפאזל שזכה בסיבוב הקודם. אם יש עוד פאזל פתוח,
 * לא חוזרים אליו פעמיים ברצף — זה מה שמייצר את התחושה שאוספים
 * כמה לוחות ולא אחד.
 *
 * מחזיר null רק כשכל הפאזלים הושלמו.
 */
export function awardPiece(
  progress: PuzzleProgress,
  lastPuzzleId?: string,
  rng: () => number = Math.random
): Award | null {
  const open = openPuzzles(progress);
  if (open.length === 0) return null;

  /**
   * "לא אותו פאזל פעמיים ברצף" מסונן **ראשון**, לא אחרון.
   *
   * בסדר ההפוך היה באג: אחרי הסיבוב הראשון היה בדיוק פאזל אחד
   * "שכבר התחיל" — זה שזכה עכשיו — וההעדפה לפאזל שהתחיל צמצמה את
   * המאגר בחזרה אליו בלבד. התוצאה הייתה בדיוק ההפך מהכלל.
   * חוזרים לאותו פאזל רק כשהוא היחיד שנשאר פתוח.
   */
  const others = open.filter((p) => p.id !== lastPuzzleId);
  const base = others.length > 0 ? others : open;

  // בתוך זה מעדיפים לוח שכבר התחיל: כיף יותר להשלים לוח שכמעט
  // מוכן מאשר לפתוח לוח שמיני ריק
  const started = base.filter((p) => (progress[p.id]?.length ?? 0) > 0);
  const pool = started.length > 0 && rng() < 0.7 ? started : base;

  const puzzle = pool[Math.floor(rng() * pool.length)] ?? pool[0];
  const owned = new Set(progress[puzzle.id] ?? []);
  const missing = [];
  for (let i = 0; i < pieceCount(puzzle); i++) if (!owned.has(i)) missing.push(i);

  const piece = missing[Math.floor(rng() * missing.length)] ?? missing[0];
  const have = owned.size + 1;

  return {
    puzzleId: puzzle.id,
    piece,
    have,
    total: pieceCount(puzzle),
    completed: have >= pieceCount(puzzle)
  };
}

/** מיזוג זכייה לתוך מצב האיסוף, בלי לשנות את המקור */
export function applyAward(progress: PuzzleProgress, award: Award): PuzzleProgress {
  const owned = progress[award.puzzleId] ?? [];
  if (owned.includes(award.piece)) return progress;
  return { ...progress, [award.puzzleId]: [...owned, award.piece].sort((a, b) => a - b) };
}

/** סיכום לתצוגה במסך הבית ובמסך הפאזלים */
export function summary(progress: PuzzleProgress): {
  pieces: number;
  completed: number;
  total: number;
} {
  let pieces = 0;
  let completed = 0;
  for (const puzzle of PUZZLES) {
    const owned = progress[puzzle.id]?.length ?? 0;
    pieces += Math.min(owned, pieceCount(puzzle));
    if (isComplete(puzzle, progress[puzzle.id])) completed++;
  }
  return { pieces, completed, total: PUZZLES.length };
}

/** ניקוי ערכים שנשמרו לפאזל שכבר לא קיים בגרסה הנוכחית */
export function prune(progress: PuzzleProgress): PuzzleProgress {
  const clean: PuzzleProgress = {};
  for (const [id, pieces] of Object.entries(progress)) {
    const puzzle = puzzleById(id);
    if (!puzzle) continue;
    clean[id] = pieces.filter((p) => p >= 0 && p < pieceCount(puzzle));
  }
  return clean;
}

/**
 * מחיר חלק חסר.
 *
 * ילד שנתקע עם חלק אחד חסר ולא מצליח להשלים אותו נוטש את הלוח. אפשר
 * לקנות אותו במטבע המשחק — אותו ארנק של קניית תשובה, ובלי שום קשר
 * לכסף אמיתי.
 *
 * המחיר גבוה מזה של תשובה בכוונה: קנייה היא מוצא אחרון ולא הדרך
 * הרגילה להשלים לוח. הדרך הרגילה היא לשחק עוד סיבוב.
 */
export const PIECE_PRICE = { bills: 8, gems: 4 } as const;

/**
 * הפרס על השלמת לוח.
 *
 * זה הרגע שהתמונה נחשפת במלואה, והוא צריך להרגיש כמו הישג — לא כמו
 * עוד סיבוב. לכן הפרס גדול משמעותית מרווח של סיבוב רגיל.
 */
export const COMPLETION_BONUS = { bills: 25, gems: 3 } as const;

/** אילו חלקים עדיין חסרים בלוח */
export function missingPieces(puzzle: Puzzle, owned: number[] | undefined): number[] {
  const have = new Set(owned ?? []);
  const out: number[] = [];
  for (let i = 0; i < pieceCount(puzzle); i++) if (!have.has(i)) out.push(i);
  return out;
}

/**
 * כמה חלקים נשארו עד שהלוח נחשף.
 *
 * מוצג לילד כדי שהמרחק מהיעד יהיה תמיד ברור — "עוד 2" מניע להמשיך,
 * "5 מתוך 9" פחות.
 */
export function remaining(puzzle: Puzzle, owned: number[] | undefined): number {
  return Math.max(0, pieceCount(puzzle) - (owned?.length ?? 0));
}
