import type { Page } from '@playwright/test';

/**
 * חוסמת **כל** מקור חיצוני שהמשחק פונה אליו, ומחזירה "לא נמצא".
 *
 * בדיקות לא צריכות להיות תלויות בשירות חיצוני, וממילא הרשת חסומה
 * בסביבת ה-CI. כך המשחק עובר את המסלול המלא במצב הלא-מקוון שלו,
 * וכל שגיאת קונסול שתופיע היא באמת שלנו.
 *
 * הרשימה כאן חייבת להתעדכן עם כל מקור חדש. כשנוסף Openverse כמקור
 * תמונות שני, המסלול המלא נפל על `ERR_TUNNEL_CONNECTION_FAILED` —
 * בקשה אמיתית שיצאה החוצה מפני שאיש לא חסם אותה. זו לא הייתה
 * תקלה בבדיקה בלבד: היא הוכיחה שהצינור באמת מגיע למקור השני.
 */
export async function stubExternalSources(page: Page): Promise<void> {
  await page.route('**he.wikipedia.org/**', (route) =>
    route.fulfill({
      contentType: 'application/json',
      // ה-API האמיתי מחזיר CORS. בלי הכותרת הזו הדפדפן פוסל את
      // התשובה המזויפת ומדווח net::ERR_FAILED — שגיאת קונסול שנראית
      // כמו באג במשחק אבל היא באג בבדיקה.
      headers: { 'access-control-allow-origin': '*' },
      body: JSON.stringify({ query: { search: [] } })
    })
  );
  await page.route('**api.openverse.org/**', (route) =>
    route.fulfill({
      contentType: 'application/json',
      headers: { 'access-control-allow-origin': '*' },
      body: JSON.stringify({ results: [] })
    })
  );
}

/**
 * מנטרל את ה-Service Worker לבדיקה אחת.
 *
 * מאז שהמשחק עודכן לעדכון אוטומטי, ה-SW משתלט על הדף כבר בטעינה
 * הראשונה: הוא מתחיל להוריד את החבילה למטמון ומיירט בקשות רשת.
 * בבדיקות זה מייצר שני סוגי רעש — בקשות precache שנקטעות בסיום
 * הבדיקה ומדווחות כ-net::ERR_FAILED, ותשובות מזויפות שלא מגיעות
 * לדף כי ה-SW ענה לפניהן.
 *
 * הבדיקות שמשתמשות בזה בודקות את המשחק, לא את המטמון, ולכן הן
 * צריכות רשת נקייה. יש בדיקה נפרדת שמריצה את המשחק *עם* ה-SW.
 */
export async function disableServiceWorker(page: Page): Promise<void> {
  await page.addInitScript(() => {
    if ('serviceWorker' in navigator) {
      Object.defineProperty(navigator, 'serviceWorker', {
        configurable: true,
        value: {
          register: () => Promise.reject(new Error('disabled in test')),
          ready: new Promise(() => {}),
          addEventListener: () => undefined,
          getRegistrations: () => Promise.resolve([])
        }
      });
    }
  });
}
