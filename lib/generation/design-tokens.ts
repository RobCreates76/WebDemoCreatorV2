import type { DesignTokens, NicheType } from "@/lib/models/site-model";
import { loadNicheDesignConfig } from "@/lib/generation/frontend-design";

export interface NicheTokenPreset {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  displayFont: string;
  bodyFont: string;
}

export const NICHE_PRESETS: Record<NicheType, NicheTokenPreset> = {
  "home-services": {
    primary: "#0f172a",
    secondary: "#1e40af",
    accent: "#f59e0b",
    background: "#fafafa",
    surface: "#ffffff",
    text: "#0f172a",
    textMuted: "#64748b",
    displayFont: "Instrument Serif",
    bodyFont: "DM Sans",
  },
  restaurant: {
    primary: "#1c1917",
    secondary: "#b45309",
    accent: "#dc2626",
    background: "#fafaf9",
    surface: "#ffffff",
    text: "#1c1917",
    textMuted: "#78716c",
    displayFont: "Fraunces",
    bodyFont: "DM Sans",
  },
  "professional-services": {
    primary: "#18181b",
    secondary: "#27272a",
    accent: "#6366f1",
    background: "#fafafa",
    surface: "#ffffff",
    text: "#18181b",
    textMuted: "#71717a",
    displayFont: "Instrument Serif",
    bodyFont: "Inter",
  },
  healthcare: {
    primary: "#0c4a6e",
    secondary: "#0369a1",
    accent: "#14b8a6",
    background: "#f8fafc",
    surface: "#ffffff",
    text: "#0f172a",
    textMuted: "#64748b",
    displayFont: "Playfair Display",
    bodyFont: "Source Sans 3",
  },
  "beauty-wellness": {
    primary: "#44403c",
    secondary: "#a8a29e",
    accent: "#db2777",
    background: "#fafaf9",
    surface: "#ffffff",
    text: "#292524",
    textMuted: "#78716c",
    displayFont: "Cormorant Garamond",
    bodyFont: "Outfit",
  },
  "retail-local": {
    primary: "#171717",
    secondary: "#404040",
    accent: "#ea580c",
    background: "#fafafa",
    surface: "#ffffff",
    text: "#171717",
    textMuted: "#737373",
    displayFont: "Bebas Neue",
    bodyFont: "Work Sans",
  },
  "creative-media": {
    primary: "#0a0a0a",
    secondary: "#262626",
    accent: "#e11d48",
    background: "#fafafa",
    surface: "#ffffff",
    text: "#0a0a0a",
    textMuted: "#737373",
    displayFont: "Syne",
    bodyFont: "Inter",
  },
  general: {
    primary: "#1e293b",
    secondary: "#334155",
    accent: "#3b82f6",
    background: "#f8fafc",
    surface: "#ffffff",
    text: "#0f172a",
    textMuted: "#64748b",
    displayFont: "Instrument Serif",
    bodyFont: "DM Sans",
  },
};

export function buildDesignTokens(
  niche: NicheType,
  brandColors?: string[],
  premium = false
): DesignTokens {
  const preset = NICHE_PRESETS[niche];
  const designConfig = loadNicheDesignConfig(niche);
  let primary = preset.primary;
  let accent = preset.accent;
  let displayFont = designConfig.displayFont ?? preset.displayFont;
  let bodyFont = designConfig.bodyFont ?? preset.bodyFont;

  if (brandColors && brandColors.length > 0) {
    const valid = brandColors.filter(
      (c) => c.startsWith("#") && c.length >= 4 && c !== "#fff" && c !== "#ffffff"
    );
    if (valid.length > 0) {
      accent = valid[0];
      if (valid.length > 1) primary = valid[1];
    }
  }

  return {
    ...preset,
    primary,
    accent,
    displayFont,
    bodyFont,
    radius: premium ? "1rem" : "0.5rem",
    niche,
  };
}

export function buildPremiumDesignTokens(
  niche: NicheType,
  brandColors?: string[]
): DesignTokens {
  return buildDesignTokens(niche, brandColors, true);
}

export function tokensToCssVars(tokens: DesignTokens): string {
  return `
    --color-primary: ${tokens.primary};
    --color-secondary: ${tokens.secondary};
    --color-accent: ${tokens.accent};
    --color-bg: ${tokens.background};
    --color-surface: ${tokens.surface};
    --color-text: ${tokens.text};
    --color-text-muted: ${tokens.textMuted};
    --font-display: '${tokens.displayFont}', Georgia, serif;
    --font-body: '${tokens.bodyFont}', system-ui, sans-serif;
    --radius: ${tokens.radius};
  `;
}

export function getGoogleFontsUrl(tokens: DesignTokens): string {
  const display = tokens.displayFont.replace(/ /g, "+");
  const body = tokens.bodyFont.replace(/ /g, "+");
  return `https://fonts.googleapis.com/css2?family=${display}:wght@300;400;600;700&family=${body}:wght@400;500;600;700&display=swap`;
}
