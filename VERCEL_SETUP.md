# הוראות הגדרה ל-Vercel (Vercel Setup Instructions)

## משתנים סביבה (Environment Variables) שצריך להוסיף:

### NextAuth Configuration
```
NEXTAUTH_SECRET=c72ab1c8595fcfdf8082bc20fb757401465bf2aca21642bd0981b80d3786f498
NEXTAUTH_URL=https://guyro76-codex.vercel.app
```

### Database (PostgreSQL/Supabase)
```
DATABASE_URL=postgresql://[user]:[password]@[host]:[5432]/[database]
```

### Claude API Key (Content Generation)
```
CLAUDE_API_KEY=sk-ant-xxxxx
```

### OAuth (Optional - if you want Google/Apple login)
```
GOOGLE_CLIENT_ID=xxxxx
GOOGLE_CLIENT_SECRET=xxxxx
```

## צעדים להוסיף את המשתנים ב-Vercel:

1. גש ל: https://vercel.com/dashboard
2. בחר את הפרויקט "guyro76-codex"
3. לחץ על "Settings" בתפריט העליון
4. בחר "Environment Variables" בצד שמאל
5. לחץ "Add New"
6. הוסף כל משתנה:
   - שם (Name)
   - ערך (Value)
   - בחר Production, Preview, Development לפי הצורך
7. לחץ "Save"

## בדיקת deployment:

1. לחץ "Deployments" בתפריט
2. אם אתה רואה "Error" - בדוק הודעות השגיאה
3. אם אתה רואה "Building..." - חכה
4. אם אתה רואה ✓ Green - SUCCESS!

## URL של האתר החי:
https://guyro76-codex.vercel.app
