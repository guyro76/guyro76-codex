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

// --- Client-side PNG rendering (no external service needed) ---

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function renderSlideCanvas(opts: {
  width: number;
  height: number;
  colors: string[];
  headline: string;
  body: string;
  index: number;
  total: number;
}): HTMLCanvasElement {
  const { width, height, colors, headline, body, index, total } = opts;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  const c = colors.length >= 3 ? colors : ["#06B6D4", "#0891B2", "#0E7490"];
  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, c[0]);
  grad.addColorStop(0.55, c[1]);
  grad.addColorStop(1, c[2]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  const margin = Math.round(width * 0.09);
  const right = width - margin;
  const maxW = width - margin * 2;

  // slide counter (top-left)
  ctx.textAlign = "left";
  ctx.direction = "ltr";
  ctx.font = `bold ${Math.round(width * 0.03)}px sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.fillText(`${index + 1} / ${total}`, margin, margin + Math.round(width * 0.03));

  // headline + body (RTL)
  ctx.direction = "rtl";
  ctx.textAlign = "right";

  const hSize = Math.round(width * 0.075);
  ctx.font = `800 ${hSize}px sans-serif`;
  ctx.fillStyle = "#ffffff";
  const hLines = wrapText(ctx, headline, maxW);

  const bSize = Math.round(width * 0.042);
  let y = Math.round(height * 0.4);
  for (const ln of hLines) {
    ctx.fillText(ln, right, y);
    y += Math.round(hSize * 1.2);
  }

  y += Math.round(hSize * 0.5);
  ctx.font = `500 ${bSize}px sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  for (const ln of wrapText(ctx, body, maxW)) {
    ctx.fillText(ln, right, y);
    y += Math.round(bSize * 1.45);
  }

  // watermark (bottom-left)
  ctx.direction = "ltr";
  ctx.textAlign = "left";
  ctx.font = `bold ${Math.round(width * 0.035)}px sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.fillText("Postwave", margin, height - margin);

  return canvas;
}

function downloadCanvas(canvas: HTMLCanvasElement, filename: string) {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, "image/png");
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
  const dims = data.dimensions || { width: 1080, height: 1350, ratio: "4 / 5" };
  const ratio = `${dims.width} / ${dims.height}`;
  const colors = data.template?.colors || ["#06B6D4", "#0891B2", "#0E7490"];

  const downloadOne = (i: number) => {
    const s = data.slides[i];
    const canvas = renderSlideCanvas({
      width: dims.width,
      height: dims.height,
      colors,
      headline: s.headline,
      body: s.body,
      index: i,
      total,
    });
    downloadCanvas(canvas, `postwave-slide-${i + 1}.png`);
  };

  const downloadAll = async () => {
    for (let i = 0; i < total; i++) {
      downloadOne(i);
      // small gap so the browser accepts the sequential downloads
      await new Promise((r) => setTimeout(r, 350));
    }
    toast.success("כל 7 השקפים הורדו! מוכנים לפרסום בכל רשת.");
  };

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
            onClick={() => downloadOne(current)}
            className="px-6 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 font-semibold transition-colors"
          >
            ⬇️ הורד שקף
          </button>

          <button
            onClick={() => setCurrent(Math.min(total - 1, current + 1))}
            disabled={current === total - 1}
            className="px-6 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 transition-colors"
          >
            הבא ←
          </button>
        </div>

        {/* Download all */}
        <button
          onClick={downloadAll}
          className="mt-6 w-full rounded-xl bg-gradient-to-l from-cyan-500 to-sky-500 py-3 font-bold text-white shadow-lg transition-transform hover:scale-[1.01]"
        >
          ⬇️ הורד את כל הקרוסלה (7 תמונות)
        </button>
        <p className="mt-2 text-center text-xs text-slate-500">
          התמונות נשמרות במכשיר שלך — מוכנות להעלאה לכל רשת חברתית.
        </p>

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
