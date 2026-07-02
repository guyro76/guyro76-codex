# Paprika Agency OS

אפליקציית Next.js עצמאית לניהול סוכנות PPC, בעיצוב גלאסמורפי המזכיר את אורגנו ובצבעי פפריקה.

## ארכיטקטורה

- תיקיית GitHub עצמאית: `paprika-app/`
- Hosting: פרויקט Vercel נפרד עם Root Directory שמוגדר ל-`paprika-app`
- Database/Auth: Supabase
- חשבון מנהל: `guyro76@gmail.com`

## הגדרת Supabase

1. יש להשתמש בפרויקט Supabase פעיל ונפרד לפפריקה.
2. להריץ את `supabase/migrations/001_paprika.sql` ב-SQL Editor.
3. להוסיף לפרויקט Vercel את משתני הסביבה:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_ADMIN_EMAIL=guyro76@gmail.com`
4. ב-Supabase Auth יש להוסיף את כתובת הפרודקשן של Vercel לרשימת Redirect URLs.

## הגדרת Vercel

- Framework Preset: Next.js
- Root Directory: `paprika-app`
- Production Branch: `main`
- Node.js: 22.x

## בדיקות

```bash
npm install
npm run typecheck
npm run build
```
