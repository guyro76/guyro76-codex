import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { SKINS } from '../src/data/skins';

/**
 * ניגודיות צבעים, נמדדת מתוך גיליון הסגנונות עצמו.
 *
 * הבדיקה הזו נולדה אחרי שעיצוב חדש הבהיר את משטחי הזכוכית והפיל את
 * האדום מתחת לתקן בלי שאיש שם לב. מעכשיו כל שינוי צבע שמוריד טקסט
 * מתחת ל-WCAG AA נופל כאן, ולא אצל ילד שמנסה לקרוא למה התשובה נפסלה.
 */
const css = readFileSync(resolve(__dirname, '..', 'src/styles/global.css'), 'utf8');

function token(name: string): string {
  const m = css.match(new RegExp(`--${name}:\\s*([^;]+);`));
  if (!m) throw new Error(`הטוקן --${name} לא נמצא ב-global.css`);
  return m[1].trim();
}

function hex(h: string): [number, number, number] {
  const c = h.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(c.slice(i, i + 2), 16)) as [number, number, number];
}

type RGB = [number, number, number];

function luminance([r, g, b]: RGB): number {
  const f = (v: number) => {
    const x = v / 255;
    return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function over(fg: RGB, alpha: number, bg: RGB): RGB {
  return fg.map((c, i) => Math.round(c * alpha + bg[i] * (1 - alpha))) as RGB;
}

function ratio(a: RGB, b: RGB): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * הרקע הקשה ביותר לקריאה: משטח הזכוכית בנקודה הבהירה ביותר שלו.
 * אם טקסט עובר כאן, הוא עובר בכל מקום אחר במשחק.
 */
const GLASS_PEAK_ALPHA = 0.13;
const pageBg = hex(token('bg-mid'));
const glass = over([255, 255, 255], GLASS_PEAK_ALPHA, pageBg);

const AA_NORMAL = 4.5;

describe('ניגודיות צבעים — WCAG AA', () => {
  it('הזכוכית לא בהירה יותר ממה שהבדיקה מניחה', () => {
    // אם מישהו יבהיר את --glass-fill, הערך כאן חייב לעלות איתו
    const fill = css.match(/--glass-fill:\s*([^;]+);/)?.[1] ?? '';
    const alphas = [...fill.matchAll(/rgba\(255,\s*255,\s*255,\s*([\d.]+)\)/g)].map((m) => Number(m[1]));
    expect(alphas.length).toBeGreaterThan(0);
    expect(Math.max(...alphas)).toBeLessThanOrEqual(GLASS_PEAK_ALPHA);
  });

  it('טקסט רגיל נקרא על הזכוכית', () => {
    expect(ratio(hex(token('text')), glass)).toBeGreaterThanOrEqual(AA_NORMAL);
  });

  it('טקסט עמום נקרא על הזכוכית', () => {
    const dim = token('text-dim').match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
    expect(dim).not.toBeNull();
    const rgb: RGB = [Number(dim![1]), Number(dim![2]), Number(dim![3])];
    expect(ratio(over(rgb, Number(dim![4]), glass), glass)).toBeGreaterThanOrEqual(AA_NORMAL);
  });

  it('קישורים נקראים על הזכוכית — הכחול־כהה של הדפדפן לא', () => {
    // הבדיקה הזו נולדה מקישור שנשאר בצבע ברירת המחדל ולא נקרא כלל
    expect(ratio(hex(token('link')), glass)).toBeGreaterThanOrEqual(AA_NORMAL);
    expect(css).toMatch(/\na\s*\{[^}]*color:\s*var\(--link\)/);
  });

  it('צבעי מצב — נכון, שגוי, זהב — כולם עוברים', () => {
    for (const name of ['ok', 'bad', 'gold']) {
      const r = ratio(hex(token(name)), glass);
      expect(r, `--${name} נותן ${r.toFixed(2)} על הזכוכית`).toBeGreaterThanOrEqual(AA_NORMAL);
    }
  });

  it('הקרדיט בסגול חציל נקרא על רקע הדף', () => {
    expect(ratio(hex(token('eggplant')), hex(token('bg-deep')))).toBeGreaterThanOrEqual(AA_NORMAL);
  });
});

/**
 * כל ערכת צבעים נבדקת באותם קריטריונים בדיוק.
 *
 * ערכה יפה שאי אפשר לקרוא בה היא באג, לא עניין של טעם — וילד לא
 * יודע לומר "הניגודיות נמוכה", הוא פשוט מפסיק לשחק. בלי הבדיקה
 * הזו, ערכה שנוסיף בעתיד תוכל להיכנס ולשבור קריאות בלי שאיש ישים
 * לב, כי ברירת המחדל תמשיך להיראות תקינה.
 */
describe('ניגודיות בכל ערכות הצבע', () => {
  for (const skin of SKINS) {
    const bg = hex(skin.vars['--bg-mid']);
    const glassOnSkin = over([255, 255, 255], GLASS_PEAK_ALPHA, bg);

    it(`ערכת "${skin.name}" — טקסט רגיל נקרא`, () => {
      expect(ratio(hex(token('text')), glassOnSkin)).toBeGreaterThanOrEqual(AA_NORMAL);
    });

    it(`ערכת "${skin.name}" — קישורים וצבעי מצב נקראים`, () => {
      for (const key of ['--link', '--gold']) {
        const value = skin.vars[key];
        expect(value, `${key} חסר בערכה ${skin.id}`).toBeTruthy();
        const r = ratio(hex(value), glassOnSkin);
        expect(r, `${key} בערכה "${skin.name}" נותן ${r.toFixed(2)}`).toBeGreaterThanOrEqual(AA_NORMAL);
      }
    });

    it(`ערכת "${skin.name}" — הקרדיט נקרא על רקע הדף`, () => {
      // הקרדיט יושב על רקע הדף עצמו ולא על קלף זכוכית, ולכן הוא
      // נמדד מול המשטח שבו הוא באמת מוצג
      const r = ratio(hex(skin.vars['--eggplant']), hex(skin.vars['--bg-deep']));
      expect(r, `--eggplant בערכה "${skin.name}" נותן ${r.toFixed(2)}`).toBeGreaterThanOrEqual(AA_NORMAL);
    });

    it(`ערכת "${skin.name}" — ירוק ואדום שומרים על משמעותם ונקראים`, () => {
      // אלה לא משתנים בין ערכות בכוונה: ירוק תמיד "נכון", אדום תמיד "לא"
      for (const name of ['ok', 'bad']) {
        expect(ratio(hex(token(name)), glassOnSkin)).toBeGreaterThanOrEqual(AA_NORMAL);
      }
    });
  }

  it('לכל ערכה יש שם, אייקון, דוגמית וכל המשתנים', () => {
    const required = Object.keys(SKINS[0].vars);
    for (const skin of SKINS) {
      expect(skin.name.length, skin.id).toBeGreaterThan(1);
      expect(skin.icon.length, skin.id).toBeGreaterThan(0);
      expect(skin.swatch, skin.id).toHaveLength(3);
      for (const key of required) {
        expect(skin.vars[key], `${key} חסר בערכה ${skin.id}`).toBeTruthy();
      }
    }
  });

  it('אין שתי ערכות עם אותו מזהה', () => {
    const ids = SKINS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
