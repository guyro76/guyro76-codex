# INSTAWATCHER – Instagram Followers Manager

אפליקציית Web מודרנית בעברית ו־RTL לניהול, ניתוח והבנה של מערכת העוקבים באינסטגרם, עם שקיפות מלאה סביב מגבלות Instagram / Meta API.

## עקרונות בטיחות

- OAuth רשמי בלבד.
- אין שמירת סיסמאות Instagram.
- אין scraping, אין Private API ואין בוטים.
- Follow / Unfollow / Remove לא מזויפים באפליקציה: אם פעולה אינה נתמכת רשמית, נפתח פרופיל Instagram לביצוע ידני.
- מצב דמו מלא מאפשר להציג ולבדוק את המוצר בלי חיבור אמיתי.

## פיתוח

```bash
npm install
npm run dev
```

אחרי הרצה תיפתח כתובת מקומית:

```text
http://127.0.0.1:4173
```

אפשר גם להריץ שרת לקבצים שנבנו מראש:

```bash
npm run build
npm run serve
```

## בדיקות

```bash
npm run lint
npm run build
npx prisma validate
```

## משתני סביבה עתידיים

```env
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_INSTAGRAM_CLIENT_ID="..."
NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI="http://localhost:3000/oauth/callback"
TOKEN_ENCRYPTION_KEY="..."
```

## מסר שקיפות קבוע

האפליקציה עובדת רק עם API רשמי של Instagram / Meta. חלק מהפעולות עשויות להיות מוגבלות בהתאם להרשאות שמטה מאפשרת. במקרים כאלה נפתח את הפרופיל באינסטגרם לביצוע ידני.
