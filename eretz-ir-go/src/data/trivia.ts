import type { Riddle } from './riddles';

/**
 * מאגר שאלות הידע — חידות "מה קורה בעולם", בנוסף לחידות הקלאסיות.
 *
 * ## למה מאגר נפרד
 *
 * החידות ב-`riddles.ts` נצחיות: צל, שמש, ביצה. שאלה כמו "מי הסתתר
 * מתחת לעגבנייה" לא. היא נכונה היום, מעניינת את הילד השבוע, ותהיה
 * מביכה בעוד שנה. לכן לכל שאלה "טרייה" יש תאריך אימות ומקור, והיא
 * יוצאת מהמשחק לבד כעבור `RECENT_TTL_DAYS` ימים — בלי שמישהו יצטרך
 * לזכור למחוק אותה.
 *
 * ## כללי הוספה
 *
 * 1. **שאלה טרייה נכנסת רק עם `source` ו-`asOf`.** `source` הוא קישור
 *    לדיווח שאומת. תשובה שנכתבה מהזיכרון אינה מקור. הבדיקה
 *    `tests/trivia.test.ts` נכשלת בלי שניהם.
 * 2. **רק מה שמתאים לילדים.** בידור, ספורט, חלל, מוזיקה, סרטי ילדים.
 *    בלי פוליטיקה, בלי מלחמה, בלי פשע, בלי רכילות על משפחות, ובלי סרטים
 *    שאינם לגיל הילדים (גם אם זכו באוסקר).
 * 3. **כמה ניסוחים לכל תשובה.** ילד כותב "ליאם" ולא "ליאם גולן",
 *    ו"נורבגיה" ולא "נורווגיה". `isRiddleAnswerCorrect` מנקה פיסוק ו-ה׳
 *    הידיעה; את שאר הווריאציות כותבים כאן.
 * 4. **המזהה לעולם לא משתנה.** `usedRiddleIds` נשמר בין משחקים.
 */

export type TriviaWorld = 'tv' | 'sport' | 'music' | 'movies' | 'space' | 'israel' | 'science' | 'nature' | 'geography';

export interface TriviaQuestion extends Riddle {
  world: TriviaWorld;
  /** התאריך שבו התשובה אומתה לאחרונה (YYYY-MM-DD). */
  asOf: string;
  /** קישור לדיווח שאימת את התשובה. חובה לשאלה טרייה. */
  source?: string;
  /** שאלה על אירוע עדכני: פגה אחרי `RECENT_TTL_DAYS` ימים מ-`asOf`. */
  recent?: boolean;
}

export const TRIVIA_WORLDS: Record<TriviaWorld, { name: string; icon: string }> = {
  tv: { name: 'טלוויזיה', icon: '📺' },
  sport: { name: 'ספורט', icon: '⚽' },
  music: { name: 'מוזיקה', icon: '🎤' },
  movies: { name: 'סרטים', icon: '🎬' },
  space: { name: 'חלל', icon: '🚀' },
  israel: { name: 'ישראל', icon: '🇮🇱' },
  science: { name: 'מדע', icon: '🔬' },
  nature: { name: 'טבע', icon: '🐾' },
  geography: { name: 'גיאוגרפיה', icon: '🌍' }
};

/** שאלה על אירוע עדכני נשארת במשחק שנה מהאימות, ואז יוצאת. */
export const RECENT_TTL_DAYS = 365;

const T = (
  id: string,
  world: TriviaWorld,
  question: string,
  answers: string[],
  extra: { asOf?: string; source?: string; recent?: boolean } = {}
): TriviaQuestion => ({ id, world, question, answers, asOf: extra.asOf ?? '2026-11-26', ...extra });

const MAKO_TOMATO = 'https://www.mako.co.il/tv-the_masked_singer/season5-articles/Article-01cc52149cff1a1027.htm';
const FIFA_FINAL = 'https://inside.fifa.com/en/news/spain-crowned-world-cup-2026-champions-new-york-new-jersey';
const EUROVISION = 'https://www.maariv.co.il/culture/music/article-1322171';
const ARTEMIS = 'https://www.opb.org/article/2026/04/10/artemis-ii-astronauts-return-from-moon-with-a-splashdown-to-close-out-a-record-breaking-lunar-voyage';
const OLYMPICS = 'https://www.topendsports.com/events/winter/medal-tally/2026.htm';
const TOY_STORY = 'https://www.screendaily.com/news/toy-story-5-scores-biggest-north-american-box-office-bow-of-2026-on-160m/5217859.article';
const ZOOTOPIA = 'https://thewaltdisneycompany.com/news/zootopia-2-highest-grossing-animated-film/';

/** אירועים עדכניים, מאומתים מול המקור הרשום לצד כל שאלה. */
const RECENT: TriviaQuestion[] = [
  T(
    'tv-masked-tomato',
    'tv',
    'מי הסתתר מתחת למסכת העגבנייה בעונה החמישית של "הזמר במסכה"?',
    ['ליאם גולן', 'ליאם'],
    { recent: true, source: MAKO_TOMATO }
  ),
  T('sport-worldcup-2026', 'sport', 'איזו נבחרת זכתה במונדיאל 2026, בגמר מול ארגנטינה?', ['ספרד'], {
    recent: true,
    source: FIFA_FINAL
  }),
  T(
    'sport-worldcup-2026-goal',
    'sport',
    'מי הבקיע את שער הניצחון היחיד של ספרד בגמר המונדיאל 2026?',
    ['פראן טורס', 'פרן טורס', 'פראן טוריס', 'טורס'],
    { recent: true, source: FIFA_FINAL }
  ),
  T('music-eurovision-2026', 'music', 'איזו מדינה זכתה באירוויזיון 2026 שנערך בווינה?', ['בולגריה'], {
    recent: true,
    source: EUROVISION
  }),
  T(
    'music-eurovision-israel-2026',
    'music',
    'מי ייצג את ישראל באירוויזיון 2026 וסיים במקום השני?',
    ['נועם בתן', 'בתן', 'נועם'],
    { recent: true, source: EUROVISION }
  ),
  T(
    'music-eurovision-israel-song-2026',
    'music',
    'איך קוראים לשיר שנועם בתן שר באירוויזיון 2026?',
    ['מישל', 'michelle'],
    { recent: true, source: EUROVISION }
  ),
  T(
    'space-artemis-2',
    'space',
    'איזו משימה של נאס"א שלחה באפריל 2026 ארבעה אסטרונאוטים להקיף את הירח ולחזור לכדור הארץ?',
    ['ארטמיס 2', 'ארטמיס שתיים', 'ארטמיס II', 'ארטמיס', 'artemis 2', 'artemis ii'],
    { recent: true, source: ARTEMIS }
  ),
  T('sport-winter-2026', 'sport', 'באיזו מדינה נערכה אולימפיאדת החורף 2026?', ['איטליה'], {
    recent: true,
    source: OLYMPICS
  }),
  T(
    'sport-winter-2026-medals',
    'sport',
    'איזו מדינה סיימה במקום הראשון בטבלת המדליות של אולימפיאדת החורף 2026?',
    ['נורווגיה', 'נורבגיה'],
    { recent: true, source: OLYMPICS }
  ),
  T(
    'movies-toy-story-5',
    'movies',
    'איזה סרט פיקסאר על צעצועים שמדברים יצא ביוני 2026, וזה החלק החמישי בסדרה?',
    ['צעצוע של סיפור 5', 'צעצוע של סיפור חמש', 'צעצוע של סיפור', 'toy story 5'],
    { recent: true, source: TOY_STORY }
  ),
  T(
    'movies-zootopia-2',
    'movies',
    'איזה סרט הנפשה של דיסני, עם הארנבת ג׳ודי והשועל ניק, יצא בסוף 2025 ושבר שיאי קופות?',
    ['זוטרופוליס 2', 'זוטופיה 2', 'זוטרופוליס', 'זוטופיה', 'zootopia 2'],
    { recent: true, source: ZOOTOPIA }
  )
];

/** ידע כללי שלא פג: אותן תשובות היום ובעוד עשר שנים. */
const EVERGREEN: TriviaQuestion[] = [
  T('geo-dead-sea', 'geography', 'איזה ים הוא הנקודה הנמוכה ביותר ביבשה בעולם?', ['ים המלח']),
  T('geo-biggest-ocean', 'geography', 'מהו האוקיינוס הגדול ביותר בעולם?', ['האוקיינוס השקט', 'אוקיינוס שקט', 'השקט']),
  T('geo-tokyo', 'geography', 'מהי בירת יפן?', ['טוקיו']),
  T('geo-pisa', 'geography', 'באיזו מדינה נמצא מגדל פיזה הנטוי?', ['איטליה']),
  T('space-planets', 'space', 'כמה כוכבי לכת יש במערכת השמש שלנו?', ['8', 'שמונה']),
  T('space-mercury', 'space', 'איזה כוכב לכת הוא הקרוב ביותר לשמש?', ['חמה', 'כוכב חמה']),
  T('nature-blue-whale', 'nature', 'מהו בעל החיים הגדול ביותר בעולם?', ['לוויתן כחול', 'לוויתן']),
  T('nature-cheetah', 'nature', 'איזו חיה היא המהירה ביותר ביבשה?', ['ברדלס']),
  T('nature-chameleon', 'nature', 'איזו חיה משנה צבע ויש לה לשון ארוכה שנורית החוצה?', ['זיקית']),
  T('science-oxygen', 'science', 'איזה גז בני אדם צריכים לנשום כדי לחיות?', ['חמצן']),
  T('science-green', 'science', 'איזה צבע מתקבל כשמערבבים כחול וצהוב?', ['ירוק']),
  T('israel-eilat-sea', 'israel', 'על שפת איזה ים נמצאת העיר אילת?', ['ים סוף']),
  T('israel-matzot', 'israel', 'באיזה חג אוכלים מצות?', ['פסח']),
  T('sport-football-players', 'sport', 'כמה שחקנים יש בכל קבוצה על מגרש הכדורגל?', ['11', 'אחד עשר', 'אחת עשרה']),
  T('movies-harry-potter', 'movies', 'מי כתבה את ספרי הארי פוטר?', ['ג׳יי קיי רולינג', 'רולינג', 'ג׳ק רולינג'])
];

export const TRIVIA: TriviaQuestion[] = [...RECENT, ...EVERGREEN];

const DAY_MS = 86_400_000;

/** האם שאלה עדיין בתוקף ב-`now`. שאלה נצחית תמיד בתוקף. */
export function isTriviaActive(q: TriviaQuestion, now: Date = new Date()): boolean {
  if (!q.recent) return true;
  const verified = Date.parse(q.asOf);
  if (Number.isNaN(verified)) return false;
  return now.getTime() - verified <= RECENT_TTL_DAYS * DAY_MS;
}

export function activeTrivia(now: Date = new Date()): TriviaQuestion[] {
  return TRIVIA.filter((q) => isTriviaActive(q, now));
}
