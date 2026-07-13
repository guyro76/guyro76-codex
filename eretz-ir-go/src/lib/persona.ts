import type { Gender, Profile } from '../types';

/**
 * מנוע הפנייה האישית: המשחק מדבר עם המשתתפים בלשון המגדר שבחרו,
 * ומתבדח בהתאם לגיל. אפשר לבחור גם "אחר" — ואז הפנייה ניטרלית-רבים.
 */

export type AgeBand = 'kid' | 'tween' | 'teen' | 'adult';

export function ageBand(age: number): AgeBand {
  if (age <= 8) return 'kid';
  if (age <= 12) return 'tween';
  if (age <= 17) return 'teen';
  return 'adult';
}

/** הטיה מגדרית של ביטויים נפוצים: [girl, boy, neutral] */
const FORMS: Record<string, [string, string, string]> = {
  ready: ['מוכנה?', 'מוכן?', 'מתחילים?'],
  you_won: ['ניצחת! אלופה!', 'ניצחת! אלוף!', 'ניצחון! כל הכבוד!'],
  you_start: ['את מתחילה', 'אתה מתחיל', 'מתחילים איתך'],
  think: ['חשבי על', 'חשוב על', 'כדאי לחשוב על'],
  try_again: ['נסי שוב', 'נסה שוב', 'אפשר לנסות שוב'],
  amazing: ['מדהימה!', 'מדהים!', 'מדהים!'],
  found: ['מצאת', 'מצאת', 'מצאתם'],
  write: ['כתבי', 'כתוב', 'כתבו'],
  choose: ['בחרי', 'בחר', 'בחרו'],
  finished: ['סיימת?', 'סיימת?', 'סיימתם?'],
  champion: ['אלופה', 'אלוף', 'אלוף/ה'],
  smart: ['חכמה', 'חכם', 'חכם/ה'],
  fast: ['מהירה', 'מהיר', 'מהירים']
};

export function say(key: keyof typeof FORMS | string, gender: Gender): string {
  const form = FORMS[key as string];
  if (!form) return String(key);
  if (gender === 'girl') return form[0];
  if (gender === 'boy') return form[1];
  return form[2];
}

/** ברכת פתיחה לפי שעה, מגדר וגיל */
export function greeting(p: Pick<Profile, 'name' | 'gender' | 'age'>): string {
  const hour = new Date().getHours();
  const time = hour < 12 ? 'בוקר טוב' : hour < 18 ? 'צהריים טובים' : 'ערב טוב';
  return `${time}, ${p.name}! ${say('ready', p.gender)}`;
}

/** בדיחות והערות שנונות לפי גיל — מוצגות בפתיחה, בין סיבובים ובתוצאות */
const JOKES: Record<AgeBand, string[]> = {
  kid: [
    'למה העיפרון הלך לישון? כי הוא היה מחודד מדי! ✏️',
    'איזו עיר הכי מתוקה בעולם? סוכר-לנד! 🍭',
    'מה אמרה הזברה למראה? "וואו, איזה פסים יפים יש לך!" 🦓',
    'למה הבננה הלכה לרופא? כי היא לא הרגישה מקולפת! 🍌',
    'איך קוראים לדג בלי עין? דג! (אבל אל תגידו לו) 🐟'
  ],
  tween: [
    'טיפ סודי: "זימבבואה" תמיד מצילה באות ז׳. אל תגידו שלא עזרתי. 😉',
    'מי שכותב "חתול" בקטגוריית מקצוע — כנראה החתול שלו באמת עובד קשה. 🐱',
    'אות קשה זו לא בעיה. בעיה זה כשאחותך גומרת לפניך. ⏱️',
    'עובדה: מי שמנצח בארץ-עיר זוכה בכבוד נצחי. או לפחות עד הסיבוב הבא. 🏆',
    'זוכרים: "צ׳יפס" זה לא מדינה. למרות שהיה מגניב אם כן. 🍟'
  ],
  teen: [
    'אם היית שולף תשובות כמו שאתה שולף תירוצים — היית כבר בטופ. 😏',
    'ניצחון בארץ-עיר שווה לפחות סטורי. רק בלי לצלם את המסך של המפסידים. 📱',
    'האות ט׳ באה בכוונה. תוכיחו לה שטעתה. 💪',
    'מקוריות מעל 90? יש מצב שנולדת לזה. 🔥',
    'המוח שלך עכשיו במצב טורבו. אל תבזבז אותו על "תפוח" בכל סיבוב. 🍎'
  ],
  adult: [
    'ארץ-עיר: המקום היחיד שבו "זימבבואה" היא מילת חירום לאומית. 🌍',
    'סוף סוף שימוש מעשי לכל הידע מהחידונים של פעם. 🧠',
    'טיפ: הילדים זוכרים כל תשובה שכתבתם. בחרו בחוכמה. 😄',
    'מותר להפסיד לילדים. זה נקרא חינוך. או לפחות ככה מספרים למפסידים. 🏳️',
    'המקוריות שלכם נמדדת. בלי לחץ. ✨'
  ]
};

export function randomJoke(age: number, rng: () => number = Math.random): string {
  const pool = JOKES[ageBand(age)];
  return pool[Math.floor(rng() * pool.length)];
}

/** משוב חיובי לתשובה שגויה — לעולם לא "נכשלת" */
export function gentleFail(gender: Gender): string {
  const options: [string, string, string][] = [
    ['עוד ניסיון קטן והמילה תיכנס!', 'עוד ניסיון קטן והמילה תיכנס!', 'עוד ניסיון קטן והמילה תיכנס!'],
    ['כמעט! נסי כיוון אחר', 'כמעט! נסה כיוון אחר', 'כמעט! אפשר כיוון אחר'],
    ['קרוב מאוד! יש לך עוד רעיון?', 'קרוב מאוד! יש לך עוד רעיון?', 'קרוב מאוד! יש עוד רעיון?']
  ];
  const pick = options[Math.floor(Math.random() * options.length)];
  return pick[gender === 'girl' ? 0 : gender === 'boy' ? 1 : 2];
}

/** משוב לניצחון/הישג לפי מגדר וגיל */
export function celebrate(p: Pick<Profile, 'name' | 'gender' | 'age'>): string {
  const base = say('you_won', p.gender);
  const band = ageBand(p.age);
  const extra: Record<AgeBand, string> = {
    kid: ' כוכב זהב בשבילך! ⭐',
    tween: ' עוד ניצחון כזה ותצטרכו מדף לגביעים. 🏆',
    teen: ' רמה של אליפות. 🔥',
    adult: ' הניסיון מנצח, כרגיל. 🎩'
  };
  return `${p.name}, ${base}${extra[band]}`;
}

/** הודעת פתיחת סיבוב עם שילוב בדיחה מדי פעם */
export function roundIntro(p: Pick<Profile, 'name' | 'gender' | 'age'>, letter: string, withJoke: boolean): string {
  const lead = `${p.name}, האות שלך היא ${letter}! ${say('ready', p.gender)}`;
  return withJoke ? `${lead}\n${randomJoke(p.age)}` : lead;
}
