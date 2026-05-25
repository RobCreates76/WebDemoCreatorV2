import type {
  AuditCategory,
  AuditFinding,
  AuditPriority,
  BusinessData,
  WebsiteData,
} from "@/lib/models/site-model";
import { COPY_SUGGESTIONS } from "./copy-suggestions";

let findingCounter = 0;

function finding(
  priority: AuditPriority,
  category: AuditCategory,
  title: string,
  description: string,
  suggestion: string,
  scoreImpact: number,
  suggestedCopy?: string,
  demoFix?: string
): AuditFinding {
  findingCounter += 1;
  return {
    id: `finding-${findingCounter}`,
    priority,
    category,
    title,
    description,
    suggestion,
    suggestedCopy,
    demoFix,
    scoreImpact,
  };
}

export function runConversionAudit(
  website: WebsiteData | undefined,
  business: BusinessData
): AuditFinding[] {
  const findings: AuditFinding[] = [];
  findingCounter = 0;

  if (!website) {
    findings.push(
      finding(
        "P0",
        "above-the-fold",
        "No website detected",
        "This business has no discoverable website from Google Maps. You're invisible to searchers who want to learn more before calling.",
        "Launch a professional landing page with clear services, social proof, and a click-to-call CTA.",
        15,
        `${business.name} — Trusted ${business.category} in ${business.city}. Call ${business.phone} today.`,
        "Full demo site with hero, services, reviews, and contact"
      )
    );
    return findings;
  }

  // Above the fold
  if (!website.h1) {
    findings.push(
      finding(
        "P0",
        "above-the-fold",
        "Missing H1 headline",
        "No primary headline detected. Visitors can't instantly understand what you offer.",
        "Add a single, outcome-focused H1 above the fold.",
        12,
        COPY_SUGGESTIONS.headline(business),
        "Hero section with conversion-focused headline"
      )
    );
  } else if (
    /welcome to|home|about us/i.test(website.h1) &&
    !/\b(get|book|call|free|best|trusted|#1)\b/i.test(website.h1)
  ) {
    findings.push(
      finding(
        "P1",
        "above-the-fold",
        "Vague hero headline",
        `Current H1 "${website.h1}" communicates identity, not value. Visitors bounce before understanding why they should choose you.`,
        "Rewrite the headline around the outcome the customer gets.",
        10,
        COPY_SUGGESTIONS.headline(business),
        "Hero headline rewritten for conversion"
      )
    );
  }

  const hasPhoneAboveFold =
    website.phoneNumbers.length > 0 || website.ctaTexts.some((c) => /call/i.test(c));
  if (!hasPhoneAboveFold) {
    findings.push(
      finding(
        "P0",
        "conversion",
        "No phone or CTA above the fold",
        "Searchers ready to buy can't act immediately. Every second of friction costs leads.",
        "Add a prominent click-to-call button and phone number in the header.",
        14,
        `Call ${business.phone}`,
        "Sticky header with phone + primary CTA"
      )
    );
  }

  if (website.ctaTexts.length === 0) {
    findings.push(
      finding(
        "P0",
        "conversion",
        "No clear call-to-action",
        "The page has no actionable buttons. Visitors read and leave without converting.",
        "Add a primary CTA (Book, Call, Get Quote) repeated at key scroll points.",
        13,
        COPY_SUGGESTIONS.cta(business.category),
        "Dual CTAs in hero + contact band"
      )
    );
  } else if (website.ctaTexts.length === 1) {
    findings.push(
      finding(
        "P1",
        "conversion",
        "Single weak CTA",
        "One generic CTA isn't enough. Repeat the action at hero, mid-page, and footer.",
        "Add secondary CTAs and a sticky mobile call button.",
        8,
        COPY_SUGGESTIONS.cta(business.category),
        "Multiple CTA placements throughout demo"
      )
    );
  }

  // Trust
  if (!website.html.includes("review") && business.reviewCount > 0) {
    findings.push(
      finding(
        "P0",
        "trust",
        "Google reviews not showcased",
        `You have ${business.reviewCount}+ Google reviews but they're not on your site. This is free trust you're wasting.`,
        "Add a testimonials section with star rating and real review quotes.",
        12,
        `"${business.reviews[0]?.text?.slice(0, 120) || "Excellent service"}..." — ${business.reviews[0]?.author || "Verified Customer"}`,
        "Testimonials section with real Google reviews"
      )
    );
  }

  if (!website.html.toLowerCase().includes(business.address.toLowerCase().slice(0, 10))) {
    findings.push(
      finding(
        "P1",
        "trust",
        "Address not visible",
        "Local customers can't verify you're a real business in their area.",
        "Display full NAP (Name, Address, Phone) in footer and contact section.",
        7,
        business.address,
        "Contact section with full address"
      )
    );
  }

  // Typography
  if (website.fontFamilies.length > 3) {
    findings.push(
      finding(
        "P2",
        "typography",
        "Too many font families",
        `${website.fontFamilies.length} fonts detected (${website.fontFamilies.slice(0, 3).join(", ")}...). This screams amateur and hurts readability.`,
        "Limit to one display font + one body font.",
        5,
        undefined,
        "Curated typography pair per niche"
      )
    );
  }

  if (website.bodyFontSize && website.bodyFontSize < 16) {
    findings.push(
      finding(
        "P1",
        "typography",
        "Body text too small",
        `${website.bodyFontSize}px body text fails readability standards, especially on mobile.`,
        "Set body text to 16px minimum with 1.5–1.7 line height.",
        6,
        undefined,
        "16px base with optimized line-height"
      )
    );
  }

  const h1Count = (website.html.match(/<h1/gi) || []).length;
  if (h1Count > 1) {
    findings.push(
      finding(
        "P2",
        "typography",
        "Multiple H1 tags",
        `${h1Count} H1 elements detected. This confuses search engines and dilutes visual hierarchy.`,
        "Use exactly one H1 per page. Demote others to H2.",
        4,
        undefined,
        "Single H1 in hero section"
      )
    );
  }

  // Mobile
  if (!website.hasViewport) {
    findings.push(
      finding(
        "P0",
        "mobile",
        "Missing viewport meta tag",
        "Site won't render correctly on mobile — where 60%+ of local searches happen.",
        'Add <meta name="viewport" content="width=device-width, initial-scale=1">',
        15,
        undefined,
        "Responsive viewport configured"
      )
    );
  }

  // Performance
  if (website.heroImageSize && website.heroImageSize > 500000) {
    findings.push(
      finding(
        "P1",
        "performance",
        "Oversized hero image",
        `Hero image is ~${Math.round(website.heroImageSize / 1024)}KB. Page feels slow before content even loads.`,
        "Compress hero to under 200KB WebP. Use lazy loading for below-fold images.",
        7,
        undefined,
        "Optimized images with lazy loading"
      )
    );
  }

  if (!website.hasLazyLoading) {
    findings.push(
      finding(
        "P2",
        "performance",
        "No lazy loading on images",
        "All images load immediately, slowing initial paint.",
        "Add loading='lazy' to below-fold images.",
        4,
        undefined,
        "Lazy loading enabled on gallery"
      )
    );
  }

  // SEO / Local
  if (!website.title) {
    findings.push(
      finding(
        "P0",
        "seo-local",
        "Missing page title",
        "No title tag means poor search visibility and unprofessional browser tabs.",
        "Add a title with business name, service, and city.",
        10,
        `${business.name} | ${business.category} in ${business.city}`,
        "SEO-optimized title tag"
      )
    );
  } else if (!website.title.toLowerCase().includes(business.city.toLowerCase())) {
    findings.push(
      finding(
        "P1",
        "seo-local",
        "City missing from title",
        `"${website.title}" doesn't include "${business.city}". Local searchers won't know you're nearby.`,
        "Include city name in title and meta description.",
        8,
        `${business.name} | ${business.category} in ${business.city}`,
        "Local SEO in meta tags"
      )
    );
  }

  if (!website.description) {
    findings.push(
      finding(
        "P1",
        "seo-local",
        "Missing meta description",
        "Google shows a random snippet instead of your pitch. You lose control of first impressions.",
        "Write a 150-character description with rating, service, and CTA.",
        7,
        COPY_SUGGESTIONS.metaDescription(business),
        "Meta description in demo export"
      )
    );
  }

  if (!website.hasLocalSchema) {
    findings.push(
      finding(
        "P1",
        "seo-local",
        "No LocalBusiness schema",
        "Missing structured data means Google can't display rich results (hours, rating, address).",
        "Add JSON-LD LocalBusiness schema with NAP data.",
        6,
        undefined,
        "Schema markup recommended in README"
      )
    );
  }

  // Premium feel
  if (/lorem ipsum/i.test(website.html)) {
    findings.push(
      finding(
        "P0",
        "premium-feel",
        "Placeholder lorem ipsum detected",
        "Nothing kills credibility faster than filler text on a live business site.",
        "Replace all placeholder copy with real service descriptions and testimonials.",
        15,
        undefined,
        "Real business copy throughout demo"
      )
    );
  }

  if (
    (website.html.match(/gradient/gi) || []).length > 5 ||
    /linear-gradient[\s\S]*linear-gradient/i.test(website.html)
  ) {
    findings.push(
      finding(
        "P2",
        "premium-feel",
        "Gradient overload",
        "Excessive gradients feel dated and 'template-y'. Premium sites use restraint.",
        "Use solid colors or subtle gradients on one accent element only.",
        5,
        undefined,
        "Restrained color system with niche tokens"
      )
    );
  }

  if (!website.isHttps) {
    findings.push(
      finding(
        "P0",
        "trust",
        "Site not served over HTTPS",
        "Browsers flag HTTP sites as 'Not Secure'. Instant trust killer.",
        "Enable SSL certificate immediately.",
        12,
        undefined,
        "Demo export served over HTTPS when deployed"
      )
    );
  }

  // Psychology
  if (!website.html.toLowerCase().includes("faq") && !website.html.toLowerCase().includes("question")) {
    findings.push(
      finding(
        "P1",
        "psychology",
        "No FAQ section",
        "Unanswered objections (pricing, timeline, service area) block conversions silently.",
        "Add FAQ addressing top 4 customer objections.",
        8,
        undefined,
        "FAQ section with objection-handling copy"
      )
    );
  }

  if (
    !/guarantee|insured|licensed|certified|award|trusted|years/i.test(website.html)
  ) {
    findings.push(
      finding(
        "P1",
        "psychology",
        "No risk reversal or trust badges",
        "Visitors have no reason to believe you're safe to hire. Anxiety wins.",
        "Add trust signals: licensed, insured, satisfaction guarantee, review count.",
        9,
        "Licensed & Insured • Satisfaction Guaranteed",
        "Social proof strip with badges"
      )
    );
  }

  if (website.formFieldCount > 6) {
    findings.push(
      finding(
        "P1",
        "conversion",
        "Contact form too long",
        `${website.formFieldCount} form fields create friction. Most leads abandon after 3 fields.`,
        "Reduce to name, phone, and message. Capture the rest on the call.",
        7,
        undefined,
        "3-field contact form in demo"
      )
    );
  }

  if (!website.html.toLowerCase().includes("why")) {
    findings.push(
      finding(
        "P2",
        "psychology",
        "No 'Why Us' differentiation",
        "Site lists services but doesn't explain why you're the better choice.",
        "Add 3 differentiators tied to customer anxiety (speed, price transparency, guarantee).",
        6,
        undefined,
        "Why Us section with differentiators"
      )
    );
  }

  // Color/contrast heuristic
  if (website.colors.length === 0) {
    findings.push(
      finding(
        "P2",
        "color-contrast",
        "No cohesive color system detected",
        "Site appears to lack a defined palette. Inconsistent colors feel cheap.",
        "Define primary, accent, and neutral colors. Use consistently.",
        5,
        undefined,
        "Niche-specific design token system"
      )
    );
  }

  return findings;
}
