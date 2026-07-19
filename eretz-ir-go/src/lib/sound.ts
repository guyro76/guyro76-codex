import { getSetting } from '../db/db';

/**
 * צלילי משחק קצרים מסונתזים ב-WebAudio — בלי קובצי אודיו, בלי הורדות.
 * מכובדים דרך הגדרת "צלילים ורטט" ומצב הפחתת תנועה.
 */

let ctx: AudioContext | null = null;
let enabled = true;

void getSetting('sound').then((v) => {
  enabled = v !== '0';
});

export function setSoundEnabled(on: boolean): void {
  enabled = on;
}

function play(notes: [freq: number, durSec: number][], type: OscillatorType = 'sine', gainLevel = 0.12): void {
  if (!enabled || typeof window === 'undefined' || !('AudioContext' in window)) return;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    let t = ctx.currentTime;
    for (const [freq, dur] of notes) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(gainLevel, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + dur);
      t += dur * 0.9;
    }
  } catch {
    // אודיו לא זמין — ממשיכים בשקט
  }
}

export const sfx = {
  /** תשובה נכונה */
  success: () => play([[880, 0.09], [1318, 0.14]]),
  /** תשובה שגויה — עדין, לא מלחיץ */
  error: () => play([[240, 0.16]], 'triangle', 0.08),
  /** נחיתת אות בגלגל */
  letter: () => play([[523, 0.07], [659, 0.07], [784, 0.12]]),
  /** קלף כוח הופעל */
  power: () => play([[660, 0.08], [880, 0.08], [660, 0.08]], 'square', 0.07),
  /** ניצחון / סיום משחק */
  win: () => play([[523, 0.12], [659, 0.12], [784, 0.12], [1047, 0.25]]),
  /** טיק־טק בשניות האחרונות */
  tick: () => play([[1200, 0.04]], 'square', 0.05)
};
