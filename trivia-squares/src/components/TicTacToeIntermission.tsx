'use client';
import {useState} from 'react';
import type {ActiveLocale} from '../lib/i18n';

type Cell='X'|'O'|null;
const LINES=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]] as const;
function winner(board:Cell[]):Cell {
 for(const [a,b,c] of LINES)if(board[a]&&board[a]===board[b]&&board[b]===board[c])return board[a];
 return null;
}
function chooseComputerMove(board:Cell[]):number {
 const available=board.map((v,i)=>v===null?i:-1).filter(i=>i>=0);
 for(const player of ['O','X'] as const)for(const i of available){
  const copy=[...board];copy[i]=player;
  if(winner(copy)===player)return i;
 }
 if(board[4]===null)return 4;
 const corners=[0,2,6,8].filter(i=>board[i]===null);
 if(corners.length)return corners[Math.floor(Math.random()*corners.length)];
 return available[Math.floor(Math.random()*available.length)]??-1;
}
const labels:Record<ActiveLocale,{title:string,turn:string,win:string,lose:string,draw:string,retry:string,skip:string}>={
 he:{title:'איקס עיגול נגד המחשב',turn:'התור שלך: X',win:'ניצחת! כל הכבוד',lose:'המחשב ניצח',draw:'תיקו!',retry:'משחק חדש',skip:'דלג ללא קנס'},
 en:{title:'Tic-tac-toe vs computer',turn:'Your turn: X',win:'You won!',lose:'Computer won',draw:'Draw!',retry:'Play again',skip:'Skip without penalty'},
 ru:{title:'Крестики-нолики с компьютером',turn:'Ваш ход: X',win:'Победа!',lose:'Компьютер победил',draw:'Ничья!',retry:'Играть снова',skip:'Пропустить без штрафа'},
 fr:{title:'Morpion contre ordinateur',turn:'À vous : X',win:'Gagné !',lose:'Ordinateur gagnant',draw:'Égalité !',retry:'Rejouer',skip:'Passer sans pénalité'},
 es:{title:'Tres en raya contra la computadora',turn:'Tu turno: X',win:'¡Ganaste!',lose:'Ganó la computadora',draw:'¡Empate!',retry:'Jugar otra vez',skip:'Omitir sin penalización'},
 ar:{title:'إكس أو ضد الكمبيوتر',turn:'دورك: X',win:'فزت!',lose:'فاز الكمبيوتر',draw:'تعادل!',retry:'العب مجدداً',skip:'تخطي دون عقوبة'}
};
export default function TicTacToeIntermission({locale,onWin,onSkip}:{locale:ActiveLocale,onWin:()=>void,onSkip:()=>void}){
 const [board,setBoard]=useState<Cell[]>(Array(9).fill(null));
 const [done,setDone]=useState(false);
 const copy=labels[locale]||labels.en;
 const result=winner(board);
 const tie=!result&&board.every(Boolean);
 const ended=Boolean(result||tie);
 const move=(index:number)=>{
  if(done||ended||board[index])return;
  const next=[...board];next[index]='X';
  if(winner(next)!=='X'&&next.some(v=>v===null)){
   const ai=chooseComputerMove(next);if(ai>=0)next[ai]='O';
  }
  setBoard(next);
 };
 const finalWinner=winner(board);
 return <section className='intermission-tictactoe' aria-label={copy.title} dir={locale==='he'||locale==='ar'?'rtl':'ltr'}>
  <h4>{copy.title}</h4>
  <p role='status' aria-live='polite'>{finalWinner==='X'?copy.win:finalWinner==='O'?copy.lose:tie?copy.draw:copy.turn}</p>
  <div role='group' aria-label={copy.title} style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:8,maxWidth:310,margin:'12px auto'}}>
   {board.map((value,i)=><button key={i} type='button' disabled={done||ended||Boolean(value)}
    aria-label={String(i+1)+': '+(value||'empty')} onClick={()=>move(i)}
    style={{aspectRatio:'1',fontSize:38,fontWeight:900,borderRadius:15,border:'2px solid #6a4aff',background:'#f5efff',color:'#28174e',minHeight:64}}>
    {value||'·'}</button>)}
  </div>
  {finalWinner==='X'&&!done?<button type='button' onClick={()=>{setDone(true);onWin();}}>{copy.win} ★</button>:null}
  {ended&&finalWinner!=='X'?<button type='button' onClick={()=>{setBoard(Array(9).fill(null));setDone(false)}}>{copy.retry}</button>:null}
  <button type='button' onClick={onSkip}>{copy.skip}</button>
 </section>;
}
