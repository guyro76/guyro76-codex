import { describe, expect, it } from 'vitest';
import { FALLBACK_NAME, hasBlockedWord, normalizeForFilter, safeDisplayName } from '../src/lib/wordFilter';
import { MAX_NICKNAME, sanitizeNickname } from '../src/lib/challenge';

const name = (raw: string) => safeDisplayName(raw, MAX_NICKNAME);

describe('שם התצוגה אינו ערוץ הודעות', () => {
  /**
   * ההגנה החשובה מכולן, כי היא אינה תלויה בשום רשימה: הודעה מחייבת
   * הפרדה בין מילים, ולכן עובר אסימון אחד בלבד.
   */
  it('רק מילה אחת עוברת', () => {
    expect(name('בוא נריב')).toBe('בוא');
    expect(name('אני שונא אותך')).toBe('אני');
    expect(name('תפגוש אותי בפארק')).toBe('תפגוש');
    expect(name('אורי כהן')).toBe('אורי');
  });

  it('אין רווחים בשם שנשלח, בשום צורה', () => {
    for (const raw of ['בוא נריב', 'א   ב', '\tדני\nכהן', 'a b c']) {
      expect(name(raw), raw).not.toMatch(/\s/);
    }
  });

  /** מספר טלפון הוא ניסיון ליצור קשר מחוץ למשחק */
  it('שם שהוא בעיקר ספרות נפסל', () => {
    expect(name('0501234567')).toBe(FALLBACK_NAME);
    expect(name('054999')).toBe(FALLBACK_NAME);
    expect(name('דני1234')).toBe(FALLBACK_NAME);
  });

  it('מעט ספרות בשם עדיין מותרות', () => {
    expect(name('דני2')).toBe('דני2');
    expect(name('נועה12')).toBe('נועה12');
  });
});

describe('קללות ועלבונות', () => {
  it('קללות בעברית נפסלות', () => {
    for (const bad of ['זין', 'כוס', 'חרא', 'שרמוטה', 'מניאק', 'מטומטם', 'דביל', 'מפגר']) {
      expect(name(bad), bad).toBe(FALLBACK_NAME);
    }
  });

  it('קללות באנגלית נפסלות', () => {
    for (const bad of ['fuck', 'Shit', 'BITCH', 'retard', 'stupid', 'loser']) {
      expect(name(bad), bad).toBe(FALLBACK_NAME);
    }
  });

  /** ניסיונות התחמקות נפוצים אצל ילדים */
  it('כתיב מתחמק נתפס גם הוא', () => {
    expect(name('f.u.c.k')).toBe(FALLBACK_NAME);
    expect(name('sh1t')).toBe(FALLBACK_NAME);
    expect(name('$hit')).toBe(FALLBACK_NAME);
    expect(name('ST-U-P-I-D')).toBe(FALLBACK_NAME);
    // אות סופית: "מטומטם" ו"מטומטמ" מגיעים לאותה צורה מנורמלת
    expect(name('מטומטם')).toBe(FALLBACK_NAME);
    expect(name('מטומטמ')).toBe(FALLBACK_NAME);
  });

  /**
   * הבדיקה הזו מתעדת מגבלה ולא מבטיחה הבטחה: **רשימת חסימה תמיד
   * ניתנת לעקיפה**. כתיב יצירתי מספיק יעבור אותה, וזה בסדר — כי
   * הוא עובר כמילה בודדת בת 12 תווים ובלי ספרות, כלומר לא כהודעה
   * ולא כדרך ליצור קשר. שתי ההגנות הראשונות הן שמחזיקות, והרשימה
   * רק מקצצת את המקרים הקלים. מי שקורא את זה ומתפתה "לחזק את
   * הרשימה" — זה לא המקום שבו נמצאת ההגנה.
   */
  it('עקיפה יצירתית עוברת — ולכן היא לא ההגנה', () => {
    const sneaky = name('fuuuck');
    expect(sneaky).not.toBe(FALLBACK_NAME);
    // אבל היא עדיין מילה אחת, קצרה, ובלי אפשרות לצרף אליה עוד מילים
    expect(sneaky).not.toMatch(/\s/);
    expect(sneaky.length).toBeLessThanOrEqual(MAX_NICKNAME);
  });

  it('איומים ישירים נפסלים', () => {
    expect(name('תמות')).toBe(FALLBACK_NAME);
    expect(name('die')).toBe(FALLBACK_NAME);
  });
});

describe('שמות אמיתיים לא נפסלים', () => {
  /**
   * סינון־יתר הוא באג משלו: ילד שהמשחק קורא לו "שחקן" במקום בשמו
   * חושב שהמשחק שבור. הרשימה מכוונת כך שמילים קצרות נחסמות רק
   * בהתאמה מדויקת, ולכן שם שמכיל אותן במקרה עובר.
   */
  it('שמות עבריים נפוצים עוברים כמו שהם', () => {
    for (const ok of ['אורי', 'מאיה', 'נועה', 'איתן', 'שירה', 'יונתן', 'תמר', 'רוני', 'עידן']) {
      expect(name(ok), ok).toBe(ok);
    }
  });

  it('מילים תמימות שמכילות מילה קצרה חסומה עוברות', () => {
    // "זין" חסום בהתאמה מדויקת בלבד, אחרת גם אלה היו נפסלים
    expect(name('מזין')).toBe('מזין');
    expect(name('זינוק')).toBe('זינוק');
  });

  it('שמות באנגלית עוברים', () => {
    expect(name('Maya')).toBe('Maya');
    expect(name('Uri')).toBe('Uri');
  });
});

describe('תמיד יש מה להציג', () => {
  /** מסך שמראה " מאתגר אותך" נראה שבור, ולכן אין החזרה של ריק */
  it('קלט ריק או פסול מקבל שם ברירת מחדל', () => {
    for (const raw of ['', '   ', '!!!', '😈😈', '\n\n']) {
      expect(name(raw), JSON.stringify(raw)).toBe(FALLBACK_NAME);
    }
  });

  it('אורך קצוב', () => {
    expect(name('א'.repeat(200)).length).toBeLessThanOrEqual(MAX_NICKNAME);
  });
});

describe('הסינון מחובר לקישור האתגר', () => {
  /**
   * זה מה שסוגר את המעגל: השדה היחיד בקישור שאינו מספר עובר דרך
   * הסינון. אם מישהו ינתק את החיבור הזה, הערוץ נפתח מחדש.
   */
  it('sanitizeNickname מפעיל את אותו סינון', () => {
    expect(sanitizeNickname('בוא נריב')).toBe('בוא');
    expect(sanitizeNickname('שרמוטה')).toBe(FALLBACK_NAME);
    expect(sanitizeNickname('0501234567')).toBe(FALLBACK_NAME);
    expect(sanitizeNickname('אורי')).toBe('אורי');
  });
});

describe('עזרי הנרמול', () => {
  it('מסיר סימנים ומיישר אותיות סופיות', () => {
    expect(normalizeForFilter('f.u.c.k')).toBe('fuck');
    expect(normalizeForFilter('שלום')).toBe('שלומ');
  });

  it('hasBlockedWord עונה על הצורה המנורמלת', () => {
    expect(hasBlockedWord('FUCK')).toBe(true);
    expect(hasBlockedWord('אורי')).toBe(false);
  });
});
