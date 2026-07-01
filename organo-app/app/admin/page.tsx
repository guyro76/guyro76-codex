"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Building2, RefreshCw, ShieldCheck, UserPlus, Users, UserRoundPlus } from "lucide-react";
import "./admin.css";

type Profile = { id: string; email: string; full_name: string; platform_role: string; access_status: string; created_at: string };
type Organization = { id: string; name: string; slug: string; organization_type: string; status: string; owner_user_id: string; created_at: string };
type Client = { id: string; organization_id: string; name: string; website_url?: string; business_type?: string; status: string; created_at: string };
type PrivacyRequest = { id: string; requester_email: string; request_type: string; status: string; created_at: string };
type AuditLog = { id: number; action: string; entity_type: string; entity_id?: string; actor_user_id?: string; created_at: string };
type AdminData = { profiles: Profile[]; organizations: Organization[]; clients: Client[]; privacyRequests: PrivacyRequest[]; auditLogs: AuditLog[] };

async function requestAdmin(body?: Record<string, string>) {
  const response = await fetch("/api/admin", body ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) } : { cache: "no-store" });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "הפעולה נכשלה");
  return data;
}

export default function AdminPage() {
  const [data, setData] = useState<AdminData | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const activeUsers = useMemo(() => data?.profiles.filter((item) => item.access_status === "active").length || 0, [data]);

  async function load() {
    setBusy(true);
    setMessage("");
    try { setData(await requestAdmin()); } catch (error) { setMessage(error instanceof Error ? error.message : "טעינת הנתונים נכשלה"); } finally { setBusy(false); }
  }

  useEffect(() => { void load(); }, []);

  async function submit(event: FormEvent<HTMLFormElement>, action: string) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const body: Record<string, string> = { action };
    form.forEach((value, key) => { body[key] = String(value); });
    setBusy(true);
    setMessage("");
    try {
      await requestAdmin(body);
      event.currentTarget.reset();
      setMessage("הפעולה בוצעה בהצלחה");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "הפעולה נכשלה");
    } finally { setBusy(false); }
  }

  return (
    <main className="admin-shell">
      <header className="admin-hero"><div><p>פאנל מנהל מערכת</p><h1>ניהול אורגנו</h1><span>גישה בלעדית למנהל הפלטפורמה</span></div><button onClick={() => void load()} disabled={busy}><RefreshCw /> רענון</button></header>
      {message && <p className="admin-message" role="status">{message}</p>}
      <section className="admin-stats"><article><ShieldCheck/><div><strong>{activeUsers}</strong><span>משתמשים פעילים</span></div></article><article><Building2/><div><strong>{data?.organizations.length || 0}</strong><span>ארגונים וסוכנויות</span></div></article><article><Users/><div><strong>{data?.clients.length || 0}</strong><span>לקוחות</span></div></article></section>

      <section className="admin-grid">
        <article className="admin-card"><h2><UserPlus/> הזמנת משתמש</h2><form onSubmit={(event) => void submit(event, "invite-user")}><label>שם מלא<input name="fullName" required /></label><label>דוא״ל<input name="email" type="email" required dir="ltr" /></label><button disabled={busy}>שליחת הזמנה</button></form></article>
        <article className="admin-card"><h2><Building2/> יצירת ארגון</h2><form onSubmit={(event) => void submit(event, "create-organization")}><label>שם הארגון<input name="name" required /></label><label>Slug<input name="slug" required dir="ltr" /></label><label>סוג<select name="organizationType"><option value="agency">סוכנות</option><option value="office">משרד</option><option value="client">לקוח ישיר</option></select></label><label>בעלים<select name="ownerUserId" required defaultValue=""><option value="" disabled>בחר משתמש</option>{data?.profiles.filter((item) => item.access_status === "active").map((item) => <option key={item.id} value={item.id}>{item.full_name || item.email}</option>)}</select></label><button disabled={busy}>יצירת ארגון</button></form></article>
        <article className="admin-card"><h2><UserRoundPlus/> יצירת לקוח</h2><form onSubmit={(event) => void submit(event, "create-client")}><label>ארגון<select name="organizationId" required defaultValue=""><option value="" disabled>בחר ארגון</option>{data?.organizations.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label>שם הלקוח<input name="name" required /></label><label>אתר<input name="websiteUrl" type="url" dir="ltr" /></label><label>תחום<input name="businessType" /></label><label>איש קשר<input name="contactName" /></label><label>דוא״ל<input name="contactEmail" type="email" dir="ltr" /></label><button disabled={busy}>יצירת לקוח</button></form></article>
      </section>

      <section className="admin-card admin-table-card"><h2>משתמשים</h2><div className="admin-table-wrap"><table><thead><tr><th>שם</th><th>דוא״ל</th><th>תפקיד</th><th>סטטוס</th><th>פעולה</th></tr></thead><tbody>{data?.profiles.map((user) => <tr key={user.id}><td>{user.full_name || "-"}</td><td dir="ltr">{user.email}</td><td>{user.platform_role}</td><td>{user.access_status}</td><td>{user.email.toLowerCase() === "guyro76@gmail.com" ? <strong>מנהל מערכת</strong> : <form onSubmit={(event) => void submit(event, "set-user-status")}><input type="hidden" name="userId" value={user.id}/><select name="status" defaultValue={user.access_status}><option value="active">פעיל</option><option value="pending">ממתין</option><option value="suspended">מושעה</option><option value="revoked">מבוטל</option></select><button disabled={busy}>עדכון</button></form>}</td></tr>)}</tbody></table></div></section>

      <section className="admin-grid lower"><article className="admin-card"><h2>בקשות פרטיות</h2>{data?.privacyRequests.length ? data.privacyRequests.map((item) => <div className="admin-list-item" key={item.id}><div><strong>{item.requester_email}</strong><small>{item.request_type} · {new Date(item.created_at).toLocaleDateString("he-IL")}</small></div><form onSubmit={(event) => void submit(event, "set-privacy-status")}><input type="hidden" name="requestId" value={item.id}/><select name="status" defaultValue={item.status}><option value="received">התקבלה</option><option value="verifying">באימות</option><option value="processing">בטיפול</option><option value="completed">הושלמה</option><option value="rejected">נדחתה</option></select><button disabled={busy}>עדכון</button></form></div>) : <p>אין בקשות פתוחות.</p>}</article><article className="admin-card"><h2>Audit Log</h2>{data?.auditLogs.length ? data.auditLogs.slice(0, 30).map((item) => <div className="admin-list-item" key={item.id}><div><strong>{item.action}</strong><small>{item.entity_type} · {new Date(item.created_at).toLocaleString("he-IL")}</small></div></div>) : <p>אין אירועים להצגה.</p>}</article></section>
    </main>
  );
}
