export const CAROUSEL_DIMENSIONS = {
  instagram: {
    carousel: { width: 1080, height: 1350, ratio: "4:5" },
    story: { width: 1080, height: 1920, ratio: "9:16" },
    post: { width: 1080, height: 1080, ratio: "1:1" },
    presentation: { width: 1920, height: 1080, ratio: "16:9" },
  },
  facebook: {
    carousel: { width: 1200, height: 628, ratio: "1.91:1" },
    story: { width: 1080, height: 1920, ratio: "9:16" },
    post: { width: 1200, height: 630, ratio: "1.91:1" },
    presentation: { width: 1920, height: 1080, ratio: "16:9" },
  },
  linkedin: {
    carousel: { width: 1200, height: 627, ratio: "1.91:1" },
    story: null,
    post: { width: 1200, height: 1200, ratio: "1:1" },
    presentation: { width: 1920, height: 1080, ratio: "16:9" },
  },
  tiktok: {
    carousel: { width: 1080, height: 1920, ratio: "9:16" },
    story: { width: 1080, height: 1920, ratio: "9:16" },
    post: { width: 1080, height: 1920, ratio: "9:16" },
    presentation: { width: 1920, height: 1080, ratio: "16:9" },
  },
};

export const DESIGN_TEMPLATES = {
  modern: {
    name: "Modern Pro",
    colors: ["#06B6D4", "#0891B2", "#0E7490"],
    fonts: "rubik",
  },
  minimal: {
    name: "Clean Minimal",
    colors: ["#475569", "#334155", "#1E293B"],
    fonts: "heebo",
  },
  bold: {
    name: "Bold Impact",
    colors: ["#A855F7", "#EC4899", "#F43F5E"],
    fonts: "assistant",
  },
};

export function getDimensions(
  platform: string,
  contentType: string
): { width: number; height: number; ratio: string } | null {
  const config =
    CAROUSEL_DIMENSIONS[platform as keyof typeof CAROUSEL_DIMENSIONS];
  if (!config) return null;
  return config[contentType as keyof typeof config] || null;
}

export function getTemplate(design: string) {
  return DESIGN_TEMPLATES[design as keyof typeof DESIGN_TEMPLATES];
}
