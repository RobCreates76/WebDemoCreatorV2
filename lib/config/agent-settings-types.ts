export type AgentProviderType =
  | "ollama-cloud"
  | "ollama-local"
  | "openai"
  | "anthropic";

export interface AgentSettingsPublic {
  provider: AgentProviderType;
  ollamaCloudUrl: string;
  ollamaLocalHost: string;
  model: string;
  hasApiKey: boolean;
  apiKeyHint: string | null;
  configured: boolean;
  source: "app" | "env" | "none";
}
