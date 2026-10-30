'use client';
import {useEffect,useState} from 'react';
import TriviaGame from './game';
import WelcomeScreen from '../components/WelcomeScreen';

type Entry='loading'|'welcome'|'game';
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
 const [entry,setEntry]=useState<Entry>('loading');
 useEffect(()=>{setEntry(hasSavedPlay()?'game':'welcome')},[]);
 if(entry==='loading')return <main role="status" aria-label="Loading Trivia Squares" style={{minHeight:'100dvh',background:'#111C48'}}/>;
 if(entry==='welcome')return <WelcomeScreen onStart={()=>{
  try{localStorage.setItem('trivia-welcome-dismissed-v1','1')}catch{}
  setEntry('game');
 }}/>;
 return <TriviaGame/>;
}
