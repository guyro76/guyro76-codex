import type {ActiveLocale} from './i18n';

export type GameplayGuidance='drawAdjacent'|'chooseAdjacent'|'invalidKeyboardLine'|'answerTimedOut'|'extensionUsed'|'insufficientCredits'|'remoteExtensionGranted'|'localExtensionGranted';
const dictionary:Record<ActiveLocale,Record<GameplayGuidance,string>>={
 he:{
  drawAdjacent:'חבר שתי נקודות סמוכות בגרירה אחת כדי לקבל שאלה.',
  chooseAdjacent:'בחר כעת נקודה סמוכה כדי להשלים קו.',
  invalidKeyboardLine:'יש לבחור רק שתי נקודות סמוכות עם קו פנוי.',
  answerTimedOut:'הזמן הסתיים. אי אפשר לשלוח תשובה מאוחרת.',
  extensionUsed:'אפשר להאריך כל שאלה פעם אחת בלבד.',
  insufficientCredits:'להארכת זמן דרושים 25 קרדיטים שנצברו במשחק.',
  remoteExtensionGranted:'נוספו 30 שניות לשאלה!',
  localExtensionGranted:'נוספו 30 שניות תמורת 25 קרדיטים.'
 },
 en:{
  drawAdjacent:'Drag once between two adjacent dots to unlock a question.',
  chooseAdjacent:'Choose a neighboring dot to complete the line.',
  invalidKeyboardLine:'Choose two neighboring dots with a free connecting line.',
  answerTimedOut:'Time is up. You cannot submit an answer after the timer.',
  extensionUsed:'Each question can be extended only once.',
  insufficientCredits:'You need 25 earned credits to extend the question timer.',
  remoteExtensionGranted:'30 extra seconds added!',
  localExtensionGranted:'30 extra seconds added for 25 credits.'
 },
 ru:{
  drawAdjacent:'Проведите линию между двумя соседними точками, чтобы открыть вопрос.',
  chooseAdjacent:'Выберите соседнюю точку, чтобы завершить линию.',
  invalidKeyboardLine:'Выберите две соседние точки со свободной линией между ними.',
  answerTimedOut:'Время вышло. Ответ после окончания таймера не принимается.',
  extensionUsed:'Время для каждого вопроса можно продлить только один раз.',
  insufficientCredits:'Для продления времени нужно 25 заработанных кредитов.',
  remoteExtensionGranted:'Добавлено 30 секунд!',
  localExtensionGranted:'Добавлено 30 секунд за 25 кредитов.'
 },
 fr:{
  drawAdjacent:'Reliez deux points voisins en un seul geste pour obtenir une question.',
  chooseAdjacent:'Choisissez un point voisin pour terminer la ligne.',
  invalidKeyboardLine:'Choisissez deux points voisins dont la liaison est libre.',
  answerTimedOut:'Temps écoulé. Impossible de répondre après la fin du chrono.',
  extensionUsed:'Chaque question ne peut être prolongée qu’une seule fois.',
  insufficientCredits:'Il faut 25 crédits gagnés pour prolonger le temps.',
  remoteExtensionGranted:'30 secondes supplémentaires ajoutées !',
  localExtensionGranted:'30 secondes supplémentaires pour 25 crédits.'
 },
 ar:{
  drawAdjacent:'اسحب خطًا واحدًا بين نقطتين متجاورتين لفتح سؤال.',
  chooseAdjacent:'اختر نقطة مجاورة لإكمال الخط.',
  invalidKeyboardLine:'اختر نقطتين متجاورتين بينهما خط متاح.',
  answerTimedOut:'انتهى الوقت. لا يمكن إرسال إجابة بعد انتهاء المؤقت.',
  extensionUsed:'يمكن تمديد وقت كل سؤال مرة واحدة فقط.',
  insufficientCredits:'تحتاج إلى 25 رصيدًا مكتسبًا لتمديد الوقت.',
  remoteExtensionGranted:'تمت إضافة 30 ثانية!',
  localExtensionGranted:'تمت إضافة 30 ثانية مقابل 25 رصيدًا.'
 },
 es:{
  drawAdjacent:'Desliza una línea entre dos puntos vecinos para abrir una pregunta.',
  chooseAdjacent:'Elige un punto vecino para completar la línea.',
  invalidKeyboardLine:'Elige dos puntos vecinos con una línea libre entre ellos.',
  answerTimedOut:'Se acabó el tiempo. No puedes responder fuera de plazo.',
  extensionUsed:'Cada pregunta solo puede ampliarse una vez.',
  insufficientCredits:'Necesitas 25 créditos ganados para ampliar el tiempo.',
  remoteExtensionGranted:'¡Se añadieron 30 segundos!',
  localExtensionGranted:'Se añadieron 30 segundos por 25 créditos.'
 }
};
export function gameplayGuidance(locale:ActiveLocale,key:GameplayGuidance):string {
 return dictionary[locale][key];
}
