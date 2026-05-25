import { NextRequest, NextResponse } from "next/server";
import { runConversionAudit } from "@/lib/audit/conversion-rules";
import { scoreAudit } from "@/lib/audit/scoring";
import type { BusinessData, WebsiteData } from "@/lib/models/site-model";

export async function POST(request: NextRequest) {
  try {
    const { website, business } = await request.json();
    const findings = runConversionAudit(
      website as WebsiteData | undefined,
      business as BusinessData
    );
    const audit = scoreAudit(findings);
    return NextResponse.json({ audit });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Audit failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
