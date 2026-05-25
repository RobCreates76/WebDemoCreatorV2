import type { BuildMode, BusinessProfile, ResearchData } from "@/lib/models/site-model";
import { buildAgentProfile } from "@/lib/ai/demo-agent";
import { isAgentConfigured } from "@/lib/ai/provider";
import { buildBusinessProfile } from "@/lib/research/business-profiler";

export async function enrichResearchWithMode(
  research: ResearchData,
  buildMode: BuildMode
): Promise<ResearchData> {
  let profile: BusinessProfile;

  if (buildMode === "agent") {
    if (!isAgentConfigured()) {
      throw new Error(
        "AI Agent mode needs credentials. Open Agent Settings to add your Ollama Cloud API key."
      );
    }
    profile = await buildAgentProfile(research);
  } else {
    profile = buildBusinessProfile(research);
  }

  return { ...research, profile, buildMode };
}
