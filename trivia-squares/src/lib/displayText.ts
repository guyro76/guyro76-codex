/** Owner rule (2026-11): no emoji or pictographic icons in the game UI.
 *  Translation strings still carry the legacy emoji prefixes (they are also lookup keys),
 *  so display text is cleaned at render time. Plain typography (✓ ✕ · → digits) stays. */
const PICTO=/(?:[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}\u{2605}\u{2606}\u{2654}-\u{265F}\u{2721}-\u{2730}\u{25A0}-\u{25FF}\u{2B50}][\u{FE0F}\u{1F3FB}-\u{1F3FF}\u{20E3}]*(?:\u{200D}[\p{Extended_Pictographic}][\u{FE0F}]*)*)|\u{FE0F}/gu;
const KEEP=new Set(['✓','✕','✔','©','®','™','↔','↕']);

export function stripPictographs(text:string):string{
  if(!text)return text;
  let changed=false;
  const out=text.replace(PICTO,m=>{if(KEEP.has(m))return m;changed=true;return ''});
  return changed?out.replace(/[ \t]{2,}/g,' ').replace(/^\s+|\s+$/g,''):text;
}
