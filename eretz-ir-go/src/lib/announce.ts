/**
 * הכרזות לקוראי מסך.
 *
 * המשחק מעביר הרבה מידע בצבע, בתנועה ובצליל — האות שהוגרלה, הזמן
 * שאוזל, תשובה שהתקבלה או נפסלה. ילד שמשתמש ב-VoiceOver או ב-TalkBack
 * לא רואה את זה ולא תמיד שומע את הצליל, ולכן כל אירוע כזה נשלח לכאן
 * ומוקרא באזור aria-live יחיד שיושב בשורש האפליקציה.
 */
type Listener = (message: string) => void;

let listener: Listener | null = null;

/** נרשם על ידי אזור ההכרזות; רק אחד פעיל בכל רגע */
export function setAnnouncer(fn: Listener | null): void {
  listener = fn;
}

/**
 * שולח טקסט להקראה. בטוח לקריאה מכל מקום — אם אזור ההכרזות עדיין
 * לא עלה, ההודעה פשוט נזרקת ולא מפילה כלום.
 */
export function announce(message: string): void {
  if (!message) return;
  listener?.(message);
}
