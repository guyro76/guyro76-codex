import { useState } from 'react';
import Globe from '../components/Globe';
import PasswordField from '../components/PasswordField';
import { useAuth, type InvitePreview } from '../store/authStore';
import { isRemembered, setRemembered } from '../lib/supabase';
import { TIERS } from '../lib/tiers';

/**
 * מסך הכניסה. כדור הארץ מסתובב עד שנכנסים.
 *
 * שלוש דרכים להיכנס — Google, Apple ומייל. אפל דורשת שאם מציעים
 * התחברות של ספק צד שלישי, תוצע גם Sign in with Apple (כלל 4.8),
 * ולכן שתיהן מופיעות יחד.
 */
type Mode = 'choose' | 'email-in' | 'email-up' | 'code';

export default function Login() {
  const {
    signInWithGoogle,
    signInWithApple,
    signInWithEmail,
    signUpWithEmail,
    previewInvite,
    busy,
    error,
    clearError
  } = useAuth();
  const providers = useAuth((s) => s.providers);
  const [mode, setMode] = useState<Mode>('choose');
  const [remember, setRemember] = useState(isRemembered());
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  // קוד הזמנה שנבדק ואושר, ומחכה למימוש ברגע שייווצר החשבון
  const [code, setCode] = useState('');
  const [checking, setChecking] = useState(false);
  const [preview, setPreview] = useState<InvitePreview | null>(null);

  const go = (next: Mode) => {
    clearError();
    setMode(next);
  };

  const acceptedCode = preview?.ok ? code.trim().toUpperCase() : undefined;

  const checkCode = async () => {
    setChecking(true);
    setPreview(await previewInvite(code));
    setChecking(false);
  };

  const submit = async () => {
    if (mode === 'email-up') {
      await signUpWithEmail(email, password, name || email.split('@')[0], acceptedCode);
    } else {
      await signInWithEmail(email, password);
    }
  };

  const emailValid = /\S+@\S+\.\S+/.test(email);
  const canSubmit = emailValid && password.length >= 6 && !busy;

  return (
    <div className="screen center">
      <Globe />

      <h1 style={{ marginTop: 18 }}>ארץ-עיר GO!</h1>
      <p className="dim" style={{ maxWidth: 420, margin: '0 auto 20px' }}>
        משחק ארץ-עיר משפחתי. נכנסים פעם אחת — ובפעם הבאה המשחק כבר מחכה לכם.
      </p>

      {error && (
        <div className="card" role="alert" style={{ maxWidth: 400, margin: '0 auto 14px', borderColor: 'var(--bad)' }}>
          {error}
        </div>
      )}

      {mode === 'choose' ? (
        <div className="card" style={{ maxWidth: 400, margin: '0 auto', display: 'grid', gap: 10 }}>
          {providers.google && (
            <button className="btn-primary" disabled={busy} onClick={() => void signInWithGoogle()}>
              להיכנס עם Google
            </button>
          )}
          {providers.apple && (
            <button disabled={busy} onClick={() => void signInWithApple()}>
               להיכנס עם Apple
            </button>
          )}
          <button className={providers.google ? '' : 'btn-primary'} disabled={busy} onClick={() => go('email-in')}>
            ✉️ להיכנס עם מייל
          </button>
          <button className="btn-ghost btn-small" disabled={busy} onClick={() => go('email-up')}>
            עוד אין לכם חשבון? להרשמה
          </button>

          <div className="invite-divider" role="separator">
            <span>או</span>
          </div>

          <button className="btn-small" disabled={busy} onClick={() => go('code')}>
            🎟️ יש לי קוד הזמנה
          </button>
        </div>
      ) : mode === 'code' ? (
        <div className="card" style={{ maxWidth: 400, margin: '0 auto', display: 'grid', gap: 10 }}>
          <h2 style={{ margin: 0 }}>🎟️ יש לכם קוד?</h2>
          <p className="dim" style={{ margin: 0, fontSize: '0.9rem' }}>
            הקלידו אותו כאן, ונפתח לכם את המשחק ברגע שתירשמו.
          </p>

          <label>
            <span className="dim">קוד הזמנה</span>
            <input
              type="text"
              dir="ltr"
              inputMode="text"
              spellCheck={false}
              autoCapitalize="characters"
              placeholder="ABCD1234"
              value={code}
              style={{ textAlign: 'center', letterSpacing: '0.22em', fontSize: '1.25rem', fontWeight: 700 }}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setPreview(null); // כל הקלדה מבטלת בדיקה קודמת
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && code.trim() && !checking) void checkCode();
              }}
            />
          </label>

          {preview && (
            <div
              className="card"
              role="status"
              style={{ margin: 0, borderColor: preview.ok ? 'var(--ok)' : 'var(--bad)' }}
            >
              {preview.ok && preview.tier ? (
                <>
                  <strong style={{ color: 'var(--ok)' }}>הקוד תקף! 🎉</strong>
                  <div style={{ marginTop: 4 }}>
                    {TIERS[preview.tier].icon} חבילת {TIERS[preview.tier].name} ל-{preview.days} ימים
                  </div>
                  <div className="dim" style={{ fontSize: '0.85rem', marginTop: 4 }}>
                    {TIERS[preview.tier].blurb}
                  </div>
                </>
              ) : (
                <span className="bad">{preview.message}</span>
              )}
            </div>
          )}

          {preview?.ok ? (
            <button className="btn-primary" onClick={() => go('email-up')}>
              ממשיכים להרשמה ←
            </button>
          ) : (
            <button className="btn-primary" disabled={!code.trim() || checking} onClick={() => void checkCode()}>
              {checking ? 'בודקים…' : 'בדיקת הקוד'}
            </button>
          )}

          <button className="btn-ghost btn-small" onClick={() => go('choose')}>
            ← לדרכי הכניסה האחרות
          </button>
        </div>
      ) : (
        <div className="card" style={{ maxWidth: 400, margin: '0 auto', display: 'grid', gap: 10 }}>
          <h2 style={{ margin: 0 }}>{mode === 'email-up' ? 'הרשמה' : 'כניסה עם מייל'}</h2>

          {mode === 'email-up' && acceptedCode && preview?.tier && (
            <div className="card invite-chip" role="status" style={{ margin: 0 }}>
              🎟️ הקוד <strong dir="ltr">{acceptedCode}</strong> מחכה לכם — {TIERS[preview.tier].icon}{' '}
              {TIERS[preview.tier].name} ל-{preview.days} ימים, יופעל אוטומטית בסיום ההרשמה.
            </div>
          )}

          {mode === 'email-up' && (
            <label>
              <span className="dim">איך קוראים לכם?</span>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            </label>
          )}

          <label>
            <span className="dim">מייל</span>
            <input
              type="email"
              inputMode="email"
              dir="ltr"
              spellCheck={false}
              autoCapitalize="none"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </label>

          <PasswordField
            label="סיסמה (לפחות 6 תווים)"
            value={password}
            onChange={setPassword}
            autoComplete={mode === 'email-up' ? 'new-password' : 'current-password'}
            onEnter={() => canSubmit && void submit()}
          />

          <label className="row" style={{ gap: 8, alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={remember}
              style={{ width: 22, minHeight: 22, margin: 0 }}
              onChange={(e) => {
                setRemember(e.target.checked);
                setRemembered(e.target.checked);
              }}
            />
            <span>לזכור אותי בכניסה הבאה</span>
          </label>

          <button className="btn-primary" disabled={!canSubmit} onClick={() => void submit()}>
            {busy ? 'רגע…' : mode === 'email-up' ? 'יוצרים חשבון' : 'כניסה'}
          </button>

          <button className="btn-ghost btn-small" onClick={() => go(mode === 'email-up' ? 'email-in' : 'email-up')}>
            {mode === 'email-up' ? 'כבר יש לי חשבון' : 'אין לי חשבון — להרשמה'}
          </button>
          <button className="btn-ghost btn-small" onClick={() => go('choose')}>
            ← לדרכי הכניסה האחרות
          </button>
        </div>
      )}

      <p className="dim" style={{ fontSize: '0.82rem', maxWidth: 400, margin: '18px auto 0' }}>
        בכניסה אתם מאשרים את{' '}
        <a href="/privacy.html" target="_blank" rel="noopener noreferrer">
          מדיניות הפרטיות
        </a>
        . אנחנו לא מציגים פרסומות ולא מוכרים מידע לאף אחד.
      </p>
    </div>
  );
}
