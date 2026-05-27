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
npm run dev
```

`npm install` also installs the Playwright Chromium browser (required for Google Maps scraping).

### AI Agent mode (Ollama Cloud)

1. Click **Agent Settings** (top right)
2. Choose **Ollama Cloud**, paste your API key from [ollama.com → Settings → API Keys](https://ollama.com/settings/keys)
3. Pick a cloud model (e.g. `kimi-k2.6`)
4. Switch build mode to **AI Agent** and run research

### Troubleshooting

| Symptom | Fix |
|---------|-----|
| `Playwright browser not installed` | Run `npx playwright install chromium` |
| `Cannot find module .../parse5/...` (external drive) | Run `npm run fix:perms` then restart the dev server |
| `Cannot find module '../lightningcss.win32-x64-msvc.node'` | Run `npm install` (postinstall installs Windows/macOS/Linux native CSS binaries) |
| Generic `Server error (500)` | Stop all dev servers, run `npm run dev:clean`, check the terminal for the real error |

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
