# 🚀 AuthorityBoost AI - Production Ready

> Digital Authority Building Platform with AI-Powered Content Generation

---

## ✨ Features

### 🎨 Content Creation
- **AI Carousel Generator** - 7-image carousels powered by Claude API
- **Real Image Search** - Wikimedia Commons integration with validation
- **Trending Content** - Google News & Wikipedia integration
- **Real-time Preview** - See results as you create

### 🔐 Authentication
- Google OAuth 2.0
- Apple OAuth (optional)
- Email/Password with bcryptjs
- Role-based access control

### 👤 User Management
- Comprehensive onboarding flow
- Dashboard with metrics
- Admin panel (guyro76@gmail.com)
- User preferences (niche, audience, tone, platforms)

### 🌍 Localization
- Full RTL (Right-to-Left) Hebrew support
- Responsive mobile design
- Accessibility features
- SEO optimized

---

## 🚀 Quick Deployment (15 minutes)

### Run Deployment Script
```bash
./deploy.sh
```

This will:
- Generate your secure `NEXTAUTH_SECRET`
- Verify your git branch
- Create deployment configuration
- Provide step-by-step checklist

Then follow the checklist in the script output to:
1. Create Supabase database
2. Set up Google OAuth
3. Get Claude API key
4. Deploy to Vercel
5. Configure environment variables
6. Test production

---

## 🏗️ Architecture

### Stack
- **Frontend**: Next.js 14+ (React, TypeScript)
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma with TypeScript
- **Auth**: NextAuth.js with multiple providers
- **AI**: Claude API (Anthropic)
- **Hosting**: Vercel
- **Styling**: Tailwind CSS (RTL support)

### Pages
```
/                    - Landing page (login)
/login              - Authentication page
/onboarding         - User setup wizard
/dashboard          - Main dashboard
/content-factory    - Carousel creation
/carousel/[id]      - Carousel viewer
/admin              - Admin panel (guyro76@gmail.com only)
/privacy            - Privacy policy
/terms              - Terms of service
```

---

## 🔐 Admin Access

**Email:** `guyro76@gmail.com`  
**Password:** `caramel76`

---

## 📱 Local Development

```bash
npm install
npm run dev
# Open http://localhost:3000
```

---

## 📝 Documentation

- **QUICK_DEPLOY.md** - 15-minute deployment checklist
- **VERCEL_DEPLOY.md** - Vercel-specific guide
- **PRODUCTION.md** - Production checklist
- **DEPLOY_STEPS.txt** - Step-by-step instructions
- **SETUP.md** - Development setup

---

## 🔒 Security

- Passwords hashed with bcryptjs
- Environment variables for secrets
- HTTPS/SSL via Vercel
- CORS configured
- Input validation on forms
- Role-based access control
- Admin-only routes protected

---

## 📧 Support

**Email:** guyro76@gmail.com

---

**© 2026 תוכנן ונבנה על ידי גיא רוזנברג - כל הזכויות שמורות**

🚀 Production Ready - Deploy Now!
