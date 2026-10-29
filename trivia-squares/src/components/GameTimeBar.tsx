'use client';
import {useEffect,useState} from 'react';
import type{ActiveLocale}from '../lib/i18n';
const zone='Asia/Jerusalem';
const builtAt=process.env.NEXT_PUBLIC_TRIVIA_BUILD_AT||'';
export default function GameTimeBar({locale}:{locale:ActiveLocale}){
 const [now,setNow]=useState<Date|null>(null);
 useEffect(()=>{setNow(new Date());const timer=window.setInterval(()=>setNow(new Date()),1000);return()=>window.clearInterval(timer)},[]);
 const en=locale==='en';
 const date=now?new Intl.DateTimeFormat(en?'en-GB':'he-IL',{timeZone:zone,day:'2-digit',month:'2-digit',year:'numeric'}).format(now):'--/--/----';
 const clock=now?new Intl.DateTimeFormat('en-GB',{timeZone:zone,hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(now):'--:--:--';
 const hebrew=now&&!en?new Intl.DateTimeFormat('he-IL-u-ca-hebrew',{timeZone:zone,day:'numeric',month:'long',year:'numeric'}).format(now):null;
 const built=builtAt&&Number.isFinite(Date.parse(builtAt))?new Intl.DateTimeFormat(en?'en-GB':'he-IL',{timeZone:zone,day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(builtAt)):en?'Not available':'לא זמין';
 return <div className='game-timebar' dir='ltr' role='group' aria-label={en?'Current date and game update':'תאריך ושעת העדכון האחרון'}>
  <div className='game-last-update'>
   <span>{en?'Last game update':'עדכון משחק אחרון'}</span>
   <time>{built}</time>
  </div>
  <div className='game-live-clock' dir={en?'ltr':'rtl'}>
   <time suppressHydrationWarning dateTime={now?.toISOString()} aria-label={en?'Local time in Israel':'השעה בישראל'}>{clock}</time>
   <strong>{date}</strong>
   {hebrew&&<small lang='he' dir='rtl'>{hebrew}</small>}
  </div>
 </div>;
}
