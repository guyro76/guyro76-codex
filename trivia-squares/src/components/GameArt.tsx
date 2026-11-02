'use client';
import {useId} from 'react';

/** Original vector illustrations for the game UI (no emoji, no stock art).
 *  Each piece is a small 2D illustration with real depth: a body gradient,
 *  a specular highlight, a darker core shadow and a soft contact shadow. */
export type GameArtName=
 |'apple'|'gem'|'cloud'|'planet'
 |'coin'|'bulb'|'hourglass'|'flag'
 |'speaker'|'speakerOff'|'palette'|'play'|'help'|'marker'|'versus';

type Props={name:GameArtName;size?:number;title?:string;className?:string};

export default function GameArt({name,size=28,title,className}:Props){
 const raw=useId().replace(/[^a-zA-Z0-9_-]/g,'');
 const id=(k:string)=>raw+'-'+k;
 const u=(k:string)=>'url(#'+id(k)+')';
 const a11y=title?{role:'img' as const,'aria-label':title}:{'aria-hidden':true as const};
 return <svg viewBox='0 0 64 64' width={size} height={size} className={'game-art game-art-'+name+(className?' '+className:'')}
  focusable='false' {...a11y}>
  {art(name,id,u)}
 </svg>;
}

function shadow(u:(k:string)=>string,id:(k:string)=>string,cy=58,rx=19){
 return <>
  <defs><radialGradient id={id('sh')}><stop offset='0' stopColor='#02061A' stopOpacity='.55'/><stop offset='1' stopColor='#02061A' stopOpacity='0'/></radialGradient></defs>
  <ellipse cx='32' cy={cy} rx={rx} ry='4.5' fill={u('sh')}/>
 </>;
}

function art(name:GameArtName,id:(k:string)=>string,u:(k:string)=>string){
 switch(name){
 case 'apple':return <>
  <defs>
   <radialGradient id={id('a')} cx='38%' cy='34%' r='70%'><stop offset='0' stopColor='#FF8A80'/><stop offset='.45' stopColor='#E8283F'/><stop offset='1' stopColor='#7E0A1F'/></radialGradient>
   <linearGradient id={id('l')} x1='0' y1='0' x2='1' y2='1'><stop offset='0' stopColor='#B9F26B'/><stop offset='1' stopColor='#2F9E3A'/></linearGradient>
   <linearGradient id={id('s')} x1='0' y1='0' x2='0' y2='1'><stop offset='0' stopColor='#8A5A33'/><stop offset='1' stopColor='#4A2A12'/></linearGradient>
  </defs>
  {shadow(u,id)}
  <path d='M32 18c-4-3-10-4-15-1-7 4-8 14-5 22 3 9 9 16 15 16 2 0 3-1 5-1s3 1 5 1c6 0 12-7 15-16 3-8 2-18-5-22-5-3-11-2-15 1z' fill={u('a')}/>
  <path d='M47 26c3 7 2 17-4 24' fill='none' stroke='#5A0614' strokeOpacity='.35' strokeWidth='4' strokeLinecap='round'/>
  <ellipse cx='22' cy='28' rx='5' ry='8' transform='rotate(-24 22 28)' fill='#FFFFFF' opacity='.55'/>
  <circle cx='25' cy='22' r='2' fill='#FFFFFF' opacity='.9'/>
  <path d='M32 19c0-5 1-9 4-12' fill='none' stroke={u('s')} strokeWidth='3.4' strokeLinecap='round'/>
  <path d='M35 12c4-6 12-7 16-4-2 6-9 9-16 4z' fill={u('l')}/>
  <path d='M36 11c4-1 8-2 12-3' stroke='#1E6B26' strokeOpacity='.6' strokeWidth='1.2' fill='none'/>
 </>;
 case 'gem':return <>
  <defs>
   <linearGradient id={id('t')} x1='0' y1='0' x2='1' y2='1'><stop offset='0' stopColor='#E6FBFF'/><stop offset='1' stopColor='#7FD8FF'/></linearGradient>
   <linearGradient id={id('m')} x1='0' y1='0' x2='0' y2='1'><stop offset='0' stopColor='#58B8FF'/><stop offset='1' stopColor='#3B4FD9'/></linearGradient>
   <linearGradient id={id('d')} x1='0' y1='0' x2='1' y2='1'><stop offset='0' stopColor='#8E6BFF'/><stop offset='1' stopColor='#2B1F8F'/></linearGradient>
  </defs>
  {shadow(u,id,58,16)}
  <path d='M14 22l8-10h20l8 10L32 54z' fill={u('m')}/>
  <path d='M14 22h36L32 54z' fill={u('d')} opacity='.55'/>
  <path d='M22 12h20l-4 10H26z' fill={u('t')}/>
  <path d='M14 22l8-10 4 10zM50 22l-8-10-4 10z' fill='#BFEFFF' opacity='.85'/>
  <path d='M26 22h12L32 54z' fill='#9FE6FF' opacity='.5'/>
  <path d='M24 15l3 5' stroke='#FFFFFF' strokeWidth='2' strokeLinecap='round'/>
  <path d='M48 8l1.4 3.6L53 13l-3.6 1.4L48 18l-1.4-3.6L43 13l3.6-1.4z' fill='#FFFFFF'/>
 </>;
 case 'cloud':return <>
  <defs>
   <linearGradient id={id('c')} x1='0' y1='0' x2='0' y2='1'><stop offset='0' stopColor='#FFFFFF'/><stop offset='.6' stopColor='#DCEBFF'/><stop offset='1' stopColor='#9DB9EE'/></linearGradient>
  </defs>
  {shadow(u,id,56,22)}
  <path d='M18 48c-7 0-11-5-11-10 0-6 5-10 10-10 1-8 8-13 15-13 8 0 13 5 15 11 7 0 11 5 11 11s-5 11-11 11z' fill={u('c')}/>
  <path d='M14 46c14 3 30 3 42-2' stroke='#7F9CD8' strokeOpacity='.45' strokeWidth='3' fill='none' strokeLinecap='round'/>
  <ellipse cx='27' cy='24' rx='7' ry='4' fill='#FFFFFF' opacity='.9'/>
 </>;
 case 'planet':return <>
  <defs>
   <radialGradient id={id('p')} cx='36%' cy='32%' r='72%'><stop offset='0' stopColor='#FFD29A'/><stop offset='.45' stopColor='#FF6F91'/><stop offset='1' stopColor='#5B1F8E'/></radialGradient>
   <linearGradient id={id('r')} x1='0' y1='0' x2='1' y2='0'><stop offset='0' stopColor='#FFE6A8' stopOpacity='.2'/><stop offset='.5' stopColor='#FFE6A8'/><stop offset='1' stopColor='#FFE6A8' stopOpacity='.2'/></linearGradient>
  </defs>
  {shadow(u,id,59,16)}
  <path d='M8 36c4 6 44-2 48-12' fill='none' stroke={u('r')} strokeWidth='4' strokeLinecap='round' opacity='.6'/>
  <circle cx='32' cy='31' r='18' fill={u('p')}/>
  <path d='M17 34c6 4 20 5 30-2' stroke='#7A2A8C' strokeOpacity='.4' strokeWidth='3' fill='none'/>
  <ellipse cx='25' cy='23' rx='6' ry='4' transform='rotate(-30 25 23)' fill='#FFFFFF' opacity='.55'/>
  <path d='M56 24C52 36 12 42 8 36' fill='none' stroke={u('r')} strokeWidth='4' strokeLinecap='round'/>
 </>;
 case 'coin':return <>
  <defs>
   <radialGradient id={id('g')} cx='36%' cy='30%' r='75%'><stop offset='0' stopColor='#FFF6C4'/><stop offset='.45' stopColor='#FFC23D'/><stop offset='1' stopColor='#B9740B'/></radialGradient>
   <linearGradient id={id('e')} x1='0' y1='0' x2='0' y2='1'><stop offset='0' stopColor='#D38D12'/><stop offset='1' stopColor='#8A5204'/></linearGradient>
  </defs>
  {shadow(u,id,58,17)}
  <ellipse cx='32' cy='35' rx='21' ry='21' fill={u('e')}/>
  <circle cx='32' cy='31' r='21' fill={u('g')}/>
  <circle cx='32' cy='31' r='15' fill='none' stroke='#B9740B' strokeOpacity='.55' strokeWidth='2'/>
  <path d='M32 21l3 6.4 7 .8-5.2 4.8 1.4 7-6.2-3.6-6.2 3.6 1.4-7-5.2-4.8 7-.8z' fill='#FFE48A' stroke='#B9740B' strokeOpacity='.6' strokeWidth='1.2'/>
  <path d='M18 22a16 16 0 0 1 10-8' stroke='#FFFFFF' strokeOpacity='.85' strokeWidth='3' strokeLinecap='round' fill='none'/>
 </>;
 case 'bulb':return <>
  <defs>
   <radialGradient id={id('b')} cx='40%' cy='34%' r='70%'><stop offset='0' stopColor='#FFFBE0'/><stop offset='.5' stopColor='#FFD866'/><stop offset='1' stopColor='#E39A17'/></radialGradient>
   <linearGradient id={id('k')} x1='0' y1='0' x2='0' y2='1'><stop offset='0' stopColor='#D8DEEF'/><stop offset='1' stopColor='#7D869F'/></linearGradient>
  </defs>
  {shadow(u,id,60,12)}
  <circle cx='32' cy='26' r='19' fill='#FFE28A' opacity='.28'/>
  <path d='M32 8c-10 0-17 7-17 16 0 6 3 10 6 13 2 2 3 4 3 7h16c0-3 1-5 3-7 3-3 6-7 6-13 0-9-7-16-17-16z' fill={u('b')}/>
  <path d='M27 44c0-5-2-9-4-12M37 44c0-5 2-9 4-12' stroke='#C77A0A' strokeOpacity='.5' strokeWidth='1.6' fill='none'/>
  <path d='M28 30l4 4 4-4' stroke='#B8640A' strokeWidth='2' fill='none' strokeLinecap='round'/>
  <rect x='24' y='44' width='16' height='10' rx='3' fill={u('k')}/>
  <path d='M24 48h16M25 51h14' stroke='#5E6680' strokeOpacity='.6' strokeWidth='1.2'/>
  <ellipse cx='25' cy='18' rx='4' ry='6' transform='rotate(-25 25 18)' fill='#FFFFFF' opacity='.7'/>
 </>;
 case 'hourglass':return <>
  <defs>
   <linearGradient id={id('w')} x1='0' y1='0' x2='0' y2='1'><stop offset='0' stopColor='#C98A4A'/><stop offset='1' stopColor='#7A4A1C'/></linearGradient>
   <linearGradient id={id('gl')} x1='0' y1='0' x2='1' y2='0'><stop offset='0' stopColor='#CFE6FF' stopOpacity='.55'/><stop offset='.5' stopColor='#FFFFFF' stopOpacity='.18'/><stop offset='1' stopColor='#9DB9EE' stopOpacity='.5'/></linearGradient>
   <linearGradient id={id('sa')} x1='0' y1='0' x2='0' y2='1'><stop offset='0' stopColor='#FFE08A'/><stop offset='1' stopColor='#E3A12A'/></linearGradient>
  </defs>
  {shadow(u,id,60,15)}
  <path d='M20 12h24c0 10-8 14-9 20 1 6 9 10 9 20H20c0-10 8-14 9-20-1-6-9-10-9-20z' fill={u('gl')} stroke='#FFFFFF' strokeOpacity='.5'/>
  <path d='M24 20h16c-2 5-6 7-8 10-2-3-6-5-8-10z' fill={u('sa')}/>
  <path d='M23 50c1-6 6-8 9-10 3 2 8 4 9 10z' fill={u('sa')}/>
  <path d='M32 31v8' stroke='#E3A12A' strokeWidth='1.6'/>
  <rect x='15' y='7' width='34' height='6' rx='3' fill={u('w')}/>
  <rect x='15' y='51' width='34' height='6' rx='3' fill={u('w')}/>
  <path d='M24 15c-1 4 0 8 3 11' stroke='#FFFFFF' strokeOpacity='.8' strokeWidth='2' fill='none' strokeLinecap='round'/>
 </>;
 case 'flag':return <>
  <defs>
   <linearGradient id={id('f')} x1='0' y1='0' x2='1' y2='1'><stop offset='0' stopColor='#FF86A2'/><stop offset='1' stopColor='#C2234F'/></linearGradient>
   <linearGradient id={id('po')} x1='0' y1='0' x2='1' y2='0'><stop offset='0' stopColor='#F4F6FF'/><stop offset='1' stopColor='#9AA6CC'/></linearGradient>
  </defs>
  {shadow(u,id,59,12)}
  <rect x='16' y='8' width='5' height='50' rx='2.5' fill={u('po')}/>
  <path d='M21 11c10-5 18 5 30 0v22c-12 5-20-5-30 0z' fill={u('f')}/>
  <path d='M21 25c10-5 18 5 30 0' stroke='#8E1236' strokeOpacity='.35' strokeWidth='3' fill='none'/>
  <path d='M25 15c6-2 10 1 15 1' stroke='#FFFFFF' strokeOpacity='.6' strokeWidth='2' fill='none' strokeLinecap='round'/>
  <circle cx='18.5' cy='8' r='3.5' fill='#FFC23D'/>
 </>;
 case 'speaker':case 'speakerOff':return <>
  <defs>
   <linearGradient id={id('sp')} x1='0' y1='0' x2='1' y2='1'><stop offset='0' stopColor='#FFFFFF'/><stop offset='1' stopColor='#B8C4EC'/></linearGradient>
  </defs>
  <path d='M10 25h9l12-10v34L19 39h-9a3 3 0 0 1-3-3V28a3 3 0 0 1 3-3z' fill={u('sp')}/>
  <path d='M10 27h8' stroke='#FFFFFF' strokeWidth='2' strokeLinecap='round'/>
  {name==='speaker'
   ?<><path d='M39 24a11 11 0 0 1 0 16' stroke='#2EE6B8' strokeWidth='4' strokeLinecap='round' fill='none'/>
      <path d='M45 18a19 19 0 0 1 0 28' stroke='#2EE6B8' strokeOpacity='.7' strokeWidth='4' strokeLinecap='round' fill='none'/></>
   :<path d='M40 24l14 16M54 24L40 40' stroke='#FF4F7B' strokeWidth='4.5' strokeLinecap='round'/>}
 </>;
 case 'palette':return <>
  <defs>
   <radialGradient id={id('pw')} cx='40%' cy='35%' r='75%'><stop offset='0' stopColor='#F3D3A3'/><stop offset='1' stopColor='#B07A3E'/></radialGradient>
  </defs>
  {shadow(u,id,58,18)}
  <path d='M32 8C17 8 7 18 7 31c0 12 9 21 20 21 4 0 5-3 4-6-1-4 1-7 5-7h6c8 0 15-5 15-13C57 15 46 8 32 8z' fill={u('pw')}/>
  <circle cx='44' cy='40' r='4.5' fill='#0A0E24' opacity='.55'/>
  <circle cx='20' cy='26' r='5' fill='#FF4F7B'/><circle cx='30' cy='18' r='5' fill='#FFC23D'/>
  <circle cx='42' cy='20' r='5' fill='#2EE6B8'/><circle cx='18' cy='38' r='5' fill='#7B6BFF'/>
  <path d='M14 20a17 17 0 0 1 12-8' stroke='#FFFFFF' strokeOpacity='.7' strokeWidth='2.4' strokeLinecap='round' fill='none'/>
 </>;
 case 'play':return <>
  <defs><linearGradient id={id('pl')} x1='0' y1='0' x2='0' y2='1'><stop offset='0' stopColor='#FFFFFF'/><stop offset='1' stopColor='#FFD4DE'/></linearGradient></defs>
  <path d='M22 14c0-3 3-5 6-3l22 16c3 2 3 6 0 8L28 51c-3 2-6 0-6-3z' fill={u('pl')}/>
  <path d='M26 20v18' stroke='#FFFFFF' strokeWidth='2.6' strokeLinecap='round'/>
 </>;
 case 'help':return <>
  <defs><radialGradient id={id('h')} cx='38%' cy='32%' r='75%'><stop offset='0' stopColor='#9C8CFF'/><stop offset='1' stopColor='#3A2BB0'/></radialGradient></defs>
  <circle cx='32' cy='32' r='22' fill={u('h')}/>
  <path d='M25 26c0-5 3-8 7-8s7 3 7 7c0 6-7 6-7 11' stroke='#FFFFFF' strokeWidth='4.5' strokeLinecap='round' fill='none'/>
  <circle cx='32' cy='44' r='3' fill='#FFFFFF'/>
  <ellipse cx='24' cy='20' rx='6' ry='3.5' transform='rotate(-30 24 20)' fill='#FFFFFF' opacity='.35'/>
 </>;
 case 'marker':return <>
  <defs>
   <linearGradient id={id('mb')} x1='0' y1='0' x2='1' y2='0'><stop offset='0' stopColor='#FF86A2'/><stop offset='1' stopColor='#C2234F'/></linearGradient>
  </defs>
  {shadow(u,id,59,15)}
  <g transform='rotate(40 32 32)'>
   <rect x='24' y='4' width='16' height='38' rx='5' fill={u('mb')}/>
   <rect x='27' y='8' width='3' height='28' rx='1.5' fill='#FFFFFF' opacity='.55'/>
   <path d='M24 42h16l-5 10h-6z' fill='#E9ECF8'/>
   <path d='M29 52h6l-3 7z' fill='#FF4F7B'/>
  </g>
 </>;
 case 'versus':return <>
  <defs><linearGradient id={id('v')} x1='0' y1='0' x2='1' y2='1'><stop offset='0' stopColor='#FFE48A'/><stop offset='1' stopColor='#E39A17'/></linearGradient></defs>
  <path d='M14 50L44 14l6 6-36 30z' fill='#DCE3F7'/><path d='M50 50L20 14l-6 6 36 30z' fill='#F4F6FF'/>
  <rect x='9' y='45' width='12' height='5' rx='2' transform='rotate(-40 15 47)' fill={u('v')}/>
  <rect x='43' y='45' width='12' height='5' rx='2' transform='rotate(40 49 47)' fill={u('v')}/>
 </>;
 }
}
