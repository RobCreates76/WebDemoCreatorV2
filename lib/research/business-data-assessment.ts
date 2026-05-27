import type { ResearchData } from "@/lib/models/site-model";
import { extractSignals } from "@/lib/research/signal-extractor";

export type DataRichness = "rich" | "moderate" | "sparse";

export interface BusinessDataAssessment {
  richness: DataRichness;
  score: number;
  signals: string[];
  gaps: string[];
}

export function assessBusinessData(research: ResearchData): BusinessDataAssessment {
  const { business, website, socials } = research;
  const signals = extractSignals(business, website, socials);
  const found: string[] = [];
  const gaps: string[] = [];
  let score = 0;

  if (business.reviews.length >= 5) {
    score += 25;
    found.push(`${business.reviews.length} customer reviews`);
  } else if (business.reviews.length > 0) {
    score += 12;
    found.push(`${business.reviews.length} review(s)`);
    gaps.push("Few customer reviews available");
  } else {
    gaps.push("No customer reviews found");
  }

  const reviewTextLen = business.reviews.reduce((n, r) => n + r.text.length, 0);
  if (reviewTextLen > 400) {
    score += 10;
    found.push("Detailed review language to mirror");
  }

  if (website?.bodySnippet && website.bodySnippet.length > 200) {
    score += 20;
    found.push("Existing website content scraped");
  } else if (website) {
    score += 8;
    found.push("Website URL found but thin content");
    gaps.push("Website has limited scrapeable content");
  } else {
    gaps.push("No website scraped");
  }

  if (website?.serviceHeadings && website.serviceHeadings.length >= 2) {
    score += 10;
    found.push("Services detected on website");
  } else if (signals.services.length >= 3) {
    score += 8;
    found.push("Services inferred from Maps/signals");
  } else {
    gaps.push("Unclear service lineup");
  }

  if (business.description && business.description.length > 40) {
    score += 8;
    found.push("Maps business description");
  } else {
    gaps.push("No Maps description");
  }

  if (business.photos.length >= 3) {
    score += 7;
    found.push(`${business.photos.length} business photos`);
  } else if (business.photos.length > 0) {
    score += 3;
  } else {
    gaps.push("No business photos");
  }

  if (socials.length > 0) {
    score += 7;
    found.push(`${socials.length} social profile(s)`);
  }

  if (signals.positioningHints.length >= 2) {
    score += 8;
    found.push("Positioning hints from web/social");
  }

  if (business.rating > 0 && business.reviewCount > 0) {
    score += 5;
  }

  let richness: DataRichness;
  if (score >= 55) richness = "rich";
  else if (score >= 28) richness = "moderate";
  else richness = "sparse";

  return { richness, score, signals: found, gaps };
}
