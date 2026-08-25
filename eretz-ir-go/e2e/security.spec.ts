import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test, expect, type Page } from '@playwright/test';
import { stubExternalSources } from './helpers';

/**
 * ה-CSP מוגדר בקונפיג הפריסה, ולכן שרת ה-preview המקומי לא מגיש אותו.
 * כאן מזריקים את הכותרת האמיתית מתוך vercel.json לכל תגובה, ומריצים
 * את המשחק תחתיה — כך שאם המדיניות חוסמת משהו שהמשחק באמת צריך,
 * הבדיקה תיפול כאן ולא אצל ילד שמנסה לשחק.
 */
const here = dirname(fileURLToPath(import.meta.url));
const vercelConfig = JSON.parse(
  readFileSync(resolve(here, '..', 'vercel.json'), 'utf8')
) as { headers: { source: string; headers: { key: string; value: string }[] }[] };

const CSP = vercelConfig.headers
  .find((h) => h.source === '/(.*)')!
  .headers.find((h) => h.key === 'Content-Security-Policy')!.value;

/**
 * frame-ancestors ו-upgrade-insecure-requests אינם נתמכים כשה-CSP
 * מוזרק דרך תגובה מקומית ב-http, ורק מייצרים רעש בקונסול. הם נבדקים
 * ברמת הקונפיג ב-tests/policy.test.ts.
 */
const testableCsp = CSP.split(';')
  .map((p) => p.trim())
  .filter((p) => p && !p.startsWith('frame-ancestors') && p !== 'upgrade-insecure-requests')
  .join('; ');

async function applyCsp(page: Page): Promise<string[]> {
  const violations: string[] = [];

  await page.addInitScript(() => {
    document.addEventListener('securitypolicyviolation', (e) => {
      (window as unknown as { __csp: string[] }).__csp ??= [];
      (window as unknown as { __csp: string[] }).__csp.push(
        `${(e as SecurityPolicyViolationEvent).violatedDirective} ← ${(e as SecurityPolicyViolationEvent).blockedURI}`
      );
    });
  });

  await page.route('**/*', async (route) => {
    if (route.request().url().includes('he.wikipedia.org')) return route.fallback();
    const response = await route.fetch();
    await route.fulfill({
      response,
      headers: { ...response.headers(), 'content-security-policy': testableCsp }
    });
  });

  page.on('console', (msg) => {
    if (msg.type() === 'error' && /content security policy/i.test(msg.text())) violations.push(msg.text());
  });

  return violations;
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => indexedDB.deleteDatabase('eretz-ir-go'));
  await stubExternalSources(page);
});

test('🛡️ המשחק עובד תחת ה-CSP האמיתי — מסלול מלא בלי הפרות', async ({ page }) => {
  const violations = await applyCsp(page);
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(String(err)));

  await page.goto('./');
  await expect(page.getByRole('button', { name: /בואו נשחק/ })).toBeVisible();

  await page.getByRole('button', { name: /בואו נשחק/ }).click();
  await page.getByRole('button', { name: /משחק חדש/ }).click();
  // לחיצה על מצב מתקדמת ישירות למסך הקטגוריות
  await page.getByRole('button', { name: /משחק יחיד/ }).click();
  await page.getByRole('button', { name: /מהיר \(5\)/ }).click();
  await page.getByRole('button', { name: /להגרלת האות/ }).click();
  await page.locator('.letter-wheel').click();
  await page.getByRole('button', { name: /מתחילים/ }).click({ timeout: 20_000 });

  // הגענו למשחק בפועל — כלומר ה-CSP לא חסם את ה-bundle, את ה-CSS ולא את ה-SW
  await expect(page.locator('.cat-card').first()).toBeVisible();

  const fromPage = await page.evaluate(() => (window as unknown as { __csp?: string[] }).__csp ?? []);
  expect(fromPage, `הפרות CSP: ${fromPage.join(' | ')}`).toEqual([]);
  expect(violations, `שגיאות CSP בקונסול: ${violations.join(' | ')}`).toEqual([]);
  expect(errors, `שגיאות דף: ${errors.join(' | ')}`).toEqual([]);
});

test('📄 עמוד מדיניות הפרטיות נגיש ומוגש כעמוד אמיתי', async ({ page }) => {
  const res = await page.goto('./privacy.html');
  expect(res?.status()).toBe(200);

  await expect(page.getByRole('heading', { name: /מדיניות פרטיות/ })).toBeVisible();
  await expect(page.getByText(/עודכן לאחרונה/)).toBeVisible();
  await expect(page.getByRole('link', { name: /guyro76@gmail.com/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /חזרה למשחק/ })).toBeVisible();

  expect(await page.locator('html').getAttribute('dir')).toBe('rtl');
  expect(await page.locator('html').getAttribute('lang')).toBe('he');
});

test('♿ הכרזות לקורא מסך: האות שהוגרלה מוקראת', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: /בואו נשחק/ }).click();
  await page.getByRole('button', { name: /משחק חדש/ }).click();
  // לחיצה על מצב מתקדמת ישירות למסך הקטגוריות
  await page.getByRole('button', { name: /משחק יחיד/ }).click();
  await page.getByRole('button', { name: /מהיר \(5\)/ }).click();
  await page.getByRole('button', { name: /להגרלת האות/ }).click();

  // אזור ההכרזות קיים, מוסתר מהעין, ומוגדר נכון לקוראי מסך
  const live = page.locator('[aria-live="polite"]');
  await expect(live).toHaveCount(1);
  await expect(live).toHaveAttribute('role', 'status');
  await expect(live).not.toBeInViewport();

  await page.locator('.letter-wheel').click();
  await expect(live).toContainText(/האות שהוגרלה היא/, { timeout: 20_000 });
});
