"use client";

import { FormEvent, useState } from "react";
import { InfoPage } from "@/components/InfoPage";

export default function PrivacyRequestPage() {
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setStatus("");
    const form = new FormData(event.currentTarget);
    const payload = {
      email: String(form.get("email") || ""),
      type: String(form.get("type") || ""),
      details: String(form.get("details") || ""),
      website: String(form.get("website") || ""),
    };
    try {
      const response = await fetch("/api/privacy-request", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "הבקשה נכשלה");
      setStatus("הבקשה התקבלה. ייתכן שנפנה אליך לצורך אימות זהות.");
      event.currentTarget.reset();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "לא ניתן לשלוח את הבקשה");
    } finally {
      setBusy(false);
    }
  }

  return (
    <InfoPage eyebrow="זכויות פרטיות" title="בקשה לעיון, תיקון או מחיקת מידע" intro="ניתן להגיש בקשה בנוגע למידע אישי המשויך לחשבון או לפעילות במערכת.">
      <section><h2>לפני שליחה</h2><p>לשם הגנה על מידע נבקש לאמת את זהות הפונה. אין לשלוח סיסמה, צילום תעודה או מידע רגיש בטופס זה.</p></section>
      <form className="privacy-form" onSubmit={submit}>
        <label>כתובת דוא״ל<input name="email" type="email" required autoComplete="email" /></label>
        <label>סוג הבקשה<select name="type" required defaultValue=""><option value="" disabled>בחר סוג בקשה</option><option value="access">עיון במידע</option><option value="correction">תיקון מידע</option><option value="deletion">מחיקת מידע</option><option value="export">ייצוא מידע</option><option value="objection">התנגדות לעיבוד</option><option value="other">אחר</option></select></label>
        <label>פרטים נוספים<textarea name="details" rows={6} maxLength={4000} /></label>
        <label className="privacy-honeypot" aria-hidden="true">אתר<input name="website" tabIndex={-1} autoComplete="off" /></label>
        <button type="submit" disabled={busy}>{busy ? "שולח..." : "שליחת בקשה"}</button>
      </form>
      {status && <p role="status" aria-live="polite">{status}</p>}
    </InfoPage>
  );
}
