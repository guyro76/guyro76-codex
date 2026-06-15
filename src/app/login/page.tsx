"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (tab === "register") {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error);
        }

        toast.success("הרשמה בוצעה בהצלחה! כניסה...");

        // Sign in
        const result = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (result?.ok) {
          router.push("/onboarding");
        } else {
          throw new Error("כשל בכניסה");
        }
      } else {
        // Login
        const result = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (result?.ok) {
          router.push("/dashboard");
        } else {
          throw new Error("דואר אלקטרוני או סיסמה לא נכונים");
        }
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "שגיאה בתהליך"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <h1 className="text-5xl font-black mb-2 text-gradient">
            Postwave
          </h1>
          <p className="text-slate-600 text-lg">גל של תוכן שמח וחכם</p>
        </div>

        {/* Glass Card */}
        <div className="glass rounded-3xl p-6 space-y-5">
          {/* Tabs */}
          <div className="flex gap-2 bg-white/30 p-1 rounded-2xl">
            <button
              onClick={() => setTab("login")}
              className={`flex-1 py-2 rounded-lg transition-all font-semibold ${
                tab === "login"
                  ? "bg-gradient-to-r from-pink-300 to-violet-300 text-slate-900 shadow-md"
                  : "text-slate-700 hover:text-slate-900"
              }`}
            >
              כניסה
            </button>
            <button
              onClick={() => setTab("register")}
              className={`flex-1 py-2 rounded-lg transition-all font-semibold ${
                tab === "register"
                  ? "bg-gradient-to-r from-pink-300 to-violet-300 text-slate-900 shadow-md"
                  : "text-slate-700 hover:text-slate-900"
              }`}
            >
              הרשמה
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleEmailAuth} className="space-y-3">
            {tab === "register" && (
              <input
                type="text"
                placeholder="שם מלא"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                disabled={loading}
                className="w-full px-4 py-2.5 rounded-xl bg-white/40 backdrop-blur border border-white/60 focus:border-pink-400 focus:outline-none text-slate-900 placeholder-slate-700"
              />
            )}

            <input
              type="email"
              placeholder="דואר אלקטרוני"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              disabled={loading}
              className="w-full px-4 py-2.5 rounded-xl bg-white/40 backdrop-blur border border-white/60 focus:border-pink-400 focus:outline-none text-slate-900 placeholder-slate-700"
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="סיסמה"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                disabled={loading}
                className="w-full px-4 py-2.5 pl-12 rounded-xl bg-white/40 backdrop-blur border border-white/60 focus:border-pink-400 focus:outline-none text-slate-900 placeholder-slate-700"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
                aria-label={showPassword ? "הסתר סיסמה" : "הצג סיסמה"}
                className="absolute inset-y-0 left-0 flex items-center px-3 text-slate-600 hover:text-violet-600 transition-colors"
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-pink-400 to-violet-400 hover:from-pink-300 hover:to-violet-300 text-white font-bold disabled:opacity-50 transition-all shadow-md"
            >
              {loading ? "טוען..." : tab === "login" ? "כניסה" : "הרשמה"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/40" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white/20 text-slate-700 rounded-full text-xs font-semibold">או</span>
            </div>
          </div>

          {/* OAuth Buttons */}
          <div className="space-y-2">
            <button
              onClick={() =>
                toast.message("התחברות עם Google — בקרוב. בינתיים השתמש באימייל וסיסמה 🙂")
              }
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl glass hover:bg-white/40 text-slate-800 font-semibold disabled:opacity-50 transition-all flex items-center justify-center gap-3"
            >
              <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
                <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
                <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
                <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571.001-.001.002-.001.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
              </svg>
              <span>Google</span>
            </button>

            <button
              onClick={() =>
                toast.message("התחברות עם Apple — בקרוב. בינתיים השתמש באימייל וסיסמה 🙂")
              }
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl glass hover:bg-white/40 text-slate-800 font-semibold disabled:opacity-50 transition-all flex items-center justify-center gap-3"
            >
              <svg width="18" height="20" viewBox="0 0 384 512" fill="currentColor" aria-hidden="true">
                <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
              </svg>
              <span>Apple</span>
            </button>
          </div>
        </div>

        {/* Info */}
        <p className="text-xs text-slate-600 text-center">
          דוגמה: test@example.com / password123
        </p>
      </div>
    </div>
  );
}
