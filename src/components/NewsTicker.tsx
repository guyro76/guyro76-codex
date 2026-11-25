"use client";

import { useEffect, useRef, useState } from "react";

interface Headline {
  title: string;
  url: string;
  source: string;
  topic: string;
}

/**
 * Live news marquee for the app header.
 *
 * Two details matter here:
 *
 *  • Direction. The page is RTL, but a marquee transform is far easier to
 *    reason about left-to-right. The track is forced to dir="ltr" and each
 *    headline is set back to dir="rtl" so the Hebrew still renders correctly.
 *    Animating inside an RTL track is what made an earlier version start
 *    off-screen and look empty.
 *
 *  • Motion. It runs longer than five seconds alongside other content, so it
 *    needs a way to stop: it pauses on hover and on keyboard focus, there is
 *    an explicit pause control, and reduced-motion stops it outright.
 */
export function NewsTicker() {
  const [headlines, setHeadlines] = useState<Headline[]>([]);
  const [paused, setPaused] = useState(false);
  const liveRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/news/ticker")
      .then((r) => r.json())
      .then((d) => {
        if (alive && Array.isArray(d.headlines)) setHeadlines(d.headlines);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  if (headlines.length === 0) return null;

  // Duplicated once so the -50% translate loops seamlessly.
  const loop = [...headlines, ...headlines];

  return (
    <div className="group hidden min-w-0 flex-1 items-center gap-2 rounded-2xl surface px-3 py-2 md:flex">
      {/* A sibling, not an overlay: the scrolling text can never run under it. */}
      <span className="flex-shrink-0 text-xs font-bold accent-ink whitespace-nowrap">
        <span aria-hidden="true">⚡</span> LIVE
      </span>

      <div dir="ltr" className="min-w-0 flex-1 overflow-hidden" ref={liveRef}>
        <div
          className="ticker-track flex w-max items-center gap-10"
          data-paused={paused ? "true" : "false"}
        >
          {loop.map((h, i) => {
            const isLink = h.url && h.url !== "#";
            const inner = (
              <span dir="rtl" className="flex items-center gap-2 whitespace-nowrap text-sm">
                <span className="rounded-full surface-solid px-2 py-0.5 text-[10px] font-bold accent-ink">
                  {h.topic}
                </span>
                <span className="ink">{h.title}</span>
                <span className="text-[10px] ink-muted">· {h.source}</span>
              </span>
            );
            return isLink ? (
              <a
                key={i}
                href={h.url}
                target="_blank"
                rel="noreferrer"
                // The duplicated half is decorative; only the first set is
                // exposed, so a screen reader does not read everything twice.
                aria-hidden={i >= headlines.length ? "true" : undefined}
                tabIndex={i >= headlines.length ? -1 : undefined}
              >
                {inner}
              </a>
            ) : (
              <span key={i} aria-hidden={i >= headlines.length ? "true" : undefined}>
                {inner}
              </span>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setPaused((p) => !p)}
        aria-pressed={paused}
        className="flex-shrink-0 rounded-full surface-solid px-2 py-0.5 text-[10px] font-bold ink-muted opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
      >
        {paused ? "הפעל" : "עצור"}
      </button>

      <style jsx>{`
        .ticker-track {
          animation: ticker-scroll 60s linear infinite;
        }
        /* Pause on hover, on keyboard focus anywhere inside, and on request. */
        .group:hover .ticker-track,
        .group:focus-within .ticker-track,
        .ticker-track[data-paused="true"] {
          animation-play-state: paused;
        }
        @keyframes ticker-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .ticker-track {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
