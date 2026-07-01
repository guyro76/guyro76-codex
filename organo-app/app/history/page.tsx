"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, FileDown, Globe2, History, Leaf, RefreshCw, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { AnalysisResult } from "@/types/analyze";
import "./history.css";

type SavedScan = {
  id: string;
  url: string;
  score: number;
  date: string;
  clientName?: string;
  result?: AnalysisResult;
};

type SavedReport = {
  id: string;
  scanKey: string;
  url: string;
  score: number;
  scanDate: string;
  generatedAt: string;
  clientName?: string;
  fileName: string;
  action: "downloaded" | "shared";
};

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
}

function host(value: string) {
  try {
    return new URL(value).hostname;
  } catch {
    return value;
  }
}

function scanKey(scan: SavedScan) {
  return scan.result ? `${scan.result.finalUrl}|${scan.result.fetchedAt}` : `${scan.url}|${scan.date}`;
}

export default function HistoryPage() {
  const router = useRouter();
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [scans, setScans] = useState<SavedScan[]>([]);

  useEffect(() => {
    setReports(loadJson<SavedReport[]>("organo-report-history-v1", []));
    setScans(loadJson<SavedScan[]>("organo-history-v2", []));
  }, []);

  const reportCountBySite = useMemo(() => {
    const map = new Map<string, number>();
    for (const report of reports) map.set(report.url, (map.get(report.url) || 0) + 1);
    return map;
  }, [reports]);

  function openReport(report: SavedReport) {
    const matchingScan = scans.find((scan) => scanKey(scan) === report.scanKey) || scans.find((scan) => scan.url === report.url && scan.result);
    if (matchingScan) {
      localStorage.setItem("organo-selected-scan-id", matchingScan.id);
      router.push("/report-builder");
      return;
    }
    router.push("/");
  }

  function openScan(scan: SavedScan) {
    if (scan.result) {
      localStorage.setItem("organo-selected-scan-id", scan.id);
      router.push("/report-builder");
      return;
    }
    router.push("/");
  }

  function removeReport(id: string) {
    const next = reports.filter((report) => report.id !== id);
    setReports(next);
    localStorage.setItem("organo-report-history-v1", JSON.stringify(next));
  }

  return (
    <main className="history-page">
      <header className="history-topbar">
        <Link href="/"><ArrowRight /> חזרה לאורגנו</Link>
        <div className="history-brand"><span><Leaf /></span><div><b>אורגנו</b><small>Report Archive</small></div></div>
        <Link className="history-new" href="/"><RefreshCw /> סריקה חדשה</Link>
      </header>

      <section className="history-hero">
        <div>
          <small>REPORT ARCHIVE</small>
          <h1>היסטוריית דוחות וסריקות</h1>
          <p>כל PDF שמופק או נפתח לשיתוף נשמר כאן אוטומטית, וניתן לפתוח את תוצאות הסריקה ולהפיק אותו שוב.</p>
        </div>
        <div className="history-kpis">
          <article><FileDown /><b>{reports.length}</b><span>דוחות שהופקו</span></article>
          <article><Globe2 /><b>{scans.length}</b><span>סריקות שמורות</span></article>
          <article><History /><b>{reportCountBySite.size}</b><span>אתרים בדוחות</span></article>
        </div>
      </section>

      <section className="history-section">
        <div className="history-section-title"><div><small>PDF REPORTS</small><h2>דוחות שהופקו</h2></div><span>{reports.length}</span></div>
        <div className="report-history-list">
          {reports.length ? reports.map((report) => (
            <article className="report-history-card" key={report.id}>
              <div className="report-history-icon"><FileDown /></div>
              <div className="report-history-info">
                <div><h3>{report.clientName || host(report.url)}</h3><span>{report.action === "shared" ? "נפתח לשיתוף" : "PDF הורד"}</span></div>
                <p dir="ltr">{report.url}</p>
                <small>הופק: {new Date(report.generatedAt).toLocaleString("he-IL")}</small>
                <small>מועד הסריקה: {new Date(report.scanDate).toLocaleString("he-IL")}</small>
                <code dir="ltr">{report.fileName}</code>
              </div>
              <div className="report-history-score"><b>{report.score}</b><span>/100</span></div>
              <div className="report-history-actions">
                <button className="primary" onClick={() => openReport(report)}><Eye /> פתח והפק שוב</button>
                <button className="danger" onClick={() => removeReport(report.id)} aria-label="מחק רישום דוח"><Trash2 /></button>
              </div>
            </article>
          )) : (
            <article className="history-empty"><FileDown /><h3>עדיין לא הופקו דוחות</h3><p>הורד או שתף דוח ממסך הפקת הדוחות והוא יישמר כאן אוטומטית.</p><Link href="/report-builder">עבור להפקת דוח</Link></article>
          )}
        </div>
      </section>

      <section className="history-section">
        <div className="history-section-title"><div><small>SCAN ARCHIVE</small><h2>סריקות שמורות</h2></div><span>{scans.length}</span></div>
        <div className="report-history-list">
          {scans.length ? scans.map((scan) => (
            <article className="report-history-card" key={scan.id}>
              <div className="report-history-icon"><Globe2 /></div>
              <div className="report-history-info">
                <div><h3>{scan.clientName || host(scan.url)}</h3><span>{scan.result ? "דוח מלא זמין" : "סריקה ללא פירוט מלא"}</span></div>
                <p dir="ltr">{scan.url}</p>
                <small>{new Date(scan.date).toLocaleString("he-IL")}</small>
              </div>
              <div className="report-history-score"><b>{scan.score}</b><span>/100</span></div>
              <div className="report-history-actions"><button className="primary" onClick={() => openScan(scan)}><Eye /> {scan.result ? "פתח תוצאות" : "סרוק שוב"}</button></div>
            </article>
          )) : (
            <article className="history-empty"><Globe2 /><h3>עדיין אין סריקות</h3><p>הסריקה הראשונה שתבצע תופיע כאן.</p><Link href="/">התחל סריקה</Link></article>
          )}
        </div>
      </section>
    </main>
  );
}
