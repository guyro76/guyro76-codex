'use client';
import {useEffect,useMemo,useState} from 'react';
import {createClient} from '@supabase/supabase-js';

export default function ResetPasswordPage(){
  const client=useMemo(()=>{
    const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    return url&&key?createClient(url,key):null;
  },[]);
  const[password,setPassword]=useState('');
  const[repeat,setRepeat]=useState('');
  const[ready,setReady]=useState(false);
  const[busy,setBusy]=useState(false);
  const[message,setMessage]=useState('בודק את קישור איפוס הסיסמה...');
  useEffect(()=>{
    if(!client){setMessage('שירות ההתחברות עדיין אינו מחובר לאתר.');return;}
    void client.auth.getSession().then(({data,error})=>{
      if(error){setMessage('קישור לא תקין. יש לבקש קישור איפוס חדש.');return;}
      if(data.session){setReady(true);setMessage('בחר סיסמה חדשה לחשבון שלך.');}
      else setMessage('נדרש קישור איפוס תקין שנשלח למייל. יש לבקש קישור חדש דרך דף המשחק.');
    });
    const {data}=client.auth.onAuthStateChange((event,session)=>{
      if(event==='PASSWORD_RECOVERY'&&session){setReady(true);setMessage('קישור האיפוס אומת. הזן סיסמה חדשה.');}
    });
    return()=>data.subscription.unsubscribe();
  },[client]);
  async function update(){
    if(!client||!ready||busy)return;
    if(password.length<12){setMessage('בחר סיסמה באורך 12 תווים לפחות.');return;}
    if(password!==repeat){setMessage('הסיסמאות אינן תואמות.');return;}
    setBusy(true);
    const{error}=await client.auth.updateUser({password});
    if(error)setMessage('שינוי הסיסמה נכשל: '+error.message);
    else{setPassword('');setRepeat('');setReady(false);setMessage('הסיסמה עודכנה בהצלחה. אפשר לחזור למשחק.');}
    setBusy(false);
  }
  return <main style={{minHeight:'100vh',display:'grid',placeItems:'center',background:'radial-gradient(circle at top,#345395,#132145)',fontFamily:'Arial,sans-serif',color:'#FFF',padding:16,fontWeight:800}}>
    <section style={{background:'#203568',border:'1px solid #AFC5FF99',boxShadow:'0 12px 45px #0006',borderRadius:22,maxWidth:490,width:'100%',padding:26}}>
      <h1 style={{fontSize:30}}>איפוס סיסמה</h1>
      <p style={{lineHeight:1.7}} role='status' aria-live='polite'>{message}</p>
      {ready&&<form onSubmit={e=>{e.preventDefault();void update()}}>
        <label htmlFor='new-password' style={{display:'block',marginTop:13}}>סיסמה חדשה</label>
        <input id='new-password' type='password' autoComplete='new-password' minLength={12} required value={password} onChange={e=>setPassword(e.target.value)} style={{width:'100%',padding:12,borderRadius:9,color:'#17254B',fontWeight:800,marginTop:7}}/>
        <label htmlFor='repeat-password' style={{display:'block',marginTop:13}}>אימות סיסמה חדשה</label>
        <input id='repeat-password' type='password' autoComplete='new-password' required value={repeat} onChange={e=>setRepeat(e.target.value)} style={{width:'100%',padding:12,borderRadius:9,color:'#17254B',fontWeight:800,marginTop:7}}/>
        <button disabled={busy} type='submit' style={{background:'#FFE48F',color:'#14244B',border:0,borderRadius:10,fontWeight:900,padding:'13px 20px',marginTop:19}}>{busy?'מעדכן...':'עדכן סיסמה'}</button>
      </form>}
      <div style={{marginTop:24}}><a href='/' style={{color:'#FFEDAB'}}>חזרה למשחק</a></div>
    </section>
  </main>;
}
