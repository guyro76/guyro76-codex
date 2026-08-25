-- ===== סגירת משטח ה-RPC =====
--
-- ## מה היה פתוח
--
-- PostgreSQL מעניק `execute` על כל פונקציה חדשה ל-PUBLIC כברירת
-- מחדל. `grant execute ... to authenticated` שנכתב בהגירה הראשונה
-- **הוסיף** הרשאה אבל לא הסיר את זו שכבר הייתה, ולכן כל פונקציה
-- בסכימה הייתה זמינה לקריאה גם למשתמש אנונימי — ו-PostgREST חושף
-- כל פונקציה בסכימה `public` כ-endpoint של `/rpc/`.
--
-- הפונקציה המסוכנת מביניהן היא `handle_new_user`: היא רצה
-- ב-security definer, כותבת לטבלת החשבונות, ו**קובעת תפקיד** —
-- כולל `admin`. היא מיועדת לרוץ כטריגר על `auth.users` בלבד.
-- קריאה ישירה אליה נכשלת היום ברמת השפה (אין `new` מחוץ לטריגר),
-- אבל הרשאה שנשענת על תקלה בזמן ריצה אינה הרשאה — היא מקרה גבול
-- שמחכה לשינוי הבא בפונקציה.
--
-- ## מה נקבע כאן
--
-- ההרשאה מוסרת מ-PUBLIC ומוענקת מפורשות לתפקיד שבאמת צריך אותה,
-- לפי מה שכל פונקציה עושה. הסרה מ-PUBLIC ולא רק מ-anon: PUBLIC
-- כולל גם כל תפקיד עתידי.
--
-- טריגרים אינם נפגעים. PostgreSQL בודק `execute` על פונקציית טריגר
-- ביצירת הטריגר, לא בכל הפעלה שלו.

-- --- טריגרים בלבד: אף אחד לא אמור לקרוא להן ישירות ---
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.touch_updated_at() from public, anon, authenticated;

-- --- מחוברים בלבד ---
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

revoke all on function public.my_account() from public, anon;
grant execute on function public.my_account() to authenticated;

revoke all on function public.redeem_invitation(text) from public, anon;
grant execute on function public.redeem_invitation(text) to authenticated;

-- --- הצצה להזמנה: אנונימי חייב לקבל תשובה ---
-- מי שמקבל קישור הזמנה עדיין לא נרשם. הפונקציה מחזירה בכוונה רק
-- "הקוד תקף / אינו תקף" ואת שם החבילה, בלי פרטי מזמין ובלי רשימת
-- קודים — ולכן היא היחידה שנשארת פתוחה לאנונימי.
revoke all on function public.preview_invitation(text) from public;
grant execute on function public.preview_invitation(text) to anon, authenticated;

-- --- search_path קבוע גם לפונקציית ה-updated_at ---
-- היא אינה security definer ולכן הסיכון קטן, אבל search_path משתנה
-- הוא בדיוק המנגנון שדרכו פונקציה נחטפת על ידי אובייקט בעל אותו שם
-- בסכימה קודמת. אין סיבה להשאיר אותו פתוח.
alter function public.touch_updated_at() set search_path = public;
