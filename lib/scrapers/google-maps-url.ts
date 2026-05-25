export function isGoogleMapsUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;

  const lower = trimmed.toLowerCase();
  if (
    lower.includes("google.com/maps") ||
    lower.includes("maps.google.com") ||
    lower.includes("maps.app.goo.gl") ||
    lower.includes("goo.gl/maps")
  ) {
    return true;
  }

  try {
    const parsed = new URL(trimmed);
    return (
      parsed.hostname.includes("google") && parsed.pathname.includes("/maps")
    );
  } catch {
    return false;
  }
}

export async function resolveMapsUrl(url: string): Promise<string> {
  const trimmed = url.trim();
  if (
    trimmed.includes("maps.app.goo.gl") ||
    trimmed.includes("goo.gl/maps")
  ) {
    const res = await fetch(trimmed, { redirect: "follow" });
    return res.url;
  }
  return trimmed;
}

export function extractPlaceNameFromUrl(url: string): string | null {
  const match = url.match(/\/place\/([^/@]+)/);
  if (match) {
    return decodeURIComponent(match[1].replace(/\+/g, " "));
  }
  return null;
}
