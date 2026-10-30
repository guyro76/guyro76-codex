'use client';
import {useState} from 'react';
import type {SupabaseClient} from '@supabase/supabase-js';
import type {ActiveLocale} from '../lib/i18n';

const reasons=['wrong_answer','unclear','translation','duplicate','outdated'] as const;
type Reason=typeof reasons[number];
type Words={open:string;reason:string;submit:string;close:string;sent:string;local:string;error:string;options:Record<Reason,string>};
const translations:Record<ActiveLocale,Words>={
 he:{open:'דווח על בעיה בשאלה',reason:'מה לא תקין בשאלה?',submit:'שלח דיווח',close:'ביטול',sent:'הדיווח נשלח לבדיקה. תודה!',local:'הדיווח נשמר במכשיר בלבד. התחברות תאפשר דיווח למערכת.',error:'לא ניתן לשלוח כעת. הדיווח נשמר במכשיר.',
  options:{wrong_answer:'התשובה המסומנת שגויה',unclear:'שאלה עמומה או לא ברורה',translation:'תרגום או ניסוח שגוי',duplicate:'השאלה חזרה שוב',outdated:'מידע לא מעודכן'}},
 en:{open:'Report a question',reason:'What is wrong?',submit:'Submit report',close:'Cancel',sent:'Report sent for review. Thank you!',local:'Report saved on this device only. Sign in to report to the team.',error:'Could not send now. Saved on this device.',
  options:{wrong_answer:'Incorrect marked answer',unclear:'Unclear question',translation:'Translation or wording',duplicate:'Repeated question',outdated:'Outdated information'}},
 ru:{open:'Сообщить об ошибке в вопросе',reason:'Что не так?',submit:'Отправить',close:'Отмена',sent:'Сообщение отправлено на проверку.',local:'Сохранено только на этом устройстве. Для отправки войдите в аккаунт.',error:'Не удалось отправить. Сохранено на устройстве.',
  options:{wrong_answer:'Неверный ответ',unclear:'Неясный вопрос',translation:'Ошибка перевода',duplicate:'Повтор вопроса',outdated:'Устаревшая информация'}},
 fr:{open:'Signaler une question',reason:'Quel est le problème ?',submit:'Envoyer',close:'Annuler',sent:'Signalement envoyé pour vérification.',local:'Enregistré sur cet appareil uniquement. Connectez-vous pour signaler à notre équipe.',error:'Envoi impossible. Enregistré sur cet appareil.',
  options:{wrong_answer:'Mauvaise réponse indiquée',unclear:'Question ambiguë',translation:'Erreur de traduction',duplicate:'Question répétée',outdated:'Informations périmées'}},
 ar:{open:'الإبلاغ عن مشكلة في السؤال',reason:'ما المشكلة؟',submit:'إرسال البلاغ',close:'إلغاء',sent:'تم إرسال البلاغ للمراجعة.',local:'حُفظ البلاغ على هذا الجهاز فقط. سجّل الدخول لإرساله للفريق.',error:'تعذر الإرسال. حُفظ على هذا الجهاز.',
  options:{wrong_answer:'الإجابة المحددة غير صحيحة',unclear:'السؤال غير واضح',translation:'خطأ في الترجمة',duplicate:'السؤال مكرر',outdated:'معلومات قديمة'}},
 es:{open:'Informar de un problema',reason:'¿Qué problema tiene la pregunta?',submit:'Enviar informe',close:'Cancelar',sent:'Informe enviado a revisión. ¡Gracias!',local:'Guardado solo en este dispositivo. Inicia sesión para enviarlo al equipo.',error:'No se pudo enviar. Guardado en este dispositivo.',
  options:{wrong_answer:'Respuesta marcada incorrecta',unclear:'Pregunta ambigua',translation:'Error de traducción',duplicate:'Pregunta repetida',outdated:'Información desactualizada'}}
};
export default function QuestionReportButton({client,userId,legalAccepted,questionId,locale}:{
 client:SupabaseClient|null;userId:string|null;legalAccepted:boolean;questionId:number;locale:ActiveLocale
}){
 const t=translations[locale], [expanded,setExpanded]=useState(false),[reason,setReason]=useState<Reason>('wrong_answer');
 const [saving,setSaving]=useState(false),[message,setMessage]=useState('');
 const submit=async()=>{
  if(saving)return;
  setSaving(true);setMessage('');
  let savedOnDevice=false;
  try{
   const key='trivia-question-reports-v1';
   const previous=JSON.parse(localStorage.getItem(key)||'[]') as Array<{id:number;locale:ActiveLocale;reason:Reason;createdAt:string}>;
   const safe=Array.isArray(previous)?previous.filter(row=>row&&Number.isSafeInteger(row.id)).slice(-149):[];
   const entry={id:questionId,locale,reason,createdAt:new Date().toISOString()};
   localStorage.setItem(key,JSON.stringify([...safe.filter(row=>!(row.id===questionId&&row.locale===locale)),entry]));
   savedOnDevice=true;
  }catch{}
  if(client&&userId&&legalAccepted&&Number.isSafeInteger(questionId)&&questionId>0){
   try{
    const {data,error}=await client.rpc('trivia_report_question',{p_question_id:questionId,p_reason:reason});
    if(!error&&data===true){setMessage(t.sent);setSaving(false);setExpanded(false);return;}
   }catch{}
  }
  setMessage(savedOnDevice?t.local:t.error);setSaving(false);setExpanded(false);
 };
 return <div className="question-report-widget" dir={locale==='he'||locale==='ar'?'rtl':'ltr'}>
   {!expanded&&<button type="button" className="question-report-toggle" onClick={()=>setExpanded(true)}>{t.open}</button>}
   {expanded&&<div className="question-report-form" role="group" aria-label={t.reason}>
     <label htmlFor="trivia-report-reason">{t.reason}</label>
     <select id="trivia-report-reason" value={reason} onChange={e=>setReason(e.target.value as Reason)}>
       {reasons.map(key=><option value={key} key={key}>{t.options[key]}</option>)}
     </select>
     <div className="question-report-actions">
       <button type="button" disabled={saving} onClick={()=>void submit()}>{t.submit}</button>
       <button type="button" disabled={saving} onClick={()=>setExpanded(false)}>{t.close}</button>
     </div>
   </div>}
   {message&&<p className="question-report-notice" role="status">{message}</p>}
 </div>;
}
