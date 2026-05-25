import "server-only";

import { getEffectiveAgentSettings } from "@/lib/config/agent-settings-store";

export type AiProviderName = "ollama-cloud" | "ollama-local" | "openai" | "anthropic";

export interface AgentStatus {
  available: boolean;
  provider: AiProviderName | null;
  model: string | null;
  message: string;
}

interface ResolvedProvider {
  provider: AiProviderName;
  baseUrl: string;
  apiKey: string;
  model: string;
  requiresAuth: boolean;
}

const OLLAMA_CLOUD_DEFAULT = "https://ollama.com";

function ollamaLocalHost(): string {
  if (process.env.OLLAMA_BASE_URL) {
    return process.env.OLLAMA_BASE_URL.replace(/\/v1\/?$/, "");
  }
  const host = process.env.OLLAMA_HOST || "127.0.0.1:11434";
  return host.startsWith("http") ? host : `http://${host}`;
}

function ollamaCloudHost(): string {
  const url = process.env.OLLAMA_CLOUD_URL || OLLAMA_CLOUD_DEFAULT;
  return url.replace(/\/$/, "");
}

function resolveProvider(): ResolvedProvider | null {
  const saved = getEffectiveAgentSettings();

  if (saved?.apiKey || saved?.provider === "ollama-local") {
    switch (saved.provider) {
      case "ollama-cloud":
        return {
          provider: "ollama-cloud",
          baseUrl: saved.ollamaCloudUrl.replace(/\/$/, ""),
          apiKey: saved.apiKey,
          model: saved.model,
          requiresAuth: true,
        };
      case "ollama-local": {
        const host = saved.ollamaLocalHost;
        const baseUrl = host.startsWith("http") ? host : `http://${host}`;
        return {
          provider: "ollama-local",
          baseUrl,
          apiKey: saved.apiKey,
          model: saved.model,
          requiresAuth: false,
        };
      }
      case "openai":
        return {
          provider: "openai",
          baseUrl: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
          apiKey: saved.apiKey,
          model: saved.model,
          requiresAuth: true,
        };
      case "anthropic":
        return {
          provider: "anthropic",
          baseUrl: "https://api.anthropic.com",
          apiKey: saved.apiKey,
          model: saved.model,
          requiresAuth: true,
        };
    }
  }

  // Fallback: env-only when no in-app settings
  const preferred = process.env.AI_PROVIDER?.toLowerCase();

  if (
    preferred === "ollama-cloud" ||
    preferred === "ollama" ||
    process.env.OLLAMA_API_KEY
  ) {
    const apiKey = process.env.OLLAMA_API_KEY;
    if (!apiKey) return null;
    return {
      provider: "ollama-cloud",
      baseUrl: ollamaCloudHost(),
      apiKey,
      model: process.env.OLLAMA_MODEL || process.env.AI_MODEL || "gpt-oss:120b",
      requiresAuth: true,
    };
  }

  if (preferred === "ollama-local") {
    return {
      provider: "ollama-local",
      baseUrl: ollamaLocalHost(),
      apiKey: process.env.OLLAMA_API_KEY || "",
      model: process.env.OLLAMA_MODEL || process.env.AI_MODEL || "llama3.2",
      requiresAuth: false,
    };
  }

  if (process.env.OPENAI_API_KEY) {
    return {
      provider: "openai",
      baseUrl: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.AI_MODEL || "gpt-4o",
      requiresAuth: true,
    };
  }

  if (process.env.ANTHROPIC_API_KEY) {
    return {
      provider: "anthropic",
      baseUrl: "https://api.anthropic.com",
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: process.env.AI_MODEL || "claude-sonnet-4-20250514",
      requiresAuth: true,
    };
  }

  // Default intent: Ollama Cloud but not yet configured
  if (!preferred || preferred === "ollama-cloud" || preferred === "ollama") {
    return null;
  }

  return null;
}

function ollamaHeaders(apiKey: string, requiresAuth: boolean): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (requiresAuth && apiKey) {
    headers.Authorization = `Bearer ${apiKey}`;
  }
  return headers;
}

async function pingOllama(
  baseUrl: string,
  apiKey: string,
  requiresAuth: boolean
): Promise<boolean> {
  try {
    const res = await fetch(`${baseUrl}/api/tags`, {
      headers: ollamaHeaders(apiKey, requiresAuth),
      signal: AbortSignal.timeout(8000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export interface OllamaModelInfo {
  name: string;
  size?: number;
  modifiedAt?: string;
}

async function fetchOllamaModels(
  baseUrl: string,
  apiKey: string,
  requiresAuth: boolean
): Promise<OllamaModelInfo[]> {
  const res = await fetch(`${baseUrl}/api/tags`, {
    headers: ollamaHeaders(apiKey, requiresAuth),
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to list models (${res.status}): ${err.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    models?: {
      name?: string;
      model?: string;
      size?: number;
      modified_at?: string;
    }[];
  };

  return (data.models ?? [])
    .map((m) => ({
      name: m.name || m.model || "",
      size: m.size,
      modifiedAt: m.modified_at,
    }))
    .filter((m) => m.name)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function listAgentModels(input: {
  provider: AiProviderName;
  ollamaCloudUrl?: string;
  ollamaLocalHost?: string;
  apiKey: string;
}): Promise<{ models: OllamaModelInfo[]; message?: string }> {
  if (input.provider !== "ollama-cloud" && input.provider !== "ollama-local") {
    return { models: [], message: "Model listing is only available for Ollama providers." };
  }

  let baseUrl: string;
  let requiresAuth: boolean;

  if (input.provider === "ollama-cloud") {
    baseUrl = (input.ollamaCloudUrl || OLLAMA_CLOUD_DEFAULT).replace(/\/$/, "");
    // Ollama Cloud publishes the full catalog at /api/tags — no API key needed to browse.
    requiresAuth = false;
  } else {
    const host = input.ollamaLocalHost || "127.0.0.1:11434";
    baseUrl = host.startsWith("http") ? host : `http://${host}`;
    requiresAuth = false;
  }

  try {
    const models = await fetchOllamaModels(baseUrl, input.apiKey, requiresAuth);
    if (models.length === 0) {
      return {
        models: [],
        message:
          input.provider === "ollama-cloud"
            ? "No cloud models returned. Check the Ollama Cloud URL."
            : "No local models found. Run `ollama pull <model>` first.",
      };
    }
    return { models };
  } catch (error) {
    // Some private/proxied hosts may require auth for /api/tags — retry once with the key.
    if (input.provider === "ollama-cloud" && input.apiKey) {
      try {
        const models = await fetchOllamaModels(baseUrl, input.apiKey, true);
        if (models.length > 0) return { models };
      } catch {
        /* fall through */
      }
    }
    const message = error instanceof Error ? error.message : "Failed to load models";
    return { models: [], message };
  }
}

export async function getAgentStatus(): Promise<AgentStatus> {
  const resolved = resolveProvider();
  if (!resolved) {
    return {
      available: false,
      provider: null,
      model: null,
      message:
        "Open Agent Settings to add your Ollama Cloud API key.",
    };
  }

  if (
    resolved.provider === "ollama-cloud" ||
    resolved.provider === "ollama-local"
  ) {
    if (resolved.requiresAuth && !resolved.apiKey) {
      return {
        available: false,
        provider: resolved.provider,
        model: resolved.model,
        message:
          "API key missing. Open Agent Settings to add your Ollama Cloud key.",
      };
    }

    const reachable = await pingOllama(
      resolved.baseUrl,
      resolved.apiKey,
      resolved.requiresAuth
    );

    const label =
      resolved.provider === "ollama-cloud" ? "Ollama Cloud" : "Ollama Local";

    return {
      available: reachable,
      provider: resolved.provider,
      model: resolved.model,
      message: reachable
        ? `${label} ready — ${resolved.model}`
        : resolved.provider === "ollama-cloud"
          ? "Cannot reach Ollama Cloud. Check OLLAMA_API_KEY and model name."
          : `Ollama local not reachable at ${resolved.baseUrl}. Run: ollama serve`,
    };
  }

  return {
    available: true,
    provider: resolved.provider,
    model: resolved.model,
    message: `Agent ready (${resolved.provider}, ${resolved.model})`,
  };
}

export function isAgentConfigured(): boolean {
  const resolved = resolveProvider();
  if (!resolved) return false;
  if (resolved.requiresAuth && !resolved.apiKey) return false;
  return true;
}

export function getResolvedAgentInfo(): {
  provider: AiProviderName;
  model: string;
} | null {
  const resolved = resolveProvider();
  if (!resolved) return null;
  return { provider: resolved.provider, model: resolved.model };
}

export async function probeAgentConfig(input: {
  provider: AiProviderName;
  ollamaCloudUrl?: string;
  ollamaLocalHost?: string;
  apiKey: string;
  model: string;
}): Promise<AgentStatus> {
  let resolved: ResolvedProvider;

  switch (input.provider) {
    case "ollama-cloud":
      resolved = {
        provider: "ollama-cloud",
        baseUrl: (input.ollamaCloudUrl || OLLAMA_CLOUD_DEFAULT).replace(/\/$/, ""),
        apiKey: input.apiKey,
        model: input.model,
        requiresAuth: true,
      };
      break;
    case "ollama-local": {
      const host = input.ollamaLocalHost || "127.0.0.1:11434";
      resolved = {
        provider: "ollama-local",
        baseUrl: host.startsWith("http") ? host : `http://${host}`,
        apiKey: input.apiKey,
        model: input.model,
        requiresAuth: false,
      };
      break;
    }
    case "openai":
      resolved = {
        provider: "openai",
        baseUrl: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
        apiKey: input.apiKey,
        model: input.model,
        requiresAuth: true,
      };
      break;
    case "anthropic":
      resolved = {
        provider: "anthropic",
        baseUrl: "https://api.anthropic.com",
        apiKey: input.apiKey,
        model: input.model,
        requiresAuth: true,
      };
      break;
  }

  if (resolved.requiresAuth && !resolved.apiKey) {
    return {
      available: false,
      provider: resolved.provider,
      model: resolved.model,
      message: "API key is required for this provider.",
    };
  }

  if (
    resolved.provider === "ollama-cloud" ||
    resolved.provider === "ollama-local"
  ) {
    const reachable = await pingOllama(
      resolved.baseUrl,
      resolved.apiKey,
      resolved.requiresAuth
    );
    const label =
      resolved.provider === "ollama-cloud" ? "Ollama Cloud" : "Ollama Local";
    return {
      available: reachable,
      provider: resolved.provider,
      model: resolved.model,
      message: reachable
        ? `${label} connection OK — ${resolved.model}`
        : `Cannot reach ${label}. Check URL, API key, and model.`,
    };
  }

  return {
    available: true,
    provider: resolved.provider,
    model: resolved.model,
    message: `Configuration looks valid (${resolved.provider})`,
  };
}

async function callOllamaChat(
  baseUrl: string,
  apiKey: string,
  requiresAuth: boolean,
  model: string,
  system: string,
  user: string
): Promise<string> {
  const res = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: ollamaHeaders(apiKey, requiresAuth),
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      format: "json",
      stream: false,
      options: { temperature: 0.7 },
    }),
    signal: AbortSignal.timeout(180000),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Ollama error (${res.status}): ${err.slice(0, 300)}`);
  }

  const data = (await res.json()) as { message?: { content?: string } };
  const content = data.message?.content;
  if (!content) throw new Error("Ollama returned empty response");
  return content.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
}

async function callOpenAiCompatible(
  baseUrl: string,
  apiKey: string,
  model: string,
  system: string,
  user: string
): Promise<string> {
  const url = baseUrl.endsWith("/v1")
    ? `${baseUrl}/chat/completions`
    : `${baseUrl}/v1/chat/completions`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
    signal: AbortSignal.timeout(180000),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API error (${res.status}): ${err.slice(0, 300)}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("API returned empty response");
  return content;
}

async function callAnthropic(
  apiKey: string,
  model: string,
  system: string,
  user: string
): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      system: system + "\n\nRespond with valid JSON only — no markdown fences.",
      messages: [{ role: "user", content: user }],
    }),
    signal: AbortSignal.timeout(180000),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic API error (${res.status}): ${err.slice(0, 300)}`);
  }

  const data = (await res.json()) as {
    content?: { type: string; text?: string }[];
  };
  const text = data.content?.find((c) => c.type === "text")?.text;
  if (!text) throw new Error("Anthropic returned empty response");
  return text.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
}

export async function generateAgentJson<T>(
  systemPrompt: string,
  userPrompt: string
): Promise<T> {
  const resolved = resolveProvider();
  if (!resolved) {
    throw new Error(
      "AI agent is not configured. Open Agent Settings and add your Ollama Cloud API key."
    );
  }

  if (resolved.requiresAuth && !resolved.apiKey) {
    throw new Error(
      "API key required. Open Agent Settings to add your Ollama Cloud key."
    );
  }

  if (
    resolved.provider === "ollama-cloud" ||
    resolved.provider === "ollama-local"
  ) {
    const reachable = await pingOllama(
      resolved.baseUrl,
      resolved.apiKey,
      resolved.requiresAuth
    );
    if (!reachable) {
      throw new Error(
        resolved.provider === "ollama-cloud"
          ? "Cannot reach Ollama Cloud. Verify OLLAMA_API_KEY and OLLAMA_MODEL."
          : `Ollama local not running at ${resolved.baseUrl}.`
      );
    }
  }

  let raw: string;
  switch (resolved.provider) {
    case "ollama-cloud":
    case "ollama-local":
      raw = await callOllamaChat(
        resolved.baseUrl,
        resolved.apiKey,
        resolved.requiresAuth,
        resolved.model,
        systemPrompt,
        userPrompt
      );
      break;
    case "openai":
      raw = await callOpenAiCompatible(
        resolved.baseUrl,
        resolved.apiKey,
        resolved.model,
        systemPrompt,
        userPrompt
      );
      break;
    case "anthropic":
      raw = await callAnthropic(
        resolved.apiKey,
        resolved.model,
        systemPrompt,
        userPrompt
      );
      break;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new Error(
      "AI agent returned invalid JSON. Try a cloud model with strong structured output."
    );
  }
}
