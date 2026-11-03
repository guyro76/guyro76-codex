'use client';
import {useRef,type CSSProperties,type PointerEvent} from 'react';
import {GameImage,type ObjectArt} from './GameImage';
import type {ActiveLocale} from '../lib/i18n';
import './collectible-card.css';

const WORLD:Record<number,{art:ObjectArt;tint:string;glow:string}>={
  3:{art:'apple',tint:'#2EE6B8',glow:'#FF6B6B'},
  4:{art:'gem',tint:'#9B7BFF',glow:'#5BD8FF'},
  5:{art:'cloud',tint:'#5BD8FF',glow:'#FFFFFF'},
  6:{art:'planet',tint:'#FF7AD9',glow:'#FFC23D'}
};
const RARITY:Record<string,Record<ActiveLocale,string>>={
  'אגדי':{he:'אגדי',en:'Legendary',ru:'Легендарная',fr:'Légendaire',ar:'أسطورية',es:'Legendaria'},
  'נדיר':{he:'נדיר',en:'Rare',ru:'Редкая',fr:'Rare',ar:'نادرة',es:'Rara'},
  'מיוחד':{he:'מיוחד',en:'Special',ru:'Особая',fr:'Spéciale',ar:'خاصة',es:'Especial'}
};
const WORDS:Record<ActiveLocale,{stage:string;of:string;card:string}>={
  he:{stage:'שלב',of:'מתוך',card:'קלף'},en:{stage:'Stage',of:'of',card:'Card'},ru:{stage:'Этап',of:'из',card:'Карта'},
  fr:{stage:'Niveau',of:'sur',card:'Carte'},ar:{stage:'المرحلة',of:'من',card:'بطاقة'},es:{stage:'Nivel',of:'de',card:'Carta'}
};

/** A premium collectible card: foil frame, holographic sheen, depth tilt that follows the finger,
 *  and the world's photoreal artwork. Motion is off for people who prefer reduced motion. */
export default function StageCollectibleCard({stage,total,title,subtitle,world,rarity,locale}:{
  stage:number;total:number;title:string;subtitle:string;world:number;rarity:string;locale:ActiveLocale
}){
  const ref=useRef<HTMLElement>(null);
  const look=WORLD[world]||WORLD[3];
  const w=WORDS[locale]||WORDS.he;
  const tier=rarity==='אגדי'?'legendary':rarity==='נדיר'?'rare':'special';
  const tilt=(e:PointerEvent<HTMLElement>)=>{
    const el=ref.current;if(!el)return;
    const r=el.getBoundingClientRect();
    const x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
    el.style.setProperty('--rx',((.5-y)*14).toFixed(2)+'deg');
    el.style.setProperty('--ry',((x-.5)*16).toFixed(2)+'deg');
    el.style.setProperty('--mx',(x*100).toFixed(1)+'%');
    el.style.setProperty('--my',(y*100).toFixed(1)+'%');
  };
  const rest=()=>{const el=ref.current;if(!el)return;for(const k of ['--rx','--ry','--mx','--my'])el.style.removeProperty(k)};
  const num=String(stage).padStart(String(total).length,'0');
  return <div className='collectible-stage'>
    <article ref={ref} className={'collectible-card tier-'+tier} data-testid='stage-collectible-card'
      style={{'--card-tint':look.tint,'--card-glow':look.glow} as CSSProperties}
      onPointerMove={tilt} onPointerLeave={rest} onPointerUp={rest}
      aria-label={w.card+' '+num+' '+w.of+' '+total+': '+title}>
      <div className='collectible-card-face'>
        <div className='collectible-card-top'>
          <span className='collectible-rarity'><i aria-hidden='true'/>{(RARITY[rarity]||RARITY['מיוחד'])[locale]}</span>
          <span className='collectible-stage-no'>{w.stage} {stage}</span>
        </div>
        <div className='collectible-art' aria-hidden='true'>
          <span className='collectible-art-halo'/>
          <span className='collectible-art-rays'/>
          <GameImage name={look.art} size={168} className='collectible-art-image'/>
          {Array.from({length:9},(_,i)=><span key={i} className='collectible-mote' style={{'--i':i} as CSSProperties}/>)}
        </div>
        <div className='collectible-copy'>
          <h3>{title}</h3>
          {subtitle&&<p>{subtitle}</p>}
        </div>
        <div className='collectible-card-bottom'>
          <span>TRIVIA SQUARES</span>
          <strong dir='ltr'>{num} / {total}</strong>
        </div>
      </div>
      <span className='collectible-foil' aria-hidden='true'/>
      <span className='collectible-sheen' aria-hidden='true'/>
    </article>
  </div>;
}
