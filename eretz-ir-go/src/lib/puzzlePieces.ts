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
