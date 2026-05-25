import { create } from "zustand";
import { parseApiResponse } from "@/lib/api-client";
import type {
  AuditReport,
  BuildMode,
  NicheDetectionResult,
  NicheType,
  ResearchData,
  SiteModel,
} from "@/lib/models/site-model";

interface BuilderState {
  mapsUrl: string;
  websiteUrl: string;
  socialUrls: string;
  nicheOverride: NicheType | "";
  buildMode: BuildMode;
  agentAvailable: boolean;
  manualControl: boolean;
  isLoading: boolean;
  error: string | null;
  research: ResearchData | null;
  audit: AuditReport | null;
  site: SiteModel | null;
  history: SiteModel[];
  historyIndex: number;
  nicheDetection: NicheDetectionResult | null;
  pendingNicheConfirmation: boolean;
  selectedNiche: NicheType | null;
  agentSettingsOpen: boolean;

  setMapsUrl: (url: string) => void;
  setWebsiteUrl: (url: string) => void;
  setSocialUrls: (urls: string) => void;
  setNicheOverride: (niche: NicheType | "") => void;
  setBuildMode: (mode: BuildMode) => void;
  openAgentSettings: () => void;
  closeAgentSettings: () => void;
  checkAgentStatus: () => Promise<void>;
  setManualControl: (enabled: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setResearch: (research: ResearchData | null) => void;
  setAudit: (audit: AuditReport | null) => void;
  setSite: (site: SiteModel | null) => void;
  setSelectedNiche: (niche: NicheType | null) => void;
  runResearch: () => Promise<void>;
  confirmNicheAndBuild: (niche: NicheType) => Promise<void>;
  cancelNicheConfirmation: () => void;
  updateSite: (updater: (site: SiteModel) => SiteModel) => void;
  updateSiteField: (section: string, field: string, value: string) => void;
  undo: () => void;
  redo: () => void;
  reset: () => void;
}

function pushHistory(
  history: SiteModel[],
  historyIndex: number,
  site: SiteModel
): { history: SiteModel[]; historyIndex: number } {
  const newHistory = history.slice(0, historyIndex + 1);
  newHistory.push(JSON.parse(JSON.stringify(site)));
  return {
    history: newHistory.slice(-50),
    historyIndex: Math.min(newHistory.length - 1, 49),
  };
}

export const useBuilderStore = create<BuilderState>((set, get) => ({
  mapsUrl: "",
  websiteUrl: "",
  socialUrls: "",
  nicheOverride: "",
  buildMode: "template",
  agentAvailable: false,
  manualControl: false,
  isLoading: false,
  error: null,
  research: null,
  audit: null,
  site: null,
  history: [],
  historyIndex: -1,
  nicheDetection: null,
  pendingNicheConfirmation: false,
  selectedNiche: null,
  agentSettingsOpen: false,

  setMapsUrl: (url) => set({ mapsUrl: url }),
  setWebsiteUrl: (url) => set({ websiteUrl: url }),
  setSocialUrls: (urls) => set({ socialUrls: urls }),
  setNicheOverride: (niche) => set({ nicheOverride: niche }),
  setBuildMode: (mode) =>
    set({
      buildMode: mode,
      // Agent mode skips niche confirmation — don't leave a blocking overlay up
      ...(mode === "agent"
        ? { pendingNicheConfirmation: false, selectedNiche: null }
        : {}),
    }),
  openAgentSettings: () => set({ agentSettingsOpen: true }),
  closeAgentSettings: () => set({ agentSettingsOpen: false }),
  checkAgentStatus: async () => {
    try {
      const res = await fetch("/api/agent/status");
      const data = await parseApiResponse<{ available: boolean }>(res);
      set({ agentAvailable: data.available === true });
    } catch {
      set({ agentAvailable: false });
    }
  },
  setManualControl: (enabled) => set({ manualControl: enabled }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setResearch: (research) => set({ research }),
  setAudit: (audit) => set({ audit }),
  setSelectedNiche: (niche) => set({ selectedNiche: niche }),
  setSite: (site) => {
    if (!site) return set({ site: null, history: [], historyIndex: -1 });
    const { history, historyIndex } = pushHistory([], -1, site);
    set({ site, history, historyIndex });
  },

  runResearch: async () => {
    const { mapsUrl, websiteUrl, socialUrls, nicheOverride, buildMode, agentAvailable } = get();
    if (!mapsUrl.trim()) {
      set({ error: "Please paste a Google Maps business link" });
      return;
    }

    if (buildMode === "agent" && !agentAvailable) {
      set({
        error:
          "AI Agent mode needs credentials. Open Agent Settings (top right) to add your Ollama Cloud API key.",
      });
      return;
    }

    set({
      isLoading: true,
      error: null,
      pendingNicheConfirmation: false,
      site: null,
      selectedNiche: null,
    });

    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mapsUrl,
          websiteUrl,
          socialUrls,
          nicheOverride: nicheOverride || undefined,
          buildMode,
        }),
      });

      const data = await parseApiResponse<{
        error?: string;
        research?: ResearchData;
        audit?: AuditReport;
        site?: SiteModel;
        needsNicheConfirmation?: boolean;
        nicheDetection?: NicheDetectionResult;
      }>(res);

      if (!res.ok) throw new Error(data.error || "Research failed");
      if (!data.research || !data.audit) {
        throw new Error("Incomplete research response from server");
      }

      set({
        research: data.research,
        audit: data.audit,
        nicheDetection: data.nicheDetection ?? null,
      });

      if (data.needsNicheConfirmation) {
        set({
          pendingNicheConfirmation: true,
          selectedNiche: data.nicheDetection?.niche ?? null,
          site: null,
        });
      } else {
        set({ site: data.site, pendingNicheConfirmation: false });
      }
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Research failed" });
    } finally {
      set({ isLoading: false });
    }
  },

  confirmNicheAndBuild: async (niche) => {
    const { research, buildMode } = get();
    if (!research) return;

    set({ isLoading: true, error: null });

    try {
      const res = await fetch("/api/build-site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ research: { ...research, niche }, niche, buildMode }),
      });

      const data = await parseApiResponse<{
        error?: string;
        site?: SiteModel;
        research?: ResearchData;
      }>(res);
      if (!res.ok) throw new Error(data.error || "Build failed");
      if (!data.site) throw new Error("Build failed — no site returned");

      set({
        site: data.site,
        research: data.research ?? { ...research, niche },
        pendingNicheConfirmation: false,
        selectedNiche: null,
      });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Build failed" });
    } finally {
      set({ isLoading: false });
    }
  },

  cancelNicheConfirmation: () =>
    set({ pendingNicheConfirmation: false, selectedNiche: null }),

  updateSite: (updater) => {
    const { site, history, historyIndex } = get();
    if (!site) return;
    const updated = updater(JSON.parse(JSON.stringify(site)));
    const h = pushHistory(history, historyIndex, updated);
    set({ site: updated, ...h });
  },

  updateSiteField: (section, field, value) => {
    get().updateSite((site) => {
      if (field.includes("item-")) {
        const match = field.match(/item-(\d+)-(title|description|quote|author|question|answer)/);
        if (match) {
          const idx = parseInt(match[1], 10);
          const prop = match[2] as "title" | "description" | "quote" | "author" | "question" | "answer";
          if (section === "services") {
            site.services.items[idx][prop as "title" | "description"] = value;
          } else if (section === "whyUs") {
            site.whyUs.items[idx][prop as "title" | "description"] = value;
          } else if (section === "testimonials") {
            site.testimonials.items[idx][prop as "quote" | "author"] = value;
          } else if (section === "faq") {
            site.faq.items[idx][prop as "question" | "answer"] = value;
          }
        }
      } else if (field.startsWith("image-")) {
        const idx = parseInt(field.replace("image-", ""), 10);
        site.gallery.images[idx] = value;
      } else if (field === "image" && section === "hero") {
        site.hero.image = value;
      } else if (field === "headline" && section === "hero") {
        site.hero.headline = value;
      } else if (field === "subheadline" && section === "hero") {
        site.hero.subheadline = value;
      } else if (field === "logoText" && section === "header") {
        site.header.logoText = value;
      } else if (field === "phone" && section === "header") {
        site.header.phone = value;
      } else if (field.endsWith("Label")) {
        const ctaField = field.replace("Label", "") as "cta" | "primaryCta" | "secondaryCta";
        if (section === "header" && ctaField === "cta") {
          site.header.cta.label = value;
        } else if (section === "hero" && ctaField === "primaryCta") {
          site.hero.primaryCta.label = value;
        } else if (section === "hero" && ctaField === "secondaryCta") {
          site.hero.secondaryCta.label = value;
        } else if (section === "contact" && ctaField === "cta") {
          site.contact.cta.label = value;
        }
      } else if (field === "headline" && section === "services") {
        site.services.headline = value;
      } else if (field === "headline" && section === "whyUs") {
        site.whyUs.headline = value;
      } else if (field === "headline" && section === "gallery") {
        site.gallery.headline = value;
      } else if (field === "headline" && section === "testimonials") {
        site.testimonials.headline = value;
      } else if (field === "headline" && section === "faq") {
        site.faq.headline = value;
      } else if (field === "headline" && section === "contact") {
        site.contact.headline = value;
      } else if (field === "address" && section === "contact") {
        site.contact.address = value;
        site.footer.address = value;
      } else if (field === "phone" && section === "contact") {
        site.contact.phone = value;
        site.header.phone = value;
        site.footer.phone = value;
      } else if (field === "tagline" && section === "footer") {
        site.footer.tagline = value;
      }
      return site;
    });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    set({ site: JSON.parse(JSON.stringify(history[newIndex])), historyIndex: newIndex });
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    set({ site: JSON.parse(JSON.stringify(history[newIndex])), historyIndex: newIndex });
  },

  reset: () =>
    set({
      mapsUrl: "",
      websiteUrl: "",
      socialUrls: "",
      nicheOverride: "",
      buildMode: "template",
      agentAvailable: false,
      manualControl: false,
      isLoading: false,
      error: null,
      research: null,
      audit: null,
      site: null,
      history: [],
      historyIndex: -1,
      nicheDetection: null,
      pendingNicheConfirmation: false,
      selectedNiche: null,
      agentSettingsOpen: false,
    }),
}));
