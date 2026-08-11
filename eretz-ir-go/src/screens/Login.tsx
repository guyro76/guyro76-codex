import { useState } from 'react';
import Globe from '../components/Globe';
import { useAuth } from '../store/authStore';

/**
 * מסך הכניסה. כדור הארץ מסתובב עד שנכנסים.
 *
 * שלוש דרכים להיכנס — Google, Apple ומייל. אפל דורשת שאם מציעים
 * התחברות של ספק צד שלישי, תוצע גם Sign in with Apple (כלל 4.8),
 * ולכן שתיהן מופיעות יחד.
 */
type Mode = 'choose' | 'email-in' | 'email-up';

export default function Login() {
  const { signInWithGoogle, signInWithApple, signInWithEmail, signUpWithEmail, busy, error, clearError } =
    useAuth();
  const [mode, setMode] = useState<Mode>('choose');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const go = (next: Mode) => {
    clearError();
    setMode(next);
  };

  const submit = async () => {
    if (mode === 'email-up') await signUpWithEmail(email, password, name || email.split('@')[0]);
    else await signInWithEmail(email, password);
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
          <button className="btn-primary" disabled={busy} onClick={() => void signInWithGoogle()}>
            להיכנס עם Google
          </button>
          <button disabled={busy} onClick={() => void signInWithApple()}>
             להיכנס עם Apple
          </button>
          <button disabled={busy} onClick={() => go('email-in')}>
            ✉️ להיכנס עם מייל
          </button>
          <button className="btn-ghost btn-small" disabled={busy} onClick={() => go('email-up')}>
            עוד אין לכם חשבון? להרשמה
          </button>
        </div>
      ) : (
        <div className="card" style={{ maxWidth: 400, margin: '0 auto', display: 'grid', gap: 10 }}>
          <h2 style={{ margin: 0 }}>{mode === 'email-up' ? 'הרשמה' : 'כניסה עם מייל'}</h2>

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

          <label>
            <span className="dim">סיסמה (לפחות 6 תווים)</span>
            <input
              type="password"
              dir="ltr"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'email-up' ? 'new-password' : 'current-password'}
              onKeyDown={(e) => e.key === 'Enter' && canSubmit && void submit()}
            />
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
