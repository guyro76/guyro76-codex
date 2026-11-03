import type {GestureGame} from './gestureIntermissions';

/** Between-stage mini-game chosen at random (owner request 2026-11-03): the player does not pick.
 *  The choice is stored per stage so a reload shows the same game, and the same game never
 *  comes twice in a row. Online matches only get games the server can award. */
export type IntermissionKind='wheel'|'word'|'balloons'|'cake'|'quiz'|'tictactoe'|'sequence'|'pairs'|GestureGame;
export const LOCAL_INTERMISSIONS:readonly IntermissionKind[]=['word','wheel','balloons','cake','scratch','sword','scissors','pairs','sequence','tictactoe','quiz'];
export const ONLINE_INTERMISSIONS:readonly IntermissionKind[]=['word','wheel','balloons','cake','scratch','sword','scissors'];
const KEY='trivia-intermission-pick-v1';
type Store={stages?:Record<string,string>;last?:string;next?:string};

export function chooseIntermission(stageKey:string,online:boolean,random:()=>number=Math.random):IntermissionKind{
  const pool=online?ONLINE_INTERMISSIONS:LOCAL_INTERMISSIONS;
  let store:Store={};
  try{const raw=JSON.parse(localStorage.getItem(KEY)||'{}');if(raw&&typeof raw==='object')store=raw as Store;}catch{}
  const saved=store.stages?.[stageKey] as IntermissionKind|undefined;
  if(saved&&pool.includes(saved))return saved;
  // `next` lets automated QA queue a specific game; players never see it.
  let pick=store.next&&pool.includes(store.next as IntermissionKind)?store.next as IntermissionKind:undefined;
  if(!pick){
    const options=pool.filter(kind=>kind!==store.last);
    pick=options[Math.min(options.length-1,Math.floor(random()*options.length))];
  }
  const stages=Object.entries(store.stages||{}).slice(-60);
  try{localStorage.setItem(KEY,JSON.stringify({stages:Object.fromEntries([...stages,[stageKey,pick]]),last:pick}));}catch{}
  return pick;
}
