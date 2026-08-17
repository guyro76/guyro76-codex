import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { DEVICES, MAX_FRAME_WIDTH, availableWidth, previewScale } from '../src/lib/devicePreview';

const src = readFileSync(
  resolve(__dirname, '../src/components/DevicePreview.tsx'),
  'utf8'
);

describe('תצוגה מקדימה במכשירים', () => {
  it('שלושת המכשירים קיימים ובסדר עולה של רוחב', () => {
    expect(DEVICES.map((d) => d.id)).toEqual(['phone', 'tablet', 'laptop']);
    const widths = DEVICES.map((d) => d.width);
    expect([...widths].sort((a, b) => a - b)).toEqual(widths);
  });

  it('בטלפון צר המסגרת מוקטנת ונכנסת לרוחב הזמין', () => {
    const phoneScreen = 390;
    for (const device of DEVICES) {
      const scale = previewScale(device, phoneScreen);
      expect(device.width * scale).toBeLessThanOrEqual(availableWidth(phoneScreen) + 0.001);
    }
  });

  it('לעולם לא מנפחים מכשיר קטן מעבר לגודלו האמיתי', () => {
    // מסך רחב במיוחד: טלפון עדיין יוצג 390 ולא נמתח
    expect(previewScale(DEVICES[0], 2560)).toBe(1);
  });

  it('הרוחב הזמין לא חורג מרוחב הכרטיס גם על מסך ענק', () => {
    expect(availableWidth(3840)).toBe(MAX_FRAME_WIDTH);
  });

  it('גם בחלון זעיר נשאר קנה מידה חיובי ושפוי', () => {
    for (const width of [0, 120, 320]) {
      for (const device of DEVICES) {
        const scale = previewScale(device, width);
        expect(scale).toBeGreaterThan(0);
        expect(scale).toBeLessThanOrEqual(1);
      }
    }
  });

  /**
   * המסגרת חייבת להישאר מאותו מקור. כתובת חיצונית כאן הייתה מכניסה
   * אתר זר אל תוך המשחק — בדיוק מה שה-CSP נועד למנוע.
   */
  it('המסגרת טוענת את המשחק עצמו ולא כתובת חיצונית', () => {
    expect(src).toContain('src="./"');
    expect(src).not.toMatch(/src=["']https?:/);
  });

  it('לכל מסגרת יש כותרת נגישה', () => {
    expect(src).toMatch(/title=\{`תצוגה מקדימה/);
  });
});
