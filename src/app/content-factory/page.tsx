"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const CONTENT_TYPES: {
  value: string;
  label: string;
  emoji: string;
  soon?: boolean;
}[] = [
  { value: "carousel", label: "קרוסלה", emoji: "📱" },
  { value: "story", label: "סטורי", emoji: "🎬" },
  { value: "reels", label: "רילס", emoji: "🎞️", soon: true },
  { value: "post", label: "פוסט", emoji: "✍️", soon: true },
  { value: "presentation", label: "מצגת", emoji: "📊", soon: true },
];

function ContentFactoryForm() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type") || "carousel";

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const [formData, setFormData] = useState({
    topic: "",
    platform: "instagram",
    objective: "בניית סמכות",
    theme: "midnight",
    design: "modern",
    contentType: "carousel",
  });

  if (status === "unauthenticated") {
    router.push("/");
    return null;
  }

  const handleCreateCarousel = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.topic.trim()) {
      toast.error("אנא הזן נושא");
      return;
    }

    setLoading(true);
    setProgress(10);

    try {
      setProgress(30);

      const response = await fetch("/api/carousel/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      setProgress(70);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "כישלון יצירת קרוסלה");
      }

      const data = await response.json();
      setProgress(100);

      // Stash the full result so the viewer renders it instantly without
      // depending on server-side persistence (which is ephemeral on Vercel).
      try {
        sessionStorage.setItem(`carousel:${data.projectId}`, JSON.stringify(data));
      } catch {
        // sessionStorage unavailable — viewer will show a friendly fallback
      }

      toast.success("הקרוסלה נוצרה בהצלחה!");
      router.push(`/carousel/${data.projectId}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "שגיאה בתהליך הויצירה"
      );
      setProgress(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">מפעל תוכן</h1>
          <p className="text-slate-400">
            {type === "carousel"
              ? "צור קרוסלה מעוררת השראה עם 7 שקפים"
              : "צור תוכן שיעורר עניין"}
          </p>
        </div>

        <form onSubmit={handleCreateCarousel} className="space-y-6">
          {/* Content Type */}
          <div>
            <label className="block text-sm font-semibold mb-3">
              סוג תוכן
            </label>
            <div className="grid grid-cols-3 gap-3">
              {CONTENT_TYPES.map((option) => {
                const selected = formData.contentType === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      if (option.soon) {
                        toast.message(`${option.label} — בקרוב 🚀`);
                        return;
                      }
                      setFormData({ ...formData, contentType: option.value });
                    }}
                    disabled={loading}
                    className={`group relative overflow-hidden rounded-2xl border p-4 text-center backdrop-blur-xl transition-all disabled:opacity-50 ${
                      selected
                        ? "border-cyan-300/70 bg-cyan-400/10 shadow-[0_0_30px_-6px_rgba(34,211,238,0.55)] ring-1 ring-cyan-300/40"
                        : "border-white/10 bg-white/[0.04] hover:border-white/25 hover:bg-white/[0.08]"
                    } ${option.soon ? "opacity-70" : ""}`}
                  >
                    <span className="pointer-events-none absolute inset-x-0 -top-1/2 h-1/2 bg-gradient-to-b from-white/15 to-transparent blur-md" />
                    {option.soon && (
                      <span className="absolute right-2 top-2 rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                        בקרוב
                      </span>
                    )}
                    <div className="relative mb-1 text-3xl">{option.emoji}</div>
                    <div className="relative text-sm font-bold">
                      {option.label}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Topic */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              נושא או כותרת
            </label>
            <input
              type="text"
              placeholder="לדוגמה: 5 דרכים לשפר את המשכנתא..."
              value={formData.topic}
              onChange={(e) =>
                setFormData({ ...formData, topic: e.target.value })
              }
              disabled={loading}
              className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 focus:border-cyan-500 focus:outline-none text-white placeholder-slate-500 disabled:opacity-50"
            />
          </div>

          {/* Platform */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              פלטפורמה
            </label>
            <select
              value={formData.platform}
              onChange={(e) =>
                setFormData({ ...formData, platform: e.target.value })
              }
              disabled={loading}
              className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 focus:border-cyan-500 focus:outline-none text-white disabled:opacity-50"
            >
              <option value="instagram">Instagram</option>
              <option value="linkedin">LinkedIn</option>
              <option value="tiktok">TikTok</option>
              <option value="facebook">Facebook</option>
            </select>
          </div>

          {/* Objective */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              מטרה
            </label>
            <select
              value={formData.objective}
              onChange={(e) =>
                setFormData({ ...formData, objective: e.target.value })
              }
              disabled={loading}
              className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 focus:border-cyan-500 focus:outline-none text-white disabled:opacity-50"
            >
              <option value="בניית סמכות">בניית סמכות</option>
              <option value="הגדלת מעורבות">הגדלת מעורבות</option>
              <option value="הגדלת עוקבים">הגדלת עוקבים</option>
              <option value="יצירת לידים">יצירת לידים</option>
            </select>
          </div>

          {/* Design Templates */}
          <div>
            <label className="block text-sm font-semibold mb-3">
              בחר עיצוב
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  id: "modern",
                  name: "Modern Pro",
                  desc: "עיצוב מודרני מקצועי",
                  colors: "bg-gradient-to-br from-cyan-600 to-blue-700",
                },
                {
                  id: "minimal",
                  name: "Clean Minimal",
                  desc: "פשוט וברור",
                  colors: "bg-gradient-to-br from-slate-700 to-slate-900",
                },
                {
                  id: "bold",
                  name: "Bold Impact",
                  desc: "עיצוב עוזר ומשפיע",
                  colors: "bg-gradient-to-br from-purple-600 to-pink-600",
                },
              ].map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, design: template.id })
                  }
                  disabled={loading}
                  className={`group relative overflow-hidden rounded-2xl border p-4 text-right backdrop-blur-xl transition-all disabled:opacity-50 ${
                    formData.design === template.id
                      ? "border-cyan-300/70 ring-2 ring-cyan-400/40 shadow-[0_0_30px_-6px_rgba(34,211,238,0.5)]"
                      : "border-white/10 bg-white/[0.04] hover:border-white/25 hover:bg-white/[0.08]"
                  }`}
                >
                  <span className="pointer-events-none absolute inset-x-0 -top-1/2 h-1/2 bg-gradient-to-b from-white/15 to-transparent blur-md" />
                  <div
                    className={`${template.colors} relative mb-3 flex h-20 items-center justify-center rounded-xl text-sm font-bold text-white shadow-inner`}
                  >
                    {template.name}
                  </div>
                  <p className="relative text-sm text-slate-300">{template.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Theme */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              צבע עיקרי
            </label>
            <select
              value={formData.theme}
              onChange={(e) =>
                setFormData({ ...formData, theme: e.target.value })
              }
              disabled={loading}
              className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 focus:border-cyan-500 focus:outline-none text-white disabled:opacity-50"
            >
              <option value="midnight">Midnight Authority</option>
              <option value="editorial">Claude Editorial</option>
              <option value="minimal">Premium Minimal</option>
              <option value="linkedin">LinkedIn Authority</option>
              <option value="bold">Bold Social</option>
            </select>
          </div>

          {/* Progress */}
          {loading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>מיצור קרוסלה...</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {progress < 50 &&
                  "🔍 מחפש ומנתח תוכן..."}
                {progress >= 50 && progress < 80 &&
                  "🖼️ חיפוש תמונות תקינות..."}
                {progress >= 80 &&
                  "✨ מוצר סופי..."}
              </p>
            </div>
          )}

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="group relative w-full overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-l from-cyan-500/90 to-sky-500/90 py-3.5 px-4 font-bold text-white shadow-[0_8px_30px_-8px_rgba(34,211,238,0.6)] backdrop-blur-xl transition-all hover:from-cyan-400 hover:to-sky-400 hover:shadow-[0_10px_44px_-6px_rgba(34,211,238,0.85)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="pointer-events-none absolute inset-x-0 -top-1/2 h-1/2 bg-gradient-to-b from-white/25 to-transparent blur-md" />
            <span className="relative">
              {loading
                ? formData.contentType === "story"
                  ? "יוצר סטורי..."
                  : "יוצר קרוסלה..."
                : formData.contentType === "story"
                ? "צור סטורי 🎬"
                : "צור קרוסלה ✨"}
            </span>
          </button>
        </form>

        {/* Info Box */}
        <div className="mt-8 space-y-4">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <p className="text-sm text-blue-200">
              ℹ️ <strong>כיצד זה עובד:</strong>{" "}
              {formData.contentType === "carousel"
                ? "המערכת תחפש מקורות אמינים, תכתוב 7 שקפים, תחפש תמונות רלוונטיות, ותבנה קרוסלה מוכנה להורדה וביעוט."
                : "המערכת תיצור סרטון סטורי בן 15 שניות עם אנימציות, טקסט, והוזמנות לפעולה."}
            </p>
          </div>

          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
            <p className="text-sm text-purple-200">
              📐 <strong>גדלים אוטומטיים:</strong>
              <br />
              <span className="text-xs">
                • Instagram:{" "}
                {formData.contentType === "carousel"
                  ? "1080x1350px (קרוסלה)"
                  : "1080x1920px (סטורי)"}
                <br />• Facebook:{" "}
                {formData.contentType === "carousel"
                  ? "1200x628px (קרוסלה)"
                  : "1080x1920px (סטורי)"}
                <br />• LinkedIn:{" "}
                {formData.contentType === "carousel"
                  ? "1200x627px (קרוסלה)"
                  : "Not supported"}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Suspense } from "react";

export default function ContentFactoryPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">טוען...</div>}>
      <ContentFactoryForm />
    </Suspense>
  );
}
