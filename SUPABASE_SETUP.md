# 🔗 Connect Supabase to AuthorityBoost AI

Your site is **LIVE at https://guyro76-codex.vercel.app** ✅

Now connect Supabase for full functionality:

## Step 1: Create Supabase Project
1. Go to: https://supabase.com/dashboard
2. Click **"+ New Project"**
3. Name: `authorityboost-ai`
4. Region: **US East** (or closest to you)
5. Password: Generate secure password
6. Click **Create New Project** (wait 2-3 minutes)

## Step 2: Get Connection String
1. Project → **Settings** → **Database**
2. Find **Connection Strings** → **URI**
3. Copy the full connection string (starts with `postgresql://`)

## Step 3: Add to Vercel
1. Go to: https://vercel.com/dashboard/projects/guyro76-codex
2. **Settings** → **Environment Variables**
3. Add:
   ```
   DATABASE_URL=<paste your connection string here>
   NEXTAUTH_SECRET=c81da87e10a38cdd40a2a0d4351e7ec15d03a001827c61cdeaf760c8c80b7384
   NEXTAUTH_URL=https://guyro76-codex.vercel.app
   ```
4. Click **Save**

## Step 4: Deploy Database Schema
In Supabase SQL Editor, run:

```sql
-- Users table (for NextAuth)
CREATE TABLE "users" (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  "emailVerified" TIMESTAMP,
  name TEXT,
  image TEXT,
  password TEXT,
  role TEXT DEFAULT 'user',
  niche TEXT,
  audience TEXT,
  tone TEXT,
  "onboardingComplete" BOOLEAN DEFAULT FALSE,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE accounts (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT,
  provider TEXT,
  "providerAccountId" TEXT,
  refresh_token TEXT,
  access_token TEXT,
  expires_at INTEGER,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  UNIQUE(provider, "providerAccountId")
);

CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires TIMESTAMP NOT NULL,
  "sessionToken" TEXT UNIQUE NOT NULL
);

CREATE TABLE "verificationTokens" (
  identifier TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires TIMESTAMP NOT NULL,
  PRIMARY KEY (identifier, token)
);
```

## Step 5: Redeploy on Vercel
1. Go to Vercel project
2. **Deployments** → Click latest deployment
3. Click **Redeploy** (or push a new commit to trigger auto-redeploy)
4. Wait 3-5 minutes

## Done! 🎉

Your AuthorityBoost AI app is now:
- ✅ Live on https://guyro76-codex.vercel.app
- ✅ Connected to Supabase PostgreSQL
- ✅ Ready for authentication & data storage

**Test Login:**
- Email: test@example.com
- Password: password123

---

**Need Help?**
- Supabase Docs: https://supabase.com/docs
- Vercel Docs: https://vercel.com/docs
- NextAuth Docs: https://next-auth.js.org
