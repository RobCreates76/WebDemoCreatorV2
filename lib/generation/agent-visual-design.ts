import type { AgentVisualDesign, DesignTokens, NicheType } from "@/lib/models/site-model";
import { NICHE_PRESETS } from "./design-tokens";

export type HeroLayout = AgentVisualDesign["heroLayout"];
export type VisualTheme = AgentVisualDesign["theme"];

/** Fonts available via Google Fonts link builder */
export const AGENT_FONT_OPTIONS = [
  "Instrument Serif",
  "Fraunces",
  "Playfair Display",
  "Cormorant Garamond",
  "Libre Baskerville",
  "Syne",
  "Bebas Neue",
  "Space Grotesk",
  "DM Sans",
  "Inter",
  "Source Sans 3",
  "Outfit",
  "Work Sans",
  "Manrope",
  "Sora",
] as const;

const VALID_LAYOUTS = new Set<HeroLayout>(["cinematic", "split", "editorial"]);
const VALID_THEMES = new Set<VisualTheme>(["light", "dark", "warm"]);

function isValidHex(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}

function pickFont(requested: string | undefined, fallback: string): string {
  if (!requested) return fallback;
  const match = AGENT_FONT_OPTIONS.find(
    (f) => f.toLowerCase() === requested.toLowerCase()
  );
  return match || fallback;
}

function mixHex(hex: string, amount: number, toward: "#000000" | "#ffffff"): string {
  const n = hex.replace("#", "");
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  const t = toward === "#ffffff" ? 255 : 0;
  const mix = (c: number) => Math.round(c + (t - c) * amount);
  return `#${[mix(r), mix(g), mix(b)].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

export function getAgentVisualDesignPromptBlock(): string {
  return `
VISUAL DESIGN (required — this demo must look like a $50K agency build, NOT a template):

You MUST return a "visualDesign" object. The site renderer uses this to produce a completely unique look.

Rules:
- heroLayout: pick ONE that fits the business psychology:
  - "split" = professional services, healthcare, B2B — text left, premium photo right, light background
  - "editorial" = creative, beauty, aspirational brands — oversized typography, dramatic dark mood
  - "cinematic" = home services, urgent trades, restaurants — full-bleed hero photo with overlay
- theme: "dark" for premium/luxury/urgent, "warm" for restaurant/beauty/wellness, "light" for clinical/trust
- Colors: derive from scraped website colors if present, else choose a distinctive palette for THIS niche — never generic blue-on-white SaaS
- primaryColor = dominant brand/dark tone (headers, footer)
- accentColor = high-contrast CTA color (must pop — orange, gold, coral, emerald, etc.)
- backgroundColor + surfaceColor = section backgrounds (must contrast well)
- displayFont + bodyFont: pick DISTINCT pairs from: ${AGENT_FONT_OPTIONS.join(", ")}
  - Never use Inter + Inter. Serif display + sans body OR bold display + clean sans.
- imageKeywords: 4-6 specific Unsplash search terms for THIS business (e.g. "luxury spa treatment room", "emergency plumber fixing pipe", "wood fired pizza oven")
- imageMood: 3-5 words describing the photography style (e.g. "moody cinematic warm", "bright clinical trust")

Return in visualDesign JSON:
{
  "visualDesign": {
    "heroLayout": "split|cinematic|editorial",
    "theme": "light|dark|warm",
    "displayFont": "...",
    "bodyFont": "...",
    "primaryColor": "#......",
    "accentColor": "#......",
    "backgroundColor": "#......",
    "surfaceColor": "#......",
    "imageKeywords": ["...", "..."],
    "imageMood": "..."
  }
}`;
}

export function normalizeAgentVisualDesign(
  raw: Partial<AgentVisualDesign> | undefined,
  niche: NicheType,
  brandColors?: string[]
): AgentVisualDesign {
  const preset = NICHE_PRESETS[niche];
  const scraped = brandColors?.filter(
    (c) => isValidHex(c) && c !== "#fff" && c !== "#ffffff" && c !== "#000" && c !== "#000000"
  );

  const heroLayout = VALID_LAYOUTS.has(raw?.heroLayout as HeroLayout)
    ? (raw!.heroLayout as HeroLayout)
    : niche === "professional-services" || niche === "healthcare"
      ? "split"
      : niche === "beauty-wellness" || niche === "creative-media"
        ? "editorial"
        : "cinematic";

  const theme = VALID_THEMES.has(raw?.theme as VisualTheme)
    ? (raw!.theme as VisualTheme)
    : niche === "restaurant" || niche === "beauty-wellness"
      ? "warm"
      : niche === "creative-media"
        ? "dark"
        : "light";

  let primary = isValidHex(raw?.primaryColor || "") ? raw!.primaryColor! : preset.primary;
  let accent = isValidHex(raw?.accentColor || "") ? raw!.accentColor! : preset.accent;
  let background = isValidHex(raw?.backgroundColor || "")
    ? raw!.backgroundColor!
    : theme === "dark"
      ? "#0a0a0a"
      : theme === "warm"
        ? "#faf8f5"
        : preset.background;
  let surface = isValidHex(raw?.surfaceColor || "")
    ? raw!.surfaceColor!
    : theme === "dark"
      ? "#141414"
      : "#ffffff";

  if (scraped?.length) {
    accent = scraped[0];
    if (scraped.length > 1) primary = scraped[1];
  }

  return {
    heroLayout,
    theme,
    displayFont: pickFont(raw?.displayFont, preset.displayFont),
    bodyFont: pickFont(raw?.bodyFont, preset.bodyFont),
    primaryColor: primary,
    accentColor: accent,
    backgroundColor: background,
    surfaceColor: surface,
    imageKeywords: raw?.imageKeywords?.filter(Boolean).slice(0, 6) || [],
    imageMood: raw?.imageMood?.trim() || "premium editorial authentic",
  };
}

export function visualDesignToTokens(
  design: AgentVisualDesign,
  niche: NicheType
): DesignTokens {
  const preset = NICHE_PRESETS[niche];
  const text =
    design.theme === "dark" ? "#f5f5f5" : preset.text;
  const textMuted =
    design.theme === "dark" ? "#a3a3a3" : preset.textMuted;

  return {
    primary: design.primaryColor,
    secondary: mixHex(design.primaryColor, 0.15, "#ffffff"),
    accent: design.accentColor,
    background: design.backgroundColor,
    surface: design.surfaceColor,
    text,
    textMuted,
    displayFont: design.displayFont,
    bodyFont: design.bodyFont,
    radius: "1.25rem",
    niche,
  };
}

export function getVisualDesignCssVars(design: AgentVisualDesign): string {
  return `
    --hero-layout: ${design.heroLayout};
    --visual-theme: ${design.theme};
  `;
}
