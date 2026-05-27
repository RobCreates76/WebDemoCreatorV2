import type { AgentVisualDesign, BusinessData, NicheType, WebsiteData } from "@/lib/models/site-model";
import {
  curateSiteImages,
  normalizeImageUrl,
  upgradeUnsplashUrl,
  type ImageCurationContext,
} from "@/lib/media/image-curation";

/** High-quality curated photos — NOT the same IDs used in industry playbooks */
const AGENT_PHOTO_LIBRARY: Record<
  NicheType,
  { hero: string[]; gallery: string[]; tags: string[] }
> = {
  "home-services": {
    tags: ["plumber", "hvac", "electrician", "roof", "emergency", "technician", "repair", "water"],
    hero: [
      "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1920&q=92&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1920&q=92&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=1920&q=92&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=92&auto=format&fit=crop",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&q=90&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=1200&q=90&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&q=90&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1513828583688-c52646db9a66?w=1200&q=90&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1200&q=90&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=1200&q=90&auto=format&fit=crop",
    ],
  },
  restaurant: {
    tags: ["food", "dining", "chef", "restaurant", "kitchen", "plate", "wine", "interior"],
    hero: [
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&q=92&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&q=92&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1920&q=92&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=1920&q=92&auto=format&fit=crop",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&q=90&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1200&q=90&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1476224203421-9ac39bcef317?w=1200&q=90&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=1200&q=90&auto=format&fit=crop",
    ],
  },
  "professional-services": {
    tags: ["office", "lawyer", "consulting", "meeting", "corporate", "strategy", "team"],
    hero: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=92&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1920&q=92&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=92&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1920&q=92&auto=format&fit=crop",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1200&q=90&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1200&q=90&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=1200&q=90&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200&q=90&auto=format&fit=crop",
    ],
  },
  healthcare: {
    tags: ["medical", "doctor", "clinic", "health", "dental", "patient", "care"],
    hero: [
      "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1920&q=92&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1920&q=92&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1631217868264-e5b1bb5e99b5?w=1920&q=92&auto=format&fit=crop",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=1200&q=90&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=1200&q=90&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&q=90&auto=format&fit=crop",
    ],
  },
  "beauty-wellness": {
    tags: ["spa", "salon", "beauty", "wellness", "massage", "skincare", "luxury"],
    hero: [
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1920&q=92&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1515377901643-778a6dff825e?w=1920&q=92&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=1920&q=92&auto=format&fit=crop",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1560066984-138d7174c035?w=1200&q=90&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&q=90&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1596178065887-119106b1415c?w=1200&q=90&auto=format&fit=crop",
    ],
  },
  "retail-local": {
    tags: ["retail", "store", "shop", "boutique", "product", "local", "merchandise"],
    hero: [
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=92&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=1920&q=92&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1555529665-2269763671c0?w=1920&q=92&auto=format&fit=crop",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1528698820031-8bf79732bf54?w=1200&q=90&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=90&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1200&q=90&auto=format&fit=crop",
    ],
  },
  "creative-media": {
    tags: ["video", "production", "camera", "film", "creative", "studio", "content"],
    hero: [
      "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1920&q=92&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=1920&q=92&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=1920&q=92&auto=format&fit=crop",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1579869847514-7c1a3afbf86f?w=1200&q=90&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1598488035139-bdbb2231bcc4?w=1200&q=90&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=1200&q=90&auto=format&fit=crop",
    ],
  },
  general: {
    tags: ["business", "professional", "service", "local", "team", "office"],
    hero: [
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1920&q=92&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1920&q=92&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600880292089-90a7e086aeb0?w=1920&q=92&auto=format&fit=crop",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1200&q=90&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1200&q=90&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=90&auto=format&fit=crop",
    ],
  },
};

function scoreKeywordMatch(keywords: string[], tags: string[]): number {
  let score = 0;
  const joined = keywords.join(" ").toLowerCase();
  for (const tag of tags) {
    if (joined.includes(tag)) score += 12;
  }
  for (const kw of keywords) {
    const w = kw.toLowerCase();
    if (tags.some((t) => w.includes(t) || t.includes(w))) score += 8;
  }
  return score;
}

function pickAgentHero(
  niche: NicheType,
  visual: AgentVisualDesign,
  businessName: string
): string {
  const lib = AGENT_PHOTO_LIBRARY[niche];
  const keywords = [...visual.imageKeywords, visual.imageMood, businessName];
  let bestIdx = 0;
  let bestScore = -1;

  lib.hero.forEach((url, i) => {
    let score = scoreKeywordMatch(keywords, lib.tags) + (lib.hero.length - i);
    let hash = 0;
    for (const c of businessName) hash = (hash + c.charCodeAt(0)) % lib.hero.length;
    if (i === hash) score += 5;
    if (score > bestScore) {
      bestScore = score;
      bestIdx = i;
    }
  });

  return upgradeUnsplashUrl(lib.hero[bestIdx]!, 1920);
}

function pickAgentGallery(
  niche: NicheType,
  heroUrl: string,
  visual: AgentVisualDesign
): string[] {
  const lib = AGENT_PHOTO_LIBRARY[niche];
  const heroKey = heroUrl.split("?")[0];
  const keywords = [...visual.imageKeywords, visual.imageMood];

  const scored = lib.gallery
    .map((url, i) => ({
      url: upgradeUnsplashUrl(url, 1200),
      score: scoreKeywordMatch(keywords, lib.tags) + (lib.gallery.length - i) * 2,
    }))
    .filter((c) => c.url.split("?")[0] !== heroKey)
    .sort((a, b) => b.score - a.score);

  const gallery = scored.slice(0, 6).map((c) => c.url);
  return gallery.length >= 3
    ? gallery
    : lib.gallery.map((u) => upgradeUnsplashUrl(u, 1200)).slice(0, 4);
}

export function curateAgentSiteImages(
  business: BusinessData,
  website: WebsiteData | undefined,
  niche: NicheType,
  visual: AgentVisualDesign,
  context: ImageCurationContext
): { hero: string; gallery: string[] } {
  const real = curateSiteImages(business, website, context);
  const realHeroIsBusiness =
    real.sources.hero === "business" || real.sources.hero === "website";

  const agentHero = pickAgentHero(niche, visual, business.name);
  const agentGallery = pickAgentGallery(niche, agentHero, visual);

  if (realHeroIsBusiness && business.photos.length > 0) {
    const realGallery = real.gallery.filter(
      (u) => u.split("?")[0] !== real.hero.split("?")[0]
    );
    return {
      hero: normalizeImageUrl(real.hero),
      gallery: [...realGallery.slice(0, 3), ...agentGallery].slice(0, 6),
    };
  }

  return { hero: agentHero, gallery: agentGallery };
}
