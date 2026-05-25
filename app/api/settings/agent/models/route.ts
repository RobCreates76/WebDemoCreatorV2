import { NextRequest, NextResponse } from "next/server";
import { listAgentModels } from "@/lib/ai/provider";
import { readAgentSettings, type AgentProviderType } from "@/lib/config/agent-settings-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** List Ollama models for the given (or saved) credentials */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const existing = readAgentSettings();

    const provider = body.provider as AgentProviderType;
    const apiKey = body.apiKey?.trim() || existing?.apiKey || process.env.OLLAMA_API_KEY || "";

    if (!provider) {
      return NextResponse.json({ models: [], message: "Provider is required" }, { status: 400 });
    }

    const result = await listAgentModels({
      provider,
      ollamaCloudUrl: body.ollamaCloudUrl,
      ollamaLocalHost: body.ollamaLocalHost,
      apiKey,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load models";
    return NextResponse.json({ models: [], message }, { status: 500 });
  }
}
