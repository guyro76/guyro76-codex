import type {ActiveLocale} from './i18n';

export type QuestionAvailabilityState='networkError'|'serverExhausted'|'offlineExhausted'|'topicFallback';

/** Player-facing question-availability statuses.
 * Never grants turns or credits: rendering only; board and wallet stay untouched. */
const messages:Record<ActiveLocale,Record<QuestionAvailabilityState,string>>={
 he:{
  networkError:'לא ניתן לטעון שאלות כרגע. בדקו את החיבור לאינטרנט ונסו שוב. הלוח והניקוד נשמרו.',
  serverExhausted:'כל השאלות החדשות הזמינות נוצלו. ההתקדמות נשמרה. אי אפשר לסגור קו ללא תשובת טריוויה.',
  offlineExhausted:'השאלות השמורות במכשיר נוצלו. התחברו לאינטרנט לטעינת שאלות נוספות. הלוח והניקוד נשמרו.',
  topicFallback:'השאלות בנושאים שבחרת אזלו. נמצאה שאלה בנושא אחר בלי למחוק את ההתקדמות.'
 },
 en:{
  networkError:'Questions could not be loaded. Check your internet connection and retry. Your board and score are saved.',
  serverExhausted:'All currently available new questions have been used. Progress is saved; no free lines without an answer.',
  offlineExhausted:'Your saved offline questions are exhausted. Connect to the internet for more. Your board and score are saved.',
  topicFallback:'Your selected topics are exhausted. Here is a new question from another topic. Your progress is saved.'
 },
 ru:{
  networkError:'Не удалось загрузить вопросы. Проверьте интернет и повторите попытку. Поле и очки сохранены.',
  serverExhausted:'Все доступные новые вопросы закончились. Прогресс сохранён. Линия без ответа не засчитывается.',
  offlineExhausted:'Сохранённые вопросы закончились. Подключитесь к интернету за новыми. Поле и очки сохранены.',
  topicFallback:'В выбранных темах больше нет вопросов. Доступен вопрос из другой темы. Прогресс сохранён.'
 },
 fr:{
  networkError:'Impossible de charger les questions. Vérifiez Internet puis réessayez. Le plateau et le score sont sauvegardés.',
  serverExhausted:'Toutes les nouvelles questions disponibles sont épuisées. Progression sauvegardée. Aucun trait gratuit sans réponse.',
  offlineExhausted:'Les questions hors ligne sont épuisées. Connectez-vous pour en charger d’autres. Plateau et score sauvegardés.',
  topicFallback:'Les sujets choisis sont épuisés. Voici une question sur un autre sujet. Votre progression est conservée.'
 },
 ar:{
  networkError:'تعذّر تحميل الأسئلة. تحقق من اتصال الإنترنت وحاول مجددًا. تم حفظ اللوحة والنقاط.',
  serverExhausted:'نفدت جميع الأسئلة الجديدة المتاحة. تم حفظ التقدم. لا يمكن إكمال خط من دون إجابة صحيحة.',
  offlineExhausted:'نفدت الأسئلة المحفوظة على الجهاز. اتصل بالإنترنت لتحميل المزيد. تم حفظ اللوحة والنقاط.',
  topicFallback:'نفدت الأسئلة في المواضيع المختارة. إليك سؤالًا جديدًا من موضوع آخر. تم حفظ تقدمك.'
 },
 es:{
  networkError:'No se pudieron cargar las preguntas. Comprueba Internet y vuelve a intentarlo. El tablero y la puntuación se guardaron.',
  serverExhausted:'Se agotaron las preguntas nuevas disponibles. Tu progreso está guardado. No se ganan líneas sin responder.',
  offlineExhausted:'Se agotaron las preguntas guardadas sin conexión. Conéctate para cargar más. Se guardaron el tablero y la puntuación.',
  topicFallback:'Se agotaron las preguntas de tus temas elegidos. Hay otra pregunta de un tema distinto. Tu progreso se conserva.'
 }
};

export function questionAvailabilityMessage(locale:ActiveLocale,state:QuestionAvailabilityState):string{
 return messages[locale][state];
}
