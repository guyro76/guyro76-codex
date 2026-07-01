"use client";
import { FormEvent,useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import "../login/login.css";

export default function ForgotPasswordPage(){
 const[email,setEmail]=useState("");const[message,setMessage]=useState("");const[busy,setBusy]=useState(false);
 async function submit(e:FormEvent){e.preventDefault();setBusy(true);setMessage("");try{const {error}=await createClient().auth.resetPasswordForEmail(email.trim(),{redirectTo:`${window.location.origin}/reset-password`});if(error)throw error;setMessage("אם קיים חשבון תישלח אליו הודעת איפוס.");}catch(err){setMessage(err instanceof Error?err.message:"לא ניתן לשלוח הודעת איפוס");}finally{setBusy(false)}}
 return <main className="login-page"><section className="login-card"><p className="login-eyebrow">איפוס סיסמה</p><h1>חזרה לחשבון</h1><p className="login-intro">הזן את כתובת הדוא״ל של החשבון.</p>{message&&<div className="login-alert" role="status">{message}</div>}<form onSubmit={submit}><label>כתובת דוא״ל<div className="login-field"><input type="email" required value={email} onChange={e=>setEmail(e.target.value)} dir="ltr" /></div></label><button className="login-submit" disabled={busy}>{busy?"שולח...":"שליחת קישור איפוס"}</button></form><Link className="forgot-link" href="/login">חזרה לכניסה</Link></section></main>}
