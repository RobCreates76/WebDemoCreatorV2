import { NextRequest, NextResponse } from "next/server";
import { scrapeWebsite } from "@/lib/scrapers/website";

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    if (!url) {
      return NextResponse.json({ error: "URL required" }, { status: 400 });
    }
    const website = await scrapeWebsite(url);
    return NextResponse.json({ website });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Scrape failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
