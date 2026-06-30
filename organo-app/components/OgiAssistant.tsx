"use client";

import { Bot, ChevronDown, Copy, Send, Sparkles, Volume2, VolumeX, X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { faqKnowledgeText, findFaqAnswer } from "@/lib/faq";
import type { AnalysisCheck, AnalysisResult } from "@/types/analyze";

type ChatMessage = { id: string; role: "user" | "assistant"; text: string };
type ProjectProfile = { clientName?: string; businessType?: string; primaryGoal?: string; competitors?: string };
type SavedScan = { date?: string; result?: AnalysisResult };
type BrowserLanguageSession = { prompt: (input: string) => Promise<string>; destroy?: () => void };
type BrowserLanguageModel = {
  availability?: () => Promise<string>;
  create: (options?: { systemPrompt?: string; temperature?: number; topK?: number }) => Promise<BrowserLanguageSession>;
};

declare global {
  interface Window {
    ai?: { languageModel?: BrowserLanguageModel };
    LanguageModel?: BrowserLanguageModel;
  }
}

const welcomeMessage: ChatMessage = {
  id: "welcome",
  role: "assistant",
  text: "היי, אני אוגי. אפשר לשאול אותי על הדו״ח, על אורגנו או לבקש ניסוח תוכן מקומי ללא חיובי API.",
};

const starterQuestions = [
  "מה שלוש הבעיות הכי חשובות בדו״ח?",
  "מה פירוש בדיקה מוגבלת?",
  "האם אוגי יוצר חיובי API?",
  "כתוב לי פתיח משופר לעמוד",
];

function safeParse<T>(key: string): T | null {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) as T : null;
  } catch {
    return null;
  }
}

function latestReport() {
  const active = safeParse<AnalysisResult>("organo-active-report");
  if (active) return active;
  const scans = safeParse<SavedScan[]>("organo-history-v2") || [];
  return scans
    .filter((scan) => scan.result)
    .sort((a, b) => new Date(b.date || b.result?.fetchedAt || 0).getTime() - new Date(a.date || a.result?.fetchedAt || 0).getTime())[0]?.result || null;
}

function priorityRank(priority: AnalysisCheck["priority"]) {
  return priority === "critical" ? 0 : priority === "high" ? 1 : priority === "medium" ? 2 : 3;
}

function buildReportContext(result: AnalysisResult | null, profile: ProjectProfile | null) {
  const faq = `\n\nמאגר שאלות נפוצות של אורגנו:\n${faqKnowledgeText}`;
  if (!result) return { text: `אין כרגע דו״ח פעיל במערכת.${faq}`, issues: [] as AnalysisCheck[], passes: [] as AnalysisCheck[] };

  const issues = result.checks
    .filter((check) => check.status !== "pass")
    .sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority) || b.weight - a.weight);
  const passes = result.checks.filter((check) => check.status === "pass").sort((a, b) => b.weight - a.weight);
  const client = profile?.clientName?.trim() || result.snapshot.title || result.finalUrl;

  return {
    issues,
    passes,
    text: [
      `לקוח: ${client}`,
      `תחום: ${profile?.businessType || "לא הוגדר"}`,
      `מטרה עסקית: ${profile?.primaryGoal || "לא הוגדרה"}`,
      `אתר: ${result.finalUrl}`,
      `ציון כולל: ${result.scores.overall}`,
      `SEO: ${result.scores.seo}, GEO: ${result.scores.geo}, AEO: ${result.scores.aeo}, ביצועים: ${result.scores.performance}`,
      `מקור הסריקה: ${result.response.source}, בדיקה מוגבלת: ${result.response.limited ? "כן" : "לא"}`,
      `כותרת: ${result.snapshot.title || "חסרה"}`,
      `תיאור: ${result.snapshot.description || "חסר"}`,
      `מילים: ${result.snapshot.wordCount}, H1: ${result.snapshot.h1.length}, H2: ${result.snapshot.h2.length}`,
      `Schema: ${result.snapshot.schemaTypes.join(", ") || "לא נמצא"}`,
      `Googlebot: ${result.crawlability.googlebot}, OAI-SearchBot: ${result.crawlability.oaiSearchBot}, GPTBot: ${result.crawlability.gptBot}`,
      "ממצאים הדורשים טיפול:",
      ...issues.slice(0, 16).map((check, index) => `${index + 1}. [${check.category}/${check.priority}] ${check.title}. נמצא: ${check.finding}. המלצה: ${check.recommendation}`),
      "נקודות חזקות:",
      ...passes.slice(0, 8).map((check) => `- ${check.title}: ${check.finding}`),
      faq,
    ].join("\n"),
  };
}

function formatChecks(checks: AnalysisCheck[], limit = 4) {
  return checks.slice(0, limit).map((check, index) =>
    `${index + 1}. ${check.title}\nמה נמצא: ${check.finding}\nמה לבצע: ${check.recommendation}`,
  ).join("\n\n");
}

function localContent(question: string, result: AnalysisResult, profile: ProjectProfile | null) {
  const topic = result.topKeywords.slice(0, 3).join(" ") || result.snapshot.h1[0] || result.snapshot.title || "השירות";
  const brand = profile?.clientName || result.snapshot.title.split(/[|\-–]/)[0]?.trim() || "המותג";
  const q = question.toLowerCase();
  if (q.includes("מטא") || q.includes("meta") || q.includes("title") || q.includes("כותרת")) {
    return `TITLE\n${topic} - מידע ופתרונות מקצועיים | ${brand}\n\nMETA DESCRIPTION\nמידע ברור ומעשי על ${topic}, תשובות לשאלות נפוצות וליווי מקצועי מבית ${brand}.`;
  }
  if (q.includes("faq") || q.includes("שאלות")) {
    return `## מהו ${topic}?\n${topic} הוא תחום שכדאי להבין באמצעות מידע ברור ודוגמאות.\n\n## למי זה מתאים?\nהפתרון מתאים ללקוחות המחפשים מענה מקצועי ומותאם.\n\n## איך מתחילים?\nמגדירים את הצורך, בוחנים אפשרויות ומקבלים המלצה מסודרת.\n\n## למה לבחור ב-${brand}?\nהוסיפו ניסיון, יתרון ייחודי, ביקורות ומקורות אמינים.`;
  }
  return `# ${topic} שעובד בשבילכם\n\n${brand} מרכז מידע ברור, פתרונות מעשיים וליווי מקצועי כדי לעזור לכם להבין את האפשרויות ולבחור נכון.\n\n**מה תקבלו?**\n- הסבר בגובה העיניים\n- התאמה לצורך\n- מידע שקוף\n- ליווי עד לקבלת החלטה\n\n**השלב הבא:** צרו קשר לקבלת מידע מותאם.`;
}

function fallbackAnswer(question: string, result: AnalysisResult | null, profile: ProjectProfile | null) {
  const faq = findFaqAnswer(question);
  if (faq) return `${faq.question}\n\n${faq.answer}`;
  if (!result) return "עדיין אין לי דו״ח פעיל. אפשר לשאול אותי על אורגנו וה-FAQ, או לבצע סריקה כדי לקבל תשובות על אתר מסוים.";

  const { issues, passes } = buildReportContext(result, profile);
  const q = question.toLowerCase();
  const category = q.includes("geo") ? "GEO" : q.includes("aeo") ? "AEO" : q.includes("ביצוע") || q.includes("מהירות") ? "Performance" : q.includes("seo") ? "SEO" : null;

  if (q.includes("כתוב") || q.includes("צור") || q.includes("נסח")) return localContent(question, result, profile);
  if (q.includes("ציון") || q.includes("מצב")) return `ציון אורגנו הוא ${result.scores.overall}/100. SEO ${result.scores.seo}, GEO ${result.scores.geo}, AEO ${result.scores.aeo}, ביצועים ${result.scores.performance}. נמצאו ${issues.length} נושאים לטיפול ו-${passes.length} בדיקות תקינות.`;
  if (q.includes("מה עובד") || q.includes("טוב") || q.includes("חוזק")) return passes.length ? `הנקודות החזקות:\n\n${formatChecks(passes, 5)}` : "לא נמצאו בדיקות שסומנו כתקינות.";
  if (q.includes("קודם") || q.includes("חשוב") || q.includes("דחוף") || q.includes("בעיה")) {
    const selected = category ? issues.filter((check) => check.category === category) : issues;
    return selected.length ? `אלה הפעולות שהייתי מבצע קודם:\n\n${formatChecks(selected, 4)}` : `לא נמצאו בעיות פתוחות ב-${category || "הדו״ח"}.`;
  }
  if (category) {
    const selected = issues.filter((check) => check.category === category);
    const score = category === "SEO" ? result.scores.seo : category === "GEO" ? result.scores.geo : category === "AEO" ? result.scores.aeo : result.scores.performance;
    return `ציון ${category} הוא ${score}/100.\n\n${selected.length ? formatChecks(selected, 5) : "לא נמצאו בעיות פתוחות בקטגוריה."}`;
  }
  return `מצאתי בדו״ח את המידע הבא:\n\n${formatChecks(issues, 4) || "לא נמצאו בעיות פתוחות בדו״ח."}`;
}

async function browserLocalAnswer(question: string, context: string) {
  const model = window.ai?.languageModel || window.LanguageModel;
  if (!model?.create) return null;
  try {
    const availability = model.availability ? await model.availability() : "available";
    if (["unavailable", "no", "unsupported"].includes(String(availability).toLowerCase())) return null;
    const session = await model.create({
      temperature: 0.2,
      topK: 20,
      systemPrompt: "אתה אוגי, העוזר המקומי של אורגנו. ענה בעברית ורק מהמידע שניתן. אל תמציא נתונים. תן פעולות וניסוחים קונקרטיים.",
    });
    const response = await session.prompt(`מידע מהמערכת:\n${context}\n\nשאלה או בקשת כתיבה: ${question}`);
    session.destroy?.();
    return response?.trim() || null;
  } catch {
    return null;
  }
}

export default function OgiAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);
  const [report, setReport] = useState<AnalysisResult | null>(null);
  const [profile, setProfile] = useState<ProjectProfile | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const conversationRef = useRef(0);
  const context = useMemo(() => buildReportContext(report, profile), [report, profile]);

  function refreshContext() {
    setReport(latestReport());
    setProfile(safeParse<ProjectProfile>("organo-project-profile"));
  }

  useEffect(() => {
    refreshContext();
    const timer = window.setInterval(refreshContext, 1500);
    window.addEventListener("organo-report-updated", refreshContext);
    window.addEventListener("storage", refreshContext);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("organo-report-updated", refreshContext);
      window.removeEventListener("storage", refreshContext);
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  function ensureAudio() {
    if (!audioRef.current) {
      const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) audioRef.current = new AudioContextClass();
    }
    if (audioRef.current?.state === "suspended") void audioRef.current.resume();
    return audioRef.current;
  }

  function playNotes(notes: Array<{ frequency: number; at: number; duration: number; volume: number }>) {
    if (!soundEnabled) return;
    const audio = ensureAudio();
    if (!audio) return;
    const start = audio.currentTime + 0.015;
    for (const note of notes) {
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.frequency.setValueAtTime(note.frequency, start + note.at);
      gain.gain.setValueAtTime(0.0001, start + note.at);
      gain.gain.exponentialRampToValueAtTime(note.volume, start + note.at + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + note.at + note.duration);
      oscillator.connect(gain);
      gain.connect(audio.destination);
      oscillator.start(start + note.at);
      oscillator.stop(start + note.at + note.duration + 0.02);
    }
  }

  function toggleOpen() {
    setOpen((current) => {
      const next = !current;
      conversationRef.current += 1;
      if (next) {
        setMessages([welcomeMessage]);
        setInput("");
        setBusy(false);
        refreshContext();
        playNotes([
          { frequency: 440, at: 0, duration: 0.11, volume: 0.07 },
          { frequency: 660, at: 0.1, duration: 0.13, volume: 0.08 },
          { frequency: 880, at: 0.2, duration: 0.16, volume: 0.07 },
        ]);
      }
      return next;
    });
  }

  async function ask(question: string) {
    const clean = question.trim();
    if (!clean || busy) return;
    const conversationId = conversationRef.current;
    ensureAudio();
    setInput("");
    setMessages((current) => [...current, { id: crypto.randomUUID(), role: "user", text: clean }]);
    setBusy(true);

    const aiAnswer = await browserLocalAnswer(clean, context.text);
    if (conversationId !== conversationRef.current) return;
    const answer = aiAnswer || fallbackAnswer(clean, report, profile);
    setMessages((current) => [...current, { id: crypto.randomUUID(), role: "assistant", text: answer }]);
    setBusy(false);
    playNotes([
      { frequency: 784, at: 0, duration: 0.12, volume: 0.07 },
      { frequency: 988, at: 0.13, duration: 0.18, volume: 0.08 },
    ]);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    void ask(input);
  }

  return (
    <div className={`ogi-assistant ${open ? "is-open" : ""}`}>
      {open && (
        <section className="ogi-panel" role="dialog" aria-label="אוגי - עוזר AI מקומי" aria-modal="false">
          <header className="ogi-header">
            <div className="ogi-mini-robot" aria-hidden="true"><i className="ogi-antenna" /><span className="ogi-eye left" /><span className="ogi-eye right" /><b /></div>
            <div><strong>אוגי</strong><small><i /> AI מקומי · ללא חיובי API</small></div>
            <button className="ogi-icon-button" onClick={() => setSoundEnabled((value) => !value)} aria-label={soundEnabled ? "השתק צלילים" : "הפעל צלילים"}>{soundEnabled ? <Volume2 /> : <VolumeX />}</button>
            <button className="ogi-icon-button" onClick={toggleOpen} aria-label="סגור את אוגי"><X /></button>
          </header>
          <div className="ogi-context-status"><Sparkles aria-hidden="true" />{report ? `מחובר לדו״ח של ${profile?.clientName || report.snapshot.title || report.finalUrl}` : "מוכן לענות על שאלות נפוצות של אורגנו"}</div>
          <div className="ogi-messages" ref={scrollRef} aria-live="polite">
            {messages.map((message) => (
              <article key={message.id} className={`ogi-message ${message.role}`}>
                {message.role === "assistant" && <Bot aria-hidden="true" />}
                <div><p>{message.text}</p>{message.role === "assistant" && message.id !== "welcome" && <button onClick={() => navigator.clipboard.writeText(message.text)}><Copy /> העתק תשובה</button>}</div>
              </article>
            ))}
            {busy && <article className="ogi-message assistant ogi-thinking"><Bot /><div><p><span /><span /><span /> אוגי בודק את המידע המקומי...</p></div></article>}
          </div>
          {!messages.some((message) => message.role === "user") && <div className="ogi-suggestions">{starterQuestions.map((question) => <button key={question} onClick={() => void ask(question)}>{question}</button>)}</div>}
          <form className="ogi-form" onSubmit={submit}><input value={input} onChange={(event) => setInput(event.target.value)} placeholder="שאל את אוגי על הדו״ח או על אורגנו..." aria-label="שאלה לאוגי" /><button type="submit" disabled={busy || !input.trim()} aria-label="שלח שאלה"><Send /></button></form>
          <p className="ogi-disclaimer">בכל פתיחה חדשה השיחה מתאפסת. אוגי פועל מקומית ויש לבדוק תוכן והמלצות לפני פרסום.</p>
        </section>
      )}
      <button className="ogi-launcher" onClick={toggleOpen} aria-expanded={open} aria-label={open ? "סגור את אוגי" : "פתח את אוגי"}>
        <span className="ogi-robot" aria-hidden="true"><i className="ogi-antenna" /><span className="ogi-ear left" /><span className="ogi-ear right" /><span className="ogi-eye left" /><span className="ogi-eye right" /><b /></span>
        <span className="ogi-label"><strong>אוגי</strong><small>שאל אותי</small></span>
        {open ? <ChevronDown className="ogi-chevron" /> : <span className="ogi-online-dot" />}
      </button>
    </div>
  );
}
