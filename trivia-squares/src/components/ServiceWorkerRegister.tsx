'use client';
import {useEffect} from 'react';

/** Registers /sw.js in production so the installed app (and the Android TWA) opens offline. */
export default function ServiceWorkerRegister(){
  useEffect(()=>{
    if(process.env.NODE_ENV!=='production'||!('serviceWorker' in navigator))return;
    const register=()=>navigator.serviceWorker.register('/sw.js',{scope:'/'}).catch(()=>{});
    if(document.readyState==='complete')register();else window.addEventListener('load',register,{once:true});
  },[]);
  return null;
}
