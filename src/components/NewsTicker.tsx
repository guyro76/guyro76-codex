"use client";

import { useEffect, useState } from "react";

interface Headline {
  title: string;
  url: string;
  source: string;
  topic: string;
}

// Neon topic colors so each headline's tag matches the cyberpunk theme.
const TOPIC_COLOR: Record<string, string> = {
  שיווק: "neon-magenta",
  סושיאל: "neon-cyan",
  AI: "neon-lime",
};

export function NewsTicker() {
  const [headlines, setHeadlines] = useState<Headline[]>([]);

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

  // Duplicate the list so the marquee loops seamlessly.
  const loop = [...headlines, ...headlines];

  return (
    <div className="group relative flex-1 overflow-hidden rounded-2xl border border-cyan-500/30 bg-black/30 px-3 py-2">
      <div className="pointer-events-none absolute right-0 top-0 z-10 flex h-full items-center gap-1 bg-gradient-to-l from-black/60 to-transparent pl-6 pr-2">
        <span className="text-xs font-bold neon-cyan neon-glow">⚡ LIVE</span>
      </div>
      <div className="ticker-track flex w-max items-center gap-8 group-hover:[animation-play-state:paused]">
        {loop.map((h, i) => {
          const color = TOPIC_COLOR[h.topic] || "neon-cyan";
          const isLink = h.url && h.url !== "#";
          const inner = (
            <span className="flex items-center gap-2 whitespace-nowrap text-sm">
              <span className={`rounded-full border border-current/40 px-2 py-0.5 text-[10px] font-bold ${color}`}>
                {h.topic}
              </span>
              <span className="text-cyan-100/90 transition-colors group-hover:text-cyan-50">
                {h.title}
              </span>
              <span className="text-[10px] text-cyan-300/40">· {h.source}</span>
            </span>
          );
          return isLink ? (
            <a
              key={i}
              href={h.url}
              target="_blank"
              rel="noreferrer"
              className="hover:opacity-100 opacity-90"
            >
              {inner}
            </a>
          ) : (
            <span key={i}>{inner}</span>
          );
        })}
      </div>

      <style jsx>{`
        .ticker-track {
          animation: ticker-scroll 60s linear infinite;
        }
        @keyframes ticker-scroll {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
