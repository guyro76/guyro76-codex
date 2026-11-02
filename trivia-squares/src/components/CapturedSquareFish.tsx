'use client';

import { useEffect, useState } from 'react';

/**
 * Optional, decorative fish for an already captured liquid square.
 * Does not intercept taps or drawing gestures. No animation for users
 * who request reduced motion. Preference persists per browser.
 */
export default function CapturedSquareFish({ enabled, label = 'Fish' }: {
  enabled: boolean;
  label?: string;
}) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReducedMotion(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  if (!enabled || reducedMotion) return null;
  return (
    <span className="trivia-fish-layer" aria-hidden="true" title={label}>
      <span className="trivia-fish">🐟</span>
    </span>
  );
}

export const FISH_PREFERENCE_KEY = 'trivia-fish-enabled-v1';

export function readFishPreference(): boolean {
  if (typeof window === 'undefined') return false;
  try { return window.localStorage.getItem(FISH_PREFERENCE_KEY) === '1'; }
  catch { return false; }
}

export function saveFishPreference(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(FISH_PREFERENCE_KEY, enabled ? '1' : '0'); }
  catch { /* Private browsing may deny storage; gameplay still works. */ }
}
