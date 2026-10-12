import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(__dirname, '..');
const read = (p: string) => readFileSync(resolve(root, p), 'utf8');

/**
 * בלי פרויקט נייטיבי אין הגשה לחנות — PWA לא נכנס ל-Google Play.
 * הבדיקות כאן נועלות את מה שקל לשבור בשקט: מזהה האפליקציה, שם
 * התצוגה, ורמת ה-API שגוגל דורשת.
 */
describe('בנייה נייטיבית', () => {
  const config = JSON.parse(read('capacitor.config.json')) as {
    appId: string;
    appName: string;
    webDir: string;
  };

  it('פרויקט אנדרואיד קיים במאגר', () => {
    expect(existsSync(resolve(root, 'android/app/build.gradle'))).toBe(true);
    expect(existsSync(resolve(root, 'android/app/src/main/AndroidManifest.xml'))).toBe(true);
  });

  /**
   * מזהה האפליקציה נצרב בחנות בהגשה הראשונה ואי אפשר לשנות אותו
   * לעולם. שינוי כאן אחרי פרסום פירושו אפליקציה חדשה לגמרי, בלי
   * המשתמשים ובלי הביקורות.
   */
  it('מזהה האפליקציה זהה בהגדרה ובפרויקט', () => {
    expect(config.appId).toBe('com.eretzir.go');
    expect(read('android/app/build.gradle')).toContain(`applicationId "${config.appId}"`);
  });

  it('שם התצוגה בעברית', () => {
    const strings = read('android/app/src/main/res/values/strings.xml');
    expect(strings).toContain(config.appName);
    expect(config.appName).toMatch(/[א-ת]/);
  });

  /**
   * גוגל מחייבת רמת API מינימלית להגשות חדשות, והיא עולה כל שנה.
   * פרויקט שנשאר מאחור נדחה בהעלאה, וזה מתגלה בדיוק ברגע הכי גרוע.
   */
  it('רמת ה-API עומדת בדרישת Play', () => {
    const vars = read('android/variables.gradle');
    const target = Number(vars.match(/targetSdkVersion\s*=\s*(\d+)/)?.[1] ?? 0);
    expect(target).toBeGreaterThanOrEqual(35);
  });

  it('התוצר הנייטיבי נבנה מ-dist, ותוצרי הבנייה לא נכנסים למאגר', () => {
    expect(config.webDir).toBe('dist');
    const ignore = read('android/.gitignore');
    expect(ignore).toContain('app/src/main/assets/public');
  });

  it('יש פקודה שמסנכרנת את האתר לפרויקט הנייטיבי', () => {
    const pkg = JSON.parse(read('package.json')) as { scripts: Record<string, string> };
    expect(pkg.scripts['native:sync']).toContain('cap sync');
    // הבנייה חייבת לרוץ לפניה, אחרת מסונכרן תוצר ישן
    expect(pkg.scripts['native:sync']).toMatch(/build.*cap sync/);
  });
});

/**
 * חתימת ה-release היא השלב שבו "האפליקציה מוכנה" נפגש עם המציאות:
 * Google Play פשוט לא מקבל AAB לא חתום.
 *
 * שתי סכנות הפוכות, ושתיהן נבדקות כאן. האחת היא בנייה לא חתומה
 * שמגיעה עד ההעלאה ורק שם נדחית; השנייה, החמורה, היא keystore
 * שנדחף למאגר. keystore שדלף אינו ניתן להחלפה אחרי פרסום — Play
 * מזהה גרסאות של אותה אפליקציה לפי החתימה — ולכן דחיפה אחת כזו
 * נועלת את הפרויקט על מפתח חשוף לכל החיים.
 */
describe('חתימת release לאנדרואיד', () => {
  const gradle = read('android/app/build.gradle');

  it('יש signingConfig ל-release', () => {
    expect(gradle).toMatch(/signingConfigs\s*\{/);
    expect(gradle).toMatch(/signingConfig signingConfigs\.release/);
  });

  it('הסודות נקראים מקובץ מוחרג או ממשתני סביבה, ולא כתובים בקוד', () => {
    expect(gradle).toContain('keystore.properties');
    expect(gradle).toMatch(/System\.getenv\('ANDROID_KEYSTORE_PASSWORD'\)/);
    // סיסמה בטקסט גלוי היא בדיוק מה שאסור
    expect(gradle).not.toMatch(/storePassword\s+["'][^"'$]/);
    expect(gradle).not.toMatch(/keyPassword\s+["'][^"'$]/);
  });

  it('קבצי keystore מוחרגים מ-git', () => {
    const ignore = read('android/.gitignore');
    for (const pattern of ['keystore.properties', '*.jks', '*.keystore']) {
      expect(ignore.split('\n').some((l) => l.trim() === pattern), `חסר: ${pattern}`).toBe(true);
    }
  });

  it('אין אף keystore שנכנס למאגר בטעות', () => {
    for (const path of [
      'android/keystore.properties',
      'android/app/release.jks',
      'android/app/eretz-ir-go.jks'
    ]) {
      expect(existsSync(resolve(root, path)), `קובץ סודי במאגר: ${path}`).toBe(false);
    }
  });

  /** הגרסה שהמשתמש רואה צריכה להיות אותה גרסה בכל מקום */
  it('versionName זהה לגרסה ב-package.json', () => {
    const pkg = JSON.parse(read('package.json')) as { version: string };
    expect(gradle).toContain(`versionName "${pkg.version}"`);
  });
});
