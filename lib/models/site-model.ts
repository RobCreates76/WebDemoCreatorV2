export type NicheType =
  | "home-services"
  | "restaurant"
  | "professional-services"
  | "healthcare"
  | "beauty-wellness"
  | "retail-local"
  | "creative-media"
  | "general";

export interface NicheDetectionResult {
  niche: NicheType;
  confidence: number;
  needsConfirmation: boolean;
  reason: string;
  alternatives: { niche: NicheType; score: number; label: string }[];
  signals: string[];
}

export type AuditPriority = "P0" | "P1" | "P2";

export type AuditCategory =
  | "above-the-fold"
  | "trust"
  | "conversion"
  | "typography"
  | "color-contrast"
  | "mobile"
  | "performance"
  | "seo-local"
  | "premium-feel"
  | "psychology";

export interface BusinessReview {
  author: string;
  rating: number;
  text: string;
  date?: string;
}

export interface BusinessHours {
  day: string;
  hours: string;
}

export interface BusinessData {
  name: string;
  category: string;
  address: string;
  city: string;
  phone: string;
  website?: string;
  hours: BusinessHours[];
  rating: number;
  reviewCount: number;
  reviews: BusinessReview[];
  photos: string[];
  description?: string;
  attributes: string[];
  mapsUrl: string;
}

export interface WebsiteData {
  url: string;
  title?: string;
  description?: string;
  h1?: string;
  headings: string[];
  serviceHeadings: string[];
  navLinks: string[];
  bodySnippet: string;
  phoneNumbers: string[];
  emails: string[];
  images: string[];
  colors: string[];
  hasViewport: boolean;
  hasLocalSchema: boolean;
  ctaTexts: string[];
  formFieldCount: number;
  fontFamilies: string[];
  bodyFontSize?: number;
  heroImageSize?: number;
  hasLazyLoading: boolean;
  isHttps: boolean;
  html: string;
}

export interface SocialData {
  url: string;
  platform: string;
  title?: string;
  description?: string;
  image?: string;
}

export type BuildMode = "template" | "agent";

export interface BusinessProfile {
  niche: NicheType;
  industryLabel: string;
  subIndustry?: string;
  audience: string;
  tone: "premium" | "professional" | "warm" | "urgent" | "clinical" | "aspirational";
  buyerType: "b2b" | "b2c" | "mixed";
  positioning: string;
  keywords: string[];
  services: { title: string; description: string }[];
  valueProps: { title: string; description: string }[];
  faq: { question: string; answer: string }[];
  headlines: { headline: string; subheadline: string };
  ctas: { primary: string; secondary: string };
  trustBadges: string[];
  sectionHeadlines: {
    services: string;
    whyUs: string;
    gallery: string;
    testimonials: string;
    faq: string;
    contact: string;
  };
  sectionLeads?: {
    services: string;
    whyUs: string;
    gallery: string;
    testimonials: string;
    faq: string;
    contact: string;
  };
  conversionBand?: {
    headline: string;
    subheadline: string;
    reassurance: string;
  };
  heroImage: string;
  galleryImages: string[];
  researchSummary: string;
  reviewThemes: string[];
  /** Set when profile was produced by the AI agent */
  generatedBy?: "agent" | "template";
  agentModel?: string;
  nicheReasoning?: string;
  websiteStrategy?: string;
  competitiveAngle?: string;
  metaTitle?: string;
  metaDescription?: string;
  heroEyebrow?: string;
  heroHighlight?: string;
  offerHook?: string;
  stats?: { value: string; label: string }[];
  marqueeItems?: string[];
  /** Agent web research metadata */
  researchMode?: "business-specific" | "niche-fallback";
  dataRichness?: "rich" | "moderate" | "sparse";
  webResearchSource?: "exa" | "duckduckgo" | "none";
  webResearchQueries?: string[];
  visualDesign?: AgentVisualDesign;
}

export interface ResearchData {
  business: BusinessData;
  website?: WebsiteData;
  socials: SocialData[];
  niche: NicheType;
  nicheDetection?: NicheDetectionResult;
  profile?: BusinessProfile;
  buildMode?: BuildMode;
}

export interface AuditFinding {
  id: string;
  priority: AuditPriority;
  category: AuditCategory;
  title: string;
  description: string;
  suggestion: string;
  suggestedCopy?: string;
  demoFix?: string;
  scoreImpact: number;
}

export interface AuditReport {
  score: number;
  findings: AuditFinding[];
  summary: string;
}

export interface DesignTokens {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  displayFont: string;
  bodyFont: string;
  radius: string;
  niche: NicheType;
}

export interface CtaBlock {
  label: string;
  href: string;
  variant: "primary" | "secondary";
}

export interface ServiceItem {
  title: string;
  description: string;
  icon?: string;
}

export interface TestimonialItem {
  quote: string;
  author: string;
  rating: number;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface WhyUsItem {
  title: string;
  description: string;
}

export interface SiteSection {
  id: string;
  type:
    | "header"
    | "hero"
    | "social-proof"
    | "services"
    | "why-us"
    | "gallery"
    | "testimonials"
    | "faq"
    | "contact"
    | "footer";
  enabled: boolean;
  data: Record<string, unknown>;
}

export type RenderTier = "standard" | "premium";

export interface AgentVisualDesign {
  heroLayout: "cinematic" | "split" | "editorial";
  theme: "light" | "dark" | "warm";
  displayFont: string;
  bodyFont: string;
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  imageKeywords: string[];
  imageMood: string;
}

export interface PremiumFeatures {
  heroEyebrow?: string;
  heroHighlight?: string;
  offerHook?: string;
  stats: { value: string; label: string }[];
  marqueeItems: string[];
  sectionLeads?: {
    services: string;
    whyUs: string;
    gallery: string;
    testimonials: string;
    faq: string;
    contact: string;
  };
  conversionBand?: {
    headline: string;
    subheadline: string;
    reassurance: string;
    ctaLabel: string;
    ctaHref: string;
  };
}

export interface SiteModel {
  id: string;
  slug: string;
  businessName: string;
  niche: NicheType;
  buildMode?: BuildMode;
  renderTier?: RenderTier;
  visualDesign?: AgentVisualDesign;
  premium?: PremiumFeatures;
  tokens: DesignTokens;
  meta: {
    title: string;
    description: string;
  };
  header: {
    logoText: string;
    phone: string;
    cta: CtaBlock;
  };
  hero: {
    headline: string;
    subheadline: string;
    image: string;
    primaryCta: CtaBlock;
    secondaryCta: CtaBlock;
  };
  socialProof: {
    rating: number;
    reviewCount: number;
    badges: string[];
  };
  services: {
    headline: string;
    items: ServiceItem[];
  };
  whyUs: {
    headline: string;
    items: WhyUsItem[];
  };
  gallery: {
    headline: string;
    images: string[];
  };
  testimonials: {
    headline: string;
    items: TestimonialItem[];
  };
  faq: {
    headline: string;
    items: FaqItem[];
  };
  contact: {
    headline: string;
    address: string;
    phone: string;
    hours: BusinessHours[];
    cta: CtaBlock;
  };
  footer: {
    tagline: string;
    phone: string;
    address: string;
  };
  sections: SiteSection[];
}

export interface AiProvider {
  enabled: boolean;
  generateCopy?: (prompt: string) => Promise<string>;
  auditSite?: (html: string) => Promise<AuditReport>;
}

export const DEFAULT_AI_PROVIDER: AiProvider = { enabled: false };
