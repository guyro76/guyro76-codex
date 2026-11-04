'use client';
import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {createClient} from '@supabase/supabase-js';
import {SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY} from '../../lib/supabasePublicConfig';
import type {ActiveLocale} from '../../lib/i18n';
import {DAILY_COUNT,dailyKey,dailyQuestions,dailyScore,readDailyResult,saveDailyResult,type DailyResult} from '../../lib/dailyChallenge';
import {deviceClientId} from '../../lib/answerAppeals';
import {GameImage} from '../../components/GameImage';
import Link from 'next/link';
import './daily.css';

const LOCALES=['he','en','ru','fr','ar','es'] as const;
const T:Record<ActiveLocale,Record<string,string>>={
 he:{title:'האתגר היומי',sub:'10 שאלות, זהות לכל השחקנים היום. ניסיון אחד ביום.',start:'התחל את האתגר',q:'שאלה',of:'מתוך',next:'לשאלה הבאה',finish:'לתוצאה',done:'סיימת את האתגר של היום',correct:'תשובות נכונות',time:'זמן',score:'ניקוד',rank:'המקום שלך',players:'שחקנים היום',top:'עשרת המובילים היום',share:'שתף תוצאה',copied:'התוצאה הועתקה',back:'חזרה למשחק',name:'השם שיופיע בטבלה',nameHint:'השם שלך יופיע בטבלת המובילים של היום.',save:'שמור בטבלה',offline:'אין חיבור לרשת. התוצאה נשמרה במכשיר.',empty:'עוד אין תוצאות היום. אתה הראשון.',tomorrow:'אתגר חדש מחר.',right:'נכון!',wrong:'התשובה הנכונה:'},
 en:{title:'Daily challenge',sub:'10 questions, the same for every player today. One try a day.',start:'Start the challenge',q:'Question',of:'of',next:'Next question',finish:'See result',done:'You finished today’s challenge',correct:'Correct answers',time:'Time',score:'Score',rank:'Your place',players:'Players today',top:'Today’s top 10',share:'Share result',copied:'Result copied',back:'Back to the game',name:'Name for the board',nameHint:'Your name will appear on today’s leaderboard.',save:'Save to the board',offline:'No connection. Your result is saved on this device.',empty:'No results yet today. You are the first.',tomorrow:'A new challenge tomorrow.',right:'Correct!',wrong:'The right answer:'},
 ru:{title:'Ежедневный вызов',sub:'10 вопросов, одинаковых для всех игроков сегодня. Одна попытка в день.',start:'Начать',q:'Вопрос',of:'из',next:'Следующий вопрос',finish:'К результату',done:'Вы прошли сегодняшний вызов',correct:'Верных ответов',time:'Время',score:'Очки',rank:'Ваше место',players:'Игроков сегодня',top:'Десятка лучших сегодня',share:'Поделиться',copied:'Результат скопирован',back:'Назад к игре',name:'Имя в таблице',nameHint:'Ваше имя появится в сегодняшней таблице лидеров.',save:'Сохранить в таблице',offline:'Нет соединения. Результат сохранён на устройстве.',empty:'Сегодня ещё нет результатов. Вы первый.',tomorrow:'Новый вызов завтра.',right:'Верно!',wrong:'Правильный ответ:'},
 fr:{title:'Défi du jour',sub:'10 questions, les mêmes pour tous aujourd’hui. Un essai par jour.',start:'Commencer le défi',q:'Question',of:'sur',next:'Question suivante',finish:'Voir le résultat',done:'Vous avez terminé le défi du jour',correct:'Bonnes réponses',time:'Temps',score:'Score',rank:'Votre place',players:'Joueurs aujourd’hui',top:'Top 10 du jour',share:'Partager',copied:'Résultat copié',back:'Retour au jeu',name:'Nom au classement',nameHint:'Votre nom apparaîtra dans le classement du jour.',save:'Enregistrer au classement',offline:'Pas de connexion. Le résultat est enregistré sur l’appareil.',empty:'Aucun résultat aujourd’hui. Vous êtes le premier.',tomorrow:'Nouveau défi demain.',right:'Bravo !',wrong:'La bonne réponse :'},
 ar:{title:'التحدي اليومي',sub:'10 أسئلة، نفسها لكل اللاعبين اليوم. محاولة واحدة يوميًا.',start:'ابدأ التحدي',q:'سؤال',of:'من',next:'السؤال التالي',finish:'النتيجة',done:'أنهيت تحدي اليوم',correct:'إجابات صحيحة',time:'الوقت',score:'النقاط',rank:'ترتيبك',players:'لاعبون اليوم',top:'أفضل عشرة اليوم',share:'شارك النتيجة',copied:'تم نسخ النتيجة',back:'العودة إلى اللعبة',name:'الاسم في الجدول',nameHint:'سيظهر اسمك في جدول المتصدرين اليوم.',save:'احفظ في الجدول',offline:'لا يوجد اتصال. حُفظت النتيجة على الجهاز.',empty:'لا نتائج بعد اليوم. أنت الأول.',tomorrow:'تحدٍّ جديد غدًا.',right:'صحيح!',wrong:'الإجابة الصحيحة:'},
 es:{title:'Reto diario',sub:'10 preguntas, iguales para todos hoy. Un intento al día.',start:'Empezar el reto',q:'Pregunta',of:'de',next:'Siguiente pregunta',finish:'Ver resultado',done:'Terminaste el reto de hoy',correct:'Respuestas correctas',time:'Tiempo',score:'Puntos',rank:'Tu puesto',players:'Jugadores hoy',top:'Los 10 mejores de hoy',share:'Compartir',copied:'Resultado copiado',back:'Volver al juego',name:'Nombre en la tabla',nameHint:'Tu nombre aparecerá en la tabla de hoy.',save:'Guardar en la tabla',offline:'Sin conexión. El resultado se guardó en el dispositivo.',empty:'Aún no hay resultados hoy. Eres el primero.',tomorrow:'Nuevo reto mañana.',right:'¡Correcto!',wrong:'La respuesta correcta:'}
};
type Row={place:number;name:string;correct:number;seconds:number;score:number};
const fmt=(s:number)=>Math.floor(s/60)+':'+String(s%60).padStart(2,'0');

export default function DailyChallengePage(){
 const client=useMemo(()=>createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY),[]);
 const [locale,setLocale]=useState<ActiveLocale>('he');
 const [day]=useState(()=>dailyKey());
 const [phase,setPhase]=useState<'intro'|'play'|'done'>('intro');
 const [index,setIndex]=useState(0);
 const [picked,setPicked]=useState<number|null>(null);
 const [answers,setAnswers]=useState<number[]>([]);
 const [result,setResult]=useState<DailyResult|null>(null);
 const [name,setName]=useState('');
 const [top,setTop]=useState<Row[]|null>(null);
 const [notice,setNotice]=useState('');
 const [elapsed,setElapsed]=useState(0);
 const started=useRef(0);
 useEffect(()=>{
  try{
   const l=localStorage.getItem('trivia-language');if(LOCALES.includes(l as ActiveLocale))setLocale(l as ActiveLocale);
   setName((localStorage.getItem('trivia-player-name')||'').slice(0,32));
  }catch{}
 },[]);
 const t=T[locale];const rtl=locale==='he'||locale==='ar';
 const questions=useMemo(()=>dailyQuestions(locale,day),[locale,day]);
 const loadTop=useCallback(async()=>{
  const {data,error}=await client.rpc('trivia_daily_top',{p_day:day,p_locale:locale});
  if(!error&&Array.isArray(data))setTop(data.map((r:Record<string,unknown>)=>({place:Number(r.place),name:String(r.name),correct:Number(r.correct),seconds:Number(r.seconds),score:Number(r.score)})));
  else setTop([]);
 },[client,day,locale]);
 useEffect(()=>{const saved=readDailyResult(day,locale);setResult(saved);if(saved){setPhase('done');void loadTop();}else setPhase('intro');},[day,locale,loadTop]);
 useEffect(()=>{if(phase!=='play')return;const id=window.setInterval(()=>setElapsed(Math.round((Date.now()-started.current)/1000)),500);return()=>window.clearInterval(id);},[phase]);
 const start=()=>{started.current=Date.now();setElapsed(0);setIndex(0);setAnswers([]);setPicked(null);setPhase('play');};
 const choose=(i:number)=>{if(picked!==null)return;setPicked(i);setAnswers(a=>[...a,i]);
  try{if(typeof navigator.vibrate==='function'&&!matchMedia('(prefers-reduced-motion: reduce)').matches)navigator.vibrate(i===questions[index].correct?18:[40,40,40]);}catch{}};
 const advance=()=>{
  if(index+1<questions.length){setIndex(index+1);setPicked(null);return;}
  const seconds=Math.min(3600,Math.max(10,Math.round((Date.now()-started.current)/1000)));
  const all=[...answers];const correct=all.filter((a,i)=>a===questions[i].correct).length;
  const r:DailyResult={day,locale,correct,seconds,answers:all,score:dailyScore(correct,seconds)};
  saveDailyResult(r);setResult(r);setPhase('done');void loadTop();
 };
 const submit=async()=>{
  if(!result)return;
  const clean=name.trim();if(clean.length<2){setNotice(t.nameHint);return;}
  try{localStorage.setItem('trivia-player-name',clean)}catch{}
  const {data,error}=await client.rpc('trivia_daily_submit',{p_day:day,p_locale:locale,p_client_id:deviceClientId(),p_name:clean,p_correct:result.correct,p_seconds:result.seconds});
  const row=Array.isArray(data)?data[0]:null;
  if(error||!row){setNotice(t.offline);return;}
  const r={...result,rank:Number(row.rank),players:Number(row.players),score:Number(row.score)};
  saveDailyResult(r);setResult(r);setNotice('');void loadTop();
 };
 const share=async()=>{
  if(!result)return;
  const marks=result.answers.map((a,i)=>a===questions[i]?.correct?'✓':'✕').join('');
  const text=t.title+' '+day.split('-').reverse().slice(0,2).join('.')+': '+result.correct+'/'+DAILY_COUNT+' · '+fmt(result.seconds)+'\n'+marks+'\nhttps://trivia-squares.vercel.app/daily';
  try{if(navigator.share){await navigator.share({text});return;}}catch{}
  try{await navigator.clipboard.writeText(text);setNotice(t.copied);}catch{}
 };
 const q=questions[index];
 return <main className='daily-page' dir={rtl?'rtl':'ltr'} lang={locale}>
  <header className='daily-head'>
   <Link className='daily-back' href='/'>{t.back}</Link>
   <span className='daily-date' dir='ltr'>{day.split('-').reverse().join('.')}</span>
  </header>
  <section className='daily-card' aria-labelledby='daily-title'>
   <h1 id='daily-title'><GameImage name='trophy' size={40}/> {t.title}</h1>
   {phase==='intro'&&<>
    <p className='daily-sub'>{t.sub}</p>
    <button type='button' className='daily-primary' data-testid='daily-start' onClick={start}>{t.start}</button>
   </>}
   {phase==='play'&&q&&<div className='daily-play'>
    <div className='daily-progress'><span>{t.q} {index+1} {t.of} {questions.length}</span><span dir='ltr'>{fmt(elapsed)}</span></div>
    <div className='daily-bar'><i style={{width:((index+(picked!==null?1:0))/questions.length*100)+'%'}}/></div>
    <h2 data-testid='daily-question'>{q.text}</h2>
    <div className='daily-answers'>{q.answers.map((a,i)=><button key={i} type='button' disabled={picked!==null}
      className={picked===null?'':i===q.correct?'is-correct':i===picked?'is-wrong':''} onClick={()=>choose(i)}>{a}</button>)}</div>
    {picked!==null&&<p className='daily-feedback' role='status'>{picked===q.correct?t.right:t.wrong+' '+q.answers[q.correct]}</p>}
    {picked!==null&&<button type='button' className='daily-primary' data-testid='daily-next' onClick={advance}>{index+1<questions.length?t.next:t.finish}</button>}
   </div>}
   {phase==='done'&&result&&<div className='daily-done'>
    <p className='daily-sub'>{t.done}. {t.tomorrow}</p>
    <div className='daily-stats' data-testid='daily-result'>
     <div><strong>{result.correct}/{DAILY_COUNT}</strong><span>{t.correct}</span></div>
     <div><strong dir='ltr'>{fmt(result.seconds)}</strong><span>{t.time}</span></div>
     <div><strong>{result.score??dailyScore(result.correct,result.seconds)}</strong><span>{t.score}</span></div>
     {result.rank&&<div><strong>{result.rank}/{result.players}</strong><span>{t.rank}</span></div>}
    </div>
    {!result.rank&&<div className='daily-save'>
     <label htmlFor='daily-name'>{t.name}</label>
     <input id='daily-name' value={name} maxLength={32} onChange={e=>setName(e.target.value)} autoComplete='nickname'/>
     <small>{t.nameHint}</small>
     <button type='button' className='daily-primary' data-testid='daily-submit' onClick={()=>void submit()}>{t.save}</button>
    </div>}
    <button type='button' className='daily-secondary' onClick={()=>void share()}>{t.share}</button>
    {notice&&<p className='daily-notice' role='status'>{notice}</p>}
    <h2 className='daily-top-title'>{t.top}</h2>
    {top===null?null:top.length===0?<p className='daily-sub'>{t.empty}</p>:
     <ol className='daily-top' data-testid='daily-top'>{top.map(r=><li key={r.place}><span className='p'>{r.place}</span><span className='n'>{r.name}</span><span className='c'>{r.correct}/{DAILY_COUNT}</span><span className='s' dir='ltr'>{fmt(r.seconds)}</span></li>)}</ol>}
   </div>}
  </section>
 </main>;
}
