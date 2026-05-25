import { NextRequest, NextResponse } from "next/server";
import { buildSiteModel } from "@/lib/generation/site-builder";
import { enrichResearchWithMode } from "@/lib/research/profile-builder";
import type { BuildMode, NicheType, ResearchData } from "@/lib/models/site-model";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  try {
    const { research, niche, buildMode } = await request.json();

    if (!research || !niche) {
      return NextResponse.json(
        { error: "Research data and niche are required" },
        { status: 400 }
      );
    }

    const mode = (buildMode as BuildMode) || research.buildMode || "template";

    const enriched = await enrichResearchWithMode(
      { ...(research as ResearchData), niche: niche as NicheType },
      mode
    );

    const effectiveNiche =
      mode === "agent" && enriched.profile?.niche
        ? enriched.profile.niche
        : (niche as NicheType);

    const site = buildSiteModel({
      ...enriched,
      niche: effectiveNiche,
      buildMode: mode,
    });

    return NextResponse.json({
      site,
      research: { ...enriched, niche: effectiveNiche, buildMode: mode },
      buildMode: mode,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Build failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
