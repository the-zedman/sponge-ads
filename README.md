# Sponge Ads

Self-hosted display ad server. Create ads, get a JavaScript embed snippet, track impressions and clicks.

Built with Next.js 16, Clerk, Neon Postgres, and Vercel Blob — deployed on Vercel.

## Setup

### 1. Clone and install

```bash
git clone https://github.com/the-zedman/sponge-ads
cd sponge-ads
npm install
```

### 2. Create services

- **Clerk** — create a free account at [clerk.com](https://clerk.com), create an application, copy your keys
- **Vercel** — import this repo at [vercel.com/new](https://vercel.com/new)
  - Add **Neon Postgres** storage integration
  - Add **Blob** storage integration

### 3. Environment variables

Copy `.env.local.example` to `.env.local` and fill in all values:

```bash
cp .env.local.example .env.local
```

Pull Vercel env vars locally:

```bash
vercel env pull .env.local
```

Then add your Clerk keys manually to `.env.local`.

### 4. Initialize the database

Once your app is running, POST to the setup endpoint once:

```bash
curl -X POST http://localhost:3000/api/setup \
  -H "Cookie: <your-auth-cookie>"
```

Or visit the dashboard while logged in and open the browser console:

```js
fetch('/api/setup', { method: 'POST' })
```

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Embedding ads

Each ad has a unique embed snippet. Copy it from the ad's detail page and paste it into any HTML page:

```html
<!-- Sponge Ad -->
<div id="sponge-ad-YOUR_AD_ID"></div>
<script async src="https://sponge.net/api/serve/YOUR_AD_ID"></script>
```

## Ad sizes supported

| Size | Dimensions |
|------|-----------|
| Medium Rectangle | 300×250 |
| Leaderboard | 728×90 |
| Half Page | 300×600 |
| Wide Skyscraper | 160×600 |
| Mobile Banner | 320×50 |
| Banner | 468×60 |
| Large Rectangle | 336×280 |
