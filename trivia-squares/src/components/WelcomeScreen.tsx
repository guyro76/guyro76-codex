'use client';

import {useEffect,useState} from 'react';
import TriviaMark from './TriviaMark';
import GameArt from './GameArt';
import {GameImage} from './GameImage';
import type {ActiveLocale} from '../lib/i18n';
import './welcome-screen.css';

const locales=['he','en','ru','fr','ar','es'] as const;
const welcomeSkins=[
 {id:'regular',colors:['#1F3265','#688FD8','#F9DA90']},
 {id:'urban',colors:['#172935','#5A8C9C','#F4BD70']},
 {id:'vintage',colors:['#583D36','#D1AC7C','#F7E9CE']},
 {id:'retro',colors:['#302B5D','#FAAE4C','#71D4BC']},
 {id:'pop',colors:['#F34594','#FFD952','#4994EA']},
 {id:'future',colors:['#42117E','#F15A24','#E946CC']}
] as const;
type WelcomeSkin=typeof welcomeSkins[number]['id'];
const skinLabels:Record<ActiveLocale,{trigger:string;title:string;names:Record<WelcomeSkin,string>}>={
 he:{trigger:'בחרו סקין',title:'6 סקינים לבחירה · ההתקדמות נשמרת',names:{regular:'רגיל · מקורי',urban:'אורבני',vintage:'וינטג׳',retro:'רטרו',pop:'פופ צבעוני',future:'עתידני סגול-כתום'}},
 en:{trigger:'Choose a skin',title:'6 skins · progress is saved',names:{regular:'Original',urban:'Urban',vintage:'Vintage',retro:'Retro',pop:'Pop Art',future:'Purple & Orange AI'}},
 ru:{trigger:'Выбрать стиль',title:'6 тем · прогресс сохраняется',names:{regular:'Оригинальный',urban:'Городской',vintage:'Винтаж',retro:'Ретро',pop:'Поп-арт',future:'AI: фиолетовый и оранжевый'}},
 fr:{trigger:'Choisir un thème',title:'6 thèmes · progression conservée',names:{regular:'Original',urban:'Urbain',vintage:'Vintage',retro:'Rétro',pop:'Pop Art',future:'IA violet et orange'}},
 ar:{trigger:'اختر المظهر',title:'6 مظاهر · يتم حفظ التقدم',names:{regular:'الأصلي',urban:'حضري',vintage:'كلاسيكي',retro:'ريترو',pop:'فن البوب',future:'مستقبلي بنفسجي وبرتقالي'}},
 es:{trigger:'Elegir diseño',title:'6 diseños · se guarda el progreso',names:{regular:'Original',urban:'Urbano',vintage:'Vintage',retro:'Retro',pop:'Arte pop',future:'IA violeta y naranja'}}
};
const dictionary={
 he:{brand:'טריוויה ריבועים',eyebrow:'חושבים. מחברים. כובשים.',titleA:'כל קו הוא',titleB:'שאלת טריוויה.',subtitle:'חברו שתי נקודות כמו עם טוש, ענו נכון על שאלות מפתיעות וצבעו את הדרך לניצחון. כל ריבוע הוא הישג חדש.',start:'מתחילים לשחק',learn:'איך משחקים?',step1:'מחברים נקודות',step2:'עונים נכון',step3:'כובשים ריבוע',hint:'בלי להוריד אפליקציה · 200 שלבים · 6 שפות',level:'200 שלבי הרפתקה',topics:'תרבות, סדרות, ספורט ועוד',footer:'חשיבה חדה. משחק ממכר.',instructions:'גררו בין שתי נקודות סמוכות, בחרו תשובה מתוך ארבע אפשרויות וסגרו ריבוע כדי לצבור נקודות. לכל שלב יש לוח משלו.',close:'הבנתי',preview:'המחשת לוח המשחק'},
 en:{brand:'TRIVIA SQUARES',eyebrow:'THINK. CONNECT. CONQUER.',titleA:'Every line',titleB:'unlocks a question.',subtitle:'Draw between two dots with a marker, answer clever trivia, and color your way to victory. Every square is an achievement.',start:'Start playing',learn:'How to play?',step1:'Connect the dots',step2:'Answer correctly',step3:'Claim a square',hint:'No app download · 200 stages · 6 languages',level:'200 adventure stages',topics:'Pop culture, TV, sport & more',footer:'Sharp minds. Great games.',instructions:'Drag between adjacent dots, choose the right answer out of four, and close a square to earn points. Each stage has its own board.',close:'Got it',preview:'Game-board preview'},
 ru:{brand:'КВАДРАТЫ ВИКТОРИНЫ',eyebrow:'ДУМАЙ. СОЕДИНЯЙ. ПОБЕЖДАЙ.',titleA:'Каждая линия —',titleB:'новый вопрос.',subtitle:'Соединяйте точки, отвечайте на вопросы и закрашивайте квадраты на пути к победе.',start:'Начать игру',learn:'Как играть?',step1:'Соедините точки',step2:'Ответьте верно',step3:'Захватите квадрат',hint:'Без скачивания · 200 уровней · 6 языков',level:'200 уровней',topics:'Кино, музыка, спорт и не только',footer:'Думай и побеждай.',instructions:'Проведите линию между соседними точками, выберите верный ответ из четырёх и закройте квадрат, чтобы получить очки.',close:'Понятно',preview:'Предпросмотр поля'},
 fr:{brand:'TRIVIA SQUARES',eyebrow:'RÉFLÉCHIR. RELIER. CONQUÉRIR.',titleA:'Chaque ligne,',titleB:'une nouvelle question.',subtitle:'Reliez deux points comme au feutre, répondez à des questions et colorez les cases pour gagner.',start:'Commencer à jouer',learn:'Comment jouer ?',step1:'Relier deux points',step2:'Répondre juste',step3:'Gagner une case',hint:'Sans téléchargement · 200 niveaux · 6 langues',level:'200 niveaux',topics:'Films, séries, sport et plus',footer:'Réfléchissez. Jouez. Gagnez.',instructions:'Reliez deux points voisins, choisissez la bonne réponse parmi quatre choix et fermez une case pour gagner des points.',close:'Compris',preview:'Aperçu du plateau'},
 ar:{brand:'مربعات المعلومات',eyebrow:'فكّر. صِل. انتصر.',titleA:'كل خط يفتح',titleB:'سؤالاً جديداً.',subtitle:'صِل بين نقطتين كما لو كنت تستخدم قلم تلوين، وأجب عن أسئلة ممتعة ولوّن المربعات حتى الفوز.',start:'ابدأ اللعب',learn:'كيف ألعب؟',step1:'صل بين النقط',step2:'أجب بشكل صحيح',step3:'استحوذ على مربع',hint:'دون تحميل · 200 مرحلة · 6 لغات',level:'200 مرحلة',topics:'الأفلام والمسلسلات والرياضة والمزيد',footer:'فكّر والعب وانتصر.',instructions:'اسحب بين نقطتين متجاورتين، واختر الإجابة الصحيحة من أربعة خيارات، وأغلق مربعاً لكسب النقاط.',close:'فهمت',preview:'معاينة اللوحة'},
 es:{brand:'CUADRADOS DE TRIVIA',eyebrow:'PIENSA. CONECTA. CONQUISTA.',titleA:'Cada línea',titleB:'abre una pregunta.',subtitle:'Conecta dos puntos como con un rotulador, responde a preguntas sorprendentes y colorea casillas hasta alcanzar la victoria.',start:'Empezar a jugar',learn:'¿Cómo se juega?',step1:'Conecta puntos',step2:'Responde bien',step3:'Conquista una casilla',hint:'Sin descargas · 200 niveles · 6 idiomas',level:'200 niveles de aventura',topics:'Series, cine, música y deporte',footer:'Mentes despiertas. Juego brillante.',instructions:'Desliza entre dos puntos vecinos, elige la respuesta correcta entre cuatro opciones y cierra una casilla para ganar puntos. Cada nivel tiene su propio tablero.',close:'Entendido',preview:'Vista previa del tablero'}
} as const;

export default function WelcomeScreen({onStart,initialLocale='he'}:{onStart:()=>void;initialLocale?:ActiveLocale}){
 const [locale,setLocale]=useState<ActiveLocale>(initialLocale);
 useEffect(()=>{try{const stored=localStorage.getItem('trivia-language');if(locales.includes(stored as ActiveLocale))setLocale(stored as ActiveLocale)}catch{}},[]);
 const [showRules,setShowRules]=useState(false);
 const [skin,setSkin]=useState<WelcomeSkin>('regular');
 const [skinPickerOpen,setSkinPickerOpen]=useState(false);
 useEffect(()=>{try{
  const saved=localStorage.getItem('trivia-skin-v1');
  if(welcomeSkins.some(item=>item.id===saved))setSkin(saved as WelcomeSkin);
 }catch{}},[]);
 const chooseSkin=(next:WelcomeSkin)=>{
  setSkin(next);
  setSkinPickerOpen(false);
  try{localStorage.setItem('trivia-skin-v1',next)}catch{}
 };
 const w=dictionary[locale];
 const rtl=locale==='he'||locale==='ar';
 const chooseLanguage=(next:ActiveLocale)=>{
  setLocale(next);
  try{localStorage.setItem('trivia-language',next)}catch{}
 };
 return <main className={"trivia-welcome welcome-skin-"+skin} dir={rtl?'rtl':'ltr'} lang={locale}>
  <div className="welcome-atmosphere" aria-hidden="true"/>
  <header className="welcome-topbar">
   <div className="welcome-skin-control">
    <button type="button" className="welcome-skin-trigger" data-testid="welcome-skin-trigger"
      aria-label={skinLabels[locale].trigger} title={skinLabels[locale].trigger}
      aria-expanded={skinPickerOpen} aria-controls="welcome-skin-panel"
      onClick={()=>setSkinPickerOpen(open=>!open)}>
      <GameArt name="palette" size={22}/><strong className="welcome-skin-trigger-label">{skinLabels[locale].trigger}</strong>
    </button>
    {skinPickerOpen&&<div id="welcome-skin-panel" className="welcome-skin-panel" role="group" aria-label={skinLabels[locale].title}>
      <strong className="welcome-skin-title">{skinLabels[locale].title}</strong>
      <div className="welcome-skin-grid">
       {welcomeSkins.map(theme=><button key={theme.id} type="button" className="welcome-skin-option"
        data-testid={"welcome-skin-"+theme.id} aria-pressed={skin===theme.id}
        onClick={()=>chooseSkin(theme.id)}>
        <span className="welcome-skin-swatch" aria-hidden="true" style={{background:'linear-gradient(135deg,'+theme.colors.join(',')+')'}}/>
        <strong>{skinLabels[locale].names[theme.id]}</strong>
        {skin===theme.id&&<span className="welcome-skin-check" aria-hidden="true">✓</span>}
       </button>)}
      </div>
    </div>}
   </div>
   <div className="welcome-brand"><TriviaMark size={44} label={w.brand}/><strong>{w.brand}</strong></div>
   <div className="welcome-language-select">
    <label htmlFor="welcome-language">{locale==='he'?'שפה':locale==='ar'?'اللغة':locale==='es'?'Idioma':'Language'}</label>
    <select id="welcome-language" value={locale} onChange={e=>chooseLanguage(e.target.value as ActiveLocale)}>
     {locales.map(l=><option key={l} value={l}>{l==='he'?'עברית':l==='en'?'English':l==='ru'?'Русский':l==='fr'?'Français':l==='ar'?'العربية':'Español'}</option>)}
    </select>
   </div>
  </header>
  <section className="welcome-hero" aria-label={w.brand}>
   <div className="welcome-copy">
    <span className="welcome-kicker">{w.eyebrow}</span>
    <h1><span>{w.titleA}</span><span className="welcome-highlight">{w.titleB}</span></h1>
    <p className="welcome-intro">{w.subtitle}</p>
    <div className="welcome-actions">
     <button className="welcome-start" type="button" onClick={onStart}>{w.start}<GameArt name="play" size={20}/></button>
     <button className="welcome-learn" type="button" aria-expanded={showRules} aria-controls="welcome-instructions"
       onClick={()=>setShowRules(x=>!x)}>{w.learn}<GameArt name="help" size={20}/></button>
    </div>
    {showRules&&<div id="welcome-instructions" className="welcome-instructions" role="region">
      <p>{w.instructions}</p><button type="button" onClick={()=>setShowRules(false)}>{w.close}</button>
    </div>}
    <p className="welcome-promise">{w.hint}</p>
   </div>
   <div className="welcome-game-art" role="img" aria-label={w.preview}>
    <div className="welcome-art-glow" aria-hidden="true"/>
    <svg className="welcome-board-visual" viewBox="0 0 540 500" aria-hidden="true" focusable="false">
      <defs>
       <radialGradient id="wl-dot" cx="36%" cy="30%" r="75%"><stop offset="0" stopColor="#FFFFFF"/><stop offset=".38" stopColor="#EEF3FF"/><stop offset=".82" stopColor="#A9BDEB"/><stop offset="1" stopColor="#7186C2"/></radialGradient>
       <linearGradient id="wl-glass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFFFFF" stopOpacity=".16"/><stop offset="1" stopColor="#FFFFFF" stopOpacity=".05"/></linearGradient>
       <linearGradient id="wl-tray" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#03061A" stopOpacity=".85"/><stop offset="1" stopColor="#0B1238" stopOpacity=".7"/></linearGradient>
       <linearGradient id="wl-liquid" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FF86A2"/><stop offset="1" stopColor="#D9305A"/></linearGradient>
       <clipPath id="wl-cell"><rect x="326" y="109" width="75" height="75" rx="16"/></clipPath>
      </defs>
      <rect x="62" y="32" width="416" height="436" rx="46" fill="url(#wl-glass)" stroke="#FFFFFF" strokeOpacity=".16"/>
      <rect x="92" y="62" width="356" height="356" rx="34" fill="url(#wl-tray)"/>
       <rect x="139" y="109" width="75" height="75" rx="16" fill="#3EE6A8" fillOpacity=".09" stroke="#3EE6A8" strokeOpacity=".22"/>
       <rect x="232" y="109" width="76" height="75" rx="16" fill="#3EE6A8" fillOpacity=".09" stroke="#3EE6A8" strokeOpacity=".22"/>
       <rect x="139" y="202" width="75" height="76" rx="16" fill="#3EE6A8" fillOpacity=".09" stroke="#3EE6A8" strokeOpacity=".22"/>
       <rect x="232" y="202" width="76" height="76" rx="16" fill="#3EE6A8" fillOpacity=".09" stroke="#3EE6A8" strokeOpacity=".22"/>
       <rect x="326" y="202" width="75" height="76" rx="16" fill="#3EE6A8" fillOpacity=".09" stroke="#3EE6A8" strokeOpacity=".22"/>
       <rect x="139" y="296" width="75" height="75" rx="16" fill="#3EE6A8" fillOpacity=".09" stroke="#3EE6A8" strokeOpacity=".22"/>
       <rect x="232" y="296" width="76" height="75" rx="16" fill="#3EE6A8" fillOpacity=".09" stroke="#3EE6A8" strokeOpacity=".22"/>
       <rect x="326" y="296" width="75" height="75" rx="16" fill="#3EE6A8" fillOpacity=".09" stroke="#3EE6A8" strokeOpacity=".22"/>
      <g className="welcome-square-fill" clipPath="url(#wl-cell)">
       <rect x="326" y="109" width="75" height="75" fill="url(#wl-liquid)"/>
       <path d="M320 128 Q338 118 356 128 T392 128 T428 128 V112 H320Z" fill="#FFB3C6" opacity=".55"/>
       <circle cx="345" cy="165" r="5" fill="#FFFFFF" opacity=".45"/><circle cx="378" cy="150" r="3.5" fill="#FFFFFF" opacity=".4"/>
       <image href="/art/fox.webp" x="335" y="117" width="58" height="58"/>
      </g>
       <line x1="317" y1="100" x2="410" y2="100" stroke="#FF4F7B" strokeWidth="30" strokeOpacity=".2" strokeLinecap="round"/>
       <line x1="317" y1="103" x2="410" y2="103" stroke="#02061A" strokeOpacity=".5" strokeWidth="16" strokeLinecap="round"/>
       <line className="welcome-drawn-edge" x1="317" y1="100" x2="410" y2="100" stroke="#FF4F7B" strokeWidth="16" strokeLinecap="round"/>
       <line x1="317" y1="97" x2="410" y2="97" stroke="#FFFFFF" strokeOpacity=".5" strokeWidth="4" strokeLinecap="round"/>
       <line x1="410" y1="100" x2="410" y2="193" stroke="#FF4F7B" strokeWidth="30" strokeOpacity=".2" strokeLinecap="round"/>
       <line x1="410" y1="103" x2="410" y2="196" stroke="#02061A" strokeOpacity=".5" strokeWidth="16" strokeLinecap="round"/>
       <line className="welcome-drawn-edge" x1="410" y1="100" x2="410" y2="193" stroke="#FF4F7B" strokeWidth="16" strokeLinecap="round"/>
       <line x1="410" y1="97" x2="410" y2="190" stroke="#FFFFFF" strokeOpacity=".5" strokeWidth="4" strokeLinecap="round"/>
       <line x1="317" y1="193" x2="410" y2="193" stroke="#FF4F7B" strokeWidth="30" strokeOpacity=".2" strokeLinecap="round"/>
       <line x1="317" y1="196" x2="410" y2="196" stroke="#02061A" strokeOpacity=".5" strokeWidth="16" strokeLinecap="round"/>
       <line className="welcome-drawn-edge" x1="317" y1="193" x2="410" y2="193" stroke="#FF4F7B" strokeWidth="16" strokeLinecap="round"/>
       <line x1="317" y1="190" x2="410" y2="190" stroke="#FFFFFF" strokeOpacity=".5" strokeWidth="4" strokeLinecap="round"/>
       <line x1="317" y1="100" x2="317" y2="193" stroke="#FF4F7B" strokeWidth="30" strokeOpacity=".2" strokeLinecap="round"/>
       <line x1="317" y1="103" x2="317" y2="196" stroke="#02061A" strokeOpacity=".5" strokeWidth="16" strokeLinecap="round"/>
       <line className="welcome-drawn-edge" x1="317" y1="100" x2="317" y2="193" stroke="#FF4F7B" strokeWidth="16" strokeLinecap="round"/>
       <line x1="317" y1="97" x2="317" y2="190" stroke="#FFFFFF" strokeOpacity=".5" strokeWidth="4" strokeLinecap="round"/>
       <line x1="130" y1="287" x2="223" y2="287" stroke="#2EE6B8" strokeWidth="30" strokeOpacity=".2" strokeLinecap="round"/>
       <line x1="130" y1="290" x2="223" y2="290" stroke="#02061A" strokeOpacity=".5" strokeWidth="16" strokeLinecap="round"/>
       <line className="welcome-drawn-edge" x1="130" y1="287" x2="223" y2="287" stroke="#2EE6B8" strokeWidth="16" strokeLinecap="round"/>
       <line x1="130" y1="284" x2="223" y2="284" stroke="#FFFFFF" strokeOpacity=".5" strokeWidth="4" strokeLinecap="round"/>
       <line x1="223" y1="287" x2="223" y2="380" stroke="#2EE6B8" strokeWidth="30" strokeOpacity=".2" strokeLinecap="round"/>
       <line x1="223" y1="290" x2="223" y2="383" stroke="#02061A" strokeOpacity=".5" strokeWidth="16" strokeLinecap="round"/>
       <line className="welcome-drawn-edge" x1="223" y1="287" x2="223" y2="380" stroke="#2EE6B8" strokeWidth="16" strokeLinecap="round"/>
       <line x1="223" y1="284" x2="223" y2="377" stroke="#FFFFFF" strokeOpacity=".5" strokeWidth="4" strokeLinecap="round"/>
       <g><ellipse cx="130" cy="104" rx="12" ry="8" fill="#02061A" opacity=".55"/><circle cx="130" cy="100" r="12" fill="url(#wl-dot)"/><circle cx="126" cy="96" r="3.4" fill="#FFFFFF" opacity=".95"/></g>
       <g><ellipse cx="223" cy="104" rx="12" ry="8" fill="#02061A" opacity=".55"/><circle cx="223" cy="100" r="12" fill="url(#wl-dot)"/><circle cx="219" cy="96" r="3.4" fill="#FFFFFF" opacity=".95"/></g>
       <g><ellipse cx="317" cy="104" rx="12" ry="8" fill="#02061A" opacity=".55"/><circle cx="317" cy="100" r="12" fill="url(#wl-dot)"/><circle cx="313" cy="96" r="3.4" fill="#FFFFFF" opacity=".95"/></g>
       <g><ellipse cx="410" cy="104" rx="12" ry="8" fill="#02061A" opacity=".55"/><circle cx="410" cy="100" r="12" fill="url(#wl-dot)"/><circle cx="406" cy="96" r="3.4" fill="#FFFFFF" opacity=".95"/></g>
       <g><ellipse cx="130" cy="197" rx="12" ry="8" fill="#02061A" opacity=".55"/><circle cx="130" cy="193" r="12" fill="url(#wl-dot)"/><circle cx="126" cy="189" r="3.4" fill="#FFFFFF" opacity=".95"/></g>
       <g><ellipse cx="223" cy="197" rx="12" ry="8" fill="#02061A" opacity=".55"/><circle cx="223" cy="193" r="12" fill="url(#wl-dot)"/><circle cx="219" cy="189" r="3.4" fill="#FFFFFF" opacity=".95"/></g>
       <g><ellipse cx="317" cy="197" rx="12" ry="8" fill="#02061A" opacity=".55"/><circle cx="317" cy="193" r="12" fill="url(#wl-dot)"/><circle cx="313" cy="189" r="3.4" fill="#FFFFFF" opacity=".95"/></g>
       <g><ellipse cx="410" cy="197" rx="12" ry="8" fill="#02061A" opacity=".55"/><circle cx="410" cy="193" r="12" fill="url(#wl-dot)"/><circle cx="406" cy="189" r="3.4" fill="#FFFFFF" opacity=".95"/></g>
       <g><ellipse cx="130" cy="291" rx="12" ry="8" fill="#02061A" opacity=".55"/><circle cx="130" cy="287" r="12" fill="url(#wl-dot)"/><circle cx="126" cy="283" r="3.4" fill="#FFFFFF" opacity=".95"/></g>
       <g><ellipse cx="223" cy="291" rx="12" ry="8" fill="#02061A" opacity=".55"/><circle cx="223" cy="287" r="12" fill="url(#wl-dot)"/><circle cx="219" cy="283" r="3.4" fill="#FFFFFF" opacity=".95"/></g>
       <g><ellipse cx="317" cy="291" rx="12" ry="8" fill="#02061A" opacity=".55"/><circle cx="317" cy="287" r="12" fill="url(#wl-dot)"/><circle cx="313" cy="283" r="3.4" fill="#FFFFFF" opacity=".95"/></g>
       <g><ellipse cx="410" cy="291" rx="12" ry="8" fill="#02061A" opacity=".55"/><circle cx="410" cy="287" r="12" fill="url(#wl-dot)"/><circle cx="406" cy="283" r="3.4" fill="#FFFFFF" opacity=".95"/></g>
       <g><ellipse cx="130" cy="384" rx="12" ry="8" fill="#02061A" opacity=".55"/><circle cx="130" cy="380" r="12" fill="url(#wl-dot)"/><circle cx="126" cy="376" r="3.4" fill="#FFFFFF" opacity=".95"/></g>
       <g><ellipse cx="223" cy="384" rx="12" ry="8" fill="#02061A" opacity=".55"/><circle cx="223" cy="380" r="12" fill="url(#wl-dot)"/><circle cx="219" cy="376" r="3.4" fill="#FFFFFF" opacity=".95"/></g>
       <g><ellipse cx="317" cy="384" rx="12" ry="8" fill="#02061A" opacity=".55"/><circle cx="317" cy="380" r="12" fill="url(#wl-dot)"/><circle cx="313" cy="376" r="3.4" fill="#FFFFFF" opacity=".95"/></g>
       <g><ellipse cx="410" cy="384" rx="12" ry="8" fill="#02061A" opacity=".55"/><circle cx="410" cy="380" r="12" fill="url(#wl-dot)"/><circle cx="406" cy="376" r="3.4" fill="#FFFFFF" opacity=".95"/></g>
    </svg>
    <div className="welcome-art-tag" aria-hidden="true">TRIVIA SQUARES</div>
   </div>
  </section>
  <div className="welcome-features" aria-label={w.level}>
   <div><GameArt name="marker" size={26}/><strong>{w.step1}</strong></div>
   <div><GameImage name="bulb" size={28}/><strong>{w.step2}</strong></div>
   <div><GameImage name="trophy" size={28}/><strong>{w.step3}</strong></div>
  </div>
  <footer className="welcome-footer"><span>{w.footer}</span><div>
    <a href={locale==='he'?'/privacy':'/en/privacy'}>{locale==='he'?'פרטיות':'Privacy'}</a>
    <a href={locale==='he'?'/accessibility':'/en/accessibility'}>{locale==='he'?'נגישות':'Accessibility'}</a>
  </div></footer>
 </main>;
}
