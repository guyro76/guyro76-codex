import type {SupabaseClient} from '@supabase/supabase-js';
import type {ActiveLocale} from './i18n';

/** Player appeals on a marked answer ("I was right") and question reports ("send for checking").
 *  Works without an account: the device gets a random id that only lets it read its own appeals.
 *  An hourly review engine checks each appeal online; an approved appeal fixes the question for
 *  everyone and gives the player the line back (when that board is still open) plus 25 credits. */
export type AppealKind='appeal'|'report';
export type AppealSource='bundled'|'server';
export type StoredAppeal={id:number;kind:AppealKind;source:AppealSource;questionId:number;locale:ActiveLocale;
  edge?:string|null;board?:string|null;status:'pending'|'approved'|'rejected';notified?:boolean;createdAt:string};
export type AppealStatusRow={id:number;kind:AppealKind;source:AppealSource;question_id:number;locale:string;
  status:'pending'|'approved'|'rejected';decision_note:string|null;decided_at:string|null;compensation_claimed:boolean};

const CLIENT_KEY='trivia-client-id-v1';
const STORE_KEY='trivia-answer-appeals-v1';
export const APPEAL_CREDITS=25;

function randomId(){
  if(typeof crypto!=='undefined'&&typeof crypto.randomUUID==='function')return crypto.randomUUID();
  const b=new Uint8Array(16);crypto.getRandomValues(b);b[6]=(b[6]&15)|64;b[8]=(b[8]&63)|128;
  const h=[...b].map(x=>x.toString(16).padStart(2,'0')).join('');
  return h.slice(0,8)+'-'+h.slice(8,12)+'-'+h.slice(12,16)+'-'+h.slice(16,20)+'-'+h.slice(20);
}
export function deviceClientId():string{
  try{
    const saved=localStorage.getItem(CLIENT_KEY);
    if(saved&&/^[0-9a-f-]{36}$/i.test(saved))return saved;
    const id=randomId();localStorage.setItem(CLIENT_KEY,id);return id;
  }catch{return randomId()}
}
export function storedAppeals():StoredAppeal[]{
  try{const rows=JSON.parse(localStorage.getItem(STORE_KEY)||'[]');return Array.isArray(rows)?rows.filter(r=>r&&Number.isSafeInteger(r.id)):[]}catch{return []}
}
export function saveAppeals(rows:StoredAppeal[]){try{localStorage.setItem(STORE_KEY,JSON.stringify(rows.slice(-100)))}catch{}}

export async function submitAppeal(client:SupabaseClient,input:{kind:AppealKind;source:AppealSource;questionId:number;
  locale:ActiveLocale;text:string;answers:readonly string[];chosen:number|null;shownCorrect:number|null;reason?:string|null;
  edge?:string|null;board?:string|null}):Promise<{ok:true;id:number}|{ok:false;error:string}>{
  try{
    const {data,error}=await client.rpc('trivia_submit_answer_appeal',{
      p_client_id:deviceClientId(),p_kind:input.kind,p_source:input.source,p_question_id:input.questionId,p_locale:input.locale,
      p_question:input.text.slice(0,400),p_answers:input.answers.map(a=>String(a).slice(0,200)).slice(0,6),
      p_chosen:input.chosen,p_shown_correct:input.shownCorrect,p_reason:input.reason?String(input.reason).slice(0,300):null});
    if(error||!Number.isSafeInteger(Number(data)))return {ok:false,error:error?.message||'no id'};
    const id=Number(data);
    const rows=storedAppeals().filter(r=>r.id!==id);
    rows.push({id,kind:input.kind,source:input.source,questionId:input.questionId,locale:input.locale,
      edge:input.edge??null,board:input.board??null,status:'pending',createdAt:new Date().toISOString()});
    saveAppeals(rows);
    return {ok:true,id};
  }catch(e){return {ok:false,error:e instanceof Error?e.message:'failed'}}
}

export async function fetchAppealStatuses(client:SupabaseClient):Promise<AppealStatusRow[]|null>{
  try{
    const {data,error}=await client.rpc('trivia_my_appeals',{p_client_id:deviceClientId()});
    return error||!Array.isArray(data)?null:data as AppealStatusRow[];
  }catch{return null}
}

export async function claimAppealCompensation(client:SupabaseClient,appealId:number):Promise<{ok:boolean;serverCredited:boolean}>{
  try{
    const {data,error}=await client.rpc('trivia_claim_appeal_compensation',{p_client_id:deviceClientId(),p_appeal_id:appealId});
    if(error||!data||data.ok!==true)return {ok:false,serverCredited:false};
    return {ok:true,serverCredited:data.server_credited===true};
  }catch{return {ok:false,serverCredited:false}}
}

const words:Record<ActiveLocale,{appeal:string;sent:string;failed:string;approved:string;approvedLine:string;rejected:string;sending:string}>={
  he:{appeal:'ערעור על התשובה',sending:'שולח…',sent:'הערעור נשלח לבדיקה. אם יתברר שצדקת, הקו יוחזר לך ותקבל 25 קרדיטים.',failed:'לא ניתן לשלוח ערעור כרגע. נסו שוב בעוד רגע.',
    approved:'הערעור שלך התקבל והשאלה תוקנה. קיבלת 25 קרדיטים.',approvedLine:'הערעור שלך התקבל והשאלה תוקנה. הקו הוחזר ללוח וקיבלת 25 קרדיטים.',rejected:'הערעור נבדק: התשובה המקורית נכונה.'},
  en:{appeal:'Appeal this answer',sending:'Sending…',sent:'Appeal sent for review. If you were right, you get the line back and 25 credits.',failed:'Could not send the appeal right now. Try again in a moment.',
    approved:'Your appeal was accepted and the question was fixed. You got 25 credits.',approvedLine:'Your appeal was accepted and the question was fixed. The line is back on the board and you got 25 credits.',rejected:'Appeal reviewed: the original answer is correct.'},
  ru:{appeal:'Оспорить ответ',sending:'Отправка…',sent:'Апелляция отправлена на проверку. Если вы правы, вы получите линию и 25 кредитов.',failed:'Не удалось отправить апелляцию. Попробуйте чуть позже.',
    approved:'Апелляция принята, вопрос исправлен. Вы получили 25 кредитов.',approvedLine:'Апелляция принята, вопрос исправлен. Линия возвращена, и вы получили 25 кредитов.',rejected:'Апелляция проверена: исходный ответ верный.'},
  fr:{appeal:'Contester la réponse',sending:'Envoi…',sent:'Contestation envoyée. Si vous aviez raison, vous récupérez le trait et 25 crédits.',failed:'Impossible d’envoyer la contestation pour le moment. Réessayez bientôt.',
    approved:'Contestation acceptée, la question a été corrigée. Vous recevez 25 crédits.',approvedLine:'Contestation acceptée, la question a été corrigée. Le trait est rendu et vous recevez 25 crédits.',rejected:'Contestation examinée : la réponse d’origine est correcte.'},
  ar:{appeal:'الاعتراض على الإجابة',sending:'جارٍ الإرسال…',sent:'أُرسل الاعتراض للمراجعة. إذا كنت محقًا فستستعيد الخط وتحصل على 25 رصيدًا.',failed:'تعذر إرسال الاعتراض الآن. حاول بعد قليل.',
    approved:'قُبل اعتراضك وتم تصحيح السؤال. حصلت على 25 رصيدًا.',approvedLine:'قُبل اعتراضك وتم تصحيح السؤال. أُعيد الخط إلى اللوحة وحصلت على 25 رصيدًا.',rejected:'تمت مراجعة الاعتراض: الإجابة الأصلية صحيحة.'},
  es:{appeal:'Apelar la respuesta',sending:'Enviando…',sent:'Apelación enviada a revisión. Si tenías razón, recuperas la línea y 25 créditos.',failed:'No se pudo enviar la apelación ahora. Inténtalo en un momento.',
    approved:'Tu apelación fue aceptada y la pregunta se corrigió. Recibiste 25 créditos.',approvedLine:'Tu apelación fue aceptada y la pregunta se corrigió. La línea volvió al tablero y recibiste 25 créditos.',rejected:'Apelación revisada: la respuesta original es correcta.'}
};
export function appealText(locale:ActiveLocale){return words[locale]||words.he}
