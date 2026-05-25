import "server-only";

import { readFileSync, writeFileSync, mkdirSync, existsSync, chmodSync } from "fs";
import path from "path";
import type { AgentProviderType, AgentSettingsPublic } from "./agent-settings-types";

export type { AgentProviderType, AgentSettingsPublic } from "./agent-settings-types";

export interface AgentSettings {
  provider: AgentProviderType;
  ollamaCloudUrl: string;
  ollamaLocalHost: string;
  apiKey: string;
  model: string;
  updatedAt: string;
}

const SETTINGS_DIR = path.join(process.cwd(), ".demo-builder");
const SETTINGS_FILE = path.join(SETTINGS_DIR, "agent-settings.json");

const DEFAULTS: Omit<AgentSettings, "updatedAt"> = {
  provider: "ollama-cloud",
  ollamaCloudUrl: "https://ollama.com",
  ollamaLocalHost: "127.0.0.1:11434",
  apiKey: "",
  model: "gpt-oss:120b",
};

function ensureDir() {
  if (!existsSync(SETTINGS_DIR)) {
    mkdirSync(SETTINGS_DIR, { recursive: true });
  }
}

function maskApiKey(key: string): string | null {
  if (!key || key.length < 8) return key ? "••••" : null;
  return `••••••••${key.slice(-4)}`;
}

export function readAgentSettings(): AgentSettings | null {
  try {
    if (!existsSync(SETTINGS_FILE)) return null;
    const raw = readFileSync(SETTINGS_FILE, "utf-8");
    const parsed = JSON.parse(raw) as AgentSettings;
    if (!parsed.provider || !parsed.model) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeAgentSettings(
  input: Partial<AgentSettings> & Pick<AgentSettings, "provider" | "model">
): AgentSettings {
  ensureDir();
  const existing = readAgentSettings();

  const next: AgentSettings = {
    provider: input.provider,
    ollamaCloudUrl: input.ollamaCloudUrl?.trim() || DEFAULTS.ollamaCloudUrl,
    ollamaLocalHost: input.ollamaLocalHost?.trim() || DEFAULTS.ollamaLocalHost,
    apiKey:
      input.apiKey !== undefined && input.apiKey.trim()
        ? input.apiKey.trim()
        : existing?.apiKey || "",
    model: input.model.trim(),
    updatedAt: new Date().toISOString(),
  };

  writeFileSync(SETTINGS_FILE, JSON.stringify(next, null, 2), "utf-8");

  try {
    chmodSync(SETTINGS_FILE, 0o600);
  } catch {
    /* Windows may not support chmod — file is still gitignored */
  }

  return next;
}

export function clearAgentSettings(): void {
  if (existsSync(SETTINGS_FILE)) {
    writeFileSync(SETTINGS_FILE, "{}", "utf-8");
  }
}

function settingsFromEnv(): AgentSettings | null {
  const apiKey = process.env.OLLAMA_API_KEY || process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY;
  const provider = (process.env.AI_PROVIDER?.toLowerCase() || "ollama-cloud") as AgentProviderType;

  if (!apiKey && !process.env.OLLAMA_MODEL && !process.env.AI_MODEL) {
    return null;
  }

  return {
    provider,
    ollamaCloudUrl: process.env.OLLAMA_CLOUD_URL || DEFAULTS.ollamaCloudUrl,
    ollamaLocalHost: process.env.OLLAMA_HOST || DEFAULTS.ollamaLocalHost,
    apiKey: apiKey || "",
    model:
      process.env.OLLAMA_MODEL ||
      process.env.AI_MODEL ||
      DEFAULTS.model,
    updatedAt: "",
  };
}

/** Merged config: in-app settings take priority over .env.local */
export function getEffectiveAgentSettings(): AgentSettings | null {
  const saved = readAgentSettings();
  if (saved?.apiKey) return saved;

  const fromEnv = settingsFromEnv();
  if (fromEnv?.apiKey) return fromEnv;

  if (saved) return saved;
  return fromEnv;
}

export function getPublicAgentSettings(): AgentSettingsPublic {
  const saved = readAgentSettings();
  const fromEnv = settingsFromEnv();
  const effective = getEffectiveAgentSettings();

  const base = saved || fromEnv;
  const source: AgentSettingsPublic["source"] = saved?.apiKey
    ? "app"
    : fromEnv?.apiKey
      ? "env"
      : "none";

  return {
    provider: base?.provider || DEFAULTS.provider,
    ollamaCloudUrl: base?.ollamaCloudUrl || DEFAULTS.ollamaCloudUrl,
    ollamaLocalHost: base?.ollamaLocalHost || DEFAULTS.ollamaLocalHost,
    model: base?.model || DEFAULTS.model,
    hasApiKey: Boolean(effective?.apiKey),
    apiKeyHint: effective?.apiKey ? maskApiKey(effective.apiKey) : null,
    configured: Boolean(effective?.apiKey),
    source,
  };
}

export { maskApiKey };
