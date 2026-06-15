"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// Only networks the user has actually connected in Composio.
const PLATFORMS = [
  { name: "Instagram", id: "instagram", icon: "📷" },
  { name: "Facebook", id: "facebook", icon: "👥" },
  { name: "LinkedIn", id: "linkedin", icon: "💼" },
];

interface Slide {
  headline: string;
  body: string;
}

interface CarouselData {
  topic?: string;
  slides?: Slide[];
  images?: string[];
}

interface PlatformResult {
  platform: string;
  successful: boolean;
  error?: string | null;
}

export default function PostToSocialPage({
  params,
}: {
  params: { id: string };
}) {
  const { status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [carousel, setCarousel] = useState<CarouselData | null>(null);
  const [selected, setSelected] = useState<string[]>(["instagram"]);
  const [caption, setCaption] = useState("");
  const [results, setResults] = useState<PlatformResult[] | null>(null);
  const [notConfigured, setNotConfigured] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/");
  }, [status, router]);

  // Pull the carousel the user just created (same session) to build a caption
  // and grab a real public image URL for the post.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(`carousel:${params.id}`);
      if (raw) {
        const data: CarouselData = JSON.parse(raw);
        setCarousel(data);
        const first = data.slides?.[0];
        const suggested = first
          ? `${first.headline}\n\n${first.body}\n\n#postwave`
          : `${data.topic || "תוכן חדש"} — נוצר ב-Postwave`;
        setCaption(suggested);
      } else {
        setCaption("תוכן חדש מ-Postwave");
      }
    } catch {
      setCaption("תוכן חדש מ-Postwave");
    }
  }, [params.id]);

  const togglePlatform = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selected.length === 0) {
      toast.error("אנא בחר לפחות רשת חברתית אחת");
      return;
    }

    setLoading(true);
    setResults(null);
    setNotConfigured(false);

    try {
      const response = await fetch("/api/social/post-carousel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: params.id,
          platforms: selected,
          caption,
          imageUrl: carousel?.images?.[0],
        }),
      });

      const data = await response.json();

      if (data.configured === false) {
        setNotConfigured(true);
        toast.message("פרסום אוטומטי עדיין לא הופעל — ראה את ההנחיות למטה");
        return;
      }

      if (!response.ok && !data.results) {
        throw new Error(data.error || "כישלון בפרסום");
      }

      setResults(data.results || []);
      if (data.success) {
        toast.success("פורסם בהצלחה לכל הרשתות! 🎉");
      } else if (data.partial) {
        toast.message("חלק מהרשתות פורסמו — בדוק את הפירוט למטה");
      } else {
        toast.error("הפרסום נכשל — בדוק את הפירוט למטה");
      }
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
          <p className="text-slate-400">
            {carousel?.topic
              ? `הקרוסלה: ${carousel.topic}`
              : "בחר רשתות והוסף טקסט"}
          </p>
        </div>

        <form onSubmit={handlePost} className="space-y-6">
          {/* Platform Selection */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-6">
            <label className="block text-sm font-semibold mb-4">
              בחר רשתות חברתיות
            </label>
            <div className="grid grid-cols-3 gap-3">
              {PLATFORMS.map((platform) => (
                <button
                  key={platform.id}
                  type="button"
                  onClick={() => togglePlatform(platform.id)}
                  disabled={loading}
                  className={`p-4 rounded-lg border transition-all disabled:opacity-50 ${
                    selected.includes(platform.id)
                      ? "border-cyan-400/70 bg-cyan-400/10 ring-1 ring-cyan-300/40"
                      : "border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="text-2xl mb-2">{platform.icon}</div>
                  <div className="text-sm font-semibold">{platform.name}</div>
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-slate-500">
              TikTok עדיין לא מחובר ב-Composio — חבר אותו כדי שיופיע כאן.
            </p>
          </div>

          {/* Caption */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-6">
            <label className="block text-sm font-semibold mb-3">
              טקסט הפוסט (Caption)
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="הוסף טקסט לפוסט..."
              disabled={loading}
              className="w-full h-32 px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 focus:border-cyan-500 focus:outline-none text-white placeholder-slate-500"
            />
            <p className="mt-2 text-xs text-slate-500">
              {caption.length} / 2200 תווים
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-white font-bold disabled:opacity-50 transition-colors"
          >
            {loading ? "מפרסם..." : "🚀 פרסם עכשיו"}
          </button>

          <button
            type="button"
            onClick={() => router.back()}
            className="w-full py-2 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors"
          >
            חזור
          </button>
        </form>

        {/* Not-configured guidance (honest) */}
        {notConfigured && (
          <div className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 text-right">
            <h3 className="font-bold text-amber-200 mb-3">
              צעד אחרון להפעלת פרסום אוטומטי
            </h3>
            <ol className="space-y-2 text-sm text-amber-100/90 list-decimal list-inside">
              <li>
                היכנס ל-
                <a
                  href="https://app.composio.dev"
                  target="_blank"
                  rel="noreferrer"
                  className="underline text-cyan-300"
                >
                  app.composio.dev
                </a>{" "}
                ← Settings ← API Keys, והעתק את המפתח
              </li>
              <li>
                ב-Vercel: Project → Settings → Environment Variables → הוסף
                <code className="mx-1 rounded bg-slate-800 px-1">
                  COMPOSIO_API_KEY
                </code>
              </li>
              <li>בצע Redeploy — ואז הכפתור ישלח ישירות לרשתות</li>
            </ol>
          </div>
        )}

        {/* Per-platform results (honest success/error) */}
        {results && results.length > 0 && (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-right">
            <h3 className="font-bold mb-3">תוצאות הפרסום</h3>
            <ul className="space-y-2">
              {results.map((r) => (
                <li
                  key={r.platform}
                  className="flex items-center justify-between rounded-lg bg-slate-900/60 px-4 py-2"
                >
                  <span
                    className={
                      r.successful ? "text-emerald-400" : "text-red-400"
                    }
                  >
                    {r.successful ? "✓ פורסם" : `✗ ${r.error || "נכשל"}`}
                  </span>
                  <span className="font-semibold capitalize">{r.platform}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
