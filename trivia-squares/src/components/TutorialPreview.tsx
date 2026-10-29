'use client';
import type {ActiveLocale} from '../lib/i18n';
import CaptureTile from './CaptureTile';

/** An illustration of real moves, not a second playable board or a stock video. */
export default function TutorialPreview({locale,page,color,avatar}:{locale:ActiveLocale;page:number;color:string;avatar:string}) {
 const en=locale==='en';
 return <div className='lumen-tutorial-preview' data-testid='tutorial-preview' data-locale={locale} data-step={page} key={page}>
  <p className='tutorial-demo-label'>{en?'Demonstration only. The playable board is behind this guide.':'הדגמה בלבד. הלוח שעליו מציירים נמצא מאחורי חלון ההדרכה.'}</p>
  <div className='lumen-tutorial-step-indicator' role='group' aria-label={en?'Tutorial step '+(page+1)+' of 3':'שלב הדרכה '+(page+1)+' מתוך 3'}>
   {[0,1,2].map(i=><span key={i} className={i===page?'active':''} aria-hidden='true'/>)}
  </div>
  <svg viewBox='0 0 340 225' className='lumen-tutorial-visual' role='img' aria-label={
    page===0?(en?'Demo: a marker draws horizontally between adjacent dots':'הדגמה: הטוש מחבר שתי נקודות סמוכות')
    :page===1?(en?'Demo: four answers appear and one correct answer is highlighted':'הדגמה: מופיעות ארבע תשובות והתשובה הנכונה מסומנת')
    :(en?'Demo: a completed square fills with player color and icon':'הדגמה: ריבוע שהושלם נצבע ומציג את סמל השחקן')
  }>
   <defs>
    <linearGradient id='tutSurface' x1='0' y1='0' x2='1' y2='1'><stop offset='0%' stopColor='#E3FCFF' stopOpacity='.19'/><stop offset='100%' stopColor='#7CC8EC' stopOpacity='.05'/></linearGradient>
    <pattern id='tutGrid' width='20' height='20' patternUnits='userSpaceOnUse'><path d='M20 0H0V20' fill='none' stroke='#D5F5FF' strokeOpacity='.22' strokeWidth='1'/></pattern>
    <linearGradient id='tutMarker' x1='0' y1='0' x2='1' y2='0'><stop stopColor='#FFF6C1'/><stop offset='100%' stopColor={color}/></linearGradient>
   </defs>
   <rect x='13' y='10' width='314' height='205' rx='22' fill='url(#tutSurface)' stroke='#D9F5FF' strokeOpacity='.52'/>
   <rect x='13' y='10' width='314' height='205' rx='22' fill='url(#tutGrid)'/>
   <path d='M35 28V197' stroke='#FF9EAC' strokeOpacity='.42' strokeWidth='2'/>
   {[0,1,2].flatMap(r=>[0,1,2].map(c=><g key={r+'-'+c}>
     <circle cx={80+c*90} cy={49+r*65} r='12' fill='#BCE0FF' fillOpacity='.2'/>
     <circle cx={80+c*90} cy={49+r*65} r='6' fill='#FFFDF5' stroke='#D4EFFF' strokeWidth='2'/>
    </g>))}
   {page===0&&<g>
     <path className='lumen-tutorial-ink' d='M80 49H170' stroke='url(#tutMarker)' strokeWidth='11' fill='none' strokeLinecap='round'/>
     <g className='lumen-tutorial-pen'><path d='M0 -21L11 -10L-7 13L-15 18L-11 7Z' fill='#FFF1BC' stroke='#BDA6FF' strokeWidth='2'/><path d='M-15 18L-11 7L-7 13Z' fill={color}/></g>
     <path d='M80 58H170' stroke='#FFFFFF' strokeDasharray='3 9' opacity='.24'/>
   </g>}
   {page===1&&<g>
     <path d='M80 49H170' stroke={color} strokeWidth='9' strokeLinecap='round'/>
     <rect x='40' y='78' width='260' height='110' rx='15' fill='#132953' fillOpacity='.94' stroke='#E6F7FF' strokeOpacity='.6'/>
     <text x='170' y='99' textAnchor='middle' fontFamily='Arial,sans-serif' fill='#FFECB5' fontSize='12' fontWeight='bold'>{en?'What is the capital of France?':'מהי בירת צרפת?'}</text>
     {['A','B','C','D'].map((v,i)=>{
       const labels=en?['London','Paris','Rome','Berlin']:['לונדון','פריז','רומא','ברלין'];
       const x=51+(i%2)*124,y=111+Math.floor(i/2)*33;
       return <g key={v} className={i===1?'lumen-tutorial-answer-correct':''}>
         <rect x={x} y={y} width='114' height='26' rx='8' fill={i===1?'#A2F4C5':'#D5E6FF'} stroke={i===1?'#FFFFFF':'#D5E6FF'} />
         <text x={x+57} y={y+18} textAnchor='middle' fontFamily='Arial,sans-serif' fill='#10234D' fontSize='12' fontWeight='bold'>{labels[i]}</text>
       </g>;
     })}
   </g>}
   {page===2&&<g>
     <path d='M80 49H170V114H80Z' stroke={color} strokeWidth='10' fill='none' strokeLinejoin='round' strokeLinecap='round'/>
     <CaptureTile row={0} col={0} x={90} y={59} width={70} height={45} color={color}
       name={en?'Player':'שחקן'} icon={avatar} style='lumen' locale={locale}/>
     <g className='lumen-tutorial-star' fill='#FFE8A0'><path d='M217 66l7 14 15 3-11 11 3 16-14-8-14 8 3-16-11-11 15-3z'/><circle cx='270' cy='151' r='4'/><circle cx='51' cy='155' r='3'/></g>
     <text x='226' y='130' fill='#FFE9B3' textAnchor='middle' fontFamily='Arial,sans-serif' fontWeight='900' fontSize='18'>+1</text>
   </g>}
  </svg>
  <p className='lumen-tutorial-step-caption'>
   {page===0?(en?'Slide a finger or mouse between any neighboring dots — never diagonally.':'גררו אצבע או עכבר בין כל שתי נקודות סמוכות — בלי אלכסון.')
      :page===1?(en?'Every valid new line opens a timed trivia question.':'כל קו חדש ותקין פותח שאלה עם טיימר.')
      :(en?'Complete the square to earn the point and reveal your collectible.':'סגרו ריבוע, צברו נקודה וגלו קלף אספנות.')}
  </p>
 </div>;
}
