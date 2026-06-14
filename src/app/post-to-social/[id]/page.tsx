"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const PLATFORMS = [
  { name: "Instagram", id: "instagram", icon: "📷" },
  { name: "Facebook", id: "facebook", icon: "👥" },
  { name: "LinkedIn", id: "linkedin", icon: "💼" },
  { name: "TikTok", id: "tiktok", icon: "🎵" },
];

interface PostConfig {
  platforms: string[];
  caption: string;
  composioApiKey: string;
  scheduleFor?: string;
}

export default function PostToSocialPage({ params }: { params: { id: string } }) {
  const { status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<PostConfig>({
    platforms: ["instagram"],
    caption: "כל הקרוסלה שלנו לרכישה חדשה.\n\nהצטרפו להם כדי להשתמש בתוכן שהוא מעוררת השראה.",
    composioApiKey: process.env.NEXT_PUBLIC_COMPOSIO_API_KEY || "",
    scheduleFor: "",
  });

  if (status === "unauthenticated") {
    router.push("/");
    return null;
  }

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();

    if (config.platforms.length === 0) {
      toast.error("אנא בחר לפחות רשת חברתית אחת");
      return;
    }

    if (!config.composioApiKey.trim()) {
      toast.message("עדיין לא קישרת את Composio. בדוק את ההגדרות שלך.");
      router.push("/settings");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/social/post-carousel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: params.id,
          ...config,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "כישלון בפרסום");
      }

      toast.success("הקרוסלה פורסמה בהצלחה! 🎉");
      router.push("/dashboard");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "שגיאה בתהליך הפרסום"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4 text-white">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-right">
          <h1 className="text-4xl font-bold mb-2">פרסם לרשתות החברתיות</h1>
          <p className="text-slate-400">בחר את הרשתות והוסף טקסט להנחיה</p>
        </div>

        <form onSubmit={handlePost} className="space-y-6">
          {/* Platform Selection */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-6">
            <label className="block text-sm font-semibold mb-4">
              בחר רשתות חברתיות
            </label>
            <div className="grid grid-cols-2 gap-3">
              {PLATFORMS.map((platform) => (
                <button
                  key={platform.id}
                  type="button"
                  onClick={() => {
                    const selected = config.platforms.includes(platform.id);
                    setConfig({
                      ...config,
                      platforms: selected
                        ? config.platforms.filter((p) => p !== platform.id)
                        : [...config.platforms, platform.id],
                    });
                  }}
                  className={`p-4 rounded-lg border transition-all ${
                    config.platforms.includes(platform.id)
                      ? "border-cyan-400/70 bg-cyan-400/10 ring-1 ring-cyan-300/40"
                      : "border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="text-2xl mb-2">{platform.icon}</div>
                  <div className="text-sm font-semibold">{platform.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Caption */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-6">
            <label className="block text-sm font-semibold mb-3">
              טקסט הנחיה (Caption)
            </label>
            <textarea
              value={config.caption}
              onChange={(e) => setConfig({ ...config, caption: e.target.value })}
              placeholder="הוסף טקסט להנחיה שלך..."
              disabled={loading}
              className="w-full h-24 px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 focus:border-cyan-500 focus:outline-none text-white placeholder-slate-500"
            />
            <p className="mt-2 text-xs text-slate-500">
              {config.caption.length} / 2200 תווים
            </p>
          </div>

          {/* Composio Info */}
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6">
            <p className="text-sm text-amber-200">
              ℹ️ הקרוסלה שלך תועלה כהורדה של 7 תמונות PNG. הורד אותן ותעלה
              ל-Composio או לכל רשת חברתית ישירות.
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-white font-bold disabled:opacity-50 transition-colors"
          >
            {loading ? "פורסם..." : "🚀 פרסם עכשיו"}
          </button>

          {/* Back button */}
          <button
            type="button"
            onClick={() => router.back()}
            className="w-full py-2 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors"
          >
            חזור
          </button>
        </form>
      </div>
    </div>
  );
}
