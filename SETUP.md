# AuthorityBoost AI - Setup Guide

## Project Status

✅ **Foundation Complete** - Next.js 14+, Prisma, NextAuth, APIs ready
🔧 **In Development** - Content Factory, Brand Kit, Advanced Features

## Quick Start (Local Development)

### Prerequisites
- Node.js 18+ and npm/pnpm
- Git

### 1. Clone and Install

```bash
git clone <repo-url>
cd guyro76-codex
npm install
```

### 2. Environment Setup

The `.env.local` file is already configured for local SQLite development:

```env
DATABASE_URL=file:./dev.db
NEXTAUTH_SECRET=test-secret-change-in-production
NEXTAUTH_URL=http://localhost:3000
```

### 3. Database (Already Set Up)

The SQLite database is created and ready. To verify:

```bash
npx prisma studio  # Opens database viewer
```

### 4. Run Development Server

```bash
npm run dev
```

Visit **http://localhost:3000**

## Features Implemented

### ✅ Complete
- **Authentication**: Google OAuth login with NextAuth
- **Onboarding**: User preferences (niche, audience, tone, platforms)
- **Dashboard**: Authority metrics placeholder
- **API Routes**: 
  - `/api/auth/[...nextauth]` - Authentication
  - `/api/user/onboarding` - Save user preferences
  - `/api/carousel/create` - Generate carousels with 7 slides
  - `/api/content/search` - Search content from real sources
- **AI Integration**: Claude API for content generation
- **Image Search**: Wikimedia Commons integration
- **Content Search**: Google News + Wikipedia
- **UI/UX**: RTL Hebrew support, Tailwind CSS, dark mode

### 🔄 In Progress
- Content Factory page (carousel creation UI)
- Carousel viewer with theme selection
- Brand Kit generation
- Admin panel (guyro76@gmail.com)

### 📋 Planned
- Profile analysis AI
- Trend Radar
- Influencer Radar
- Content Calendar
- PNG/image export
- Reel generation
- Post templates

## Production Deployment

### Option 1: Vercel (Recommended)

Vercel is the easiest for Next.js apps.

1. **Push to GitHub**
   ```bash
   git push -u origin claude/authorityboost-ai-build-s8w237
   ```

2. **Create Vercel Account** at https://vercel.com

3. **Import Repository**
   - Connect GitHub
   - Select this repository
   - Vercel will auto-detect Next.js

4. **Set Environment Variables**
   ```
   DATABASE_URL → Supabase PostgreSQL URL
   NEXTAUTH_SECRET → Generate: openssl rand -base64 32
   NEXTAUTH_URL → https://your-domain.vercel.app
   GOOGLE_CLIENT_ID → From Google Cloud
   GOOGLE_CLIENT_SECRET → From Google Cloud
   ANTHROPIC_API_KEY → From Claude API
   ```

5. **Deploy** - Click "Deploy"

### Option 2: Supabase (Database Only)

For production, migrate from SQLite to Supabase PostgreSQL:

1. **Create Supabase Project** at https://supabase.com

2. **Get Connection URL**
   - Dashboard → Settings → Database → Connection String
   - Copy the "uri" format

3. **Update Schema** (PostgreSQL instead of SQLite)
   ```bash
   # Update prisma/schema.prisma
   # Change: datasource db { provider = "sqlite" }
   # To:     datasource db { provider = "postgresql" }
   
   # Update DATABASE_URL in .env.local with Supabase URL
   npx prisma migrate deploy
   ```

4. **Enable Auth in Supabase**
   - Dashboard → Authentication → Providers
   - Add Google OAuth

## Google OAuth Setup

Required for authentication:

1. Go to **Google Cloud Console** (https://console.cloud.google.com)

2. **Create Project**
   - New Project → "AuthorityBoost AI"

3. **Enable APIs**
   - Search "Google+ API" → Enable

4. **Create OAuth Credentials**
   - Credentials → Create Credentials → OAuth 2.0 Client ID
   - Application Type: Web application
   - Authorized Redirect URIs:
     - http://localhost:3000/api/auth/callback/google (local)
     - https://your-domain.vercel.app/api/auth/callback/google (production)

5. **Copy Credentials**
   - Client ID → GOOGLE_CLIENT_ID
   - Client Secret → GOOGLE_CLIENT_SECRET

## Claude API Setup

1. Visit **https://console.anthropic.com**

2. **Get API Key**
   - Copy your API key
   - Set ANTHROPIC_API_KEY environment variable

3. **Pricing** (as of 2025)
   - Claude 3.5 Sonnet: $3 per 1M input tokens, $15 per 1M output tokens
   - Free tier available for testing

## Project Structure

```
src/
├── app/
│   ├── api/                    # API routes
│   │   ├── auth/              # NextAuth configuration
│   │   ├── carousel/          # Carousel generation
│   │   ├── content/           # Content search
│   │   └── user/              # User management
│   ├── dashboard/             # Main dashboard
│   ├── onboarding/            # User setup
│   ├── carousel/              # Carousel viewer
│   ├── content-factory/       # Content creation hub
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Landing/login
│   └── globals.css            # Global styles
├── lib/
│   ├── auth.ts                # NextAuth configuration
│   ├── prisma.ts              # Database client
│   ├── claude.ts              # AI content generation
│   ├── images.ts              # Image search
│   ├── news.ts                # News/content search
│   └── admin.ts               # Admin utilities
└── types/
    └── index.ts               # TypeScript types

prisma/
├── schema.prisma              # Database schema
└── migrations/                # Database migrations
```

## Database Schema

### Users
- Profile data, onboarding status, preferences

### Projects
- Generated content (carousels, posts, reels)
- Metadata, themes, statuses

### Connections
- Platform integrations (demo or real)
- OAuth tokens

### Brand Kits
- User branding elements (bios, pillars, CTAs)

### Trends & Search Cache
- Cached content for performance

## Testing

### Run Tests
```bash
npm run test  # (to be implemented)
```

### Manual Testing Checklist

- [ ] Login with Google
- [ ] Complete onboarding
- [ ] View dashboard
- [ ] Create carousel from content search
- [ ] Verify carousel has 7 slides and 7 images
- [ ] Download carousel as PNG
- [ ] Mobile responsiveness (375px width)
- [ ] RTL Hebrew text

## Troubleshooting

### Database Issues
```bash
# Reset database (lose data!)
rm dev.db
npx prisma migrate dev --name init

# View database
npx prisma studio
```

### Build Errors
```bash
# Clear cache
rm -rf .next
npm run build
```

### Google OAuth Not Working
- Check CLIENT_ID and CLIENT_SECRET
- Verify redirect URI matches exactly
- Check browser console for errors

## Next Steps

1. **Complete Content Factory**
   - Upload carousel generation UI
   - Add carousel viewer with live images
   - Implement PNG export

2. **Add Admin Panel**
   - User management
   - System metrics
   - Settings

3. **Expand Features**
   - Brand Kit generation
   - Content Calendar
   - Influencer analysis

4. **Production Ready**
   - Set up Supabase
   - Configure Google OAuth
   - Deploy to Vercel
   - Set up monitoring

## Support

For issues or questions:
1. Check browser console for errors
2. Review server logs: `npm run dev`
3. Check Prisma schema: `npx prisma studio`
4. See error messages in Hebrew UI

---

**Built with:** Next.js 14 · Prisma · Tailwind CSS · Claude AI · NextAuth
**Status:** Active Development (v0.1.0)
