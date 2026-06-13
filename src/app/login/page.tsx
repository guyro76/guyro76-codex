"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);

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
    <div className="min-h-screen bg-slate-950 py-12 px-4 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">
            AuthorityBoost
            <span className="text-cyan-400"> AI</span>
          </h1>
          <p className="text-slate-400">בנה סמכות דיגיטלית</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-slate-900 p-1 rounded-lg">
          <button
            onClick={() => setTab("login")}
            className={`flex-1 py-2 rounded transition-colors ${
              tab === "login"
                ? "bg-cyan-600 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            כניסה
          </button>
          <button
            onClick={() => setTab("register")}
            className={`flex-1 py-2 rounded transition-colors ${
              tab === "register"
                ? "bg-cyan-600 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            הרשמה
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          {tab === "register" && (
            <input
              type="text"
              placeholder="שם מלא"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              disabled={loading}
              className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 focus:border-cyan-500 focus:outline-none text-white placeholder-slate-500"
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
            className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 focus:border-cyan-500 focus:outline-none text-white placeholder-slate-500"
          />

          <input
            type="password"
            placeholder="סיסמה"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            disabled={loading}
            className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 focus:border-cyan-500 focus:outline-none text-white placeholder-slate-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold disabled:opacity-50 transition-colors"
          >
            {loading ? "טוען..." : tab === "login" ? "כניסה" : "הרשמה"}
          </button>
        </form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-slate-950 text-slate-500">או</span>
          </div>
        </div>

        {/* OAuth Buttons */}
        <div className="space-y-2">
          <button
            onClick={() => signIn("google", { callbackUrl: "/onboarding" })}
            disabled={loading}
            className="w-full py-2 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            🔍 כניסה עם Google
          </button>

          <button
            onClick={() => signIn("apple", { callbackUrl: "/onboarding" })}
            disabled={loading}
            className="w-full py-2 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            🍎 כניסה עם Apple
          </button>
        </div>

        {/* Info */}
        <p className="text-xs text-slate-500 text-center">
          דוגמה: test@example.com / password123
        </p>
      </div>
    </div>
  );
}
