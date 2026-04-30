# GazeTalk Platform — Deployment Guide

Aphasia rehabilitation tools for the Denmark pilot.
Deploy in ~10 minutes. Share a single URL with Prof. Hansen and Prof. Lund.

---

## What's included

| File | Description |
|---|---|
| `server.js` | Express proxy server — keeps API key hidden |
| `public/index.html` | Landing page |
| `public/trainer.html` | Conversation Trainer (Joakim's masterprompt) |
| `public/simulator.html` | Synthetic Patient Simulator (Qianyi's model) |
| `package.json` | Node dependencies |

---

## Deploy to Render (free, recommended)

### Step 1 — Push to GitHub
1. Create a new repository on github.com (can be private)
2. Upload all files in this folder to the repository

```
gazetalk-deploy/
├── server.js
├── package.json
├── public/
│   ├── index.html
│   ├── trainer.html
│   └── simulator.html
```

### Step 2 — Create a Render account
Go to render.com and sign up (free tier is sufficient)

### Step 3 — Create a new Web Service
1. Click **New → Web Service**
2. Connect your GitHub repository
3. Render auto-detects Node.js — settings should be:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free

### Step 4 — Add your API key
1. In Render dashboard → go to your service → **Environment**
2. Click **Add Environment Variable**
3. Key: `ANTHROPIC_API_KEY`
4. Value: your Anthropic API key (sk-ant-...)
5. Click **Save** — Render restarts automatically

### Step 5 — Share the URL
Render gives you a URL like:
```
https://gazetalk-pilot.onrender.com
```
Share this with Prof. Hansen and Prof. Haakon. That's it.

---

## Run locally (for testing before deploying)

```bash
# Install dependencies
npm install

# Add your API key
export ANTHROPIC_API_KEY=sk-ant-your-key-here

# Start server
npm start

# Open browser
http://localhost:3001
```

---

## Cost estimate

| Usage | Tokens | Cost |
|---|---|---|
| One trainer session (15 turns) | ~8,000 | ~$0.02 |
| One simulator run (5 turns) | ~5,000 | ~$0.01 |
| Both professors doing 10 demos each | ~130,000 | ~$0.50 |

A $5 Anthropic credit covers months of demo usage.

---

## Important notes

- Your API key is stored as an environment variable on Render's servers — never exposed to the browser
- Prof. Hansen and Prof. Haakon never see or need an API key
- The free Render tier spins down after 15 minutes of inactivity — first load after idle takes ~30 seconds
- Upgrade to Render Starter ($7/month) if you want always-on deployment

---

## File structure on Render

```
server.js          ← runs on Render's server
public/            ← served as static files to the browser
  index.html       ← landing page (gazetalk-pilot.onrender.com)
  trainer.html     ← gazetalk-pilot.onrender.com/trainer.html
  simulator.html   ← gazetalk-pilot.onrender.com/simulator.html
```

All API calls go: Browser → /chat (your Render server) → Anthropic API
Your key never leaves the server.
