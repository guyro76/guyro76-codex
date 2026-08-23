/**
 * מחיקת חשבון — צד שרת.
 *
 * אפל מחייבת מחיקת חשבון **מתוך האפליקציה** מרגע שיש בה יצירת חשבון
 * (App Store Review Guidelines 5.1.1(v)), ובלי זה ההגשה נדחית.
 *
 * למה זו פונקציית שרת ולא קריאה מהדפדפן: מחיקת משתמש מ-auth.users
 * דורשת את מפתח ה-service role, ומפתח כזה בקוד צד לקוח הוא חשיפה
 * מוחלטת — הוא עוקף כל מדיניות RLS. הכלל בפרויקט מפורש: אין לחשוף
 * מפתחות סודיים בקוד צד לקוח. לכן המפתח נשאר כאן, בסביבת הריצה של
 * Supabase, והדפדפן שולח רק את ה-JWT של עצמו.
 *
 * מה נמחק: שורת המשתמש ב-auth.users. שאר הנתונים נמחקים אחריה
 * בשרשור שכבר מוגדר בסכמה — accounts ו-invitation_redemptions
 * מוגדרים `on delete cascade`, והזמנות שהמשתמש יצר עוברות ל-null
 * ולא נמחקות, כדי שהיסטוריית ההזמנות של אחרים לא תישבר.
 *
 * פריסה:
 *   supabase functions deploy delete-account
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' }
  });

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405);

  const url = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !serviceKey) return json({ error: 'server not configured' }, 500);

  /**
   * מזהים את הקורא לפי ה-JWT שלו בלבד.
   *
   * זה הלב של האבטחה כאן: מזהה המשתמש **לא** מגיע מגוף הבקשה, אלא
   * מהאסימון החתום. אחרת כל אחד היה יכול לשלוח מזהה של מישהו אחר
   * ולמחוק לו את החשבון.
   */
  const auth = req.headers.get('Authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) return json({ error: 'missing token' }, 401);

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

  const { data, error } = await admin.auth.getUser(token);
  if (error || !data?.user) return json({ error: 'invalid token' }, 401);

  const { error: deleteError } = await admin.auth.admin.deleteUser(data.user.id);
  if (deleteError) return json({ error: deleteError.message }, 500);

  return json({ deleted: true }, 200);
});
