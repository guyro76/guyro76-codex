"use client";

import { useEffect, useState } from "react";

interface Tip {
  id: number;
  title: string;
  description: string;
  icon: string;
  category: string;
  impact: string;
}

export function DailyTip() {
  const [tip, setTip] = useState<Tip | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTip = async () => {
      try {
        const response = await fetch("/api/tips/daily");
        const data = await response.json();
        setTip(data.tip);
      } catch (error) {
        console.error("Failed to fetch daily tip:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTip();
  }, []);

  if (loading || !tip) return null;

  return (
    <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-lg p-4 mb-6">
      <div className="flex gap-3">
        <div className="text-3xl flex-shrink-0">{tip.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold text-cyan-300">{tip.title}</h3>
            <span
              className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${
                tip.impact === "very-high"
                  ? "bg-red-500/20 text-red-300"
                  : tip.impact === "high"
                  ? "bg-cyan-500/20 text-cyan-300"
                  : "bg-blue-500/20 text-blue-300"
              }`}
            >
              {tip.impact === "very-high"
                ? "⚡ חשוב"
                : tip.impact === "high"
                ? "📈 גבוה"
                : "📊 בינוני"}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">{tip.description}</p>
        </div>
      </div>
    </div>
  );
}
