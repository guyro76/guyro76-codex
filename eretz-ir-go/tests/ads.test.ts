import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { AD_HOLD_SECONDS, adProvider, houseAdProvider, shouldShowAd } from '../src/lib/ads';
import { TIERS, TIER_ORDER, capabilitiesFor } from '../src/lib/tiers';

const root = resolve(__dirname, '..');
const read = (p: string) => readFileSync(resolve(root, p), 'utf8');

describe('פרסומות', () => {
  /**
   * הכלל המרכזי: מי שמשלם לא רואה פרסומת. אם זה נשבר, הלקוח משלם
   * בדיוק בשביל הדבר שהוא ממשיך לקבל — וזו ביקורת מוצדקת בחנות.
   */
  it('רק החבילה החינמית כוללת פרסומות', () => {
    expect(TIERS.free.ads).toBe(true);
    for (const tier of TIER_ORDER.filter((t) => t !== 'free')) {
      expect(TIERS[tier].ads, `${tier} מציג פרסומות`).toBe(false);
      expect(shouldShowAd(TIERS[tier].ads, 'before-round')).toBe(false);
      expect(shouldShowAd(TIERS[tier].ads, 'after-round')).toBe(false);
    }
  });

  it('שתי נקודות ההצגה הן אלה שהוגדרו', () => {
    expect(shouldShowAd(true, 'before-round')).toBe(true);
    expect(shouldShowAd(true, 'after-round')).toBe(true);
  });

  /**
   * Google Play Families אוסר פרסום מותאם אישית לילדים, ולכן אין
   * כאן דגל שמאפשר להדליק אותו. הבדיקה נועלת את היעדרו.
   */
  it('אין בקוד שום מסלול לפרסום מותאם אישית', () => {
    const ads = read('src/lib/ads.ts');
    for (const forbidden of ['personalis', 'personaliz', 'idfa', 'advertisingId', 'gaid']) {
      expect(ads.toLowerCase(), `נמצא ${forbidden}`).not.toContain(forbidden.toLowerCase());
    }
  });

  /** לא נשלח שום נתון על הילד — הבקשה מקבלת רק את מיקום ההצגה */
  it('בקשת המודעה לא מקבלת שום מידע על המשתמש', async () => {
    const ad = await houseAdProvider.request('before-round');
    expect(ad).not.toBeNull();
    // חתימת הפונקציה מקבלת ארגומנט אחד בלבד: המיקום
    expect(houseAdProvider.request.length).toBe(1);
  });

  it('ברירת המחדל היא מודעת בית, ולא רשת חיצונית', () => {
    expect(adProvider().name).toBe('house');
  });

  /** השהיה לפני ההמשך — מונעת לחיצה רצופה שנוחתת על המודעה */
  it('יש השהיה קצרה לפני שאפשר להמשיך', () => {
    expect(AD_HOLD_SECONDS).toBeGreaterThanOrEqual(3);
    expect(AD_HOLD_SECONDS).toBeLessThanOrEqual(10);
  });

  it('הפרסומת מסומנת כפרסומת ומופרדת מכפתור ההמשך', () => {
    const cmp = read('src/components/AdBreak.tsx');
    expect(cmp).toContain('פרסומת');
    expect(cmp).toContain('ad-continue');
    const css = read('src/styles/global.css');
    expect(css).toMatch(/\.ad-continue\s*\{[^}]*margin-top/);
  });
});

describe('מה יש בגרסה החינמית', () => {
  /** הדרישה: משחק עצמי בסיסי בלבד */
  it('בלי פאזלים, בלי פרסים, בלי משחק עם אחרים ובלי משחקי ביניים', () => {
    expect(TIERS.free.puzzles).toBe(false);
    expect(TIERS.free.rewards).toBe(false);
    expect(TIERS.free.multiplayer).toBe(false);
    expect(TIERS.free.miniGames).toBe(false);
    expect(TIERS.free.onlineLeaderboard).toBe(false);
    expect(TIERS.free.cloudSync).toBe(false);
  });

  it('כל החבילות בתשלום כוללות את כולם', () => {
    for (const tier of TIER_ORDER.filter((t) => t !== 'free')) {
      expect(TIERS[tier].puzzles, tier).toBe(true);
      expect(TIERS[tier].rewards, tier).toBe(true);
      expect(TIERS[tier].multiplayer, tier).toBe(true);
    }
  });

  /** הדרישה: שיהיה רשום לשחקן שסוג המשחק הוא גרסת חינם */
  it('מסך הבית מציג לשחקן שהוא בגרסת חינם', () => {
    const home = read('src/screens/Home.tsx');
    expect(home).toContain('free-badge');
    expect(home).toContain('גרסת חינם');
  });

  it('התפריט לא מוביל למסכים שאין בגרסה הזו', () => {
    const home = read('src/screens/Home.tsx');
    expect(home).toContain('caps.puzzles ?');
    expect(home).toContain('caps.rewards ?');
  });
});

describe('למי בכלל נאכפות החבילות', () => {
  /**
   * בבנייה שאין בה שרת חשבונות אי אפשר לקנות כלום, ולכן גם אין מה
   * לנעול. זו הבטחה ותיקה של המשחק ("המשחק המקומי אף פעם לא היה
   * תלוי בענן") ולא פרצה: הערך נקבע בזמן בנייה ממשתני סביבה ואי
   * אפשר לשנות אותו מהדפדפן.
   */
  it('בלי שרת חשבונות — המשחק פתוח ובלי פרסומות', () => {
    const caps = capabilitiesFor(null, false);
    expect(caps.ads).toBe(false);
    expect(caps.puzzles).toBe(true);
    expect(caps.multiplayer).toBe(true);
  });

  it('עם שרת חשבונות ובלי חשבון — הגרסה החינמית עם פרסומות', () => {
    const caps = capabilitiesFor(null, true);
    expect(caps.id).toBe('free');
    expect(caps.ads).toBe(true);
  });

  it('עם חשבון בתשלום — בלי פרסומות', () => {
    const caps = capabilitiesFor({ tier: 'bronze', role: 'user' }, true);
    expect(caps.id).toBe('bronze');
    expect(caps.ads).toBe(false);
  });

  it('מנהל מערכת מקבל את הכול', () => {
    expect(capabilitiesFor({ tier: 'free', role: 'admin' }, true).id).toBe('gold');
  });

  /**
   * שמירה מפני רגרסיה: אם מישהו יחזיר את חישוב היכולות אל תוך
   * המסך, ההבחנה הזו תישבר בשקט.
   */
  it('המסכים שואבים את היכולות ממקום אחד', () => {
    const store = read('src/store/authStore.ts');
    expect(store).toContain('capabilitiesFor(account, authConfigured())');
  });
});

describe('לקוח משלם לא רואה מודעה מהבהבת', () => {
  /**
   * באג אמיתי שנמנע כאן: בטעינה הראשונה החשבון עוד לא נטען, ולכן
   * היכולות הן זמנית של הגרסה החינמית. מסך שמחליט על פרסומת באותו
   * רגע היה מציג מודעה למי ששילם.
   */
  it('ההחלטה על פרסומת ממתינה לטעינת החשבון', () => {
    const store = read('src/store/authStore.ts');
    expect(store).toMatch(/export function useAdsEnabled\(\): boolean \{[\s\S]*?return ready && caps\.ads;/);
  });

  it('המסכים משתמשים בהחלטה הזו ולא ב-caps.ads ישירות', () => {
    for (const file of ['src/screens/LetterDraw.tsx', 'src/screens/RoundResults.tsx']) {
      const src = read(file);
      expect(src, file).toContain('useAdsEnabled');
      expect(src, file).not.toContain('caps.ads');
    }
  });

  /** הפרסומת שאחרי הסיבוב באה *לפני* הניקוד — גם למי שמקשיב */
  it('הניקוד לא מוכרז בזמן הפרסומת', () => {
    const src = read('src/screens/RoundResults.tsx');
    expect(src).toMatch(/useEffect\(\(\) => \{\s*if \(adPending\) return;/);
  });
});
