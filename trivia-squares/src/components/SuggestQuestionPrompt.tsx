'use client';
import {useState,type FormEvent} from 'react';
import type {ActiveLocale} from '../lib/i18n';

export type QuestionSuggestion={text:string;answers:string[];correct:number};

const words:Record<ActiveLocale,{title:string;lead:string;question:string;answer:string;correct:string;submit:string;skip:string;invalid:string}>={
 he:{title:'עניתם על כל השאלות המגוונות שלנו!',lead:'עזרו לנו להוסיף שאלה חדשה: כתבו שאלה, ארבע תשובות וסמנו את הנכונה. הצעה תקינה מזכה אתכם בקו.',
  question:'השאלה שלך',answer:'תשובה',correct:'זו התשובה הנכונה',submit:'שלחו וקבלו את הקו',skip:'לא עכשיו',
  invalid:'כתבו שאלה של 12 תווים לפחות וארבע תשובות שונות זו מזו, וסמנו את הנכונה.'},
 en:{title:'You have answered all our varied questions!',lead:'Help us add a new one: write a question, four answers and mark the correct one. A valid suggestion earns you the line.',
  question:'Your question',answer:'Answer',correct:'This is the correct answer',submit:'Send and earn the line',skip:'Not now',
  invalid:'Write a question of at least 12 characters and four different answers, and mark the correct one.'},
 ru:{title:'Вы ответили на все наши разные вопросы!',lead:'Помогите добавить новый: напишите вопрос, четыре ответа и отметьте правильный. Подходящее предложение приносит линию.',
  question:'Ваш вопрос',answer:'Ответ',correct:'Это правильный ответ',submit:'Отправить и получить линию',skip:'Не сейчас',
  invalid:'Напишите вопрос не короче 12 символов и четыре разных ответа, отметьте правильный.'},
 fr:{title:'Vous avez répondu à toutes nos questions variées !',lead:'Aidez-nous à en ajouter une : écrivez une question, quatre réponses et cochez la bonne. Une proposition valide vous rapporte la ligne.',
  question:'Votre question',answer:'Réponse',correct:'C’est la bonne réponse',submit:'Envoyer et gagner la ligne',skip:'Pas maintenant',
  invalid:'Écrivez une question d’au moins 12 caractères et quatre réponses différentes, puis cochez la bonne.'},
 ar:{title:'لقد أجبت عن كل أسئلتنا المتنوعة!',lead:'ساعدنا في إضافة سؤال جديد: اكتب سؤالًا وأربع إجابات وحدّد الصحيحة. الاقتراح الصالح يمنحك الخط.',
  question:'سؤالك',answer:'إجابة',correct:'هذه هي الإجابة الصحيحة',submit:'أرسل واحصل على الخط',skip:'ليس الآن',
  invalid:'اكتب سؤالًا من 12 حرفًا على الأقل وأربع إجابات مختلفة، وحدّد الصحيحة.'},
 es:{title:'¡Has respondido todas nuestras preguntas variadas!',lead:'Ayúdanos a añadir una nueva: escribe una pregunta, cuatro respuestas y marca la correcta. Una propuesta válida te da la línea.',
  question:'Tu pregunta',answer:'Respuesta',correct:'Esta es la respuesta correcta',submit:'Enviar y ganar la línea',skip:'Ahora no',
  invalid:'Escribe una pregunta de al menos 12 caracteres y cuatro respuestas distintas, y marca la correcta.'}
};

export function validSuggestion(s:QuestionSuggestion):boolean{
 const q=s.text.trim(),a=s.answers.map(x=>x.trim());
 return q.length>=12&&q.length<=240&&a.length===4&&a.every(x=>x.length>0&&x.length<=120)&&
  new Set(a.map(x=>x.toLocaleLowerCase())).size===4&&Number.isInteger(s.correct)&&s.correct>=0&&s.correct<4;
}

export default function SuggestQuestionPrompt({locale,onSubmit,onSkip}:{
 locale:ActiveLocale;onSubmit:(s:QuestionSuggestion)=>void;onSkip:()=>void
}){
 const t=words[locale];
 const [text,setText]=useState('');
 const [answers,setAnswers]=useState(['','','','']);
 const [correct,setCorrect]=useState(-1);
 const [error,setError]=useState('');
 const submit=(e:FormEvent)=>{
  e.preventDefault();
  const s={text:text.trim(),answers:answers.map(a=>a.trim()),correct};
  if(!validSuggestion(s)){setError(t.invalid);return;}
  onSubmit(s);
 };
 return <div className='quiz-overlay' role='presentation'>
  <section className='quiz-card suggest-question-card' role='dialog' aria-modal='true' aria-label={t.title}
   onKeyDown={e=>{if(e.key==='Escape'){e.stopPropagation();onSkip()}}}>
   <h2>{t.title}</h2>
   <p className='smalltxt'>{t.lead}</p>
   <form onSubmit={submit} className='suggest-question-form'>
    <label className='form-field' htmlFor='suggest-question-text'>{t.question}</label>
    <textarea id='suggest-question-text' className='form-input' rows={2} maxLength={240} value={text}
     onChange={e=>{setText(e.target.value);setError('')}} autoFocus/>
    <div className='suggest-answers' role='radiogroup' aria-label={t.correct}>
     {answers.map((a,i)=><div className='suggest-answer-row' key={i}>
      <input type='radio' name='suggest-correct' id={'suggest-correct-'+i} checked={correct===i}
       onChange={()=>{setCorrect(i);setError('')}} aria-label={t.correct+' · '+t.answer+' '+(i+1)}/>
      <input type='text' className='form-input' maxLength={120} value={a} aria-label={t.answer+' '+(i+1)}
       placeholder={t.answer+' '+(i+1)} onChange={e=>{const next=[...answers];next[i]=e.target.value;setAnswers(next);setError('')}}/>
     </div>)}
    </div>
    {error&&<p className='suggest-error' role='alert'>{error}</p>}
    <div className='control-row'>
     <button type='submit' className='gold-button'>{t.submit}</button>
     <button type='button' className='glass-button' onClick={onSkip}>{t.skip}</button>
    </div>
   </form>
  </section>
 </div>;
}
