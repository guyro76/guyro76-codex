// Brand identity store (localStorage). Lets the user define their brand once —
// audience, tone, objective and palette — and have the content factory use it
// as smart defaults for every new piece. No backend dependency.

const KEY = "postwave:brand";

export interface Brand {
  name: string;
  audience: string;
  tone: string;
  objective: string;
  colors: string[]; // [primary, secondary, accent]
}

export const DEFAULT_BRAND: Brand = {
  name: "",
  audience: "קהל מקצועי",
  tone: "מקצועי",
  objective: "בניית סמכות",
  colors: ["#00f0ff", "#ff00ff", "#b000ff"],
};

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
  } catch {
    // storage unavailable — ignore
  }
}
