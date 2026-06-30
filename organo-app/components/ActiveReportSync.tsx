"use client";

import { useEffect } from "react";
import type { AnalysisResult } from "@/types/analyze";

type SavedScan = {
  date?: string;
  result?: AnalysisResult;
};

function newestReport(): AnalysisResult | null {
  try {
    const scans = JSON.parse(localStorage.getItem("organo-history-v2") || "[]") as SavedScan[];
    const available = scans.filter((scan) => scan.result);
    available.sort((a, b) => new Date(b.date || b.result?.fetchedAt || 0).getTime() - new Date(a.date || a.result?.fetchedAt || 0).getTime());
    return available[0]?.result || null;
  } catch {
    return null;
  }
}

export default function ActiveReportSync() {
  useEffect(() => {
    let lastKey = "";

    const sync = () => {
      const report = newestReport();
      if (!report) return;
      const key = `${report.finalUrl}|${report.fetchedAt}`;
      if (key === lastKey && localStorage.getItem("organo-active-report")) return;
      lastKey = key;
      localStorage.setItem("organo-active-report", JSON.stringify(report));
      window.dispatchEvent(new Event("organo-report-updated"));
    };

    sync();
    const interval = window.setInterval(sync, 1200);
    window.addEventListener("storage", sync);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return null;
}
