import { getSetting } from '../db/db';

/**
 * צלילי משחק קצרים מסונתזים ב-WebAudio — בלי קובצי אודיו, בלי הורדות.
 * מכובדים דרך הגדרת "צלילים ורטט".
 *
 * אייפון (iOS Safari) — שלוש דרישות שחייבות להתקיים כדי שיישמע קול:
 * 1. את ה-AudioContext חייבים ליצור *בתוך* מחווה של המשתמש (לחיצה/נגיעה),
 *    לא ב-useEffect ולא בטעינת המודול. לכן `primeAudio()` נקרא מ-listener
 *    גלובלי של pointerdown/touchend/keydown שרץ בתוך המחווה עצמה.
 * 2. Safari ישן חושף רק `webkitAudioContext`.
 * 3. גם אחרי היצירה ה-context עלול לחזור למצב 'suspended' (למשל אחרי
 *    מעבר לרקע), ולכן מנגנים דרך `resume()` ומשמיעים ב-callback שלו.
 * בנוסף, iOS משתיק WebAudio כשמתג ה-Ring/Silent במצב שקט — לכן
 * `iosSilentSwitchLikely()` מאפשר למסך ההגדרות להסביר את זה להורה.
 */

type Ctor = typeof AudioContext;

let ctx: AudioContext | null = null;
let enabled = true;
let unlocked = false;

void getSetting('sound').then((v) => {
  enabled = v !== '0';
});

export function setSoundEnabled(on: boolean): void {
  enabled = on;
  if (on) primeAudio();
}

function ctor(): Ctor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as { AudioContext?: Ctor; webkitAudioContext?: Ctor };
  return w.AudioContext ?? w.webkitAudioContext ?? null;
}

/**
 * יוצר (או מעיר) את ה-AudioContext. חייב להיקרא בתוך מחווה של המשתמש
 * בפעם הראשונה — אחרת iOS ישאיר אותו 'suspended' לנצח.
 */
export function primeAudio(): void {
  const C = ctor();
  if (!C) return;
  try {
    ctx ??= new C();
    if (ctx.state === 'suspended') void ctx.resume();
    if (!unlocked) {
      // "צליל" באורך אפס — iOS מסמן את ה-context כמשוחרר רק אחרי
      // שמישהו באמת ניגן דרכו בתוך המחווה.
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      gain.gain.value = 0;
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.01);
      unlocked = true;
    }
  } catch {
    // אודיו לא זמין — ממשיכים בשקט
  }
}

/** מחבר מאזינים גלובליים שמשחררים את האודיו במגע הראשון. נקרא פעם אחת מ-main. */
export function installAudioUnlock(): void {
  if (typeof window === 'undefined') return;
  const unlock = () => {
    primeAudio();
    if (ctx && ctx.state === 'running') {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('touchend', unlock);
      window.removeEventListener('keydown', unlock);
    }
  };
  window.addEventListener('pointerdown', unlock);
  window.addEventListener('touchend', unlock);
  window.addEventListener('keydown', unlock);
  // חזרה מרקע באייפון משאירה context מושהה
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && ctx?.state === 'suspended') void ctx.resume();
  });
}

/** true כשסביר שמדובר ב-iOS — שם מתג השקט חוסם WebAudio לגמרי */
export function iosSilentSwitchLikely(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) || (/Mac/.test(ua) && 'ontouchend' in window);
}

type Note = [freq: number, durSec: number];

interface ToneOpts {
  type?: OscillatorType;
  gainLevel?: number;
  /** השהיה לפני תחילת הרצף (שניות) — לשכבות של פאנפרה */
  delay?: number;
  /** חפיפה בין תווים: 1 = רצף צמוד, <1 = מקוצר, >1 = מרווח */
  spacing?: number;
}

function play(notes: Note[], opts: ToneOpts = {}): void {
  if (!enabled) return;
  const { type = 'sine', gainLevel = 0.12, delay = 0, spacing = 0.9 } = opts;
  const C = ctor();
  if (!C) return;
  try {
    ctx ??= new C();
    const ac = ctx;
    const emit = () => {
      let t = ac.currentTime + delay;
      for (const [freq, dur] of notes) {
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        // התקפה קצרה מונעת "קליק" ברמקול של הטלפון
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(gainLevel, t + Math.min(0.012, dur / 3));
        gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        osc.connect(gain).connect(ac.destination);
        osc.start(t);
        osc.stop(t + dur + 0.02);
        t += dur * spacing;
      }
    };
    if (ac.state === 'suspended') {
      void ac.resume().then(emit, () => undefined);
    } else {
      emit();
    }
  } catch {
    // אודיו לא זמין — ממשיכים בשקט
  }
}

/** גליסנדו רציף — משמש לצליל סיבוב הגלגל */
function sweep(from: number, to: number, dur: number, gainLevel = 0.06): void {
  if (!enabled) return;
  const C = ctor();
  if (!C) return;
  try {
    ctx ??= new C();
    const ac = ctx;
    const emit = () => {
      const t = ac.currentTime;
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(from, t);
      osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), t + dur);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(gainLevel, t + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(gain).connect(ac.destination);
      osc.start(t);
      osc.stop(t + dur + 0.02);
    };
    if (ac.state === 'suspended') {
      void ac.resume().then(emit, () => undefined);
    } else {
      emit();
    }
  } catch {
    // אודיו לא זמין — ממשיכים בשקט
  }
}

export const sfx = {
  /** תשובה נכונה */
  success: () => play([[880, 0.09], [1318, 0.14]]),
  /** תשובה שגויה — עדין, לא מלחיץ */
  error: () => play([[240, 0.16]], { type: 'triangle', gainLevel: 0.08 }),
  /** נחיתת אות בגלגל */
  letter: () => play([[523, 0.07], [659, 0.07], [784, 0.12]]),
  /** קלף כוח הופעל */
  power: () => play([[660, 0.08], [880, 0.08], [660, 0.08]], { type: 'square', gainLevel: 0.07 }),
  /** טיק־טק בשניות האחרונות */
  tick: () => play([[1200, 0.04]], { type: 'square', gainLevel: 0.05 }),

  /** גלגל האות מתחיל להסתובב — סווש עולה שמלווה את ההאצה */
  spinStart: () => sweep(180, 620, 0.55, 0.05),
  /** קליק בודד לכל סיבוב של הגלגל */
  spinTick: (progress = 0) => play([[520 + progress * 520, 0.035]], { type: 'square', gainLevel: 0.045 }),
  /** הגלגל מאט לקראת עצירה */
  spinSlow: () => sweep(620, 240, 0.45, 0.045),
  /** האות נבחרה — "טה-דה!" קצר ומרוצה */
  select: () => {
    play([[784, 0.1], [1047, 0.1], [1568, 0.28]], { gainLevel: 0.13, spacing: 0.85 });
    play([[392, 0.1], [523, 0.1], [784, 0.3]], { type: 'triangle', gainLevel: 0.06, spacing: 0.85 });
  },

  /**
   * ניצחון / סיום משחק — פאנפרה בשלוש שכבות:
   * מלודיה עולה, בס תומך, ו"נצנוץ" גבוה בסוף.
   */
  win: () => {
    play([[523, 0.14], [659, 0.14], [784, 0.14], [1047, 0.18], [1319, 0.45]], { gainLevel: 0.13, spacing: 0.88 });
    play([[262, 0.2], [330, 0.2], [392, 0.2], [523, 0.5]], { type: 'triangle', gainLevel: 0.07, spacing: 0.95 });
    play([[2093, 0.09], [2637, 0.09], [3136, 0.2]], { gainLevel: 0.05, delay: 0.62, spacing: 0.8 });
  },
  /** ניצחון גדול (שיא אישי / כל התשובות נכונות) — פאנפרה ארוכה יותר */
  fanfare: () => {
    play([[523, 0.12], [523, 0.1], [523, 0.1], [659, 0.34]], { gainLevel: 0.12, spacing: 0.9 });
    play([[784, 0.14], [1047, 0.14], [1319, 0.16], [1568, 0.5]], { gainLevel: 0.12, delay: 0.62, spacing: 0.88 });
    play([[262, 0.3], [392, 0.3], [523, 0.6]], { type: 'triangle', gainLevel: 0.07, delay: 0.1, spacing: 0.95 });
    play([[2093, 0.08], [2637, 0.08], [3136, 0.08], [3951, 0.22]], { gainLevel: 0.045, delay: 1.15, spacing: 0.75 });
  }
};
