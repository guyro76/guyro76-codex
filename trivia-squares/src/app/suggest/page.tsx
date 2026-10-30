'use client';
import {useEffect,useMemo,useState} from 'react';
import {createClient,type User} from '@supabase/supabase-js';
import {SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY} from '../../lib/supabasePublicConfig';
import CommunityQuestionForm from '../../components/CommunityQuestionForm';
import type {ActiveLocale} from '../../lib/i18n';
import '../community.css';

const available=['he','en','ru','fr','ar'] as const;
export default function SuggestTriviaPage(){
 const client=useMemo(()=>createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY),[]);
 const [user,setUser]=useState<User|null>(null);
 const [locale,setLocale]=useState<ActiveLocale>('he');
 const [legal,setLegal]=useState(false);
 const [loaded,setLoaded]=useState(false);
 useEffect(()=>{
  try{
   const stored=localStorage.getItem('trivia-language');
   if(available.includes(stored as ActiveLocale))setLocale(stored as ActiveLocale);
  }catch{}
  let active=true;
  const verify=async()=>{
   try{
    const {data:{user}}=await client.auth.getUser();
    if(!active)return;
    setUser(user);
    if(user){
     const {data,error}=await client.rpc('trivia_get_my_legal_acceptance');
     if(active)setLegal(!error&&data===true);
    }else setLegal(false);
   }finally{if(active)setLoaded(true);}
  };
  void verify();
  const {data:{subscription}}=client.auth.onAuthStateChange(()=>{void verify()});
  return()=>{active=false;subscription.unsubscribe()};
 },[client]);
 const switchLocale=(next:ActiveLocale)=>{setLocale(next);try{localStorage.setItem('trivia-language',next)}catch{}};
 const rtl=locale==='he'||locale==='ar';
 return <main className="community-page" dir={rtl?'rtl':'ltr'} lang={locale}>
  <header className="community-page-header">
   <div className="community-page-brand"><span className="community-mini-mark" aria-hidden="true">✦</span><strong>{locale==='he'?'טריוויה ריבועים':locale==='ar'?'مربعات المعلومات':'TRIVIA SQUARES'}</strong></div>
   <a href="/" className="community-back">{locale==='he'?'← חזרה למשחק':locale==='ru'?'← Назад к игре':locale==='fr'?'← Retour au jeu':locale==='ar'?'← العودة للعبة':'← Back to game'}</a>
  </header>
  <nav className="community-page-languages" aria-label="Language">
   {available.map(l=><button key={l} type="button" lang={l} aria-pressed={locale===l}
      onClick={()=>switchLocale(l)}>{l==='he'?'עברית':l==='en'?'English':l==='ru'?'Русский':l==='fr'?'Français':'العربية'}</button>)}
  </nav>
  <div className="community-page-inner">
   {loaded?<CommunityQuestionForm client={client} locale={locale} userId={user?.id||null}
    legalAccepted={legal} onRequestAccount={()=>{window.location.href='/'}}/>:
    <p role="status">{locale==='he'?'בודק את החשבון…':'Checking account…'}</p>}
   <p className="community-account-help">{locale==='he'?'להתחברות ולאישור התנאים: פתחו את המשחק, לחצו על ☰ ועברו ללשונית חשבון.':'To sign in and accept the terms, open the game, press ☰ and select Account.'}</p>
  </div>
  <footer className="community-page-footer"><a href="/privacy">{locale==='he'?'פרטיות':'Privacy'}</a><a href="/terms">{locale==='he'?'תנאי שימוש':'Terms'}</a><a href="/accessibility">{locale==='he'?'נגישות':'Accessibility'}</a></footer>
 </main>;
}
