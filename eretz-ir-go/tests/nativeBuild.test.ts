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
