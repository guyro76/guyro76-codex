import { describe, expect, it } from 'vitest';
import { MAP_H, MAP_W, PLACES, PLACE_COUNTS, project } from '../src/data/places';
import { WORLD_LAND_PATH } from '../src/data/worldPath';
import { placesFromAnswers } from '../src/components/WorldMap';
import { normalizeHebrew } from '../src/lib/hebrew';
import { SEED_ENTRIES } from '../src/data/seed';

describe('טבלת המקומות', () => {
  it('הקואורדינטות בטווח חוקי', () => {
    for (const [key, place] of PLACES) {
      expect(place.lat, key).toBeGreaterThanOrEqual(-90);
      expect(place.lat, key).toBeLessThanOrEqual(90);
      expect(place.lon, key).toBeGreaterThanOrEqual(-180);
      expect(place.lon, key).toBeLessThanOrEqual(180);
    }
  });

  it('אין מפתחות כפולים אחרי נורמליזציה', () => {
    expect(PLACES.size).toBe(
      new Set([...PLACES.values()].map((p) => normalizeHebrew(p.name))).size
    );
  });

  /**
   * הבדיקה החשובה כאן: לכל מדינה ועיר שקיימות במאגר הידע יש נקודה
   * במפה. בלעדיה ילד עונה נכון ולא רואה שום דבר נדלק — וזה נראה
   * כמו תקלה, לא כמו פיצ'ר.
   */
  it('לכל מדינה ועיר במאגר יש מיקום', () => {
    const missing: string[] = [];
    let checked = 0;
    for (const entry of SEED_ENTRIES) {
      if (!entry.c.includes('country') && !entry.c.includes('city')) continue;
      checked++;
      if (!PLACES.has(normalizeHebrew(entry.n))) missing.push(entry.n);
    }
    // שמירה מפני בדיקה שעוברת כי היא לא בדקה כלום
    expect(checked).toBeGreaterThan(200);
    expect(missing, `חסרים במפה: ${missing.join(', ')}`).toEqual([]);
  });

  it('ההטלה ממפה נכון את הפינות ואת המרכז', () => {
    expect(project(90, -180)).toEqual({ x: 0, y: 0 });
    expect(project(-90, 180)).toEqual({ x: MAP_W, y: MAP_H });
    expect(project(0, 0)).toEqual({ x: MAP_W / 2, y: MAP_H / 2 });
  });

  /**
   * ביקורת שפיות גיאוגרפית: מקומות ידועים חייבים ליפול ברבע הנכון
   * של המפה. טעות סימן בקו אורך או ברוחב שמה את ישראל באוקיינוס
   * השקט, וזה בדיוק סוג הבאג שנראה תקין בקוד.
   */
  it('מקומות מוכרים נופלים במקום ההגיוני על המפה', () => {
    const at = (name: string) => {
      const p = PLACES.get(normalizeHebrew(name))!;
      expect(p, name).toBeTruthy();
      return project(p.lat, p.lon);
    };

    const israel = at('ישראל');
    // ישראל: מזרחית לגריניץ' וצפונית לקו המשווה
    expect(israel.x).toBeGreaterThan(MAP_W / 2);
    expect(israel.y).toBeLessThan(MAP_H / 2);

    // אוסטרליה: מזרח ודרום
    const au = at('אוסטרליה');
    expect(au.x).toBeGreaterThan(MAP_W / 2);
    expect(au.y).toBeGreaterThan(MAP_H / 2);

    // ברזיל: מערב ודרום
    const br = at('ברזיל');
    expect(br.x).toBeLessThan(MAP_W / 2);
    expect(br.y).toBeGreaterThan(MAP_H / 2);

    // קנדה: מערב וצפון
    const ca = at('קנדה');
    expect(ca.x).toBeLessThan(MAP_W / 2);
    expect(ca.y).toBeLessThan(MAP_H / 2);

    // תל אביב וירושלים קרובות זו לזו — פחות מ-2 פיקסלים במפה
    const tlv = at('תל אביב');
    const jlm = at('ירושלים');
    expect(Math.hypot(tlv.x - jlm.x, tlv.y - jlm.y)).toBeLessThan(2);
  });

  it('נתיב היבשות תקין ולא ריק', () => {
    expect(WORLD_LAND_PATH.startsWith('M')).toBe(true);
    expect(WORLD_LAND_PATH.length).toBeGreaterThan(10_000);
    // רק פקודות מוחלטות פשוטות — כך אין תלות בכיוון או בנקודת התחלה
    expect(WORLD_LAND_PATH.replace(/[-\d.\sMLZ]/g, '')).toBe('');
  });

  it('הספירה הכוללת תואמת את הטבלה', () => {
    expect(PLACES.size).toBeLessThanOrEqual(PLACE_COUNTS.countries + PLACE_COUNTS.cities);
    expect(PLACE_COUNTS.countries).toBeGreaterThan(100);
  });
});

describe('נקודות מתוך האוסף', () => {
  const answer = (normalized: string, categoryId: string, timesUsed = 1) => ({
    normalized,
    categoryId,
    timesUsed
  });

  it('רק מדינות וערים הופכות לנקודות', () => {
    const found = placesFromAnswers([
      answer(normalizeHebrew('צרפת'), 'country'),
      answer(normalizeHebrew('אריה'), 'animal'),
      answer(normalizeHebrew('פריז'), 'city')
    ]);
    expect(found.map((f) => f.name).sort()).toEqual(['פריז', 'צרפת']);
  });

  it('מילה שאינה מקום מוכר לא מייצרת נקודה במקום שגוי', () => {
    expect(placesFromAnswers([answer(normalizeHebrew('גוגוגו'), 'city')])).toEqual([]);
  });

  it('אותו מקום פעמיים נספר פעם אחת ומצטבר', () => {
    const found = placesFromAnswers([
      answer(normalizeHebrew('רומא'), 'city', 2),
      answer(normalizeHebrew('רומא'), 'city', 3)
    ]);
    expect(found).toHaveLength(1);
    expect(found[0].times).toBe(5);
  });

  it('אוסף ריק מחזיר מפה ריקה ולא נופל', () => {
    expect(placesFromAnswers([])).toEqual([]);
  });
});
