"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Leaf, LoaderCircle, LockKeyhole, Mail } from "lucide-react";
import { authClient } from "@/lib/neon/auth-client";

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const next = params.get("next") || "/";
  const denied = params.get("error") === "not-authorized";

  async function login(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const { error } = await authClient.signIn.email({
        email: email.trim().toLowerCase(),
        password,
      });
      if (error) throw new Error(error.message || "הכניסה נכשלה");
      router.replace(next);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "הכניסה נכשלה");
    } finally {
      setBusy(false);
    }
  }

  async function googleLogin() {
    setBusy(true);
    setMessage("");
    try {
      const { error } = await authClient.signIn.social({
        provider: "google",
        callbackURL: next,
      });
      if (error) throw new Error(error.message || "הכניסה עם Google נכשלה");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "הכניסה עם Google נכשלה");
      setBusy(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-brand"><span><Leaf /></span><div><strong>אורגנו</strong><small>Organic Growth OS</small></div></div>
        <p className="login-eyebrow">כניסה מאובטחת למערכת</p>
        <h1>ברוך הבא</h1>
        <p className="login-intro">הגישה לאורגנו ניתנת רק למשתמשים שאושרו או הוזמנו על ידי מנהל המערכת.</p>
        {denied && <div className="login-alert" role="alert">החשבון אומת, אך עדיין לא קיבל הרשאה להשתמש במערכת. פנה למנהל המערכת.</div>}
        {message && <div className="login-alert" role="alert">{message}</div>}
        <button className="google-login" type="button" onClick={googleLogin} disabled={busy}>
          <span aria-hidden="true">G</span> המשך באמצעות Google
        </button>
        <div className="login-separator"><span>או</span></div>
        <form onSubmit={login}>
          <label>כתובת דוא״ל<div className="login-field"><Mail /><input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" dir="ltr" /></div></label>
          <label>סיסמה<div className="login-field"><LockKeyhole /><input type={showPassword ? "text" : "password"} required autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" dir="ltr" /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "הסתר סיסמה" : "הצג סיסמה"}>{showPassword ? <EyeOff /> : <Eye />}</button></div></label>
          <button className="login-submit" disabled={busy}>{busy ? <LoaderCircle className="spin" /> : <LockKeyhole />} כניסה למערכת</button>
        </form>
        <a className="forgot-link" href="/forgot-password">שכחתי סיסמה</a>
        <p className="login-note">אין הרשמה פתוחה. חשבונות חדשים נוצרים או מוזמנים על ידי מנהל המערכת בלבד.</p>
      </section>
    </main>
  );
}
