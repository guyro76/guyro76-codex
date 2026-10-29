'use client';

import { useState } from 'react';
import type { ActiveLocale } from '../lib/i18n';

export const SKINS = [
 {id:'classic',he:'רגיל',en:'Classic',ru:'Классика',fr:'Classique',ar:'كلاسيكي',symbol:'✦'},
 {id:'urban',he:'אורבני',en:'Urban',ru:'Городской',fr:'Urbain',ar:'حضري',symbol:'▦'},
 {id:'vintage',he:'וינטג׳',en:'Vintage',ru:'Винтаж',fr:'Vintage',ar:'عتيق',symbol:'❖'},
 {id:'retro',he:'רטרו',en:'Retro',ru:'Ретро',fr:'Rétro',ar:'ريترو',symbol:'◉'},
 {id:'pop',he:'פופ',en:'Pop',ru:'Поп-арт',fr:'Pop',ar:'بوب',symbol:'★'},
 {id:'future',he:'עתידני AI',en:'AI Future',ru:'ИИ Будущее',fr:'Futur IA',ar:'مستقبلي',symbol:'✧'}
] as const;
export type SkinId = typeof SKINS[number]['id'];
export function isSkinId(s:unknown):s is SkinId {return typeof s==='string'&&SKINS.some(x=>x.id===s);}
type Props={locale:ActiveLocale;value:SkinId;onChange:(s:SkinId)=>void};
export default function SkinPicker({locale,value,onChange}:Props){
 const [open,setOpen]=useState(false);
 const heading=({he:'עיצוב המשחק',en:'Game skins',ru:'Темы игры',fr:'Thèmes du jeu',ar:'مظاهر اللعبة'} as Record<ActiveLocale,string>)[locale];
 const description=({he:'בחר סגנון. הבחירה נשמרת במכשיר.',en:'Choose a style. Your choice is saved on this device.',ru:'Выберите тему. Выбор сохранится на устройстве.',fr:'Choisissez un style, enregistré sur cet appareil.',ar:'اختر المظهر. يُحفظ اختيارك على جهازك.'} as Record<ActiveLocale,string>)[locale];
 return <div className='skin-picker'>
   <button type='button' className='skin-toggle' aria-expanded={open} aria-controls='skin-menu' aria-label={heading} onClick={()=>setOpen(v=>!v)}>
     <svg viewBox='0 0 24 24' width='23' height='23' aria-hidden='true' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round'><path d='M12 3C6 3 2 7.3 2 12.3 2 17 5.7 21 10.6 21c1.7 0 2.8-1.2 2.8-2.5 0-.7-.3-1.3-.3-1.8 0-1 .8-1.5 1.8-1.5h2.3C20 15.2 22 13.3 22 10.8 22 6.5 17.7 3 12 3Z'/><circle cx='7.3' cy='11.4' r='1'/><circle cx='10.3' cy='7.5' r='1'/><circle cx='15.2' cy='7.6' r='1'/><circle cx='18.2' cy='11.4' r='1'/></svg>
     <span>{heading}</span><span className='skin-toggle-chevron' aria-hidden='true'>{open?'▴':'▾'}</span>
   </button>
   {open&&<section className='skin-menu' id='skin-menu' aria-label={heading}>
     <h2>{heading}</h2><p>{description}</p>
     <div className='skin-options' role='group' aria-label={heading}>{SKINS.map(s=><button type='button' className={'skin-option skin-sample-'+s.id} key={s.id} aria-pressed={value===s.id}
       onClick={()=>{onChange(s.id);setOpen(false)}}>
       <span className='skin-option-symbol' aria-hidden='true'>{s.symbol}</span>
       <strong>{s[locale]}</strong><span className='skin-active' aria-hidden='true'>{value===s.id?'✓':''}</span>
     </button>)}</div>
   </section>}
 </div>;
}
