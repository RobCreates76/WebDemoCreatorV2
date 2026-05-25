import { NextRequest, NextResponse } from "next/server";
import {
  getPublicAgentSettings,
  writeAgentSettings,
  clearAgentSettings,
  type AgentProviderType,
} from "@/lib/config/agent-settings-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getPublicAgentSettings());
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    const provider = body.provider as AgentProviderType;
    const model = body.model?.trim();

    if (!provider || !model) {
      return NextResponse.json(
        { error: "Provider and model are required" },
        { status: 400 }
      );
    }

    const validProviders: AgentProviderType[] = [
      "ollama-cloud",
      "ollama-local",
      "openai",
      "anthropic",
    ];
    if (!validProviders.includes(provider)) {
      return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
    }

    writeAgentSettings({
      provider,
      model,
      ollamaCloudUrl: body.ollamaCloudUrl,
      ollamaLocalHost: body.ollamaLocalHost,
      apiKey: body.apiKey?.trim() || "",
    });

    return NextResponse.json({
      ok: true,
      settings: getPublicAgentSettings(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save settings";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE() {
  clearAgentSettings();
  return NextResponse.json({ ok: true, settings: getPublicAgentSettings() });
}
