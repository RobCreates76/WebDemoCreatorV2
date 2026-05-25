# Demo Builder V2

Premium client demo site generator for Zoom presentations. Paste a Google Maps business link, optionally add their existing website and social profiles, and get a research dossier, conversion audit, and downloadable demo site.

## Features

- **Google Maps research** — Scrapes business name, address, phone, hours, reviews, photos, and category
- **Website audit** — 40+ rule-based conversion checks with ranked findings and suggested copy
- **Premium templates** — Six niche-specific design systems (home services, restaurant, professional, healthcare, beauty, retail)
- **Manual control** — Inline click-to-edit on preview + structured panel editor
- **ZIP export** — Self-contained static HTML/CSS/JS folder

## Setup

```bash
cd "Demo Builder V2"
npm install
npx playwright install chromium
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Workflow

1. Paste a Google Maps business URL
2. Optionally add their current website URL (triggers conversion audit)
3. Optionally add social media links (one per line)
4. Click **Research & Build Demo**
5. Review the research dossier and audit report
6. Enable **Manual control** to edit copy, colors, and sections
7. Click **Download Demo Site (ZIP)** for your Zoom presentation

## Google Maps URL formats supported

- `https://www.google.com/maps/place/...`
- `https://maps.app.goo.gl/...`
- `https://goo.gl/maps/...`

## Tech stack

- Next.js 15, TypeScript, Tailwind CSS, shadcn/ui
- Playwright (Maps scraping), Cheerio (website parsing)
- Zustand (editor state), JSZip (export)

## Future: AI upgrade

Add API keys to `.env` and enable `lib/ai/provider.ts` for LLM-powered copy and full brutal audit prose.
