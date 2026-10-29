'use client';
import {useRef,useState} from 'react';
import type {ActiveLocale} from '../lib/i18n';

const STORAGE_KEY='trivia-question-text-history-v1';
const fingerprint=(text:string)=>text.normalize('NFKC').toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();

type Backup={format:'trivia-squares-history';version:1;exportedAt:string;questions:string[]};
export default function LocalQuestionBackup({locale,onRestored}:{locale:ActiveLocale;onRestored:(questions:string[])=>void}){
  const input=useRef<HTMLInputElement>(null);
  const [status,setStatus]=useState('');
  const en=locale==='en';
  function exportBackup(){
    try{
      const parsed=JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]');
      const questions=Array.isArray(parsed)?parsed.filter((v):v is string=>typeof v==='string'): [];
      const backup:Backup={format:'trivia-squares-history',version:1,exportedAt:new Date().toISOString(),questions};
      const blob=new Blob([JSON.stringify(backup,null,2)],{type:'application/json;charset=utf-8'});
      const url=URL.createObjectURL(blob);
      const a=document.createElement('a');
      a.href=url;a.download='trivia-squares-question-history.json';
      document.body.append(a);a.click();a.remove();
      window.setTimeout(()=>URL.revokeObjectURL(url),1200);
      setStatus(en?'Question history exported. Keep the file outside your browser.':'היסטוריית השאלות יוצאה לקובץ. כדאי לשמור אותו מחוץ לדפדפן.');
    }catch{
      setStatus(en?'Could not export your history. Try again.':'לא ניתן לייצא את היסטוריית השאלות.');
    }
  }
  async function importBackup(file:File|null|undefined){
    if(!file)return;
    if(file.size>2_000_000){setStatus(en?'The file is too large.':'הקובץ גדול מדי.');return;}
    try{
      const data:unknown=JSON.parse(await file.text());
      if(!data || typeof data!=='object' ||
        (data as Backup).format!=='trivia-squares-history' || (data as Backup).version!==1 ||
        !Array.isArray((data as Backup).questions))throw new Error('Invalid format');
      const entries=(data as Backup).questions;
      if(entries.length>20000 || entries.some(x=>typeof x!=='string'||x.length>700))throw new Error('Invalid entries');
      const previous=JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]');
      const combined=new Set<string>(
        [...(Array.isArray(previous)?previous:[]),...entries]
         .filter((v):v is string=>typeof v==='string').map(fingerprint).filter(Boolean)
      );
      const values=[...combined];
      localStorage.setItem(STORAGE_KEY,JSON.stringify(values));
      onRestored(values);
      setStatus(en?`Restored ${entries.length} history records. Previously seen questions remain excluded.`:
        `שוחזרו ${entries.length} רשומות. שאלות שכבר נראו לא יופיעו שוב במכשיר הזה.`);
    }catch{
      setStatus(en?'This is not a valid Trivia Squares history backup.':'זה אינו קובץ גיבוי תקין של היסטוריית השאלות.');
    }finally{if(input.current)input.current.value='';}
  }
  return <section className='local-history-backup' aria-label={en?'Guest history backup':'גיבוי היסטוריית אורח'}>
    <h3>{en?'Save your question history':'שמור את היסטוריית השאלות'}</h3>
    <p>{en
      ?'Without an account, clearing browser data erases the local history. Download a backup and restore it here later, or sign in to sync across devices.'
      :'ללא חשבון, מחיקת נתוני הדפדפן תמחק גם את ההיסטוריה המקומית. אפשר להוריד גיבוי ולשחזר אותו כאן, או להתחבר כדי לסנכרן בין מכשירים.'}</p>
    <div className='control-row'>
      <button type='button' className='glass-button' onClick={exportBackup}>{en?'Download history backup':'הורד גיבוי שאלות'}</button>
      <button type='button' className='glass-button' onClick={()=>input.current?.click()}>{en?'Restore a backup':'שחזר גיבוי'}</button>
      <input ref={input} id='guest-history-file' type='file' accept='.json,application/json' style={{display:'none'}}
        onChange={event=>void importBackup(event.target.files?.[0])} aria-label={en?'Choose history backup file':'בחר קובץ גיבוי היסטוריה'} />
    </div>
    <p role='status' aria-live='polite'>{status}</p>
  </section>;
}
