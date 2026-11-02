'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import type {ActiveLocale} from '../lib/i18n';
import {gestureCopy} from '../lib/gestureIntermissions';
import {playGameSound} from '../lib/gameAudio';

/** A real scratch-off ticket: a metallic coating on a canvas is erased along the
 *  finger or mouse path, silver flakes fly off, and the prize shows through.
 *  Keyboard and screen-reader users scratch the same card in six strips. */
const STRIPS=6;
const REVEAL_AT=.55;
const words:Record<ActiveLocale,{hint:string;prize:string;scratched:string}>={
 he:{hint:'גרדו כאן',prize:'זכיתם!',scratched:'נגרד'},
 en:{hint:'Scratch here',prize:'You won!',scratched:'Scratched'},
 ru:{hint:'Сотрите здесь',prize:'Вы выиграли!',scratched:'Стёрто'},
 fr:{hint:'Grattez ici',prize:'Gagné !',scratched:'Gratté'},
 ar:{hint:'اخدش هنا',prize:'لقد فزت!',scratched:'تم الخدش'},
 es:{hint:'Rasca aquí',prize:'¡Has ganado!',scratched:'Rascado'}
};

function paintCoating(ctx:CanvasRenderingContext2D,w:number,h:number,hint:string){
 ctx.globalCompositeOperation='source-over';
 const g=ctx.createLinearGradient(0,0,w,h);
 g.addColorStop(0,'#C9CED8');g.addColorStop(.28,'#F4F6FA');g.addColorStop(.5,'#AEB4C1');
 g.addColorStop(.72,'#E9ECF2');g.addColorStop(1,'#9DA4B2');
 ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
 // fine metallic grain
 for(let i=0;i<w*h/38;i++){
  const v=150+Math.floor(Math.random()*90);
  ctx.fillStyle=`rgba(${v},${v},${v+8},${.18+Math.random()*.25})`;
  ctx.fillRect(Math.random()*w,Math.random()*h,1.2,1.2);
 }
 // soft diagonal sheen
 const s=ctx.createLinearGradient(0,0,w,0);
 s.addColorStop(0,'rgba(255,255,255,0)');s.addColorStop(.45,'rgba(255,255,255,.35)');s.addColorStop(.55,'rgba(255,255,255,0)');
 ctx.fillStyle=s;ctx.fillRect(0,0,w,h);
 ctx.fillStyle='rgba(70,76,94,.72)';
 ctx.font=`800 ${Math.round(Math.min(w,h)*.13)}px Rubik, system-ui, sans-serif`;
 ctx.textAlign='center';ctx.textBaseline='middle';
 ctx.fillText(hint,w/2,h/2);
}

export default function ScratchCard({locale,disabled,onComplete}:{locale:ActiveLocale;disabled:boolean;onComplete:()=>void}){
 const copy=gestureCopy[locale];
 const t=words[locale];
 const canvas=useRef<HTMLCanvasElement>(null);
 const wrap=useRef<HTMLDivElement>(null);
 const last=useRef<{x:number;y:number}|null>(null);
 const pointer=useRef<number|null>(null);
 const done=useRef(false);
 const lastSound=useRef(0);
 const [progress,setProgress]=useState(0);
 const [strips,setStrips]=useState<number[]>([]);
 const [flakes,setFlakes]=useState<{id:number;x:number;y:number;dx:number}[]>([]);
 const [revealed,setRevealed]=useState(false);

 useEffect(()=>{
  const c=canvas.current,box=wrap.current;if(!c||!box)return;
  const dpr=Math.min(2,window.devicePixelRatio||1);
  const r=box.getBoundingClientRect();
  c.width=Math.round(r.width*dpr);c.height=Math.round(r.height*dpr);
  const ctx=c.getContext('2d');if(!ctx)return;
  ctx.scale(dpr,dpr);paintCoating(ctx,r.width,r.height,t.hint);
 },[t.hint]);

 const finish=useCallback(()=>{
  if(done.current)return;done.current=true;setRevealed(true);setProgress(1);
  playGameSound('coin',{muted:false,volume:.8});
  onComplete();
 },[onComplete]);

 const measure=useCallback(()=>{
  const c=canvas.current;const ctx=c?.getContext('2d');if(!c||!ctx)return 0;
  const data=ctx.getImageData(0,0,c.width,c.height).data;
  let clear=0,total=0;
  for(let i=3;i<data.length;i+=4*24){total++;if(data[i]<40)clear++;}
  return total?clear/total:0;
 },[]);

 const scratchAt=(x:number,y:number)=>{
  const c=canvas.current;const ctx=c?.getContext('2d');if(!c||!ctx||disabled||done.current)return;
  const radius=Math.max(16,c.getBoundingClientRect().width*.055);
  ctx.globalCompositeOperation='destination-out';
  ctx.lineCap='round';ctx.lineJoin='round';ctx.lineWidth=radius*2;
  ctx.beginPath();
  const from=last.current||{x,y};
  ctx.moveTo(from.x,from.y);ctx.lineTo(x,y);ctx.stroke();
  ctx.beginPath();ctx.arc(x,y,radius,0,Math.PI*2);ctx.fill();
  last.current={x,y};
  if(Math.random()<.45)setFlakes(f=>[...f.slice(-14),{id:Date.now()+Math.random(),x,y,dx:(Math.random()-.5)*60}]);
  const now=performance.now();
  if(now-lastSound.current>140){lastSound.current=now;playGameSound('marker',{muted:false,volume:.35});}
 };
 const local=(e:React.PointerEvent)=>{const r=canvas.current!.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top};};
 const endStroke=()=>{
  pointer.current=null;last.current=null;
  const p=measure();setProgress(p);if(p>=REVEAL_AT)finish();
 };
 const scratchStrip=(i:number)=>{
  const c=canvas.current;const ctx=c?.getContext('2d');if(!c||!ctx||disabled||done.current||strips.includes(i))return;
  const r=c.getBoundingClientRect();const w=r.width/STRIPS;
  ctx.globalCompositeOperation='destination-out';ctx.fillRect(i*w,0,w+1,r.height);
  const next=[...strips,i];setStrips(next);setProgress(next.length/STRIPS);
  playGameSound('marker',{muted:false,volume:.35});
  if(next.length>=STRIPS)finish();
 };

 return <div className='scratch-ticket' data-testid='scratch-ticket'>
  <h4>{copy.scratch}</h4>
  <div ref={wrap} className={'scratch-surface'+(revealed?' is-revealed':'')}>
   <div className='scratch-prize' aria-hidden={!revealed}>
    <img src='/art/trophy.webp' alt='' width={96} height={96}/>
    <strong>{t.prize}</strong>
   </div>
   <canvas ref={canvas} className='scratch-coating' aria-hidden='true'
    onPointerDown={e=>{if(disabled||!e.isPrimary)return;pointer.current=e.pointerId;e.currentTarget.setPointerCapture(e.pointerId);const p=local(e);last.current=null;scratchAt(p.x,p.y);}}
    onPointerMove={e=>{if(pointer.current!==e.pointerId)return;const p=local(e);scratchAt(p.x,p.y);}}
    onPointerUp={endStroke} onPointerCancel={endStroke}/>
   {flakes.map(f=><span key={f.id} className='scratch-flake' style={{left:f.x,top:f.y,'--dx':f.dx+'px'} as React.CSSProperties} onAnimationEnd={()=>setFlakes(list=>list.filter(x=>x.id!==f.id))}/>)}
  </div>
  <div className='scratch-keyboard' role='group' aria-label={copy.scratchHelp}>
   {Array.from({length:STRIPS},(_,i)=><button key={i} type='button' className='scratch-strip-button'
    aria-label={`${copy.target} ${i+1}`} aria-pressed={strips.includes(i)} disabled={disabled||strips.includes(i)||revealed}
    onClick={()=>scratchStrip(i)}>{strips.includes(i)?t.scratched:i+1}</button>)}
  </div>
  <p role='status' aria-live='polite'>{copy.progress}: {Math.round(Math.min(1,progress/REVEAL_AT)*100)}%</p>
 </div>;
}
