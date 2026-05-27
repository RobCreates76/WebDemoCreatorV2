/**
 * Compare template vs agent site output visually.
 * Usage: node scripts/visual-compare.mjs [baseUrl] [mapsUrl]
 */
import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const BASE = process.argv[2] || "http://localhost:3000";
const MAPS_URL =
  process.argv[3] ||
  "https://www.google.com/maps/place/Roto-Rooter+Plumbing+%26+Water+Cleanup/@30.2672,-97.7431,17z";

const OUT = path.join(process.cwd(), ".demo-builder", "visual-compare");
fs.mkdirSync(OUT, { recursive: true });

async function buildMode(mode) {
  console.log(`\n=== Building ${mode} mode ===`);
  const started = Date.now();
  const res = await fetch(`${BASE}/api/research`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mapsUrl: MAPS_URL, buildMode: mode }),
  });
  const elapsed = ((Date.now() - started) / 1000).toFixed(1);
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`${mode} failed (${res.status}) after ${elapsed}s: ${err.slice(0, 500)}`);
  }
  const data = await res.json();
  console.log(`${mode} OK in ${elapsed}s — tier: ${data.site?.renderTier}, generatedBy: ${data.research?.profile?.generatedBy}`);
  return data;
}

async function screenshotHtml(html, name) {
  const file = path.join(OUT, `${name}.html`);
  fs.writeFileSync(file, html);
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`file://${file}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  await page.evaluate(() => {
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("visible"));
  });
  const png = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: png, fullPage: false });
  await page.screenshot({
    path: path.join(OUT, `${name}-full.png`),
    fullPage: true,
  });
  await browser.close();
  console.log(`Saved ${png}`);
  return png;
}

async function main() {
  const template = await buildMode("template");
  const agent = await buildMode("agent");

  const previewRes = async (site) => {
    const r = await fetch(`${BASE}/api/preview`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ site }),
    });
    if (!r.ok) throw new Error(`Preview failed: ${await r.text()}`);
    return r.text();
  };

  const templateHtml = await previewRes(template.site);
  const agentHtml = await previewRes(agent.site);

  const tHero = template.site.hero?.headline || "";
  const aHero = agent.site.hero?.headline || "";
  console.log("\nHeadline comparison:");
  console.log("  Template:", tHero);
  console.log("  Agent:   ", aHero);
  console.log("  Same headline?", tHero === aHero);
  console.log("  Template tier:", template.site.renderTier);
  console.log("  Agent tier:", agent.site.renderTier);
  console.log("  Agent has conversion band?", !!agent.site.premium?.conversionBand);
  console.log("  Template has conversion band?", !!template.site.premium?.conversionBand);

  await screenshotHtml(templateHtml, "template");
  await screenshotHtml(agentHtml, "agent");

  const summary = {
    mapsUrl: MAPS_URL,
    template: {
      renderTier: template.site.renderTier,
      headline: tHero,
      hasPremiumBlock: !!template.site.premium,
      generatedBy: template.research?.profile?.generatedBy,
    },
    agent: {
      renderTier: agent.site.renderTier,
      headline: aHero,
      hasPremiumBlock: !!agent.site.premium,
      generatedBy: agent.research?.profile?.generatedBy,
      researchMode: agent.research?.profile?.researchMode,
      webResearchSource: agent.research?.profile?.webResearchSource,
    },
    headlinesDifferent: tHero !== aHero,
  };
  fs.writeFileSync(path.join(OUT, "summary.json"), JSON.stringify(summary, null, 2));
  console.log("\nSummary written to", path.join(OUT, "summary.json"));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
