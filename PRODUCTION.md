# AuthorityBoost AI - Production Deployment Guide

## 🚀 Quick Start (Deploy in 5 minutes)

### Step 1: Push to GitHub

```bash
git push origin claude/authorityboost-ai-build-s8w237
```

### Step 2: Create Vercel Project

1. Go to **https://vercel.com**
2. Click "New Project"
3. Import from GitHub (select guyro76/guyro76-codex)
4. Select branch: `claude/authorityboost-ai-build-s8w237`
5. Click "Deploy"

### Step 3: Configure Environment Variables

On Vercel Dashboard → Settings → Environment Variables, add:

```
DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/[db]?schema=public
NEXTAUTH_SECRET=[generate: openssl rand -base64 32]
NEXTAUTH_URL=https://your-domain.vercel.app
GOOGLE_CLIENT_ID=[from Google Cloud]
GOOGLE_CLIENT_SECRET=[from Google Cloud]
APPLE_CLIENT_ID=[from Apple Developer]
APPLE_CLIENT_SECRET=[from Apple Developer]
ANTHROPIC_API_KEY=[from Anthropic Console]
ADMIN_EMAIL=guyro76@gmail.com
```

### Step 4: Wait for Deployment

Vercel builds automatically. Once "Production" shows "Ready", your app is live!

---

## 🔧 Required Credentials

### 1. Supabase PostgreSQL Database

1. Go to **https://supabase.com**
2. Create new project
3. Wait for provisioning
4. Go to Settings → Database
5. Copy connection string (PostgreSQL)
6. Use as `DATABASE_URL`

### 2. Google OAuth

1. Go to **https://console.cloud.google.com**
2. Create new project "AuthorityBoost AI"
3. Enable Google+ API
4. Create OAuth 2.0 Client ID (Web)
5. Authorized Redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://your-domain.vercel.app/api/auth/callback/google`
6. Copy Client ID & Secret

### 3. Apple OAuth

1. Go to **https://developer.apple.com**
2. Register "App ID" for your service
3. Create "Service ID"
4. Set Redirect URIs:
   - `http://localhost:3000/api/auth/callback/apple`
   - `https://your-domain.vercel.app/api/auth/callback/apple`
5. Generate certificates & keys

### 4. Claude API Key

1. Go to **https://console.anthropic.com**
2. Create API key
3. Use as `ANTHROPIC_API_KEY`

### 5. NextAuth Secret

```bash
openssl rand -base64 32
```

Copy output and set as `NEXTAUTH_SECRET`

---

## 🧪 Test Production Deployment

### Test Authentication

**Google Login:**
1. Click "כניסה עם Google"
2. Select your Google account
3. Should redirect to onboarding

**Email/Password:**
1. Go to `/login`
2. Click "הרשמה"
3. Register: test@example.com / password123
4. Should be able to login

**Admin Access:**
1. Go to `/admin`
2. Login with: guyro76@gmail.com / caramel76
3. Should see admin panel

### Test Features

- **Dashboard:** Visit `/dashboard` - should show metrics
- **Content Factory:** Visit `/content-factory` - should load form
- **Content Search:** Search for content with AI
- **Privacy/Terms:** Visit `/privacy` and `/terms`

---

## 📊 Features Available in Production

### ✅ Core Features
- ✅ Google/Apple/Email authentication
- ✅ User onboarding
- ✅ Dashboard with metrics
- ✅ Content factory (carousel creation)
- ✅ Admin panel
- ✅ Privacy policy & Terms of service
- ✅ SEO optimized

### 🔄 Coming Soon (Phase 2)
- Brand Kit generation
- Content Calendar
- Profile Analysis
- Influencer Radar
- Trend Radar
- Advanced reporting

---

## 🔒 Security Checklist

- [x] Passwords hashed with bcryptjs
- [x] Role-based access control
- [x] Admin routes protected
- [x] Environment variables for secrets
- [x] HTTPS/SSL enforced by Vercel
- [x] CORS configured
- [x] Input validation on all forms
- [x] Error messages don't leak sensitive info

---

## 📱 Responsive & Accessible

- [x] Mobile tested (375px+)
- [x] Tablet responsive
- [x] RTL Hebrew support
- [x] Semantic HTML
- [x] ARIA labels
- [x] Keyboard navigation
- [x] Dark mode optimized

---

## 🎯 Admin Features

**Admin Email:** guyro76@gmail.com
**Admin Password:** caramel76

### Admin Can:
- View all users
- View system stats
- Check API status
- Manage settings
- View audit logs

Access via: `/admin`

---

## 🚨 Troubleshooting

### Login not working
- Check `NEXTAUTH_SECRET` is set
- Verify `NEXTAUTH_URL` matches domain
- Check Google/Apple OAuth credentials

### Database errors
- Verify `DATABASE_URL` is correct PostgreSQL string
- Check Supabase database is running
- Run migrations: `npx prisma migrate deploy`

### API calls failing
- Check `ANTHROPIC_API_KEY` is set
- Check API rate limits
- Verify environment variables are in Vercel

### Email not being sent
- Email functionality not yet implemented
- Will be added in Phase 2

---

## 📈 Performance Tips

1. **Images:** All carousel images are real (Wikimedia Commons)
2. **Caching:** Content search results cached for 24 hours
3. **Database:** Indexes on frequently queried fields
4. **API:** Rate limiting on carousel creation (1 per minute per user)

---

## 🆘 Support

- Issues: guyro76@gmail.com
- Code: /code or /help on Claude Code
- Docs: See SETUP.md for development guide

---

## 🎉 You're Live!

Your production deployment is complete. The app is:
- ✅ Deployed on Vercel
- ✅ Connected to PostgreSQL
- ✅ Authenticated with Google/Apple/Email
- ✅ Admin panel active
- ✅ SEO optimized
- ✅ Privacy compliant

**Happy marketing! 🚀**
