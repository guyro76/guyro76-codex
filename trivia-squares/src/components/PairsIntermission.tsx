'use client';
import {useEffect,useRef,useState} from 'react';
import type {ActiveLocale} from '../lib/i18n';

const symbols=['★','♥','◆','☀','♣','✿'];
const copy:Record<ActiveLocale,{title:string,help:string,matched:string,won:string,skip:string}>={
 he:{title:'זיכרון זוגות',help:'חשוף שני קלפים ומצא זוגות זהים',matched:'זוגות שנמצאו',won:'כל הזוגות נמצאו!',skip:'דלג ללא קנס'},
 en:{title:'Memory pairs',help:'Flip two cards to find matching pairs',matched:'Pairs matched',won:'All pairs found!',skip:'Skip without penalty'},
 ru:{title:'Парная память',help:'Откройте две одинаковые карточки',matched:'Найдено пар',won:'Все пары найдены!',skip:'Пропустить'},
 fr:{title:'Paires mémoire',help:'Retournez deux cartes identiques',matched:'Paires trouvées',won:'Toutes les paires trouvées !',skip:'Passer sans pénalité'},
 es:{title:'Parejas de memoria',help:'Descubre dos cartas iguales',matched:'Parejas encontradas',won:'¡Todas las parejas encontradas!',skip:'Omitir sin penalización'},
 ar:{title:'ذاكرة الأزواج',help:'اكشف بطاقتين متطابقتين',matched:'الأزواج المكتشفة',won:'وجدت جميع الأزواج!',skip:'تخطي دون عقوبة'}
};
function shuffled():number[]{
 const values=[...symbols.keys(),...symbols.keys()];
 for(let i=values.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[values[i],values[j]]=[values[j],values[i]]}
 return values;
}
export default function PairsIntermission({locale,onWin,onSkip}:{locale:ActiveLocale,onWin:()=>void,onSkip:()=>void}){
 const [deck]=useState(shuffled);
 const [open,setOpen]=useState<number[]>([]);
 const [found,setFound]=useState<number[]>([]);
 const [locked,setLocked]=useState(false);
 const [complete,setComplete]=useState(false);
 const mismatchTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
 useEffect(()=>()=>{if(mismatchTimer.current!==null)clearTimeout(mismatchTimer.current)},[]);
 const t=copy[locale]||copy.en;
 const pick=(i:number)=>{
  if(locked||complete||found.includes(deck[i])||open.includes(i))return;
  if(open.length===0){setOpen([i]);return;}
  const first=open[0];
  if(deck[first]===deck[i]){
   const next=[...found,deck[i]];setFound(next);setOpen([]);
   if(next.length===symbols.length){setComplete(true);onWin();}
  }else{
   setOpen([first,i]);setLocked(true);
   if(mismatchTimer.current!==null)clearTimeout(mismatchTimer.current);
   mismatchTimer.current=setTimeout(()=>{setOpen([]);setLocked(false);mismatchTimer.current=null},950);
  }
 };
 return <section aria-label={t.title} dir={locale==='he'||locale==='ar'?'rtl':'ltr'} style={{fontWeight:800,textAlign:'center'}}>
  <h4>{t.title}</h4><p>{t.help}</p>
  <p role='status' aria-live='polite'>{complete?t.won:t.matched+': '+found.length+'/'+symbols.length}</p>
  <div style={{display:'grid',gridTemplateColumns:'repeat(4,minmax(0,1fr))',gap:9,maxWidth:360,margin:'14px auto'}}>
   {deck.map((symbol,i)=>{
    const visible=found.includes(symbol)||open.includes(i);
    return <button key={i} type='button' disabled={complete||found.includes(symbol)}
     aria-label={String(i+1)+': '+(visible?symbols[symbol]:'?')}
     onClick={()=>pick(i)}
     style={{aspectRatio:'1',minHeight:62,borderRadius:13,border:'2px solid #6547c9',background:visible?'#fff1bf':'#4f35a8',color:visible?'#28204b':'#fff',fontSize:30,fontWeight:900}}>
     {visible?symbols[symbol]:'?'}
    </button>;
   })}
  </div>

  <button type='button' onClick={onSkip}>{t.skip}</button>
 </section>;
}
