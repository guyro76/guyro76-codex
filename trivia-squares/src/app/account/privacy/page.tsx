'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient, type User } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from '../../../lib/supabasePublicConfig';
export default function PrivacyControls() {
  const client=useMemo(()=>{
    return createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);
  },[]);
  const [user,setUser]=useState<User|null>(null);
  const [pending,setPending]=useState(false);
  const [message,setMessage]=useState('הורדת מידע אישי או בקשת מחיקת נתוני המשחק.');
  useEffect(()=>{
    if(!client) return;
    void client.auth.getUser().then(({data})=>setUser(data.user));
    const {data}=client.auth.onAuthStateChange((_ev,session)=>setUser(session?.user||null));
    return ()=>data.subscription.unsubscribe();
  },[client]);
  async function exportData(){
    if(!user||!client) return;
    setPending(true);
    const {data,error}=await client.rpc('trivia_export_my_data');
    if(error) setMessage('הייצוא נכשל: '+error.message);
    else if(data){
      const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json;charset=utf-8'});
      const url=URL.createObjectURL(blob);
      const a=document.createElement('a');a.href=url;a.download='trivia-squares-my-data.json';a.click();
      URL.revokeObjectURL(url);
      setMessage('המידע האישי שלך הוכן להורדה במכשיר.');
    }
    setPending(false);
  }
  async function requestDeletion(){
    if(!user||!client) return;
    const confirmed=window.confirm('לפתוח בקשה למחיקת נתוני המשחק שלך? זו בקשה לטיפול, לא מחיקה מיידית. פרטי חשבון Supabase המשותף לשירותים אחרים לא יימחקו אוטומטית.');
    if(!confirmed)return;
    setPending(true);
    const{data,error}=await client.rpc('trivia_request_data_deletion');
    setMessage(error?'אירעה שגיאה: '+error.message:'בקשת המחיקה נקלטה לבדיקה. מספר פנייה: '+data);
    setPending(false);
  }
  return <main style={{maxWidth:760,padding:24,margin:'42px auto',background:'#21386E',color:'#FFF',borderRadius:20,fontWeight:800,border:'1px solid #92ADEA'}}>
    <h1>ניהול מידע אישי</h1>
    <p style={{lineHeight:1.8}}>ניתן להוריד עותק מפרטי המשחק שלך או להעביר בקשה לטיפול במחיקתם. נתוני חשבון ההתחברות מנוהלים ב-Supabase, שמשרת גם מערכות אחרות. פעולות מחיקה יבוצעו לאחר בדיקה כדי לא לפגוע בחשבונות ושחקנים אחרים.</p>
    {!client?<p>החיבור ל-Supabase טרם הוגדר באתר.</p>:!user?<p>יש להתחבר לחשבון דרך דף המשחק כדי להשתמש בכלים האלה.</p>:<section style={{display:'flex',gap:10,flexWrap:'wrap'}}>
      <button disabled={pending} onClick={()=>void exportData()} style={{padding:13,borderRadius:10,background:'#FFE085',fontWeight:900,border:0,color:'#17234D'}}>הורד את הנתונים שלי</button>
      <button disabled={pending} onClick={()=>void requestDeletion()} style={{padding:13,borderRadius:10,background:'#F4F7FF',fontWeight:900,border:0,color:'#182857'}}>בקשת מחיקת נתוני משחק</button>
    </section>}
    <p role='status' aria-live='polite'>{message}</p>
    <a href='/' style={{color:'#DCE9FF'}}>חזרה למשחק</a>
  </main>;
}
