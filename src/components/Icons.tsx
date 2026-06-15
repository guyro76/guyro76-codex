// Clean, modern line-icons (rounded, friendly but professional) used across
// Postwave in place of emojis. All inherit `currentColor` so they can be tinted
// or gradient-masked by the parent. No external dependency.

import type { SVGProps } from "react";

type IconProps = Omit<SVGProps<SVGSVGElement>, 'strokeWidth'> & { size?: number };

function base({ size = 24, strokeWidth = 1.8, ...props }: { size?: number; strokeWidth?: number } & Omit<SVGProps<SVGSVGElement>, 'size' | 'strokeWidth'>) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...props,
  };
}

export function IconDashboard(p: IconProps) {
  return (
    <svg {...base(p)}>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  );
}

export function IconCompass(p: IconProps) {
  return (
    <svg {...base(p)}>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2 5-5 2 2-5z" />
    </svg>
  );
}

export function IconFlame(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M12 3c1 3 4 4.5 4 8a4 4 0 0 1-8 0c0-1.2.4-2 1-2.8C9.5 9.7 9 8.4 9 7c1.2.4 2 1 2.5 2 .6-2.4 0-4.4.5-6z" />
    </svg>
  );
}

export function IconUsers(p: IconProps) {
  return (
    <svg {...base(p)}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
      <path d="M16 6.2a3 3 0 0 1 0 5.6" />
      <path d="M17.5 19a5.4 5.4 0 0 0-2.4-4.5" />
    </svg>
  );
}

export function IconSearch(p: IconProps) {
  return (
    <svg {...base(p)}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.2-3.2" />
    </svg>
  );
}

export function IconSparkles(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M12 3l1.7 4.3L18 9l-4.3 1.7L12 15l-1.7-4.3L6 9l4.3-1.7z" />
      <path d="M18 14l.8 2.2L21 17l-2.2.8L18 20l-.8-2.2L15 17l2.2-.8z" />
    </svg>
  );
}

export function IconCalendar(p: IconProps) {
  return (
    <svg {...base(p)}>
      <rect x="3" y="4.5" width="18" height="16" rx="2.5" />
      <path d="M3 9h18M8 3v3M16 3v3" />
      <circle cx="8.5" cy="13.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="13.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="13.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconPalette(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M12 3a9 9 0 1 0 0 18c1.2 0 2-.9 2-2 0-.5-.2-.9-.5-1.3-.3-.4-.5-.8-.5-1.2 0-1 .8-1.8 1.8-1.8H16a5 5 0 0 0 5-5c0-3.6-4-5.7-9-5.7z" />
      <circle cx="7.5" cy="11.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="11" cy="7.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="8.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconSettings(p: IconProps) {
  return (
    <svg {...base(p)}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19" />
    </svg>
  );
}

export function IconShield(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M12 3l7 2.5v5c0 4.5-3 8-7 9.5-4-1.5-7-5-7-9.5v-5z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function IconLogout(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
      <path d="M10 12H3m0 0 3-3m-3 3 3 3" />
    </svg>
  );
}

export function IconMenu(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function IconLibrary(p: IconProps) {
  return (
    <svg {...base(p)}>
      <rect x="3" y="4" width="5" height="16" rx="1.5" />
      <rect x="10" y="4" width="5" height="16" rx="1.5" />
      <path d="m17.5 5 3 .8-3.2 13-3-.8z" />
    </svg>
  );
}

export function IconRocket(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M12 3c3 1.5 5 5 5 9l-2.5 2.5h-5L7 12c0-4 2-7.5 5-9z" />
      <circle cx="12" cy="9.5" r="1.6" />
      <path d="M9.5 16.5C8 18 7.5 20 7.5 20s2-.5 3.5-2M7 13.5C5.5 14 4.5 15.5 4.5 17" />
    </svg>
  );
}

export function IconDownload(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M12 3v11m0 0 4-4m-4 4-4-4" />
      <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </svg>
  );
}

export function IconTarget(p: IconProps) {
  return (
    <svg {...base(p)}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

/* --- Content-type icons (for the create cards) --- */

export function IconCarousel(p: IconProps) {
  return (
    <svg {...base(p)}>
      <rect x="7" y="5" width="10" height="14" rx="2" />
      <path d="M4 8v8M20 8v8" />
    </svg>
  );
}

export function IconPost(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M4 20h16" />
      <path d="M14.5 4.5a2.1 2.1 0 0 1 3 3L8 17l-4 1 1-4z" />
    </svg>
  );
}

export function IconPresentation(p: IconProps) {
  return (
    <svg {...base(p)}>
      <rect x="3" y="4" width="18" height="11" rx="2" />
      <path d="M12 15v4m-3 0h6M7.5 11l2.5-2.5 2 2 3-3.5" />
    </svg>
  );
}

export function IconReels(p: IconProps) {
  return (
    <svg {...base(p)}>
      <rect x="3.5" y="4" width="17" height="16" rx="3" />
      <path d="M3.5 9h17M9 4l2 5M14 4l2 5" />
      <path d="m11 12.5 3.5 2-3.5 2z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconStory(p: IconProps) {
  return (
    <svg {...base(p)}>
      <rect x="6" y="3" width="12" height="18" rx="3" />
      <path d="m10.5 9.5 4 2.5-4 2.5z" fill="currentColor" stroke="none" />
    </svg>
  );
}

// Lookup map so callers can render by string key.
export const ICONS = {
  dashboard: IconDashboard,
  compass: IconCompass,
  flame: IconFlame,
  users: IconUsers,
  search: IconSearch,
  sparkles: IconSparkles,
  calendar: IconCalendar,
  palette: IconPalette,
  settings: IconSettings,
  shield: IconShield,
  logout: IconLogout,
  menu: IconMenu,
  library: IconLibrary,
  rocket: IconRocket,
  download: IconDownload,
  target: IconTarget,
  carousel: IconCarousel,
  post: IconPost,
  presentation: IconPresentation,
  reels: IconReels,
  story: IconStory,
} as const;

export type IconName = keyof typeof ICONS;

export function Icon({ name, ...props }: { name: IconName } & IconProps) {
  const Cmp = ICONS[name];
  return <Cmp {...props} />;
}
