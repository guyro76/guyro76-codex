"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex flex-col flex-1 items-center justify-center">
        <div className="animate-pulse">
          <div className="h-12 w-48 bg-slate-700 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Logo / Title */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">
            Post
            <span className="text-cyan-400">wave</span>
          </h1>
          <p className="text-lg text-slate-300">
            צור, נהל ופרסם תוכן סושיאל שמייצר תוצאות
          </p>
        </div>

        {/* Description */}
        <div className="space-y-4 text-slate-400">
          <p className="text-sm leading-relaxed">
            בנה נוכחות דיגיטלית חזקה, בנה סמכות מקצועית, וגדל ברשתות החברתיות
            עם עזרת בינה מלאכותית.
          </p>
        </div>

        {/* Login Button */}
        <button
          onClick={() => signIn("google", { callbackUrl: "/onboarding" })}
          className="w-full py-3 px-4 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          כניסה עם Google
        </button>

        {/* Footer */}
        <p className="text-xs text-slate-500 pt-6">
          © תוכנן על ידי גיא רוזנברג 2026 – כל הזכויות שמורות
        </p>
      </div>
    </div>
  );
}
