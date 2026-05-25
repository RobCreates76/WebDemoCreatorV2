import { randomUUID } from "crypto";
import type { BusinessProfile, ResearchData, SiteModel } from "@/lib/models/site-model";
import { buildPremiumDesignTokens } from "./design-tokens";
import { detectNiche } from "./niche-detector";
import {
  generateBadges,
  generateMetaDescription,
  generateMetaTitle,
  type CopyContext,
} from "./copy-engine";
import { buildBusinessProfile } from "@/lib/research/business-profiler";
import { curateSiteImages } from "@/lib/media/image-curation";
import { slugify } from "@/lib/utils";

function profileOrBuild(research: ResearchData): BusinessProfile {
  return research.profile ?? buildBusinessProfile(research);
}

export function buildSiteModel(research: ResearchData): SiteModel {
  const profile = profileOrBuild(research);
  const isAgent = research.buildMode === "agent" || profile.generatedBy === "agent";
  const niche =
    (isAgent && profile.niche) ||
    research.niche ||
    detectNiche(research.business.category, research.business.name);
  const brandColors = research.website?.colors;
  const tokens = buildPremiumDesignTokens(niche, brandColors);

  const ctx: CopyContext = {
    business: research.business,
    niche,
    city: research.business.city,
  };

  const phone =
    research.business.phone ||
    research.website?.phoneNumbers[0] ||
    "(555) 000-0000";
  const phoneHref = `tel:${phone.replace(/\D/g, "")}`;

  const curated = curateSiteImages(research.business, research.website, {
    businessName: research.business.name,
    category: research.business.category,
    niche,
    keywords: profile.keywords,
    stockHero: profile.heroImage,
    stockGallery: profile.galleryImages,
  });

  const heroImage = curated.hero;
  const galleryImages = curated.gallery;

  const testimonials =
    research.business.reviews.length > 0
      ? research.business.reviews.map((r) => ({
          quote: r.text,
          author: r.author,
          rating: r.rating,
        }))
      : [
          {
            quote: `Excellent experience with ${research.business.name}. Professional, reliable, and highly recommended.`,
            author: "Verified Customer",
            rating: 5,
          },
          {
            quote: "Outstanding service from start to finish. Will definitely use again.",
            author: "Local Customer",
            rating: 5,
          },
        ];

  const slug = slugify(research.business.name);

  return {
    id: randomUUID(),
    slug,
    businessName: research.business.name,
    niche,
    renderTier: "premium",
    premium: {
      heroEyebrow:
        profile.heroEyebrow ||
        `${research.business.city}'s Trusted ${profile.industryLabel.split("·")[0].trim()}`,
      heroHighlight: profile.heroHighlight,
      offerHook:
        profile.offerHook ||
        profile.trustBadges.slice(0, 3).join(" · "),
      stats: profile.stats?.length
        ? profile.stats
        : [
            { value: `${(research.business.rating || 4.9).toFixed(1)}`, label: "Star Rating" },
            { value: `${research.business.reviewCount || 100}+`, label: "Reviews" },
            { value: research.business.city || "Local", label: "Community" },
          ],
      marqueeItems: profile.marqueeItems?.length
        ? profile.marqueeItems
        : profile.trustBadges,
    },
    tokens,
    meta: {
      title: isAgent && profile.metaTitle
        ? profile.metaTitle
        : generateMetaTitle(ctx),
      description: isAgent && profile.metaDescription
        ? profile.metaDescription
        : generateMetaDescription(ctx),
    },
    header: {
      logoText: research.business.name,
      phone,
      cta: {
        label: profile.ctas.primary,
        href: phoneHref,
        variant: "primary",
      },
    },
    hero: {
      headline: profile.headlines.headline,
      subheadline: profile.headlines.subheadline,
      image: heroImage,
      primaryCta: {
        label: profile.ctas.primary,
        href: phoneHref,
        variant: "primary",
      },
      secondaryCta: {
        label: profile.ctas.secondary,
        href: "#contact",
        variant: "secondary",
      },
    },
    socialProof: {
      rating: research.business.rating || 4.9,
      reviewCount: research.business.reviewCount || 100,
      badges:
        profile.trustBadges.length > 0
          ? profile.trustBadges
          : isAgent
            ? profile.trustBadges
            : generateBadges(research.business, niche),
    },
    services: {
      headline: profile.sectionHeadlines.services,
      items: profile.services,
    },
    whyUs: {
      headline: profile.sectionHeadlines.whyUs,
      items: profile.valueProps,
    },
    gallery: {
      headline: profile.sectionHeadlines.gallery,
      images: galleryImages,
    },
    testimonials: {
      headline: profile.sectionHeadlines.testimonials,
      items: testimonials,
    },
    faq: {
      headline: profile.sectionHeadlines.faq,
      items: profile.faq,
    },
    contact: {
      headline: profile.sectionHeadlines.contact,
      address: research.business.address,
      phone,
      hours: research.business.hours,
      cta: {
        label: profile.ctas.primary,
        href: phoneHref,
        variant: "primary",
      },
    },
    footer: {
      tagline: `${profile.industryLabel} in ${research.business.city}`,
      phone,
      address: research.business.address,
    },
    sections: [
      { id: "header", type: "header", enabled: true, data: {} },
      { id: "hero", type: "hero", enabled: true, data: {} },
      { id: "social-proof", type: "social-proof", enabled: true, data: {} },
      { id: "services", type: "services", enabled: true, data: {} },
      { id: "why-us", type: "why-us", enabled: true, data: {} },
      { id: "gallery", type: "gallery", enabled: true, data: {} },
      { id: "testimonials", type: "testimonials", enabled: true, data: {} },
      { id: "faq", type: "faq", enabled: true, data: {} },
      { id: "contact", type: "contact", enabled: true, data: {} },
      { id: "footer", type: "footer", enabled: true, data: {} },
    ],
  };
}
