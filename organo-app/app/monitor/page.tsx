"use client";

import Link from "next/link";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Gauge,
  Globe2,
  ImageIcon,
  Leaf,
  LoaderCircle,
  MonitorCheck,
  RefreshCw,
  Server,
  ShieldCheck,
  Wifi,
  WifiOff,
  Zap,
} from "lucide-react";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import "./monitor.css";

type MonitorResult = {
  requestedUrl: string;
  finalUrl: string;
  title: string;
  checkedAt: string;
  loadState: "online" | "limited" | "offline";
  isOnline: boolean;
  statusCode: number;
  contentType: string;
  redirects: number;
  responseTimeMs: number;
  responseSource: string;
  screenshot: string;
  screenshotSource: string;
  screenshotCapturedAt: string;
  metrics: { lcp: string; cls: string; tbt: string };
  note: string;
};

type StoredScan = { url?: string; result?: { finalUrl?: string } };

function latestStoredUrl() {
  try {
    const modern = JSON.parse(localStorage.getItem("organo-history-v2") || "[]") as StoredScan[];
    const first = modern[0];
    if (first?.result?.finalUrl) return first.result.finalUrl;
    if (first?.url) return first.url;
    const legacy = JSON.parse(localStorage.getItem("organo-history") || "[]") as StoredScan[];
    return legacy[0]?.url || "";
  } catch {
    return "";
  }
}

function stateLabel(state: MonitorResult["loadState"]) {
  if (state === "online") return "האתר באוויר";
  if (state === "limited") return "האתר נטען באופן מוגבל";
  return "האתר אינו זמין בבדיקה";
}

export default function MonitorPage() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<MonitorResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [countdown, setCountdown] = useState(300);
  const activeRequest = useRef<AbortController | null>(null);
  const urlRef = useRef("");

  const runCheck = useCallback(async (target?: string) => {
    const value = (target || urlRef.current).trim();
    if (!value) {
      setError("יש להזין כתובת אתר לבדיקה");
      return;
    }
    activeRequest.current?.abort();
    const controller = new AbortController();
    activeRequest.current = controller;
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/monitor", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: value }),
        signal: controller.signal,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "בדיקת המוניטור נכשלה");
      const monitorResult = data as MonitorResult;
      setResult(monitorResult);
      urlRef.current = monitorResult.finalUrl;
      setUrl(monitorResult.finalUrl);
      setCountdown(300);
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === "AbortError") return;
      setError(caught instanceof Error ? caught.message : "בדיקת המוניטור נכשלה");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initial = params.get("url") || latestStoredUrl();
    if (initial) {
      urlRef.current = initial;
      setUrl(initial);
      void runCheck(initial);
    }
    return () => activeRequest.current?.abort();
  }, [runCheck]);

  useEffect(() => {
    if (!autoRefresh || !urlRef.current) return;
    const timer = window.setInterval(() => {
      setCountdown((current) => {
        if (current <= 1) {
          void runCheck(urlRef.current);
          return 300;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [autoRefresh, runCheck]);

  function submit(event: FormEvent) {
    event.preventDefault();
    void runCheck();
  }

  function changeUrl(value: string) {
    urlRef.current = value;
    setUrl(value);
  }

  const statusClass = result?.loadState || "idle";

  return (
    <main className="monitor-page">
      <div className="monitor-backdrop" aria-hidden="true"><i /><i /><i /></div>
      <header className="monitor-topbar">
        <Link href="/" className="monitor-brand"><span><Leaf /></span><div><b>אורגנו</b><small>Live Site Monitor</small></div></Link>
        <Link href="/" className="back-link"><ArrowRight /> חזרה למערכת</Link>
      </header>

      <section className="monitor-hero">
        <div>
          <span className="monitor-eyebrow"><Zap /> REAL-TIME WEBSITE OBSERVABILITY</span>
          <h1>מסך מוניטור חכם<br />לאתר המנותח</h1>
          <p>אימות טעינה, קוד תגובה, זמן תגובה ותמונה עדכנית של דף הכניסה כפי שדפדפן בדיקה רואה אותו.</p>
        </div>
        <div className={`live-orb ${statusClass}`}>
          <div>{result?.isOnline ? <Wifi /> : <WifiOff />}</div>
          <span>{result ? stateLabel(result.loadState) : "ממתין לבדיקה"}</span>
        </div>
      </section>

      <form className="monitor-form" onSubmit={submit}>
        <div><Globe2 /><input dir="ltr" type="url" value={url} onChange={(event) => changeUrl(event.target.value)} placeholder="https://www.example.co.il" aria-label="כתובת אתר למוניטור" /></div>
        <button disabled={loading}>{loading ? <LoaderCircle className="spin" /> : <MonitorCheck />} {loading ? "בודק וטוען צילום..." : "הפעל בדיקת מוניטור"}</button>
      </form>

      {error && <div className="monitor-error" role="alert"><WifiOff />{error}</div>}

      <section className="monitor-grid">
        <div className="browser-card">
          <div className="browser-chrome">
            <span className="dots"><i /><i /><i /></span>
            <div className="browser-address"><ShieldCheck /><span dir="ltr">{result?.finalUrl || url || "https://"}</span></div>
            <button onClick={() => void runCheck()} disabled={loading} aria-label="רענן צילום"><RefreshCw className={loading ? "spin" : ""} /></button>
          </div>
          <div className="browser-screen">
            {loading && <div className="screen-loading"><LoaderCircle className="spin" /><b>אורגנו טוענת את האתר ומפיקה צילום...</b><span>הבדיקה עשויה להימשך עד כחצי דקה</span></div>}
            {!loading && result?.screenshot && <img src={result.screenshot} alt={`צילום דף הכניסה של ${result.title}`} />}
            {!loading && !result?.screenshot && <div className="screen-empty"><ImageIcon /><h2>צילום האתר יופיע כאן</h2><p>הזינו כתובת אתר והפעילו את המוניטור.</p></div>}
          </div>
          {result && <div className="browser-caption"><div><span className={`status-dot ${result.loadState}`} /><b>{result.title}</b><small>צילום: {result.screenshotSource} · {new Date(result.screenshotCapturedAt).toLocaleString("he-IL")}</small></div><a href={result.finalUrl} target="_blank" rel="noreferrer">פתח אתר אמיתי <ExternalLink /></a></div>}
        </div>

        <aside className="monitor-side">
          <article className={`status-card ${statusClass}`}>
            <div className="status-icon">{result?.isOnline ? <CheckCircle2 /> : <WifiOff />}</div>
            <small>מצב טעינה</small>
            <h2>{result ? stateLabel(result.loadState) : "טרם נבדק"}</h2>
            <p>{result?.note || "הפעל בדיקה כדי לקבל מצב עדכני."}</p>
          </article>

          <div className="monitor-metrics">
            <article><Clock3 /><small>זמן תגובה</small><b>{result ? `${result.responseTimeMs}ms` : "-"}</b></article>
            <article><Server /><small>HTTP</small><b>{result?.statusCode || "-"}</b></article>
            <article><RefreshCw /><small>הפניות</small><b>{result?.redirects ?? "-"}</b></article>
            <article><Activity /><small>מקור בדיקה</small><b>{result?.responseSource || "-"}</b></article>
          </div>

          <article className="vitals-card">
            <div className="card-heading"><Gauge /><div><small>LIGHTHOUSE SNAPSHOT</small><h3>מדדי חוויית טעינה</h3></div></div>
            <div className="vital-row"><span>LCP</span><b>{result?.metrics.lcp || "לא זמין"}</b></div>
            <div className="vital-row"><span>CLS</span><b>{result?.metrics.cls || "לא זמין"}</b></div>
            <div className="vital-row"><span>TBT</span><b>{result?.metrics.tbt || "לא זמין"}</b></div>
          </article>

          <article className="refresh-card">
            <div><RefreshCw /><div><b>רענון אוטומטי</b><small>בדיקה מחדש כל 5 דקות</small></div></div>
            <button className={autoRefresh ? "active" : ""} onClick={() => { setAutoRefresh((value) => !value); setCountdown(300); }} aria-pressed={autoRefresh}><span /></button>
            {autoRefresh && <p>הבדיקה הבאה בעוד {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, "0")}</p>}
          </article>
        </aside>
      </section>

      {result && <section className="monitor-footer-data">
        <div><small>כתובת סופית</small><b dir="ltr">{result.finalUrl}</b></div>
        <div><small>סוג תוכן</small><b>{result.contentType || "לא זמין"}</b></div>
        <div><small>בדיקה אחרונה</small><b>{new Date(result.checkedAt).toLocaleString("he-IL")}</b></div>
      </section>}
    </main>
  );
}
