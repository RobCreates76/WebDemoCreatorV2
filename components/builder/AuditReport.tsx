"use client";

import { useBuilderStore } from "@/lib/store/builder-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const PRIORITY_STYLES = {
  P0: "bg-red-500/10 text-red-400 border-red-500/20",
  P1: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  P2: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

export function AuditReport() {
  const audit = useBuilderStore((s) => s.audit);

  if (!audit) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Conversion Audit</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Add an existing website URL to get a brutal conversion audit, or audit runs automatically from Maps data.
          </p>
        </CardContent>
      </Card>
    );
  }

  const scoreColor =
    audit.score >= 80
      ? "text-green-400"
      : audit.score >= 60
        ? "text-amber-400"
        : "text-red-400";

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Conversion Audit</CardTitle>
          <div className={cn("text-2xl font-bold tabular-nums", scoreColor)}>
            {audit.score}
            <span className="text-sm font-normal text-muted-foreground">/100</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{audit.summary}</p>
        <ScrollArea className="h-[320px] pr-4">
          <div className="space-y-3">
            {audit.findings.map((f) => (
              <div
                key={f.id}
                className="rounded-lg border border-border/50 p-3 space-y-2"
              >
                <div className="flex items-start gap-2">
                  <span
                    className={cn(
                      "text-xs font-semibold px-2 py-0.5 rounded border shrink-0",
                      PRIORITY_STYLES[f.priority]
                    )}
                  >
                    {f.priority}
                  </span>
                  <h4 className="text-sm font-semibold leading-tight">{f.title}</h4>
                </div>
                <p className="text-xs text-muted-foreground">{f.description}</p>
                <p className="text-xs"><span className="font-medium">Fix:</span> {f.suggestion}</p>
                {f.suggestedCopy && (
                  <p className="text-xs bg-muted/50 rounded p-2 font-mono">
                    &ldquo;{f.suggestedCopy}&rdquo;
                  </p>
                )}
                {f.demoFix && (
                  <p className="text-xs text-green-400/80">
                    Demo fixes: {f.demoFix}
                  </p>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
