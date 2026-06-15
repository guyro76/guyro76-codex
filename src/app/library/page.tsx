"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  listContent,
  removeContent,
  type ContentIndexEntry,
} from "@/lib/content-store";

const TYPE_META: Record<string, { label: string; emoji: string }> = {
  carousel: { label: "קרוסלה", emoji: "📱" },
  post: { label: "פוסט", emoji: "✍️" },
  presentation: { label: "מצגת", emoji: "📊" },
  reels: { label: "רילס", emoji: "🎞️" },
  story: { label: "סטורי", emoji: "🎬" },
};

function formatDate(ts: number): string {
  try {
    return new Date(ts).toLocaleDateString("he-IL", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export default function LibraryPage() {
  const { status } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<ContentIndexEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/");
  }, [status, router]);

  useEffect(() => {
    setItems(listContent());
    setLoaded(true);
  }, []);

  const handleRemove = (id: string) => {
    removeContent(id);
    setItems(listContent());
    toast.success("נמחק מהספרייה");
  };

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4 text-white">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={() => router.push("/content-factory")}
            className="rounded-xl bg-gradient-to-l from-cyan-500 to-sky-500 px-5 py-2.5 text-sm font-bold shadow-lg transition-transform hover:scale-[1.02]"
          >
            + צור תוכן חדש
          </button>
          <div className="text-right">
            <h1 className="text-4xl font-bold">הספרייה שלי</h1>
            <p className="text-slate-400 text-sm">
              כל התוכן שיצרת — נשמר במכשיר שלך
            </p>
          </div>
        </div>

        {!loaded ? (
          <div className="animate-pulse text-center text-slate-500">טוען...</div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-white/10 bg-white/[0.03] py-20 text-center">
            <div className="text-5xl">🗂️</div>
            <h2 className="text-2xl font-bold">עדיין אין תוכן שמור</h2>
            <p className="max-w-sm text-slate-400">
              צור קרוסלה, פוסט, מצגת או רילס — והם יופיעו כאן אוטומטית.
            </p>
            <button
              onClick={() => router.push("/content-factory")}
              className="mt-2 rounded-lg bg-cyan-600 px-6 py-2 font-semibold transition-colors hover:bg-cyan-500"
            >
              ← התחל ליצור
            </button>
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((item) => {
              const meta = TYPE_META[item.contentType] || TYPE_META.carousel;
              return (
                <li
                  key={item.id}
                  className="group flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl transition-all hover:border-cyan-300/40 hover:bg-white/[0.07]"
                >
                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="rounded-lg bg-slate-800 px-3 py-2 text-xs text-slate-400 transition-colors hover:bg-red-500/20 hover:text-red-300"
                      aria-label="מחק"
                    >
                      🗑️
                    </button>
                    <button
                      onClick={() => router.push(`/carousel/${item.id}`)}
                      className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold transition-colors hover:bg-cyan-500"
                    >
                      פתח
                    </button>
                  </div>
                  <button
                    onClick={() => router.push(`/carousel/${item.id}`)}
                    className="flex flex-1 items-center justify-end gap-3 text-right"
                  >
                    <div>
                      <p className="font-bold leading-tight">{item.topic}</p>
                      <p className="text-xs text-slate-500">
                        {meta.label} · {formatDate(item.createdAt)}
                      </p>
                    </div>
                    <span className="text-3xl">{meta.emoji}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
