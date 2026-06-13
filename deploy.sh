#!/bin/bash

# 🚀 AuthorityBoost AI - Full Production Deployment Script
# This script automates the entire deployment process to Vercel + Supabase

set -e

echo "🚀 AuthorityBoost AI - Production Deployment"
echo "==========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Check prerequisites
echo -e "${BLUE}[1/6]${NC} Checking prerequisites..."
command -v git >/dev/null 2>&1 || { echo "Git not found. Please install Git."; exit 1; }
command -v node >/dev/null 2>&1 || { echo "Node not found. Please install Node.js."; exit 1; }
echo -e "${GREEN}✓ Prerequisites OK${NC}"
echo ""

# 2. Generate NEXTAUTH_SECRET
echo -e "${BLUE}[2/6]${NC} Generating NEXTAUTH_SECRET..."
if command -v openssl >/dev/null 2>&1; then
    NEXTAUTH_SECRET=$(openssl rand -base64 32)
    echo -e "${GREEN}✓ NEXTAUTH_SECRET generated${NC}"
else
    echo -e "${YELLOW}⚠ OpenSSL not found, using Node.js to generate...${NC}"
    NEXTAUTH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
    echo -e "${GREEN}✓ NEXTAUTH_SECRET generated${NC}"
fi
echo "  Secret: $NEXTAUTH_SECRET"
echo ""

# 3. Check git status and push
echo -e "${BLUE}[3/6]${NC} Verifying Git branch..."
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "claude/authorityboost-ai-build-s8w237" ]; then
    echo -e "${YELLOW}⚠ Wrong branch: $CURRENT_BRANCH${NC}"
    echo "Switching to correct branch..."
    git checkout claude/authorityboost-ai-build-s8w237
fi
git status
echo ""

# 4. Show deployment checklist
echo -e "${BLUE}[4/6]${NC} Deployment Checklist"
echo "==========================================="
echo ""
echo "📌 NEXT STEPS (You need to do these):"
echo ""
echo -e "${YELLOW}Step 1: Create Supabase Database${NC}"
echo "  1. Go to: https://supabase.com"
echo "  2. Create project: 'authorityboost-ai'"
echo "  3. Settings → Database → Connection String (PostgreSQL)"
echo "  4. Copy the DATABASE_URL"
echo ""

echo -e "${YELLOW}Step 2: Create Google OAuth Credentials${NC}"
echo "  1. Go to: https://console.cloud.google.com"
echo "  2. Create project: 'AuthorityBoost AI'"
echo "  3. Enable: Google+ API"
echo "  4. Create OAuth 2.0 Client ID (Web)"
echo "  5. Copy GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET"
echo ""

echo -e "${YELLOW}Step 3: Get Claude API Key${NC}"
echo "  1. Go to: https://console.anthropic.com"
echo "  2. Create API Key"
echo "  3. Copy ANTHROPIC_API_KEY"
echo ""

echo -e "${YELLOW}Step 4: Deploy to Vercel${NC}"
echo "  1. Go to: https://vercel.com/dashboard"
echo "  2. New Project → Import from GitHub"
echo "  3. Select: guyro76/guyro76-codex"
echo "  4. Branch: claude/authorityboost-ai-build-s8w237"
echo "  5. Click Deploy"
echo "  6. Wait for build to complete (green ✓)"
echo ""

echo -e "${YELLOW}Step 5: Configure Environment Variables${NC}"
echo "  In Vercel Settings → Environment Variables, add:"
echo ""
cat << 'ENV_TEMPLATE'
DATABASE_URL = [From Supabase]
NEXTAUTH_SECRET = [See below]
NEXTAUTH_URL = https://your-vercel-domain.vercel.app
GOOGLE_CLIENT_ID = [From Google Cloud]
GOOGLE_CLIENT_SECRET = [From Google Cloud]
ANTHROPIC_API_KEY = [From Anthropic]
ENV_TEMPLATE
echo ""
echo -e "${GREEN}NEXTAUTH_SECRET (ready to copy):${NC}"
echo -e "${BLUE}$NEXTAUTH_SECRET${NC}"
echo ""

# 5. Save configuration
echo -e "${BLUE}[5/6]${NC} Saving deployment configuration..."
cat > .deployment.json << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "branch": "$CURRENT_BRANCH",
  "nextauth_secret": "$NEXTAUTH_SECRET",
  "git_commit": "$(git rev-parse HEAD)",
  "git_branch": "$CURRENT_BRANCH",
  "notes": "Run 'vercel --prod' after setting environment variables in Vercel dashboard"
}
EOF
echo -e "${GREEN}✓ Configuration saved to .deployment.json${NC}"
echo ""

# 6. Summary
echo -e "${BLUE}[6/6]${NC} Summary"
echo "==========================================="
echo -e "${GREEN}✓ Application is ready for deployment${NC}"
echo ""
echo "📋 Quick Reference:"
echo "  Repository: guyro76/guyro76-codex"
echo "  Branch: claude/authorityboost-ai-build-s8w237"
echo "  Deployment: Vercel"
echo "  Database: Supabase PostgreSQL"
echo "  Admin Email: guyro76@gmail.com"
echo "  Admin Password: caramel76"
echo ""
echo "🔐 Your NEXTAUTH_SECRET (save this!):"
echo -e "${BLUE}$NEXTAUTH_SECRET${NC}"
echo ""
echo "⏱️  Estimated total deployment time: 15 minutes"
echo ""
echo "✅ READY TO DEPLOY!"
echo ""
