"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

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
          <h1 className="text-4xl font-bold mb-2">מפעל תוכן AI</h1>
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
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "carousel", label: "קרוסלה", emoji: "📱" },
                { value: "story", label: "סטורי", emoji: "🎬" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, contentType: option.value })
                  }
                  disabled={loading}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.contentType === option.value
                      ? "border-cyan-500 bg-cyan-500/10"
                      : "border-slate-700 bg-slate-900 hover:border-slate-600"
                  } disabled:opacity-50`}
                >
                  <div className="text-2xl mb-1">{option.emoji}</div>
                  <div className="text-sm font-medium">{option.label}</div>
                </button>
              ))}
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
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.design === template.id
                      ? "border-cyan-500 ring-2 ring-cyan-500/50"
                      : "border-slate-700 hover:border-slate-600"
                  } disabled:opacity-50`}
                >
                  <div
                    className={`${template.colors} h-20 rounded mb-3 flex items-center justify-center text-white font-bold text-sm`}
                  >
                    {template.name}
                  </div>
                  <p className="text-sm">{template.desc}</p>
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
            className="w-full py-3 px-4 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading
              ? formData.contentType === "story"
                ? "יוצר סטורי..."
                : "יוצר קרוסלה..."
              : formData.contentType === "story"
              ? "צור סטורי 🎬"
              : "צור קרוסלה ✨"}
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
