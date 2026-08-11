import { useId, useState } from 'react';

/**
 * שדה סיסמה עם עין.
 *
 * ילד שמקליד סיסמה ולא רואה מה יצא מוחק הכול ומתחיל מחדש. הכפתור
 * הוא button אמיתי עם שם נגיש, ולא אייקון לחיץ — כדי שגם מקלדת
 * וגם קורא מסך יגיעו אליו.
 */
interface Props {
  value: string;
  onChange: (value: string) => void;
  label: string;
  autoComplete: 'current-password' | 'new-password';
  onEnter?: () => void;
}

export default function PasswordField({ value, onChange, label, autoComplete, onEnter }: Props) {
  const [shown, setShown] = useState(false);
  const id = useId();

  return (
    <div>
      <label htmlFor={id}>
        <span className="dim">{label}</span>
      </label>
      <div style={{ position: 'relative' }}>
        <input
          id={id}
          type={shown ? 'text' : 'password'}
          dir="ltr"
          spellCheck={false}
          autoCapitalize="none"
          value={value}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onEnter?.()}
          style={{ paddingInlineEnd: 52 }}
        />
        <button
          type="button"
          className="btn-ghost pw-eye"
          aria-label={shown ? 'להסתיר את הסיסמה' : 'להציג את הסיסמה'}
          aria-pressed={shown}
          onClick={() => setShown((s) => !s)}
        >
          {shown ? '🙈' : '👁️'}
        </button>
      </div>
    </div>
  );
}
