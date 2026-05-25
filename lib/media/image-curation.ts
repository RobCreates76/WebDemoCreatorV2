import type { BusinessData, NicheType, WebsiteData } from "@/lib/models/site-model";

const JUNK_URL_PATTERNS = [
  /favicon/i,
  /\/icons?\//i,
  /\/logo(?:[-_.\/]|$)/i,
  /[-_]logo\.(png|jpe?g|webp|svg)(\?|$)/i,
  /avatar/i,
  /profile[-_]?pic/i,
  /gravatar/i,
  /pixel/i,
  /spacer/i,
  /placeholder/i,
  /badge/i,
  /emoji/i,
  /sprite/i,
  /1x1/i,
  /tracking/i,
  /analytics/i,
  /\.svg(\?|$)/i,
  /\.gif(\?|$)/i,
  /data:image/i,
  /googleusercontent\.com.*=s(16|32|48|64|96)\b/i,
  /googleusercontent\.com.*=w(1\d\d|[1-9]\d?)-/i,
  /screenshot/i,
  /banner-ad/i,
  /social[-_]?icon/i,
  /payment[-_]?icon/i,
  /credit[-_]?card/i,
  /app[-_]?store/i,
  /google-play/i,
];

const SMALL_DIMENSION_PATTERN =
  /(?:[?&=](?:w|h|width|height|s)=(\d+))|(?:=w(\d+)-h(\d+))/i;

/** Niche-matched stock beats mediocre scraped photos */
const STOCK_HERO_SCORE = 78;
const STOCK_GALLERY_BASE_SCORE = 72;
const MIN_HERO_SCORE_TO_BEAT_STOCK = 72;
const MIN_GALLERY_BUSINESS_SCORE = 52;
const MIN_GALLERY_WEBSITE_SCORE = 58;

export interface ImageCurationContext {
  businessName: string;
  category: string;
  niche?: NicheType;
  keywords: string[];
  stockHero: string;
  stockGallery: string[];
}

export interface CuratedImages {
  hero: string;
  gallery: string[];
  sources: { hero: "business" | "website" | "stock"; gallery: string[] };
}

/** Upgrade Google user content URLs to a usable hero/gallery resolution. */
export function upgradeGooglePhotoUrl(url: string, maxWidth = 1920): string {
  if (!url.includes("googleusercontent.com")) return url;

  const height = Math.round(maxWidth * 0.75);
  const sizeParam = `=w${maxWidth}-h${height}-k-no`;

  if (/=w\d+-h\d+/i.test(url)) {
    return url.replace(/=w\d+-h\d+(-[a-z-]+)?/gi, sizeParam);
  }
  if (/=s\d+/i.test(url)) {
    return url.replace(/=s\d+(-[a-z-]+)?/gi, `=s${maxWidth}$1`);
  }
  if (/=[^/?#]+$/i.test(url)) {
    return url.replace(/=[^/?#]+$/i, sizeParam);
  }

  return `${url}${sizeParam}`;
}

/** Upgrade Unsplash URLs to high-quality, modern format params. */
export function upgradeUnsplashUrl(url: string, width = 1920): string {
  if (!url.includes("images.unsplash.com")) return url;

  try {
    const parsed = new URL(url);
    parsed.searchParams.set("w", String(width));
    parsed.searchParams.set("q", "90");
    parsed.searchParams.set("auto", "format");
    parsed.searchParams.set("fit", "crop");
    return parsed.toString();
  } catch {
    return url.replace(/w=\d+/, `w=${width}`).replace(/q=\d+/, "q=90");
  }
}

export function normalizeImageUrl(url: string): string {
  if (!url?.trim()) return url;
  const trimmed = url.trim();
  try {
    if (trimmed.includes("googleusercontent.com")) {
      return upgradeGooglePhotoUrl(trimmed);
    }
    if (trimmed.includes("images.unsplash.com")) {
      return upgradeUnsplashUrl(trimmed);
    }
    return trimmed;
  } catch {
    return trimmed;
  }
}

function parseSmallestDimension(url: string): number | null {
  const match = url.match(SMALL_DIMENSION_PATTERN);
  if (!match) return null;
  const nums = [match[1], match[2], match[3]]
    .filter(Boolean)
    .map((n) => parseInt(n!, 10));
  if (nums.length === 0) return null;
  return Math.min(...nums);
}

function parseLargestDimension(url: string): number | null {
  const match = url.match(SMALL_DIMENSION_PATTERN);
  if (!match) return null;
  const nums = [match[1], match[2], match[3]]
    .filter(Boolean)
    .map((n) => parseInt(n!, 10));
  if (nums.length === 0) return null;
  return Math.max(...nums);
}

export function isLowQualityImageUrl(url: string): boolean {
  if (!url || url.startsWith("data:")) return true;
  if (JUNK_URL_PATTERNS.some((p) => p.test(url))) return true;

  const dim = parseSmallestDimension(url);
  if (dim !== null && dim < 200) return true;

  return false;
}

function isLikelyPortraitCrop(url: string): boolean {
  const wMatch = url.match(/=w(\d+)-h(\d+)/);
  if (!wMatch) return false;
  const w = parseInt(wMatch[1], 10);
  const h = parseInt(wMatch[2], 10);
  return w === h && w < 600;
}

function scoreBusinessPhoto(url: string, index: number): number {
  let score = 85 - index * 6;

  if (isLowQualityImageUrl(url)) return -100;
  if (isLikelyPortraitCrop(url)) score -= 35;

  if (url.includes("googleusercontent.com")) {
    score += 15;
    const maxDim = parseLargestDimension(url);
    if (maxDim !== null && maxDim >= 1200) score += 20;
    else if (maxDim !== null && maxDim >= 800) score += 10;
    else if (maxDim !== null && maxDim < 500) score -= 25;
  }

  return score;
}

function scoreWebsiteImage(url: string, index: number): number {
  let score = 55 - index * 5;

  if (isLowQualityImageUrl(url)) return -100;

  if (/hero|banner|cover|featured|og|opengraph/i.test(url)) score += 30;
  if (/thumb|thumbnail|icon|logo|avatar|small|mini|sprite|ui-/i.test(url)) score -= 60;

  const maxDim = parseLargestDimension(url);
  if (maxDim !== null && maxDim >= 800) score += 12;
  if (maxDim !== null && maxDim < 400) score -= 30;

  return score;
}

function dedupeUrls(urls: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const raw of urls) {
    const url = normalizeImageUrl(raw);
    const key = url.split("?")[0];
    if (!seen.has(key)) {
      seen.add(key);
      result.push(url);
    }
  }

  return result;
}

function pickBestHero(
  businessPhotos: string[],
  websiteImages: string[],
  stockHero: string
): { url: string; source: CuratedImages["sources"]["hero"] } {
  const stockUrl = normalizeImageUrl(stockHero);
  const candidates: { url: string; score: number; source: CuratedImages["sources"]["hero"] }[] = [
    { url: stockUrl, score: STOCK_HERO_SCORE, source: "stock" },
  ];

  businessPhotos.forEach((url, i) => {
    const normalized = normalizeImageUrl(url);
    const score = scoreBusinessPhoto(normalized, i);
    if (score >= MIN_HERO_SCORE_TO_BEAT_STOCK) {
      candidates.push({ url: normalized, score, source: "business" });
    }
  });

  websiteImages.slice(0, 6).forEach((url, i) => {
    const normalized = normalizeImageUrl(url);
    const score = scoreWebsiteImage(normalized, i);
    // Only allow website images that look like intentional hero/banner assets
    if (score >= 85) {
      candidates.push({ url: normalized, score, source: "website" });
    }
  });

  candidates.sort((a, b) => b.score - a.score);
  const winner = candidates[0];

  return { url: winner.url, source: winner.source };
}

function buildGallery(
  heroUrl: string,
  businessPhotos: string[],
  websiteImages: string[],
  stockGallery: string[]
): { gallery: string[]; sources: string[] } {
  const galleryCandidates: { url: string; score: number; tag: string }[] = [];
  const heroKey = heroUrl.split("?")[0];

  stockGallery.forEach((url, i) => {
    const normalized = normalizeImageUrl(url);
    if (normalized.split("?")[0] === heroKey) return;
    galleryCandidates.push({
      url: normalized,
      score: STOCK_GALLERY_BASE_SCORE - i * 2,
      tag: "stock",
    });
  });

  businessPhotos.forEach((url, i) => {
    const normalized = normalizeImageUrl(url);
    if (normalized.split("?")[0] === heroKey) return;
    const score = scoreBusinessPhoto(normalized, i);
    if (score >= MIN_GALLERY_BUSINESS_SCORE) {
      galleryCandidates.push({ url: normalized, score: score - 8, tag: "business" });
    }
  });

  websiteImages.forEach((url, i) => {
    const normalized = normalizeImageUrl(url);
    if (normalized.split("?")[0] === heroKey) return;
    const score = scoreWebsiteImage(normalized, i);
    if (score >= MIN_GALLERY_WEBSITE_SCORE) {
      galleryCandidates.push({ url: normalized, score: score - 12, tag: "website" });
    }
  });

  galleryCandidates.sort((a, b) => b.score - a.score);

  const gallery: string[] = [];
  const sources: string[] = [];
  const seen = new Set<string>([heroKey]);

  // Prefer niche stock first, then supplement with real business photos
  for (const c of galleryCandidates) {
    const key = c.url.split("?")[0];
    if (seen.has(key)) continue;
    seen.add(key);
    gallery.push(c.url);
    sources.push(c.tag);
    if (gallery.length >= 6) break;
  }

  if (gallery.length < 3) {
    for (const url of stockGallery) {
      const normalized = normalizeImageUrl(url);
      const key = normalized.split("?")[0];
      if (seen.has(key)) continue;
      seen.add(key);
      gallery.push(normalized);
      sources.push("stock");
      if (gallery.length >= 4) break;
    }
  }

  if (gallery.length === 0) {
    const fallback = stockGallery.find((u) => u.split("?")[0] !== heroKey) || heroUrl;
    gallery.push(normalizeImageUrl(fallback));
    sources.push("stock");
  }

  return { gallery, sources };
}

export function curateSiteImages(
  business: BusinessData,
  website: WebsiteData | undefined,
  context: ImageCurationContext
): CuratedImages {
  const businessPhotos = dedupeUrls(business.photos || []);
  const websiteImages = dedupeUrls(website?.images || []);
  const stockGallery = context.stockGallery.map(normalizeImageUrl);
  const stockHero = normalizeImageUrl(context.stockHero);

  const heroPick = pickBestHero(businessPhotos, websiteImages, stockHero);
  const { gallery, sources: gallerySources } = buildGallery(
    heroPick.url,
    businessPhotos,
    websiteImages,
    stockGallery
  );

  return {
    hero: heroPick.url,
    gallery,
    sources: { hero: heroPick.source, gallery: gallerySources },
  };
}

/** Upgrade all photo URLs at scrape time. */
export function upgradePhotoList(urls: string[]): string[] {
  return dedupeUrls(urls.filter((u) => !isLowQualityImageUrl(u)));
}
