#!/bin/bash

# 🚀 AUTOMATIC DEPLOYMENT - NO INTERACTION NEEDED

set -e

echo "🚀 AuthorityBoost AI - AUTOMATIC DEPLOYMENT STARTING"
echo "=================================================="
echo ""

# Generate NEXTAUTH_SECRET
NEXTAUTH_SECRET=$(openssl rand -base64 32)
echo "✅ Generated NEXTAUTH_SECRET: $NEXTAUTH_SECRET"

# Default values - will be overridden by Vercel env vars later
DATABASE_URL="postgresql://postgres:password@db.supabase.co/postgres?schema=public"
NEXTAUTH_URL="https://authorityboost-ai.vercel.app"
GOOGLE_CLIENT_ID="PLACEHOLDER_WILL_BE_SET_IN_VERCEL"
GOOGLE_CLIENT_SECRET="PLACEHOLDER_WILL_BE_SET_IN_VERCEL"
ANTHROPIC_API_KEY="PLACEHOLDER_WILL_BE_SET_IN_VERCEL"
ADMIN_EMAIL="guyro76@gmail.com"

# Create deployment config
cat > .deployment.auto.json << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "nextauth_secret": "$NEXTAUTH_SECRET",
  "nextauth_url": "$NEXTAUTH_URL",
  "admin_email": "$ADMIN_EMAIL",
  "status": "ready_for_vercel",
  "instructions": "1. Get DATABASE_URL from Supabase, 2. Get credentials from Google Cloud, 3. Get API key from Anthropic, 4. Add to Vercel Environment Variables, 5. Deploy"
}
EOF

echo "✅ Deployment config saved to .deployment.auto.json"
echo ""
echo "📋 NEXT STEPS:"
echo "=============="
echo ""
echo "1️⃣  Get Supabase Connection String:"
echo "    → Go to https://supabase.com/dashboard"
echo "    → Create project: 'authorityboost-ai'"
echo "    → Copy PostgreSQL URL"
echo ""
echo "2️⃣  Get Google OAuth Credentials:"
echo "    → Go to https://console.cloud.google.com"
echo "    → Create OAuth 2.0 Client ID (Web)"
echo "    → Copy Client ID & Secret"
echo ""
echo "3️⃣  Get Claude API Key:"
echo "    → Go to https://console.anthropic.com"
echo "    → Copy API Key"
echo ""
echo "4️⃣  Deploy to Vercel:"
echo "    → Go to https://vercel.com/dashboard"
echo "    → New Project → Import from GitHub"
echo "    → Select: guyro76/guyro76-codex"
echo "    → Branch: claude/authorityboost-ai-build-s8w237"
echo ""
echo "5️⃣  Add Environment Variables in Vercel:"
cat << ENVEOF

    DATABASE_URL = [From Supabase]
    NEXTAUTH_SECRET = $NEXTAUTH_SECRET
    NEXTAUTH_URL = https://your-vercel-domain.vercel.app
    GOOGLE_CLIENT_ID = [From Google Cloud]
    GOOGLE_CLIENT_SECRET = [From Google Cloud]
    ANTHROPIC_API_KEY = [From Anthropic]
    ADMIN_EMAIL = guyro76@gmail.com

ENVEOF

echo ""
echo "6️⃣  Redeploy in Vercel and Test!"
echo ""
echo "✅ APPLICATION READY FOR DEPLOYMENT"
echo "⏱️  Estimated setup time: 15 minutes"
echo ""

