import { useState } from 'react';
import TopBar from '../components/TopBar';
import Modal from '../components/Modal';
import { useApp } from '../store/appStore';
import { useAuth, useCapabilities } from '../store/authStore';
import { TIERS, TIER_ORDER, remainingLabel } from '../lib/tiers';
import { deleteAccount, type DeleteAccountResult } from '../lib/supabase';
import { db } from '../db/db';

/**
 * החשבון של המשתמש: מי הוא, איזו חבילה יש לו, ומימוש קוד הזמנה.
 * מכאן גם יוצאים מהחשבון.
 */
export default function Account() {
  const { navigate } = useApp();
  const account = useAuth((s) => s.account);
  const signOut = useAuth((s) => s.signOut);
  const redeemCode = useAuth((s) => s.redeemCode);
  const caps = useCapabilities();
  const loadProfiles = useApp((s) => s.loadProfiles);
  const [erasing, setErasing] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [wiping, setWiping] = useState(false);
  const [failed, setFailed] = useState(false);

  /** המילה שצריך להקליד כדי לאשר — מגן מפני לחיצה אחת בטעות */
  const CONFIRM_WORD = 'מחיקה';

  /**
   * מחיקת חשבון: קודם השרת, אחר כך המכשיר.
   *
   * הסדר חשוב. אם מוחקים קודם את המכשיר ואז השרת נכשל, נשאר חשבון
   * בשרת בלי שום דרך להגיע אליו — בדיוק ההפך ממה שהמחיקה הבטיחה.
   * לכן כשהשרת נכשל עוצרים ואומרים זאת, בלי למחוק כלום.
   */
  const eraseEverything = async () => {
    if (wiping) return;
    setWiping(true);
    setFailed(false);

    const result: DeleteAccountResult = await deleteAccount();
    if (result === 'failed') {
      setWiping(false);
      setFailed(true);
      return;
    }

    // המידע במכשיר נמחק בכל מקרה — גם בבנייה בלי חשבונות כלל
    await db.delete();
    await db.open();
    await loadProfiles();
    await signOut();
    navigate('splash');
  };

  const [code, setCode] = useState('');
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const redeem = async () => {
    if (!code.trim()) return;
    setBusy(true);
    setResult(await redeemCode(code.trim()));
    setBusy(false);
    setCode('');
  };

  const current = account ? TIERS[account.tier] : TIERS.free;
  const left = remainingLabel(account?.tierExpiresAt ?? null);

  return (
    <div className="screen">
      <TopBar title="👤 החשבון שלי" />

      <div className="card">
        <h3 style={{ marginTop: 0 }}>{account?.displayName ?? 'שחקן'}</h3>
        <p className="dim" dir="ltr" style={{ marginTop: 0 }}>
          {account?.email ?? '—'}
        </p>
        {account?.role === 'admin' && (
          <p className="gold" style={{ margin: '6px 0 0' }}>
            🛠️ מנהל מערכת — כל היכולות פתוחות
          </p>
        )}
      </div>

      <div className="card" style={{ marginTop: 14, borderColor: 'var(--gold)' }}>
        <h3 style={{ marginTop: 0 }}>
          {current.icon} החבילה שלי: {current.name}
        </h3>
        <p className="dim" style={{ marginTop: 0 }}>
          {current.blurb}
          {left ? ` · ${left}` : ''}
        </p>
        <ul style={{ lineHeight: 1.8, margin: '8px 0 0' }}>
          <li>עד {caps.maxProfiles} פרופילים</li>
          <li>עד {caps.maxRounds} סיבובים במשחק</li>
          <li>{caps.letterSwaps} החלפות אות למשחק</li>
          <li>{caps.customCategories ? '✅' : '🔒'} קטגוריות משלכם</li>
          <li>{caps.cloudSync ? '✅' : '🔒'} סנכרון בין מכשירים</li>
          <li>{caps.onlineLeaderboard ? '✅' : '🔒'} לוח שיאים משפחתי מקוון</li>
        </ul>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <h3 style={{ marginTop: 0 }}>🎁 יש לכם קוד הזמנה?</h3>
        <p className="dim" style={{ marginTop: 0 }}>
          מזינים אותו כאן ומקבלים את החבילה מיד.
        </p>
        <div className="row" style={{ gap: 8 }}>
          <input
            type="text"
            dir="ltr"
            spellCheck={false}
            autoCapitalize="characters"
            autoComplete="off"
            value={code}
            placeholder="ABCD-1234"
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && void redeem()}
            aria-label="קוד הזמנה"
          />
          <button className="btn-primary" disabled={busy || !code.trim()} onClick={() => void redeem()}>
            {busy ? '…' : 'מימוש'}
          </button>
        </div>
        {result && (
          <p role="status" style={{ color: result.ok ? 'var(--ok)' : 'var(--bad)', marginBottom: 0 }}>
            {result.message}
          </p>
        )}
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <h3 style={{ marginTop: 0 }}>כל החבילות</h3>
        <div style={{ display: 'grid', gap: 8 }}>
          {TIER_ORDER.map((t) => {
            const spec = TIERS[t];
            const isCurrent = account?.tier === t;
            return (
              <div
                key={t}
                style={{
                  padding: 10,
                  borderRadius: 12,
                  border: `1px solid ${isCurrent ? 'var(--gold)' : 'var(--border-glass)'}`
                }}
              >
                <strong>
                  {spec.icon} {spec.name}
                </strong>
                {isCurrent && <span className="gold"> · הנוכחית</span>}
                <div className="dim" style={{ fontSize: '0.88rem' }}>
                  {spec.blurb}
                </div>
              </div>
            );
          })}
        </div>
        <p className="dim" style={{ fontSize: '0.82rem', marginBottom: 0 }}>
          כרגע אין מכירה בתוך המשחק — חבילות ניתנות בקוד הזמנה בלבד.
        </p>
      </div>

      {account?.role === 'admin' && (
        <button className="btn-gold" style={{ width: '100%', marginTop: 14 }} onClick={() => navigate('admin')}>
          🛠️ פאנל ניהול
        </button>
      )}

      <button
        className="btn-ghost"
        style={{ width: '100%', marginTop: 10 }}
        onClick={() => void signOut()}
      >
        יציאה מהחשבון
      </button>

      {/* מחיקת חשבון מתוך האפליקציה — דרישה של אפל מרגע שיש הרשמה,
          וגם ההבטחה שמדיניות הפרטיות כבר נותנת. */}
      <div className="card" style={{ marginTop: 18 }}>
        <h3 style={{ marginTop: 0 }}>🗑️ מחיקת החשבון</h3>
        <p className="dim" style={{ margin: '4px 0 10px', fontSize: '0.9rem' }}>
          מוחק את החשבון מהשרת ואת כל המידע מהמכשיר — פרופילים, אוסף המילים,
          פאזלים והישגים. אי אפשר לשחזר.
        </p>
        <button className="btn-coral" onClick={() => setErasing(true)}>
          מחיקת החשבון והמידע…
        </button>
      </div>

      {erasing && (
        <Modal
          onClose={() => {
            setErasing(false);
            setConfirmText('');
            setFailed(false);
          }}
        >
          <div>
            <h2 style={{ marginTop: 0 }}>🗑️ למחוק את החשבון?</h2>
            <p>
              כל מה שנצבר יימחק לתמיד: הפרופילים, אוסף המילים, הפאזלים, ההישגים והארנק.
              <strong> אין דרך לשחזר.</strong>
            </p>
            <p className="dim" style={{ fontSize: '0.9rem' }}>
              כדי לאשר, הקלידו <strong>{CONFIRM_WORD}</strong>:
            </p>
            <input
              type="text"
              aria-label={`הקלידו ${CONFIRM_WORD} כדי לאשר מחיקה`}
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              style={{ width: '100%' }}
            />

            {failed && (
              <p className="bad" role="status" style={{ fontSize: '0.9rem' }}>
                לא הצלחנו למחוק את החשבון בשרת, ולכן לא נמחק כלום. נסו שוב כשיש חיבור לאינטרנט.
              </p>
            )}

            <div className="row" style={{ justifyContent: 'center', gap: 8, marginTop: 12 }}>
              <button
                className="btn-coral"
                disabled={wiping || confirmText.trim() !== CONFIRM_WORD}
                onClick={() => void eraseEverything()}
              >
                {wiping ? 'מוחקים…' : 'כן, למחוק הכול'}
              </button>
              <button
                className="btn-primary"
                disabled={wiping}
                onClick={() => {
                  setErasing(false);
                  setConfirmText('');
                  setFailed(false);
                }}
              >
                ביטול
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
