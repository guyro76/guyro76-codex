import type {ActiveLocale} from './i18n';
import {offlineQuestions} from './offlineQuestions.ts';
import {curatedHebrewQuestions} from './curatedHebrewQuestions.ts';
import {englishQuestions} from './englishQuestions.ts';
import {spanishQuestions} from './spanishQuestions.ts';
import {internationalQuestions} from './internationalQuestions.ts';
import {applyQuestionCorrections} from './questionCorrections.ts';
import {withoutAnswerLeaks} from './answerGuard.ts';
import {isGeographyQuestion} from './questionMix.ts';

/** Daily challenge: the same 10 questions for every player of a language on a given UTC day.
 *  Built only from bundled, reviewed questions (each has a known answer), never more than
 *  two geography questions. */
export type DailyQuestion={id:number;text:string;answers:string[];correct:number;category:string};
export const DAILY_COUNT=10;

export function dailyKey(date=new Date()):string{return date.toISOString().slice(0,10);}

function seeded(seed:string){
  let h=2166136261;
  for(let i=0;i<seed.length;i++){h^=seed.charCodeAt(i);h=Math.imul(h,16777619);}
  return()=>{h=Math.imul(h^(h>>>15),2246822507);h=Math.imul(h^(h>>>13),3266489909);h^=h>>>16;return (h>>>0)/4294967296;};
}

function bankFor(locale:ActiveLocale):DailyQuestion[]{
  const raw:DailyQuestion[]=locale==='he'?[...offlineQuestions,...curatedHebrewQuestions]
    :locale==='en'?[...englishQuestions]
    :locale==='es'?[...spanishQuestions]
    :internationalQuestions.filter(q=>q.locale===locale);
  return withoutAnswerLeaks(applyQuestionCorrections(raw)).filter(q=>q.answers.length===4&&q.correct>=0&&q.correct<4);
}

export function dailyQuestions(locale:ActiveLocale,day:string):DailyQuestion[]{
  const rand=seeded('daily:'+locale+':'+day);
  const pool=[...bankFor(locale)].sort((a,b)=>a.id-b.id);
  for(let i=pool.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
  const out:DailyQuestion[]=[];let geo=0;
  for(const q of pool){
    if(out.length>=DAILY_COUNT)break;
    const g=isGeographyQuestion(q);
    if(g&&geo>=2)continue;
    if(g)geo++;
    out.push(q);
  }
  return out;
}

export type DailyResult={day:string;locale:ActiveLocale;correct:number;seconds:number;answers:number[];rank?:number;players?:number;score?:number};
const KEY='trivia-daily-result-v1';
export function readDailyResult(day:string,locale:ActiveLocale):DailyResult|null{
  try{const r=JSON.parse(localStorage.getItem(KEY)||'null');if(r&&r.day===day&&r.locale===locale)return r as DailyResult;}catch{}
  return null;
}
export function saveDailyResult(r:DailyResult){try{localStorage.setItem(KEY,JSON.stringify(r));}catch{}}

/** Same formula the server uses (public.trivia_daily_submit). */
export function dailyScore(correct:number,seconds:number){return correct*100+Math.max(0,300-seconds);}
