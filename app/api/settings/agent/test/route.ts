import { NextRequest, NextResponse } from "next/server";
import { probeAgentConfig } from "@/lib/ai/provider";
import { readAgentSettings, type AgentProviderType } from "@/lib/config/agent-settings-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Test connection with form values — does not persist unless saved separately */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const existing = readAgentSettings();

    const provider = body.provider as AgentProviderType;
    const model = body.model?.trim();
    const apiKey =
      body.apiKey?.trim() || existing?.apiKey || "";

    if (!provider || !model) {
      return NextResponse.json(
        { available: false, configured: false, provider: null, model: null, message: "Provider and model required" },
        { status: 400 }
      );
    }

    const status = await probeAgentConfig({
      provider,
      model,
      ollamaCloudUrl: body.ollamaCloudUrl,
      ollamaLocalHost: body.ollamaLocalHost,
      apiKey,
    });

    return NextResponse.json(status);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Connection test failed";
    return NextResponse.json(
      { configured: false, available: false, provider: null, model: null, message },
      { status: 500 }
    );
  }
}
