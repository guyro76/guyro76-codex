import type {SoundCue} from './gameAudio';
/** Short vibrations on Android phones (iOS Safari has no Vibration API, so this is a no-op there).
 *  On by default; the player can switch it off in Settings. Never vibrates for reduced-motion users. */
const KEY='trivia-haptics-v1';
export function readHapticsPreference():boolean{try{return localStorage.getItem(KEY)!=='off'}catch{return true}}
export function saveHapticsPreference(on:boolean){try{localStorage.setItem(KEY,on?'on':'off')}catch{}}
const PATTERNS:Partial<Record<SoundCue,number|number[]>>={correct:18,wrong:[40,40,40],capture:[25,35,45],win:[30,40,30,40,60],combo3:[15,25,15],combo5:[15,25,15,25,15],combo10:[20,30,20,30,20,30,40]};
export function vibrateFor(cue:SoundCue,enabled:boolean){
  if(!enabled||typeof navigator==='undefined'||typeof navigator.vibrate!=='function')return;
  try{if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;}catch{}
  const pattern=PATTERNS[cue];if(pattern===undefined)return;
  try{navigator.vibrate(pattern)}catch{}
}
