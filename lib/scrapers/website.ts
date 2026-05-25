import * as cheerio from "cheerio";
import type { WebsiteData } from "@/lib/models/site-model";

function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed.startsWith("http")) return `https://${trimmed}`;
  return trimmed;
}

function extractColors(html: string): string[] {
  const colors = new Set<string>();
  const hexMatches = html.match(/#[0-9a-fA-F]{3,8}\b/g) || [];
  hexMatches.forEach((c) => colors.add(c.toLowerCase()));
  const rgbMatches = html.match(/rgb\([^)]+\)/g) || [];
  rgbMatches.slice(0, 5).forEach((c) => colors.add(c));
  return Array.from(colors).slice(0, 12);
}

function extractFontFamilies(html: string): string[] {
  const fonts = new Set<string>();
  const matches = html.match(/font-family:\s*([^;}"']+)/gi) || [];
  matches.forEach((m) => {
    const family = m.replace(/font-family:\s*/i, "").split(",")[0]?.trim().replace(/['"]/g, "");
    if (family && family !== "inherit") fonts.add(family);
  });
  return Array.from(fonts).slice(0, 8);
}

export async function scrapeWebsite(url: string): Promise<WebsiteData> {
  const normalized = normalizeUrl(url);
  const res = await fetch(normalized, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
    signal: AbortSignal.timeout(20000),
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch website: ${res.status}`);
  }

  const html = await res.text();
  const $ = cheerio.load(html);

  const title = $("title").first().text().trim() || undefined;
  const description =
    $('meta[name="description"]').attr("content")?.trim() ||
    $('meta[property="og:description"]').attr("content")?.trim() ||
    undefined;

  const h1 = $("h1").first().text().trim() || undefined;
  const headings: string[] = [];
  $("h1, h2, h3").each((_, el) => {
    const t = $(el).text().trim();
    if (t) headings.push(t);
  });

  const serviceHeadings: string[] = [];
  $(
    "[class*='service'] h2, [class*='service'] h3, [id*='service'] h2, [id*='service'] h3, section[class*='offer'] h2, section[class*='offer'] h3"
  ).each((_, el) => {
    const t = $(el).text().trim();
    if (t && t.length < 80) serviceHeadings.push(t);
  });

  const navLinks: string[] = [];
  $("nav a, header a, [role='navigation'] a").each((_, el) => {
    const t = $(el).text().trim();
    if (t && t.length < 50 && !navLinks.includes(t)) navLinks.push(t);
  });

  const bodySnippet = $("main p, section p, .hero p, [class*='intro'] p")
    .slice(0, 5)
    .map((_, el) => $(el).text().trim())
    .get()
    .filter((t) => t.length > 30 && t.length < 400)
    .join(" ")
    .slice(0, 600);

  const phoneNumbers = new Set<string>();
  const phoneRegex = /\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g;
  const bodyText = $("body").text();
  (bodyText.match(phoneRegex) || []).forEach((p) => phoneNumbers.add(p));

  const emails = new Set<string>();
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  (bodyText.match(emailRegex) || []).forEach((e) => emails.add(e));

  const images: string[] = [];
  $("img[src]").each((_, el) => {
    const src = $(el).attr("src");
    if (src && !src.includes("data:") && images.length < 20) {
      try {
        images.push(new URL(src, normalized).href);
      } catch {
        /* skip invalid */
      }
    }
  });

  const ctaTexts: string[] = [];
  $("a, button").each((_, el) => {
    const text = $(el).text().trim().toLowerCase();
    if (
      /call|book|contact|quote|schedule|appointment|get started|free estimate|reserve|order/.test(
        text
      ) &&
      text.length < 40
    ) {
      ctaTexts.push($(el).text().trim());
    }
  });

  const formFieldCount = $("form input, form textarea, form select").length;
  const hasViewport = $('meta[name="viewport"]').length > 0;
  const hasLocalSchema =
    html.includes("LocalBusiness") || html.includes("local business");

  let bodyFontSize: number | undefined;
  const inlineStyle = $("body").attr("style") || "";
  const fontSizeMatch = inlineStyle.match(/font-size:\s*(\d+)px/);
  if (fontSizeMatch) bodyFontSize = parseInt(fontSizeMatch[1], 10);

  const heroImg = $("img").first().attr("src");
  let heroImageSize: number | undefined;
  if (heroImg && !heroImg.startsWith("data:")) {
    try {
      const imgUrl = new URL(heroImg, normalized).href;
      const head = await fetch(imgUrl, { method: "HEAD", signal: AbortSignal.timeout(5000) });
      const len = head.headers.get("content-length");
      if (len) heroImageSize = parseInt(len, 10);
    } catch {
      /* ignore */
    }
  }

  const hasLazyLoading = $("img[loading='lazy']").length > 0;

  return {
    url: normalized,
    title,
    description,
    h1,
    headings,
    serviceHeadings: Array.from(new Set(serviceHeadings)).slice(0, 12),
    navLinks: navLinks.slice(0, 15),
    bodySnippet,
    phoneNumbers: Array.from(phoneNumbers),
    emails: Array.from(emails),
    images,
    colors: extractColors(html),
    hasViewport,
    hasLocalSchema,
    ctaTexts: Array.from(new Set(ctaTexts)).slice(0, 10),
    formFieldCount,
    fontFamilies: extractFontFamilies(html),
    bodyFontSize,
    heroImageSize,
    hasLazyLoading,
    isHttps: normalized.startsWith("https://"),
    html,
  };
}
