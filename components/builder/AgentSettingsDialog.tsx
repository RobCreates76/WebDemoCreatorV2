"use client";

import { useCallback, useEffect, useState } from "react";
import { useBuilderStore } from "@/lib/store/builder-store";
import { parseApiResponse } from "@/lib/api-client";
import type { AgentProviderType } from "@/lib/config/agent-settings-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, RefreshCw, Shield, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PublicSettings {
  provider: AgentProviderType;
  ollamaCloudUrl: string;
  ollamaLocalHost: string;
  model: string;
  hasApiKey: boolean;
  apiKeyHint: string | null;
  configured: boolean;
  source: "app" | "env" | "none";
}

interface AgentSettingsDialogProps {
  open?: boolean;
  onClose: () => void;
}

export function AgentSettingsDialog({ onClose }: AgentSettingsDialogProps) {
  const checkAgentStatus = useBuilderStore((s) => s.checkAgentStatus);

  const [provider, setProvider] = useState<AgentProviderType>("ollama-cloud");
  const [ollamaCloudUrl, setOllamaCloudUrl] = useState("https://ollama.com");
  const [ollamaLocalHost, setOllamaLocalHost] = useState("127.0.0.1:11434");
  const [model, setModel] = useState("gpt-oss:120b");
  const [apiKey, setApiKey] = useState("");
  const [hasExistingKey, setHasExistingKey] = useState(false);
  const [keyHint, setKeyHint] = useState<string | null>(null);
  const [source, setSource] = useState<PublicSettings["source"]>("none");

  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testMessage, setTestMessage] = useState<string | null>(null);
  const [testOk, setTestOk] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [models, setModels] = useState<string[]>([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [modelsMessage, setModelsMessage] = useState<string | null>(null);

  const isOllamaProvider = provider === "ollama-cloud" || provider === "ollama-local";

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/settings/agent");
      const data = await parseApiResponse<PublicSettings>(res);
      if (!res.ok) throw new Error("Failed to load settings");

      setProvider(data.provider);
      setOllamaCloudUrl(data.ollamaCloudUrl);
      setOllamaLocalHost(data.ollamaLocalHost);
      setModel(data.model);
      setHasExistingKey(data.hasApiKey);
      setKeyHint(data.apiKeyHint);
      setSource(data.source);
      setApiKey("");
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load settings");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchModels = useCallback(async () => {
    if (!isOllamaProvider) {
      setModels([]);
      setModelsMessage(null);
      return;
    }

    setModelsLoading(true);
    setModelsMessage(null);
    try {
      const res = await fetch("/api/settings/agent/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          ollamaCloudUrl,
          ollamaLocalHost,
          apiKey,
        }),
      });
      const data = await parseApiResponse<{
        models: { name: string }[];
        message?: string;
      }>(res);

      const names = data.models.map((m) => m.name);
      setModels(names);

      if (names.length === 0) {
        setModelsMessage(data.message || "No models returned. Check your API key and try Refresh.");
      } else {
        setModel((current) => current || names[0]);
        setModelsMessage(null);
      }
    } catch (err) {
      setModels([]);
      setModelsMessage(err instanceof Error ? err.message : "Failed to load models");
    } finally {
      setModelsLoading(false);
    }
  }, [apiKey, isOllamaProvider, ollamaCloudUrl, ollamaLocalHost, provider]);

  useEffect(() => {
    loadSettings();
    setTestMessage(null);
    setTestOk(null);
    setSaved(false);
  }, [loadSettings]);

  useEffect(() => {
    if (!isOllamaProvider) return;
    const timer = setTimeout(() => fetchModels(), apiKey.length >= 8 ? 400 : 0);
    return () => clearTimeout(timer);
  }, [
    apiKey,
    fetchModels,
    isOllamaProvider,
    ollamaCloudUrl,
    ollamaLocalHost,
    provider,
  ]);

  const payload = () => ({
    provider,
    ollamaCloudUrl,
    ollamaLocalHost,
    model,
    apiKey,
  });

  const handleTest = async () => {
    setTesting(true);
    setTestMessage(null);
    setTestOk(null);
    setError(null);
    try {
      const res = await fetch("/api/settings/agent/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload()),
      });
      const data = await parseApiResponse<{
        available: boolean;
        message: string;
      }>(res);
      setTestOk(data.available);
      setTestMessage(data.message);
      if (data.available && isOllamaProvider) {
        await fetchModels();
      }
    } catch (err) {
      setTestOk(false);
      setTestMessage(err instanceof Error ? err.message : "Test failed");
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/settings/agent", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload()),
      });
      const data = await parseApiResponse<{ ok?: boolean; error?: string }>(res);
      if (!res.ok) throw new Error(data.error || "Save failed");

      setSaved(true);
      setApiKey("");
      await loadSettings();
      await checkAgentStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    if (!confirm("Remove saved agent credentials from this machine?")) return;
    setLoading(true);
    try {
      await fetch("/api/settings/agent", { method: "DELETE" });
      await loadSettings();
      await checkAgentStatus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
      role="presentation"
    >
      <Card
        className="relative z-[201] w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Agent Settings
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Credentials are stored only on this machine in{" "}
              <code className="text-xs">.demo-builder/</code> (gitignored). Keys are
              never sent back to the browser after saving.
            </p>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          {loading && !saved && (
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading...
            </p>
          )}

          {error && (
            <p className="text-sm text-red-400 border border-red-500/30 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          {saved && (
            <p className="text-sm text-green-600 dark:text-green-400 border border-green-500/30 rounded-md px-3 py-2">
              Settings saved securely.
            </p>
          )}

          {source !== "none" && (
            <p className="text-xs text-muted-foreground">
              Active source:{" "}
              <span className="font-medium text-foreground">
                {source === "app" ? "In-app settings" : ".env.local"}
              </span>
              {keyHint && source === "app" && (
                <> · Key: <span className="font-mono">{keyHint}</span></>
              )}
            </p>
          )}

          <div className="space-y-2">
            <Label htmlFor="agent-provider">Provider</Label>
            <select
              id="agent-provider"
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={provider}
              onChange={(e) => setProvider(e.target.value as AgentProviderType)}
            >
              <option value="ollama-cloud">Ollama Cloud</option>
              <option value="ollama-local">Ollama Local</option>
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
            </select>
          </div>

          {provider === "ollama-cloud" && (
            <div className="space-y-2">
              <Label htmlFor="ollama-cloud-url">Ollama Cloud URL</Label>
              <Input
                id="ollama-cloud-url"
                value={ollamaCloudUrl}
                onChange={(e) => setOllamaCloudUrl(e.target.value)}
                placeholder="https://ollama.com"
              />
            </div>
          )}

          {provider === "ollama-local" && (
            <div className="space-y-2">
              <Label htmlFor="ollama-local-host">Local Ollama Host</Label>
              <Input
                id="ollama-local-host"
                value={ollamaLocalHost}
                onChange={(e) => setOllamaLocalHost(e.target.value)}
                placeholder="127.0.0.1:11434"
              />
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="agent-model">Model</Label>
              {isOllamaProvider && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={fetchModels}
                  disabled={modelsLoading || loading}
                >
                  {modelsLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 mr-1" />
                      Refresh
                    </>
                  )}
                </Button>
              )}
            </div>

            {isOllamaProvider ? (
              <>
                <select
                  id="agent-model"
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  disabled={modelsLoading && models.length === 0}
                >
                  {model && !models.includes(model) && (
                    <option value={model}>{model} (current)</option>
                  )}
                  {models.length === 0 && !model && (
                    <option value="">No models loaded</option>
                  )}
                  {models.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
                {modelsMessage && (
                  <p className="text-xs text-muted-foreground">{modelsMessage}</p>
                )}
                {!modelsMessage && models.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {models.length} cloud model{models.length === 1 ? "" : "s"} from Ollama — API key
                    still required to run the agent.
                  </p>
                )}
              </>
            ) : (
              <>
                <Input
                  id="agent-model"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="gpt-4o"
                />
                <p className="text-xs text-muted-foreground">
                  Enter the model ID for your provider.
                </p>
              </>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="agent-api-key">API Key</Label>
            <Input
              id="agent-api-key"
              type="password"
              autoComplete="off"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={
                hasExistingKey
                  ? "Leave blank to keep existing key"
                  : "Paste key from ollama.com → Settings → API Keys"
              }
            />
            {hasExistingKey && !apiKey && keyHint && (
              <p className="text-xs text-muted-foreground">
                Saved key: <span className="font-mono">{keyHint}</span>
              </p>
            )}
          </div>

          {testMessage && (
            <p
              className={cn(
                "text-sm rounded-md px-3 py-2 border",
                testOk
                  ? "text-green-600 dark:text-green-400 border-green-500/30"
                  : "text-amber-600 dark:text-amber-400 border-amber-500/30"
              )}
            >
              {testMessage}
            </p>
          )}

          <div className="flex flex-wrap gap-2 pt-2">
            <Button type="button" variant="outline" onClick={handleTest} disabled={testing || loading}>
              {testing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Testing...
                </>
              ) : (
                "Test Connection"
              )}
            </Button>
            <Button type="button" className="flex-1" onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save Securely"}
            </Button>
          </div>

          {source === "app" && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground w-full"
              onClick={handleClear}
              disabled={loading}
            >
              Clear saved credentials
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
