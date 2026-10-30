'use client';

import {useCallback,useEffect,useRef,useState,type CSSProperties} from 'react';
import type {SupabaseClient} from '@supabase/supabase-js';
import type {ActiveLocale} from '../lib/i18n';
import {cardById,localStageCard,readLocalAlbum,saveLocalAlbum,type StageCard,type LocalEarned} from '../lib/stageRewards';
import {intermissionText,intermissionWord,intermissionPrize,intermissionCard,intermissionMiniText} from '../lib/intermissionLocales';
import {intermissionBonusQuestion} from '../lib/intermissionBonus';

type RewardProps={
  stageKey:string;
  worldSize:number;
  stageNumber:number;
  locale:ActiveLocale;
  remoteMatchId?:string;
  client:SupabaseClient|null;
  onAdvance:()=>void;
  onLocalPrize:(prize:string)=>void;
  onStageClear:()=>void;
  onRemotePrize:()=>void;
  onSound:(cue:'bonus'|'win'|'pop'|'slice')=>void;
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

export default function StageReward({stageKey,worldSize,stageNumber,locale,remoteMatchId,client,onAdvance,onLocalPrize,onStageClear,onRemotePrize,onSound}:RewardProps){
  const [card,setCard]=useState<StageCard|null>(null);
  const [playing,setPlaying]=useState(false);
  const [played,setPlayed]=useState(false);
  const [game,setGame]=useState<'wheel'|'word'|'balloons'|'cake'|'quiz'|null>(null);
  const [celebrating,setCelebrating]=useState(true);
  const [bonusPicked,setBonusPicked]=useState<number|null>(null);
  const claimRef=useRef(false);
  const [burstBalloon,setBurstBalloon]=useState<number|null>(null);
  const [cakeCut,setCakeCut]=useState(false);
  const cakeStartX=useRef<number|null>(null);
  const cakeTriggered=useRef(false);
  const [guess,setGuess]=useState('');
  const [prize,setPrize]=useState('');
  const [notice,setNotice]=useState('');
  const [album,setAlbum]=useState<LocalEarned[]>([]);
  const [albumExpanded,setAlbumExpanded]=useState(false);
  const [wheelTurns,setWheelTurns]=useState(0);
  useEffect(()=>{
    let alive=true;
    setCard(null);setPlayed(false);setPrize('');setGame(null);setNotice('');setBurstBalloon(null);setCakeCut(false);setBonusPicked(null);setCelebrating(true);claimRef.current=false;cakeTriggered.current=false;
    if(remoteMatchId && client){
      void (async()=>{
        const {data,error}=await client.rpc('trivia_stage_claim',{p_match:remoteMatchId});
        if(!alive)return;
        if(error){setNotice('איסוף הקלף נכשל: '+error.message);return;}
        const selected=cardById(String(data.card_id));
        if(!selected){setNotice('קלף הבונוס לא נמצא באוסף.');return;}
        setCard(selected);setPlayed(Boolean(data.played));setPrize(String(data.prize||''));
        onRemotePrize();
        const {data:cards}=await client.rpc('trivia_stage_album');
        if(alive && Array.isArray(cards))setAlbum(cards.map((c:Record<string,string>)=>({
          matchId:String(c.match_id),cardId:String(c.card_id),earnedAt:String(c.earned_at),played:Boolean(c.minigame),game:c.minigame as 'wheel'|'word'|'balloons'|'cake'|'quiz',prize:c.minigame_prize
        })));
        onSound('win');
      })();
    }else{
      const found=localStageCard(worldSize,stageKey);
      const list=readLocalAlbum();
      const previous=list.find(a=>a.matchId===stageKey);
      const item:LocalEarned=previous
        ? {...previous,clearRewarded:true}
        : {matchId:stageKey,cardId:found.id,played:false,clearRewarded:true,earnedAt:new Date().toISOString()};
      const next=previous?list.map(a=>a.matchId===stageKey?item:a):[...list,item];
      // Persist the claim BEFORE adding credits, preventing duplicate gifts on
      // remount/reload, while preserving all previously saved albums.
      if(!previous?.clearRewarded){saveLocalAlbum(next);onStageClear();}
      else if(!previous)saveLocalAlbum(next);
      if(alive){setAlbum(next);setCard(cardById(item.cardId)||found);setPlayed(item.played);setPrize(item.prize||'');onSound('win');}
    }
    return()=>{alive=false};
  },[stageKey,worldSize,remoteMatchId,client,onSound,onStageClear,onRemotePrize]);
  useEffect(()=>{
    if(!card)return;
    const t=window.setTimeout(()=>{
      setCelebrating(false);
      if(!played)setGame(current=>current||(
        !remoteMatchId && stageNumber%5===0?'quiz':
        (['word','wheel','balloons','cake'] as const)[((stageNumber-1)-Math.floor((stageNumber-1)/5))%4]
      ));
    },1800);
    return()=>window.clearTimeout(t);
  },[card,played,stageNumber,remoteMatchId,stageKey]);
  const translate=(he:string,en:string)=>intermissionText(locale,he,en);
  const word=intermissionWord(locale,worldSize);
  const displayCard=(c:StageCard)=>intermissionCard(locale,c);
  const mini=(key:Parameters<typeof intermissionMiniText>[1])=>intermissionMiniText(locale,key);
  const shownCard=card?displayCard(card):null;
  const showPrize=(value:string)=>intermissionPrize(locale,value);
  const bonus=intermissionBonusQuestion(locale,stageNumber);
  const finish=useCallback(async(selected:'wheel'|'word'|'balloons'|'cake'|'quiz',answerIndex?:number)=>{
    if(!card||played||playing||claimRef.current)return;
    claimRef.current=true;
    setPlaying(true);setNotice('');setGame(selected);
    if(selected==='wheel')setWheelTurns(t=>t+5+Math.floor(Math.random()*3));
    if(remoteMatchId&&client){
      if(selected==='quiz'){claimRef.current=false;setPlaying(false);return;}
      const {data,error}=await client.rpc('trivia_stage_play',{p_match:remoteMatchId,p_game:selected,p_guess:selected==='word'?guess.trim():null});
      if(error){setNotice(translate('לא ניתן לקבל את הפרס: ','Unable to award prize: ')+error.message);setPlaying(false);setBurstBalloon(null);setCakeCut(false);cakeTriggered.current=false;claimRef.current=false;return;}
      const result=String(data.prize||'');
      setPrize(result);setPlayed(true);onRemotePrize();
    }else{
      const correct=selected==='quiz'?answerIndex===bonus.correct:
        selected==='word'?guess.trim().normalize('NFC')===word.answer.normalize('NFC'):true;
      const rewards=selected==='quiz'?(correct?['30 קרדיטים']:['2 פירות']):
        selected==='word'?(correct?['15 קרדיטים']:['2 פירות']):['10 קרדיטים','5 פירות','יהלום אחד','קמע זמן אחד'];
      const result=rewards[Math.floor(Math.random()*rewards.length)];
      const next=readLocalAlbum().map(item=>item.matchId===stageKey?{...item,played:true,game:selected,prize:result}:item);
      saveLocalAlbum(next);setAlbum(next);setPrize(result);setPlayed(true);
      // Persist completion first; a rapid double click cannot claim rewards twice.
      onLocalPrize(result);
    }
    onSound('bonus');
    setPlaying(false);
  },[card,played,playing,remoteMatchId,client,guess,word.answer,bonus.correct,onRemotePrize,onLocalPrize,onSound,stageKey]);
  const sliceCake=()=>{
    if(played||playing||cakeTriggered.current)return;
    cakeTriggered.current=true;setCakeCut(true);onSound('slice');void finish('cake');
  };
  if(!card)return <section className='lumen-stage-reveal' role='status' aria-live='polite'><h2>{translate('✨ אוסף הסודות נפתח','✨ Secret collection unlocked')}</h2><p>{notice||translate('מכינים את קלף הבונוס...','Preparing your collectible card...')}</p></section>;
  return <section className='lumen-stage-reveal' aria-labelledby='stage-reward-title'>
    <div className='lumen-stage-topline'><span>{translate('השלב הושלם','STAGE COMPLETE')}</span><span>{translate('✦ קלף אספנות חדש ✦','✦ New collectible card ✦')}</span></div>
    <div className='stage-celebration' data-testid='stage-celebration' aria-label={translate('חגיגת סיום השלב','Stage completion celebration')}>
      <div className='stage-gift-sparks' aria-hidden='true'>{Array.from({length:18},(_,i)=><span key={i} style={{'--spark-index':i} as CSSProperties}>{i%3===0?'✦':i%3===1?'★':'✧'}</span>)}</div>
      <strong>{translate('🎇 חגיגת הניצחון!','🎇 Victory celebration!')}</strong>
      <div className='stage-gift-tray' data-testid='stage-guaranteed-gifts'>
        <span>🪙 +25</span><span>⭐ +3</span><span>💎 +1</span><span>🍎 +2</span>
      </div>
      <small>{translate('המתנות נוספו לאוסף ולארנק שלך','The gifts were added to your collection and wallet')}</small>
    </div>
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
        <p>{translate('בכל שלב מוגרל אתגר ביניים. אפשר לבחור אתגר אחר או להמשיך לשלב הבא.','One between-stage challenge is selected automatically. You may switch challenges or continue.')}</p>
        {!played && !celebrating && <div className='lumen-intermission-choices'>
          <button type='button' onClick={()=>setGame('word')}><strong>{translate('🔠 נחש את המילה','🔠 Guess the word')}</strong><span>{translate('רמז ואותיות לאוצר הבא','A clue to your next treasure')}</span></button>
          <button type='button' onClick={()=>setGame('wheel')}><strong>{translate('🎡 גלגל ההפתעות','🎡 Prize wheel')}</strong><span>{translate('פרס וירטואלי, ללא תשלום','A free virtual prize')}</span></button>
          <button type='button' onClick={()=>setGame('balloons')}><strong>🎈 {mini('balloonsTitle')}</strong><span>{mini('balloonsSubtitle')}</span></button>
          <button type='button' onClick={()=>setGame('cake')}><strong>🎂 {mini('cakeTitle')}</strong><span>{mini('cakeSubtitle')}</span></button>
          {!remoteMatchId && <button type='button' onClick={()=>setGame('quiz')}><strong>🧠 {translate('שאלת בונוס','Bonus trivia question')}</strong><span>{translate('שאלה נוספת ופרס גדול','One more question for a bigger prize')}</span></button>}
        </div>}
        {!played && !celebrating && game && <p className='stage-challenge-selected' data-testid='selected-intermission'>{translate('האתגר שלך:','Your challenge:')} {game==='quiz'?translate('🧠 שאלת בונוס','🧠 Bonus trivia'):game==='word'?translate('🔠 נחש את המילה','🔠 Guess the word'):game==='wheel'?translate('🎡 גלגל ההפתעות','🎡 Prize wheel'):game==='cake'?'🎂 '+mini('cakeTitle'):'🎈 '+mini('balloonsTitle')}</p>}
        {game==='quiz'&&!played&&!celebrating&&<div className='stage-bonus-quiz' data-testid='bonus-question'>
          <h4>{bonus.question}</h4>
          <div className='stage-bonus-options'>{bonus.answers.map((answer,i)=><button key={i} type='button'
            disabled={playing||played} aria-label={answer} onClick={()=>{setBonusPicked(i);void finish('quiz',i);}}
            className={bonusPicked===i?'selected':''}>{String.fromCharCode(65+i)} · {answer}</button>)}</div>
          <small>{translate('תשובה נכונה מעניקה 30 קרדיטים. כל תשובה מקבלת פרס.','A correct answer earns 30 credits. Every attempt gets a prize.')}</small>
        </div>}
        {game==='word'&&!played&&!celebrating&&<div className='lumen-word-game'>
          <p><strong>{translate('רמז:','Hint:')}</strong> {word.hint}</p>
          <p className='lumen-letter-slots' aria-label={locale==='he'?'למילה '+word.answer.length+' אותיות':word.answer.length+' '+translate('אותיות','letters')}>{Array.from({length:word.answer.length},(_,i)=><span key={i}>{guess[i]||'_'}</span>)}</p>
          <label htmlFor='lumen-word-guess'>{translate('מה המילה?','What is the word?')}</label>
          <input id='lumen-word-guess' type='text' dir={locale==='he'||locale==='ar'?'rtl':'ltr'} maxLength={word.answer.length+2} value={guess} onChange={e=>setGuess(e.target.value)} autoComplete='off'/>
          <button className='lumen-cta' type='button' onClick={()=>void finish('word')} disabled={playing||guess.trim().length===0}>{translate('בדוק מילה ✨','Check word ✨')}</button>
        </div>}
        {game==='wheel'&&!played&&!celebrating&&<div className='lumen-wheel-game'>
          <div className='lumen-wheel-frame'><div className='lumen-wheel' style={{transform:'rotate('+wheelTurns*360+'deg)'}}>
            <span>🪙</span><span>🍎</span><span>💎</span><span>⏳</span>
          </div></div>
          <button className='lumen-cta' type='button' onClick={()=>void finish('wheel')} disabled={playing}>{translate('סובב את הגלגל ✨','Spin the wheel ✨')}</button>
        </div>}
        {game==='balloons'&&!celebrating&&<div className='lumen-balloons-game' aria-label={mini('balloonsTitle')}>
          <p>{mini('balloonsHelp')}</p>
          <div className='lumen-balloon-rack' role='group' aria-label={mini('balloonsTitle')}>
            {Array.from({length:5},(_,i)=><button type='button' key={i}
              className={'lumen-balloon-target'+(burstBalloon===i?' burst':'')}
              aria-label={mini('popBalloon')+' '+(i+1)}
              disabled={played||playing||burstBalloon!==null}
              onClick={()=>{setBurstBalloon(i);onSound('pop');void finish('balloons');}}>
              <span className='lumen-balloon-shape' aria-hidden='true'>{burstBalloon===i?'✦':'🎈'}</span>
              <strong>{i+1}</strong>
            </button>)}
          </div>
        </div>}
        {game==='cake'&&!celebrating&&<div className='lumen-cake-game'>
          <p>{mini('cakeHelp')}</p>
          <button type='button' className={'lumen-cake-target'+(cakeCut?' cut':'')}
            aria-label={mini('sliceCake')} disabled={played||playing||cakeCut}
            onPointerDown={e=>{cakeStartX.current=e.clientX;}}
            onPointerUp={e=>{if(cakeStartX.current!==null && Math.abs(e.clientX-cakeStartX.current)>=25)sliceCake();cakeStartX.current=null;}}
            onClick={()=>sliceCake()}>
            <span className='lumen-cake-plate' aria-hidden='true'>🎂</span>
            <span className='lumen-cake-slice' aria-hidden='true'>✦</span>
            <strong>{mini('sliceCake')}</strong>
          </button>
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
