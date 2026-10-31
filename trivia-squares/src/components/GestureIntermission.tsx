'use client';
import {useRef,useState} from 'react';
import type {ActiveLocale} from '../lib/i18n';
import {gestureCopy,markTarget,requiredTargets,type GestureGame} from '../lib/gestureIntermissions';
import './gesture-intermission.css';

export default function GestureIntermission({kind,locale,disabled,onComplete}:{kind:GestureGame;locale:ActiveLocale;disabled:boolean;onComplete:()=>void}){
 const [marks,setMarks]=useState<number[]>([]);
 const marked=useRef<number[]>([]);
 const claimed=useRef(false);
 const pointer=useRef<number|null>(null);
 const root=useRef<HTMLDivElement>(null);
 const copy=gestureCopy[locale];
 const total=kind==='scratch'?9:3;
 const needed=requiredTargets(kind);
 const mark=(index:number)=>{
  if(disabled||claimed.current)return;
  const next=markTarget(marked.current,index,total);
  marked.current=next;setMarks(next);
  if(next.length>=needed){claimed.current=true;onComplete();}
 };
 const hit=(x:number,y:number)=>{
  const target=document.elementFromPoint(x,y)?.closest<HTMLElement>('[data-gesture-target]');
  if(target&&root.current?.contains(target))mark(Number(target.dataset.gestureTarget));
 };
 return <div className={'gesture-challenge '+kind} data-testid={'challenge-'+kind}>
  <h4>{copy[kind]}</h4><p>{copy[`${kind}Help`]}</p>
  <div ref={root} className='gesture-targets' role='group' aria-label={copy[kind]}
   onPointerDown={e=>{if(disabled||!e.isPrimary)return;pointer.current=e.pointerId;e.currentTarget.setPointerCapture(e.pointerId);hit(e.clientX,e.clientY);}}
   onPointerMove={e=>{if(pointer.current===e.pointerId)hit(e.clientX,e.clientY);}}
   onPointerUp={()=>{pointer.current=null;}} onPointerCancel={()=>{pointer.current=null;}} onLostPointerCapture={()=>{pointer.current=null;}}>
   {Array.from({length:total},(_,i)=><button key={i} type='button' data-gesture-target={i}
    className={marks.includes(i)?'revealed':''} aria-label={`${copy.target} ${i+1}`} aria-pressed={marks.includes(i)}
    disabled={disabled||marks.includes(i)} onClick={()=>mark(i)}>
    <span aria-hidden='true'>{marks.includes(i)?'✦':kind==='scratch'?'◆':kind==='sword'?'?':'✂'}</span>
   </button>)}
  </div>
  <p role='status' aria-live='polite'>{copy.progress}: {marks.length} / {needed}</p>
 </div>;
}
