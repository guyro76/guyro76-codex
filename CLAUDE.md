# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**guyro76-codex** is AuthorityBoost AI, a production-ready Next.js monorepo for AI-powered digital authority building and content generation. It features:

- AI-powered carousel generator (7-image social media content)
- Real image search integration with Wikimedia Commons
- Trending content aggregation (Google News & Wikipedia)
- Multi-provider authentication (Google OAuth, Apple OAuth, Email/Password)
- Role-based access control (admin/user)
- Hebrew RTL language support
- Prisma ORM with SQLite (dev) / PostgreSQL (production)
- Vercel-first deployment with Railway/Netlify fallback

## Technology Stack

- **Next.js 16.2.9** with React 19.2.4, TypeScript 5.9.2
- **Database**: Prisma ORM → SQLite (dev), PostgreSQL/Supabase (prod)
- **Auth**: NextAuth.js with Google, Apple OAuth
- **AI**: Anthropic Claude API
- **Styling**: Tailwind CSS (RTL-aware)
- **Node.js**: 22.x required
- **Deployment**: Vercel (primary), Railway/Netlify (fallback)

## Essential Commands

### Local Development

```bash
# Bootstrap dependencies & set up dev environment
npm run dev

# Production build (runs Prisma migration check)
npm run build

# Start production server
npm start

# Run ESLint
npm run lint
```

### Database

```bash
# Generate Prisma client
npx prisma generate

# Create & run migrations
npx prisma migrate dev --name <migration_name>

# View/edit database in Prisma Studio
npx prisma studio
```

### Deployment

- `./deploy.sh` - Deployment checklist generator
- `./auto-deploy.js` - Automated deployment workflow
- See `QUICK_DEPLOY.md`, `VERCEL_DEPLOY.md`, `PRODUCTION.md` for detailed deployment guides

## Codebase Architecture

### Directory Structure

```
/src
├── /app                  # Next.js 13+ App Router
│   ├── /api             # API routes (auth, carousel, content, news)
│   ├── /admin           # Admin panel (role-protected)
│   ├── /dashboard       # Main user dashboard
│   ├── /content-factory # Carousel creation interface
│   ├── /brand-kit       # Brand management
│   ├── /library         # Content library
│   ├── /profiles        # User profiles
│   ├── /trends          # Trending content
│   └── [pages]          # Login, onboarding, settings, etc.
├── /components          # Reusable React components
│   ├── AppShell.tsx     # Main layout
│   ├── Icons.tsx        # Icon library
│   ├── NewsTicker.tsx   # News ticker widget
│   └── DailyTip.tsx     # Daily tip component
└── /lib                 # Utility modules & integrations
    ├── auth.ts          # Auth helpers
    ├── claude.ts        # Claude API integration
    ├── composio.ts      # Composio integration
    ├── prisma.ts        # Prisma client singleton
    ├── supabase.ts      # Supabase client
    ├── carousel-config.ts # Carousel structure config
    ├── news.ts          # News/trends data fetching
    └── images.ts        # Image handling utilities

/prisma
├── schema.prisma        # 8 data models
└── /migrations          # Database schema versions

/organo-app             # Separate Next.js + Supabase app
/paprika-app            # Agency OS application
/.github/workflows      # CI/CD pipelines
/scripts                # Build verification scripts
```

### Database Models (Prisma)

- **User**: Core user with role (user/admin), onboarding status, preferences
- **Account**: OAuth provider accounts (Google, Apple)
- **Session**: NextAuth.js session management
- **Project**: Carousel/content projects with metadata
- **ProjectImage**: Images within projects (7-image carousel structure)
- **BrandKit**: Per-user brand configuration (positioning, bios, CTAs)
- **TrendItem**: Cached trending content (news/trends)
- **SearchCache**: Cached search results
- **Connection**: Social platform connections

### Key Integration Points

**Claude API** (`/lib/claude.ts`): Anthropic integration for content generation. Used in `/api/carousel` endpoint to create carousel copy and metadata.

**Authentication** (`/lib/auth.ts`): NextAuth.js configuration with Google/Apple OAuth and email/password. Protected routes require authentication via middleware.

**Composio** (`/lib/composio.ts`): Social platform integration for multi-channel posting.

**Supabase** (`/lib/supabase.ts`): PostgreSQL database & edge functions in production (organo-app).

**Image Search** (`/lib/images.ts`): Wikimedia Commons API integration for sourcing carousel images.

**News/Trends** (`/lib/news.ts`): Google News & Wikipedia API for trending content aggregation.

## Critical Files & Configurations

- `tsconfig.json` - Path alias: `@/*` → `./src/*` (use this for all imports)
- `.env.local` - Required for local dev (Google OAuth, Claude API key, database URL, NextAuth secret)
- `prisma/schema.prisma` - Single source of truth for database structure
- `.github/workflows/organo-ci.yml` - Build verification, npm audit, route checking, secret scanning
- `ESLint` configured for Next.js + TypeScript with strict rules

## Common Development Tasks

### Adding API Route
1. Create file in `/src/app/api/[feature]/route.ts`
2. Use NextAuth session for auth: `const session = await getServerSession()`
3. Return JSON response
4. Add tests in corresponding `/tests/api/[feature].test.ts`

### Creating UI Component
1. Use React Server Components by default (no "use client" needed)
2. Interactive features require "use client" boundary
3. Style with Tailwind classes
4. Place in `/src/components/`

### Adding Database Model
1. Update `prisma/schema.prisma`
2. Create migration: `npx prisma migrate dev --name <name>`
3. Update types if needed
4. Use Prisma client via `import { prisma } from '@/lib/prisma'`

### Fetching Claude API
```typescript
import { claude } from '@/lib/claude'
const response = await claude.messages.create({...})
```

### Protected Routes
- Routes under `/admin` require `role === 'admin'` (enforced via middleware)
- Use `getServerSession()` to check current user session
- Redirect unauthenticated users to `/login`

## Admin Access

- **Email**: guyro76@gmail.com
- **Admin Routes**: `/admin` (role-protected)
- **Dashboard**: `/dashboard`

## CI/CD Pipeline

GitHub Actions (`organo-ci.yml`):
- Runs on every PR/push to main
- Checks: build success, npm audit, route verification, secret scanning
- Must pass before merging

## Important Notes

- **Node 22.x required** - Vercel deploys with this version
- **RTL Support**: Hebrew labels use Tailwind's `dir-rtl` utilities
- **Environment variables** must be set in Vercel dashboard for production
- **Database migrations** run automatically on `npm run build`
- **Image handling**: All carousel images sourced from Wikimedia Commons via `/lib/images.ts`
- **Prisma client** is a singleton in `/lib/prisma.ts` - always import from there
- **TypeScript strict mode** is enabled - no `any` types without justification
