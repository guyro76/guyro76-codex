'use client';
import {useState} from 'react';

const card={maxWidth:810,margin:'40px auto',padding:'clamp(18px,4vw,34px)',background:'#1C3266',border:'1px solid #A8C5FF80',borderRadius:22,color:'#FFFFFF',fontFamily:'Arial,sans-serif',fontWeight:750,lineHeight:1.75} as const;
export default function CookiesPage(){
  const [status,setStatus]=useState('');
  function clearLocal(){
    try{
      for(const k of [
        'trivia-local-game-v1','trivia-personal-choice','trivia-tutorial-seen-v1',
        'trivia-player-name','trivia-used-question-ids','trivia-local-question',
        'trivia-local-rewards','trivia-sound-muted','trivia-sound-volume',
        'trivia-question-text-history-v1','trivia-local-pool-release-v1','trivia-stage-run-id'
      ]) window.localStorage.removeItem(k);
      for(let i=window.localStorage.length-1;i>=0;i--){
        const key=window.localStorage.key(i);
        if(key?.startsWith('trivia-match-'))window.localStorage.removeItem(key);
      }
      setStatus('שמירות המשחק המקומיות והעדפות העיצוב נמחקו מהמכשיר הזה. נתוני החשבון והמשחקים המקוונים לא השתנו.');
    }catch{setStatus('הדפדפן לא אפשר למחוק את הנתונים. אפשר לעשות זאת דרך הגדרות האחסון של הדפדפן.');}
  }
  return <main style={{minHeight:'100vh',padding:15,background:'linear-gradient(160deg,#152B55,#101A38)'}}>
    <article style={card}>
      <a href='/' style={{color:'#FFDF85'}}>חזרה למשחק</a>
      <h1>מדיניות עוגיות ואחסון מקומי</h1>
      <p>עודכן: 29.10.2026. המסמך מיועד לגרסת הפיתוח של טריוויה ריבועים.</p>
      <h2>מה נשמר במכשיר?</h2>
      <p>המשחק שומר בדפדפן התקדמות של משחק מקומי, שאלות שכבר הוצגו כדי למנוע חזרה עליהן, שם שחקן, בחירת צבע וסמל (אם ביקשת לזכור אותם), העדפות צליל וסימון שההדרכה הוצגה. אחסון זה אינו נשלח אוטומטית אל מסד הנתונים של המשחק. אפשר להשתמש בלוח ללא הרשמה.</p>
      <h2>מה קורה כשמתחברים לחשבון?</h2>
      <p>ספריית ההזדהות של Supabase עשויה לשמור בדפדפן אסימוני התחברות ומידע טכני הנחוצים לשמירת ההתחברות. הפלטפורמות Supabase ו-Vercel עשויות לנהל רישומי גישה ואבטחה תפעוליים.</p>
      <h2>פרסום ומעקב שיווקי</h2>
      <p>בקוד המשחק הנוכחי לא הוטמעו Google Analytics, Meta Pixel, עוגיות פרסום או מערכת דיוור שיווקי. אם יתווספו רכיבי מעקב שאינם חיוניים, נבחן מראש את דרישות היידוע וההסכמה, ולא נפעיל אותם לפני השלמת המנגנון הנדרש.</p>
      <h2>שליטה באחסון</h2>
      <p>ניתן להסיר מהמכשיר את שמירת המשחק המקומי ואת העדפותיו בלי למחוק חשבון או משחקים המחוברים לשרת.</p>
      <button onClick={clearLocal} style={{background:'#FFE38F',color:'#182A57',fontWeight:900,border:0,borderRadius:11,padding:'12px 18px',cursor:'pointer'}}>מחק נתוני משחק מקומיים</button>
      <p role='status' aria-live='polite'>{status}</p>
      <p>ליצוא נתוני חשבון או פתיחת בקשת מחיקה: <a href='/account/privacy' style={{color:'#FFDF85'}}>ניהול מידע אישי</a>.</p>
    </article>
  </main>;
}