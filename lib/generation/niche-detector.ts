import type {
  BusinessData,
  NicheDetectionResult,
  NicheType,
  SocialData,
  WebsiteData,
} from "@/lib/models/site-model";

/** Keywords per niche — longer phrases checked first via sorted matching */
const NICHE_KEYWORDS: Record<NicheType, string[]> = {
  "creative-media": [
    "video production",
    "video producer",
    "videographer",
    "videography",
    "film production",
    "film studio",
    "production company",
    "production studio",
    "media production",
    "video editing",
    "post production",
    "post-production",
    "cinematography",
    "cinematographer",
    "photographer",
    "photography studio",
    "photo studio",
    "photography",
    "content creator",
    "content creation",
    "creative agency",
    "creative studio",
    "film maker",
    "filmmaker",
    "documentary",
    "commercial video",
    "brand video",
    "corporate video",
    "music video",
    "drone video",
    "aerial video",
    "animation studio",
    "motion graphics",
    "video studio",
    "recording studio",
    "broadcast",
    "video",
    "film",
    "media",
    "creative",
    "production",
    "studio",
  ],
  "home-services": [
    "plumber",
    "plumbing",
    "electrician",
    "electrical contractor",
    "hvac",
    "heating and cooling",
    "air conditioning",
    "roofing",
    "roofer",
    "landscaping",
    "landscaper",
    "lawn care",
    "pest control",
    "exterminator",
    "house cleaning",
    "home cleaning",
    "maid service",
    "general contractor",
    "home contractor",
    "handyman",
    "garage door",
    "locksmith",
    "pool service",
    "septic",
    "water damage",
    "restoration",
    "contractor",
    "home repair",
    "home service",
  ],
  restaurant: [
    "restaurant",
    "cafe",
    "coffee shop",
    "bar and grill",
    "bar",
    "bakery",
    "pizzeria",
    "pizza",
    "diner",
    "bistro",
    "food truck",
    "catering",
    "eatery",
    "grill",
    "steakhouse",
    "sushi",
    "taqueria",
  ],
  "professional-services": [
    "lawyer",
    "attorney",
    "law firm",
    "legal",
    "accountant",
    "accounting",
    "cpa",
    "consulting",
    "consultant",
    "insurance agent",
    "insurance",
    "real estate agent",
    "real estate",
    "realtor",
    "financial advisor",
    "financial planner",
    "tax preparer",
    "architect",
    "engineering firm",
  ],
  healthcare: [
    "dentist",
    "dental",
    "doctor",
    "physician",
    "medical clinic",
    "medical center",
    "hospital",
    "chiropractor",
    "chiropractic",
    "pharmacy",
    "urgent care",
    "med spa",
    "medical spa",
    "dermatolog",
    "pediatric",
    "orthodont",
    "optometrist",
    "veterinar",
  ],
  "beauty-wellness": [
    "hair salon",
    "beauty salon",
    "nail salon",
    "barber",
    "barbershop",
    "spa",
    "day spa",
    "massage",
    "gym",
    "fitness",
    "yoga",
    "pilates",
    "wellness",
    "beauty",
    "esthetician",
    "tattoo",
  ],
  "retail-local": [
    "boutique",
    "retail store",
    "retail",
    "auto dealer",
    "dealership",
    "car dealer",
    "furniture store",
    "florist",
    "pet store",
    "jewelry store",
    "gift shop",
    "clothing store",
    "apparel",
  ],
  general: [],
};

export const NICHE_LABELS: Record<NicheType, string> = {
  "creative-media": "Creative & Media Production",
  "home-services": "Home Services",
  restaurant: "Restaurant & Dining",
  "professional-services": "Professional Services",
  healthcare: "Healthcare",
  "beauty-wellness": "Beauty & Wellness",
  "retail-local": "Local Retail",
  general: "General Business",
};

export const ALL_NICHES: NicheType[] = [
  "creative-media",
  "home-services",
  "restaurant",
  "professional-services",
  "healthcare",
  "beauty-wellness",
  "retail-local",
  "general",
];

const CONFIDENCE_THRESHOLD = 0.35;

interface DetectionInput {
  business: BusinessData;
  website?: WebsiteData;
  socials?: SocialData[];
}

function collectTextSignals(input: DetectionInput): {
  category: string;
  name: string;
  description: string;
  attributes: string;
  reviews: string;
  website: string;
  socials: string;
  combined: string;
} {
  const { business, website, socials = [] } = input;
  const reviewText = business.reviews.map((r) => r.text).join(" ");
  const websiteText = [
    website?.title,
    website?.description,
    website?.h1,
    ...(website?.headings ?? []),
  ]
    .filter(Boolean)
    .join(" ");
  const socialText = socials
    .map((s) => [s.title, s.description, s.platform].filter(Boolean).join(" "))
    .join(" ");

  const category = business.category || "";
  const name = business.name || "";
  const description = business.description || "";
  const attributes = business.attributes.join(" ");

  const combined = [category, name, description, attributes, reviewText, websiteText, socialText]
    .join(" ")
    .toLowerCase();

  return { category, name, description, attributes, reviews: reviewText, website: websiteText, socials: socialText, combined };
}

function scoreNiche(niche: NicheType, signals: ReturnType<typeof collectTextSignals>): { score: number; matched: string[] } {
  if (niche === "general") return { score: 0, matched: [] };

  const keywords = [...NICHE_KEYWORDS[niche]].sort((a, b) => b.length - a.length);
  let score = 0;
  const matched: string[] = [];
  const combined = signals.combined;

  for (const keyword of keywords) {
    const kw = keyword.toLowerCase();
    if (!combined.includes(kw)) continue;

    matched.push(keyword);
    let weight = 1;

    if (signals.category.toLowerCase().includes(kw)) weight += 4;
    if (signals.name.toLowerCase().includes(kw)) weight += 3;
    if (signals.description.toLowerCase().includes(kw)) weight += 2;
    if (signals.website.toLowerCase().includes(kw)) weight += 2;
    if (signals.attributes.toLowerCase().includes(kw)) weight += 1;
    if (signals.reviews.toLowerCase().includes(kw)) weight += 0.5;

    score += weight;
  }

  return { score, matched };
}

export function detectNicheFromResearch(input: DetectionInput): NicheDetectionResult {
  const signals = collectTextSignals(input);
  const scored = ALL_NICHES.filter((n) => n !== "general")
    .map((niche) => {
      const { score, matched } = scoreNiche(niche, signals);
      return { niche, score, matched, label: NICHE_LABELS[niche] };
    })
    .sort((a, b) => b.score - a.score);

  const top = scored[0];
  const second = scored[1];
  const maxPossible = 12;
  const confidence = top && top.score > 0 ? Math.min(top.score / maxPossible, 1) : 0;

  const alternatives = scored
    .filter((s) => s.score > 0)
    .slice(0, 4)
    .map((s) => ({ niche: s.niche, score: s.score, label: s.label }));

  if (!top || top.score === 0) {
    return {
      niche: "general",
      confidence: 0,
      needsConfirmation: true,
      reason: `Could not determine industry from "${signals.category || signals.name}". Please confirm the niche.`,
      alternatives: ALL_NICHES.filter((n) => n !== "general").map((n) => ({
        niche: n,
        score: 0,
        label: NICHE_LABELS[n],
      })),
      signals: [],
    };
  }

  const isAmbiguous =
    second && second.score > 0 && top.score - second.score <= 2;

  const needsConfirmation = confidence < CONFIDENCE_THRESHOLD || isAmbiguous;

  const reason = needsConfirmation
    ? isAmbiguous
      ? `Multiple industries detected. Best match: ${NICHE_LABELS[top.niche]} (also possible: ${NICHE_LABELS[second.niche]}). Please confirm.`
      : `Low confidence match for ${NICHE_LABELS[top.niche]}. Please confirm the industry.`
    : `Detected ${NICHE_LABELS[top.niche]} from: ${top.matched.slice(0, 4).join(", ")}`;

  return {
    niche: top.niche,
    confidence,
    needsConfirmation: !!needsConfirmation,
    reason,
    alternatives,
    signals: top.matched,
  };
}

/** @deprecated Use detectNicheFromResearch */
export function detectNiche(category: string, businessName = ""): NicheType {
  return detectNicheFromResearch({
    business: {
      name: businessName,
      category,
      address: "",
      city: "",
      phone: "",
      hours: [],
      rating: 0,
      reviewCount: 0,
      reviews: [],
      photos: [],
      attributes: [],
      mapsUrl: "",
    },
  }).niche;
}

export function getNicheLabel(niche: NicheType): string {
  return NICHE_LABELS[niche];
}

export function getAudienceLabel(niche: NicheType): string {
  const labels: Record<NicheType, string> = {
    "creative-media": "clients",
    "home-services": "homeowners",
    restaurant: "guests",
    "professional-services": "clients",
    healthcare: "patients",
    "beauty-wellness": "clients",
    "retail-local": "customers",
    general: "clients",
  };
  return labels[niche];
}
