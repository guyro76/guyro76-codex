/**
 * לכידת אירוע ההתקנה של ה-PWA.
 *
 * הבאג שהמודול הזה קיים כדי לפתור: `beforeinstallprompt` נורה פעם
 * אחת, מוקדם מאוד — בערך עם טעינת הדף. הרכיב שמציג את ההצעה יושב
 * במסך הבית, שאליו מגיעים רק אחרי מסך הפתיחה ובחירת פרופיל. כשהוא
 * סוף סוף נטען, האירוע כבר חלף מזמן והמאזין שלו לא יתפוס כלום —
 * כלומר ההצעה לא הייתה מופיעה אף פעם, בשום דפדפן.
 *
 * לכן ההאזנה מתחילה כאן, בטעינת האפליקציה, והאירוע נשמר עד שמישהו
 * ישאל עליו. הרכיב רק נרשם לעדכונים.
 */

export interface InstallEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferred: InstallEvent | null = null;
let installed = false;
const listeners = new Set<() => void>();

function notify(): void {
  for (const fn of listeners) fn();
}

/** נקראת פעם אחת בעליית האפליקציה, לפני שנטען מסך כלשהו */
export function watchInstallPrompt(): void {
  if (typeof window === 'undefined') return;

  window.addEventListener('beforeinstallprompt', (e) => {
    // בלי preventDefault הדפדפן מציג באנר משלו בעיתוי אקראי
    e.preventDefault();
    deferred = e as InstallEvent;
    notify();
  });

  window.addEventListener('appinstalled', () => {
    installed = true;
    deferred = null;
    notify();
  });
}

export function getInstallEvent(): InstallEvent | null {
  return installed ? null : deferred;
}

export function isInstalled(): boolean {
  return installed;
}

/** הרכיב נרשם ומקבל עדכון כשהאירוע מגיע. מחזירה פונקציית ביטול */
export function onInstallChange(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** מריצה את דיאלוג ההתקנה של הדפדפן. מחזירה מה המשתמש בחר */
export async function runInstallPrompt(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  const e = deferred;
  if (!e) return 'unavailable';
  await e.prompt();
  const { outcome } = await e.userChoice;
  deferred = null;
  notify();
  return outcome;
}
