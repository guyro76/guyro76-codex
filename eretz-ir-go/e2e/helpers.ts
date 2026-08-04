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
