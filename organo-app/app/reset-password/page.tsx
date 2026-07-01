"use client";
import { FormEvent,useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import "../login/login.css";

export default function ResetPasswordPage(){
 const[p1,setP1]=useState("");const[p2,setP2]=useState("");const[message,setMessage]=useState("");const[busy,setBusy]=useState(false);
 async function submit(e:FormEvent){e.preventDefault();if(p1.length<10){setMessage("הסיסמה חייבת להכיל לפחות 10 תווים");return}if(p1!==p2){setMessage("הסיסמאות אינן תואמות");return}setBusy(true);setMessage("");try{const {error}=await createClient().auth.updateUser({password:p1});if(error)throw error;setMessage("הסיסמה עודכנה בהצלחה. ניתן להיכנס למערכת.");setP1("");setP2("");}catch(err){setMessage(err instanceof Error?err.message:"עדכון הסיסמה נכשל");}finally{setBusy(false)}}
 return <main className="login-page"><section className="login-card"><p className="login-eyebrow">הגדרת סיסמה</p><h1>סיסמה חדשה</h1><p className="login-intro">בחר סיסמה ייחודית שאינה בשימוש בשירות אחר.</p>{message&&<div className="login-alert" role="status">{message}</div>}<form onSubmit={submit}><label>סיסמה חדשה<div className="login-field"><input type="password" required minLength={10} value={p1} onChange={e=>setP1(e.target.value)} autoComplete="new-password" /></div></label><label>אימות סיסמה<div className="login-field"><input type="password" required minLength={10} value={p2} onChange={e=>setP2(e.target.value)} autoComplete="new-password" /></div></label><button className="login-submit" disabled={busy}>{busy?"מעדכן...":"עדכון סיסמה"}</button></form><Link className="forgot-link" href="/login">חזרה לכניסה</Link></section></main>}
