'use client';
import {useEffect,useState} from 'react';
import type {ActiveLocale} from '../lib/i18n';
import {questionTopics,type QuestionTopic} from '../lib/questionTopics';
import {readPlayerStats,strongWeak,type PlayerStats} from '../lib/playerStats';

const W:Record<ActiveLocale,Record<string,string>>={
 he:{title:'הסטטיסטיקה שלי',answered:'שאלות',acc:'הצלחה',streak:'רצף שיא',squares:'ריבועים',strong:'הנושא החזק שלך',weak:'כדאי לחזק',empty:'עוד אין נתונים. ענה על כמה שאלות והנתונים יופיעו כאן.',note:'נשמר במכשיר הזה בלבד.'},
 en:{title:'My statistics',answered:'Questions',acc:'Success',streak:'Best streak',squares:'Squares',strong:'Your strongest topic',weak:'Worth practising',empty:'No data yet. Answer a few questions and it will show here.',note:'Saved on this device only.'},
 ru:{title:'Моя статистика',answered:'Вопросы',acc:'Успех',streak:'Лучшая серия',squares:'Клетки',strong:'Ваша сильная тема',weak:'Стоит подтянуть',empty:'Пока нет данных. Ответьте на несколько вопросов.',note:'Хранится только на этом устройстве.'},
 fr:{title:'Mes statistiques',answered:'Questions',acc:'Réussite',streak:'Meilleure série',squares:'Cases',strong:'Votre thème fort',weak:'À travailler',empty:'Pas encore de données. Répondez à quelques questions.',note:'Enregistré sur cet appareil uniquement.'},
 ar:{title:'إحصائياتي',answered:'الأسئلة',acc:'النجاح',streak:'أفضل سلسلة',squares:'المربعات',strong:'موضوعك الأقوى',weak:'يستحق التدريب',empty:'لا توجد بيانات بعد. أجب عن بعض الأسئلة.',note:'محفوظة على هذا الجهاز فقط.'},
 es:{title:'Mis estadísticas',answered:'Preguntas',acc:'Acierto',streak:'Mejor racha',squares:'Casillas',strong:'Tu tema fuerte',weak:'Para practicar',empty:'Aún no hay datos. Responde algunas preguntas.',note:'Guardado solo en este dispositivo.'}
};
export default function PlayerStatsPanel({locale,refreshKey}:{locale:ActiveLocale;refreshKey:number}){
 const [stats,setStats]=useState<PlayerStats|null>(null);
 useEffect(()=>{setStats(readPlayerStats())},[refreshKey]);
 const w=W[locale];
 if(!stats)return null;
 const label=(t?:QuestionTopic)=>t?(questionTopics.find(x=>x.id===t)?.[locale]||t):'';
 const {strong,weak}=strongWeak(stats);
 const rows=(Object.entries(stats.topics) as [QuestionTopic,{right:number;total:number}][]).filter(([,v])=>v.total>0).sort((a,b)=>b[1].total-a[1].total).slice(0,8);
 return <section className='player-stats' data-testid='player-stats' aria-labelledby='player-stats-title'>
  <h3 id='player-stats-title'>{w.title}</h3>
  {stats.answered===0?<p className='smalltxt'>{w.empty}</p>:<>
   <div className='player-stats-tiles'>
    <div><strong>{stats.answered}</strong><span>{w.answered}</span></div>
    <div><strong>{Math.round(stats.correct/stats.answered*100)}%</strong><span>{w.acc}</span></div>
    <div><strong>{stats.bestStreak}</strong><span>{w.streak}</span></div>
    <div><strong>{stats.squares}</strong><span>{w.squares}</span></div>
   </div>
   {strong&&<p className='player-stats-line'><b>{w.strong}:</b> {label(strong)}</p>}
   {weak&&weak!==strong&&<p className='player-stats-line'><b>{w.weak}:</b> {label(weak)}</p>}
   <ul className='player-stats-topics'>{rows.map(([k,v])=><li key={k}><span>{label(k)}</span>
    <i aria-hidden='true'><b style={{width:Math.round(v.right/v.total*100)+'%'}}/></i><em>{v.right}/{v.total}</em></li>)}</ul>
  </>}
  <small className='smalltxt'>{w.note}</small>
 </section>;
}
