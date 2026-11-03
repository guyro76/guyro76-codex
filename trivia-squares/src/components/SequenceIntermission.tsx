'use client';
import {useEffect,useRef,useState} from 'react';
import type {ActiveLocale} from '../lib/i18n';
import {GameImage,type ObjectArt} from './GameImage';

// Realistic artwork instead of symbol glyphs (owner rule: no emoji or icon glyphs).
const symbols:readonly ObjectArt[]=['apple','gem','coin','planet'];
const colors=['#be185d','#1d4ed8','#15803d','#92400e'];
const text:Record<ActiveLocale,{title:string,round:string,watch:string,repeat:string,win:string,wrong:string,start:string,skip:string}>={
 he:{title:'אתגר זיכרון רצפים',round:'סבב',watch:'זכור את הרצף המואר',repeat:'חזור על הרצף',win:'הצלחת בשלושת הסבבים!',wrong:'טעות ברצף, נסה שוב',start:'התחל',skip:'דלג ללא קנס'},
 en:{title:'Sequence memory',round:'Round',watch:'Watch the glowing sequence',repeat:'Repeat the sequence',win:'All three rounds complete!',wrong:'Wrong sequence, try again',start:'Start',skip:'Skip without penalty'},
 ru:{title:'Память на последовательности',round:'Раунд',watch:'Запомните последовательность',repeat:'Повторите последовательность',win:'Три раунда пройдены!',wrong:'Ошибка, попробуйте снова',start:'Начать',skip:'Пропустить'},
 fr:{title:'Mémoire des séquences',round:'Manche',watch:'Mémorisez la séquence',repeat:'Reproduisez la séquence',win:'Trois manches réussies !',wrong:'Erreur, réessayez',start:'Commencer',skip:'Passer sans pénalité'},
 es:{title:'Memoria de secuencias',round:'Ronda',watch:'Memoriza la secuencia',repeat:'Repite la secuencia',win:'¡Tres rondas completadas!',wrong:'Error, inténtalo otra vez',start:'Empezar',skip:'Omitir sin penalización'},
 ar:{title:'ذاكرة التسلسل',round:'الجولة',watch:'احفظ التسلسل المضيء',repeat:'كرر التسلسل',win:'أكملت الجولات الثلاث!',wrong:'خطأ، حاول مرة أخرى',start:'ابدأ',skip:'تخطي دون عقوبة'}
};
function sequence(length:number){return Array.from({length},()=>Math.floor(Math.random()*4));}
export default function SequenceIntermission({locale,onWin,onSkip,onTone}:{locale:ActiveLocale,onWin:()=>void,onSkip:()=>void,onTone?:(index:number)=>void}){
 const t=text[locale]||text.en;
 const [round,setRound]=useState(0);
 const [pattern,setPattern]=useState<number[]>([]);
 const [lit,setLit]=useState(-1);
 const [cursor,setCursor]=useState(0);
 const [phase,setPhase]=useState<'idle'|'watch'|'repeat'|'won'>('idle');
 const [error,setError]=useState(false);
 const timer=useRef<ReturnType<typeof setTimeout>[]>([]);
 const awarded=useRef(false);
 const clear=()=>{timer.current.forEach(clearTimeout);timer.current=[];};
 useEffect(()=>()=>{timer.current.forEach(clearTimeout)},[]);
 const show=(seq:number[])=>{
  clear();setPattern(seq);setCursor(0);setError(false);setPhase('watch');
  seq.forEach((pad,i)=>{
   timer.current.push(setTimeout(()=>{setLit(pad);onTone?.(pad)},350+i*760));
   timer.current.push(setTimeout(()=>setLit(-1),780+i*760));
  });
  timer.current.push(setTimeout(()=>{setLit(-1);setPhase('repeat')},350+seq.length*760));
 };
 const start=()=>{awarded.current=false;setRound(1);show(sequence(3))};
 const retry=()=>{setError(false);show(pattern)};
 const press=(pad:number)=>{
  if(phase!=='repeat'||awarded.current)return;
  onTone?.(pad);
  if(pattern[cursor]!==pad){setError(true);setCursor(0);setPhase('idle');return;}
  setError(false);
  if(cursor+1===pattern.length){
   if(round===3){setPhase('won');if(!awarded.current){awarded.current=true;onWin();}return;}
   setRound(round+1);show([...pattern,Math.floor(Math.random()*4)]);
  }else setCursor(cursor+1);
 };
 return <section aria-label={t.title} dir={locale==='he'||locale==='ar'?'rtl':'ltr'} style={{textAlign:'center',fontWeight:800}}>
  <h4>{t.title}</h4><p aria-live='polite'>{phase==='won'?t.win:phase==='watch'?t.watch:phase==='repeat'?t.repeat:t.start} {round>0?'· '+t.round+' '+round+'/3':''}</p>
  <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:12,maxWidth:290,margin:'16px auto'}}>
   {symbols.map((symbol,i)=><button key={i} type='button' disabled={phase!=='repeat'} onClick={()=>press(i)}
    aria-label={String(i+1)} aria-pressed={lit===i}
    style={{height:112,borderRadius:22,border:'4px solid #fff',background:colors[i],color:'#fff',fontSize:38,fontWeight:900,opacity:phase==='watch'&&lit!==i?.35:1,transform:lit===i?'scale(1.08)':'scale(1)',boxShadow:lit===i?'0 0 24px #fff':'0 5px 14px #0003'}}><GameImage name={symbol} size={62}/></button>)}
  </div>
  {error&&<p role='alert'>{t.wrong}</p>}
  {phase==='idle'&&<button type='button' onClick={error?retry:start}>{error?t.repeat:t.start}</button>}
  {phase==='repeat'&&<button type='button' onClick={()=>show(pattern)}>{t.watch}</button>}
  <button type='button' onClick={()=>{clear();onSkip()}}>{t.skip}</button>
 </section>;
}
