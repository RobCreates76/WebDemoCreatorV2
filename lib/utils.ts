import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function extractCityFromAddress(address: string): string {
  const parts = address.split(",").map((p) => p.trim());
  if (parts.length >= 2) {
    const cityPart = parts[parts.length - 2];
    return cityPart.replace(/\d{5}(-\d{4})?/, "").trim();
  }
  return parts[0] ?? "Your Area";
}
