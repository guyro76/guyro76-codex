# 🚀 AuthorityBoost AI - FULLY AUTOMATED DEPLOYMENT

> One command deploys everything to production

## ⚡ Quick Start (5 minutes)

### Step 1: Get Your Credentials

Gather these 4 pieces of information:

```bash
# 1. Supabase API Key
# From: https://supabase.com → Profile → API Tokens
SUPABASE_KEY=your_supabase_api_token

# 2. Supabase Organization ID (optional, defaults to 'default')
SUPABASE_ORG_ID=your_org_id

# 3. Google OAuth Credentials (optional, can set in Vercel later)
GOOGLE_ID=your_google_client_id
GOOGLE_SECRET=your_google_client_secret

# 4. Claude API Key (optional, can set in Vercel later)
CLAUDE_KEY=your_anthropic_api_key

# 5. Vercel Token (optional, for automated Vercel deployment)
VERCEL_TOKEN=your_vercel_token
```

### Step 2: Run One Command

```bash
SUPABASE_KEY=xxx \
GOOGLE_ID=yyy \
GOOGLE_SECRET=zzz \
CLAUDE_KEY=aaa \
node auto-deploy.js
```

Or if you have all credentials, run:

```bash
source .env.creds && node auto-deploy.js
```

### Step 3: Follow the Prompts

The script will:
1. ✅ Create Supabase database automatically
2. ✅ Deploy to Vercel automatically
3. ✅ Generate NEXTAUTH_SECRET
4. ✅ Configure all environment variables
5. ✅ Output your production URL

---

## 📋 Available Scripts

### `auto-deploy.js` - FULLY AUTOMATED (Recommended)
```bash
# Run with all credentials
SUPABASE_KEY=xxx GOOGLE_ID=yyy GOOGLE_SECRET=zzz CLAUDE_KEY=aaa node auto-deploy.js

# With Vercel token for full automation
SUPABASE_KEY=xxx VERCEL_TOKEN=zzz node auto-deploy.js
```

**What it does:**
- Creates Supabase project
- Deploys to Vercel
- Generates secure secrets
- Configures environment variables
- Returns your production URL

### `setup-production.js` - INTERACTIVE
```bash
node setup-production.js
```

**What it does:**
- Prompts for each credential
- Walks you through each step
- Saves configuration files
- Guides deployment process

### `deploy.sh` - BASH ALTERNATIVE
```bash
./deploy.sh
```

**What it does:**
- Generates NEXTAUTH_SECRET
- Creates deployment checklist
- Provides step-by-step guide

---

## 🔐 Credential Setup

### 1. Supabase API Key

Go to: https://supabase.com/dashboard/account/tokens

1. Click "Generate new token"
2. Name: "AuthorityBoost Deployment"
3. Copy the token → `SUPABASE_KEY`

### 2. Supabase Organization ID (Optional)

Go to: https://supabase.com/dashboard/org/general

- Organization ID shown in settings
- Or leave blank (defaults to 'default')

### 3. Google OAuth

Go to: https://console.cloud.google.com

1. Create project: "AuthorityBoost AI"
2. Enable "Google+ API"
3. Create "OAuth 2.0 Client ID" (Web)
4. Authorized Redirect URIs:
   ```
   http://localhost:3000/api/auth/callback/google
   https://your-vercel-domain.vercel.app/api/auth/callback/google
   ```
5. Copy Client ID → `GOOGLE_ID`
6. Copy Client Secret → `GOOGLE_SECRET`

### 4. Claude API Key

Go to: https://console.anthropic.com/api/keys

1. Click "Create Key"
2. Copy key → `CLAUDE_KEY`

### 5. Vercel Token (Optional)

Go to: https://vercel.com/account/tokens

1. Create new token: "AuthorityBoost Auto-Deploy"
2. Copy token → `VERCEL_TOKEN`

---

## 💾 Saving Credentials (Safe)

Create `.env.creds` file (DON'T COMMIT):

```bash
# .env.creds
export SUPABASE_KEY=your_key
export SUPABASE_ORG_ID=your_org_id
export GOOGLE_ID=your_id
export GOOGLE_SECRET=your_secret
export CLAUDE_KEY=your_key
export VERCEL_TOKEN=your_token
```

Then run:

```bash
source .env.creds && node auto-deploy.js
```

**⚠️ NEVER commit `.env.creds`** - it's in `.gitignore`

---

## 🎯 What Gets Deployed

✅ Full Next.js 14 application  
✅ PostgreSQL database (Supabase)  
✅ NextAuth authentication (Google, Apple, Email)  
✅ Admin panel (guyro76@gmail.com)  
✅ Carousel generator (Claude API)  
✅ Image search (Wikimedia Commons)  
✅ Content discovery (Google News, Wikipedia)  
✅ Full Hebrew RTL support  
✅ Mobile responsive  
✅ SEO optimized  

---

## 📊 What Gets Generated

The script automatically generates:

```
✅ DATABASE_URL - From Supabase
✅ NEXTAUTH_SECRET - Secure 256-bit key
✅ NEXTAUTH_URL - Your Vercel domain
✅ GOOGLE_CLIENT_ID - OAuth credentials
✅ GOOGLE_CLIENT_SECRET - OAuth credentials
✅ ANTHROPIC_API_KEY - Claude API key
✅ ADMIN_EMAIL - guyro76@gmail.com
```

---

## 🧪 Testing After Deployment

### Admin Login
```
Email: guyro76@gmail.com
Password: caramel76
→ https://your-app.vercel.app/admin
```

### Regular User
```
Email: test@example.com
Password: password123
→ https://your-app.vercel.app/login
```

### Google OAuth
```
Click "Google Login" button
→ Should redirect to sign-in
```

### Features
```
Dashboard: https://your-app.vercel.app/dashboard
Content Factory: https://your-app.vercel.app/content-factory
Privacy: https://your-app.vercel.app/privacy
Terms: https://your-app.vercel.app/terms
```

---

## ⏱️ Timeline

| Step | Time | Action |
|------|------|--------|
| 1 | 2 min | Gather credentials |
| 2 | 5 min | Run `auto-deploy.js` |
| 3 | 3 min | Script creates Supabase |
| 4 | 2 min | Script deploys to Vercel |
| 5 | 3 min | Vercel builds (shows progress) |
| 6 | 2 min | Test your app |
| **TOTAL** | **~15 min** | **App is LIVE** 🚀 |

---

## 🐛 Troubleshooting

### "SUPABASE_KEY not provided"
→ Add: `SUPABASE_KEY=your_key node auto-deploy.js`

### "Vercel CLI not installed"
→ Install: `npm install -g vercel`

### "Database connection error"
→ Check DATABASE_URL in Vercel dashboard
→ Verify Supabase project is running

### "OAuth not working"
→ Check redirect URIs match exactly
→ Verify credentials in Vercel environment

### "API calls failing"
→ Check Claude API key is valid
→ Verify API credits available

---

## 🚀 One-Liner Magic

All credentials ready? Run this:

```bash
SUPABASE_KEY=xxx GOOGLE_ID=yyy GOOGLE_SECRET=zzz CLAUDE_KEY=aaa node auto-deploy.js && sleep 180 && npm run test:prod
```

This will:
1. Deploy everything
2. Wait 3 minutes for build
3. Run production tests

---

## 📞 Support

All credentials gathered but script errors?

1. Check `git log -1` - latest commit info
2. Run `npm run build` - verify local build works
3. Check `.deployment.auto.json` - saved config
4. Read `PRODUCTION.md` - detailed guide

---

## ✨ Summary

```
✅ Code: Complete & tested
✅ Scripts: Ready to run
✅ Credentials: Ready to provide
✅ Deployment: One command away
✅ Timeline: 15 minutes to LIVE

→ Gather credentials
→ Run: SUPABASE_KEY=xxx node auto-deploy.js
→ Your app is LIVE! 🚀
```

---

**Made with ❤️ for production readiness**

`© 2026 תוכנן ונבנה על ידי גיא רוזנברג - כל הזכויות שמורות`
