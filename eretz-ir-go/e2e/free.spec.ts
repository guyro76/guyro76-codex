import { test, expect, type Page } from '@playwright/test';
import { stubWikipedia } from './helpers';
import { FREE_BASE_URL } from '../playwright.config';

/**
 * הגרסה החינמית — הפרסומות והנעילות, בזרימה אמיתית.
 *
 * למה קובץ נפרד ובכתובת אחרת: החבילות נאכפות רק בבנייה שיש בה
 * מערכת חשבונות (`capabilitiesFor`). הבנייה הרגילה שהבדיקות
 * האחרות רצות מולה היא בנייה מקומית בלי שרת, ולכן בה אין חבילות
 * ואין פרסומות — וזה בכוונה. הבנייה שעל פורט 4174 מוגדרת עם
 * משתני סביבה מזויפים, וכל מה שהיא מנסה לשלוח נענה כאן.
 *
 * החשבון שמוזרק הוא חשבון חינם אמיתי מבחינת האפליקציה: יש סשן, יש
 * שורת חשבון, והחבילה שלה היא `free`. זה בדיוק המצב של מי שהוריד
 * מהחנות ולא שילם.
 */
test.skip(Boolean(process.env.PW_BASE_URL), 'בנייה חיצונית — אין בניית חינם מקומית');

test.use({ baseURL: FREE_BASE_URL });

/** JWT לא חתום, נבנה בזמן ריצה כדי שלא ישב בקוד כמחרוזת ארוכה */
function fakeJwt(sub: string): string {
  const b64 = (o: unknown) =>
    Buffer.from(JSON.stringify(o)).toString('base64url');
  const exp = Math.floor(Date.now() / 1000) + 3600;
  return `${b64({ alg: 'none', typ: 'JWT' })}.${b64({ sub, role: 'authenticated', exp })}.e2e`;
}

async function signedInAsFree(page: Page): Promise<void> {
  const id = '00000000-0000-4000-8000-000000000001';
  const session = {
    access_token: fakeJwt(id),
    refresh_token: 'e2e-refresh',
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    user: {
      id,
      aud: 'authenticated',
      role: 'authenticated',
      email: 'free@e2e.test',
      app_metadata: {},
      user_metadata: {},
      created_at: new Date().toISOString()
    }
  };

  await page.addInitScript(
    ([key, value]) => {
      indexedDB.deleteDatabase('eretz-ir-go');
      // המפתח נקבע אצלנו ב-supabase.ts ולא על ידי הספרייה, ולכן
      // הוא יציב: אם מישהו ישנה אותו, הבדיקה הזו תיפול בקול רם
      localStorage.setItem(key as string, value as string);
    },
    ['eretz-ir-go-auth', JSON.stringify(session)]
  );

  await stubWikipedia(page);

  // כל מה שהאפליקציה מנסה לשלוח לשרת החשבונות נענה כאן. שורת
  // החשבון היא `free` — זו כל ההגדרה של "מי שלא שילם".
  await page.route('**e2e-free.test/**', (route) => {
    const url = route.request().url();
    const json = (body: unknown) =>
      route.fulfill({
        contentType: 'application/json',
        headers: { 'access-control-allow-origin': '*' },
        body: JSON.stringify(body)
      });
    if (url.includes('/rpc/my_account')) {
      return json([
        {
          id,
          email: 'free@e2e.test',
          display_name: 'אורח',
          role: 'user',
          tier: 'free',
          tier_expires_at: null
        }
      ]);
    }
    if (url.includes('/auth/v1/settings')) return json({ external: {} });
    return json({});
  });
}

/**
 * מהמסך הראשון ועד הרגע שאחרי "מתחילים!".
 *
 * `rounds` נבחר במפורש כשצריך להגיע עד מסך סוף המשחק: בברירת המחדל
 * יש כמה סיבובים, והמסך הבא אחרי תוצאות הסיבוב הוא עוד סיבוב.
 */
async function upToStart(page: Page, rounds?: string): Promise<void> {
  await page.goto('./');
  await page.getByRole('button', { name: /בואו נשחק/ }).click();
  await page.getByRole('button', { name: /משחק חדש/ }).click();
  if (rounds) await page.locator('select').first().selectOption(rounds);
  await page.getByRole('button', { name: /משחק יחיד/ }).click();
  await page.getByRole('button', { name: /מהיר \(5\)/ }).click();
  await page.getByRole('button', { name: /להגרלת האות/ }).click();
  await page.locator('.letter-wheel').click();
  await page.getByRole('button', { name: /מתחילים/ }).click({ timeout: 20_000 });
}

test('🎈 מסך הבית אומר לשחקן שהוא בגרסת חינם', async ({ page }) => {
  await signedInAsFree(page);
  await page.goto('./');
  await page.getByRole('button', { name: /בואו נשחק/ }).click();
  await expect(page.locator('.free-badge')).toHaveText('גרסת חינם');
});

test('📺 אחרי הגרלת האות מוצגת פרסומת, והמשחק מתחיל רק אחריה', async ({ page }) => {
  await signedInAsFree(page);
  await upToStart(page);

  await expect(page.locator('.ad-label')).toHaveText('פרסומת');

  // ההשהיה היא ההגנה מפני לחיצה בטעות — בלעדיה הכפתור חסר ערך
  const cont = page.getByRole('button', { name: /אפשר להמשיך|ממשיכים למשחק/ });
  await expect(cont).toBeDisabled();

  // השעון לא רץ בזמן המודעה: מסך המשחק בכלל לא נטען עדיין
  await expect(page.locator('.answer-grid, .category-card').first()).toBeHidden();

  await expect(cont).toBeEnabled({ timeout: 15_000 });
  await cont.click();
  await expect(page.locator('.ad-label')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /סיימתי|סיום/ }).first()).toBeVisible();
});

test('📺 בסוף הסיבוב הפרסומת מקדימה את הניקוד', async ({ page }) => {
  await signedInAsFree(page);
  await upToStart(page);

  const first = page.getByRole('button', { name: /אפשר להמשיך|ממשיכים למשחק/ });
  await expect(first).toBeEnabled({ timeout: 15_000 });
  await first.click();

  await page.getByRole('button', { name: /סיימתי|סיום/ }).first().click();

  await expect(page.locator('.ad-label')).toHaveText('פרסומת');
  // הניקוד עדיין לא על המסך — זו כל הנקודה של המיקום הזה
  await expect(page.getByText(/תוצאות הסיבוב|נקודות/).first()).toBeHidden();

  const second = page.getByRole('button', { name: /אפשר להמשיך|ממשיכים למשחק/ });
  await expect(second).toBeEnabled({ timeout: 15_000 });
  await second.click();
  await expect(page.locator('.ad-label')).toHaveCount(0);
});

test('🔒 משחק מול אחרים נעול ומוביל לחבילות, ולא לשגיאה', async ({ page }) => {
  await signedInAsFree(page);
  await page.goto('./');
  await page.getByRole('button', { name: /בואו נשחק/ }).click();
  await page.getByRole('button', { name: /משחק חדש/ }).click();

  const duel = page.locator('.card.mode-locked').first();
  await expect(duel).toBeVisible();
  // הכרטיס נעול אבל לחיץ, ולכן אסור שיסומן כמושבת: זו הדרך היחידה
  // שלו למסך החבילות
  await expect(duel).not.toHaveAttribute('aria-disabled', 'true');
  await expect(duel).toHaveAttribute('aria-label', /נעול/);
  await duel.click();
  await expect(page.getByText(/חבילות|מנוי|לכל החיים/).first()).toBeVisible();
});

test('🧩 בתפריט הבית אין פאזלים ואין ארנק', async ({ page }) => {
  await signedInAsFree(page);
  await page.goto('./');
  await page.getByRole('button', { name: /בואו נשחק/ }).click();
  await expect(page.getByRole('button', { name: /פאזל/ })).toHaveCount(0);
  await expect(page.locator('.wallet-chip')).toHaveCount(0);
});

test('🎯 בגרסה החינמית אפשר לשחק אתגר שהתקבל, אבל לא לשלוח אחד', async ({ page }) => {
  await signedInAsFree(page);
  // סיבוב אחד, כדי שמסך התוצאות יוביל לסוף המשחק ולא לסיבוב הבא
  await upToStart(page, '1');

  const cont = page.getByRole('button', { name: /אפשר להמשיך|ממשיכים למשחק/ });
  await expect(cont).toBeEnabled({ timeout: 15_000 });
  await cont.click();
  await page.getByRole('button', { name: /סיימתי|סיום/ }).first().click();

  const after = page.getByRole('button', { name: /אפשר להמשיך|ממשיכים למשחק/ });
  await expect(after).toBeEnabled({ timeout: 15_000 });
  await after.click();

  // בגרסה החינמית אין משימות ביניים, ולכן המעבר הוא ישר לסוף המשחק
  await expect(page.getByRole('button', { name: /משימת הביניים/ })).toHaveCount(0);
  await page.getByRole('button', { name: /לתוצאות המשחק/ }).click();

  /**
   * שליחה היא פיצ'ר בתשלום, ולכן מוצג כרטיס נעול שמסביר ומוביל
   * לחבילות — ולא כפתור שנעלם. *קבלה* של אתגר דווקא פתוחה לכולם:
   * היא סיבוב יחיד רגיל, וחסימתה הייתה שוברת את הקישור שחבר שלח.
   */
  await expect(page.locator('.challenge-locked')).toBeVisible();
  await expect(page.getByRole('button', { name: /לשלוח אתגר/ })).toHaveCount(0);
});
