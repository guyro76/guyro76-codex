"use client";

import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Bot,
  Building2,
  Check,
  CheckCircle2,
  CircleAlert,
  ClipboardList,
  Copy,
  Download,
  Eye,
  FileDown,
  Gauge,
  Globe2,
  History,
  LayoutDashboard,
  Leaf,
  Lightbulb,
  LoaderCircle,
  RefreshCw,
  Search,
  Send,
  Share2,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  WandSparkles,
  XCircle,
  Zap,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import type { AnalysisCheck, AnalysisResult, Category, GenerateRequest } from "@/types/analyze";

type Tab = "overview" | "scan" | "report" | "actions" | "studio" | "history";
type SavedScan = {
  id: string;
  url: string;
  score: number;
  date: string;
  clientName?: string;
  result?: AnalysisResult;
};
type ProjectProfile = {
  clientName: string;
  businessType: string;
  primaryGoal: string;
  competitors: string;
};

type ReportTip = {
  title: string;
  text: string;
  kind: "growth" | "trust" | "content" | "technical";
};

const categories: Category[] = ["SEO", "GEO", "AEO", "Performance"];
const categoryNames: Record<Category, string> = {
  SEO: "SEO",
  GEO: "GEO",
  AEO: "AEO",
  Performance: "ביצועים",
};
const scoreKeys = { SEO: "seo", GEO: "geo", AEO: "aeo", Performance: "performance" } as const;
const sourceNames: Record<AnalysisResult["response"]["source"], string> = {
  direct: "קריאה ישירה",
  "browser-retry": "ניסיון דפדפן",
  reader: "Reader מרונדר",
  proxy: "Proxy ציבורי",
  pagespeed: "Google Lighthouse",
  blocked: "האתר חסם את מקורות הבדיקה",
};
const priorityRank = { critical: 0, high: 1, medium: 2, opportunity: 3 } as const;
const priorityName = { critical: "קריטי", high: "גבוה", medium: "בינוני", opportunity: "הזדמנות" } as const;
const defaultProfile: ProjectProfile = {
  clientName: "",
  businessType: "",
  primaryGoal: "הגדלת תנועה אורגנית ולידים",
  competitors: "",
};

function limitedMessage(result: AnalysisResult) {
  if (result.response.source === "blocked") {
    return "האתר חסם את מקורות הקריאה החיצוניים. מוצג דו״ח חסימה מעשי בלבד, ללא בדיקת HTML, תוכן או ביצועים מלאה.";
  }
  if (result.response.source === "pagespeed") {
    return "האתר חסם סריקה ישירה. מוצג דו״ח מוגבל המבוסס על Google Lighthouse, ולכן בדיקות התוכן, GEO ו-AEO חלקיות.";
  }
  return "האתר חסם סריקה ישירה. אורגנו הפעילה מקור קריאה חלופי. חלק מבדיקות השרת, התוכן או הביצועים עשויות להיות מוגבלות.";
}

function safeHostname(value: string) {
  try {
    return new URL(value).hostname;
  } catch {
    return value;
  }
}

function healthLabel(score: number) {
  if (score >= 85) return "מצב מצוין";
  if (score >= 70) return "בסיס טוב עם הזדמנויות";
  if (score >= 50) return "נדרשת תוכנית שיפור";
  return "נדרשת התערבות דחופה";
}

function resultKey(result: AnalysisResult) {
  return `${result.finalUrl}|${result.fetchedAt}`;
}

function extraTips(result: AnalysisResult): ReportTip[] {
  const tips: ReportTip[] = [];
  const checks = new Map(result.checks.map((check) => [check.id, check]));
  if ((checks.get("entity")?.score ?? 100) < 80) {
    tips.push({ title: "חיזוק זהות המותג", text: "הוסיפו עמוד אודות מלא, פרטי קשר עקביים, מחברים מזוהים ו-Organization או LocalBusiness Schema.", kind: "trust" });
  }
  if ((checks.get("evidence")?.score ?? 100) < 80) {
    tips.push({ title: "מקורות והוכחות", text: "שלבו נתונים ממקורות ראשוניים, מקרי בוחן, המלצות לקוחות, תאריכי עדכון והפניות למקורות אמינים.", kind: "trust" });
  }
  if ((checks.get("answers")?.score ?? 100) < 80 || (checks.get("questions")?.score ?? 100) < 80) {
    tips.push({ title: "אשכול שאלות ותשובות", text: "בנו שאלות אמיתיות של לקוחות. מיד לאחר כל שאלה תנו תשובה קצרה של 2 עד 4 משפטים ואז הרחבה.", kind: "content" });
  }
  if (result.snapshot.wordCount < 500) {
    tips.push({ title: "עומק ותועלת", text: "הרחיבו את העמוד עם דוגמאות, השוואות, תהליך עבודה, יתרונות וחסרונות, מחירים או טווחים כאשר הדבר אפשרי.", kind: "content" });
  }
  if (!result.crawlability.sitemapFound) {
    tips.push({ title: "מפת אתר תקינה", text: "צרו Sitemap XML, כללו בו רק כתובות קנוניות שניתנות לאינדוקס והצהירו עליו בתוך robots.txt.", kind: "technical" });
  }
  if (!result.snapshot.schemaTypes.length) {
    tips.push({ title: "נתונים מובנים", text: "הוסיפו JSON-LD שתואם לתוכן הגלוי: Organization, WebSite, BreadcrumbList וסוג העמוד הרלוונטי.", kind: "technical" });
  }
  if (result.scores.performance < 75) {
    tips.push({ title: "חוויית משתמש ומהירות", text: "בדקו Core Web Vitals, תמונת Hero, JavaScript צד שלישי, פונטים, caching ומידות תמונות.", kind: "growth" });
  }
  tips.push({ title: "מדידה לאורך זמן", text: "חברו Search Console ו-GA4, הגדירו המרות והשוו את התוצאות לפני ואחרי כל תיקון משמעותי.", kind: "growth" });
  tips.push({ title: "יתרון תחרותי", text: "השוו מול 3 עד 5 מתחרים מובילים ובדקו אילו שאלות, הוכחות, שירותים ועמודים חסרים באתר.", kind: "growth" });
  return tips.slice(0, 8);
}

function reportText(result: AnalysisResult, profile: ProjectProfile) {
  const good = result.checks.filter((check) => check.status === "pass").slice(0, 5);
  const issues = result.checks
    .filter((check) => check.status !== "pass")
    .sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority] || b.weight - a.weight)
    .slice(0, 5);
  const client = profile.clientName.trim() || safeHostname(result.finalUrl);
  const lines = [
    `דו״ח אורגנו עבור ${client}`,
    result.finalUrl,
    `ציון כולל: ${result.scores.overall}/100 - ${healthLabel(result.scores.overall)}`,
    `SEO ${result.scores.seo} | GEO ${result.scores.geo} | AEO ${result.scores.aeo} | ביצועים ${result.scores.performance}`,
    "",
    "מה עובד טוב:",
    ...good.map((check) => `✓ ${check.title}: ${check.finding}`),
    "",
    "מה דורש טיפול:",
    ...issues.map((check) => `• ${check.title}: ${check.finding}`),
    "",
    "הפעולות הראשונות המומלצות:",
    ...issues.slice(0, 3).map((check, index) => `${index + 1}. ${check.recommendation}`),
    "",
    "הדו״ח המלא הופק במערכת אורגנו - SEO, GEO ו-AEO.",
  ];
  return lines.join("\n");
}

function loadJson<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

export default function Home() {
  const [tab, setTab] = useState<Tab>("overview");
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [saved, setSaved] = useState<SavedScan[]>([]);
  const [generated, setGenerated] = useState("");
  const [copy, setCopy] = useState(false);
  const [generationMode, setGenerationMode] = useState<"ai" | "template" | "">("");
  const [backend, setBackend] = useState("בודק חיבור נתונים...");
  const [profile, setProfile] = useState<ProjectProfile>(defaultProfile);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const reportRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState<GenerateRequest>({
    type: "article",
    keyword: "",
    audience: "",
    tone: "מקצועי וברור",
    language: "עברית",
    analysis: null,
  });

  useEffect(() => {
    const localScans = loadJson<SavedScan[]>("organo-history-v2", []);
    const legacy = loadJson<Array<{ url: string; score: number; date: string }>>("organo-history", []);
    const migrated: SavedScan[] = legacy.map((scan) => ({ id: `${scan.url}|${scan.date}`, ...scan }));
    setSaved(localScans.length ? localScans : migrated);
    setProfile(loadJson<ProjectProfile>("organo-project-profile", defaultProfile));
    setCompletedTasks(loadJson<string[]>("organo-completed-tasks", []));

    const session = localStorage.getItem("organo-session") || crypto.randomUUID();
    localStorage.setItem("organo-session", session);
    fetch("/api/status")
      .then((response) => response.json())
      .then(async (data) => {
        const connected = Boolean(data?.supabase?.connected);
        setBackend(connected ? "Supabase מחובר" : "שמירה מקומית פעילה");
        if (!connected) return;
        const response = await fetch(`/api/history?sessionId=${encodeURIComponent(session)}`);
        const history = await response.json();
        const cloud: SavedScan[] = (history.items || []).map((item: {
          id: string;
          final_url?: string;
          url: string;
          overall_score: number;
          created_at: string;
          result?: AnalysisResult;
        }) => ({
          id: item.id,
          url: item.final_url || item.url,
          score: item.overall_score,
          date: item.created_at,
          result: item.result,
        }));
        const existing = loadJson<SavedScan[]>("organo-history-v2", []);
        const combined = [...cloud, ...existing].filter((item, index, all) => all.findIndex((entry) => entry.id === item.id) === index).slice(0, 30);
        setSaved(combined);
        localStorage.setItem("organo-history-v2", JSON.stringify(combined));
      })
      .catch(() => setBackend("שמירה מקומית פעילה"));
  }, []);

  useEffect(() => {
    localStorage.setItem("organo-project-profile", JSON.stringify(profile));
  }, [profile]);

  const goodChecks = useMemo(
    () => result?.checks.filter((check) => check.status === "pass").sort((a, b) => b.weight - a.weight) ?? [],
    [result],
  );
  const issueChecks = useMemo(
    () => result?.checks
      .filter((check) => check.status !== "pass")
      .sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority] || b.weight - a.weight) ?? [],
    [result],
  );
  const reportTips = useMemo(() => result ? extraTips(result) : [], [result]);
  const averageScore = useMemo(() => saved.length ? Math.round(saved.reduce((sum, scan) => sum + scan.score, 0) / saved.length) : 0, [saved]);
  const bestScore = useMemo(() => saved.length ? Math.max(...saved.map((scan) => scan.score)) : 0, [saved]);
  const completedCount = useMemo(() => issueChecks.filter((check) => completedTasks.includes(`${resultKey(result!)}|${check.id}`)).length, [completedTasks, issueChecks, result]);

  function persistHistory(list: SavedScan[]) {
    const trimmed = list.slice(0, 30);
    setSaved(trimmed);
    try {
      localStorage.setItem("organo-history-v2", JSON.stringify(trimmed));
    } catch {
      const withoutResults = trimmed.map(({ result: _result, ...scan }) => scan);
      localStorage.setItem("organo-history-v2", JSON.stringify(withoutResults));
    }
  }

  async function scan(event?: FormEvent) {
    event?.preventDefault();
    if (!url.trim()) {
      setError("יש להזין כתובת אתר");
      return;
    }
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const session = localStorage.getItem("organo-session") || crypto.randomUUID();
      localStorage.setItem("organo-session", session);
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url, sessionId: session }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      const analyzed = data as AnalysisResult;
      setResult(analyzed);
      setForm((current) => ({ ...current, analysis: analyzed, keyword: analyzed.topKeywords.slice(0, 3).join(" ") }));
      const entry: SavedScan = {
        id: crypto.randomUUID(),
        url: analyzed.finalUrl,
        score: analyzed.scores.overall,
        date: analyzed.fetchedAt,
        clientName: profile.clientName || undefined,
        result: analyzed,
      };
      persistHistory([entry, ...saved]);
      setTab("report");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "הניתוח נכשל");
    } finally {
      setBusy(false);
    }
  }

  async function generate() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...form, analysis: result }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setGenerated(data.text);
      setGenerationMode(data.mode || "template");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "יצירת התוכן נכשלה");
    } finally {
      setBusy(false);
    }
  }

  async function copyText(text: string) {
    await navigator.clipboard.writeText(text);
    setCopy(true);
    setTimeout(() => setCopy(false), 1400);
  }

  function openSaved(scanItem: SavedScan) {
    if (scanItem.result) {
      setResult(scanItem.result);
      setUrl(scanItem.url);
      setForm((current) => ({ ...current, analysis: scanItem.result ?? null, keyword: scanItem.result?.topKeywords.slice(0, 3).join(" ") ?? "" }));
      if (scanItem.clientName) setProfile((current) => ({ ...current, clientName: scanItem.clientName || current.clientName }));
      setTab("report");
      setNotice("הדו״ח ההיסטורי נטען בהצלחה.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setUrl(scanItem.url);
    setTab("scan");
    setNotice("הסריקה הישנה נשמרה ללא פירוט מלא. הכתובת נטענה לסריקה חוזרת.");
  }

  function toggleTask(check: AnalysisCheck) {
    if (!result) return;
    const key = `${resultKey(result)}|${check.id}`;
    const next = completedTasks.includes(key) ? completedTasks.filter((item) => item !== key) : [...completedTasks, key];
    setCompletedTasks(next);
    localStorage.setItem("organo-completed-tasks", JSON.stringify(next));
  }

  async function createPdfBlob() {
    if (!reportRef.current || !result) throw new Error("אין דו״ח זמין להפקה");
    const node = reportRef.current;
    setExporting(true);
    node.classList.add("pdf-mode");
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import("html2canvas"), import("jspdf")]);
      const canvas = await html2canvas(node, {
        scale: Math.min(1.65, window.devicePixelRatio || 1.4),
        backgroundColor: "#06170f",
        useCORS: true,
        logging: false,
        windowWidth: Math.max(node.scrollWidth, 1180),
      });
      const image = canvas.toDataURL("image/jpeg", 0.94);
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 7;
      const width = pageWidth - margin * 2;
      const height = (canvas.height * width) / canvas.width;
      let position = margin;
      pdf.addImage(image, "JPEG", margin, position, width, height, undefined, "FAST");
      let remaining = height - (pageHeight - margin * 2);
      while (remaining > 0) {
        pdf.addPage();
        position = margin - (height - remaining);
        pdf.addImage(image, "JPEG", margin, position, width, height, undefined, "FAST");
        remaining -= pageHeight - margin * 2;
      }
      const host = safeHostname(result.finalUrl).replace(/[^a-zA-Z0-9.-]/g, "-");
      return { blob: pdf.output("blob"), fileName: `organo-report-${host}-${result.fetchedAt.slice(0, 10)}.pdf` };
    } finally {
      node.classList.remove("pdf-mode");
      setExporting(false);
    }
  }

  async function downloadPdf() {
    try {
      const { blob, fileName } = await createPdfBlob();
      const href = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = href;
      anchor.download = fileName;
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(href), 1200);
      setNotice("דו״ח ה-PDF הופק והורד בהצלחה.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "הפקת ה-PDF נכשלה");
    }
  }

  async function shareReport() {
    if (!result) return;
    const text = reportText(result, profile);
    try {
      const { blob, fileName } = await createPdfBlob();
      const file = new File([blob], fileName, { type: "application/pdf" });
      const shareNavigator = navigator as Navigator & { canShare?: (data?: ShareData) => boolean };
      if (navigator.share && shareNavigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: `דו״ח אורגנו - ${profile.clientName || safeHostname(result.finalUrl)}`, text, files: [file] });
        setNotice("הדו״ח נפתח לשיתוף. ניתן לבחור WhatsApp ולשלוח אותו ללקוח.");
        return;
      }
      const href = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = href;
      anchor.download = fileName;
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(href), 1200);
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
      setNotice("ה-PDF הורד וחלון WhatsApp נפתח עם סיכום מוכן. צרפו את הקובץ שהורד להודעה.");
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === "AbortError") return;
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
      setNotice("WhatsApp נפתח עם סיכום הדו״ח המוכן לשליחה.");
    }
  }

  const currentClient = profile.clientName.trim() || (result ? safeHostname(result.finalUrl) : "הפרויקט הנוכחי");

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span><Leaf aria-hidden="true" /></span>
          <div><b>אורגנו</b><small>Organic Growth OS</small></div>
        </div>
        <div className="project-chip"><Building2 aria-hidden="true" /><div><small>פרויקט פעיל</small><b>{profile.clientName || "טרם הוגדר לקוח"}</b></div></div>
        <nav aria-label="ניווט במערכת">
          <button className={tab === "overview" ? "on" : ""} onClick={() => setTab("overview")}><LayoutDashboard aria-hidden="true" />מרכז שליטה</button>
          <button className={tab === "scan" ? "on" : ""} onClick={() => setTab("scan")}><Search aria-hidden="true" />ניתוח אתר</button>
          <button disabled={!result} className={tab === "report" ? "on" : ""} onClick={() => setTab("report")}><Activity aria-hidden="true" />דו״ח מנהלים</button>
          <button disabled={!result} className={tab === "actions" ? "on" : ""} onClick={() => setTab("actions")}><ClipboardList aria-hidden="true" />תוכנית עבודה</button>
          <button className={tab === "studio" ? "on" : ""} onClick={() => setTab("studio")}><WandSparkles aria-hidden="true" />סטודיו תוכן</button>
          <button className={tab === "history" ? "on" : ""} onClick={() => setTab("history")}><History aria-hidden="true" />היסטוריה</button>
        </nav>
        <div className="tip"><Sparkles aria-hidden="true" /><b>Organo Intelligence</b><p>אבחון, סדר עדיפויות, תוכן ודוח לקוח במקום אחד.</p></div>
        <small className="status"><i /> Vercel פעיל · {backend}</small>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div><small>מערכת צמיחה אורגנית לסוכנויות ועסקים</small><h1>SEO, GEO ו-AEO במערכת הפעלה אחת</h1></div>
          <span><ShieldCheck aria-hidden="true" /> סריקה מאובטחת ומוגנת SSRF</span>
        </header>

        {error && <div className="message error" role="alert"><CircleAlert aria-hidden="true" />{error}</div>}
        {notice && <div className="message notice" role="status"><CheckCircle2 aria-hidden="true" />{notice}<button onClick={() => setNotice("")}>סגור</button></div>}

        {tab === "overview" && (
          <section className="overview-page">
            <div className="welcome glass">
              <div>
                <span className="eyebrow"><Zap aria-hidden="true" /> ORGANO AI WORKSPACE 2026</span>
                <h2>מבדיקה חד פעמית<br />למערכת צמיחה מתמשכת</h2>
                <p>נהלו את פרטי הלקוח, סרקו אתר, הפכו ממצאים לתוכנית עבודה והפיקו דו״ח PDF מקצועי לשליחה.</p>
                <div className="welcome-actions"><button className="primary" onClick={() => setTab("scan")}><Search />התחל ניתוח חדש</button>{result && <button className="secondary" onClick={() => setTab("report")}><Eye />צפה בדו״ח האחרון</button>}</div>
              </div>
              <div className="ai-orbit" aria-hidden="true"><div className="core"><Leaf /></div><i className="orbit-one" /><i className="orbit-two" /><span>SEO</span><span>GEO</span><span>AEO</span></div>
            </div>

            <div className="kpi-grid">
              <article className="glass kpi"><History /><div><small>סריקות שמורות</small><b>{saved.length}</b><p>עד 30 דו״חות אחרונים</p></div></article>
              <article className="glass kpi"><BarChart3 /><div><small>ממוצע אורגנו</small><b>{averageScore || "-"}</b><p>ממוצע כל הסריקות</p></div></article>
              <article className="glass kpi"><TrendingUp /><div><small>ציון שיא</small><b>{bestScore || "-"}</b><p>התוצאה הטובה ביותר</p></div></article>
              <article className="glass kpi"><ClipboardList /><div><small>משימות פתוחות</small><b>{issueChecks.length ? Math.max(issueChecks.length - completedCount, 0) : "-"}</b><p>{completedCount} הושלמו בדו״ח הפעיל</p></div></article>
            </div>

            <div className="overview-grid">
              <article className="glass profile-card">
                <div className="card-title"><Building2 /><div><small>פרופיל לקוח ופרויקט</small><h3>הקשר עסקי לדו״ח מדויק</h3></div></div>
                <div className="profile-form">
                  <label>שם לקוח או מותג<input value={profile.clientName} onChange={(event) => setProfile({ ...profile, clientName: event.target.value })} placeholder="לדוגמה: קליניקת אור" /></label>
                  <label>תחום פעילות<input value={profile.businessType} onChange={(event) => setProfile({ ...profile, businessType: event.target.value })} placeholder="לדוגמה: רפואה פרטית" /></label>
                  <label>מטרה מרכזית<input value={profile.primaryGoal} onChange={(event) => setProfile({ ...profile, primaryGoal: event.target.value })} /></label>
                  <label>מתחרים עיקריים<input value={profile.competitors} onChange={(event) => setProfile({ ...profile, competitors: event.target.value })} placeholder="דומיינים או שמות, מופרדים בפסיק" /></label>
                </div>
                <small className="saved-label"><Check /> נשמר אוטומטית בדפדפן</small>
              </article>

              <article className="glass latest-card">
                <div className="card-title"><Activity /><div><small>תמונת מצב</small><h3>{result ? currentClient : "לא בוצעה סריקה במפגש זה"}</h3></div></div>
                {result ? <>
                  <div className="latest-score"><strong>{result.scores.overall}</strong><div><b>{healthLabel(result.scores.overall)}</b><span>{new Date(result.fetchedAt).toLocaleString("he-IL")}</span></div></div>
                  <div className="mini-bars">{categories.map((category) => <div key={category}><span>{categoryNames[category]}</span><i><em style={{ width: `${result.scores[scoreKeys[category]]}%` }} /></i><b>{result.scores[scoreKeys[category]]}</b></div>)}</div>
                  <button className="text-action" onClick={() => setTab("report")}>פתח דו״ח מלא <ArrowUpRight /></button>
                </> : <div className="empty-state"><Bot /><p>הזינו כתובת אתר וקבלו דו״ח מנהלים, המלצות ותוכנית עבודה.</p><button onClick={() => setTab("scan")}>עבור לניתוח אתר</button></div>}
              </article>
            </div>
          </section>
        )}

        {tab === "scan" && (
          <>
            <section className="hero glass">
              <div className="hero-copy">
                <span className="eyebrow"><Leaf aria-hidden="true" /> ניתוח 360° מוכוון תוצאות</span>
                <h2>האם האתר מובן לגוגל,<br />ללקוחות ולמנועי AI?</h2>
                <p>אורגנו בודקת תשתית טכנית, תוכן, ישויות, תשובות, סורקים וביצועים ומתרגמת הכול לפעולות ברורות.</p>
              </div>
              <form onSubmit={scan}>
                <div><Globe2 aria-hidden="true" /><input type="url" dir="ltr" aria-label="כתובת האתר לניתוח" autoComplete="url" spellCheck={false} value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://www.example.co.il" /></div>
                <button disabled={busy}>{busy ? <LoaderCircle className="spin" aria-hidden="true" /> : <Search aria-hidden="true" />} נתח SEO · GEO · AEO</button>
              </form>
              <div className="trust"><span><Check />robots ו-sitemap</span><span><Check />Schema וישויות</span><span><Check />סורקי AI</span><span><Check />תוכן ותשובות</span><span><Check />ביצועים</span></div>
            </section>
            <section className="features">
              {[
                [<Search key="s" />, "SEO טכני ותוכן", "אינדוקס, canonical, כותרות, קישורים, תמונות ותוכן"],
                [<Bot key="b" />, "GEO ו-AI Visibility", "ישות, מקורות, מחבר ונגישות למנועי AI"],
                [<Target key="t" />, "AEO ותשובות", "שאלות, תשובות קצרות, FAQ ומבנה לציטוט"],
                [<Gauge key="g" />, "חוויית משתמש", "זמן תגובה, HTML, תמונות וסקריפטים"],
              ].map((item, index) => <article className="glass" key={index}><span>{item[0]}</span><h3>{item[1]}</h3><p>{item[2]}</p></article>)}
            </section>
          </>
        )}

        {tab === "report" && result && (
          <div ref={reportRef} className="report-document">
            <section className="report-hero glass">
              <div className="report-heading"><span className="eyebrow"><Activity /> דו״ח מנהלים חכם</span><h2>{profile.clientName || result.snapshot.title || safeHostname(result.finalUrl)}</h2><p dir="ltr">{result.finalUrl}</p><small>הופק בתאריך {new Date(result.fetchedAt).toLocaleString("he-IL")} · {sourceNames[result.response.source]}</small></div>
              <div className="score-ring" style={{ "--score": `${result.scores.overall * 3.6}deg` } as React.CSSProperties}><div><b>{result.scores.overall}</b><span>ציון אורגנו</span></div></div>
              <div className="report-actions no-print"><button onClick={downloadPdf} disabled={exporting}><FileDown />{exporting ? "מפיק PDF..." : "הורד PDF"}</button><button onClick={shareReport} disabled={exporting}><Share2 />שתף ללקוח / WhatsApp</button><button onClick={() => setTab("actions")}><ClipboardList />תוכנית עבודה</button></div>
            </section>

            {result.response.limited && <div className="limited-notice"><b>בדיקה מוגבלת.</b> {limitedMessage(result)}</div>}

            <section className="executive-summary glass">
              <div><small>EXECUTIVE SUMMARY</small><h3>{healthLabel(result.scores.overall)}</h3><p>האתר קיבל ציון כולל של <b>{result.scores.overall}/100</b>. נמצאו <b>{goodChecks.length}</b> נקודות חזקות ו-<b>{issueChecks.length}</b> נושאים לטיפול. המטרה המרכזית שהוגדרה: {profile.primaryGoal || "שיפור הנראות האורגנית"}.</p></div>
              <div className="summary-pills"><span><CheckCircle2 />{goodChecks.length} תקינים</span><span><CircleAlert />{issueChecks.filter((check) => check.priority === "critical" || check.priority === "high").length} בעדיפות גבוהה</span><span><Lightbulb />{reportTips.length} תוספות מומלצות</span></div>
            </section>

            <section className="scores">{categories.map((category) => <article className="glass" key={category}><span>{categoryNames[category]}</span><b>{result.scores[scoreKeys[category]]}</b><i><em style={{ width: `${result.scores[scoreKeys[category]]}%` }} /></i><small>{result.scores[scoreKeys[category]] >= 80 ? "חזק" : result.scores[scoreKeys[category]] >= 60 ? "דורש שיפור" : "דורש טיפול"}</small></article>)}</section>

            <section className="report-columns">
              <article className="glass report-panel positive-panel">
                <div className="panel-heading"><CheckCircle2 /><div><small>מה עובד טוב</small><h3>נכסים שכדאי לשמר ולחזק</h3></div></div>
                <div className="finding-list">{goodChecks.length ? goodChecks.map((check) => <div className="finding positive" key={check.id}><Check /><div><b>{check.title}</b><p>{check.finding}</p><small>{categoryNames[check.category]} · {check.score}/100</small></div></div>) : <p className="muted">לא נמצאו בדיקות שקיבלו סטטוס תקין מלא.</p>}</div>
              </article>

              <article className="glass report-panel issue-panel">
                <div className="panel-heading"><XCircle /><div><small>מה לא תקין</small><h3>חסמים וסיכונים שנמצאו</h3></div></div>
                <div className="finding-list">{issueChecks.length ? issueChecks.map((check) => <div className={`finding issue ${check.priority}`} key={check.id}><CircleAlert /><div><div className="finding-top"><b>{check.title}</b><span>{priorityName[check.priority]}</span></div><p>{check.finding}</p><small>{categoryNames[check.category]} · {check.score}/100</small></div></div>) : <div className="all-good"><CheckCircle2 /><p>לא נמצאו בעיות משמעותיות בסריקה הנוכחית.</p></div>}</div>
              </article>
            </section>

            <section className="glass recommendations-panel">
              <div className="panel-heading"><ClipboardList /><div><small>מה לשפר</small><h3>תוכנית פעולה מסודרת לפי עדיפות</h3></div></div>
              <div className="recommendation-table"><div className="table-head"><span>עדיפות</span><span>נושא</span><span>פעולה מומלצת</span><span>השפעה</span></div>{issueChecks.map((check) => <div className="table-row" key={check.id}><span><i className={`priority-dot ${check.priority}`} />{priorityName[check.priority]}</span><b>{check.title}</b><p>{check.recommendation}</p><strong>{check.weight >= 10 ? "גבוהה" : check.weight >= 7 ? "בינונית" : "ממוקדת"}</strong></div>)}</div>
            </section>

            <section className="glass tips-panel">
              <div className="panel-heading"><Lightbulb /><div><small>הזדמנויות ותוספות כדאיות</small><h3>טיפים מעבר לתקלות שנמצאו</h3></div></div>
              <div className="tips-grid">{reportTips.map((tip, index) => <article key={`${tip.title}-${index}`} className={`tip-card ${tip.kind}`}><span>{String(index + 1).padStart(2, "0")}</span><h4>{tip.title}</h4><p>{tip.text}</p></article>)}</div>
            </section>

            <section className="report-details">
              <article className="glass facts-card"><h3><Bot /> נגישות לסורקים</h3><p>Googlebot <b>{result.crawlability.googlebot}</b></p><p>OAI-SearchBot <b>{result.crawlability.oaiSearchBot}</b></p><p>GPTBot <b>{result.crawlability.gptBot}</b></p><p>Sitemap <b>{result.crawlability.sitemapFound ? "נמצא" : "לא נמצא"}</b></p><p>אופן קריאה <b>{sourceNames[result.response.source]}</b></p></article>
              <article className="glass facts-card"><h3><Activity /> תמונת מצב</h3><div className="metrics"><span><b>{result.snapshot.wordCount}</b>מילים</span><span><b>{result.snapshot.h1.length}</b>H1</span><span><b>{result.snapshot.images}</b>תמונות</span><span><b>{result.snapshot.schemaTypes.length}</b>Schema</span><span><b>{result.snapshot.internalLinks}</b>קישורים פנימיים</span><span><b>{result.snapshot.answerBlocks}</b>תשובות ישירות</span></div></article>
              <article className="glass facts-card"><h3><TrendingUp /> יעד הפרויקט</h3><p className="project-goal">{profile.primaryGoal || "שיפור הנראות האורגנית"}</p><small>{profile.businessType && `תחום: ${profile.businessType}`}</small><small>{profile.competitors && `מתחרים: ${profile.competitors}`}</small></article>
            </section>

            <footer className="report-footer"><div><Leaf /><b>אורגנו</b><span>Organic Growth OS</span></div><p>הדו״ח מספק אבחון והמלצות מקצועיות. יש לאמת שינויים מול סביבת האתר, נתוני Search Console והיעדים העסקיים.</p></footer>
          </div>
        )}

        {tab === "actions" && result && (
          <section className="actions-page">
            <div className="section-head"><small>IMPACT × PRIORITY</small><h2>תוכנית העבודה של {currentClient}</h2><p>הפכו כל ממצא למשימה, סמנו ביצוע ובצעו סריקה חוזרת כדי לאמת שיפור.</p></div>
            <div className="progress-card glass"><div><b>{completedCount}/{issueChecks.length}</b><span>משימות שהושלמו</span></div><i><em style={{ width: `${issueChecks.length ? (completedCount / issueChecks.length) * 100 : 100}%` }} /></i><button onClick={() => { setTab("scan"); setUrl(result.finalUrl); }}><RefreshCw />סריקה חוזרת</button></div>
            <div className="task-list">{issueChecks.map((check, index) => {
              const taskKey = `${resultKey(result)}|${check.id}`;
              const done = completedTasks.includes(taskKey);
              return <article className={`glass task ${done ? "done" : ""}`} key={check.id}><button className="task-check" onClick={() => toggleTask(check)} aria-label={done ? "סמן כפתוח" : "סמן כהושלם"}>{done ? <CheckCircle2 /> : <span>{index + 1}</span>}</button><div><div className="task-meta"><span className={check.priority}>{priorityName[check.priority]}</span><small>{categoryNames[check.category]}</small></div><h3>{check.title}</h3><p>{check.finding}</p><b>לביצוע: {check.recommendation}</b></div><div className="task-impact"><small>השפעה</small><strong>{check.weight >= 10 ? "גבוהה" : check.weight >= 7 ? "בינונית" : "ממוקדת"}</strong><small>ביטחון</small><strong>{check.evidence ? "גבוה" : "סביר"}</strong></div></article>;
            })}</div>
          </section>
        )}

        {tab === "studio" && (
          <section>
            <div className="section-head"><small>AI CONTENT STUDIO</small><h2>הפכו את האבחון לתוכן מוכן</h2><p>התוכן נבנה לפי הדו״ח הפעיל, קהל היעד והטון המבוקש.</p></div>
            <div className="studio">
              <form className="glass" onSubmit={(event) => { event.preventDefault(); generate(); }}>
                <label>סוג תוכן<select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value as GenerateRequest["type"] })}><option value="article">Content Brief ומבנה מאמר</option><option value="faq">שאלות ותשובות</option><option value="meta">Title ו-Meta</option><option value="hero">Hero ו-CTA</option><option value="about">עמוד אודות</option><option value="schema">Schema</option></select></label>
                <label>נושא<input value={form.keyword} onChange={(event) => setForm({ ...form, keyword: event.target.value })} /></label>
                <label>קהל יעד<input value={form.audience} onChange={(event) => setForm({ ...form, audience: event.target.value })} placeholder="מי אמור לקרוא ולפעול?" /></label>
                <label>טון<input value={form.tone} onChange={(event) => setForm({ ...form, tone: event.target.value })} /></label>
                <button disabled={busy}><Sparkles />{busy ? "יוצר תוכן..." : "צור תוכן חכם"}</button>
              </form>
              <article className="glass output"><div><h3>התוצאה {generationMode && <small>· {generationMode === "ai" ? "נוצר באמצעות AI" : "נוצר מתבנית מקומית"}</small>}</h3>{generated && <button onClick={() => copyText(generated)}><Copy />{copy ? "הועתק" : "העתק"}</button>}</div>{generated ? <pre>{generated}</pre> : <div className="empty-output"><WandSparkles /><p>בחרו סוג תוכן והמערכת תיצור תוצר מוכן לעריכה ויישום.</p></div>}</article>
            </div>
            {result?.contentIdeas?.length ? <div className="ideas">{result.contentIdeas.map((idea, index) => <article className="glass" key={index}><small>{idea.type}</small><h3>{idea.title}</h3><p>{idea.reason}</p><pre>{idea.value}</pre><button onClick={() => copyText(idea.value)}><Copy /> העתק</button></article>)}</div> : null}
          </section>
        )}

        {tab === "history" && (
          <section>
            <div className="section-head history-head"><div><small>SCAN ARCHIVE</small><h2>היסטוריית סריקות ודוחות</h2><p>כל סריקה חדשה נשמרת עם התוצאות המלאות וניתנת לפתיחה, הורדה ושיתוף.</p></div><button className="primary" onClick={() => setTab("scan")}><Search />סריקה חדשה</button></div>
            <div className="history-list">{saved.length ? saved.map((scanItem) => <article className="glass history-item" key={scanItem.id}><div className="history-icon"><Globe2 /></div><div className="history-info"><div><h3>{scanItem.clientName || safeHostname(scanItem.url)}</h3><span className={scanItem.result ? "available" : "legacy"}>{scanItem.result ? "דו״ח מלא זמין" : "סריקה ישנה"}</span></div><p dir="ltr">{scanItem.url}</p><small>{new Date(scanItem.date).toLocaleString("he-IL")}</small></div><div className="history-score"><b>{scanItem.score}</b><span>/100</span></div><div className="history-actions"><button className="view" onClick={() => openSaved(scanItem)}><Eye />{scanItem.result ? "צפה בתוצאות" : "שחזר בסריקה"}</button><button onClick={() => { setUrl(scanItem.url); setTab("scan"); }}><RefreshCw />סרוק שוב</button></div></article>) : <article className="glass empty-state large"><History /><h3>עדיין אין סריקות</h3><p>הסריקה הראשונה תישמר כאן עם כפתור צפייה בדו״ח המלא.</p><button onClick={() => setTab("scan")}>התחל סריקה ראשונה</button></article>}</div>
          </section>
        )}

        <footer className="site-footer"><div>אורגנו · תוכנן ונבנה על ידי גיא רוזנברג 2026<div className="legal-links"><Link href="/about">אודות</Link><Link href="/privacy">פרטיות</Link><Link href="/accessibility">נגישות</Link><Link href="/security">אבטחה</Link><Link href="/terms">תנאי שימוש</Link></div></div></footer>
      </main>
    </div>
  );
}
