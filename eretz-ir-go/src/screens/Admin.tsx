import { useCallback, useEffect, useState } from 'react';
import TopBar from '../components/TopBar';
import { useAuth } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { TIERS, TIER_ORDER, remainingLabel, type Tier } from '../lib/tiers';

/**
 * פאנל הניהול.
 *
 * מה שאפשר לעשות כאן מוגבל גם בשרת ולא רק במסך: כל הקריאות עוברות
 * דרך RLS שמאפשר אותן רק לחשבון עם role=admin. מסך שנפתח בטעות אצל
 * מי שאינו מנהל פשוט לא יקבל נתונים.
 */
interface AccountRow {
  id: string;
  email: string | null;
  display_name: string | null;
  role: 'user' | 'admin';
  tier: Tier;
  tier_expires_at: string | null;
}

interface InviteRow {
  id: string;
  code: string;
  tier: Tier;
  days: number;
  max_uses: number;
  used_count: number;
  note: string | null;
  expires_at: string | null;
  created_at: string;
}

/** קוד קריא לאדם: בלי תווים שמתבלבלים ביניהם (0/O, 1/I) */
function makeCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  for (const b of bytes) out += alphabet[b % alphabet.length];
  return `${out.slice(0, 4)}-${out.slice(4)}`;
}

export default function Admin() {
  const account = useAuth((s) => s.account);
  const isAdmin = account?.role === 'admin';

  const [users, setUsers] = useState<AccountRow[]>([]);
  const [invites, setInvites] = useState<InviteRow[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // טופס הזמנה חדשה
  const [tier, setTier] = useState<Tier>('silver');
  const [days, setDays] = useState(7);
  const [maxUses, setMaxUses] = useState(1);
  const [note, setNote] = useState('');

  const load = useCallback(async () => {
    const client = supabase();
    if (!client || !isAdmin) {
      setLoading(false);
      return;
    }
    const [a, i] = await Promise.all([
      client.from('accounts').select('*').order('created_at', { ascending: false }).limit(200),
      client.from('invitations').select('*').order('created_at', { ascending: false }).limit(100)
    ]);
    if (a.data) setUsers(a.data as AccountRow[]);
    if (i.data) setInvites(i.data as InviteRow[]);
    setLoading(false);
  }, [isAdmin]);

  useEffect(() => {
    void load();
  }, [load]);

  const createInvite = async () => {
    const client = supabase();
    if (!client || !account) return;
    const code = makeCode();
    const { error } = await client.from('invitations').insert({
      code,
      tier,
      days,
      max_uses: maxUses,
      note: note.trim() || null,
      created_by: account.id
    });
    setStatus(error ? `לא הצלחנו ליצור קוד: ${error.message}` : `נוצר קוד ${code}`);
    if (!error) {
      setNote('');
      await load();
    }
  };

  const setUserTier = async (id: string, next: Tier, forDays: number) => {
    const client = supabase();
    if (!client) return;
    const expires =
      next === 'free' ? null : new Date(Date.now() + forDays * 86_400_000).toISOString();
    const { error } = await client
      .from('accounts')
      .update({ tier: next, tier_expires_at: expires })
      .eq('id', id);
    setStatus(error ? `העדכון נכשל: ${error.message}` : 'החבילה עודכנה');
    await load();
  };

  const copy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setStatus(`הקוד ${code} הועתק`);
    } catch {
      setStatus(`הקוד הוא ${code}`);
    }
  };

  if (!isAdmin) {
    return (
      <div className="screen">
        <TopBar title="🛠️ ניהול" />
        <div className="card center">
          <h2>המסך הזה למנהלי מערכת</h2>
          <p className="dim">אם זו טעות, כדאי לצאת ולהיכנס שוב.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="screen">
      <TopBar title="🛠️ ניהול מערכת" />

      {status && (
        <div className="card" role="status" style={{ marginBottom: 12, borderColor: 'var(--turquoise)' }}>
          {status}
        </div>
      )}

      <div className="card">
        <h3 style={{ marginTop: 0 }}>🎁 הזמנה חדשה</h3>
        <p className="dim">
          יוצרים קוד, שולחים למי שרוצים, והוא מקבל את החבילה לזמן שהוגדר. למשל: כסף לשבוע.
        </p>

        <div className="grid grid-2" style={{ gap: 10 }}>
          <label>
            <span className="dim">חבילה</span>
            <select value={tier} onChange={(e) => setTier(e.target.value as Tier)}>
              {TIER_ORDER.filter((t) => t !== 'free').map((t) => (
                <option key={t} value={t}>
                  {TIERS[t].icon} {TIERS[t].name}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="dim">לכמה ימים</span>
            <select value={days} onChange={(e) => setDays(Number(e.target.value))}>
              <option value={7}>שבוע</option>
              <option value={14}>שבועיים</option>
              <option value={30}>חודש</option>
              <option value={90}>3 חודשים</option>
              <option value={365}>שנה</option>
            </select>
          </label>

          <label>
            <span className="dim">כמה אנשים יכולים לממש</span>
            <input
              type="number"
              min={1}
              max={500}
              value={maxUses}
              onChange={(e) => setMaxUses(Math.max(1, Number(e.target.value) || 1))}
            />
          </label>

          <label>
            <span className="dim">הערה (לעצמכם)</span>
            <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="למשל: כיתה ג׳" />
          </label>
        </div>

        <button className="btn-primary" style={{ marginTop: 12 }} onClick={() => void createInvite()}>
          יצירת קוד הזמנה
        </button>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <h3 style={{ marginTop: 0 }}>הזמנות פעילות ({invites.length})</h3>
        {invites.length === 0 ? (
          <p className="dim">עדיין לא נוצרו קודים.</p>
        ) : (
          <div style={{ display: 'grid', gap: 8 }}>
            {invites.map((inv) => (
              <div
                key={inv.id}
                className="row"
                style={{ justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}
              >
                <div>
                  <strong style={{ fontFamily: 'monospace', fontSize: '1.05rem' }} dir="ltr">
                    {inv.code}
                  </strong>
                  <div className="dim" style={{ fontSize: '0.85rem' }}>
                    {TIERS[inv.tier].icon} {TIERS[inv.tier].name} · {inv.days} ימים · נוצל{' '}
                    {inv.used_count}/{inv.max_uses}
                    {inv.note ? ` · ${inv.note}` : ''}
                  </div>
                </div>
                <button className="btn-small" onClick={() => void copy(inv.code)}>
                  העתקה
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <h3 style={{ marginTop: 0 }}>משתמשים ({users.length})</h3>
        {loading ? (
          <p className="dim">טוען…</p>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {users.map((u) => (
              <div key={u.id} style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: 8 }}>
                <div className="row" style={{ justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                  <div>
                    <strong>{u.display_name ?? '—'}</strong>
                    {u.role === 'admin' && <span className="gold"> · מנהל</span>}
                    <div className="dim" style={{ fontSize: '0.85rem' }} dir="ltr">
                      {u.email}
                    </div>
                  </div>
                  <div className="dim" style={{ fontSize: '0.85rem' }}>
                    {TIERS[u.tier].icon} {TIERS[u.tier].name}
                    {u.tier_expires_at ? ` · ${remainingLabel(u.tier_expires_at)}` : ''}
                  </div>
                </div>
                <div className="row" style={{ gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                  {TIER_ORDER.map((t) => (
                    <button
                      key={t}
                      className="btn-small"
                      aria-label={`להעביר את ${u.display_name ?? u.email} לחבילת ${TIERS[t].name}`}
                      onClick={() => void setUserTier(u.id, t, 30)}
                    >
                      {TIERS[t].icon}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
