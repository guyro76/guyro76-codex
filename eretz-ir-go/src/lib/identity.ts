import type { Session } from '@supabase/supabase-js';

/**
 * הזהות שמגיעה מספק ההתחברות (Google/Apple) או מההרשמה במייל.
 *
 * למה זה קובץ נפרד: המבנה שמגיע מכל ספק שונה — גוגל שולחת
 * `full_name` ו-`avatar_url`, אפל שולחת `name`, והרשמה במייל שולחת
 * רק מה שהוקלד. במקום לפזר `?.` בכל מסך, הנרמול נעשה כאן פעם אחת.
 */

export interface Identity {
  fullName: string;
  firstName: string;
  email: string | null;
  /** כתובת תמונת הפרופיל אצל הספק, אם קיימת */
  photoUrl: string | null;
}

interface ProviderMeta {
  full_name?: string;
  name?: string;
  avatar_url?: string;
  picture?: string;
}

/** השם הפרטי בלבד — אליו פונים בתוך המשחק */
export function firstNameOf(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? fullName;
}

export function identityFrom(session: Session | null): Identity | null {
  const user = session?.user;
  if (!user) return null;

  const meta = (user.user_metadata ?? {}) as ProviderMeta;
  const email = user.email ?? null;
  const fullName = (meta.full_name || meta.name || email?.split('@')[0] || 'שחקן').trim();

  return {
    fullName,
    firstName: firstNameOf(fullName),
    email,
    photoUrl: meta.avatar_url || meta.picture || null
  };
}

/**
 * תקרת גודל לתמונת פרופיל שנשמרת במכשיר. תמונת גוגל היא בדרך כלל
 * כמה עשרות קילובייט; המגבלה קיימת כדי ש-IndexedDB לא יתמלא בגלל
 * כתובת שמחזירה משהו אחר לגמרי.
 */
const MAX_PHOTO_BYTES = 512 * 1024;
const PHOTO_TIMEOUT_MS = 6000;

/**
 * מורידה את תמונת הפרופיל **פעם אחת** וממירה אותה ל-data URI.
 *
 * זו החלטה מכוונת ולא קיצור דרך: אם היינו מציגים את הכתובת של גוגל
 * ישירות, כל טעינת מסך הייתה פונה לשרתי גוגל וחושפת את כתובת ה-IP
 * של הילד — בסתירה להבטחה שבמדיניות הפרטיות. כך יש בקשה אחת בלבד,
 * בזמן ההתחברות, ומאז התמונה יושבת במכשיר ועובדת גם אופליין.
 *
 * מחזירה null בכל כשל. תמונת פרופיל היא נחמדות, לא תנאי לשום דבר.
 */
export async function photoAsDataUri(url: string): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PHOTO_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal, mode: 'cors' });
    if (!res.ok) return null;

    const blob = await res.blob();
    if (!blob.type.startsWith('image/') || blob.size > MAX_PHOTO_BYTES) return null;

    return await new Promise<string | null>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** האם מחרוזת האווטאר היא תמונה שמורה ולא אמוג'י */
export function isPhotoAvatar(avatar: string | undefined): boolean {
  return !!avatar && avatar.startsWith('data:image/');
}
