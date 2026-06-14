"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const PLATFORMS = [
  { id: "facebook", name: "Facebook", icon: "f" },
  { id: "instagram", name: "Instagram", icon: "📷" },
  { id: "linkedin", name: "LinkedIn", icon: "in" },
  { id: "tiktok", name: "TikTok", icon: "♪" },
  { id: "higgsfield", name: "Higgsfield", icon: "🎬" },
];

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    niche: "",
    audience: "",
    tone: "",
    platforms: [] as string[],
  });

  if (status === "unauthenticated") {
    router.push("/");
    return null;
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  const handlePlatformToggle = (platformId: string) => {
    setFormData((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(platformId)
        ? prev.platforms.filter((p) => p !== platformId)
        : [...prev.platforms, platformId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.niche || !formData.audience || !formData.tone) {
      toast.error("אנא מלא את כל השדות");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/user/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to save onboarding");
      }

      toast.success("ההגדרות נשמרו בהצלחה!");
      router.push("/dashboard");
    } catch (error) {
      toast.error("שגיאה בשמירת ההגדרות");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2">
            ברוכים הבאים ל-<span className="text-cyan-400">Postwave</span>
          </h1>
          <p className="text-slate-400">בואו נגדיר את הפרופיל שלך</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Niche */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              תחום המומחיות שלך
            </label>
            <input
              type="text"
              placeholder="לדוגמה: שיווק דיגיטלי, כתיבה, עיצוב..."
              value={formData.niche}
              onChange={(e) =>
                setFormData({ ...formData, niche: e.target.value })
              }
              className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 focus:border-cyan-500 focus:outline-none text-white placeholder-slate-500"
            />
          </div>

          {/* Audience */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              הקהל היעד שלך
            </label>
            <input
              type="text"
              placeholder="לדוגמה: יזמים, חברות סטארטאפ, צעירים בגיל 20-30..."
              value={formData.audience}
              onChange={(e) =>
                setFormData({ ...formData, audience: e.target.value })
              }
              className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 focus:border-cyan-500 focus:outline-none text-white placeholder-slate-500"
            />
          </div>

          {/* Tone */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              טון הכתיבה שלך
            </label>
            <select
              value={formData.tone}
              onChange={(e) =>
                setFormData({ ...formData, tone: e.target.value })
              }
              className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 focus:border-cyan-500 focus:outline-none text-white"
            >
              <option value="">בחר טון כתיבה</option>
              <option value="formal">רשמי ומקצועי</option>
              <option value="casual">קל ויומיומי</option>
              <option value="inspirational">מעורר השראה</option>
              <option value="educational">חינוכי</option>
              <option value="humorous">הומוריסטי</option>
            </select>
          </div>

          {/* Platforms */}
          <div>
            <label className="block text-sm font-semibold mb-4">
              בחר את הפלטפורמות שלך
            </label>
            <p className="text-xs text-slate-400 mb-4">
              אתה יכול לבחור בהמשך או להפעיל מצב דמו כדי לבדוק את המערכת
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {PLATFORMS.map((platform) => (
                <button
                  key={platform.id}
                  type="button"
                  onClick={() => handlePlatformToggle(platform.id)}
                  className={`p-4 rounded-lg border-2 transition-all text-center ${
                    formData.platforms.includes(platform.id)
                      ? "border-cyan-500 bg-cyan-500/10"
                      : "border-slate-700 bg-slate-900 hover:border-slate-600"
                  }`}
                >
                  <div className="text-2xl mb-2">{platform.icon}</div>
                  <div className="text-sm font-medium">{platform.name}</div>
                  <div className="text-xs text-slate-400 mt-1">
                    {formData.platforms.includes(platform.id)
                      ? "מצב דמו"
                      : "לא מחובר"}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <p className="text-sm text-blue-200">
              ℹ️ <strong>מצב דמו:</strong> אתה יכול להמשיך ללא חיבור לפלטפורמות
              ממשיות. כל התוכן יאוחסן בחשבונך וניתן יהיה לפרסם לאחר מכן.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "שומר..." : "התחל עכשיו"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
