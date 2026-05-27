"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useBuilderStore } from "@/lib/store/builder-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export function SitePreview() {
  const site = useBuilderStore((s) => s.site);
  const manualControl = useBuilderStore((s) => s.manualControl);
  const updateSiteField = useBuilderStore((s) => s.updateSiteField);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [html, setHtml] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const loadPreview = useCallback(async () => {
    if (!site) return;
    setLoading(true);
    try {
      const res = await fetch("/api/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ site, editMode: manualControl }),
      });
      const text = await res.text();
      if (!res.ok) {
        let message = "Preview failed to load. Stop the dev server and run: npm run dev:clean";
        try {
          const data = JSON.parse(text) as { error?: string };
          if (data.error) message = data.error;
        } catch {
          /* use default message */
        }
        setHtml(`<p style="font-family:system-ui;padding:2rem;color:#b91c1c">${message}</p>`);
        return;
      }
      setHtml(text);
    } catch {
      setHtml("<p>Preview failed to load</p>");
    } finally {
      setLoading(false);
    }
  }, [site, manualControl]);

  useEffect(() => {
    loadPreview();
  }, [loadPreview]);

  useEffect(() => {
    if (!manualControl) return;

    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "inline-edit") {
        const { section, field, value } = event.data;
        const newValue = prompt(`Edit ${field}:`, value);
        if (newValue !== null && newValue !== value) {
          updateSiteField(section, field, newValue);
        }
      }
      if (event.data?.type === "inline-edit-image") {
        const { section, field, value } = event.data;
        const newValue = prompt(`Image URL for ${field}:`, value);
        if (newValue !== null && newValue !== value) {
          updateSiteField(section, field, newValue);
        }
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [manualControl, updateSiteField]);

  if (!site) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Site Preview</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[600px]">
          <p className="text-muted-foreground text-sm">
            Your generated demo site will appear here
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base">Site Preview</CardTitle>
            {site.renderTier === "premium" ? (
              <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                AI Premium
              </span>
            ) : (
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                Template
              </span>
            )}
          </div>
          {manualControl && (
            <span className="text-xs text-amber-400 bg-amber-400/10 px-2 py-1 rounded">
              Click text/images to edit
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0 relative min-h-[600px]">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}
        <iframe
          ref={iframeRef}
          srcDoc={html}
          title="Site Preview"
          className="w-full h-[600px] border-0 bg-white rounded-b-xl"
          sandbox="allow-scripts allow-same-origin"
        />
      </CardContent>
    </Card>
  );
}
