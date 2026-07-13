import type { Category } from '../types';

/**
 * ספריית הקטגוריות המלאה.
 * 9 הראשונות הן הקלאסיות ומסומנות classic.
 */
const c = (
  id: string,
  name: string,
  icon: string,
  color: string,
  description: string,
  examples: string[],
  opts: Partial<Pick<Category, 'allowProperNames' | 'allowMultiWord' | 'allowLatin' | 'classic'>> = {}
): Category => ({
  id,
  name,
  icon,
  color,
  description,
  examples,
  allowProperNames: opts.allowProperNames ?? false,
  allowMultiWord: opts.allowMultiWord ?? true,
  allowLatin: opts.allowLatin ?? false,
  classic: opts.classic ?? false
});

export const CATEGORIES: Category[] = [
  // ===== 9 הקלאסיות =====
  c('country', 'ארץ', '🌍', '#7c5cff', 'מדינה בעולם', ['ישראל', 'צרפת', 'ברזיל'], { allowProperNames: true, classic: true }),
  c('city', 'עיר', '🏙️', '#33d6c3', 'עיר או יישוב בארץ או בעולם', ['תל אביב', 'פריז', 'ניו יורק'], { allowProperNames: true, classic: true }),
  c('animal', 'חי', '🦁', '#ff8a5c', 'בעל חיים', ['אריה', 'זברה', 'דולפין'], { classic: true }),
  c('plant', 'צומח', '🌿', '#5ccf7a', 'צמח, פרח, עץ, פרי או ירק', ['ורד', 'תפוח', 'אקליפטוס'], { classic: true }),
  c('inanimate', 'דומם', '🪨', '#a0aec0', 'חפץ או עצם שאינו חי', ['שולחן', 'אבן', 'מחשב'], { classic: true }),
  c('boyname', 'שם של בן', '👦', '#5c9dff', 'שם פרטי של בן', ['דוד', 'יונתן', 'איתן'], { allowProperNames: true, allowMultiWord: false, classic: true }),
  c('girlname', 'שם של בת', '👧', '#ff5c9d', 'שם פרטי של בת', ['מאיה', 'נועה', 'תמר'], { allowProperNames: true, allowMultiWord: false, classic: true }),
  c('profession', 'מקצוע', '🧑‍🚒', '#ffc95c', 'עיסוק או תפקיד', ['רופאה', 'טייס', 'מורה'], { classic: true }),
  c('celebrity', 'אישיות מפורסמת', '⭐', '#e05cff', 'דמות אמיתית ומוכרת', ['דוד בן גוריון', 'מסי', 'נטע ברזילי'], { allowProperNames: true, classic: true }),

  // ===== מורחבות =====
  c('israelplace', 'יישוב בישראל', '🇮🇱', '#5cc8ff', 'עיר, קיבוץ או מושב בישראל', ['חיפה', 'עומר', 'דגניה'], { allowProperNames: true }),
  c('seaanimal', 'חיית ים', '🐬', '#4ab8d8', 'בעל חיים שחי בים', ['דולפין', 'כריש', 'מדוזה']),
  c('bird', 'ציפור', '🦜', '#8fd85c', 'עוף או ציפור', ['דרור', 'נשר', 'תוכי']),
  c('insect', 'חרק', '🐞', '#c98a5c', 'חרק או פרוקי רגליים', ['נמלה', 'דבורה', 'חיפושית']),
  c('flower', 'פרח', '🌸', '#ff9ec6', 'פרח', ['כלנית', 'נרקיס', 'סחלב']),
  c('fruit', 'פרי', '🍎', '#ff6b6b', 'פרי אכיל', ['תפוח', 'מנגו', 'אבטיח']),
  c('vegetable', 'ירק', '🥕', '#ffa94d', 'ירק אכיל', ['גזר', 'מלפפון', 'חציל']),
  c('tree', 'עץ', '🌳', '#69b366', 'עץ', ['אלון', 'זית', 'ברוש']),
  c('food', 'מאכל', '🍕', '#ffb15c', 'מאכל או מנה', ['פיצה', 'חומוס', 'שקשוקה']),
  c('dessert', 'קינוח', '🍰', '#f7a8d8', 'קינוח או ממתק', ['גלידה', 'עוגה', 'קרמבו']),
  c('drink', 'משקה', '🥤', '#5cd8ff', 'משקה', ['מיץ', 'לימונדה', 'שוקו']),
  c('hobby', 'תחביב', '🎨', '#b45cff', 'תחביב או פעילות פנאי', ['ציור', 'ריקוד', 'קריאה']),
  c('sport', 'ספורט', '⚽', '#5cff8f', 'ענף ספורט', ['כדורגל', 'שחייה', 'טניס']),
  c('sportteam', 'קבוצת ספורט', '🏆', '#ffd75c', 'קבוצת ספורט מוכרת', ['מכבי חיפה', 'ריאל מדריד', 'ברצלונה'], { allowProperNames: true }),
  c('game', 'משחק', '🎲', '#ff8f5c', 'משחק חברה או משחק ילדים', ['מונופול', 'תופסת', 'שחמט'], { allowProperNames: true }),
  c('videogame', 'משחק מחשב', '🎮', '#8f5cff', 'משחק מחשב או קונסולה', ['מיינקראפט', 'פורטנייט', 'רובלוקס'], { allowProperNames: true, allowLatin: true }),
  c('app', 'אפליקציה', '📱', '#5cffd8', 'אפליקציה מוכרת', ['וואטסאפ', 'יוטיוב', 'ווייז'], { allowProperNames: true, allowLatin: true }),
  c('movie', 'סרט', '🎬', '#ff5c7a', 'שם של סרט', ['מלך האריות', 'לשבור את הקרח', 'קונג פו פנדה'], { allowProperNames: true }),
  c('series', 'סדרה', '📺', '#5c7aff', 'סדרת טלוויזיה', ['כוכב הצפון', 'שנות השמונים', 'הבורר'], { allowProperNames: true }),
  c('cartoon', 'דמות מצוירת', '🦸', '#ffd75c', 'דמות מסרט מצויר או אנימציה', ['בוב ספוג', 'אלזה', 'פיקאצ׳ו'], { allowProperNames: true }),
  c('character', 'דמות מסרט או סדרה', '🎭', '#d85cff', 'דמות בדיונית מסרט או סדרה', ['הארי פוטר', 'סופרמן', 'מואנה'], { allowProperNames: true }),
  c('book', 'ספר', '📚', '#c9a35c', 'שם של ספר', ['הארי פוטר', 'דירה להשכיר', 'מטילדה'], { allowProperNames: true }),
  c('author', 'סופר או סופרת', '✍️', '#8a7a5c', 'כותב או כותבת ספרים', ['לאה גולדברג', 'אריך קסטנר', 'דויד גרוסמן'], { allowProperNames: true }),
  c('singer', 'זמר או זמרת', '🎤', '#ff5cd8', 'זמר או זמרת', ['עומר אדם', 'נועה קירל', 'עדן בן זקן'], { allowProperNames: true }),
  c('band', 'להקה', '🎸', '#5cffb1', 'להקה או הרכב מוזיקלי', ['כוורת', 'משינה', 'תיסלם'], { allowProperNames: true }),
  c('song', 'שיר', '🎵', '#5cd8a3', 'שם של שיר', ['ירושלים של זהב', 'גולדן בוי', 'טודו בום'], { allowProperNames: true }),
  c('instrument', 'כלי נגינה', '🎻', '#a35cff', 'כלי נגינה', ['גיטרה', 'חליל', 'תופים']),
  c('worldplace', 'מקום בעולם', '🗺️', '#5cb8ff', 'אתר, הר, נהר או מקום מפורסם בעולם', ['מגדל אייפל', 'הרי האלפים', 'נהר האמזונס'], { allowProperNames: true }),
  c('vehicle', 'כלי תחבורה', '🚗', '#ff7a5c', 'כלי רכב או תחבורה', ['אופניים', 'רכבת', 'מסוק']),
  c('clothing', 'בגד', '👕', '#5cff7a', 'פריט לבוש', ['חולצה', 'מכנסיים', 'צעיף']),
  c('household', 'כלי בבית', '🏠', '#d8b45c', 'חפץ שנמצא בבית', ['מקרר', 'ספה', 'מנורה']),
  c('school', 'פריט לבית הספר', '🎒', '#5c8fff', 'משהו שלוקחים או רואים בבית הספר', ['ילקוט', 'מחברת', 'לוח']),
  c('color', 'צבע', '🌈', '#ff5c5c', 'צבע', ['אדום', 'טורקיז', 'סגול'], { allowMultiWord: false }),
  c('emotion', 'רגש', '💛', '#ffdf5c', 'רגש או תחושה', ['שמחה', 'געגוע', 'התרגשות'], { allowMultiWord: false }),
  c('verb', 'פעולה', '🏃', '#5cffe0', 'פועל — משהו שעושים', ['לרוץ', 'לצייר', 'לשיר'], { allowMultiWord: false }),
  c('trait', 'תכונה', '✨', '#c05cff', 'תכונת אופי', ['אדיבות', 'סקרנות', 'אומץ'], { allowMultiWord: false }),
  c('kitchen', 'משהו שיש במטבח', '🍳', '#ffb85c', 'חפץ או מוצר מהמטבח', ['סיר', 'מצקת', 'קומקום']),
  c('room', 'משהו שיש בחדר', '🛏️', '#8fb4ff', 'חפץ שנמצא בחדר', ['מיטה', 'שטיח', 'כרית']),
  c('trip', 'משהו שלוקחים לטיול', '⛺', '#7ad85c', 'ציוד לטיול', ['תרמיל', 'בקבוק מים', 'כובע']),
  c('sea', 'משהו שרואים בים', '🌊', '#5cc0ff', 'דבר שרואים בים או בחוף', ['גלים', 'צדפים', 'מציל']),
  c('schoolthing', 'משהו שרואים בבית הספר', '🏫', '#b4a05c', 'דבר שרואים בבית הספר', ['כיתה', 'מורה', 'הפסקה'])
];

export const CLASSIC_CATEGORY_IDS = CATEGORIES.filter((cat) => cat.classic).map((cat) => cat.id);

export function getCategory(id: string, custom: Category[] = []): Category | undefined {
  return CATEGORIES.find((cat) => cat.id === id) ?? custom.find((cat) => cat.id === id);
}
