import type { AgentVisualDesign, BusinessProfile, NicheType, ResearchData } from "@/lib/models/site-model";
import { generateAgentJson, getResolvedAgentInfo } from "@/lib/ai/provider";
import { INDUSTRY_PLAYBOOKS } from "@/lib/research/industry-playbooks";
import { ALL_NICHES, NICHE_LABELS } from "@/lib/generation/niche-detector";
import { buildBusinessProfile } from "@/lib/research/business-profiler";
import {
  getFrontendDesignPromptBlock,
} from "@/lib/generation/frontend-design";
import {
  getAgentVisualDesignPromptBlock,
  normalizeAgentVisualDesign,
} from "@/lib/generation/agent-visual-design";
import { curateAgentSiteImages } from "@/lib/media/agent-image-curation";
import { assessBusinessData } from "@/lib/research/business-data-assessment";
import { runAgentWebResearch } from "@/lib/research/web-research";

const VALID_NICHES = new Set<string>(ALL_NICHES);

const VALID_TONES = new Set([
  "premium",
  "professional",
  "warm",
  "urgent",
  "clinical",
  "aspirational",
]);

const VALID_BUYER_TYPES = new Set(["b2b", "b2c", "mixed"]);

function buildResearchDossier(research: ResearchData): string {
  const { business, website, socials, niche, nicheDetection } = research;

  const lines: string[] = [
    "## Business (Google Maps)",
    `Name: ${business.name}`,
    `Category: ${business.category}`,
    `City: ${business.city}`,
    `Address: ${business.address}`,
    `Phone: ${business.phone}`,
    `Rating: ${business.rating} (${business.reviewCount} reviews)`,
    `Description: ${business.description || "N/A"}`,
    `Attributes: ${business.attributes.join(", ") || "N/A"}`,
  ];

  if (business.reviews.length > 0) {
    lines.push("\n## Top Reviews");
    business.reviews.slice(0, 8).forEach((r, i) => {
      lines.push(`${i + 1}. [${r.rating}★] ${r.author}: "${r.text.slice(0, 300)}"`);
    });
  }

  if (website) {
    lines.push("\n## Existing Website");
    lines.push(`URL: ${website.url}`);
    lines.push(`Title: ${website.title || "N/A"}`);
    lines.push(`Meta: ${website.description || "N/A"}`);
    lines.push(`H1: ${website.h1 || "N/A"}`);
    lines.push(`Headings: ${website.headings.slice(0, 16).join(" | ") || "N/A"}`);
    lines.push(`Nav: ${website.navLinks.slice(0, 12).join(" | ") || "N/A"}`);
    lines.push(`Services detected: ${website.serviceHeadings.join(" | ") || "N/A"}`);
    lines.push(`Body snippet: ${website.bodySnippet.slice(0, 600) || "N/A"}`);
    lines.push(`CTAs on site: ${website.ctaTexts.join(", ") || "N/A"}`);
    lines.push(`Images found: ${website.images.length}`);
  }

  if (business.photos.length > 0) {
    lines.push(`\n## Business Photos (${business.photos.length} from Google Maps)`);
    lines.push("Real photos are available — copy should reference what customers actually see/experience.");
  }

  if (socials.length > 0) {
    lines.push("\n## Social Profiles");
    socials.forEach((s) => {
      lines.push(`${s.platform}: ${s.title || s.url} — ${s.description || ""}`);
    });
  }

  lines.push("\n## Rule-Based Niche Hint (you may override after analysis)");
  lines.push(`Suggested niche: ${niche} (${NICHE_LABELS[niche]})`);
  if (nicheDetection) {
    lines.push(`Confidence: ${nicheDetection.confidence}%`);
    lines.push(`Reason: ${nicheDetection.reason}`);
    lines.push(`Signals: ${nicheDetection.signals.join(", ") || "none"}`);
    if (nicheDetection.alternatives.length > 0) {
      lines.push(
        "Alternatives: " +
          nicheDetection.alternatives
            .slice(0, 4)
            .map((a) => `${a.label} (${a.score})`)
            .join(", ")
      );
    }
  }

  return lines.join("\n");
}

const RESEARCH_SYSTEM_PROMPT = `You are a senior conversion strategist preparing a DEMO website whose job is to WIN THE CLIENT — this site must look so good and sell so hard that the business owner signs on the spot.

Think like a top direct-response agency (Hormozi, Ogilvy, Schwartz): What does this business SELL? Who BUYS it? What keeps them up at night? What proof makes hesitation feel stupid? Why THIS business over every competitor on Google?

You receive THREE data layers — use ALL of them:
1. Scraped data (Google Maps, website, socials) — ground truth for name, location, phone, reviews
2. Live web research — additional facts OR niche conversion benchmarks (see research mode below)
3. Your strategic analysis — synthesize into a deal-closing website plan

RESEARCH MODE (set researchMode in your response):
- "business-specific": Rich business data found. Fill the demo with REAL facts about THIS company from scraped + web research. Mirror review language. Services must match what they actually offer.
- "niche-fallback": Sparse business data. Use web research on what's converting in this niche RIGHT NOW. Build the best possible demo using niche winners' patterns — but keep the business name, city, phone, and any real Maps data. Infer realistic services from niche standards, NOT fake awards or made-up stats.

Rules:
- Identify the core product/service and the buyer's #1 motivation (fear, desire, urgency, status, relief)
- Extract real customer language from reviews AND web research — mirror their words in future copy
- Map purchase triggers: urgency, trust, price, quality, convenience, expertise, risk reversal
- Pick the niche that best fits how this business should be MARKETED to close deals
- competitiveAngle = the killer reason a buyer picks THEM — weaponize review themes and ratings
- websiteStrategy = full funnel: pattern-interrupt hook → pain agitation → proof avalanche → irresistible offer → zero-friction CTA
- positioning = one sentence that would make a competitor nervous
- nicheBenchmarks = when in niche-fallback mode: 3-5 specific conversion patterns working in this space (hero style, CTA type, proof placement, section order)
- Do NOT invent fake awards, years in business, or statistics not in scraped/researched data

Return JSON only:
{
  "researchMode": "business-specific|niche-fallback",
  "niche": "one of: home-services, restaurant, professional-services, healthcare, beauty-wellness, retail-local, creative-media, general",
  "nicheReasoning": "2-3 sentences with specific evidence",
  "industryLabel": "Human-readable industry label",
  "subIndustry": "specific sub-industry",
  "audience": "who buys and why — be specific about their situation",
  "tone": "premium|professional|warm|urgent|clinical|aspirational",
  "buyerType": "b2b|b2c|mixed",
  "positioning": "one powerful sentence — benefit-led, not feature-led",
  "competitiveAngle": "what makes buyers choose THIS business over alternatives",
  "websiteStrategy": "4-5 sentences: hero hook, social proof angle, service framing, objection handling, CTA strategy",
  "nicheBenchmarks": ["specific converting pattern 1", "pattern 2", "pattern 3"],
  "keywords": ["buyer-intent keywords"],
  "reviewThemes": ["themes from actual review language"],
  "researchSummary": "4-5 sentence intelligence briefing — cite web research findings when available"
}`;

const COPY_SYSTEM_PROMPT = `You are an elite direct-response copywriter building a PREMIUM demo website designed to WIN THE CLIENT. This site must feel like a $50K agency build — bold, confident, impossible to ignore.

Every word sells. Every section closes. The business owner should see this demo and think "I NEED this website."

INSANE MARKETING FRAMEWORK — apply ruthlessly:
1. PATTERN INTERRUPT: Headline hits the outcome or pain immediately — never "Welcome to [Business]"
2. AGITATE → RELIEVE: Name what frustrates the buyer, then position this business as the obvious fix
3. PROOF AVALANCHE: Ratings, review counts, review themes, specifics — make skepticism feel irrational
4. VALUE STACK: Layer benefits in offerHook — free, fast, guaranteed, local, expert (only what's true)
5. RISK REVERSAL: Free estimates, no obligation, satisfaction guaranteed — remove every reason to wait
6. URGENCY (honest only): Same-day, limited slots, booking windows — only if data supports it

Copy rules:
- Headlines = transformation, domination, or relief ("Stop Losing Sleep Over Leaks" not "Plumbing Services")
- Subheads = proof + promise in one punch ("{rating}★ from {reviews}+ neighbors who stopped calling anyone else")
- heroEyebrow = credibility flex ("{city}'s Highest-Rated {category}" / "#1 Choice for {audience}")
- heroHighlight = the 1-3 most visceral words from the headline (e.g. "Done Right", "Same-Day", "Zero Stress")
- Services = outcome titles ("Emergency Fixed Tonight" not "Emergency Repairs") + benefit-first descriptions
- Value props = competitive weapons ("Why {city} Stops Shopping Around" energy)
- FAQ = objection demolition (price, timing, trust, "why you vs. them")
- CTAs = command verbs with implied value ("Book Your Free Strategy Call", "Claim Your Free Estimate", "Lock In Your Table")
- Primary CTA should drive toward BOOKING A CALL or CONSULTATION when buyerType is b2b or niche is professional/creative — never weak "Learn More" or "Submit"
- offerHook = stacked value props with · separators — read like a deal you'd be dumb to pass up
- marqueeItems = 5-6 scroll-stopping phrases (mix proof, offers, urgency, local pride)
- sectionHeadlines = sell the section ("What You Get" not "Services", "Why We're the Obvious Choice" not "About Us")
- stats = 3 numbers that impress from REAL data only
- Do NOT invent fake awards, years in business, or statistics not in the data
- When researchMode is niche-fallback: services/value props may be inferred from niche benchmarks + category, but stats must only use scraped Maps data (rating, review count, city)
- When researchMode is business-specific: every service and value prop must trace to scraped data or web research findings
- Tone: confident, specific, premium — never generic, never corporate mush
- sectionLeads = one specific, benefit-led sentence per section — NEVER generic filler like "Expert solutions tailored to your goals"
- conversionBand = mid-page booking moment: pattern-interrupt headline, value-stacked subheadline, reassurance line with · separators

Return JSON only:
{
  "heroEyebrow": "short credibility label above headline (e.g. 'Your Area's Top-Rated Plumber')",
  "heroHighlight": "exact phrase from headline to emphasize visually",
  "offerHook": "value props line with · separators",
  "stats": [{"value": "4.9", "label": "Star Rating"}, {"value": "500+", "label": "Happy Clients"}],
  "marqueeItems": ["short punchy phrase", "another phrase"],
  "services": [{"title": "...", "description": "..."}],
  "valueProps": [{"title": "...", "description": "..."}],
  "faq": [{"question": "...", "answer": "..."}],
  "headlines": {"headline": "...", "subheadline": "..."},
  "ctas": {"primary": "...", "secondary": "..."},
  "trustBadges": ["badge1", "badge2", "badge3"],
  "sectionHeadlines": {
    "services": "...",
    "whyUs": "...",
    "gallery": "...",
    "testimonials": "...",
    "faq": "...",
    "contact": "..."
  },
  "sectionLeads": {
    "services": "1 sentence — specific section intro",
    "whyUs": "1 sentence — why this business wins",
    "gallery": "1 sentence — visual proof angle",
    "testimonials": "1 sentence — social proof hook",
    "faq": "1 sentence — objection-handling frame",
    "contact": "1 sentence — booking invitation"
  },
  "conversionBand": {
    "headline": "mid-page headline driving toward booking a call",
    "subheadline": "1 sentence stacking value",
    "reassurance": "No obligation · Free consult · Fast response"
  },
  "metaTitle": "SEO title with business name, city, and buyer intent",
  "metaDescription": "155-char description that sells the click"
}`;

interface AgentResearchResponse {
  researchMode?: "business-specific" | "niche-fallback";
  niche?: string;
  nicheReasoning?: string;
  industryLabel?: string;
  subIndustry?: string;
  audience?: string;
  tone?: string;
  buyerType?: string;
  positioning?: string;
  competitiveAngle?: string;
  websiteStrategy?: string;
  nicheBenchmarks?: string[];
  keywords?: string[];
  reviewThemes?: string[];
  researchSummary?: string;
}

interface AgentCopyResponse {
  heroEyebrow?: string;
  heroHighlight?: string;
  offerHook?: string;
  stats?: { value: string; label: string }[];
  marqueeItems?: string[];
  services?: { title: string; description: string }[];
  valueProps?: { title: string; description: string }[];
  faq?: { question: string; answer: string }[];
  headlines?: { headline: string; subheadline: string };
  ctas?: { primary: string; secondary: string };
  trustBadges?: string[];
  sectionHeadlines?: BusinessProfile["sectionHeadlines"];
  sectionLeads?: BusinessProfile["sectionLeads"];
  conversionBand?: BusinessProfile["conversionBand"];
  metaTitle?: string;
  metaDescription?: string;
  visualDesign?: AgentVisualDesign;
}

function resolveNiche(raw: string | undefined, fallback: NicheType): NicheType {
  if (raw && VALID_NICHES.has(raw)) return raw as NicheType;
  return fallback;
}

function requireAgentField<T>(value: T | undefined | null, field: string): T {
  if (value === undefined || value === null || (Array.isArray(value) && value.length === 0)) {
    throw new Error(`AI agent did not return required field: ${field}. Try a different model.`);
  }
  return value;
}

export async function buildAgentProfile(
  research: ResearchData
): Promise<BusinessProfile> {
  const dossier = buildResearchDossier(research);
  const agentInfo = getResolvedAgentInfo();
  const assessment = assessBusinessData(research);

  // Phase 0: Live web research — business-specific or niche fallback
  const webResearch = await runAgentWebResearch(research, research.niche);
  const fullDossier = `${dossier}\n\n${webResearch.dossier}`;

  // Phase 1: Deep research & niche strategy (synthesizes scraped + web data)
  const analysis = await generateAgentJson<AgentResearchResponse>(
    RESEARCH_SYSTEM_PROMPT,
    `Analyze this business and produce a research & website strategy brief.

${fullDossier}

Available niches: ${ALL_NICHES.map((n) => `${n} (${NICHE_LABELS[n]})`).join(", ")}

IMPORTANT: Web research mode is "${webResearch.mode}" (data richness: ${webResearch.dataRichness}).
${webResearch.mode === "niche-fallback"
  ? "Business data is sparse — use web research on what's converting in this niche RIGHT NOW to design the best possible demo. Keep real Maps identity (name, city, phone) but build services/copy from niche winners."
  : "Rich business data found — fill the demo with specific facts about THIS business from scraped data and web research. Do not use generic filler."}

Return the research JSON now.`
  );

  const niche = resolveNiche(analysis.niche, research.niche);
  const templateProfile = buildBusinessProfile({ ...research, niche });
  const playbook = INDUSTRY_PLAYBOOKS[niche];

  const tone = VALID_TONES.has(analysis.tone as BusinessProfile["tone"])
    ? (analysis.tone as BusinessProfile["tone"])
    : playbook.tone;

  const buyerType = VALID_BUYER_TYPES.has(analysis.buyerType as BusinessProfile["buyerType"])
    ? (analysis.buyerType as BusinessProfile["buyerType"])
    : playbook.buyerType;

  const strategyBrief = [
    `Research mode: ${analysis.researchMode || webResearch.mode} (data richness: ${assessment.richness})`,
    `Niche: ${niche} (${analysis.industryLabel || playbook.label})`,
    `Reasoning: ${analysis.nicheReasoning || "N/A"}`,
    `Positioning: ${analysis.positioning || playbook.positioning}`,
    `Competitive angle: ${analysis.competitiveAngle || "N/A"}`,
    `Audience: ${analysis.audience || playbook.audience}`,
    `Tone: ${tone} | Buyer: ${buyerType}`,
    `Website strategy: ${analysis.websiteStrategy || "N/A"}`,
    `Niche benchmarks: ${(analysis.nicheBenchmarks || []).join(" | ") || "N/A"}`,
    `Review themes: ${(analysis.reviewThemes || []).join(", ") || "N/A"}`,
    `Keywords: ${(analysis.keywords || []).join(", ") || "N/A"}`,
    `Web research source: ${webResearch.source} (${webResearch.findings.length} findings)`,
  ].join("\n");

  // Phase 2: Full website copy from strategy
  const copy = await generateAgentJson<AgentCopyResponse>(
    COPY_SYSTEM_PROMPT + "\n\n" + getFrontendDesignPromptBlock(niche) + "\n\n" + getAgentVisualDesignPromptBlock(),
    `Write all website copy for this business using the research brief below.

IMPORTANT: This is a DEMO site to WIN THE CLIENT. Write copy so bold and conversion-focused that the business owner signs immediately. Every headline should sell. Every CTA should command action. Stack value. Kill objections. Make competitors look boring.

Research mode: ${analysis.researchMode || webResearch.mode}
${(analysis.researchMode || webResearch.mode) === "niche-fallback"
  ? "SPARSE DATA MODE: Build copy from niche conversion benchmarks in the research brief. Use real business name/city/phone/rating from Maps. Infer services from niche standards — do NOT invent fake stats."
  : "BUSINESS-SPECIFIC MODE: Use scraped reviews, website content, and web research findings. Copy must feel written FOR this exact business."}

## Business Data
${fullDossier}

## Research & Strategy Brief (follow this closely)
${strategyBrief}

Playbook reference for ${niche}: ${playbook.positioning}

Generate the copy JSON now.`
  );

  const visualDesign = normalizeAgentVisualDesign(
    copy.visualDesign,
    niche,
    research.website?.colors
  );

  const curatedImages = curateAgentSiteImages(
    research.business,
    research.website,
    niche,
    visualDesign,
    {
      businessName: research.business.name,
      category: research.business.category,
      niche,
      keywords: analysis.keywords?.slice(0, 12) || templateProfile.keywords,
      stockHero: templateProfile.heroImage,
      stockGallery: templateProfile.galleryImages,
    }
  );

  return {
    niche,
    industryLabel: analysis.industryLabel || playbook.label,
    subIndustry: analysis.subIndustry,
    audience: analysis.audience || playbook.audience,
    tone,
    buyerType,
    positioning: requireAgentField(analysis.positioning, "positioning"),
    keywords: analysis.keywords?.slice(0, 12) || [],
    services: requireAgentField(copy.services, "services").slice(0, 6),
    valueProps: requireAgentField(copy.valueProps, "valueProps").slice(0, 4),
    faq: requireAgentField(copy.faq, "faq").slice(0, 6),
    headlines: requireAgentField(copy.headlines, "headlines"),
    ctas: requireAgentField(copy.ctas, "ctas"),
    trustBadges: requireAgentField(copy.trustBadges, "trustBadges").slice(0, 4),
    sectionHeadlines: requireAgentField(copy.sectionHeadlines, "sectionHeadlines"),
    sectionLeads: copy.sectionLeads,
    conversionBand: copy.conversionBand,
    heroImage: curatedImages.hero,
    galleryImages: curatedImages.gallery,
    researchSummary: analysis.researchSummary || strategyBrief,
    reviewThemes: analysis.reviewThemes?.slice(0, 5) || [],
    researchMode: analysis.researchMode || webResearch.mode,
    dataRichness: assessment.richness,
    webResearchSource: webResearch.source,
    webResearchQueries: webResearch.queries,
    generatedBy: "agent",
    agentModel: agentInfo?.model,
    nicheReasoning: analysis.nicheReasoning,
    websiteStrategy: analysis.websiteStrategy,
    competitiveAngle: analysis.competitiveAngle,
    metaTitle: copy.metaTitle,
    metaDescription: copy.metaDescription,
    heroEyebrow: copy.heroEyebrow,
    heroHighlight: copy.heroHighlight,
    offerHook: copy.offerHook,
    stats: copy.stats?.slice(0, 3),
    marqueeItems: copy.marqueeItems?.slice(0, 6),
    visualDesign,
  };
}
