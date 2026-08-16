import { audioContext, getAudioMode, onAudioModeChange, primeAudio } from './sound';

/**
 * מוזיקת רקע בסגנון שעשועון טלוויזיה — פעימת בס קבועה שדוחפת קדימה,
 * ומעליה מוטיב קצר שחוזר. מנוגנת בזמן הסיבוב ונעצרת ברגע שהוא נגמר.
 *
 * **הכול מסונתז ב-WebAudio, בלי קובץ אודיו.** זו לא קפריזה: קובץ
 * מוזיקה לולאתי סביר שוקל כמה מגה־בייט, והמשחק חייב לעבוד אופליין
 * ולהיטען מהר ברשת סלולרית. מנגינה מסונתזת שוקלת אפס.
 *
 * התזמון נעשה מול השעון של כרטיס הקול ולא מול `setInterval`. שעון
 * הדפדפן נסחף ונחנק כשהלשונית עסוקה, ומנגינה שנסחפת נשמעת שבורה;
 * המתזמן כאן רק *מתזמן מראש* חלון קצר, וההשמעה עצמה מדויקת.
 */

/** קצב: 100 פעימות לדקה — דוחף אבל לא מלחיץ ילדים */
const BPM = 100;
const BEAT = 60 / BPM;

/** כמה קדימה מתזמנים, וכל כמה זמן בודקים. יחס בטוח גם בלשונית עמוסה */
const LOOKAHEAD_S = 0.35;
const TICK_MS = 60;

/** עוצמה נמוכה בכוונה: המוזיקה יושבת מתחת לצלילי המשחק, לא מעליהם */
const MUSIC_GAIN = 0.05;

/** בס: לה מינור — סולם שנשמע "מתח נעים" ולא מאיים */
const BASS: number[] = [110, 110, 130.81, 110, 98, 98, 110, 110];
/** מוטיב עליון, אחד לכל שתי פעימות */
const MOTIF: (number | null)[] = [440, null, 523.25, null, 493.88, null, 440, null];

let timer: ReturnType<typeof setInterval> | null = null;
let nextNoteTime = 0;
let step = 0;
let master: GainNode | null = null;
let wanted = false; // האם המסך ביקש מוזיקה

function voice(ctx: AudioContext, freq: number, at: number, dur: number, type: OscillatorType, level: number): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, at);
  // מעטפת רכה — התחלה חדה מדי נשמעת כמו נקישה
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(level, at + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  osc.connect(gain).connect(master ?? ctx.destination);
  osc.start(at);
  osc.stop(at + dur + 0.02);
}

function scheduleStep(ctx: AudioContext, at: number): void {
  const i = step % BASS.length;
  voice(ctx, BASS[i], at, BEAT * 0.55, 'triangle', 0.9);

  const note = MOTIF[i];
  if (note) voice(ctx, note, at, BEAT * 0.42, 'sine', 0.45);

  // נקישה קלה בכל פעימה שנייה — הדופק של השעשועון
  if (i % 2 === 1) voice(ctx, 1600, at, 0.03, 'square', 0.12);

  step++;
}

function pump(): void {
  const ctx = audioContext();
  if (!ctx) return;
  while (nextNoteTime < ctx.currentTime + LOOKAHEAD_S) {
    scheduleStep(ctx, nextNoteTime);
    nextNoteTime += BEAT;
  }
}

/** מתחילה מוזיקת רקע. בטוחה לקריאה חוזרת */
export function startMusic(): void {
  wanted = true;
  if (getAudioMode() !== 'all') return;

  primeAudio();
  const ctx = audioContext();
  if (!ctx || timer) return;

  master = ctx.createGain();
  master.gain.setValueAtTime(0.0001, ctx.currentTime);
  // כניסה הדרגתית — מוזיקה שנכנסת בבת אחת מבהילה
  master.gain.exponentialRampToValueAtTime(MUSIC_GAIN, ctx.currentTime + 0.9);
  master.connect(ctx.destination);

  step = 0;
  nextNoteTime = ctx.currentTime + 0.1;
  timer = setInterval(pump, TICK_MS);
  pump();
}

/** עוצרת את המוזיקה בדעיכה קצרה */
export function stopMusic(fade = 0.4): void {
  wanted = false;
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  const ctx = audioContext();
  if (ctx && master) {
    const node = master;
    master = null;
    try {
      node.gain.cancelScheduledValues(ctx.currentTime);
      node.gain.setValueAtTime(Math.max(node.gain.value, 0.0001), ctx.currentTime);
      node.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + fade);
      setTimeout(() => node.disconnect(), (fade + 0.2) * 1000);
    } catch {
      node.disconnect();
    }
  }
}

export function isMusicPlaying(): boolean {
  return timer !== null;
}

/**
 * שינוי הגדרת האודיו משפיע מיד, גם באמצע סיבוב: מי שמכבה מוזיקה
 * בזמן משחק לא אמור לחכות לסיבוב הבא כדי שהיא תשתוק.
 */
onAudioModeChange((m) => {
  if (m === 'all' && wanted && !timer) startMusic();
  else if (m !== 'all' && timer) stopMusic(0.25);
});

/**
 * מעבר לרקע בטלפון — עוצרים. מוזיקה שממשיכה לנגן אחרי שיצאו
 * מהאפליקציה היא הדבר שגורם לאנשים למחוק אותה.
 */
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && timer) stopMusic(0.2);
    else if (!document.hidden && wanted && !timer) startMusic();
  });
}
