#!/bin/bash

echo "🚀 AuthorityBoost AI - Automated Deployment Setup"
echo "=================================================="

# Generate secrets
NEXTAUTH_SECRET=$(openssl rand -hex 32)
echo "✅ Generated NEXTAUTH_SECRET: $NEXTAUTH_SECRET"

# Create environment configuration for Vercel
cat > .vercel-env.txt << ENVEOF
# Add these to Vercel Dashboard → Settings → Environment Variables

NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
NEXTAUTH_URL=https://guyro76-codex.vercel.app

# Database (Create free Supabase project at https://supabase.com)
DATABASE_URL=postgresql://postgres:[password]@[project].supabase.co:5432/postgres

# Claude API Key (Get from https://console.anthropic.com)
CLAUDE_API_KEY=sk-ant-[your-key]

# Optional OAuth
GOOGLE_CLIENT_ID=[optional]
GOOGLE_CLIENT_SECRET=[optional]
ENVEOF

echo ""
echo "📋 Configuration file created: .vercel-env.txt"
echo ""
echo "Next steps:"
echo "1. Go to https://vercel.com/new"
echo "2. Import guyro76/guyro76-codex repository"
echo "3. Add environment variables from .vercel-env.txt"
echo "4. Click Deploy"
echo ""
echo "App will be live at: https://guyro76-codex.vercel.app"
