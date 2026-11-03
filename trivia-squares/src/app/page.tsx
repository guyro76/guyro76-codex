'use client';
import {useEffect,useState} from 'react';
import dynamic from 'next/dynamic';
import WelcomeScreen from '../components/WelcomeScreen';

/* The game (board, question banks in six languages, mini-games) is the heavy part of the app.
 * It loads as its own chunk, so first-time visitors see the welcome screen from the server HTML
 * without waiting for it. Returning players skip the welcome screen: an inline script in the
 * layout marks <html> before the first paint, CSS hides the welcome markup, and the game chunk
 * starts downloading at once. */
const loadGame=()=>import('./game');
// Returning players (marked by the inline script in layout.tsx) need the game at once:
// start the download while React is still hydrating instead of after it.
if(typeof document!=='undefined'&&document.documentElement.classList.contains('ts-returning'))void loadGame();
const TriviaGame=dynamic(loadGame,{ssr:false,loading:()=><GameLoading/>});

function GameLoading(){
 return <main role="status" aria-label="Loading Trivia Squares" className="ts-game-loading" style={{minHeight:'100dvh',background:'#111C48'}}/>;
}

type Entry='first-paint'|'welcome'|'game';
function hasSavedPlay(){
 try{
  if(localStorage.getItem('trivia-welcome-dismissed-v1')==='1')return true;
  if(localStorage.getItem('trivia-stage-started-v1')==='true')return true;
  const raw=localStorage.getItem('trivia-local-game-v1');
  if(raw){
   const value=JSON.parse(raw);
   if(value&&typeof value==='object'&&(
     Object.keys(value.edges||{}).length>0||Object.keys(value.owners||{}).length>0
   ))return true;
  }
  if(Number(localStorage.getItem('trivia-stage-id-v1')||'1')>1)return true;
 }catch{}
 return false;
}
export default function HomePage(){
 const [entry,setEntry]=useState<Entry>('first-paint');
 useEffect(()=>{
  const returning=hasSavedPlay();
  setEntry(returning?'game':'welcome');
  if(returning)return;
  // Warm the game chunk while the visitor reads the welcome screen, so "Start" is instant.
  const warm=()=>{void loadGame()};
  const w=window as Window&{requestIdleCallback?:(cb:()=>void,o?:{timeout:number})=>number};
  if(w.requestIdleCallback)w.requestIdleCallback(warm,{timeout:2500});else window.setTimeout(warm,1200);
 },[]);
 if(entry==='game')return <TriviaGame/>;
 const welcome=<WelcomeScreen onStart={()=>{
  try{localStorage.setItem('trivia-welcome-dismissed-v1','1')}catch{}
  setEntry('game');
 }}/>;
 // Same markup on the server and on the first client render (no hydration mismatch);
 // returning players never see it because of the html.ts-returning rule.
 if(entry==='first-paint')return <><div className="ts-entry-welcome" style={{display:'contents'}}>{welcome}</div><div className="ts-entry-wait"><GameLoading/></div></>;
 return welcome;
}
