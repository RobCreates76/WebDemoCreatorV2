import "server-only";

import * as cheerio from "cheerio";
import type { NicheType, ResearchData } from "@/lib/models/site-model";
import { NICHE_LABELS } from "@/lib/generation/niche-detector";
import {
  assessBusinessData,
  type DataRichness,
} from "@/lib/research/business-data-assessment";

export type WebResearchMode = "business-specific" | "niche-fallback";

export interface WebResearchFinding {
  title: string;
  url: string;
  snippet: string;
}

export interface WebResearchResult {
  mode: WebResearchMode;
  dataRichness: DataRichness;
  richnessScore: number;
  queries: string[];
  findings: WebResearchFinding[];
  dossier: string;
  source: "exa" | "duckduckgo" | "none";
}

interface ExaSearchResult {
  results?: {
    title?: string;
    url?: string;
    text?: string;
    highlights?: string[];
  }[];
}

async function searchExa(
  query: string,
  numResults = 5
): Promise<WebResearchFinding[]> {
  const apiKey = process.env.EXA_API_KEY?.trim();
  if (!apiKey) return [];

  try {
    const res = await fetch("https://api.exa.ai/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        query,
        type: "auto",
        numResults,
        contents: {
          text: { maxCharacters: 1200 },
          highlights: { numSentences: 2 },
        },
      }),
      signal: AbortSignal.timeout(20000),
    });

    if (!res.ok) return [];

    const data = (await res.json()) as ExaSearchResult;
    return (data.results ?? [])
      .map((r) => ({
        title: r.title || r.url || "Result",
        url: r.url || "",
        snippet: (
          r.highlights?.join(" ") ||
          r.text?.slice(0, 900) ||
          ""
        ).replace(/\s+/g, " ").trim(),
      }))
      .filter((r) => r.snippet.length > 40)
      .slice(0, numResults);
  } catch {
    return [];
  }
}

async function searchDuckDuckGo(
  query: string,
  numResults = 5
): Promise<WebResearchFinding[]> {
  try {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; DemoBuilderResearch/1.0; +https://demo-builder.local)",
      },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return [];

    const html = await res.text();
    const $ = cheerio.load(html);
    const findings: WebResearchFinding[] = [];

    $(".result").each((_, el) => {
      if (findings.length >= numResults) return false;
      const title = $(el).find(".result__title").text().trim();
      const href = $(el).find(".result__url").attr("href") || "";
      const snippet = $(el).find(".result__snippet").text().trim();
      if (title && snippet) {
        findings.push({ title, url: href, snippet });
      }
    });

    return findings;
  } catch {
    return [];
  }
}

async function runSearch(
  query: string,
  numResults = 5
): Promise<{ findings: WebResearchFinding[]; source: "exa" | "duckduckgo" | "none" }> {
  const exa = await searchExa(query, numResults);
  if (exa.length > 0) return { findings: exa, source: "exa" };

  const ddg = await searchDuckDuckGo(query, numResults);
  if (ddg.length > 0) return { findings: ddg, source: "duckduckgo" };

  return { findings: [], source: "none" };
}

function buildBusinessQueries(research: ResearchData): string[] {
  const { business } = research;
  const city = business.city || "local area";
  const category = business.category.split(/[·,]/)[0]?.trim() || "business";
  const name = business.name;

  return [
    `"${name}" ${city} ${category} reviews services what customers say`,
    `"${name}" ${city} about specialties offerings`,
    `"${name}" ${city} ${category} competitors why choose`,
    `${category} ${city} customer pain points buying triggers`,
  ];
}

function buildNicheQueries(niche: NicheType, research: ResearchData): string[] {
  const label = NICHE_LABELS[niche];
  const category = research.business.category.split(/[·,]/)[0]?.trim() || label;
  const city = research.business.city || "United States";

  return [
    `best converting ${label} website design landing page 2025 2026 hero CTA layout`,
    `top ${category} websites conversion optimization what works ${city}`,
    `${label} website copy examples services section high converting`,
  ];
}

function formatFindingsBlock(
  mode: WebResearchMode,
  queries: string[],
  findings: WebResearchFinding[],
  source: string,
  assessment: ReturnType<typeof assessBusinessData>
): string {
  const lines: string[] = [
    "## Live Web Research (Agent Phase 0)",
    `Research mode: ${mode === "business-specific" ? "BUSINESS-SPECIFIC — fill the demo with real facts about this company" : "NICHE FALLBACK — sparse business data; model the site on what's converting in this niche right now"}`,
    `Data richness: ${assessment.richness} (score ${assessment.score}/100)`,
    `Known signals: ${assessment.signals.join("; ") || "none"}`,
    `Data gaps: ${assessment.gaps.join("; ") || "none"}`,
    `Search source: ${source}`,
    "",
    "### Queries executed",
    ...queries.map((q, i) => `${i + 1}. ${q}`),
  ];

  if (findings.length === 0) {
    lines.push(
      "",
      "### Findings",
      "No live web results returned. Rely on scraped Maps/website data and niche playbook benchmarks. Do NOT invent fake awards or statistics."
    );
    return lines.join("\n");
  }

  lines.push("", "### Findings (use these facts in copy and service lists)");
  findings.forEach((f, i) => {
    lines.push(
      "",
      `#### ${i + 1}. ${f.title}`,
      f.url ? `URL: ${f.url}` : "",
      f.snippet
    );
  });

  if (mode === "niche-fallback") {
    lines.push(
      "",
      "### Niche fallback instructions",
      "- Build the demo using current high-converting patterns discovered above for this niche.",
      "- Use the business name, city, phone, and any Maps data — but infer services, value props, and copy from niche winners.",
      "- Never invent fake review counts, awards, or years in business.",
      "- CTAs and section structure should mirror what's working in the niche TODAY."
    );
  } else {
    lines.push(
      "",
      "### Business-specific instructions",
      "- Prioritize facts from web research + scraped reviews/website over generic niche templates.",
      "- Mirror real customer language from reviews and web mentions.",
      "- Services and value props must reflect what this business actually offers.",
      "- Only use statistics that appear in scraped or researched data."
    );
  }

  return lines.join("\n");
}

function mergeSearchResults(
  batches: { findings: WebResearchFinding[]; source: "exa" | "duckduckgo" | "none" }[]
): { findings: WebResearchFinding[]; source: "exa" | "duckduckgo" | "none" } {
  const allFindings: WebResearchFinding[] = [];
  let source: "exa" | "duckduckgo" | "none" = "none";

  for (const batch of batches) {
    if (batch.source !== "none") source = batch.source;
    for (const finding of batch.findings) {
      const duplicate = allFindings.some(
        (f) => f.url === finding.url || f.snippet === finding.snippet
      );
      if (!duplicate) allFindings.push(finding);
    }
  }

  return { findings: allFindings, source };
}

async function runSearchesParallel(
  queries: string[],
  numResults = 5
): Promise<{ findings: WebResearchFinding[]; source: "exa" | "duckduckgo" | "none" }> {
  const settled = await Promise.allSettled(
    queries.map((query) => runSearch(query, numResults))
  );

  const batches = settled
    .filter(
      (r): r is PromiseFulfilledResult<Awaited<ReturnType<typeof runSearch>>> =>
        r.status === "fulfilled"
    )
    .map((r) => r.value);

  return mergeSearchResults(batches);
}

export async function runAgentWebResearch(
  research: ResearchData,
  niche: NicheType
): Promise<WebResearchResult> {
  const assessment = assessBusinessData(research);
  const mode: WebResearchMode =
    assessment.richness === "sparse" ? "niche-fallback" : "business-specific";

  const queries =
    mode === "business-specific"
      ? buildBusinessQueries(research)
      : buildNicheQueries(niche, research);

  const primary = await runSearchesParallel(queries.slice(0, 4), 5);
  let allFindings = primary.findings;
  let source = primary.source;

  // Even with rich data, pull current niche conversion patterns for layout/copy inspiration
  if (mode === "business-specific") {
    const nicheQuery = buildNicheQueries(niche, research)[0];
    const nicheResult = await runSearch(nicheQuery, 3);
    if (nicheResult.source !== "none") source = nicheResult.source;
    const merged = mergeSearchResults([
      { findings: allFindings, source },
      nicheResult,
    ]);
    allFindings = merged.findings;
    source = merged.source;
  }

  // Sparse mode with thin web results: also run one business query as backup
  if (mode === "niche-fallback" && allFindings.length < 3) {
    const backup = await runSearch(
      `"${research.business.name}" ${research.business.city || ""}`.trim(),
      3
    );
    if (backup.source !== "none") source = backup.source;
    const merged = mergeSearchResults([
      { findings: allFindings, source },
      backup,
    ]);
    allFindings = merged.findings;
    source = merged.source;
  }

  const dossier = formatFindingsBlock(
    mode,
    queries,
    allFindings.slice(0, 10),
    source,
    assessment
  );

  return {
    mode,
    dataRichness: assessment.richness,
    richnessScore: assessment.score,
    queries,
    findings: allFindings.slice(0, 10),
    dossier,
    source,
  };
}
