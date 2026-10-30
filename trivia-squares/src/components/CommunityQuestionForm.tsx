'use client';
import {useCallback,useEffect,useState,type FormEvent} from 'react';
import type {SupabaseClient} from '@supabase/supabase-js';
import type {ActiveLocale} from '../lib/i18n';

const subjects=[
 ['tv_film','סדרות וקולנוע','TV & movies','Кино и сериалы','Films et séries','الأفلام والمسلسلات'],
 ['music','מוזיקה ושירים','Music','Музыка','Musique','الموسيقى'],
 ['eurovision','אירוויזיון','Eurovision','Евровидение','Eurovision','يوروفيجن'],
 ['history','היסטוריה','History','История','Histoire','التاريخ'],
 ['capitals','בירות ומדינות','Capitals & countries','Страны и столицы','Capitales et pays','عواصم ودول'],
 ['israel_politics','ישראל ופוליטיקה','Israel & politics','Израиль и политика','Israël et politique','إسرائيل والسياسة'],
 ['science','מדע וטכנולוגיה','Science & tech','Наука','Sciences','العلوم'],
 ['sports','ספורט','Sport','Спорт','Sport','الرياضة'],
 ['nature','טבע','Nature','Природа','Nature','الطبيعة'],
 ['arts','אמנות וספרות','Arts & books','Искусство и книги','Arts et livres','الفنون والكتب'],
 ['food','אוכל','Food','Еда','Cuisine','الطعام'],
 ['general','ידע כללי','General knowledge','Общие знания','Culture générale','معلومات عامة']
] as const;
const words={
 he:{heading:'🧠 השאלה שלי במשחק',reward:'על שאלה מקורית שתאומת ותאושר: 50 קרדיטים ואסימון לסגירת ריבוע אחד.',
  warning:'הפרס מוענק רק אחרי בדיקת העובדות והוספת השאלה למאגר. ניתן להציע עד שלוש שאלות ביממה.',
  signIn:'כדי להציע שאלה ולשמור את הפרס צריך להיכנס לחשבון ולאשר את תנאי המשחק.',
  goAccount:'לחשבון והתחברות',category:'נושא',question:'השאלה שלך',qHint:'למשל: איך קראו לאשתו הראשונה של רוס בסדרה חברים?',
  answers:'ארבע תשובות אפשריות',correct:'התשובה הנכונה',source:'קישור למקור מידע אמין (רצוי מאוד)',submit:'שלח שאלה לבדיקה',sending:'שולח...',
  refresh:'בדוק סטטוס והפרסים שלי',tokens:'אסימוני סגירת ריבוע',pending:'ממתין לאימות',approved:'אושר ופורסם',rejected:'לא אושר',
  history:'ההצעות שלי',empty:'עוד לא שלחת שאלות. השאלה שלך יכולה להיכנס למשחק!',submitted:'השאלה נשמרה לבדיקה. הפרס יינתן רק לאחר אישור.',
  invalid:'יש להזין שאלה של לפחות 12 תווים, ארבע תשובות שונות, ולסמן תשובה נכונה.',url:'קישור המקור חייב להתחיל ב־https://',status:'סטטוס'},
 en:{heading:'🧠 Suggest a trivia question',reward:'For an original, verified and approved question: 50 credits and one square-capture token.',
  warning:'Rewards are granted only after fact-checking and publication. Up to three proposals per 24 hours.',
  signIn:'Sign in and accept the game terms to submit a question and keep rewards.',
  goAccount:'Account and sign-in',category:'Topic',question:'Your question',qHint:"For example: What was Ross’s first wife’s name in Friends?",
  answers:'Four answer choices',correct:'Correct answer',source:'Trusted evidence URL (recommended)',submit:'Submit for review',sending:'Submitting...',
  refresh:'Refresh my proposals and rewards',tokens:'Free square tokens',pending:'Awaiting verification',approved:'Approved and published',rejected:'Not approved',
  history:'My submissions',empty:'No submissions yet. Your question could be next!',submitted:'Your question is queued. Rewards arrive only after approval.',
  invalid:'Write a question with at least 12 characters, four different answers, and select the correct one.',url:'Source URL must start with https://',status:'Status'},
 ru:{heading:'🧠 Предложить вопрос',reward:'За одобренный и проверенный вопрос: 50 кредитов и жетон для одного квадрата.',
  warning:'Награда только после проверки фактов и публикации. До трёх предложений за 24 часа.',
  signIn:'Войдите в аккаунт и примите правила, чтобы участвовать.',goAccount:'Войти в аккаунт',category:'Тема',question:'Ваш вопрос',qHint:'Например: как звали первую жену Росса в «Друзьях»?',answers:'Четыре варианта',correct:'Верный ответ',source:'Надёжный источник (желательно)',submit:'Отправить на проверку',sending:'Отправка...',refresh:'Обновить статус и награды',tokens:'Жетоны квадрата',pending:'Ожидает проверки',approved:'Опубликовано',rejected:'Отклонено',history:'Мои вопросы',empty:'Предложений пока нет.',submitted:'Вопрос отправлен на проверку.',invalid:'Введите вопрос не короче 12 символов и четыре разных варианта.',url:'Ссылка должна начинаться с https://',status:'Статус'},
 fr:{heading:'🧠 Proposer une question',reward:'Question originale vérifiée et approuvée : 50 crédits et un jeton pour fermer une case.',
  warning:'Récompense uniquement après vérification et publication. Trois propositions maximum par 24 h.',
  signIn:'Connectez-vous et acceptez les conditions du jeu.',goAccount:'Compte et connexion',category:'Thème',question:'Votre question',qHint:'Exemple : comment s’appelait la première femme de Ross dans Friends ?',answers:'Quatre réponses',correct:'Bonne réponse',source:'Lien vers une source fiable (recommandé)',submit:'Soumettre pour validation',sending:'Envoi...',refresh:'Actualiser mes propositions',tokens:'Jetons de case',pending:'En vérification',approved:'Approuvée et publiée',rejected:'Refusée',history:'Mes propositions',empty:'Aucune proposition pour le moment.',submitted:'Question soumise à vérification.',invalid:'Saisissez une question de 12 caractères minimum et quatre choix distincts.',url:'Le lien doit commencer par https://',status:'Statut'},
 ar:{heading:'🧠 اقترح سؤالاً',reward:'لكل سؤال أصلي يتم التحقق منه وقبوله: 50 رصيدًا ورمز لإغلاق مربع واحد.',
  warning:'تُمنح المكافأة بعد التحقق من الحقائق والنشر فقط. ثلاثة اقتراحات كحد أقصى خلال 24 ساعة.',
  signIn:'سجّل الدخول ووافق على شروط اللعبة.',goAccount:'الحساب وتسجيل الدخول',category:'الموضوع',question:'سؤالك',qHint:'مثال: ما اسم زوجة روس الأولى في فريندز؟',answers:'أربع إجابات',correct:'الإجابة الصحيحة',source:'رابط مصدر موثوق (مستحسن)',submit:'إرسال للمراجعة',sending:'جارٍ الإرسال...',refresh:'تحديث حالة الاقتراحات',tokens:'رموز المربعات',pending:'بانتظار التحقق',approved:'تمت الموافقة والنشر',rejected:'لم تتم الموافقة',history:'اقتراحاتي',empty:'لا توجد اقتراحات بعد.',submitted:'تم حفظ السؤال للمراجعة.',invalid:'اكتب سؤالاً من 12 حرفًا على الأقل وأربع إجابات مختلفة.',url:'يجب أن يبدأ الرابط بـ https://',status:'الحالة'}
} as const;

type ProposalSummary={id:string;question:string;status:'pending'|'approved'|'rejected';submitted_at:string;note?:string|null;reward_issued:boolean};
function emptyOptions():string[]{return ['','','',''];}

export default function CommunityQuestionForm({client,locale,userId,legalAccepted,onRequestAccount}:{
 client:SupabaseClient|null;locale:ActiveLocale;userId:string|null;legalAccepted:boolean;onRequestAccount:()=>void
}){
 const t=words[locale];
 const [category,setCategory]=useState<string>('tv_film');
 const [question,setQuestion]=useState('');
 const [options,setOptions]=useState<string[]>(emptyOptions);
 const [correct,setCorrect]=useState<number>(0);
 const [source,setSource]=useState('');
 const [submitting,setSubmitting]=useState(false);
 const [error,setError]=useState('');
 const [feedback,setFeedback]=useState('');
 const [tokens,setTokens]=useState(0);
 const [history,setHistory]=useState<ProposalSummary[]>([]);
 const [credits,setCredits]=useState<number|null>(null);
 const refresh=useCallback(async()=>{
  if(!client||!userId||!legalAccepted)return;
  const [submissions,profile]=await Promise.all([
   client.rpc('trivia_my_community_proposals'),
   client.rpc('trivia_my_profile')
  ]);
  if(!submissions.error&&submissions.data){
   setTokens(Number(submissions.data.tokens)||0);
   setHistory(Array.isArray(submissions.data.proposals)?submissions.data.proposals:[]);
  }
  if(!profile.error&&profile.data?.progress){
   const accountCredits=Number(profile.data.progress.credits);
   if(Number.isFinite(accountCredits))setCredits(accountCredits);
  }
 },[client,userId,legalAccepted]);
 useEffect(()=>{void refresh()},[refresh]);
 const submit=async(event:FormEvent<HTMLFormElement>)=>{
  event.preventDefault();setError('');setFeedback('');
  if(!client||!userId||!legalAccepted){onRequestAccount();return;}
  const q=question.trim(),choices=options.map(x=>x.trim());
  if(q.length<12||q.length>240||new Set(choices.map(s=>s.toLocaleLowerCase())).size!==4||
    choices.some(x=>!x||x.length>120)){
   setError(t.invalid);return;
  }
  if(source.trim()&&!/^https:\/\//i.test(source.trim())){setError(t.url);return;}
  setSubmitting(true);
  try{
   const {error:failure}=await client.rpc('trivia_submit_community_question',{
    p_locale:locale,p_category:category,p_question:q,p_answers:choices,
    p_correct_index:correct,p_source_url:source.trim()||null
   });
   if(failure){setError(failure.message);return;}
   setQuestion('');setOptions(emptyOptions());setCorrect(0);setSource('');
   setFeedback(t.submitted);
   await refresh();
  }catch(e){setError(e instanceof Error?e.message:String(e));}
  finally{setSubmitting(false);}
 };
 return <section className="community-contribution" aria-label={t.heading} dir={locale==='he'||locale==='ar'?'rtl':'ltr'}>
  <h2 className="panel-title">{t.heading}</h2>
  <p className="community-prize">{t.reward}</p>
  <p className="smalltxt">{t.warning}</p>
  {!userId||!legalAccepted?<div className="community-auth-notice"><p>{t.signIn}</p>
    <button type="button" className="gold-button" onClick={onRequestAccount}>{t.goAccount}</button></div>:<>
   <form className="community-question-form" onSubmit={e=>void submit(e)}>
    <label htmlFor="community-topic">{t.category}</label>
    <select id="community-topic" className="form-input" value={category} onChange={e=>setCategory(e.target.value)}>
     {subjects.map(s=><option key={s[0]} value={s[0]}>{s[locale==='he'?1:locale==='en'?2:locale==='ru'?3:locale==='fr'?4:5]}</option>)}
    </select>
    <label htmlFor="community-question">{t.question}</label>
    <textarea id="community-question" className="form-input" rows={3} minLength={12} maxLength={240} required
      value={question} placeholder={t.qHint} onChange={e=>setQuestion(e.target.value)}/>
    <fieldset className="community-answers"><legend>{t.answers}</legend>
     {options.map((answer,i)=><label key={i} className="community-answer-row">
      <input type="radio" name="community-correct" aria-label={t.correct+' '+(i+1)} checked={correct===i} onChange={()=>setCorrect(i)}/>
      <span className="community-answer-index">{String(i+1)}</span>
      <input className="form-input" value={answer} maxLength={120} required
        aria-label={t.answers+' '+(i+1)} onChange={e=>setOptions(prev=>prev.map((v,j)=>i===j?e.target.value:v))}/>
     </label>)}
    </fieldset>
    <label htmlFor="community-source">{t.source}</label>
    <input id="community-source" type="url" className="form-input" maxLength={500} placeholder="https://..."
      value={source} onChange={e=>setSource(e.target.value)}/>
    {error&&<p className="community-error" role="alert">{error}</p>}
    {feedback&&<p className="community-success" role="status">{feedback}</p>}
    <button type="submit" className="gold-button" disabled={submitting}>{submitting?t.sending:t.submit}</button>
   </form>
   <div className="community-wallet">
    <strong>{t.tokens}: {tokens}</strong>
    {credits!==null&&<span>🪙 {credits}</span>}
    <button type="button" className="glass-button" onClick={()=>void refresh()}>{t.refresh}</button>
   </div>
   <h3 className="community-history-title">{t.history}</h3>
   {!history.length?<p className="smalltxt">{t.empty}</p>:
    <ul className="community-history">{history.map(p=><li key={p.id}>
     <span>{p.question}</span>
     <strong data-status={p.status}>{t[p.status]}</strong>
     {p.note&&<small>{p.note}</small>}
    </li>)}</ul>}
  </>}
 </section>;
}
