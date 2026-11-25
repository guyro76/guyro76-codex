// Brand identity, stored locally.
//
// Defined once by the user — audience, tone, objective, palette — and used as
// the default for every new piece, so the content factory does not ask the
// same questions each time.
//
// Local storage is deliberate for now: it keeps the Brand Kit working with no
// backend. See ARCHITECTURE-2027.md — this moves server-side in step 1, at
// which point the brand travels between devices.

const KEY = "postwave:brand";

export interface Brand {
  name: string;
  audience: string;
  tone: string;
  objective: string;
  /** [primary, secondary, accent] */
  colors: string[];
  /** Hue (0–360) the whole interface is generated from. */
  hue: number | null;
}

export const DEFAULT_BRAND: Brand = {
  name: "",
  audience: "קהל מקצועי",
  tone: "מקצועי",
  objective: "authority",
  colors: ["#7c5cff", "#e061c4", "#36c5f0"],
  hue: null,
};

export const TONES = ["מקצועי", "אנושי", "ברור", "מעורר השראה", "נועז", "ידידותי"];

export const OBJECTIVES: { value: string; label: string }[] = [
  { value: "authority", label: "בניית סמכות" },
  { value: "engagement", label: "הגדלת מעורבות" },
  { value: "awareness", label: "הגדלת חשיפה" },
  { value: "leads", label: "יצירת לידים" },
  { value: "sales", label: "הגדלת מכירות" },
];

function hasStorage(): boolean {
  try {
    return typeof window !== "undefined" && !!window.localStorage;
  } catch {
    return false;
  }
}

export function getBrand(): Brand {
  if (!hasStorage()) return DEFAULT_BRAND;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_BRAND;
    return { ...DEFAULT_BRAND, ...(JSON.parse(raw) as Partial<Brand>) };
  } catch {
    return DEFAULT_BRAND;
  }
}

export function saveBrand(brand: Brand): void {
  if (!hasStorage()) return;
  try {
    localStorage.setItem(KEY, JSON.stringify(brand));
    applyBrandHue(brand.hue);
  } catch {
    // storage unavailable (private window, blocked site data) — ignore
  }
}

/**
 * Pin the interface hue to the brand, or release it back to the slow drift.
 *
 * The whole palette is generated from --hue, so setting it here re-skins the
 * app in the brand's colour without touching any component.
 */
export function applyBrandHue(hue: number | null): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (hue === null || Number.isNaN(hue)) {
    root.style.removeProperty("--hue");
    root.style.removeProperty("animation");
    return;
  }
  // Stopping the drift is what makes the pin stick.
  root.style.setProperty("animation", "none");
  root.style.setProperty("--hue", String(hue));
}

/** Derive a hue (0–360) from a hex colour, to pin the UI to a brand colour. */
export function hexToHue(hex: string): number | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  if (d === 0) return null; // greyscale carries no hue

  let h: number;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;

  h = Math.round(h * 60);
  return (h + 360) % 360;
}
