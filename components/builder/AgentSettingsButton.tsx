"use client";

import { Button } from "@/components/ui/button";
import { useBuilderStore } from "@/lib/store/builder-store";
import { Settings } from "lucide-react";

export function AgentSettingsButton() {
  const openAgentSettings = useBuilderStore((s) => s.openAgentSettings);

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="relative z-10"
      onClick={openAgentSettings}
    >
      <Settings className="h-4 w-4" />
      Agent Settings
    </Button>
  );
}
