"use client";

import { InputForm } from "@/components/builder/InputForm";
import { ResearchPanel } from "@/components/builder/ResearchPanel";
import { AuditReport } from "@/components/builder/AuditReport";
import { SitePreview } from "@/components/builder/SitePreview";
import { PanelEditor } from "@/components/builder/PanelEditor";
import { ExportButton } from "@/components/builder/ExportButton";
import { AgentSettingsButton } from "@/components/builder/AgentSettingsButton";
import { AgentSettingsDialog } from "@/components/builder/AgentSettingsDialog";
import { NicheConfirmDialog } from "@/components/builder/NicheConfirmDialog";
import { useBuilderStore } from "@/lib/store/builder-store";
import { Separator } from "@/components/ui/separator";

export default function BuilderPage() {
  const error = useBuilderStore((s) => s.error);
  const agentSettingsOpen = useBuilderStore((s) => s.agentSettingsOpen);
  const closeAgentSettings = useBuilderStore((s) => s.closeAgentSettings);

  return (
    <div className="min-h-screen bg-background">
      <header className="relative z-[100] border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Demo Builder V2</h1>
            <p className="text-sm text-muted-foreground">
              Premium client demo sites for Zoom presentations
            </p>
          </div>
          <div className="flex items-center gap-2">
            <AgentSettingsButton />
            <ExportButton />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <aside className="relative z-10 lg:col-span-3 space-y-4">
            <InputForm />
            <ResearchPanel />
            <AuditReport />
          </aside>

          <section className="lg:col-span-6">
            <SitePreview />
          </section>

          <aside className="lg:col-span-3">
            <PanelEditor />
          </aside>
        </div>

        <Separator className="my-6 lg:hidden" />
        <div className="lg:hidden flex justify-center pb-6">
          <ExportButton />
        </div>
      </main>

      <NicheConfirmDialog />
      {agentSettingsOpen && (
        <AgentSettingsDialog open onClose={closeAgentSettings} />
      )}
    </div>
  );
}
