'use client';

import {useCallback,useEffect,useState} from 'react';
import type {SupabaseClient} from '@supabase/supabase-js';
import type {ActiveLocale} from '../lib/i18n';
import {cardById,localStageCard,readLocalAlbum,saveLocalAlbum,type StageCard,type LocalEarned} from '../lib/stageRewards';
import {intermissionText,intermissionWord,intermissionPrize,intermissionCard} from '../lib/intermissionLocales';

type RewardProps={
  stageKey:string;
  worldSize:number;
  stageNumber:number;
  locale:ActiveLocale;
  remoteMatchId?:string;
  client:SupabaseClient|null;
  onAdvance:()=>void;
  onLocalPrize:(prize:string)=>void;
  onRemotePrize:()=>void;
  onSound:(cue:'bonus'|'win')=>void;
};

function Illustration({card}:{card:StageCard}){
  const hue=card.world===3?'#91F4C7':card.world===4?'#C4ABFF':card.world===5?'#AFE9FF':'#F3AAF5';
  const prefix='art-'+card.id;
  return <svg className='lumen-collectible-art' viewBox='0 0 340 256' role='img' aria-label={'איור קלף מקורי: '+card.title}>
    <defs>
      <radialGradient id={prefix+'-halo'}><stop offset='0%' stopColor={hue} stopOpacity='.75'/><stop offset='100%' stopColor={hue} stopOpacity='0'/></radialGradient>
      <linearGradient id={prefix+'-foil'} x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0%' stopColor='#F9E4AC'/><stop offset='45%' stopColor={hue}/><stop offset='95%' stopColor='#FFFFFF'/>
      </linearGradient>
    </defs>
    <circle cx='170' cy='128' r='140' fill={'url(#'+prefix+'-halo)'}/>
    {Array.from({length:13},(_,i)=><circle key={i} cx={20+(i*47)%300} cy={18+(i*81)%225} r={i%3+1.3} fill='#FFFFFF' opacity={.25+(i%4)*.17}/>)}
    {card.kind==='portrait' && <>
      <circle cx='170' cy='104' r='86' fill='#0A1C3A' fillOpacity='.36' stroke={hue} strokeWidth='2'/>
      <path d='M102 232Q107 177 144 160L153 154Q147 148 142 134Q127 113 133 85Q140 44 170 44Q201 44 208 85Q213 115 199 135Q194 149 188 155L206 163Q237 182 242 232Z' fill={'url(#'+prefix+'-foil)'} opacity='.87'/>
      <path d='M128 96Q118 48 171 36Q222 48 216 96Q205 78 199 70Q158 93 137 75Z' fill='#263565' opacity='.89'/>
      <path d='M140 189Q170 210 200 189' fill='none' stroke='#071C35' strokeOpacity='.5' strokeWidth='4'/>
      <circle cx='94' cy='79' r='5' fill={hue}/><circle cx='251' cy='153' r='4' fill={hue}/>
    </>}
    {card.kind==='song' && <>
      <circle cx='170' cy='129' r='105' fill='#0C1536' stroke={'url(#'+prefix+'-foil)'} strokeWidth='8'/>
      {[94,72,52,34].map(n=><circle key={n} cx='170' cy='129' r={n} fill='none' stroke='#D6CCFF' strokeOpacity='.18' strokeWidth='1.4'/>)}
      <circle cx='170' cy='129' r='30' fill={'url(#'+prefix+'-foil)'}/>
      <circle cx='170' cy='129' r='8' fill='#1F2A55'/>
      <path d='M239 25V92Q237 109 219 109Q196 109 196 94Q197 80 213 79Q222 77 229 79V38Z' fill={hue} opacity='.9'/>
      <path d='M242 30L274 21V65L242 76Z' fill={hue} opacity='.75'/>
    </>}
    {card.kind==='letter' && <>
      <rect x='86' y='35' width='168' height='186' rx='30' fill='#14254F' fillOpacity='.6' stroke={'url(#'+prefix+'-foil)'} strokeWidth='3'/>
      <path d='M97 54L121 46M220 209L239 200' stroke='#FFFFFF' strokeOpacity='.65' strokeWidth='2' strokeLinecap='round'/>
      <text x='170' y='165' textAnchor='middle' fill={'url(#'+prefix+'-foil)'} fontSize='134' fontWeight='900' fontFamily='Arial, sans-serif'>{card.glyph}</text>
      <circle cx='112' cy='79' r='4' fill='#FFDF97'/><circle cx='224' cy='181' r='4' fill='#FFDF97'/>
    </>}
  </svg>;
}

export default function StageReward({stageKey,worldSize,stageNumber,locale,remoteMatchId,client,onAdvance,onLocalPrize,onRemotePrize,onSound}:RewardProps){
  const [card,setCard]=useState<StageCard|null>(null);
  const [playing,setPlaying]=useState(false);
  const [played,setPlayed]=useState(false);
  const [game,setGame]=useState<'wheel'|'word'|null>(null);
  const [guess,setGuess]=useState('');
  const [prize,setPrize]=useState('');
  const [notice,setNotice]=useState('');
  const [album,setAlbum]=useState<LocalEarned[]>([]);
  const [albumExpanded,setAlbumExpanded]=useState(false);
  const [wheelTurns,setWheelTurns]=useState(0);
  useEffect(()=>{
    let alive=true;
    setCard(null);setPlayed(false);setPrize('');setGame(null);setNotice('');
    if(remoteMatchId && client){
      void (async()=>{
        const {data,error}=await client.rpc('trivia_stage_claim',{p_match:remoteMatchId});
        if(!alive)return;
        if(error){setNotice('איסוף הקלף נכשל: '+error.message);return;}
        const selected=cardById(String(data.card_id));
        if(!selected){setNotice('קלף הבונוס לא נמצא באוסף.');return;}
        setCard(selected);setPlayed(Boolean(data.played));setPrize(String(data.prize||''));
        const {data:cards}=await client.rpc('trivia_stage_album');
        if(alive && Array.isArray(cards))setAlbum(cards.map((c:Record<string,string>)=>({
          matchId:String(c.match_id),cardId:String(c.card_id),earnedAt:String(c.earned_at),played:Boolean(c.minigame),game:c.minigame as 'wheel'|'word',prize:c.minigame_prize
        })));
        onSound('win');
      })();
    }else{
      const found=localStageCard(worldSize,stageKey);
      const list=readLocalAlbum();
      const previous=list.find(a=>a.matchId===stageKey);
      const item=previous||{matchId:stageKey,cardId:found.id,played:false,earnedAt:new Date().toISOString()};
      const next=previous?list:[...list,item];
      saveLocalAlbum(next);
      if(alive){setAlbum(next);setCard(cardById(item.cardId)||found);setPlayed(item.played);setPrize(item.prize||'');onSound('win');}
    }
    return()=>{alive=false};
  },[stageKey,worldSize,remoteMatchId,client,onSound]);
  const translate=(he:string,en:string)=>intermissionText(locale,he,en);
  const word=intermissionWord(locale,worldSize);
  const displayCard=(c:StageCard)=>intermissionCard(locale,c);
  const shownCard=card?displayCard(card):null;
  const showPrize=(value:string)=>intermissionPrize(locale,value);
  const finish=useCallback(async(selected:'wheel'|'word')=>{
    if(!card||played||playing)return;
    setPlaying(true);setNotice('');setGame(selected);
    if(selected==='wheel')setWheelTurns(t=>t+5+Math.floor(Math.random()*3));
    if(remoteMatchId&&client){
      const {data,error}=await client.rpc('trivia_stage_play',{p_match:remoteMatchId,p_game:selected,p_guess:selected==='word'?guess.trim():null});
      if(error){setNotice(translate('לא ניתן לקבל את הפרס: ','Unable to award prize: ')+error.message);setPlaying(false);return;}
      const result=String(data.prize||'');
      setPrize(result);setPlayed(true);onRemotePrize();
    }else{
      const correct=selected==='word'?guess.trim().normalize('NFC')===word.answer.normalize('NFC'):true;
      const rewards=selected==='word'?(correct?['15 קרדיטים']:['2 פירות']):['10 קרדיטים','5 פירות','יהלום אחד','קמע זמן אחד'];
      const result=rewards[Math.floor(Math.random()*rewards.length)];
      setPrize(result);setPlayed(true);onLocalPrize(result);
      const next=readLocalAlbum().map(item=>item.matchId===stageKey?{...item,played:true,game:selected,prize:result}:item);
      saveLocalAlbum(next);setAlbum(next);
    }
    onSound('bonus');
    setPlaying(false);
  },[card,played,playing,remoteMatchId,client,guess,word.answer,onRemotePrize,onLocalPrize,onSound,stageKey]);
  if(!card)return <section className='lumen-stage-reveal' role='status' aria-live='polite'><h2>{translate('✨ אוסף הסודות נפתח','✨ Secret collection unlocked')}</h2><p>{notice||translate('מכינים את קלף הבונוס...','Preparing your collectible card...')}</p></section>;
  return <section className='lumen-stage-reveal' aria-labelledby='stage-reward-title'>
    <div className='lumen-stage-topline'><span>STAGE COMPLETE</span><span>{translate('✦ קלף אספנות חדש ✦','✦ New collectible card ✦')}</span></div>
    <h2 id='stage-reward-title'>{translate('פתחת את כל הריבועים. גילית אוצר!','You closed every square. A treasure is yours!')}</h2>
    <p className='lumen-stage-subtitle'>{translate('הרווחת קלף ייחודי לשלב הזה. הוא נכנס לאלבום שלך ואינו נעלם.','You earned a unique card for this stage. It stays in your collection.')}</p>
    <div className='lumen-reveal-layout'>
      <article className={'lumen-collectible-card kind-'+card.kind}>
        <div className='lumen-card-top'><span>✦ {translate(card.rarity,card.rarity==='אגדי'?'Legendary':card.rarity==='נדיר'?'Rare':'Special')}</span><span>{translate('שלב','STAGE')} {String(stageNumber).padStart(2,'0')}</span></div>
        <Illustration card={shownCard||card}/>
        <div className='lumen-card-copy'><h3>{shownCard?.title||card.title}</h3><p>{shownCard?.subtitle||card.subtitle}</p></div>
        <div className='lumen-card-bottom'>LUMEN COLLECTION · 01/01 <span>✦</span></div>
      </article>
      <div className='lumen-reward-options'>
        <span className='lumen-kicker'>{translate('האתגר שבין העולמות','Between-world challenge')}</span>
        <h3>{translate('מה בא לך לעשות עם האוצר?','What will you do with your treasure?')}</h3>
        <p>{translate('לבחירתך אתגר אחד לכל שלב. אפשר גם לדלג ולהתקדם.','Choose one optional challenge per stage, or skip ahead.')}</p>
        {!played && !game && <div className='lumen-intermission-choices'>
          <button type='button' onClick={()=>setGame('word')}><strong>{translate('🔠 נחש את המילה','🔠 Guess the word')}</strong><span>{translate('רמז ואותיות לאוצר הבא','A clue to your next treasure')}</span></button>
          <button type='button' onClick={()=>setGame('wheel')}><strong>{translate('🎡 גלגל ההפתעות','🎡 Prize wheel')}</strong><span>{translate('פרס וירטואלי, ללא תשלום','A free virtual prize')}</span></button>
        </div>}
        {game==='word'&&!played&&<div className='lumen-word-game'>
          <p><strong>{translate('רמז:','Hint:')}</strong> {word.hint}</p>
          <p className='lumen-letter-slots' aria-label={locale==='he'?'למילה '+word.answer.length+' אותיות':word.answer.length+' '+translate('אותיות','letters')}>{Array.from({length:word.answer.length},(_,i)=><span key={i}>{guess[i]||'_'}</span>)}</p>
          <label htmlFor='lumen-word-guess'>{translate('מה המילה?','What is the word?')}</label>
          <input id='lumen-word-guess' type='text' dir={locale==='he'||locale==='ar'?'rtl':'ltr'} maxLength={word.answer.length+2} value={guess} onChange={e=>setGuess(e.target.value)} autoComplete='off'/>
          <button className='lumen-cta' type='button' onClick={()=>void finish('word')} disabled={playing||guess.trim().length===0}>{translate('בדוק מילה ✨','Check word ✨')}</button>
        </div>}
        {game==='wheel'&&!played&&<div className='lumen-wheel-game'>
          <div className='lumen-wheel-frame'><div className='lumen-wheel' style={{transform:'rotate('+wheelTurns*360+'deg)'}}>
            <span>🪙</span><span>🍎</span><span>💎</span><span>⏳</span>
          </div></div>
          <button className='lumen-cta' type='button' onClick={()=>void finish('wheel')} disabled={playing}>{translate('סובב את הגלגל ✨','Spin the wheel ✨')}</button>
        </div>}
        {played && <div className='lumen-prize-won' role='status' aria-live='polite'><strong>{translate('🎉 הפרס שלך:','🎉 Your prize:')} {showPrize(prize)}</strong><span>{translate('נשמר באוסף המשחק שלך.','Saved to your game collection.')}</span></div>}
        {notice&&<p role='alert'>{notice}</p>}
        {stageNumber<100 ? <button type='button' className='lumen-next-button' onClick={onAdvance}>{translate('המשך לשלב הבא ←','Continue to next stage →')}</button>
         : <p className='lumen-campaign-complete'>{translate('🏆 השלמת את כל 100 השלבים — אלוף הטריוויה!','🏆 You completed all 100 stages — Trivia Champion!')}</p>}
        <button type='button' className='lumen-album-trigger' onClick={()=>setAlbumExpanded(v=>!v)} aria-expanded={albumExpanded}>{translate('📚 האלבום שלי ·','📚 My album ·')} {album.length} {translate('קלפים','cards')}</button>
        {albumExpanded&&<div className='lumen-album-grid'>{[...album].reverse().slice(0,12).map(item=>{
          const found=cardById(item.cardId);
          return found?<div key={item.matchId} title={found.subtitle}><span>{found.glyph}</span><strong>{displayCard(found).title}</strong><small>{item.played?translate('★ אתגר הושלם','★ Challenge completed'):translate('קלף נאסף','Card collected')}</small></div>:null;
        })}</div>}
      </div>
    </div>
  </section>;
}
