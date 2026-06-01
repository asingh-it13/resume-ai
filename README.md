# Resume.AI — Deployment Guide

## Deploy in 3 Steps

### Step 1 — Get API Keys
- **Anthropic:** https://console.anthropic.com → API Keys → Create Key
- **Upstash Redis (free):** https://upstash.com → New Database → copy REST URL + Token

### Step 2 — Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/resume-ai.git
git push -u origin main
```

### Step 3 — Deploy on Vercel
1. https://vercel.com → New Project → import GitHub repo
2. Add Environment Variables:
   - `ANTHROPIC_API_KEY` = your sk-ant-... key
   - `UPSTASH_REDIS_REST_URL` = from Upstash
   - `UPSTASH_REDIS_REST_TOKEN` = from Upstash
3. Click **Deploy** ✅

## What's Included
- ATS scoring (8 systems, local — zero AI cost)
- AI optimization via Claude API with Redis caching
- Interview prep, career roadmap, LinkedIn optimizer
- Rate limiting (3 AI requests/IP/hour)
- Community stats
- No login, no database, GDPR compliant

## Troubleshooting
- **AI not working:** Check ANTHROPIC_API_KEY in Vercel env vars
- **Redis errors:** App works without Redis (falls back to mock data)
- **Upload fails:** Max 5MB. Try TXT if PDF fails.
