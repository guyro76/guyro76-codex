'use client';
import {useRef,useState} from 'react';
import type {ActiveLocale} from '../lib/i18n';

const STORAGE_KEY='trivia-question-text-history-v1';
const fingerprint=(text:string)=>text.normalize('NFKC').toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();

type Backup={format:'trivia-squares-history';version:1;exportedAt:string;questions:string[]};
export default function LocalQuestionBackup({locale,onRestored}:{locale:ActiveLocale;onRestored:(questions:string[])=>void}){
  const input=useRef<HTMLInputElement>(null);
  const [status,setStatus]=useState('');
  // Status messages fall back to English outside Hebrew; the visible labels are native in all six languages.
  const en=locale!=='he';
  const L={
    he:{summary:'גיבוי ושחזור היסטוריית שאלות',body:'ללא חשבון, מחיקת נתוני הדפדפן תמחק גם את ההיסטוריה המקומית. אפשר להוריד גיבוי ולשחזר אותו כאן, או להתחבר כדי לסנכרן בין מכשירים.',download:'הורד גיבוי שאלות',restore:'שחזר גיבוי',file:'בחר קובץ גיבוי היסטוריה'},
    en:{summary:'Question history backup & restore',body:'Without an account, clearing browser data erases the local history. Download a backup and restore it here later, or sign in to sync across devices.',download:'Download history backup',restore:'Restore a backup',file:'Choose history backup file'},
    ru:{summary:'Резервная копия истории вопросов',body:'Без аккаунта очистка данных браузера удалит и локальную историю. Скачайте копию и восстановите её здесь позже или войдите, чтобы синхронизировать устройства.',download:'Скачать копию',restore:'Восстановить копию',file:'Выберите файл копии'},
    fr:{summary:'Sauvegarde de l’historique des questions',body:'Sans compte, effacer les données du navigateur efface aussi l’historique local. Téléchargez une sauvegarde pour la restaurer ici plus tard, ou connectez-vous pour synchroniser vos appareils.',download:'Télécharger la sauvegarde',restore:'Restaurer une sauvegarde',file:'Choisir le fichier de sauvegarde'},
    ar:{summary:'نسخ احتياطي لسجل الأسئلة',body:'بدون حساب، يؤدي مسح بيانات المتصفح إلى حذف السجل المحلي أيضًا. نزّل نسخة احتياطية واستعدها هنا لاحقًا، أو سجّل الدخول للمزامنة بين الأجهزة.',download:'تنزيل النسخة الاحتياطية',restore:'استعادة نسخة احتياطية',file:'اختر ملف النسخة الاحتياطية'},
    es:{summary:'Copia de seguridad del historial de preguntas',body:'Sin cuenta, borrar los datos del navegador elimina también el historial local. Descarga una copia y restáurala aquí más tarde, o inicia sesión para sincronizar dispositivos.',download:'Descargar copia',restore:'Restaurar copia',file:'Elegir archivo de copia'}
  }[locale];
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
  return <details className='local-history-backup'>
    <summary>{L.summary}</summary>
    <p>{L.body}</p>
    <div className='control-row'>
      <button type='button' className='glass-button' onClick={exportBackup}>{L.download}</button>
      <button type='button' className='glass-button' onClick={()=>input.current?.click()}>{L.restore}</button>
      <input ref={input} id='guest-history-file' type='file' accept='.json,application/json' style={{display:'none'}}
        onChange={event=>void importBackup(event.target.files?.[0])} aria-label={L.file} />
    </div>
    <p role='status' aria-live='polite'>{status}</p>
  </details>;
}
