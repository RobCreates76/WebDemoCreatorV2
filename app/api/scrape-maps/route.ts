import { NextRequest, NextResponse } from "next/server";
import { scrapeGoogleMaps } from "@/lib/scrapers/google-maps";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    if (!url) {
      return NextResponse.json({ error: "URL required" }, { status: 400 });
    }
    const business = await scrapeGoogleMaps(url);
    return NextResponse.json({ business });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Scrape failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
