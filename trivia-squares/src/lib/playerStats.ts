import type {QuestionTopic} from './questionTopics';

/** Personal statistics kept on this device: answers per topic, best streak, captured squares.
 *  Nothing is sent anywhere. */
export type TopicTally={right:number;total:number};
export type PlayerStats={topics:Partial<Record<QuestionTopic,TopicTally>>;bestStreak:number;answered:number;correct:number;squares:number};
const KEY='trivia-player-stats-v1';
const empty=():PlayerStats=>({topics:{},bestStreak:0,answered:0,correct:0,squares:0});

export function readPlayerStats():PlayerStats{
  try{
    const raw=JSON.parse(localStorage.getItem(KEY)||'null');
    if(raw&&typeof raw==='object'&&raw.topics&&typeof raw.topics==='object')return {...empty(),...raw};
  }catch{}
  return empty();
}

export function recordAnswer(topic:QuestionTopic,correct:boolean,streak:number,squares:number):PlayerStats{
  const s=readPlayerStats();
  const t=s.topics[topic]||{right:0,total:0};
  s.topics[topic]={right:t.right+(correct?1:0),total:t.total+1};
  s.answered+=1;if(correct)s.correct+=1;
  s.bestStreak=Math.max(s.bestStreak,streak);
  s.squares+=Math.max(0,squares);
  try{localStorage.setItem(KEY,JSON.stringify(s));}catch{}
  return s;
}

/** Strongest and weakest topic need at least 3 answers to count, so one lucky answer is not a "strength". */
export function strongWeak(stats:PlayerStats):{strong?:QuestionTopic;weak?:QuestionTopic}{
  const rows=(Object.entries(stats.topics) as [QuestionTopic,TopicTally][]).filter(([,t])=>t.total>=3)
    .map(([k,t])=>({k,rate:t.right/t.total,total:t.total}))
    .sort((a,b)=>b.rate-a.rate||b.total-a.total);
  if(!rows.length)return {};
  return {strong:rows[0].k,weak:rows.length>1?rows[rows.length-1].k:undefined};
}
