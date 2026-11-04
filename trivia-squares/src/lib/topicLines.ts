import type {QuestionTopic} from './questionTopics';

/** Topic lines (owner request 2026-11-04): only 2–3 lines per board show a topic. Drawing one deals a
 *  question from that topic; every other line stays a random question, so most of the board is still
 *  a surprise. The choice is stored per stage run, so a reload shows the same lines. */
export type TopicLines=Record<string,QuestionTopic>;
const KEY='trivia-topic-lines-v1';
export const TOPIC_LINE_COLORS=['#FFC23D','#5BD8FF','#FF7AD9'] as const;

/** Small deterministic PRNG so the same run id always gives the same board. */
function seeded(seed:string){
  let h=2166136261;
  for(let i=0;i<seed.length;i++){h^=seed.charCodeAt(i);h=Math.imul(h,16777619);}
  return()=>{h=Math.imul(h^(h>>>15),2246822507);h=Math.imul(h^(h>>>13),3266489909);h^=h>>>16;return (h>>>0)/4294967296;};
}

export function allEdgeKeys(rows:number,cols:number):string[]{
  const keys:string[]=[];
  for(let r=0;r<=rows;r++)for(let c=0;c<cols;c++)keys.push('h-'+r+'-'+c);
  for(let r=0;r<rows;r++)for(let c=0;c<=cols;c++)keys.push('v-'+r+'-'+c);
  return keys;
}

export function topicLineCount(rows:number,cols:number):number{return rows*cols<=9?2:3;}

/** Picks the topic lines for one stage run. `topics` must be topics that still have unseen questions. */
export function pickTopicLines(runId:string,rows:number,cols:number,topics:readonly QuestionTopic[],drawn:Readonly<Record<string,unknown>>):TopicLines{
  const rand=seeded(runId+':'+rows+'x'+cols);
  const free=allEdgeKeys(rows,cols).filter(k=>!drawn[k]);
  const pool=[...new Set(topics)];
  const count=Math.min(topicLineCount(rows,cols),free.length,pool.length);
  const lines:TopicLines={};
  for(let i=0;i<count;i++){
    const e=free.splice(Math.floor(rand()*free.length),1)[0];
    const t=pool.splice(Math.floor(rand()*pool.length),1)[0];
    lines[e]=t;
  }
  return lines;
}

/** Same run → same lines across reloads; a new run (next stage, new game) gets new lines. */
export function topicLinesFor(runId:string,rows:number,cols:number,topics:readonly QuestionTopic[],drawn:Readonly<Record<string,unknown>>):TopicLines{
  const id=runId+':'+rows+'x'+cols;
  try{
    const saved=JSON.parse(localStorage.getItem(KEY)||'{}') as {id?:string;lines?:TopicLines};
    if(saved&&saved.id===id&&saved.lines&&typeof saved.lines==='object')return saved.lines;
  }catch{}
  const lines=pickTopicLines(runId,rows,cols,topics,drawn);
  try{localStorage.setItem(KEY,JSON.stringify({id,lines}));}catch{}
  return lines;
}
