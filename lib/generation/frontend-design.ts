import type { BusinessProfile, NicheType } from "@/lib/models/site-model";

export type CtaIntent = "book-call" | "call-now" | "visit";

export interface SectionLeads {
  services: string;
  whyUs: string;
  gallery: string;
  testimonials: string;
  faq: string;
  contact: string;
}

export interface ConversionBandCopy {
  headline: string;
  subheadline: string;
  reassurance: string;
}

export interface NicheDesignConfig {
  niche: NicheType;
  aesthetic: string;
  reference: string;
  displayFont?: string;
  bodyFont?: string;
  ctaIntent: CtaIntent;
  sectionLeads: SectionLeads;
  conversionBand: ConversionBandCopy;
}

const DEFAULT_SECTION_LEADS: Record<NicheType, SectionLeads> = {
  "home-services": {
    services: "Every job scoped upfront — licensed, insured, and done right the first time.",
    whyUs: "When something breaks, you need someone who shows up fast and fixes it for good.",
    gallery: "Real work from real homes in your neighborhood — quality you can see before you call.",
    testimonials: "Neighbors who were tired of no-shows and surprise bills — until they found us.",
    faq: "Straight answers before we step foot on your property.",
    contact: "Tell us what's going on — we'll respond fast with a clear plan and honest quote.",
  },
  restaurant: {
    services: "Seasonal plates, bold flavors, and the kind of hospitality that keeps tables full.",
    whyUs: "The difference between a meal and an experience — in every detail from kitchen to table.",
    gallery: "A taste of what awaits — crafted with care, plated to impress.",
    testimonials: "Guests who came for dinner and became regulars.",
    faq: "Reservations, dietary needs, private events — we've got you covered.",
    contact: "Reserve your table or plan your next celebration — we'll make it memorable.",
  },
  "professional-services": {
    services: "Clear scope, expert execution, and outcomes that protect what matters most.",
    whyUs: "When stakes are high, experience and precision aren't optional — they're everything.",
    gallery: "Representative work that reflects the standard we bring to every engagement.",
    testimonials: "Clients who needed certainty — and got results they could stake their reputation on.",
    faq: "Process, pricing, timelines — no jargon, no runaround.",
    contact: "Book a free strategy call — we'll listen first, then show you a clear path forward.",
  },
  healthcare: {
    services: "Care designed around you — thoughtful, thorough, and focused on long-term wellness.",
    whyUs: "A team that listens, explains, and treats you like a person — not a chart number.",
    gallery: "A welcoming environment built for comfort, clarity, and confidence in your care.",
    testimonials: "Patients who finally found providers who take the time to get it right.",
    faq: "Insurance, appointments, what to expect — answered before your first visit.",
    contact: "Request your appointment — same-week availability when you need care sooner.",
  },
  "beauty-wellness": {
    services: "Treatments tailored to you — elevated results without the generic spa experience.",
    whyUs: "Skilled hands, premium products, and an atmosphere that feels like an escape.",
    gallery: "The look, the vibe, the transformation — see what's possible.",
    testimonials: "Clients who walk out feeling like the best version of themselves.",
    faq: "Booking, prep, pricing — everything you need before your appointment.",
    contact: "Claim your spot — limited availability each week for personalized attention.",
  },
  "retail-local": {
    services: "Curated selection, honest recommendations, and service big-box stores can't replicate.",
    whyUs: "Local expertise, quality you can touch, and people who remember your name.",
    gallery: "What's in store — handpicked pieces worth the trip.",
    testimonials: "Shoppers who stopped ordering online and started shopping local again.",
    faq: "Hours, returns, special orders — quick answers before you visit.",
    contact: "Stop by or reach out — we're here to help you find exactly what you need.",
  },
  "creative-media": {
    services: "Concept through delivery — content engineered to earn attention and drive action.",
    whyUs: "Strategy-first production for brands that can't afford content that just looks pretty.",
    gallery: "Work that performed — not just portfolio filler.",
    testimonials: "Partners who needed video that converts — and got campaigns that delivered.",
    faq: "Scope, timelines, revisions — how we work before cameras roll.",
    contact: "Book a discovery call — we'll align on goals, then map a production plan.",
  },
  general: {
    services: "Focused solutions built around your goals — not one-size-fits-all packages.",
    whyUs: "The combination of expertise, responsiveness, and results that makes the choice obvious.",
    gallery: "Proof of the standard we hold ourselves to on every project.",
    testimonials: "Real feedback from people who chose us — and came back again.",
    faq: "Common questions answered upfront — so you can move forward with confidence.",
    contact: "Book a free call — tell us what you need and we'll show you the clearest next step.",
  },
};

const DEFAULT_CONVERSION_BAND: Record<NicheType, ConversionBandCopy> = {
  "home-services": {
    headline: "Ready to Fix It — For Good?",
    subheadline: "Free estimates. Same-day availability when you need it most.",
    reassurance: "No obligation · Upfront pricing · Licensed & insured",
  },
  restaurant: {
    headline: "Your Table Is Waiting",
    subheadline: "Join the guests who keep coming back — reserve before we fill up.",
    reassurance: "Easy booking · Dietary accommodations · Groups welcome",
  },
  "professional-services": {
    headline: "Let's Talk Before You Decide",
    subheadline: "A free strategy call to understand your situation and map a clear path forward.",
    reassurance: "No pressure · Confidential · Clear next steps",
  },
  healthcare: {
    headline: "Your Health Deserves a Proactive Partner",
    subheadline: "Schedule a visit with a team that listens and explains every step.",
    reassurance: "Most insurance accepted · Same-week appointments",
  },
  "beauty-wellness": {
    headline: "Treat Yourself — You Earned It",
    subheadline: "Limited weekly slots for personalized attention and elevated results.",
    reassurance: "Easy booking · Expert providers · Premium products",
  },
  "retail-local": {
    headline: "See It In Person",
    subheadline: "Visit us today — expert help, quality you can feel, and service worth the trip.",
    reassurance: "Local experts · Curated selection · Personal service",
  },
  "creative-media": {
    headline: "Let's Build Something That Performs",
    subheadline: "Book a discovery call — we'll align on goals before a single frame is shot.",
    reassurance: "Strategy-first · Clear scope · On-time delivery",
  },
  general: {
    headline: "Ready to Move Forward?",
    subheadline: "Book a free call — we'll listen, then show you the smartest next step.",
    reassurance: "No obligation · Fast response · Clear pricing",
  },
};

const CTA_INTENT_BY_NICHE: Record<NicheType, CtaIntent> = {
  "home-services": "call-now",
  restaurant: "visit",
  "professional-services": "book-call",
  healthcare: "book-call",
  "beauty-wellness": "book-call",
  "retail-local": "visit",
  "creative-media": "book-call",
  general: "book-call",
};

/** Per-niche aesthetics aligned with templates design.json configs */
const NICHE_AESTHETICS: Record<
  NicheType,
  Pick<NicheDesignConfig, "aesthetic" | "reference" | "displayFont" | "bodyFont">
> = {
  "home-services": {
    aesthetic: "Bold trust, high-contrast CTAs",
    reference: "Uber directness",
    displayFont: "Instrument Serif",
    bodyFont: "DM Sans",
  },
  restaurant: {
    aesthetic: "Warm editorial, full-bleed food photography",
    reference: "Airbnb / Starbucks warmth",
    displayFont: "Fraunces",
    bodyFont: "DM Sans",
  },
  "professional-services": {
    aesthetic: "Restrained serif + sans, credibility-first",
    reference: "Linear / Stripe elegance",
    displayFont: "Instrument Serif",
    bodyFont: "Inter",
  },
  healthcare: {
    aesthetic: "Calm clinical trust, approachable warmth",
    reference: "One Medical clarity",
    displayFont: "Playfair Display",
    bodyFont: "Source Sans 3",
  },
  "beauty-wellness": {
    aesthetic: "Soft luxury, aspirational minimalism",
    reference: "Aesop / Glossier",
    displayFont: "Cormorant Garamond",
    bodyFont: "Outfit",
  },
  "retail-local": {
    aesthetic: "Bold retail energy, product-forward",
    reference: "Apple Store clarity",
    displayFont: "Bebas Neue",
    bodyFont: "Work Sans",
  },
  "creative-media": {
    aesthetic: "Cinematic dark mode, portfolio-first",
    reference: "A24 / production studio",
    displayFont: "Syne",
    bodyFont: "Inter",
  },
  general: {
    aesthetic: "Editorial clarity with confident conversion focus",
    reference: "Premium local service brands",
    displayFont: "Instrument Serif",
    bodyFont: "DM Sans",
  },
};

const BOOK_CALL_PATTERNS =
  /\b(book|schedule|consult|call|appointment|reserve|strategy|discovery|estimate request|get started)\b/i;

export function loadNicheDesignConfig(niche: NicheType): NicheDesignConfig {
  const aesthetic = NICHE_AESTHETICS[niche];
  return {
    niche,
    aesthetic: aesthetic.aesthetic,
    reference: aesthetic.reference,
    displayFont: aesthetic.displayFont,
    bodyFont: aesthetic.bodyFont,
    ctaIntent: CTA_INTENT_BY_NICHE[niche],
    sectionLeads: DEFAULT_SECTION_LEADS[niche],
    conversionBand: DEFAULT_CONVERSION_BAND[niche],
  };
}

export function resolveCtaHref(
  label: string,
  options: {
    intent?: CtaIntent;
    phone: string;
    buyerType?: BusinessProfile["buyerType"];
  }
): string {
  const phoneHref = `tel:${options.phone.replace(/\D/g, "")}`;
  const intent = options.intent ?? "book-call";

  if (intent === "call-now" || /\b(call now|same-day|emergency|24\/7)\b/i.test(label)) {
    return phoneHref;
  }
  if (intent === "visit" || /\b(visit|directions|shop|store|menu)\b/i.test(label)) {
    return "#contact";
  }
  if (BOOK_CALL_PATTERNS.test(label) || intent === "book-call") {
    return "#contact";
  }
  if (options.buyerType === "b2b") {
    return "#contact";
  }
  return phoneHref;
}

export function resolveSecondaryCtaHref(
  label: string,
  phone: string,
  primaryHref: string
): string {
  if (/\b(call|phone|same-day|emergency)\b/i.test(label)) {
    return `tel:${phone.replace(/\D/g, "")}`;
  }
  if (primaryHref.startsWith("tel:")) {
    return "#contact";
  }
  return `tel:${phone.replace(/\D/g, "")}`;
}

export function getSectionLeads(
  niche: NicheType,
  profile?: Pick<BusinessProfile, "sectionLeads" | "positioning" | "competitiveAngle">
): SectionLeads {
  const defaults = loadNicheDesignConfig(niche).sectionLeads;
  if (profile?.sectionLeads) {
    return { ...defaults, ...profile.sectionLeads };
  }
  return defaults;
}

export function getConversionBand(
  niche: NicheType,
  profile?: Pick<BusinessProfile, "conversionBand" | "ctas" | "positioning">,
  businessName?: string
): ConversionBandCopy & { ctaLabel: string } {
  const defaults = loadNicheDesignConfig(niche).conversionBand;
  const band = profile?.conversionBand
    ? { ...defaults, ...profile.conversionBand }
    : defaults;

  const ctaLabel =
    profile?.ctas?.primary ||
    (CTA_INTENT_BY_NICHE[niche] === "call-now"
      ? "Get Your Free Estimate"
      : "Book a Free Call");

  return {
    headline: band.headline.replace(/\{name\}/g, businessName ?? "Us"),
    subheadline: band.subheadline,
    reassurance: band.reassurance,
    ctaLabel,
  };
}

/** Design principles injected into AI agent prompts */
export function getFrontendDesignPromptBlock(niche: NicheType): string {
  const config = loadNicheDesignConfig(niche);
  return `
PREMIUM FRONTEND DESIGN RULES (the demo must LOOK expensive, not template-y):
- Aesthetic target: ${config.aesthetic} (reference: ${config.reference})
- Visual hierarchy: one hero focal point, generous whitespace, editorial typography — never cluttered
- Restraint over gimmicks: NO gradient soup, NO generic SaaS marquee clichés unless copy truly needs them
- Photography-first: hero and gallery should feel authentic; copy should reference real customer experience
- Conversion UX: primary goal is "${config.ctaIntent === "book-call" ? "book a call / consultation" : config.ctaIntent === "call-now" ? "call now for fast service" : "visit or contact"}"
- Primary CTA labels must command action with implied value ("Book Your Free Strategy Call", not "Submit" or "Learn More")
- Secondary CTA supports the primary (call now OR scroll to proof) — never compete visually
- Section leads: each section needs a 1-sentence lead that sells the scroll — specific to this business, never "Expert solutions tailored to your goals"
- Mid-page conversion band: headline + subheadline + reassurance line that makes booking feel low-risk
- Trust before ask: social proof visible before the final contact section
- Contact section = booking moment: headline should feel like an invitation to a conversation, not a generic "Contact Us"
- Mobile: assume thumb-zone CTAs; phone and book-call must be obvious without hunting`;
}

export const FRONTEND_DESIGN_JSON_SCHEMA = `
  "sectionLeads": {
    "services": "1 sentence — specific, benefit-led section intro",
    "whyUs": "1 sentence — why this business wins",
    "gallery": "1 sentence — authentic visual proof angle",
    "testimonials": "1 sentence — social proof hook",
    "faq": "1 sentence — objection-handling frame",
    "contact": "1 sentence — low-friction booking invitation"
  },
  "conversionBand": {
    "headline": "mid-page pattern-interrupt headline driving toward booking",
    "subheadline": "1 sentence stacking value + urgency (honest only)",
    "reassurance": "short trust line with · separators (e.g. 'No obligation · Free consult · Fast response')"
  }`;
