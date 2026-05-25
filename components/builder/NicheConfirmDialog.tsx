"use client";

import { useBuilderStore } from "@/lib/store/builder-store";
import { ALL_NICHES, NICHE_LABELS } from "@/lib/generation/niche-detector";
import type { NicheType } from "@/lib/models/site-model";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function NicheConfirmDialog() {
  const pendingNicheConfirmation = useBuilderStore((s) => s.pendingNicheConfirmation);
  const research = useBuilderStore((s) => s.research);
  const nicheDetection = useBuilderStore((s) => s.nicheDetection);
  const selectedNiche = useBuilderStore((s) => s.selectedNiche);
  const isLoading = useBuilderStore((s) => s.isLoading);
  const setSelectedNiche = useBuilderStore((s) => s.setSelectedNiche);
  const confirmNicheAndBuild = useBuilderStore((s) => s.confirmNicheAndBuild);
  const cancelNicheConfirmation = useBuilderStore((s) => s.cancelNicheConfirmation);

  if (!pendingNicheConfirmation || !research) return null;

  const suggested = nicheDetection?.niche ?? "general";

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <Card className="w-full max-w-lg shadow-2xl">
        <CardHeader>
          <CardTitle>Confirm Industry</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            {nicheDetection?.reason ||
              "We couldn't confidently determine this business's industry. Pick the correct niche so copy, services, and images match."}
          </p>
          {research.business.category && (
            <p className="text-xs text-muted-foreground">
              Google Maps category: <span className="font-medium text-foreground">{research.business.category}</span>
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-2 max-h-[320px] overflow-y-auto">
            {ALL_NICHES.filter((n) => n !== "general").map((niche) => (
              <button
                key={niche}
                type="button"
                onClick={() => setSelectedNiche(niche)}
                className={cn(
                  "flex items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition-colors",
                  (selectedNiche ?? suggested) === niche
                    ? "border-primary bg-primary/10 font-medium"
                    : "border-border hover:bg-muted/50"
                )}
              >
                <span>{NICHE_LABELS[niche]}</span>
                {niche === suggested && nicheDetection && nicheDetection.confidence > 0 && (
                  <span className="text-xs text-muted-foreground">Suggested</span>
                )}
              </button>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={cancelNicheConfirmation}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              disabled={isLoading}
              onClick={() => confirmNicheAndBuild((selectedNiche ?? suggested) as NicheType)}
            >
              {isLoading ? "Building..." : "Build Demo Site"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
