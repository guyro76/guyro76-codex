import {useId} from 'react';

/** Compact, scalable brand mark: four marker dots, an earned square and a spark of trivia. */
export default function TriviaMark({label='Trivia Squares',size=46}:{label?:string;size?:number}){
 const gradient=useId().replace(/:/g,'');
 const gold=gradient+'-gold',aqua=gradient+'-aqua';
 return <svg width={size} height={size} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"
   role="img" aria-label={label} className="trivia-brand-mark" focusable="false">
   <defs>
     <linearGradient id={aqua} x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#90EEFA"/><stop offset="1" stopColor="#8F91FF"/></linearGradient>
     <linearGradient id={gold} x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#FFF5BF"/><stop offset="1" stopColor="#FFAD5D"/></linearGradient>
   </defs>
   <rect x="2" y="2" width="60" height="60" rx="17" fill="#142753" stroke="#A7CBFF" strokeWidth="1.6"/>
   <rect x="14" y="14" width="36" height="36" rx="6" fill="#6C76D9" fillOpacity=".20"/>
   <path d="M15 15H49M15 15V49M49 15V49M15 49H49" stroke={'url(#'+aqua+')'} strokeWidth="5.5"
     strokeLinecap="round" strokeLinejoin="round"/>
   <path d="M32 20L35.3 28.7L44 32L35.3 35.3L32 44L28.7 35.3L20 32L28.7 28.7Z"
     fill={'url(#'+gold+')'} stroke="#FFFFFF" strokeWidth=".65"/>
   <circle cx="15" cy="15" r="5.1" fill="#E7F9FF" stroke="#4B8EDC" strokeWidth="1.8"/>
   <circle cx="49" cy="15" r="5.1" fill="#E7F9FF" stroke="#4B8EDC" strokeWidth="1.8"/>
   <circle cx="15" cy="49" r="5.1" fill="#E7F9FF" stroke="#4B8EDC" strokeWidth="1.8"/>
   <circle cx="49" cy="49" r="5.1" fill="#E7F9FF" stroke="#4B8EDC" strokeWidth="1.8"/>
 </svg>;
}
