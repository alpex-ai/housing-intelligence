#!/bin/bash

# Push Alpex Housing Dashboard to GitHub
# Run this script to initialize git and push to alpex-ai/housing-intelligence

REPO_URL="https://github.com/alpex-ai/housing-intelligence.git"
PROJECT_DIR="/Users/joey/.openclaw/workspace/projects/alpex-housing"

cd "$PROJECT_DIR"

echo "🚀 Initializing git repository..."
git init

echo "📦 Adding all files..."
git add .

echo "💾 Creating initial commit..."
git commit -m "Initial commit: Alpex Housing Intelligence Dashboard MVP

Features:
- Housing Health Index with trend visualization
- Interactive price and affordability charts
- Regional affordability breakdown
- Builder cost tracker
- Household expenses tracker
- Crash indicators dashboard
- FRED API integration with daily auto-sync
- Supabase backend with real-time data

Tech Stack:
- Next.js 14 + TypeScript
- Tailwind CSS + shadcn/ui
- Recharts for visualizations
- Supabase (PostgreSQL)
- Vercel deployment ready"

echo "🔗 Adding remote repository..."
git remote add origin "$REPO_URL"

echo "⬆️ Pushing to GitHub..."
git push -u origin main

echo "✅ Done! Repository pushed to $REPO_URL"
