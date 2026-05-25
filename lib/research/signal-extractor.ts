import type { BusinessData, WebsiteData, SocialData } from "@/lib/models/site-model";

export interface ExtractedSignals {
  services: string[];
  valueKeywords: string[];
  reviewThemes: string[];
  positioningHints: string[];
  combinedText: string;
  categoryTerms: string[];
}

const SERVICE_NOISE = new Set([
  "home",
  "about",
  "about us",
  "contact",
  "contact us",
  "blog",
  "news",
  "faq",
  "faqs",
  "gallery",
  "portfolio",
  "our work",
  "services",
  "menu",
  "locations",
  "careers",
  "privacy",
  "terms",
  "login",
  "sign in",
  "shop",
  "store",
]);

const VALUE_KEYWORDS = [
  "licensed",
  "insured",
  "certified",
  "award",
  "award-winning",
  "family-owned",
  "locally owned",
  "same-day",
  "emergency",
  "24/7",
  "free estimate",
  "free consultation",
  "satisfaction guaranteed",
  "cinematic",
  "professional",
  "premium",
  "luxury",
  "organic",
  "handcrafted",
  "custom",
  "bespoke",
  "experienced",
  "trusted",
  "fast turnaround",
  "affordable",
  "eco-friendly",
  "sustainable",
];

const REVIEW_THEME_PATTERNS: { theme: string; patterns: RegExp[] }[] = [
  { theme: "Quality workmanship", patterns: [/quality/i, /professional/i, /excellent work/i, /did a great job/i] },
  { theme: "Fast response", patterns: [/quick/i, /fast/i, /prompt/i, /same day/i, /on time/i] },
  { theme: "Fair pricing", patterns: [/fair price/i, /affordable/i, /reasonable/i, /great value/i] },
  { theme: "Friendly staff", patterns: [/friendly/i, /kind/i, /helpful/i, /great service/i, /hospitality/i] },
  { theme: "Communication", patterns: [/communicat/i, /responsive/i, /kept us updated/i, /clear/i] },
  { theme: "Creative excellence", patterns: [/creative/i, /beautiful/i, /stunning/i, /amazing video/i, /film/i] },
  { theme: "Reliability", patterns: [/reliable/i, /dependable/i, /trust/i, /recommend/i, /highly recommend/i] },
  { theme: "Results-driven", patterns: [/results/i, /delivered/i, /exceeded/i, /outstanding/i] },
];

function cleanHeading(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .replace(/[|–—].*$/, "")
    .trim();
}

function isLikelyService(text: string): boolean {
  const lower = text.toLowerCase().trim();
  if (lower.length < 3 || lower.length > 60) return false;
  if (SERVICE_NOISE.has(lower)) return false;
  if (/^\d+$/.test(lower)) return false;
  if (/^(the|our|your|we|get|learn|read|view|see|click)/i.test(lower)) return false;
  return true;
}

function extractServicesFromReviews(reviews: BusinessData["reviews"]): string[] {
  const services = new Set<string>();
  const patterns = [
    /(?:great|excellent|amazing|best|professional)\s+(\w[\w\s-]{2,30}?)(?:\.|,|!|$)/gi,
    /(?:did|fixed|installed|repaired|cleaned|cut|styled|built)\s+(?:my|our|the)?\s*(\w[\w\s-]{2,30}?)(?:\.|,|!|$)/gi,
  ];

  for (const review of reviews) {
    for (const pattern of patterns) {
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(review.text)) !== null) {
        const candidate = match[1]?.trim();
        if (candidate && isLikelyService(candidate)) {
          services.add(
            candidate
              .split(" ")
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(" ")
          );
        }
      }
    }
  }

  return Array.from(services).slice(0, 4);
}

function extractServicesFromHeadings(
  business: BusinessData,
  website?: WebsiteData
): string[] {
  const services = new Set<string>();

  for (const h of website?.serviceHeadings || []) {
    const cleaned = cleanHeading(h);
    if (isLikelyService(cleaned)) services.add(cleaned);
  }

  for (const h of website?.headings || []) {
    const cleaned = cleanHeading(h);
    if (isLikelyService(cleaned)) services.add(cleaned);
  }

  for (const link of website?.navLinks || []) {
    const cleaned = cleanHeading(link);
    if (isLikelyService(cleaned)) services.add(cleaned);
  }

  for (const attr of business.attributes) {
    if (attr.length > 3 && attr.length < 50) services.add(attr);
  }

  for (const svc of extractServicesFromReviews(business.reviews)) {
    services.add(svc);
  }

  const categoryParts = business.category
    .split(/[·,/&]/)
    .map((p) => p.trim())
    .filter((p) => p.length > 2 && p.length < 40);
  categoryParts.forEach((p) => services.add(p));

  return Array.from(services).slice(0, 8);
}

function extractValueKeywords(combinedText: string): string[] {
  const lower = combinedText.toLowerCase();
  return VALUE_KEYWORDS.filter((kw) => lower.includes(kw)).slice(0, 8);
}

function extractReviewThemes(reviews: BusinessData["reviews"]): string[] {
  const themes = new Set<string>();
  const reviewText = reviews.map((r) => r.text).join(" ");

  for (const { theme, patterns } of REVIEW_THEME_PATTERNS) {
    if (patterns.some((p) => p.test(reviewText))) {
      themes.add(theme);
    }
  }

  return Array.from(themes).slice(0, 5);
}

function extractPositioningHints(
  business: BusinessData,
  website?: WebsiteData,
  socials?: SocialData[]
): string[] {
  const hints: string[] = [];

  if (website?.description) hints.push(website.description);
  if (website?.h1) hints.push(website.h1);
  if (business.description) hints.push(business.description);

  for (const s of socials || []) {
    if (s.description) hints.push(s.description);
    if (s.title) hints.push(s.title);
  }

  return hints.filter(Boolean).slice(0, 4);
}

export function extractSignals(
  business: BusinessData,
  website?: WebsiteData,
  socials?: SocialData[]
): ExtractedSignals {
  const parts = [
    business.name,
    business.category,
    business.description || "",
    ...(business.attributes || []),
    ...(business.reviews || []).map((r) => r.text),
    website?.title || "",
    website?.description || "",
    website?.h1 || "",
    ...(website?.headings || []),
    ...(website?.serviceHeadings || []),
    ...(website?.navLinks || []),
    website?.bodySnippet || "",
    ...(socials || []).map((s) => `${s.title || ""} ${s.description || ""}`),
  ];

  const combinedText = parts.join(" ").replace(/\s+/g, " ").trim();

  const categoryTerms = business.category
    .split(/[·,/&]/)
    .map((p) => p.trim())
    .filter(Boolean);

  return {
    services: extractServicesFromHeadings(business, website),
    valueKeywords: extractValueKeywords(combinedText),
    reviewThemes: extractReviewThemes(business.reviews),
    positioningHints: extractPositioningHints(business, website, socials),
    combinedText,
    categoryTerms,
  };
}
