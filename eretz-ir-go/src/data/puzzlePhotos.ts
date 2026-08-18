/**
 * צילומים אמיתיים של אתרי הפאזל, ארוזים בתוך החבילה.
 *
 * למה בכלל לארוז ולא רק למשוך מהרשת: המשחק הוא Offline First. הצינור
 * החי מוויקיפדיה עובד מצוין, אבל בצפייה הראשונה **בלי רשת** הוא לא
 * מחזיר כלום, והילד רואה איור במקום צילום. קובץ ארוז נפתח מיד, תמיד.
 *
 * מאיפה הקבצים: הם אינם נכתבים ביד. `scripts/fetch-puzzle-photos.mjs`
 * מושך אותם מוויקיפדיה העברית יחד עם שם היוצר, הרישיון והקישור לדף
 * המקור, ומייצר את הקובץ הזה מחדש. הסקריפט רץ ב-GitHub Actions, כי שם
 * יש גישה לשרתי ויקימדיה.
 *
 * הכלל שלא נשבר: **אין כאן תמונה שמקורה לא ידוע.** לכל רשומה יש יוצר,
 * רישיון וקישור לדף התיאור — ושלושתם מוצגים לילד לצד התמונה. תמונה
 * שהסקריפט לא הצליח לאמת פשוט לא נכנסת, והפאזל שלה נופל חזרה לצינור
 * החי ואז לאיור.
 */
export interface PuzzlePhoto {
  /** שם הקובץ בתוך public/puzzles */
  file: string;
  /** היוצר, כפי שוויקישיתוף מדווח עליו */
  author: string;
  /** שם הרישיון, למשל "CC BY-SA 4.0" */
  license: string;
  /** דף התיאור בוויקישיתוף — שם אפשר לאמת הכול */
  pageUrl: string;
}

/**
 * מפתח = מזהה הפאזל. נוצר אוטומטית; אין לערוך ביד.
 *
 * ריק עד שהסקריפט רץ בפעם הראשונה. ריק זה מצב תקין ולא שבור: כל
 * הפאזלים פשוט משתמשים בצינור החי ובאיור, בדיוק כמו קודם.
 */
export const PUZZLE_PHOTOS: Record<string, PuzzlePhoto> = {
  'masada': {
    file: 'masada.webp',
    author: "Godot13",
    license: "CC BY-SA 4.0",
    pageUrl: "https://commons.wikimedia.org/wiki/File:Israel-2013-Aerial_21-Masada.jpg"
  },
  'dead-sea': {
    file: 'dead-sea.webp',
    author: "NASA, earthobservatory, https://earthobservatory.nasa.gov",
    license: "Public domain",
    pageUrl: "https://commons.wikimedia.org/wiki/File:Dead_sea.jpg"
  },
  'kinneret': {
    file: 'kinneret.webp',
    author: "יוצר לא מצוין",
    license: "Public domain",
    pageUrl: "https://commons.wikimedia.org/wiki/File:Sea_of_Galilee.jpg"
  },
  'ramon': {
    file: 'ramon.webp',
    author: "Hagai Agmon-Snir حچاي اچمون-سنير חגי אגמון-שניר",
    license: "CC BY-SA 4.0",
    pageUrl: "https://commons.wikimedia.org/wiki/File:MakhteshRamonMar262022_01.jpg"
  },
  'ein-gedi': {
    file: 'ein-gedi.webp',
    author: "דג קטן",
    license: "CC BY-SA 4.0",
    pageUrl: "https://commons.wikimedia.org/wiki/File:%D7%A9%D7%9E%D7%95%D7%A8%D7%AA_%D7%A2%D7%99%D7%9F_%D7%92%D7%93%D7%992.jpg"
  },
  'rosh-hanikra': {
    file: 'rosh-hanikra.webp',
    author: "בר",
    license: "CC BY-SA 3.0",
    pageUrl: "https://commons.wikimedia.org/wiki/File:Mediterranean_Sea_from_Rosh_HaNikra.jpg"
  },
  'akko': {
    file: 'akko.webp',
    author: "Erez Ashkenazi",
    license: "CC BY-SA 4.0",
    pageUrl: "https://commons.wikimedia.org/wiki/File:%D7%A2%D7%9B%D7%95001.jpg"
  },
  'caesarea': {
    file: 'caesarea.webp',
    author: "Idomeir",
    license: "CC BY-SA 4.0",
    pageUrl: "https://commons.wikimedia.org/wiki/File:%D7%A7%D7%99%D7%A1%D7%A8%D7%99%D7%94_%D7%94%D7%A2%D7%AA%D7%99%D7%A7%D7%94.jpg"
  }
};

export function puzzlePhoto(puzzleId: string): PuzzlePhoto | undefined {
  return PUZZLE_PHOTOS[puzzleId];
}

/**
 * הנתיב הציבורי לצילום.
 *
 * נגזר מ-`BASE_URL` ולא קבוע: ב-GitHub Pages האתר יושב תחת תת-נתיב,
 * ונתיב מוחלט היה שובר שם את כל התמונות.
 */
export function puzzlePhotoUrl(photo: PuzzlePhoto): string {
  return `${import.meta.env.BASE_URL}puzzles/${photo.file}`;
}

/** הקרדיט כפי שהוא מוצג לילד מתחת לתמונה */
export function puzzlePhotoCredit(photo: PuzzlePhoto): string {
  return `${photo.author} · ${photo.license}`;
}
