# AuthorityBoost AI - Vercel Deployment Instructions

## ⚡ Quick Deploy (2 minutes)

### Option 1: Using Vercel CLI (Fastest)

```bash
npm i -g vercel
vercel --prod
```

Then answer the prompts and follow the links.

### Option 2: Manual GitHub Import (Recommended)

1. **Push to GitHub**
   ```bash
   git push origin claude/authorityboost-ai-build-s8w237
   ```

2. **Go to Vercel Dashboard**
   - https://vercel.com/dashboard
   - Click "New Project"
   - Search for "guyro76-codex" repository
   - Select branch: `claude/authorityboost-ai-build-s8w237`
   - Click "Deploy"

3. **Wait for Build**
   - Vercel will automatically build (2-3 minutes)
   - You'll get a production URL

---

## 🔐 Environment Variables (Required)

After deployment, add these in Vercel Dashboard → Settings → Environment Variables:

```env
DATABASE_URL=postgresql://user:password@host/database?schema=public
NEXTAUTH_SECRET=your-secret-from-command-below
NEXTAUTH_URL=https://your-vercel-app.vercel.app
GOOGLE_CLIENT_ID=your-google-oauth-id
GOOGLE_CLIENT_SECRET=your-google-oauth-secret
ANTHROPIC_API_KEY=your-claude-api-key
ADMIN_EMAIL=guyro76@gmail.com
```

### Generate NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

---

## 📋 Checklist Before Production

- [ ] Code pushed to `claude/authorityboost-ai-build-s8w237` branch
- [ ] Supabase database created (get PostgreSQL URL)
- [ ] Google OAuth credentials obtained
- [ ] Claude API key obtained
- [ ] NEXTAUTH_SECRET generated
- [ ] All environment variables added to Vercel
- [ ] Vercel deployment completed
- [ ] Test admin login: guyro76@gmail.com / caramel76
- [ ] Test email signup: test@example.com / password123
- [ ] Privacy & Terms pages accessible

---

## 🧪 Testing Production

Once deployed:

1. **Test Login Flow**
   ```
   https://your-app.vercel.app/login
   → Try: test@example.com / password123
   → Or: Click "Google Login"
   ```

2. **Test Admin Access**
   ```
   https://your-app.vercel.app/admin
   → Login: guyro76@gmail.com / caramel76
   ```

3. **Test Features**
   - Dashboard: `/dashboard`
   - Content Factory: `/content-factory`
   - Privacy: `/privacy`
   - Terms: `/terms`

---

## 🔧 Getting Required Credentials

### 1. Supabase PostgreSQL

```
1. https://supabase.com
2. Create new project
3. Settings → Database → Connection String
4. Copy "PostgreSQL" URL
5. Use as DATABASE_URL
```

### 2. Google OAuth

```
1. https://console.cloud.google.com
2. Create "AuthorityBoost AI" project
3. Enable "Google+ API"
4. Create "OAuth 2.0 Client ID" (Web)
5. Authorized Redirect URIs:
   - http://localhost:3000/api/auth/callback/google
   - https://your-vercel-app.vercel.app/api/auth/callback/google
6. Copy Client ID & Secret
```

### 3. Claude API

```
1. https://console.anthropic.com
2. Copy your API key
3. Use as ANTHROPIC_API_KEY
```

### 4. Apple OAuth (Optional)

```
1. https://developer.apple.com
2. Create "App ID" & "Service ID"
3. Configure redirect URIs (same as Google)
```

---

## 🚨 Troubleshooting

### Build Fails
- Check `npm run build` works locally
- Verify all environment variables are set

### Login not working
- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your domain
- Confirm Google OAuth redirect URIs

### Database connection error
- Verify `DATABASE_URL` is correct PostgreSQL string
- Check Supabase database is running
- May need to run migrations: `npx prisma migrate deploy`

### API calls failing
- Verify `ANTHROPIC_API_KEY` is correct
- Check Claude API credits available

---

## 📊 Status Indicators

After deployment, check:

- **Green checkmark** next to deployment = Success ✅
- **Build logs** show "Ready" = App is live
- Your domain shows content = Fully deployed

---

## 🎉 You're Live!

Once you see your Vercel URL with content loading:

✅ App is production-ready
✅ Database is connected
✅ Authentication working
✅ Admin panel active
✅ SEO optimized
✅ Ready for users

**Share your production URL with the world!** 🚀

---

For detailed setup, see:
- `SETUP.md` - Development setup
- `PRODUCTION.md` - Production checklist
- `DEPLOY_STEPS.txt` - Step-by-step guide
