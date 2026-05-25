"use client";

import { useEffect } from "react";
import { useBuilderStore } from "@/lib/store/builder-store";
import { ALL_NICHES, NICHE_LABELS } from "@/lib/generation/niche-detector";
import type { NicheType } from "@/lib/models/site-model";
import { BuildModeToggle } from "@/components/builder/BuildModeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Search, Sparkles } from "lucide-react";

export function InputForm() {
  const {
    mapsUrl,
    websiteUrl,
    socialUrls,
    nicheOverride,
    buildMode,
    agentAvailable,
    manualControl,
    isLoading,
    setMapsUrl,
    setWebsiteUrl,
    setSocialUrls,
    setNicheOverride,
    setBuildMode,
    openAgentSettings,
    checkAgentStatus,
    setManualControl,
    runResearch,
  } = useBuilderStore();

  useEffect(() => {
    checkAgentStatus();
  }, [checkAgentStatus]);

  const buttonLabel =
    buildMode === "agent" ? "Agent Research & Build" : "Research & Build Demo";

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Business Input</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <BuildModeToggle
          value={buildMode}
          onChange={setBuildMode}
          agentAvailable={agentAvailable}
          onOpenSettings={openAgentSettings}
        />

        <div className="space-y-2">
          <Label htmlFor="maps-url">Google Maps Link *</Label>
          <Input
            id="maps-url"
            placeholder="https://maps.google.com/place/..."
            value={mapsUrl}
            onChange={(e) => setMapsUrl(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website-url">Existing Website (optional)</Label>
          <Input
            id="website-url"
            placeholder="https://clientwebsite.com"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="social-urls">Social Media Links (optional)</Label>
          <Textarea
            id="social-urls"
            placeholder="One URL per line — Facebook, Instagram, etc."
            rows={3}
            value={socialUrls}
            onChange={(e) => setSocialUrls(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="niche-override">Industry (optional override)</Label>
          <select
            id="niche-override"
            className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
            value={nicheOverride}
            onChange={(e) => setNicheOverride(e.target.value as NicheType | "")}
          >
            <option value="">Auto-detect from business data</option>
            {ALL_NICHES.map((n) => (
              <option key={n} value={n}>
                {NICHE_LABELS[n]}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">
            {buildMode === "agent"
              ? "Agent uses this as a hint but will research the niche independently."
              : "Leave on auto-detect, or pick the industry if you know it."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="manual-control"
            checked={manualControl}
            onCheckedChange={(checked) => setManualControl(checked === true)}
          />
          <Label htmlFor="manual-control" className="cursor-pointer font-normal">
            Manual control — edit site inline and via panel
          </Label>
        </div>

        <Button type="button" className="w-full" onClick={runResearch} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {buildMode === "agent" ? "AI researching & building..." : "Researching..."}
            </>
          ) : buildMode === "agent" ? (
            <>
              <Sparkles className="h-4 w-4" />
              {buttonLabel}
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              {buttonLabel}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
