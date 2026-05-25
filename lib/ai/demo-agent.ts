import type {
  BusinessProfile,
  NicheType,
  ResearchData,
} from "@/lib/models/site-model";
import { generateAgentJson } from "@/lib/ai/provider";
import { INDUSTRY_PLAYBOOKS } from "@/lib/research/industry-playbooks";
import { buildBusinessProfile } from "@/lib/research/business-profiler";

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
    business.reviews.slice(0, 6).forEach((r, i) => {
      lines.push(`${i + 1}. [${r.rating}★] ${r.author}: "${r.text.slice(0, 250)}"`);
    });
  }

  if (website) {
    lines.push("\n## Existing Website");
    lines.push(`URL: ${website.url}`);
    lines.push(`Title: ${website.title || "N/A"}`);
    lines.push(`Meta: ${website.description || "N/A"}`);
    lines.push(`H1: ${website.h1 || "N/A"}`);
    lines.push(`Headings: ${website.headings.slice(0, 12).join(" | ") || "N/A"}`);
    lines.push(`Nav: ${website.navLinks.slice(0, 10).join(" | ") || "N/A"}`);
    lines.push(`Services detected: ${website.serviceHeadings.join(" | ") || "N/A"}`);
    lines.push(`Body snippet: ${website.bodySnippet.slice(0, 400) || "N/A"}`);
    lines.push(`CTAs on site: ${website.ctaTexts.join(", ") || "N/A"}`);
  }

  if (socials.length > 0) {
    lines.push("\n## Social Profiles");
    socials.forEach((s) => {
      lines.push(`${s.platform}: ${s.title || s.url} — ${s.description || ""}`);
    });
  }

  lines.push("\n## Niche Detection");
  lines.push(`Detected niche: ${niche}`);
  if (nicheDetection) {
    lines.push(`Confidence: ${nicheDetection.confidence}%`);
    lines.push(`Reason: ${nicheDetection.reason}`);
    lines.push(`Signals: ${nicheDetection.signals.join(", ")}`);
  }

  return lines.join("\n");
}

const SYSTEM_PROMPT = `You are a senior conversion copywriter and brand strategist building premium demo websites for local businesses before sales Zoom calls.

Your job: analyze real business research data and produce professional, niche-specific website copy that feels custom-written — NOT generic AI slop.

Rules:
- Use the business's REAL name, city, category, services, and review language
- Headlines must be specific to THIS business and industry — never generic
- Services must reflect what this business actually offers (from website, reviews, category)
- FAQ answers must reference the business name and city
- Tone must match the industry (legal=professional, restaurant=warm, home services=urgent, video production=premium)
- CTAs must match buyer intent (B2B vs B2C)
- Do NOT invent fake awards, years in business, or statistics not in the data
- Write like a $10k agency — confident, clear, conversion-focused

Return JSON matching this exact structure:
{
  "niche": "one of: home-services, restaurant, professional-services, healthcare, beauty-wellness, retail-local, creative-media, general",
  "industryLabel": "Human-readable industry label",
  "subIndustry": "optional specific sub-industry",
  "audience": "target audience description",
  "tone": "premium|professional|warm|urgent|clinical|aspirational",
  "buyerType": "b2b|b2c|mixed",
  "positioning": "one sentence positioning statement",
  "keywords": ["keyword1", "keyword2"],
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
  "researchSummary": "2-3 sentence intelligence summary of this business",
  "reviewThemes": ["theme1", "theme2"]
}`;

interface AgentProfileResponse {
  niche?: string;
  industryLabel?: string;
  subIndustry?: string;
  audience?: string;
  tone?: string;
  buyerType?: string;
  positioning?: string;
  keywords?: string[];
  services?: { title: string; description: string }[];
  valueProps?: { title: string; description: string }[];
  faq?: { question: string; answer: string }[];
  headlines?: { headline: string; subheadline: string };
  ctas?: { primary: string; secondary: string };
  trustBadges?: string[];
  sectionHeadlines?: BusinessProfile["sectionHeadlines"];
  researchSummary?: string;
  reviewThemes?: string[];
}

function normalizeProfile(
  raw: AgentProfileResponse,
  research: ResearchData,
  fallback: BusinessProfile
): BusinessProfile {
  const tone = VALID_TONES.has(raw.tone as BusinessProfile["tone"])
    ? (raw.tone as BusinessProfile["tone"])
    : fallback.tone;

  const buyerType = VALID_BUYER_TYPES.has(raw.buyerType as BusinessProfile["buyerType"])
    ? (raw.buyerType as BusinessProfile["buyerType"])
    : fallback.buyerType;

  return {
    niche: (raw.niche as NicheType) || research.niche,
    industryLabel: raw.industryLabel || fallback.industryLabel,
    subIndustry: raw.subIndustry || fallback.subIndustry,
    audience: raw.audience || fallback.audience,
    tone,
    buyerType,
    positioning: raw.positioning || fallback.positioning,
    keywords: raw.keywords?.length ? raw.keywords.slice(0, 12) : fallback.keywords,
    services: raw.services?.length ? raw.services.slice(0, 6) : fallback.services,
    valueProps: raw.valueProps?.length ? raw.valueProps.slice(0, 4) : fallback.valueProps,
    faq: raw.faq?.length ? raw.faq.slice(0, 6) : fallback.faq,
    headlines: raw.headlines?.headline
      ? raw.headlines
      : fallback.headlines,
    ctas: raw.ctas?.primary
      ? raw.ctas
      : fallback.ctas,
    trustBadges: raw.trustBadges?.length
      ? raw.trustBadges.slice(0, 4)
      : fallback.trustBadges,
    sectionHeadlines: {
      ...fallback.sectionHeadlines,
      ...(raw.sectionHeadlines || {}),
    },
    heroImage: fallback.heroImage,
    galleryImages: fallback.galleryImages,
    researchSummary: raw.researchSummary || fallback.researchSummary,
    reviewThemes: raw.reviewThemes?.length
      ? raw.reviewThemes.slice(0, 5)
      : fallback.reviewThemes,
  };
}

export async function buildAgentProfile(
  research: ResearchData
): Promise<BusinessProfile> {
  const fallback = buildBusinessProfile(research);
  const dossier = buildResearchDossier(research);

  const userPrompt = `Analyze this business and generate premium demo website copy.

${dossier}

Detected niche enum value to use unless you have strong reason to change: "${research.niche}"
Playbook context for this niche: ${INDUSTRY_PLAYBOOKS[research.niche].positioning}

Generate the JSON profile now.`;

  const raw = await generateAgentJson<AgentProfileResponse>(
    SYSTEM_PROMPT,
    userPrompt
  );

  return normalizeProfile(raw, research, fallback);
}
