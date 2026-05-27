"use client";

import { cn } from "@/lib/utils";
import type { BuildMode } from "@/lib/models/site-model";
import { LayoutTemplate, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BuildModeToggleProps {
  value: BuildMode;
  onChange: (mode: BuildMode) => void;
  agentAvailable: boolean;
  agentStatusLoaded: boolean;
  onOpenSettings: () => void;
}

export function BuildModeToggle({
  value,
  onChange,
  agentAvailable,
  agentStatusLoaded,
  onOpenSettings,
}: BuildModeToggleProps) {
  return (
    <div className="relative z-10 space-y-2">
      <p className="text-sm font-medium">Build Mode</p>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onChange("template")}
          className={cn(
            "relative z-10 cursor-pointer flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-colors",
            value === "template"
              ? "border-primary bg-primary/5 ring-1 ring-primary"
              : "border-border hover:bg-muted/50"
          )}
        >
          <LayoutTemplate className="h-4 w-4 text-muted-foreground pointer-events-none" />
          <span className="text-sm font-medium pointer-events-none">Template</span>
          <span className="text-xs text-muted-foreground leading-snug pointer-events-none">
            Playbook templates + scraped data. Clean and fast — no API key.
          </span>
        </button>

        <button
          type="button"
          onClick={() => onChange("agent")}
          className={cn(
            "relative z-10 cursor-pointer flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-colors",
            value === "agent"
              ? "border-primary bg-primary/5 ring-1 ring-primary"
              : "border-border hover:bg-muted/50"
          )}
        >
          <Sparkles className="h-4 w-4 text-muted-foreground pointer-events-none" />
          <span className="text-sm font-medium pointer-events-none">AI Agent</span>
          <span className="text-xs text-muted-foreground leading-snug pointer-events-none">
            Deep research, premium design, animations, and conversion copy. Takes 1–5 min.
          </span>
        </button>
      </div>

      {value === "agent" && agentStatusLoaded && agentAvailable && (
        <p className="text-xs text-emerald-600 dark:text-emerald-400">
          AI agent configured — live web research + premium site build (1–5 minutes).
        </p>
      )}

      {value === "agent" && !agentStatusLoaded && (
        <p className="text-xs text-muted-foreground">Checking agent configuration...</p>
      )}

      {value === "agent" && agentStatusLoaded && !agentAvailable && (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-amber-600 dark:text-amber-400">
            Configure your AI provider API key and model in Agent Settings.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            onClick={onOpenSettings}
          >
            Open Agent Settings
          </Button>
        </div>
      )}
    </div>
  );
}
