"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function ContentFactoryPage() {
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

          {/* Theme */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              ערכת עיצוב
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
            {loading ? "יוצר..." : "צור קרוסלה ✨"}
          </button>
        </form>

        {/* Info Box */}
        <div className="mt-8 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <p className="text-sm text-blue-200">
            ℹ️ <strong>כיצד זה עובד:</strong> המערכת תחפש מקורות אמינים,
            תכתוב 7 שקפים, תחפש תמונות רלוונטיות, ותבנה קרוסלה מוכנה להורדה
            וביעוט.
          </p>
        </div>
      </div>
    </div>
  );
}
