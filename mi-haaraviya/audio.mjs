/* ============================================================
   Original score and sound design for "מי הערביה".
   Everything here is synthesised from scratch — no samples, no
   recordings. The music sits in maqam Hijaz, which is the joke:
   it is the scale both of their traditions actually share.
   Output: audio.wav (60.0s, 44.1kHz stereo).
   ============================================================ */
import { writeFileSync } from "node:fs";

const SR  = 44100;
const DUR = 60.0;
const N   = Math.round(SR * DUR);
const L = new Float32Array(N);
const R = new Float32Array(N);

/* ---------- helpers ---------- */
const clamp01 = x => x < 0 ? 0 : x > 1 ? 1 : x;
const TAU = Math.PI * 2;

/* deterministic noise, so a rebuild produces the same score */
let seed = 20090516;
function rnd(){ seed = (seed * 1664525 + 1013904223) & 0x7fffffff; return seed / 0x7fffffff * 2 - 1; }

/* write a mono voice into the mix at a stereo position */
function mix(buf, atSec, gain, pan){
  const start = Math.round(atSec * SR);
  const gl = gain * Math.cos((pan + 1) * Math.PI / 4);
  const gr = gain * Math.sin((pan + 1) * Math.PI / 4);
  for (let i = 0; i < buf.length; i++){
    const j = start + i;
    if (j < 0 || j >= N) continue;
    L[j] += buf[i] * gl;
    R[j] += buf[i] * gr;
  }
}

/* attack/decay envelope with a soft knee, in samples */
function env(len, aSec, dSec, sustain = 0, rSec = 0){
  const e = new Float32Array(len);
  const a = Math.max(1, aSec * SR), d = Math.max(1, dSec * SR), r = Math.max(1, rSec * SR);
  const relStart = len - r;
  for (let i = 0; i < len; i++){
    let v;
    if (i < a) v = i / a;
    else if (i < a + d) v = 1 - (1 - sustain) * (1 - Math.pow(1 - (i - a) / d, 2));
    else v = sustain;
    if (r > 1 && i > relStart) v *= Math.max(0, 1 - (i - relStart) / r);
    e[i] = v;
  }
  return e;
}

/* one-pole lowpass */
function lp(buf, cut){
  const a = Math.exp(-TAU * cut / SR);
  let z = 0;
  for (let i = 0; i < buf.length; i++){ z = buf[i] * (1 - a) + z * a; buf[i] = z; }
  return buf;
}
/* one-pole highpass */
function hp(buf, cut){
  const a = Math.exp(-TAU * cut / SR);
  let z = 0, prev = 0;
  for (let i = 0; i < buf.length; i++){ z = a * (z + buf[i] - prev); prev = buf[i]; buf[i] = z; }
  return buf;
}

/* ---------- voices ---------- */

/* Karplus–Strong: the plucked-string voice that carries the melody */
function pluck(freq, sec, { damp = 0.996, bright = 0.5, level = 1 } = {}){
  const len = Math.round(sec * SR);
  const p = Math.max(2, Math.round(SR / freq));
  const ring = new Float32Array(p);
  for (let i = 0; i < p; i++) ring[i] = rnd();
  lp(ring, 1200 + bright * 5000);
  const out = new Float32Array(len);
  let idx = 0, prev = 0;
  for (let i = 0; i < len; i++){
    const cur = ring[idx];
    const v = (cur + prev) * 0.5 * damp;
    ring[idx] = v;
    prev = cur;
    out[i] = cur;
    idx = (idx + 1) % p;
  }
  const e = env(len, 0.002, sec * 0.9, 0, sec * 0.25);
  for (let i = 0; i < len; i++) out[i] *= e[i] * level;
  return out;
}

/* bowed/blown sustain for drones and pads */
function drone(freq, sec, { level = 1, detune = 0.5, cut = 900 } = {}){
  const len = Math.round(sec * SR);
  const out = new Float32Array(len);
  const partials = [1, 2, 3, 4, 5, 6];
  for (let i = 0; i < len; i++){
    const t = i / SR;
    let v = 0;
    for (const k of partials){
      const f = freq * k;
      v += Math.sin(TAU * f * t + Math.sin(t * 0.7 + k) * 0.3) / (k * k);
      v += Math.sin(TAU * (f + detune) * t) / (k * k) * 0.6;
    }
    out[i] = v * 0.35;
  }
  lp(out, cut);
  const e = env(len, sec * 0.22, sec * 0.2, 0.85, sec * 0.4);
  for (let i = 0; i < len; i++) out[i] *= e[i] * level;
  return out;
}

/* sine bell, for the points chimes */
function bell(freq, sec, level = 1){
  const len = Math.round(sec * SR);
  const out = new Float32Array(len);
  const parts = [[1, 1], [2.76, 0.34], [5.4, 0.16], [8.9, 0.07]];
  for (let i = 0; i < len; i++){
    const t = i / SR;
    let v = 0;
    for (const [m, g] of parts) v += Math.sin(TAU * freq * m * t) * g * Math.exp(-t * (2.4 + m * 0.8));
    out[i] = v * 0.3 * level;
  }
  return out;
}

/* darbuka-ish low stroke */
function dum(sec = 0.34, level = 1){
  const len = Math.round(sec * SR);
  const out = new Float32Array(len);
  for (let i = 0; i < len; i++){
    const t = i / SR;
    const f = 118 * Math.exp(-t * 26) + 52;
    out[i] = (Math.sin(TAU * f * t) * 1.1 + rnd() * 0.35 * Math.exp(-t * 90)) * Math.exp(-t * 11) * level;
  }
  return lp(out, 2600);
}

/* darbuka-ish rim stroke */
function tek(sec = 0.12, level = 1){
  const len = Math.round(sec * SR);
  const out = new Float32Array(len);
  for (let i = 0; i < len; i++){
    const t = i / SR;
    out[i] = (rnd() * 0.9 + Math.sin(TAU * 430 * t) * 0.25) * Math.exp(-t * 58) * level;
  }
  hp(out, 900);
  return lp(out, 8200);
}

/* wooden knock — the gavel, and the transcript ticks */
function knock(freq, sec, level = 1){
  const len = Math.round(sec * SR);
  const out = new Float32Array(len);
  for (let i = 0; i < len; i++){
    const t = i / SR;
    out[i] = (Math.sin(TAU * freq * t) * 0.8 + rnd() * 0.5 * Math.exp(-t * 320)) * Math.exp(-t * 40) * level;
  }
  return lp(out, 5200);
}

/* filtered-noise sweep: whooshes, risers, paper */
function whoosh(sec, { from = 400, to = 5000, level = 1, curve = 1 } = {}){
  const len = Math.round(sec * SR);
  const raw = new Float32Array(len);
  for (let i = 0; i < len; i++) raw[i] = rnd();
  const out = new Float32Array(len);
  let z = 0;
  for (let i = 0; i < len; i++){
    const p = Math.pow(i / len, curve);
    const cut = from + (to - from) * p;
    const a = Math.exp(-TAU * cut / SR);
    z = raw[i] * (1 - a) + z * a;
    out[i] = z;
  }
  hp(out, 180);
  const e = env(len, sec * 0.35, sec * 0.1, 0.7, sec * 0.5);
  for (let i = 0; i < len; i++) out[i] *= e[i] * level * 3.2;
  return out;
}

/* the orchestral stab under each simultaneous accusation */
function stab(freq, sec, level = 1){
  const len = Math.round(sec * SR);
  const out = new Float32Array(len);
  for (let i = 0; i < len; i++){
    const t = i / SR;
    let v = 0;
    for (const [m, g] of [[1, 1], [1.5, 0.5], [2, 0.6], [3, 0.3], [4, 0.2]]){
      v += ((2 * ((freq * m * t) % 1) - 1)) * g;      // saw partials
    }
    out[i] = v * 0.18 * Math.exp(-t * 3.4) * level;
  }
  lp(out, 3200);
  const e = env(len, 0.004, sec * 0.5, 0.15, sec * 0.4);
  for (let i = 0; i < len; i++) out[i] *= e[i];
  return out;
}

/* camera flash */
function flash(level = 1){
  const sec = 0.16, len = Math.round(sec * SR);
  const out = new Float32Array(len);
  for (let i = 0; i < len; i++){
    const t = i / SR;
    out[i] = rnd() * Math.exp(-t * 46) * level;
  }
  hp(out, 2600);
  return out;
}

/* ============================================================
   The arrangement. 96 BPM; maqam Hijaz on D (D Eb F# G A Bb C),
   whose augmented second is the whole flavour of the thing.
   Section boundaries are the video's own beats.
   ============================================================ */
const B   = 60 / 96;          // beat  = 0.625s
const BAR = B * 4;            // bar   = 2.5s

const F = {
  D2: 73.42,  G2: 98.00,  A2: 110.00, Bb2: 116.54,
  D3: 146.83, Eb3: 155.56, F3: 185.00, G3: 196.00, A3: 220.00, Bb3: 233.08, C4: 261.63,
  D4: 293.66, Eb4: 311.13, F4: 369.99, G4: 392.00, A4: 440.00, Bb4: 466.16, C5: 523.25,
  D5: 587.33, F5: 739.99, A5: 880.00
};

const oud   = (f, at, sec, lvl = 1, pan = 0) => mix(pluck(f, sec, { damp: 0.9965, bright: 0.42, level: lvl }), at, 0.42, pan);
const bass  = (f, at, sec, lvl = 1)         => mix(pluck(f, sec, { damp: 0.9975, bright: 0.12, level: lvl }), at, 0.5, 0);
const chime = (f, at, sec, lvl = 1, pan = 0) => mix(bell(f, sec, lvl), at, 0.34, pan);

/* the argument motif: a rising call and a falling answer */
function call(at, lvl = 1, pan = -0.35, oct = 1){
  oud(F.D4 * oct,  at + 0 * B,    B * 0.9,  1.00 * lvl, pan);
  oud(F.Eb4 * oct, at + 0.5 * B,  B * 0.8,  0.80 * lvl, pan);
  oud(F.F4 * oct,  at + 1.0 * B,  B * 1.1,  0.95 * lvl, pan);
  oud(F.G4 * oct,  at + 1.75 * B, B * 1.4,  0.85 * lvl, pan);
}
function answer(at, lvl = 1, pan = 0.35, oct = 1){
  oud(F.F4 * oct,  at + 0 * B,    B * 0.9,  0.95 * lvl, pan);
  oud(F.Eb4 * oct, at + 0.75 * B, B * 0.8,  0.80 * lvl, pan);
  oud(F.D4 * oct,  at + 1.25 * B, B * 1.8,  1.00 * lvl, pan);
}

/* maqsum, the everyday Middle Eastern 4/4 */
function groove(from, to, lvl = 1, hats = false){
  const hits = [[0, "D"], [2, "t"], [3, "t"], [4, "D"], [6, "t"], [7, "s"]];
  for (let bar = 0; from + bar * BAR < to; bar++){
    const b0 = from + bar * BAR;
    for (const [eighth, kind] of hits){
      const at = b0 + eighth * (B / 2);
      if (at >= to) break;
      if (kind === "D") mix(dum(0.34, 1), at, 0.50 * lvl, 0);
      else if (kind === "t") mix(tek(0.12, 1), at, 0.30 * lvl, eighth === 3 ? 0.4 : -0.3);
      else mix(tek(0.09, 0.55), at, 0.24 * lvl, 0.2);
    }
    if (hats) for (let e = 1; e < 8; e += 2){
      const at = b0 + e * (B / 2);
      if (at < to) mix(tek(0.05, 0.4), at, 0.13 * lvl, 0.5);
    }
  }
}

/* ---------- A · פתיח (0 – 7.4) ---------- */
mix(drone(F.D2, 8.4, { level: 0.9, cut: 420 }), 0.25, 0.30, 0);
mix(drone(F.D3, 7.2, { level: 0.5, cut: 700 }), 0.6,  0.16, 0.2);
mix(whoosh(1.5, { from: 300, to: 6500, level: 0.5, curve: 2 }), 0.35, 0.30, 0);   // into the title
mix(stab(F.D3, 1.9, 0.8), 1.55, 0.34, 0);
oud(F.D4,  1.75, 1.5, 0.9, -0.2);
oud(F.Eb4, 2.35, 1.3, 0.7,  0.1);
oud(F.F4,  2.95, 1.8, 0.85,-0.1);
oud(F.G4,  3.75, 1.2, 0.6,  0.25);
oud(F.F4,  4.25, 1.4, 0.7, -0.15);
oud(F.D4,  4.90, 2.2, 0.8,  0.05);
mix(whoosh(0.5, { from: 900, to: 5200, level: 0.34, curve: 1.6 }), 4.55, 0.26, -0.5);  // name plates
mix(whoosh(0.5, { from: 900, to: 5200, level: 0.34, curve: 1.6 }), 4.70, 0.26,  0.5);
mix(tek(0.1, 0.7), 6.25, 0.16, -0.3);
mix(tek(0.1, 0.7), 6.87, 0.16,  0.3);

/* ---------- B · ההאשמה (7.4 – 13.2) ---------- */
mix(whoosh(0.55, { from: 500, to: 7000, level: 0.55, curve: 2.2 }), 7.30, 0.34, 0);
mix(stab(F.D3, 2.6, 1.15), 7.78, 0.46, -0.15);                 // both at once — the clash
mix(stab(F.Eb3, 2.4, 0.85), 7.80, 0.36, 0.15);                 // a second apart: they disagree
mix(dum(0.5, 1.3), 7.78, 0.60, 0);
mix(flash(0.8), 7.86, 0.30, -0.6);
mix(flash(0.7), 8.02, 0.28,  0.6);
mix(flash(0.5), 8.24, 0.22, -0.35);
mix(drone(F.D2, 5.6, { level: 0.8, cut: 380 }), 7.8, 0.26, 0);
groove(8.40, 13.20, 0.85);
bass(F.D2, 8.40, 1.2, 1.0); bass(F.D2, 9.65, 1.0, 0.7);
bass(F.G2, 10.90, 1.2, 0.9); bass(F.D2, 12.15, 1.0, 0.7);
call(9.05, 0.85, -0.35);
answer(11.30, 0.85, 0.35);
chime(F.A5, 11.15, 1.1, 0.45, 0.3);                            // the awkward beat after

/* ---------- C · הראיות (13.2 – 24.4) ---------- */
mix(whoosh(0.4, { from: 700, to: 6000, level: 0.42, curve: 2 }), 13.05, 0.26, 0.2);
mix(dum(0.4, 1.0), 13.20, 0.40, 0);
groove(13.30, 24.10, 0.9);
mix(drone(F.D2, 11.2, { level: 0.7, cut: 400 }), 13.3, 0.22, 0);
for (let i = 0; i < 5; i++){
  const at = 13.55 + i * BAR;
  bass(i % 2 ? F.G2 : F.D2, at, 1.3, 0.9);
  bass(i % 2 ? F.G2 : F.D2, at + 2 * B, 1.0, 0.6);
}
call(13.70, 0.8, 0.35);      // עוואד
answer(16.00, 0.8, -0.35);   // ניני
oud(F.F4, 18.55, 0.9, 0.7, 0.35);
oud(F.Eb4, 20.20, 0.9, 0.7, -0.35);
oud(F.F4, 21.95, 1.4, 0.75, 0.35);
/* douze points */
[F.D5, F.F5, F.A5].forEach((f, i) => chime(f, 23.30 + i * 0.13, 1.6, 0.85 - i * 0.12, -0.2 + i * 0.2));
chime(F.D5 * 2, 23.72, 1.2, 0.4, 0);

/* ---------- D · הנגד (24.4 – 37.6) ---------- */
mix(whoosh(0.4, { from: 700, to: 6000, level: 0.42, curve: 2 }), 24.25, 0.26, -0.2);
mix(dum(0.4, 1.0), 24.40, 0.40, 0);
groove(24.50, 37.40, 0.95, true);
mix(drone(F.D2, 13.2, { level: 0.8, cut: 430 }), 24.5, 0.24, 0);
for (let i = 0; i < 6; i++){
  const at = 24.75 + i * BAR;
  bass([F.D2, F.G2, F.D2, F.Bb2, F.G2, F.D2][i], at, 1.3, 0.95);
  bass([F.D2, F.G2, F.D2, F.Bb2, F.G2, F.D2][i], at + 2 * B, 1.0, 0.6);
}
call(24.90, 0.85, -0.35);
answer(27.20, 0.8, 0.35);
call(29.05, 0.85, -0.35);
[F.Bb4, F.D5, F.F5].forEach((f, i) => chime(f, 30.60 + i * 0.13, 1.6, 0.8 - i * 0.12, 0.2 - i * 0.2));
answer(32.10, 0.85, 0.35);
call(34.25, 0.9, -0.3);
oud(F.A4, 35.60, 0.8, 0.7, 0.3); oud(F.Bb4, 36.05, 0.8, 0.75, -0.3); oud(F.C5, 36.50, 1.0, 0.8, 0.2);
mix(whoosh(1.1, { from: 400, to: 8000, level: 0.5, curve: 2.6 }), 36.50, 0.30, 0);

/* ---------- E · ההתנגשות (37.6 – 39.4) ---------- */
mix(stab(F.D3,  3.0, 1.35), 37.60, 0.52, -0.2);
mix(stab(F.Eb3, 2.8, 1.05), 37.62, 0.42,  0.2);
mix(dum(0.6, 1.5), 37.60, 0.68, 0);
mix(flash(0.9), 37.68, 0.32, -0.6);
mix(flash(0.8), 37.88, 0.30,  0.6);
mix(drone(F.D2, 2.4, { level: 0.7, cut: 300 }), 37.7, 0.22, 0);

/* ---------- F · בית המשפט (39.4 – 50.4) ---------- */
mix(knock(196, 0.5, 1.5), 39.44, 0.62, -0.1);                  // gavel
mix(knock(178, 0.5, 1.3), 39.70, 0.56,  0.1);
mix(drone(F.D2, 11.0, { level: 0.6, cut: 260 }), 39.9, 0.20, 0);
mix(drone(F.Eb3, 9.5, { level: 0.22, cut: 380 }), 40.4, 0.09, 0.3);
for (let t = 40.3; t < 50.1; t += B) mix(knock(880, 0.09, 0.5), t, 0.075, 0.45);   // the clock
for (const [from, chars] of [[39.98, 24], [44.78, 18], [47.78, 14]]) {             // the transcript
  for (let i = 0; i < chars; i += 3) mix(knock(2100, 0.035, 0.4), from + i / 21, 0.05, -0.5);
}
oud(F.D4, 47.70, 1.3, 0.5, -0.2);
oud(F.F4, 48.35, 1.3, 0.55, 0.2);
oud(F.A4, 49.05, 1.6, 0.6, 0);

/* ---------- G · פסק הדין (50.4 – 58.6) ---------- */
mix(whoosh(1.6, { from: 200, to: 9000, level: 0.62, curve: 2.4 }), 50.35, 0.34, 0);  // the page spins in
mix(dum(0.6, 1.4), 51.95, 0.60, 0);
mix(stab(F.D3, 2.2, 0.9), 51.95, 0.34, 0);
mix(drone(F.D2, 8.0, { level: 1.0, cut: 520 }), 52.05, 0.28, 0);
mix(drone(F.A3, 7.4, { level: 0.5, cut: 780 }), 52.20, 0.13, 0.25);                 // open fifth: agreement
groove(52.20, 58.40, 0.8);
for (let i = 0; i < 3; i++){
  const at = 52.30 + i * BAR;
  bass([F.D2, F.G2, F.A2][i], at, 1.4, 1.0);
  bass([F.D2, F.G2, F.A2][i], at + 2 * B, 1.1, 0.65);
}
/* the two voices finally play the motif together, a third apart */
call(52.45, 0.95, -0.4);
call(52.45, 0.72,  0.4, 1.1892);        // a minor third above
answer(54.80, 0.95, -0.4);
answer(54.80, 0.72,  0.4, 1.1892);
mix(knock(150, 0.55, 1.6), 53.40, 0.52, -0.15);                                     // the stamp
mix(dum(0.4, 1.0), 53.42, 0.40, 0.1);
call(57.00, 0.9, 0);
call(57.00, 0.7, 0.45, 1.1892);

/* ---------- H · סיום (58.6 – 60) ---------- */
[[F.D3, -0.4], [F.A3, 0.1], [F.D4, 0.4], [F.F4, -0.1]].forEach(([f, p], i) =>
  oud(f, 58.55 + i * 0.045, 3.2, 0.95, p));
bass(F.D2, 58.55, 2.6, 1.0);
mix(drone(F.D2, 3.0, { level: 0.7, cut: 480 }), 58.6, 0.20, 0);

/* ============================================================
   Master bus: a Schroeder plate to put the whole thing in a hall,
   then gentle soft-clipping so nothing spits on a phone speaker.
   ============================================================ */
function comb(input, delay, fb, damp){
  const out = new Float32Array(input.length);
  const buf = new Float32Array(delay);
  let i = 0, store = 0;
  for (let n = 0; n < input.length; n++){
    const y = buf[i];
    out[n] = y;
    store = y * (1 - damp) + store * damp;
    buf[i] = input[n] + store * fb;
    i = (i + 1) % delay;
  }
  return out;
}
function allpass(input, delay, fb){
  const out = new Float32Array(input.length);
  const buf = new Float32Array(delay);
  let i = 0;
  for (let n = 0; n < input.length; n++){
    const y = buf[i];
    out[n] = -input[n] + y;
    buf[i] = input[n] + y * fb;
    i = (i + 1) % delay;
  }
  return out;
}
function reverb(input, spread){
  const combs = [1116, 1188, 1277, 1356, 1422, 1491].map(d => d + spread);
  let wet = new Float32Array(input.length);
  for (const d of combs){
    const c = comb(input, d, 0.82, 0.28);
    for (let n = 0; n < wet.length; n++) wet[n] += c[n] / combs.length;
  }
  for (const d of [556 + spread, 441 + spread, 341 + spread]) wet = allpass(wet, d, 0.5);
  return wet;
}

const wetL = reverb(L, 0);
const wetR = reverb(R, 23);
const WET = 0.20;
let peak = 0;
for (let n = 0; n < N; n++){
  L[n] = L[n] + wetL[n] * WET;
  R[n] = R[n] + wetR[n] * WET;
  peak = Math.max(peak, Math.abs(L[n]), Math.abs(R[n]));
}
/* aim for about -1 dBFS before the soft knee */
const norm = peak > 0 ? 0.92 / peak : 1;
const fadeIn = Math.round(0.05 * SR), fadeOut = Math.round(0.6 * SR);
for (let n = 0; n < N; n++){
  let l = Math.tanh(L[n] * norm * 1.08);
  let r = Math.tanh(R[n] * norm * 1.08);
  if (n < fadeIn){ const g = n / fadeIn; l *= g; r *= g; }
  if (n > N - fadeOut){ const g = (N - n) / fadeOut; l *= g; r *= g; }
  L[n] = l; R[n] = r;
}

/* ---------- write a 16-bit stereo WAV ---------- */
const bytes = N * 4;
const buf = Buffer.alloc(44 + bytes);
buf.write("RIFF", 0); buf.writeUInt32LE(36 + bytes, 4); buf.write("WAVE", 8);
buf.write("fmt ", 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20);
buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28);
buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34);
buf.write("data", 36); buf.writeUInt32LE(bytes, 40);
for (let n = 0; n < N; n++){
  buf.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(L[n] * 32767))), 44 + n * 4);
  buf.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(R[n] * 32767))), 46 + n * 4);
}
writeFileSync("audio.wav", buf);
console.log(`audio.wav  ${DUR.toFixed(1)}s  ${(buf.length / 1048576).toFixed(1)} MB  raw peak ${peak.toFixed(2)} -> gain x${norm.toFixed(2)}`);
