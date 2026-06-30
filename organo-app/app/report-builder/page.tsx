"use client";

import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Bot,
  CheckCircle2,
  CircleAlert,
  Download,
  FileDown,
  Gauge,
  Globe2,
  ImageIcon,
  Leaf,
  LoaderCircle,
  Share2,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { AnalysisCheck, AnalysisResult, Category } from "@/types/analyze";
import "./report-builder.css";

type StoredScan = {
  id?: string;
  url: string;
  score: number;
  date: string;
  clientName?: string;
  result?: AnalysisResult;
};

type MonitorResult = {
  screenshot?: string;
  screenshotSource?: string;
  finalUrl?: string;
  title?: string;
  checkedAt?: string;
  statusCode?: number;
  responseTimeMs?: number;
  loadState?: "online" | "limited" | "offline";
};

const categoryNames: Record<Category, string> = {
  SEO: "SEO",
  GEO: "GEO",
  AEO: "AEO",
  Performance: "ביצועים",
};

const priorityRank = { critical: 0, high: 1, medium: 2, opportunity: 3 } as const;
const priorityNames = { critical: "קריטי", high: "גבוה", medium: "בינוני", opportunity: "הזדמנות" } as const;

function loadLatestScan(): StoredScan | null {
  try {
    const modern = JSON.parse(localStorage.getItem("organo-history-v2") || "[]") as StoredScan[];
    const complete = modern.find((scan) => scan.result);
    if (complete) return complete;
  } catch {}
  return null;
}

function host(value: string) {
  try {
    return new URL(value).hostname;
  } catch {
    return value;
  }
}

function statusText(score: number) {
  if (score >= 85) return "מצב מצוין";
  if (score >= 70) return "בסיס טוב עם הזדמנויות";
  if (score >= 50) return "נדרשת תוכנית שיפור";
  return "נדרשת התערבות דחופה";
}

function topIssues(result: AnalysisResult) {
  return result.checks
    .filter((check) => check.status !== "pass")
    .sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority] || b.weight - a.weight)
    .slice(0, 8);
}

function topStrengths(result: AnalysisResult) {
  return result.checks
    .filter((check) => check.status === "pass")
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 8);
}

function evidenceImage(check: AnalysisCheck, result: AnalysisResult) {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 630;
  const context = canvas.getContext("2d");
  if (!context) return "";
  const gradient = context.createLinearGradient(0, 0, 1200, 630);
  gradient.addColorStop(0, "#071a11");
  gradient.addColorStop(1, check.status === "pass" ? "#153b27" : "#351819");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 1200, 630);
  context.strokeStyle = check.status === "pass" ? "#83efaa" : "#ff9292";
  context.lineWidth = 5;
  context.strokeRect(34, 34, 1132, 562);
  context.textAlign = "right";
  context.direction = "rtl";
  context.fillStyle = "#d9ff73";
  context.font = "700 28px Arial";
  context.fillText(`אורגנו · ${categoryNames[check.category]} · ${check.score}/100`, 1100, 105);
  context.fillStyle = "#ffffff";
  context.font = "700 48px Arial";
  const title = check.title.length > 40 ? `${check.title.slice(0, 40)}…` : check.title;
  context.fillText(title, 1100, 185);
  context.fillStyle = "#b6c9bc";
  context.font = "30px Arial";
  wrapText(context, check.finding, 1100, 255, 1000, 44);
  context.fillStyle = "#dfffe7";
  context.font = "700 27px Arial";
  context.fillText("המלצת אורגנו", 1100, 450);
  context.fillStyle = "#b6c9bc";
  context.font = "25px Arial";
  wrapText(context, check.recommendation, 1100, 495, 1000, 38);
  context.textAlign = "left";
  context.direction = "ltr";
  context.fillStyle = "#719080";
  context.font = "22px Arial";
  context.fillText(host(result.finalUrl), 70, 565);
  return canvas.toDataURL("image/png");
}

function wrapText(context: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(" ");
  let line = "";
  let lineY = y;
  for (const word of words) {
    const test = `${line}${word} `;
    if (context.measureText(test).width > maxWidth && line) {
      context.fillText(line.trim(), x, lineY);
      line = `${word} `;
      lineY += lineHeight;
      if (lineY > y + lineHeight * 3) break;
    } else {
      line = test;
    }
  }
  if (line && lineY <= y + lineHeight * 3) context.fillText(line.trim(), x, lineY);
}

export default function ReportBuilderPage() {
  const [scan, setScan] = useState<StoredScan | null>(null);
  const [monitor, setMonitor] = useState<MonitorResult | null>(null);
  const [clientName, setClientName] = useState("");
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState("");
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const current = loadLatestScan();
    setScan(current);
    setClientName(current?.clientName || "");
    if (!current?.result?.finalUrl) return;
    fetch("/api/monitor", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url: current.result.finalUrl }),
    })
      .then((response) => response.json())
      .then((data) => setMonitor(data as MonitorResult))
      .catch(() => setMonitor(null));
  }, []);

  const result = scan?.result || null;
  const strengths = useMemo(() => result ? topStrengths(result) : [], [result]);
  const issues = useMemo(() => result ? topIssues(result) : [], [result]);
  const visualEvidence = useMemo(() => {
    if (!result || typeof document === "undefined") return [];
    return [...strengths.slice(0, 2), ...issues.slice(0, 4)].map((check) => ({ check, image: evidenceImage(check, result) }));
  }, [issues, result, strengths]);

  async function buildPdf() {
    if (!reportRef.current || !result) throw new Error("אין תוצאות סריקה מלאות להפקת הדו״ח");
    setExporting(true);
    setMessage("");
    reportRef.current.classList.add("pdf-export");
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import("html2canvas"), import("jspdf")]);
      const canvas = await html2canvas(reportRef.current, {
        scale: 1.7,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#06170f",
        logging: false,
        windowWidth: Math.max(reportRef.current.scrollWidth, 1240),
      });
      const image = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 6;
      const width = pageWidth - margin * 2;
      const height = canvas.height * width / canvas.width;
      let offset = margin;
      pdf.addImage(image, "JPEG", margin, offset, width, height, undefined, "FAST");
      let remaining = height - (pageHeight - margin * 2);
      while (remaining > 0) {
        pdf.addPage();
        offset = margin - (height - remaining);
        pdf.addImage(image, "JPEG", margin, offset, width, height, undefined, "FAST");
        remaining -= pageHeight - margin * 2;
      }
      const fileName = `Organo-Branded-Report-${host(result.finalUrl)}-${result.fetchedAt.slice(0, 10)}.pdf`;
      return { blob: pdf.output("blob"), fileName };
    } finally {
      reportRef.current.classList.remove("pdf-export");
      setExporting(false);
    }
  }

  async function downloadPdf() {
    try {
      const { blob, fileName } = await buildPdf();
      const href = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = href;
      link.download = fileName;
      link.click();
      setTimeout(() => URL.revokeObjectURL(href), 1500);
      setMessage("הדו״ח הממותג הופק בהצלחה וכולל את צילום האתר וצילומי התובנות.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "הפקת ה-PDF נכשלה");
    }
  }

  async function sharePdf() {
    if (!result) return;
    try {
      const { blob, fileName } = await buildPdf();
      const file = new File([blob], fileName, { type: "application/pdf" });
      const nav = navigator as Navigator & { canShare?: (data?: ShareData) => boolean };
      if (navigator.share && nav.canShare?.({ files: [file] })) {
        await navigator.share({ title: `דו״ח אורגנו - ${clientName || host(result.finalUrl)}`, files: [file] });
        return;
      }
      const href = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = href;
      link.download = fileName;
      link.click();
      window.open(`https://wa.me/?text=${encodeURIComponent(`דו״ח אורגנו עבור ${clientName || host(result.finalUrl)} מוכן. מצורף קובץ PDF ממותג עם צילום האתר והתובנות.`)}`, "_blank", "noopener,noreferrer");
      setMessage("הדו״ח הורד ו-WhatsApp נפתח. יש לצרף את הקובץ שהורד.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "שיתוף הדו״ח נכשל");
    }
  }

  if (!result) {
    return <main className="report-builder-empty"><Leaf /><h1>אין סריקה מלאה להפקת דו״ח</h1><p>חזור למערכת, בצע ניתוח אתר ולאחר מכן לחץ על הכפתור "דו״ח PDF ממותג".</p><Link href="/"><ArrowRight /> חזרה לניתוח אתר</Link></main>;
  }

  return (
    <main className="report-builder-page">
      <header className="builder-toolbar">
        <Link href="/"><ArrowRight /> חזרה לתוצאות הסריקה</Link>
        <div><label>שם הלקוח בדו״ח<input value={clientName} onChange={(event) => setClientName(event.target.value)} placeholder={host(result.finalUrl)} /></label></div>
        <button onClick={downloadPdf} disabled={exporting}><FileDown />{exporting ? "מפיק דו״ח..." : "הורד PDF ממותג"}</button>
        <button onClick={sharePdf} disabled={exporting}><Share2 />שלח ללקוח</button>
      </header>
      {message && <div className="builder-message">{message}</div>}

      <div ref={reportRef} className="branded-report">
        <section className="report-cover report-page">
          <div className="cover-brand"><span><Leaf /></span><div><b>אורגנו</b><small>Organic Growth OS</small></div></div>
          <div className="cover-badge"><Sparkles /> דו״ח SEO · GEO · AEO ממותג</div>
          <h1>דו״ח ניתוח וצמיחה אורגנית</h1>
          <h2>{clientName || scan?.clientName || host(result.finalUrl)}</h2>
          <p dir="ltr">{result.finalUrl}</p>
          <div className="cover-score"><strong>{result.scores.overall}</strong><span>ציון אורגנו</span><b>{statusText(result.scores.overall)}</b></div>
          <div className="cover-meta"><span>תאריך הפקה: {new Date().toLocaleDateString("he-IL")}</span><span>תאריך סריקה: {new Date(result.fetchedAt).toLocaleString("he-IL")}</span></div>
          <footer>הופק במערכת אורגנו · גיא רוזנברג 2026</footer>
        </section>

        <section className="report-page overview-report">
          <div className="page-title"><Activity /><div><small>EXECUTIVE SUMMARY</small><h2>תמונת מצב ניהולית</h2></div></div>
          <div className="score-grid">
            <article><Globe2 /><span>SEO</span><b>{result.scores.seo}</b></article>
            <article><Bot /><span>GEO</span><b>{result.scores.geo}</b></article>
            <article><Target /><span>AEO</span><b>{result.scores.aeo}</b></article>
            <article><Gauge /><span>ביצועים</span><b>{result.scores.performance}</b></article>
          </div>
          <div className="executive-copy"><h3>{statusText(result.scores.overall)}</h3><p>בבדיקה נמצאו <b>{strengths.length}</b> נקודות חוזק מרכזיות ו-<b>{issues.length}</b> נושאים מרכזיים לשיפור. הדו״ח מפריד בין מה שעובד היטב, מה שאינו תקין ומה מומלץ לבצע קודם.</p></div>
          <div className="site-screenshot-block">
            <div className="section-heading"><ImageIcon /><div><small>VISUAL EVIDENCE</small><h3>צילום דף הכניסה שנבדק</h3></div></div>
            {monitor?.screenshot ? <img src={monitor.screenshot} alt={`צילום האתר ${monitor.title || host(result.finalUrl)}`} /> : <div className="screenshot-placeholder"><LoaderCircle /><p>צילום האתר לא היה זמין בזמן הפקת הדו״ח.</p></div>}
            <div className="screenshot-meta"><span>מקור: {monitor?.screenshotSource || "לא זמין"}</span><span>HTTP: {monitor?.statusCode || result.response.status || "-"}</span><span>זמן תגובה: {monitor?.responseTimeMs ? `${monitor.responseTimeMs}ms` : `${result.durationMs}ms`}</span></div>
          </div>
        </section>

        <section className="report-page findings-page">
          <div className="page-title"><CheckCircle2 /><div><small>WHAT WORKS</small><h2>מה עובד טוב באתר</h2></div></div>
          <div className="finding-cards good">{strengths.length ? strengths.map((check) => <article key={check.id}><CheckCircle2 /><div><span>{categoryNames[check.category]} · {check.score}/100</span><h3>{check.title}</h3><p>{check.finding}</p></div></article>) : <p>לא נמצאו בדיקות שקיבלו סטטוס תקין מלא.</p>}</div>
        </section>

        <section className="report-page findings-page">
          <div className="page-title"><CircleAlert /><div><small>RISKS AND GAPS</small><h2>מה אינו תקין ומה דורש טיפול</h2></div></div>
          <div className="finding-cards bad">{issues.map((check) => <article key={check.id}><CircleAlert /><div><span>{priorityNames[check.priority]} · {categoryNames[check.category]} · {check.score}/100</span><h3>{check.title}</h3><p>{check.finding}</p><b>מה לעשות: {check.recommendation}</b></div></article>)}</div>
        </section>

        <section className="report-page evidence-page">
          <div className="page-title"><TrendingUp /><div><small>INSIGHT SCREENSHOTS</small><h2>צילומי מסך של התובנות המרכזיות</h2></div></div>
          <p className="page-intro">כל צילום מרכז ממצא, ציון והמלצה בצורה חזותית שניתן להציג ללקוח או לצוות הפיתוח.</p>
          <div className="evidence-grid">{visualEvidence.map(({ check, image }) => <figure key={check.id}><img src={image} alt={`תובנת אורגנו: ${check.title}`} /><figcaption>{check.title}</figcaption></figure>)}</div>
        </section>

        <section className="report-page action-page">
          <div className="page-title"><Download /><div><small>ACTION PLAN</small><h2>תוכנית שיפור לפי סדר עדיפויות</h2></div></div>
          <div className="action-list">{issues.map((check, index) => <article key={check.id}><span>{index + 1}</span><div><small>{priorityNames[check.priority]} · {categoryNames[check.category]}</small><h3>{check.title}</h3><p>{check.recommendation}</p></div></article>)}</div>
          <div className="additional-tips"><h3>תוספות כדאיות לאתר</h3><ul><li>חיבור Google Search Console ו-GA4 למדידת תוצאות לפני ואחרי התיקונים.</li><li>הוספת מקרי בוחן, מקורות, מחברים מזוהים ותאריך עדכון לתכנים חשובים.</li><li>מיפוי שאלות אמיתיות של לקוחות ויצירת תשובות קצרות וברורות בראש כל מקטע.</li><li>בדיקת מתחרים, פערי תוכן, קישורים פנימיים ועמודים חסרים.</li><li>סריקה חוזרת לאחר יישום כדי להוכיח את השיפור ללקוח.</li></ul></div>
          <footer className="final-footer"><div><Leaf /><b>אורגנו</b></div><p>הדו״ח מבוסס על הסריקה שבוצעה במועד המצוין. מומלץ לאמת שינויים מול נתוני אמת ויעדי העסק.</p></footer>
        </section>
      </div>
    </main>
  );
}
