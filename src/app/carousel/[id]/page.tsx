"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface Slide {
  headline: string;
  body: string;
  imageQuery: string;
}

interface Template {
  name: string;
  colors: string[];
  fonts: string;
}

interface CarouselData {
  projectId: string;
  topic: string;
  slides: Slide[];
  images: string[];
  design: string;
  template: Template;
  dimensions: { width: number; height: number; ratio: string };
  aiGenerated?: boolean;
}

export default function CarouselPage({ params }: { params: { id: string } }) {
  const { status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<CarouselData | null>(null);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/");
  }, [status, router]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(`carousel:${params.id}`);
      if (raw) setData(JSON.parse(raw));
    } catch {
      // ignore — handled by the empty state below
    }
    setLoading(false);
  }, [params.id]);

  const gradient = useMemo(() => {
    const c = data?.template?.colors || ["#06B6D4", "#0891B2", "#0E7490"];
    return `linear-gradient(135deg, ${c[0]} 0%, ${c[1]} 55%, ${c[2]} 100%)`;
  }, [data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-white">
        <div className="animate-pulse">טוען קרוסלה...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white gap-4 px-4 text-center">
        <div className="text-5xl">🗂️</div>
        <h1 className="text-2xl font-bold">הקרוסלה לא נמצאה</h1>
        <p className="text-slate-400">
          ייתכן שרעננת את הדף. צור קרוסלה חדשה כדי לצפות בה כאן.
        </p>
        <button
          onClick={() => router.push("/content-factory")}
          className="mt-2 px-6 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 font-semibold transition-colors"
        >
          ← צור קרוסלה
        </button>
      </div>
    );
  }

  const total = data.slides.length;
  const slide = data.slides[current];
  const image = data.images[current];
  const ratio = data.dimensions
    ? `${data.dimensions.width} / ${data.dimensions.height}`
    : "4 / 5";

  return (
    <div className="min-h-screen bg-slate-950 py-10 px-4 text-white">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 text-right">
          <h1 className="text-3xl font-bold mb-1">צפה בקרוסלה שלך</h1>
          <p className="text-slate-400 text-sm">
            {data.template?.name} · {data.topic} · שקף {current + 1} מתוך {total}
            {data.aiGenerated ? "" : " · נוצר במנוע החינמי"}
          </p>
        </div>

        {/* Slide canvas */}
        <div
          className="relative w-full overflow-hidden rounded-3xl shadow-2xl mx-auto"
          style={{ aspectRatio: ratio, background: gradient }}
        >
          {/* Background image */}
          {image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-25"
            />
          )}
          {/* Readability overlay */}
          <div
            className="absolute inset-0"
            style={{ background: gradient, opacity: 0.6 }}
          />

          {/* Text content */}
          <div className="relative z-10 flex h-full flex-col justify-between p-8 text-right">
            <span className="self-start rounded-full bg-black/30 px-3 py-1 text-xs font-semibold backdrop-blur">
              {current + 1} / {total}
            </span>
            <div>
              <h2 className="mb-4 text-3xl font-extrabold leading-tight drop-shadow-lg md:text-4xl">
                {slide.headline}
              </h2>
              <p className="text-base leading-relaxed text-white/95 drop-shadow md:text-lg">
                {slide.body}
              </p>
            </div>
            <span className="self-end text-sm font-bold opacity-80">
              Postwave
            </span>
          </div>
        </div>

        {/* Dots */}
        <div className="mt-5 flex justify-center gap-2">
          {data.slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`שקף ${i + 1}`}
              className={`h-2.5 rounded-full transition-all ${
                i === current ? "w-6 bg-cyan-400" : "w-2.5 bg-slate-600"
              }`}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="mt-5 flex items-center justify-between gap-4">
          <button
            onClick={() => setCurrent(Math.max(0, current - 1))}
            disabled={current === 0}
            className="px-6 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 transition-colors"
          >
            → הקודם
          </button>

          <button
            onClick={() =>
              toast.message(
                "הורדה כתמונה תתווסף בקרוב — בינתיים אפשר לצלם מסך של כל שקף"
              )
            }
            className="px-6 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 font-semibold transition-colors"
          >
            ⬇️ הורד
          </button>

          <button
            onClick={() => setCurrent(Math.min(total - 1, current + 1))}
            disabled={current === total - 1}
            className="px-6 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 transition-colors"
          >
            הבא ←
          </button>
        </div>

        {/* Actions */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={() => router.push("/content-factory")}
            className="flex-1 py-2 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            צור אחרת
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            className="flex-1 py-2 px-4 rounded-lg bg-cyan-600 hover:bg-cyan-500 font-semibold transition-colors"
          >
            חזרה לדשבורד
          </button>
        </div>
      </div>
    </div>
  );
}
