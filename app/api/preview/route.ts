import { NextRequest, NextResponse } from "next/server";
import { renderSiteHtml } from "@/lib/generation/site-renderer";
import type { SiteModel } from "@/lib/models/site-model";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { site, editMode } = await request.json();
    if (!site) {
      return NextResponse.json({ error: "Site model required" }, { status: 400 });
    }
    const html = renderSiteHtml(site as SiteModel, { editMode: !!editMode });
    return new NextResponse(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Preview failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
