"use client";

import { useState } from "react";
import { useBuilderStore } from "@/lib/store/builder-store";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";

export function ExportButton() {
  const site = useBuilderStore((s) => s.site);
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    if (!site) return;
    setExporting(true);
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ site }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Export failed");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${site.slug}-demo.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Export failed");
    } finally {
      setExporting(false);
    }
  }

  return (
    <Button
      type="button"
      size="lg"
      onClick={handleExport}
      disabled={!site || exporting}
      className="w-full sm:w-auto"
    >
      {exporting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          Download Demo Site (ZIP)
        </>
      )}
    </Button>
  );
}
