import { NextRequest, NextResponse } from "next/server";
import { buildExportZip } from "@/lib/export/zip-builder";
import type { SiteModel } from "@/lib/models/site-model";

export async function POST(request: NextRequest) {
  try {
    const { site } = await request.json();
    if (!site) {
      return NextResponse.json({ error: "Site model required" }, { status: 400 });
    }
    const blob = await buildExportZip(site as SiteModel);
    const buffer = Buffer.from(await blob.arrayBuffer());
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${(site as SiteModel).slug}-demo.zip"`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Export failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
