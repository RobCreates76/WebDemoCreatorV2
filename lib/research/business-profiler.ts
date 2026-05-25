import type {
  BusinessData,
  BusinessProfile,
  NicheType,
  ResearchData,
  WebsiteData,
} from "@/lib/models/site-model";
import type { NicheDetectionResult } from "@/lib/models/site-model";
import {
  INDUSTRY_PLAYBOOKS,
  findSubIndustryOverlay,
  type IndustryPlaybook,
  type SubIndustryOverlay,
} from "./industry-playbooks";
import { extractSignals } from "./signal-extractor";

interface TemplateVars {
  name: string;
  city: string;
  category: string;
  audience: string;
  rating: string;
  reviews: string;
}

function fillTemplate(template: string, vars: TemplateVars): string {
  return template
    .replace(/\{name\}/g, vars.name)
    .replace(/\{city\}/g, vars.city)
    .replace(/\{category\}/g, vars.category)
    .replace(/\{audience\}/g, vars.audience)
    .replace(/\{rating\}/g, vars.rating)
    .replace(/\{reviews\}/g, vars.reviews);
}

function pickFormula(formulas: string[], seed: string): string {
  if (formulas.length === 0) return "";
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash + seed.charCodeAt(i)) % formulas.length;
  }
  return formulas[hash] || formulas[0];
}

function buildVars(business: BusinessData, audience: string): TemplateVars {
  return {
    name: business.name,
    city: business.city || "your area",
    category: business.category.split(/[·,]/)[0]?.trim() || "services",
    audience,
    rating: (business.rating || 4.9).toFixed(1),
    reviews: String(business.reviewCount || 50),
  };
}

function mergeServices(
  detected: string[],
  playbookServices: IndustryPlaybook["defaultServices"],
  overlayServices?: SubIndustryOverlay["services"]
): { title: string; description: string }[] {
  const items: { title: string; description: string }[] = [];

  if (overlayServices?.length) {
    items.push(...overlayServices);
  }

  for (const svc of detected.slice(0, 4)) {
    const exists = items.some(
      (i) => i.title.toLowerCase() === svc.toLowerCase()
    );
    if (!exists) {
      items.push({
        title: svc,
        description: `Professional ${svc.toLowerCase()} tailored to your needs — delivered with expertise and care.`,
      });
    }
  }

  for (const svc of playbookServices) {
    if (items.length >= 6) break;
    const exists = items.some(
      (i) => i.title.toLowerCase() === svc.title.toLowerCase()
    );
    if (!exists) items.push(svc);
  }

  return items.slice(0, 6);
}

function buildValueProps(
  playbook: IndustryPlaybook,
  valueKeywords: string[],
  overlay?: SubIndustryOverlay
): { title: string; description: string }[] {
  const props = overlay?.valueProps?.length
    ? [...overlay.valueProps]
    : [...playbook.valueProps];

  for (const kw of valueKeywords.slice(0, 3)) {
    const title = kw
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    if (!props.some((p) => p.title.toLowerCase().includes(kw))) {
      props.unshift({
        title,
        description: `We deliver on our promise of ${kw} — backed by real results and client satisfaction.`,
      });
    }
  }

  return props.slice(0, 4);
}

function buildFaq(
  playbook: IndustryPlaybook,
  vars: TemplateVars
): { question: string; answer: string }[] {
  return playbook.faqTemplates.map((f) => ({
    question: fillTemplate(f.question, vars),
    answer: fillTemplate(f.answer, vars),
  }));
}

function buildResearchSummary(
  business: BusinessData,
  playbook: IndustryPlaybook,
  signals: ReturnType<typeof extractSignals>,
  overlay?: SubIndustryOverlay
): string {
  const parts: string[] = [];

  parts.push(
    `${business.name} operates in the ${playbook.label.toLowerCase()} space${business.city ? ` in ${business.city}` : ""}.`
  );

  if (overlay) {
    parts.push(
      `Signals indicate a specialized focus (${overlay.keywords.slice(0, 2).join(", ")}).`
    );
  }

  if (signals.services.length > 0) {
    parts.push(
      `Detected offerings: ${signals.services.slice(0, 4).join(", ")}.`
    );
  }

  if (signals.reviewThemes.length > 0) {
    parts.push(
      `Review themes: ${signals.reviewThemes.join(", ")}.`
    );
  }

  if (business.rating > 0) {
    parts.push(
      `Rated ${business.rating.toFixed(1)}★ across ${business.reviewCount} reviews — strong social proof for conversion copy.`
    );
  }

  parts.push(`Positioning angle: ${overlay?.positioning || playbook.positioning}.`);

  return parts.join(" ");
}

function inferSubIndustryLabel(
  overlay: SubIndustryOverlay | undefined,
  signals: ReturnType<typeof extractSignals>
): string | undefined {
  if (!overlay) return undefined;
  const matched = overlay.keywords.filter((kw) =>
    signals.combinedText.toLowerCase().includes(kw.toLowerCase())
  );
  if (matched.length === 0) return undefined;
  return matched[0]
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function buildBusinessProfile(
  research: Pick<ResearchData, "business" | "website" | "socials"> & {
    niche: NicheType;
    nicheDetection?: NicheDetectionResult;
  }
): BusinessProfile {
  const { business, website, socials, niche } = research;
  const playbook = INDUSTRY_PLAYBOOKS[niche];
  const signals = extractSignals(business, website, socials);
  const overlay = findSubIndustryOverlay(signals.combinedText);

  const audience = overlay?.audience || playbook.audience;
  const tone = overlay?.tone || playbook.tone;
  const buyerType = overlay?.buyerType || playbook.buyerType;
  const vars = buildVars(business, audience);

  const headlineFormulas = [
    ...(overlay?.headlineFormulas || []),
    ...playbook.headlineFormulas,
  ];
  const subheadFormulas = [
    ...(overlay?.subheadFormulas || []),
    ...playbook.subheadFormulas,
  ];

  const headline = fillTemplate(
    pickFormula(headlineFormulas, business.name + niche),
    vars
  );
  const subheadline = fillTemplate(
    pickFormula(subheadFormulas, business.category + business.city),
    vars
  );

  const services = mergeServices(
    signals.services,
    playbook.defaultServices,
    overlay?.services
  );

  const sectionHeadlines = {
    ...playbook.sectionHeadlines,
    ...(overlay?.sectionHeadlines || {}),
  };

  const heroImage =
    overlay?.heroImage ||
    playbook.heroImage;

  const galleryImages =
    overlay?.galleryImages?.length
      ? overlay.galleryImages
      : playbook.galleryImages;

  const keywords = [
    ...signals.categoryTerms,
    ...signals.valueKeywords,
    ...(overlay?.keywords || []).slice(0, 3),
  ].filter((k, i, arr) => arr.indexOf(k) === i).slice(0, 12);

  return {
    niche,
    industryLabel: overlay
      ? `${playbook.label} · ${inferSubIndustryLabel(overlay, signals) || "Specialized"}`
      : playbook.label,
    subIndustry: inferSubIndustryLabel(overlay, signals),
    audience,
    tone,
    buyerType,
    positioning: overlay?.positioning || playbook.positioning,
    keywords,
    services,
    valueProps: buildValueProps(playbook, signals.valueKeywords, overlay),
    faq: buildFaq(playbook, vars),
    headlines: { headline, subheadline },
    ctas: {
      primary: overlay?.primaryCta || playbook.primaryCta,
      secondary: overlay?.secondaryCta || playbook.secondaryCta,
    },
    trustBadges: playbook.trustBadges,
    sectionHeadlines,
    heroImage,
    galleryImages,
    researchSummary: buildResearchSummary(business, playbook, signals, overlay),
    reviewThemes: signals.reviewThemes,
  };
}

export function enrichResearchWithProfile(
  research: ResearchData
): ResearchData {
  const profile = buildBusinessProfile(research);
  return { ...research, profile };
}
