/**
 * Original, synthesized in-browser effects for Trivia Squares.
 * No audio downloads, copyrighted samples, user tracking or microphone permission.
 * The Web Audio context is created only after a player interaction.
 */
export type SoundCue = 'marker' | 'draw' | 'correct' | 'wrong' | 'capture' | 'bonus' | 'win' | 'turn' | 'clock';
let audio: AudioContext | null = null;
let lastStrokeAt = 0;

function context(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!audio || audio.state === 'closed') audio = new AudioContext();
    if (audio.state === 'suspended') void audio.resume().catch(() => {});
    return audio;
  } catch {
    return null; // Browser restrictions never interrupt a game move.
  }
}

function tone(ctx: AudioContext, hz: number, at: number, duration: number, gain: number, wave: OscillatorType = 'sine') {
  const osc = ctx.createOscillator();
  const envelope = ctx.createGain();
  osc.type = wave;
  osc.frequency.setValueAtTime(hz, at);
  envelope.gain.setValueAtTime(0.0001, at);
  envelope.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), at + 0.013);
  envelope.gain.exponentialRampToValueAtTime(0.0001, at + duration);
  osc.connect(envelope).connect(ctx.destination);
  osc.start(at);
  osc.stop(at + duration + 0.005);
}

/** A faint, textured felt-tip swipe. Play once per drag, not on every pointer move. */
function marker(ctx: AudioContext, strength: number) {
  const now = ctx.currentTime;
  if (now - lastStrokeAt < 0.11) return;
  lastStrokeAt = now;
  const count = Math.ceil(ctx.sampleRate * 0.17);
  const buffer = ctx.createBuffer(1, count, ctx.sampleRate);
  const channel = buffer.getChannelData(0);
  for (let i = 0; i < count; i++) {
    // Smooth pseudo-grain against a synthetic paper surface.
    const t = i / count;
    channel[i] = (Math.random() * 2 - 1) * (0.3 + 0.7 * Math.sin(t * Math.PI)) * (1 - t * 0.75);
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 900;
  filter.Q.value = 0.75;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(strength * 0.09, now + 0.025);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
  source.connect(filter).connect(gain).connect(ctx.destination);
  source.start(now);
  source.stop(now + 0.17);
}

/** All values are original short UI effects. No music or external assets. */
export function playGameSound(cue: SoundCue, opts: { muted: boolean; volume: number }): void {
  if (opts.muted || opts.volume <= 0) return;
  const ctx = context();
  if (!ctx) return;
  const volume = Math.min(1, Math.max(0, opts.volume));
  if (cue === 'marker') {
    marker(ctx, volume);
    return;
  }
  const t = ctx.currentTime + 0.005;
  const note = (freq: number, offset: number, dur: number, level: number, wave: OscillatorType = 'sine') =>
    tone(ctx, freq, t + offset, dur, level * volume, wave);

  switch (cue) {
    case 'draw':
      note(330, 0, 0.10, 0.07, 'triangle');
      note(440, 0.045, 0.12, 0.05, 'sine');
      break;
    case 'correct':
      // Cheerful "ta-da!" rising fanfare, with warm bell-like overtones.
      note(523.25, 0, 0.11, 0.12, 'triangle');
      note(659.25, 0.095, 0.13, 0.12, 'sine');
      note(783.99, 0.19, 0.16, 0.12, 'sine');
      note(1046.50, 0.28, 0.31, 0.13, 'triangle');
      note(1567.98, 0.31, 0.27, 0.035, 'sine');
      break;
    case 'wrong':
      // Gentle disappointed "wah-wah": clearly descending, never punishing.
      note(392, 0, 0.16, 0.075, 'triangle');
      note(329.63, 0.14, 0.20, 0.070, 'triangle');
      note(261.63, 0.30, 0.33, 0.060, 'sine');
      break;
    case 'capture':
      note(523.25, 0, 0.16, 0.14);
      note(659.25, 0.07, 0.19, 0.14);
      note(783.99, 0.14, 0.24, 0.16);
      note(1046.5, 0.22, 0.37, 0.12);
      break;
    case 'bonus':
      [523.25, 659.25, 783.99, 987.77, 1174.66].forEach((f, i) => note(f, i * 0.09, 0.34, 0.12));
      break;
    case 'win':
      [392, 523.25, 659.25, 783.99, 1046.5, 1318.51].forEach((f, i) => note(f, i * 0.12, 0.42, 0.15));
      break;
    case 'clock':
      note(660, 0, 0.045, 0.018, 'triangle');
      break;
    case 'turn':
      note(440, 0, 0.14, 0.065, 'sine');
      note(554.37, 0.09, 0.19, 0.075, 'sine');
      break;
  }
}
