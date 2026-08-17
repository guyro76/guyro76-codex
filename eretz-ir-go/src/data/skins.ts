/**
 * ערכות צבע (סקינים).
 *
 * כל סקין הוא רק אוסף של משתני CSS. אין כאן תמונות, אין גופנים
 * נוספים ואין קבצים להוריד — החלפת ערכה היא כתיבה של כמה מאפיינים
 * על אלמנט השורש, ולכן היא מיידית וגם עובדת אופליין.
 *
 * **כלל שאסור לשבור: כל סקין חייב לעבור WCAG AA.** יש בדיקה
 * אוטומטית שמחשבת ניגודיות לכל ערכה מול משטח הזכוכית ונופלת אם
 * ערכה כלשהי יורדת מתחת לרף. ערכה יפה שלא ניתן לקרוא בה היא באג,
 * לא עניין של טעם — וילד לא יודע להגיד "הניגודיות נמוכה", הוא
 * פשוט מפסיק לשחק.
 */

export interface Skin {
  id: string;
  name: string;
  /** אמוג'י שמייצג את הערכה בבורר */
  icon: string;
  /** דוגמית הצבעים שמוצגת בכפתור הבחירה */
  swatch: [string, string, string];
  vars: Record<string, string>;
}

/**
 * הצבעים המשותפים לכל הערכות: טקסט בהיר, ירוק הצלחה, אדום עדין.
 * הם לא משתנים בין ערכות כדי שמשמעות הצבע תישאר קבועה — ירוק תמיד
 * "נכון", אדום תמיד "לא נכון", בכל ערכה.
 */
export const SKINS: Skin[] = [
  {
    id: 'space',
    name: 'חלל סגול',
    icon: '🌌',
    swatch: ['#2b1b5a', '#7c5cff', '#33d6c3'],
    vars: {
      '--bg-deep': '#1b1035',
      '--bg-mid': '#2b1b5a',
      '--night': '#101d3d',
      '--turquoise': '#33d6c3',
      '--purple': '#7c5cff',
      '--coral': '#ff5c8a',
      '--gold': '#ffd75c',
      '--eggplant': '#d9a3ec',
      '--link': '#5fe3d3',
      '--glow-1': 'rgba(124, 92, 255, 0.42)',
      '--glow-2': 'rgba(51, 214, 195, 0.26)',
      '--glow-3': 'rgba(255, 92, 138, 0.14)'
    }
  },
  {
    id: 'ocean',
    name: 'מעמקי הים',
    icon: '🌊',
    swatch: ['#06283d', '#1683c4', '#41e0d0'],
    vars: {
      '--bg-deep': '#04182b',
      '--bg-mid': '#053053',
      '--night': '#021018',
      '--turquoise': '#41e0d0',
      '--purple': '#4aa3ff',
      '--coral': '#ff7f9e',
      '--gold': '#ffd98a',
      '--eggplant': '#8fd0f0',
      '--link': '#63e6e0',
      '--glow-1': 'rgba(22, 131, 196, 0.45)',
      '--glow-2': 'rgba(65, 224, 208, 0.24)',
      '--glow-3': 'rgba(120, 200, 255, 0.14)'
    }
  },
  {
    id: 'sunset',
    name: 'שקיעה',
    icon: '🌅',
    swatch: ['#3d1330', '#ff7a4d', '#ffc46b'],
    vars: {
      '--bg-deep': '#2a0d24',
      '--bg-mid': '#53193a',
      '--night': '#1b0a1e',
      '--turquoise': '#ffc46b',
      '--purple': '#ff7a4d',
      '--coral': '#ff6f91',
      '--gold': '#ffd98a',
      '--eggplant': '#f7bcd8',
      '--link': '#ffc98a',
      '--glow-1': 'rgba(255, 122, 77, 0.4)',
      '--glow-2': 'rgba(255, 196, 107, 0.24)',
      '--glow-3': 'rgba(255, 111, 145, 0.18)'
    }
  },
  {
    id: 'forest',
    name: 'יער קסום',
    icon: '🌲',
    swatch: ['#0d2b1f', '#2f9e6d', '#9be36b'],
    vars: {
      '--bg-deep': '#08200f',
      '--bg-mid': '#0d3424',
      '--night': '#04180d',
      '--turquoise': '#7fe3a8',
      '--purple': '#5fc98a',
      '--coral': '#ffa06b',
      '--gold': '#ffe07a',
      '--eggplant': '#a8dd8a',
      '--link': '#8ef0b8',
      '--glow-1': 'rgba(47, 158, 109, 0.42)',
      '--glow-2': 'rgba(155, 227, 107, 0.22)',
      '--glow-3': 'rgba(255, 224, 122, 0.12)'
    }
  },
  {
    id: 'candy',
    name: 'ממתקים',
    icon: '🍬',
    swatch: ['#3a1140', '#ff6fc4', '#7ad7ff'],
    vars: {
      '--bg-deep': '#2b0d33',
      '--bg-mid': '#4d1856',
      '--night': '#1a0722',
      '--turquoise': '#7ad7ff',
      '--purple': '#ff6fc4',
      '--coral': '#ff8fb3',
      '--gold': '#ffe066',
      '--eggplant': '#f3a6e0',
      '--link': '#8fdcff',
      '--glow-1': 'rgba(255, 111, 196, 0.4)',
      '--glow-2': 'rgba(122, 215, 255, 0.26)',
      '--glow-3': 'rgba(255, 224, 102, 0.14)'
    }
  },
  {
    id: 'neon',
    name: 'ניאון לילה',
    icon: '⚡',
    swatch: ['#0a0a14', '#00e5ff', '#ff2bd6'],
    vars: {
      '--bg-deep': '#07070f',
      '--bg-mid': '#12122a',
      '--night': '#04040a',
      '--turquoise': '#3df0ff',
      '--purple': '#b06bff',
      '--coral': '#ff5ce0',
      '--gold': '#ffe94d',
      '--eggplant': '#d08aff',
      '--link': '#5df3ff',
      '--glow-1': 'rgba(176, 107, 255, 0.36)',
      '--glow-2': 'rgba(0, 229, 255, 0.24)',
      '--glow-3': 'rgba(255, 43, 214, 0.16)'
    }
  }
];

export const DEFAULT_SKIN = 'space';

/**
 * הערכה נשמרת גם ב-localStorage, ולא רק ב-IndexedDB.
 *
 * שתי סיבות, ושתיהן התגלו בבדיקה:
 * 1. **מרוץ.** כתיבה ל-IndexedDB אסינכרונית. מי שבחר ערכה ומיד
 *    רענן איבד את הבחירה, כי הרענון הקדים את הכתיבה.
 * 2. **הבהוב.** קריאה מ-IndexedDB בעליית האפליקציה מגיעה אחרי
 *    הציור הראשון, כך שהמסך מהבהב בערכת ברירת המחדל לרגע.
 *    localStorage נקרא באופן סינכרוני ולכן הערכה נכונה מהפריים הראשון.
 */
const LS_KEY = 'eig-skin';

export function savedSkinId(): string | undefined {
  try {
    return localStorage.getItem(LS_KEY) ?? undefined;
  } catch {
    return undefined; // מצב פרטי — נופלים חזרה ל-IndexedDB
  }
}

export function rememberSkin(id: string): void {
  try {
    localStorage.setItem(LS_KEY, id);
  } catch {
    // אין אחסון — הערכה עדיין נשמרת ב-IndexedDB
  }
}

export function skinById(id: string | undefined): Skin {
  return SKINS.find((s) => s.id === id) ?? SKINS[0];
}

/**
 * מחילה ערכה על הדף. אין כאן טעינה של שום דבר — רק כתיבת משתנים,
 * ולכן ההחלפה מיידית וללא הבהוב.
 */
export function applySkin(id: string | undefined): Skin {
  const skin = skinById(id);
  if (typeof document === 'undefined') return skin;
  const root = document.documentElement;
  for (const [key, value] of Object.entries(skin.vars)) {
    root.style.setProperty(key, value);
  }
  root.dataset.skin = skin.id;
  // צבע שורת הכתובת בטלפון מתעדכן גם הוא, אחרת נשארת רצועה בצבע הישן
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', skin.vars['--bg-mid']);
  return skin;
}
