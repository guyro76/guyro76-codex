import type { Page } from '@playwright/test';

/**
 * ויקיפדיה אינה זמינה בסביבת ה-CI, ובכל מקרה בדיקות לא צריכות להיות
 * תלויות בשירות חיצוני. כאן מחזירים "לא נמצא" — כך המשחק עובר את
 * המסלול המלא במצב הלא-מקוון שלו, וכל שגיאת קונסול שתופיע היא באמת שלנו.
 */
export async function stubWikipedia(page: Page): Promise<void> {
  await page.route('**he.wikipedia.org/**', (route) =>
    route.fulfill({ contentType: 'application/json', body: JSON.stringify({ query: { search: [] } }) })
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
