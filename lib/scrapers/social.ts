import * as cheerio from "cheerio";
import type { SocialData } from "@/lib/models/site-model";

function detectPlatform(url: string): string {
  if (url.includes("facebook.com")) return "Facebook";
  if (url.includes("instagram.com")) return "Instagram";
  if (url.includes("linkedin.com")) return "LinkedIn";
  if (url.includes("twitter.com") || url.includes("x.com")) return "X";
  if (url.includes("youtube.com")) return "YouTube";
  if (url.includes("tiktok.com")) return "TikTok";
  return "Social";
}

function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed.startsWith("http")) return `https://${trimmed}`;
  return trimmed;
}

export async function scrapeSocial(url: string): Promise<SocialData> {
  const normalized = normalizeUrl(url);
  const platform = detectPlatform(normalized);

  try {
    const res = await fetch(normalized, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      signal: AbortSignal.timeout(15000),
    });
    const html = await res.text();
    const $ = cheerio.load(html);

    const title =
      $('meta[property="og:title"]').attr("content")?.trim() ||
      $("title").text().trim() ||
      undefined;
    const description =
      $('meta[property="og:description"]').attr("content")?.trim() ||
      $('meta[name="description"]').attr("content")?.trim() ||
      undefined;
    const image = $('meta[property="og:image"]').attr("content") || undefined;

    return { url: normalized, platform, title, description, image };
  } catch {
    return { url: normalized, platform };
  }
}

export async function scrapeSocials(urls: string[]): Promise<SocialData[]> {
  const valid = urls.map((u) => u.trim()).filter(Boolean);
  return Promise.all(valid.map(scrapeSocial));
}
