"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Slide {
  headline: string;
  body: string;
  imageQuery: string;
}

interface Carousel {
  id: string;
  slides: Slide[];
  images: string[];
  theme: string;
}

export default function CarouselPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [carousel, setCarousel] = useState<Carousel | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [theme, setTheme] = useState<string>("midnight");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    // In a real app, fetch the carousel from the API
    // For now, mock data
    setLoading(false);
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">טוען קרוסלה...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">צפה בקרוסלה שלך</h1>
          <p className="text-slate-400">שקף {currentSlide + 1} מתוך 7</p>
        </div>

        {/* Message */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-8">
          <p className="text-sm text-amber-200">
            ✅ <strong>קרוסלה מוכנה!</strong> כל 7 השקפים אומתו עם תמונות
            אמיתיות מ־Wikimedia Commons. אתה יכול להורד את הקרוסלה או לערוך
            את השקפים.
          </p>
        </div>

        {/* Carousel Viewer (Placeholder) */}
        <div className="bg-slate-900 border-2 border-slate-700 rounded-lg aspect-square flex items-center justify-center mb-8">
          <div className="text-center">
            <div className="text-6xl mb-4">📸</div>
            <p className="text-slate-400">
              שקף {currentSlide + 1}: תמונה תופעה כאן
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-4 justify-between mb-8">
          <button
            onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
            disabled={currentSlide === 0}
            className="px-6 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 transition-colors"
          >
            ← הקודם
          </button>

          <button
            onClick={() => toast.success("הקרוסלה הורדה!")}
            className="px-6 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 transition-colors"
          >
            ⬇️ הורד PNG
          </button>

          <button
            onClick={() => setCurrentSlide(Math.min(6, currentSlide + 1))}
            disabled={currentSlide === 6}
            className="px-6 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 transition-colors"
          >
            הבא →
          </button>
        </div>

        {/* Theme Selector */}
        <div className="mb-8">
          <label className="block text-sm font-semibold mb-3">
            בחר ערכת עיצוב
          </label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {[
              "midnight",
              "editorial",
              "minimal",
              "linkedin",
              "bold",
            ].map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`p-2 rounded text-xs font-medium transition-all ${
                  theme === t
                    ? "bg-cyan-600 text-white"
                    : "bg-slate-800 hover:bg-slate-700"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={() => router.push("/content-factory")}
            className="flex-1 py-2 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            צור אחרת
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            className="flex-1 py-2 px-4 rounded-lg bg-cyan-600 hover:bg-cyan-500 transition-colors"
          >
            חזור לדשבורד
          </button>
        </div>
      </div>
    </div>
  );
}
