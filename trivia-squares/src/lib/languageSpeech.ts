'use client';

// Browser-native speech synthesis: no third-party API, network request or paid credits.
// Only enabled for curated language-learning questions with known target languages.
export const spokenLanguages=['es','fr','it','es','fr','it','fr','it','en','es','en','it','es','fr','en','es','fr','en'] as const;
export function languageForPronunciation(questionId:number|undefined):string|null{
 if(!Number.isInteger(questionId)||questionId===undefined)return null;
 const index=questionId-970000;
 return index>=0&&index<spokenLanguages.length?spokenLanguages[index]:null;
}
export function spokenAnswer(answer:string):string{
 // Hebrew answers use a phonetic approximation followed by canonical spelling.
 const match=answer.match(/\(([^()]*)\)\s*$/u);
 return match?.[1]?.trim()||answer.trim();
}
export function speakLanguageAnswer(answer:string,language:string):boolean{
 if(typeof window==='undefined'||!('speechSynthesis' in window)||!('SpeechSynthesisUtterance' in window))return false;
 const synth=window.speechSynthesis;
 const utterance=new SpeechSynthesisUtterance(spokenAnswer(answer));
 utterance.lang=language;
 utterance.rate=.82;
 utterance.pitch=1;
 const voice=synth.getVoices().find(v=>v.lang.toLowerCase()===language.toLowerCase())
   ||synth.getVoices().find(v=>v.lang.toLowerCase().startsWith(language.toLowerCase()+'-'));
 // Never speak in an unrelated language: some browsers silently substitute English.
 if(!voice)return false;
 utterance.voice=voice;
 synth.cancel();
 synth.speak(utterance);
 return true;
}
