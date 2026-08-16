import type { Profile } from '../types';
import { celebrate } from './persona';

/**
 * מה אומרים בסוף סיבוב.
 *
 * הבאג שדווח, ובצדק בזעם: שרשרת של אפס חוליות ואפס נקודות הציגה
 * "ניצחת! אלוף!" עם גביע וקונפטי. מסך הסיום פשוט קרא תמיד לפונקציית
 * החגיגה, בלי להסתכל על התוצאה בכלל.
 *
 * מעבר לזה שזה נראה מגוחך, זה גם מזיק: שבח שמגיע בלי קשר למה
 * שעשית מאבד את הערך שלו, וילד מבין את זה מהר מאוד. שבח שווה משהו
 * רק כשהוא נכון.
 *
 * הכלל כאן: **תמיד מעודדים, אף פעם לא משקרים.** אפס אינו כישלון
 * שמכריזים עליו, אבל הוא גם לא ניצחון.
 */

export type Tone = 'none' | 'start' | 'good' | 'great';

export interface Outcome {
  tone: Tone;
  title: string;
  /** האם מגיעים קונפטי ומסגרת זהב */
  celebrate: boolean;
}

/**
 * @param achieved  מה שהושג בפועל (חוליות בשרשרת, תשובות בבליץ)
 * @param target    הרף שנחשב הצלחה מלאה
 */
export function outcomeFor(
  profile: Pick<Profile, 'name' | 'gender' | 'age'>,
  achieved: number,
  target: number
): Outcome {
  if (achieved <= 0) {
    return {
      tone: 'none',
      title: `${profile.name}, הפעם לא יצא — וזה בסדר גמור!`,
      celebrate: false
    };
  }

  if (achieved >= Math.max(1, target)) {
    return { tone: 'great', title: celebrate(profile), celebrate: true };
  }

  // חצי מהיעד ומעלה כבר נחשב הישג של ממש
  if (achieved * 2 >= target) {
    return {
      tone: 'good',
      title: `${profile.name}, יפה מאוד! 👏`,
      celebrate: true
    };
  }

  return { tone: 'start', title: `${profile.name}, התחלה יפה! ננסה לשפר?`, celebrate: false };
}

/** משפט משנה שמסביר מה הלאה, בלי לגעור */
export function outcomeHint(tone: Tone): string {
  switch (tone) {
    case 'none':
      return 'כל אחד מתחיל איפשהו. עוד ניסיון ותראו את ההבדל.';
    case 'start':
      return 'כל חוליה נוספת שווה נקודות — נסו שוב.';
    case 'good':
      return 'עוד קצת והשיא נשבר.';
    case 'great':
      return 'ככה עושים את זה!';
  }
}
