import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * בדיקות שמירה על ההבטחות שהאפליקציה מצהירה עליהן: כותרות האבטחה,
 * ועמוד מדיניות הפרטיות שחנויות האפליקציות דורשות.
 *
 * הן קיימות כדי שאף שינוי עתידי לא ישמיט בשקט את ה-CSP או ישאיר את
 * המדיניות בלי הסעיפים שנדרשים לאישור בחנות.
 */
const root = resolve(__dirname, '..');
/** שורש ה-monorepo, מעל ספריית המשחק */
const root2 = resolve(__dirname, '..', '..');
const vercel = JSON.parse(readFileSync(resolve(root, 'vercel.json'), 'utf8')) as {
  headers: { source: string; headers: { key: string; value: string }[] }[];
  git?: { deploymentEnabled?: Record<string, boolean> };
};
const netlify = readFileSync(resolve(root, 'netlify.toml'), 'utf8');
const policy = readFileSync(resolve(root, 'public/privacy.html'), 'utf8');
const terms = readFileSync(resolve(root, 'public/terms.html'), 'utf8');

const globalHeaders = vercel.headers.find((h) => h.source === '/(.*)')!;
const header = (key: string) => globalHeaders.headers.find((h) => h.key === key)?.value ?? '';

/**
 * המקורות החיצוניים שהמשחק באמת פונה אליהם, נגזרים מהקוד עצמו ולא
 * מרשימה שנכתבת ביד. כל מודול שמדבר עם הרשת מופיע כאן, וכתובת חדשה
 * שתיכנס אליו תופיע אוטומטית גם בבדיקות שמתחתיו.
 */
const NETWORK_MODULES = ['src/lib/verifyOnline.ts', 'src/lib/openverse.ts'];
const fetchedHosts = [
  ...new Set(
    NETWORK_MODULES.flatMap((f) =>
      [...readFileSync(resolve(root, f), 'utf8').matchAll(/https:\/\/([a-z0-9.-]+)\//g)].map((m) => m[1])
    )
  )
];

describe('כותרות אבטחה', () => {
  it('כל הכותרות החיוניות מוגדרות', () => {
    for (const key of [
      'Content-Security-Policy',
      'X-Content-Type-Options',
      'X-Frame-Options',
      'Referrer-Policy',
      'Permissions-Policy',
      'Cross-Origin-Opener-Policy'
    ]) {
      expect(header(key), `חסרה הכותרת ${key}`).not.toBe('');
    }
  });

  it('ה-CSP נועל את המשחק למקורות שלו ולוויקיפדיה בלבד', () => {
    const csp = header('Content-Security-Policy');
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("connect-src 'self' https://he.wikipedia.org");
    expect(csp).toContain("object-src 'none'");
    // 'self' ולא 'none': התצוגה המקדימה בניהול מסגרת את המשחק מאותו מקור.
    // המסגור מצד אתר זר — הסיכון האמיתי — נשאר חסום. ראו את הבדיקה הייעודית למטה.
    expect(csp).toContain("frame-ancestors 'self'");
    expect(csp).toContain("base-uri 'self'");
  });

  it('ה-CSP לא מרשה סקריפטים חיצוניים או inline', () => {
    const csp = header('Content-Security-Policy');
    const scriptSrc = csp.split(';').find((p) => p.trim().startsWith('script-src')) ?? '';
    expect(scriptSrc).toContain("'self'");
    expect(scriptSrc).not.toContain('unsafe-inline');
    expect(scriptSrc).not.toContain('unsafe-eval');
    expect(scriptSrc).not.toContain('http');
  });

  it('מצלמה, מיקרופון ומיקום חסומים ברמת הדפדפן', () => {
    const pp = header('Permissions-Policy');
    for (const feature of ['camera=()', 'microphone=()', 'geolocation=()']) {
      expect(pp).toContain(feature);
    }
  });

  it('Netlify ו-Vercel מגדירים את אותו CSP — שלא יהיה הבדל בין הפלטפורמות', () => {
    expect(netlify).toContain(header('Content-Security-Policy'));
  });
});

/**
 * מנוי בתשלום מחייב תנאי שימוש שמסדירים חידוש אוטומטי, ביטול והחזרים.
 * אלה סעיפים שהחנויות בודקות בפועל, ובלעדיהם ההגשה נדחית.
 */
describe('תנאי השימוש', () => {
  it('בעברית ובכיוון RTL', () => {
    expect(terms).toContain('lang="he"');
    expect(terms).toContain('dir="rtl"');
  });

  it('מסדירים את כל מה שנוגע למנוי', () => {
    for (const section of ['חידוש אוטומטי', 'ביטול', 'החזרים', 'שינוי מחיר']) {
      expect(terms, `חסר בתנאים: ${section}`).toContain(section);
    }
  });

  it('אומרים במפורש שאפשר למחוק את החשבון מתוך האפליקציה', () => {
    expect(terms).toMatch(/למחוק את החשבון מתוך האפליקציה/);
  });

  it('מפנים לביטול דרך החנות ולא אלינו', () => {
    expect(terms).toMatch(/הגדרות החנות/);
  });

  it('מציינים דרך יצירת קשר', () => {
    expect(terms).toMatch(/mailto:[^"]+@[^"]+/);
  });

  it('נגישים מתוך האפליקציה ולא רק מדף החנות', () => {
    const screen = readFileSync(resolve(root, 'src/screens/Privacy.tsx'), 'utf8');
    expect(screen).toContain('/terms.html');
  });
});

describe('מדיניות הפרטיות הציבורית', () => {
  it('בעברית ובכיוון RTL', () => {
    expect(policy).toContain('lang="he"');
    expect(policy).toContain('dir="rtl"');
  });

  it('כוללת את הסעיפים שחנויות האפליקציות דורשות', () => {
    for (const section of ['עודכן לאחרונה', 'COPPA', 'GDPR-K', 'יצירת קשר', 'מחיקת מידע']) {
      expect(policy, `חסר בעמוד: ${section}`).toContain(section);
    }
  });

  it('מציינת דרך יצירת קשר אמיתית', () => {
    expect(policy).toMatch(/mailto:[^"]+@[^"]+/);
  });

  it('מצהירה במפורש שאין שימוש בשירותי AI חיצוניים', () => {
    expect(policy).toContain('OpenAI');
    expect(policy).toContain('Anthropic');
    expect(policy).toMatch(/אינן נשלחות/);
  });

  it('מגלה שגם כתובת ה-IP מגיעה לוויקימדיה — ולא רק המילה', () => {
    expect(policy).toContain('IP');
    expect(policy).toContain('ויקימדיה');
  });

  it('לא מבטיחה הבטחות שהקוד לא מקיים', () => {
    // מרגע שיש חשבונות, אסור שהמדיניות תמשיך לטעון שאין שרת ואין מייל
    expect(policy).not.toContain('אין לנו שרת');
    expect(policy).not.toContain('אין חשבון משתמש');
    // המדיניות הצהירה פעם שאין פרסומות בכלל. מרגע שיש פרסומות
    // בגרסה החינמית, ההצהרה ההפוכה היא הבעיה — ולכן נבדק שהיא
    // אומרת את האמת החדשה, ולא שהיא שותקת.
    expect(policy).toContain('פרסומות');
    expect(policy).toMatch(/אינן מותאמות אישית|שאינו מותאם אישית|לא מותאמות אישית/);
  });

  it('מפרטת מה נשמר בשרת ומה נשאר במכשיר', () => {
    expect(policy).toContain('Supabase');
    expect(policy).toContain('כתובת מייל');
    expect(policy).toMatch(/לא עולים לשרת|המכשיר בלבד/);
  });

  it('מסבירה את שלוש דרכי הכניסה ואת מה שלא מגיע אלינו', () => {
    for (const s of ['Google', 'Apple', 'hash']) expect(policy).toContain(s);
  });

  it('דורשת הורה ליצירת חשבון לילד מתחת ל-13', () => {
    expect(policy).toMatch(/מתחת לגיל 13/);
    expect(policy).toMatch(/הורה או אפוטרופוס/);
  });

  /**
   * הענף gh-pages מכיל תוצרי בנייה בלבד. ספריית השורש של הפרויקט
   * ב-Vercel ("eretz-ir-go") לא קיימת בו, ולכן כל דחיפה יצרה פריסה
   * אדומה לצד הפריסה התקינה מ-main. זה לא שבר את האתר, אבל הפך את
   * רשימת הפריסות לבלתי קריאה — ובמצב כזה כשל אמיתי נבלע ברעש.
   *
   * לחסימה יש שני חלקים, ושניהם נדרשים:
   *  1. ההצהרה כאן ב-vercel.json שבמאגר.
   *  2. עותק שלה שנוצר בתוך תוצר הבנייה עצמו, כי Vercel נכשל על
   *     ספריית השורש החסרה עוד לפני שהוא מגיע לקרוא את הקובץ שבמאגר.
   * הבדיקה מוודאת את שניהם, אחרת מספיק שאחד ייעלם והפריסות האדומות
   * יחזרו בלי שאיש ישים לב.
   */
  /**
   * מסגור: צד שלישי חסום, אנחנו עצמנו מותרים.
   *
   * ההקלה הזו נדרשת לתצוגה המקדימה במסך הניהול, שמריצה את המשחק
   * עצמו ב-iframe מאותו מקור. הסיכון האמיתי בקליקג'קינג הוא אתר זר
   * שמסגר אותנו כדי לגנוב לחיצות — וזה נשאר חסום לחלוטין. אם מישהו
   * ישנה את זה ל-'*' או יסיר את הכותרת, הבדיקה תיפול.
   */
  it('רק אנחנו רשאים למסגר את המשחק — לא אף אתר אחר', () => {
    expect(header('Content-Security-Policy')).toContain("frame-ancestors 'self'");
    expect(header('Content-Security-Policy')).not.toContain('frame-ancestors *');
    expect(header('X-Frame-Options')).toBe('SAMEORIGIN');
    expect(netlify).toContain("frame-ancestors 'self'");
    expect(netlify).toContain('X-Frame-Options = "SAMEORIGIN"');
  });

  /**
   * המאגר הזה הוא monorepo: לצד המשחק יושבים בו פרויקטים אחרים
   * שלכל אחד מהם vercel.json משלו. רק המשחק אמור להיפרס אוטומטית.
   *
   * Vercel קורא את vercel.json מספריית השורש של הפרויקט, ולכן ההצהרה
   * בשורש המאגר לא חלה על פרויקט שספריית השורש שלו היא תת-ספרייה.
   * הדגל חייב להופיע בשני המקומות.
   */
  it('רק המשחק נפרס אוטומטית — שאר הפרויקטים במאגר לא', () => {
    const root = JSON.parse(readFileSync(resolve(root2, 'vercel.json'), 'utf8')) as {
      git?: { deploymentEnabled?: unknown };
    };
    const paprika = JSON.parse(readFileSync(resolve(root2, 'paprika-app/vercel.json'), 'utf8')) as {
      git?: { deploymentEnabled?: unknown };
    };
    expect(root.git?.deploymentEnabled).toBe(false);
    expect(paprika.git?.deploymentEnabled).toBe(false);
  });

  /**
   * הענף gh-pages מכיל תוצרי בנייה בלבד, ולכן אין בו Next.js ואין בו
   * את ספריית השורש של המשחק. **שני** פרויקטים ב-Vercel עוקבים אחרי
   * המאגר, ולכל אחד ספריית שורש אחרת:
   *
   *   eretz-ir-go    → ספריית השורש "eretz-ir-go"
   *   guyro76-codex  → שורש המאגר, framework=Next.js
   *
   * כל אחד מהם קורא vercel.json ממקום אחר, ולכן חסימה אחת לא מספיקה.
   * כשהייתה רק החסימה המקוננת, guyro76-codex המשיך לבנות את gh-pages
   * ונכשל ב-"No Next.js version detected" — מייל כושל על כל דחיפה.
   *
   * Vercel קורא את הקובץ **מתוך הענף שהוא פורס**, ולכן ההצהרה שבמאגר
   * לא חלה על gh-pages כלל: שני העותקים חייבים להיכתב לתוך התוצר.
   */
  /**
   * מקור ה-Pages של מאגר הוא או ענף או Actions — לא שניהם. היו כאן
   * שתי הדרכים במקביל, והמאגר מוגדר לשרת מהענף, ולכן ג'וב הפרסום
   * הרשמי נדחה על ידי סביבת github-pages לפני שהתחיל: הוא נכשל תוך
   * שתי שניות בלי אף צעד, ב-12 מתוך 12 הריצות על main, וייצר מייל
   * כישלון על כל דחיפה.
   *
   * נשארה הדרך שעובדת. הבדיקה מוודאת שלא יחזירו את השנייה לצידה בלי
   * לשנות קודם את מקור ה-Pages בהגדרות המאגר.
   */
  it('יש דרך אחת בלבד לפרוס ל-Pages — הענף, ולא גם Actions', () => {
    const workflow = readFileSync(
      resolve(root, '..', '.github/workflows/eretz-ir-go-pages.yml'),
      'utf8'
    );
    expect(workflow, 'הדרך שעובדת').toContain('gh-pages');
    // רק צעדים אמיתיים נחשבים. ההערות מסבירות דווקא *למה* הדרך השנייה
    // הוסרה, ואסור שהן ייחשבו כאילו היא חזרה.
    const uses = [...workflow.matchAll(/^\s*-?\s*uses:\s*(\S+)/gm)].map((m) => m[1]);
    for (const action of ['deploy-pages', 'upload-pages-artifact', 'configure-pages']) {
      expect(
        uses.some((u) => u.includes(action)),
        `${action} מחזיר את הכפילות שנכשלה`
      ).toBe(false);
    }
    expect(uses.length, 'לא נמצאו צעדי uses — הביטוי כנראה לא תפס').toBeGreaterThan(0);
  });

  it('אף פרויקט ב-Vercel לא מנסה לפרוס את ענף התוצרים gh-pages', () => {
    expect(vercel.git?.deploymentEnabled?.['gh-pages']).toBe(false);

    const workflow = readFileSync(
      resolve(root, '..', '.github/workflows/eretz-ir-go-pages.yml'),
      'utf8'
    );
    // העותק לפרויקט שספריית השורש שלו היא שורש המאגר
    expect(workflow).toMatch(/> vercel\.json$/m);
    // והעותק לפרויקט שספריית השורש שלו היא ספריית המשחק
    expect(workflow).toContain('mkdir -p eretz-ir-go');
    expect(workflow).toMatch(/> eretz-ir-go\/vercel\.json$/m);
    // שניהם — ולא אחד שנשאר אחרי ש"פישטו" את השני
    const blocks = workflow.match(/deploymentEnabled.*gh-pages.*false/g) ?? [];
    expect(blocks, 'צריך עותק לכל אחת משתי ספריות השורש').toHaveLength(2);
  });
});


/**
 * מקור חיצוני חדש נוגע בשלושה מקומות שקל לשכוח שניים מהם: ה-CSP
 * בשתי פלטפורמות הפריסה, והחסימה בבדיקות ה-E2E. כשנוסף Openverse
 * כמקור תמונות שני, המסלול המלא נפל על `ERR_TUNNEL_CONNECTION_FAILED`
 * — בקשה אמיתית שיצאה מהבדיקה החוצה. הבדיקות כאן נגזרות מהקוד, ולכן
 * הן ייפלו על המקור **הבא** לפני שהוא יגיע לייצור.
 */
describe('כל מקור חיצוני מוכרז ונחסם', () => {
  const helpers = readFileSync(resolve(root, 'e2e/helpers.ts'), 'utf8');

  it('נמצאו המקורות בקוד', () => {
    expect(fetchedHosts).toContain('he.wikipedia.org');
    expect(fetchedHosts).toContain('api.openverse.org');
  });

  it('כל מקור מופיע ב-connect-src בשתי הפלטפורמות', () => {
    const csp = header('Content-Security-Policy');
    for (const host of fetchedHosts) {
      expect(csp, `${host} חסר ב-CSP של Vercel`).toContain(`https://${host}`);
      expect(netlify, `${host} חסר ב-CSP של Netlify`).toContain(`https://${host}`);
    }
  });

  it('כל מקור נחסם בבדיקות ה-E2E ולא יוצא לרשת', () => {
    for (const host of fetchedHosts) {
      expect(helpers, `${host} אינו מיורט ב-e2e/helpers.ts`).toContain(host);
    }
  });
});
