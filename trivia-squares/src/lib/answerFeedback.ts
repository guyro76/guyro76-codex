import type {ActiveLocale} from './i18n';

export type AnswerFeedbackOptions={correct:boolean;gained:number;bonus?:boolean};

/** Native-language, numerically accurate feedback for local and online games.
 * The server remains authoritative for scores; this function only formats text. */
export function answerFeedback(locale:ActiveLocale,{correct,gained,bonus=false}:AnswerFeedbackOptions):string{
 const squares=Math.max(0,Math.trunc(gained));
 const credits=5+squares*10;
 if(bonus){
  const messages:Record<ActiveLocale,[string,string]>={
   he:['שאלת הזהב הצליחה! הרווחת שני אסימוני סגירה.','שאלת הזהב הוחמצה. אפשר לנסות שוב אחרי רצף חדש.'],
   en:['Golden question complete! Two bonus captures earned!','Golden question missed. Try a new streak.'],
   ru:['Золотой вопрос пройден! Получены два бонусных захвата.','Неверный ответ на золотой вопрос. Попробуйте снова после новой серии.'],
   fr:['Question dorée réussie ! Deux captures bonus gagnées.','Question dorée manquée. Réessayez après une nouvelle série.'],
   ar:['إجابة السؤال الذهبي صحيحة! حصلت على فرصتين إضافيتين للسيطرة.','إجابة السؤال الذهبي غير صحيحة. حاول مجددًا بعد سلسلة جديدة.'],
   es:['¡Pregunta dorada superada! Ganaste dos capturas extra.','Pregunta dorada fallida. Inténtalo después de una nueva racha.']
  };
  return messages[locale][correct?0:1];
 }
 if(!correct){
  const wrong:Record<ActiveLocale,string>={
   he:'תשובה שגויה! התור עובר.', en:'Wrong answer! Next turn.',
   ru:'Неверный ответ! Ход переходит дальше.',fr:'Mauvaise réponse ! Au tour suivant.',
   ar:'إجابة غير صحيحة! ينتقل الدور.',es:'¡Respuesta incorrecta! Siguiente turno.'
  };
  return wrong[locale];
 }
 if(squares>0){
  const gainedText:Record<ActiveLocale,string>={
   he:`סגרת ${squares} ריבועים! +10 נקודות ידע, +${credits} קרדיטים.`,
   en:`You captured ${squares} squares! +10 XP, +${credits} credits.`,
   ru:`Захвачено клеток: ${squares}! +10 очков знаний, +${credits} кредитов.`,
   fr:`Vous avez capturé ${squares} cases ! +10 points de savoir, +${credits} crédits.`,
   ar:`سيطرت على ${squares} مربعات! +10 نقاط معرفة، +${credits} أرصدة.`,
   es:`¡Capturaste ${squares} casillas! +10 puntos de conocimiento, +${credits} créditos.`
  };
  return gainedText[locale];
 }
 const simple:Record<ActiveLocale,string>={
  he:'תשובה נכונה! +10 נקודות ידע, +5 קרדיטים.',
  en:'Correct answer! +10 XP, +5 credits.',
  ru:'Правильно! +10 очков знаний и 5 кредитов.',
  fr:'Bonne réponse ! +10 points de savoir et 5 crédits.',
  ar:'إجابة صحيحة! +10 نقاط معرفة و5 أرصدة.',
  es:'¡Respuesta correcta! +10 puntos de conocimiento y 5 créditos.'
 };
 return simple[locale];
}
