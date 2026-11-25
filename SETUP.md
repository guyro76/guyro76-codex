# הגדרות שרת — Postwave

משתני סביבה. הוסף אותם ב-Vercel (Settings → Environment Variables) וב-`.env.local`
לפיתוח מקומי. הקובץ `.env*` כבר ב-gitignore, כך שסודות לא נכנסים ל-git.

## כניסה עם קוד (בלי סיסמה)

| משתנה | מה זה |
|---|---|
| `POSTWAVE_ACCESS_CODE` | קוד הכניסה שלך. מי שמחזיק בו נכנס כמנהל — התייחס אליו כמו לסיסמה. |
| `ADMIN_EMAIL` | החשבון שהקוד נכנס בשמו. |
| `NEXTAUTH_SECRET` | חתימת הסשן. חובה בפרודקשן. |
| `NEXTAUTH_URL` | כתובת האתר, למשל `https://guyro76-codex.vercel.app`. |

הכניסה עם הקוד מחזיקה **שנה** — לא תצטרך להזין סיסמה שוב במכשיר הזה.

להחלפת הקוד: שנה את `POSTWAVE_ACCESS_CODE` ופרוס מחדש. הקוד הישן מפסיק לעבוד מיד.

כדי לייצר קוד חדש:

```bash
node -e "const b=require('crypto').randomBytes(20);const a='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let s='';for(const x of b)s+=a[x%a.length];console.log(s.replace(/(.{5})(?=.)/g,'\$1-'))"
```

אם `POSTWAVE_ACCESS_CODE` לא מוגדר — הכניסה עם קוד פשוט לא עובדת. אין ברירת מחדל,
בכוונה.

## אחסון תוכן בשרת

| משתנה | מה זה |
|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | מפתח service role. **סוד** — רק בשרת, לעולם לא בדפדפן. |
| `SUPABASE_CONTENT_URL` | כתובת פרויקט Supabase. ברירת מחדל: `https://ueswnbbyxytvmjydvvwv.supabase.co` |
| `POSTWAVE_OWNER_EMAIL` | של מי הספרייה שה-MCP קורא (קריאות MCP אין להן סשן). |

הטבלה `postwave_content` כבר קיימת, עם RLS מופעל וללא מדיניות מתירה — כלומר anon
חסום לחלוטין, והשרת בלבד קורא וכותב, תמיד מסונן לפי המייל של הבעלים.

**בלי המפתח**: האפליקציה ממשיכה לעבוד, הספרייה פשוט נשמרת בדפדפן בלבד.

## פרסום

| משתנה | מה זה |
|---|---|
| `COMPOSIO_API_KEY` | אינסטגרם / פייסבוק / לינקדאין |
| `TIKTOK_ACCESS_TOKEN` | טיקטוק (Content Posting API) |

## MCP

| משתנה | מה זה |
|---|---|
| `POSTWAVE_API_KEY` | נדרש מלקוחות MCP. כשהוא מוגדר — כל קריאה חייבת לשלוח אותו. |

פרסום חסום ללא מפתח גם כששאר השרת פתוח, כדי שאף אחד לא יפרסם בשמך.

## AI (אופציונלי)

| משתנה | מה זה |
|---|---|
| `ANTHROPIC_API_KEY` | כשמוגדר, התוכן נוצר ב-Claude במקום במחולל התבניות. |
