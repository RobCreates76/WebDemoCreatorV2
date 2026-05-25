import { NextRequest, NextResponse } from "next/server";
import { scrapeGoogleMaps } from "@/lib/scrapers/google-maps";
import { scrapeWebsite } from "@/lib/scrapers/website";
import { scrapeSocials } from "@/lib/scrapers/social";
import { detectNicheFromResearch } from "@/lib/generation/niche-detector";
import { buildSiteModel } from "@/lib/generation/site-builder";
import { enrichResearchWithMode } from "@/lib/research/profile-builder";
import { runConversionAudit } from "@/lib/audit/conversion-rules";
import { scoreAudit } from "@/lib/audit/scoring";
import type { BuildMode, NicheType, ResearchData } from "@/lib/models/site-model";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const mapsUrl = body.mapsUrl?.trim();
    const websiteUrl = body.websiteUrl?.trim();
    const socialUrlsRaw = body.socialUrls?.trim() || "";
    const nicheOverride = body.nicheOverride as NicheType | undefined;
    const buildMode = (body.buildMode as BuildMode) || "template";

    if (!mapsUrl) {
      return NextResponse.json(
        { error: "Google Maps URL is required" },
        { status: 400 }
      );
    }

    const business = await scrapeGoogleMaps(mapsUrl);

    let website;
    const siteToScrape = websiteUrl || business.website;
    if (siteToScrape) {
      try {
        website = await scrapeWebsite(siteToScrape);
      } catch {
        /* website scrape optional */
      }
    }

    const socialUrls = socialUrlsRaw
      .split(/[\n,]+/)
      .map((u: string) => u.trim())
      .filter(Boolean);
    const socials = socialUrls.length > 0 ? await scrapeSocials(socialUrls) : [];

    const nicheDetection = detectNicheFromResearch({ business, website, socials });
    const niche = nicheOverride || nicheDetection.niche;

    let research: ResearchData = {
      business,
      website,
      socials,
      niche,
      nicheDetection,
    };

    research = await enrichResearchWithMode(research, buildMode);
    research.buildMode = buildMode;

    const effectiveNiche =
      buildMode === "agent" && research.profile?.niche
        ? research.profile.niche
        : niche;

    if (buildMode === "agent" && research.profile) {
      research.niche = effectiveNiche;
      if (research.nicheDetection) {
        research.nicheDetection = {
          ...research.nicheDetection,
          niche: effectiveNiche,
          reason: research.profile.nicheReasoning
            ? `AI Agent: ${research.profile.nicheReasoning}`
            : research.nicheDetection.reason,
          needsConfirmation: false,
          confidence: 95,
        };
      }
    }

    const findings = runConversionAudit(website, business);
    const audit = scoreAudit(findings);

    const needsNicheConfirmation =
      buildMode === "template" &&
      !nicheOverride &&
      nicheDetection.needsConfirmation;

    if (needsNicheConfirmation) {
      return NextResponse.json({
        research,
        audit,
        needsNicheConfirmation: true,
        nicheDetection,
        buildMode,
      });
    }

    const site = buildSiteModel({ ...research, niche: effectiveNiche, buildMode });

    return NextResponse.json({
      research,
      site,
      audit,
      needsNicheConfirmation: false,
      nicheDetection,
      buildMode,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Research failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
