import type { BusinessData, BusinessHours, BusinessReview } from "@/lib/models/site-model";
import { extractCityFromAddress } from "@/lib/utils";
import { withTimeout } from "@/lib/api-client";
import { upgradePhotoList } from "@/lib/media/image-curation";
import {
  extractPlaceNameFromUrl,
  isGoogleMapsUrl,
  resolveMapsUrl,
} from "./google-maps-url";

function parseRating(text: string): number {
  const match = text.match(/([\d.]+)/);
  return match ? parseFloat(match[1]) : 0;
}

function parseReviewCount(text: string): number {
  const match = text.match(/([\d,]+)/);
  return match ? parseInt(match[1].replace(/,/g, ""), 10) : 0;
}

function normalizePhone(text: string): string {
  const digits = text.replace(/\D/g, "");
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits.startsWith("1")) {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return text.trim();
}

async function scrapeWithPlaywright(resolvedUrl: string): Promise<BusinessData> {
  const { chromium } = await import("playwright");

  const browser = await chromium.launch({
    headless: true,
    args: ["--disable-dev-shm-usage", "--no-sandbox"],
  });

  try {
    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      locale: "en-US",
    });
    const page = await context.newPage();

    try {
      await page.goto(resolvedUrl, {
        waitUntil: "domcontentloaded",
        timeout: 35000,
      });
      await page.waitForTimeout(2500);

      const data = await page.evaluate(() => {
        const getText = (selectors: string[]): string => {
          for (const sel of selectors) {
            const el = document.querySelector(sel);
            if (el?.textContent?.trim()) return el.textContent.trim();
          }
          return "";
        };

        const name =
          getText(["h1.DUwDvf", "h1.fontHeadlineLarge", "h1"]) ||
          document.title.split("-")[0]?.trim() ||
          "Local Business";

        const category = getText([
          "button.DkEaL",
          "button[jsaction*='category']",
          ".fontBodyMedium button",
        ]);

        const address = getText([
          "button[data-item-id='address']",
          "[data-item-id='address'] .fontBodyMedium",
          "button[aria-label*='Address']",
        ]);

        const phone = getText([
          "button[data-item-id*='phone']",
          "[data-item-id*='phone'] .fontBodyMedium",
          "button[aria-label*='Phone']",
        ]);

        const websiteEl = document.querySelector(
          "a[data-item-id='authority']"
        ) as HTMLAnchorElement | null;
        const website = websiteEl?.href || "";

        const ratingText = getText([
          "div.F7nice span[aria-hidden='true']",
          ".fontDisplayLarge",
          "[role='img'][aria-label*='stars']",
        ]);
        const ratingLabel =
          document
            .querySelector("[role='img'][aria-label*='stars']")
            ?.getAttribute("aria-label") || ratingText;

        const reviewCountText = getText([
          "button[aria-label*='reviews']",
          "span[aria-label*='reviews']",
        ]);

        const description = getText([
          ".PYvSYb .fontBodyMedium",
          "[data-section-id='overview'] .fontBodyMedium",
        ]);

        const hoursEls = document.querySelectorAll(
          "table.eK4R0e tr, [aria-label*='Hours'] table tr"
        );
        const hours: { day: string; hours: string }[] = [];
        hoursEls.forEach((row) => {
          const cells = row.querySelectorAll("td, th");
          if (cells.length >= 2) {
            hours.push({
              day: cells[0].textContent?.trim() || "",
              hours: cells[1].textContent?.trim() || "",
            });
          }
        });

        const reviewEls = document.querySelectorAll(
          ".jftiEf, [data-review-id], div[data-review-id]"
        );
        const reviews: { author: string; rating: number; text: string }[] = [];
        reviewEls.forEach((el, i) => {
          if (i >= 5) return;
          const author =
            el.querySelector(".d4r55")?.textContent?.trim() ||
            el.querySelector(".WNxzHc")?.textContent?.trim() ||
            "Customer";
          const text =
            el.querySelector(".wiI7pd")?.textContent?.trim() ||
            el.querySelector(".MyEned")?.textContent?.trim() ||
            "";
          const starLabel =
            el
              .querySelector("[role='img'][aria-label*='star']")
              ?.getAttribute("aria-label") || "";
          const ratingMatch = starLabel.match(/([\d.]+)/);
          const rating = ratingMatch ? parseFloat(ratingMatch[1]) : 5;
          if (text) reviews.push({ author, rating, text });
        });

        const photoEls = document.querySelectorAll(
          "button.Tya61d img, img.YWG0g, img[src*='googleusercontent']"
        );
        const photos: string[] = [];
        photoEls.forEach((img, i) => {
          if (i >= 8) return;
          const src = (img as HTMLImageElement).src;
          if (src && !photos.includes(src)) photos.push(src);
        });

        const attributes: string[] = [];
        document
          .querySelectorAll("[aria-label*='Accessibility'], .fontBodyMedium span")
          .forEach((el) => {
            const t = el.textContent?.trim();
            if (t && t.length < 60 && !attributes.includes(t)) attributes.push(t);
          });

        return {
          name,
          category,
          address,
          phone,
          website,
          ratingText: ratingLabel || ratingText,
          reviewCountText,
          description,
          hours,
          reviews,
          photos,
          attributes: attributes.slice(0, 10),
        };
      });

      const fallbackName =
        extractPlaceNameFromUrl(resolvedUrl) || "Local Business";
      const address = data.address || "";
      const city = extractCityFromAddress(address);

      let businessName = data.name || fallbackName;
      if (
        businessName === "Google Maps" ||
        businessName.toLowerCase() === "before you continue" ||
        businessName.length < 2
      ) {
        businessName = fallbackName;
      }

      const result: BusinessData = {
        name: businessName,
        category: data.category || fallbackName.replace(/\+/g, " "),
        address,
        city: city || "Your Area",
        phone: data.phone ? normalizePhone(data.phone) : "",
        website: data.website || undefined,
        hours: data.hours.filter((h) => h.day) as BusinessHours[],
        rating: parseRating(data.ratingText),
        reviewCount: parseReviewCount(data.reviewCountText),
        reviews: data.reviews as BusinessReview[],
        photos: upgradePhotoList(data.photos),
        description: data.description || undefined,
        attributes: data.attributes,
        mapsUrl: resolvedUrl,
      };

      if (!result.phone || result.reviews.length === 0 || result.photos.length === 0) {
        const content = await page.content();
        if (!result.phone) {
          const phoneMatch = content.match(/\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/);
          if (phoneMatch) result.phone = normalizePhone(phoneMatch[0]);
        }
        if (result.photos.length === 0) {
          const rawPhotos = await page.$$eval(
            "img[src*='googleusercontent']",
            (imgs) =>
              imgs
                .map((img) => (img as HTMLImageElement).src)
                .filter((src) => src.includes("="))
                .slice(0, 12)
          );
          result.photos = upgradePhotoList(rawPhotos);
        }
      }

      if (
        result.name === "Local Business" &&
        !result.address &&
        !result.phone &&
        result.photos.length === 0
      ) {
        throw new Error(
          "Could not read business details from Google Maps. Open the link in your browser to verify it works, then try again. If Google shows a consent screen, accept it in Chrome first."
        );
      }

      return result;
    } finally {
      await context.close();
    }
  } finally {
    await browser.close();
  }
}

export async function scrapeGoogleMaps(url: string): Promise<BusinessData> {
  if (!isGoogleMapsUrl(url)) {
    throw new Error(
      "Invalid Google Maps URL. Paste a link from google.com/maps or maps.app.goo.gl"
    );
  }

  const resolvedUrl = await resolveMapsUrl(url);

  try {
    return await withTimeout(
      scrapeWithPlaywright(resolvedUrl),
      55000,
      "Google Maps scrape timed out. Try again or check the link opens in your browser."
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("Executable doesn't exist") || message.includes("browserType.launch")) {
      throw new Error(
        "Playwright browser not installed. Run: npx playwright install chromium"
      );
    }
    throw error instanceof Error ? error : new Error(message);
  }
}
