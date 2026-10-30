/**
 * Original, synthesized in-browser effects for Trivia Squares.
 * No audio downloads, copyrighted samples, user tracking or microphone permission.
 * The Web Audio context is created only after a player interaction.
 */
export type SoundCue = 'marker' | 'draw' | 'correct' | 'wrong' | 'capture' | 'bonus' | 'win' | 'turn' | 'clock' | 'coin' | 'fruit' | 'star' | 'diamond' | 'pop' | 'slice' | 'liquid' | 'fireworks';
let audio: AudioContext | null = null;
let lastStrokeAt = -1;
let pendingResume = false;
let masterGain: GainNode | null = null;
let masterMuted = false;

// An AudioContext must be unlocked from a synchronous touch or click on mobile.
function context(): AudioContext | null {
  if(typeof window==='undefined')return null;
  try{
    const ctor=window.AudioContext || (window as Window & {webkitAudioContext?:typeof AudioContext}).webkitAudioContext;
    if(!ctor)return null;
    if(!audio || audio.state==='closed'){
      audio=new ctor();
      masterGain=audio.createGain();
      masterGain.gain.value=masterMuted?0:1;
      masterGain.connect(audio.destination);
    }
    return audio;
  }catch{return null;}
}
/** Immediately mutes already-scheduled sound effects as well as future ones. */
export function setGameAudioMuted(muted:boolean):void {
  masterMuted=muted;
  if(masterGain && audio?.state!=='closed'){
    masterGain.gain.cancelScheduledValues(audio?.currentTime||0);
    masterGain.gain.setTargetAtTime(muted?0:1,audio?.currentTime||0,.012);
  }
}
export function unlockGameAudio():void {
  const ctx=context();
  if(!ctx || ctx.state==='running' || pendingResume)return;
  pendingResume=true;
  void ctx.resume().then(()=>{
    // Touch input on some WebViews requires a source to be connected after resume.
    if(ctx.state==='running'){
      const oscillator=ctx.createOscillator();
      const gain=ctx.createGain();
      gain.gain.value=0;
      oscillator.connect(gain).connect(ctx.destination);
      oscillator.start();oscillator.stop(ctx.currentTime+.005);
    }
  }).catch(()=>{}).finally(()=>{pendingResume=false;});
}

function tone(ctx: AudioContext, hz: number, at: number, duration: number, gain: number, wave: OscillatorType = 'sine') {
  const osc = ctx.createOscillator();
  const envelope = ctx.createGain();
  osc.type = wave;
  osc.frequency.setValueAtTime(hz, at);
  envelope.gain.setValueAtTime(0.0001, at);
  envelope.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), at + 0.013);
  envelope.gain.exponentialRampToValueAtTime(0.0001, at + duration);
  osc.connect(envelope).connect(masterGain || ctx.destination);
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
  source.connect(filter).connect(gain).connect(masterGain || ctx.destination);
  source.start(now);
  source.stop(now + 0.17);
}

/** All values are original short UI effects. No music or external assets. */
export function playGameSound(cue: SoundCue, opts: { muted: boolean; volume: number }, delaySeconds = 0): void {
  setGameAudioMuted(opts.muted);
  if (opts.muted || opts.volume <= 0) return;
  const ctx = context();
  if (!ctx) return;
  if (ctx.state !== 'running') {
    // The cue is scheduled once the mobile device unlocks audio; never lose
    // a legitimate answer/capture reward solely because resume is asynchronous.
    unlockGameAudio();
    void ctx.resume().then(()=>{if(ctx.state==='running')playGameSound(cue,opts,delaySeconds)}).catch(()=>{});
    return;
  }
  const volume = Math.min(1, Math.max(0, opts.volume));
  if (cue === 'marker') {
    marker(ctx, volume);
    return;
  }
  const t = ctx.currentTime + 0.005 + Math.max(0,Math.min(2,delaySeconds));
  const note = (freq: number, offset: number, dur: number, level: number, wave: OscillatorType = 'sine') =>
    tone(ctx, freq, t + offset, dur, level * volume, wave);

  switch (cue) {
    case 'coin':
      // Two crisp metallic bounces, like coins dropping into a bank.
      note(1244.51,0,.075,.16,'triangle');
      note(1864.66,.045,.13,.10,'sine');
      note(932.33,.13,.15,.075,'triangle');
      break;
    case 'fruit':
      // Warm, playful three-note pluck.
      note(392,0,.095,.13,'sine');
      note(523.25,.075,.12,.13,'triangle');
      note(659.25,.15,.17,.12,'sine');
      break;
    case 'star':
      // A sparkling upward glissando/chime.
      note(784,0,.12,.10,'sine');
      note(1174.66,.06,.15,.095,'sine');
      note(1567.98,.12,.25,.09,'triangle');
      break;
    case 'diamond':
      // Light crystalline shimmer.
      [1046.5,1318.5,1567.98,2093].forEach((hz,i)=>note(hz,i*.065,.27,.11,'sine'));
      break;
    case 'pop':
      // An original airy, springy balloon burst.
      note(1174.66,0,.045,.10,'triangle');
      note(587.33,.028,.085,.07,'sine');
      note(880,.054,.09,.045,'triangle');
      break;
    case 'slice':
      // Bright paper-cutter sweep, followed by a playful cake reveal.
      note(720,0,.09,.07,'triangle');
      note(1046.5,.08,.16,.095,'sine');
      note(1318.5,.16,.16,.07,'sine');
      break;
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
    case 'liquid':
      // A soft rising water shimmer, timed with the filling territory.
      note(196,0,.14,.11,'sine');
      note(261.63,.13,.19,.11,'triangle');
      note(329.63,.30,.21,.095,'sine');
      note(392,.48,.20,.08,'sine');
      break;
    case 'fireworks':
      // Original, non-copyrighted victory sparkle after the tile fills.
      [1046.5,1318.51,1567.98,2093].forEach((hz,i)=>note(hz,i*.07,.16,.125,'triangle'));
      note(783.99,.34,.25,.13,'sine');
      note(1046.5,.43,.31,.12,'sine');
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
