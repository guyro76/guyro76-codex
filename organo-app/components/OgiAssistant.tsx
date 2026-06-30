"use client";

import { Bot, ChevronDown, Copy, Send, Sparkles, Volume2, VolumeX, X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import type { AnalysisCheck, AnalysisResult } from "@/types/analyze";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

type ProjectProfile = {
  clientName?: string;
  businessType?: string;
  primaryGoal?: string;
  competitors?: string;
};

type BrowserLanguageSession = {
  prompt: (input: string) => Promise<string>;
  destroy?: () => void;
};

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

const starterQuestions = [
  "מה שלוש הבעיות הכי חשובות בדו״ח?",
  "מה כדאי לתקן קודם?",
  "איך אפשר לשפר את ציון ה-GEO?",
  "איזה תוכן כדאי להוסיף לאתר?",
];

function safeParse<T>(key: string): T | null {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) as T : null;
  } catch {
    return null;
  }
}

function priorityRank(priority: AnalysisCheck["priority"]) {
  return priority === "critical" ? 0 : priority === "high" ? 1 : priority === "medium" ? 2 : 3;
}

function buildReportContext(result: AnalysisResult | null, profile: ProjectProfile | null) {
  if (!result) {
    return {
      text: "אין כרגע דו״ח פעיל במערכת.",
      issues: [] as AnalysisCheck[],
      passes: [] as AnalysisCheck[],
    };
  }

  const issues = result.checks
    .filter((check) => check.status !== "pass")
    .sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority) || b.weight - a.weight);
  const passes = result.checks.filter((check) => check.status === "pass").sort((a, b) => b.weight - a.weight);
  const client = profile?.clientName?.trim() || result.snapshot.title || result.finalUrl;

  const text = [
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
  ].join("\n");

  return { text, issues, passes };
}

function tokens(value: string) {
  return value
    .toLowerCase()
    .replace(/[.,:;!?()[\]{}"'׳״/\\|_-]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 1);
}

function relevance(check: AnalysisCheck, question: string) {
  const haystack = `${check.title} ${check.finding} ${check.recommendation} ${check.evidence || ""} ${check.category}`.toLowerCase();
  return tokens(question).reduce((score, word) => score + (haystack.includes(word) ? 1 : 0), 0);
}

function formatChecks(checks: AnalysisCheck[], limit = 4) {
  return checks.slice(0, limit).map((check, index) =>
    `${index + 1}. ${check.title}\nמה נמצא: ${check.finding}\nמה לבצע: ${check.recommendation}`,
  ).join("\n\n");
}

function fallbackAnswer(question: string, result: AnalysisResult | null, profile: ProjectProfile | null) {
  if (!result) {
    return "עדיין אין לי דו״ח פעיל לקרוא. בצע סריקה או פתח דו״ח מההיסטוריה, ואז אוכל לענות על הציונים, הממצאים וההמלצות.";
  }

  const { issues, passes } = buildReportContext(result, profile);
  const q = question.toLowerCase();
  const category = q.includes("geo") ? "GEO" : q.includes("aeo") ? "AEO" : q.includes("ביצוע") || q.includes("מהירות") ? "Performance" : q.includes("seo") ? "SEO" : null;

  if (q.includes("ציון") || q.includes("מצב")) {
    return `ציון אורגנו הוא ${result.scores.overall}/100. פירוט: SEO ${result.scores.seo}, GEO ${result.scores.geo}, AEO ${result.scores.aeo}, ביצועים ${result.scores.performance}. נמצאו ${issues.length} נושאים לטיפול ו-${passes.length} בדיקות שעברו בהצלחה.`;
  }

  if (q.includes("מה עובד") || q.includes("טוב") || q.includes("חוזק")) {
    return passes.length ? `הנקודות החזקות המרכזיות בדו״ח:\n\n${formatChecks(passes, 5)}` : "לא נמצאו כרגע בדיקות שסומנו כתקינות בדו״ח הפעיל.";
  }

  if (q.includes("קודם") || q.includes("חשוב") || q.includes("דחוף") || q.includes("בעיה")) {
    const selected = category ? issues.filter((check) => check.category === category) : issues;
    return selected.length ? `אלה הפעולות שהייתי מבצע קודם:\n\n${formatChecks(selected, 4)}` : `לא נמצאו בעיות פתוחות ב-${category || "הדו״ח"}.`;
  }

  if (q.includes("תוכן") || q.includes("מאמר") || q.includes("שאלות") || q.includes("faq")) {
    const contentChecks = issues.filter((check) => ["questions", "answers", "faq", "content", "summary", "semantic", "evidence"].includes(check.id));
    const base = contentChecks.length ? formatChecks(contentChecks, 5) : formatChecks(issues.filter((check) => check.category === "AEO" || check.category === "GEO"), 5);
    return `לפי הדו״ח, כיוון התוכן המומלץ הוא:\n\n${base || "להוסיף תשובה קצרה בתחילת העמוד, שאלות אמיתיות של לקוחות, מקורות, דוגמאות ופרטי מומחה או מחבר."}`;
  }

  if (category) {
    const selected = issues.filter((check) => check.category === category);
    const score = category === "SEO" ? result.scores.seo : category === "GEO" ? result.scores.geo : category === "AEO" ? result.scores.aeo : result.scores.performance;
    return `ציון ${category} הוא ${score}/100. הנושאים המרכזיים לשיפור:\n\n${selected.length ? formatChecks(selected, 5) : "לא נמצאו בעיות פתוחות בקטגוריה הזאת."}`;
  }

  const ranked = issues
    .map((check) => ({ check, score: relevance(check, question) }))
    .sort((a, b) => b.score - a.score || priorityRank(a.check.priority) - priorityRank(b.check.priority));
  const matched = ranked.filter((entry) => entry.score > 0).map((entry) => entry.check);
  const answerChecks = matched.length ? matched : issues;

  return answerChecks.length
    ? `מצאתי בדו״ח את המידע הבא:\n\n${formatChecks(answerChecks, 4)}\n\nהתשובה מבוססת על הדו״ח הפעיל בלבד.`
    : "לא מצאתי בדו״ח הפעיל מידע שמספיק כדי לענות בביטחון. נסח את השאלה סביב ציון, ממצא, SEO, GEO, AEO, ביצועים או תוכן.";
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
      systemPrompt: "אתה אוגי, העוזר המקומי של מערכת אורגנו. ענה בעברית פשוטה ומקצועית ורק על סמך המידע שניתן. אל תמציא נתונים. כאשר מידע חסר, אמור זאת. תן פעולות קונקרטיות.",
    });
    const response = await session.prompt(`מידע מהמערכת:\n${context}\n\nשאלת המשתמש: ${question}`);
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
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "welcome", role: "assistant", text: "היי, אני אוגי. אפשר לשאול אותי על הדו״ח, הציונים, הבעיות וההמלצות של האתר הפעיל." },
  ]);
  const [report, setReport] = useState<AnalysisResult | null>(null);
  const [profile, setProfile] = useState<ProjectProfile | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<AudioContext | null>(null);

  const context = useMemo(() => buildReportContext(report, profile), [report, profile]);

  useEffect(() => {
    const refresh = () => {
      setReport(safeParse<AnalysisResult>("organo-active-report"));
      setProfile(safeParse<ProjectProfile>("organo-project-profile"));
    };
    refresh();
    window.addEventListener("organo-report-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("organo-report-updated", refresh);
      window.removeEventListener("storage", refresh);
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
      oscillator.type = "sine";
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

  function playOpenSound() {
    playNotes([
      { frequency: 440, at: 0, duration: 0.11, volume: 0.07 },
      { frequency: 660, at: 0.1, duration: 0.13, volume: 0.08 },
      { frequency: 880, at: 0.2, duration: 0.16, volume: 0.07 },
    ]);
  }

  function playAnswerSound() {
    playNotes([
      { frequency: 784, at: 0, duration: 0.12, volume: 0.07 },
      { frequency: 988, at: 0.13, duration: 0.18, volume: 0.08 },
    ]);
  }

  function toggleOpen() {
    setOpen((current) => {
      const next = !current;
      if (next) playOpenSound();
      return next;
    });
  }

  async function ask(question: string) {
    const clean = question.trim();
    if (!clean || busy) return;
    ensureAudio();
    setInput("");
    setMessages((current) => [...current, { id: crypto.randomUUID(), role: "user", text: clean }]);
    setBusy(true);

    const aiAnswer = await browserLocalAnswer(clean, context.text);
    const answer = aiAnswer || fallbackAnswer(clean, report, profile);
    setMessages((current) => [...current, { id: crypto.randomUUID(), role: "assistant", text: answer }]);
    setBusy(false);
    playAnswerSound();
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    void ask(input);
  }

  async function copyAnswer(text: string) {
    await navigator.clipboard.writeText(text);
  }

  return (
    <div className={`ogi-assistant ${open ? "is-open" : ""}`}>
      {open && (
        <section className="ogi-panel" role="dialog" aria-label="אוגי - עוזר AI מקומי" aria-modal="false">
          <header className="ogi-header">
            <div className="ogi-mini-robot" aria-hidden="true">
              <i className="ogi-antenna" />
              <span className="ogi-eye left" />
              <span className="ogi-eye right" />
              <b />
            </div>
            <div>
              <strong>אוגי</strong>
              <small><i /> AI מקומי · ללא חיובי API</small>
            </div>
            <button className="ogi-icon-button" onClick={() => setSoundEnabled((value) => !value)} aria-label={soundEnabled ? "השתק צלילים" : "הפעל צלילים"}>
              {soundEnabled ? <Volume2 /> : <VolumeX />}
            </button>
            <button className="ogi-icon-button" onClick={toggleOpen} aria-label="סגור את אוגי"><X /></button>
          </header>

          <div className="ogi-context-status">
            <Sparkles aria-hidden="true" />
            {report ? `מחובר לדו״ח של ${profile?.clientName || report.snapshot.title || report.finalUrl}` : "ממתין לדו״ח פעיל"}
          </div>

          <div className="ogi-messages" ref={scrollRef} aria-live="polite">
            {messages.map((message) => (
              <article key={message.id} className={`ogi-message ${message.role}`}>
                {message.role === "assistant" && <Bot aria-hidden="true" />}
                <div>
                  <p>{message.text}</p>
                  {message.role === "assistant" && message.id !== "welcome" && (
                    <button onClick={() => copyAnswer(message.text)}><Copy /> העתק תשובה</button>
                  )}
                </div>
              </article>
            ))}
            {busy && <article className="ogi-message assistant ogi-thinking"><Bot /><div><p><span /><span /><span /> אוגי בודק את המידע בדו״ח...</p></div></article>}
          </div>

          {!messages.some((message) => message.role === "user") && (
            <div className="ogi-suggestions">
              {starterQuestions.map((question) => <button key={question} onClick={() => void ask(question)}>{question}</button>)}
            </div>
          )}

          <form className="ogi-form" onSubmit={submit}>
            <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="שאל את אוגי על הדו״ח..." aria-label="שאלה לאוגי" />
            <button type="submit" disabled={busy || !input.trim()} aria-label="שלח שאלה"><Send /></button>
          </form>
          <p className="ogi-disclaimer">אוגי משתמש במידע המקומי של אורגנו. יש לבדוק המלצות מקצועיות לפני ביצוע.</p>
        </section>
      )}

      <button className="ogi-launcher" onClick={toggleOpen} aria-expanded={open} aria-label={open ? "סגור את אוגי" : "פתח את אוגי"}>
        <span className="ogi-robot" aria-hidden="true">
          <i className="ogi-antenna" />
          <span className="ogi-ear left" />
          <span className="ogi-ear right" />
          <span className="ogi-eye left" />
          <span className="ogi-eye right" />
          <b />
        </span>
        <span className="ogi-label"><strong>אוגי</strong><small>שאל אותי</small></span>
        {open ? <ChevronDown className="ogi-chevron" /> : <span className="ogi-online-dot" />}
      </button>
    </div>
  );
}
