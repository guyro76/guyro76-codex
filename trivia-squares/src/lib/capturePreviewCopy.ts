import type {ActiveLocale} from './i18n';
type Copy={open:string;title:string;hint:string;again:string;close:string};
export const capturePreviewCopy:Record<ActiveLocale,Copy>={
 he:{open:'בדוק מילוי נוזל',title:'כיבוש ריבוע בנוזל',hint:'הנוזל עולה מלמטה, הגל נשבר ולבסוף מתגלים השם והניצוצות. ההדגמה לא משנה ניקוד.',again:'מלא שוב',close:'סגור'},
 en:{open:'Test liquid fill',title:'Liquid territory capture',hint:'Watch the liquid rise, crest and reveal your name. This preview does not affect score.',again:'Replay fill',close:'Close'},
 ru:{open:'Проверить заливку',title:'Жидкое заполнение клетки',hint:'Жидкость поднимается, волна переливается и появляется имя. Прогресс не меняется.',again:'Повторить',close:'Закрыть'},
 fr:{open:'Tester le remplissage',title:'Case remplie de liquide',hint:'Le liquide monte, forme une vague et révèle votre nom. Aucun changement au score.',again:'Rejouer',close:'Fermer'},
 ar:{open:'اختبار ملء المربع',title:'تعبئة المربع بالسائل',hint:'يرتفع السائل وتظهر الموجة ثم اسم اللاعب. لا تتغير النقاط.',again:'إعادة التعبئة',close:'إغلاق'},
 es:{open:'Probar relleno líquido',title:'Captura líquida de casillas',hint:'El líquido sube, forma una ola y revela tu nombre. No cambia la puntuación.',again:'Repetir',close:'Cerrar'}
};