'use client';

import {useEffect,useState} from 'react';
import TriviaMark from './TriviaMark';
import type {ActiveLocale} from '../lib/i18n';
import './welcome-screen.css';

const locales=['he','en','ru','fr','ar','es'] as const;
const dictionary={
 he:{brand:'טריוויה ריבועים',eyebrow:'חושבים. מחברים. כובשים.',titleA:'כל קו הוא',titleB:'שאלת טריוויה.',subtitle:'חברו שתי נקודות כמו עם טוש, ענו נכון על שאלות מפתיעות וצבעו את הדרך לניצחון. כל ריבוע הוא הישג חדש.',start:'מתחילים לשחק',learn:'איך משחקים?',step1:'מחברים נקודות',step2:'עונים נכון',step3:'כובשים ריבוע',hint:'בלי להוריד אפליקציה · 100 שלבים · 6 שפות',level:'100 שלבי הרפתקה',topics:'תרבות, סדרות, ספורט ועוד',footer:'חשיבה חדה. משחק ממכר.',instructions:'גררו בין שתי נקודות סמוכות, בחרו תשובה מתוך ארבע אפשרויות וסגרו ריבוע כדי לצבור נקודות. לכל שלב יש לוח משלו.',close:'הבנתי',preview:'המחשת לוח המשחק'},
 en:{brand:'TRIVIA SQUARES',eyebrow:'THINK. CONNECT. CONQUER.',titleA:'Every line',titleB:'unlocks a question.',subtitle:'Draw between two dots with a marker, answer clever trivia, and color your way to victory. Every square is an achievement.',start:'Start playing',learn:'How to play?',step1:'Connect the dots',step2:'Answer correctly',step3:'Claim a square',hint:'No app download · 100 stages · 6 languages',level:'100 adventure stages',topics:'Pop culture, TV, sport & more',footer:'Sharp minds. Great games.',instructions:'Drag between adjacent dots, choose the right answer out of four, and close a square to earn points. Each stage has its own board.',close:'Got it',preview:'Game-board preview'},
 ru:{brand:'КВАДРАТЫ ВИКТОРИНЫ',eyebrow:'ДУМАЙ. СОЕДИНЯЙ. ПОБЕЖДАЙ.',titleA:'Каждая линия —',titleB:'новый вопрос.',subtitle:'Соединяйте точки, отвечайте на вопросы и закрашивайте квадраты на пути к победе.',start:'Начать игру',learn:'Как играть?',step1:'Соедините точки',step2:'Ответьте верно',step3:'Захватите квадрат',hint:'Без скачивания · 100 уровней · 6 языков',level:'100 уровней',topics:'Кино, музыка, спорт и не только',footer:'Думай и побеждай.',instructions:'Проведите линию между соседними точками, выберите верный ответ из четырёх и закройте квадрат, чтобы получить очки.',close:'Понятно',preview:'Предпросмотр поля'},
 fr:{brand:'TRIVIA SQUARES',eyebrow:'RÉFLÉCHIR. RELIER. CONQUÉRIR.',titleA:'Chaque ligne,',titleB:'une nouvelle question.',subtitle:'Reliez deux points comme au feutre, répondez à des questions et colorez les cases pour gagner.',start:'Commencer à jouer',learn:'Comment jouer ?',step1:'Relier deux points',step2:'Répondre juste',step3:'Gagner une case',hint:'Sans téléchargement · 100 niveaux · 6 langues',level:'100 niveaux',topics:'Films, séries, sport et plus',footer:'Réfléchissez. Jouez. Gagnez.',instructions:'Reliez deux points voisins, choisissez la bonne réponse parmi quatre choix et fermez une case pour gagner des points.',close:'Compris',preview:'Aperçu du plateau'},
 ar:{brand:'مربعات المعلومات',eyebrow:'فكّر. صِل. انتصر.',titleA:'كل خط يفتح',titleB:'سؤالاً جديداً.',subtitle:'صِل بين نقطتين كما لو كنت تستخدم قلم تلوين، وأجب عن أسئلة ممتعة ولوّن المربعات حتى الفوز.',start:'ابدأ اللعب',learn:'كيف ألعب؟',step1:'صل بين النقط',step2:'أجب بشكل صحيح',step3:'استحوذ على مربع',hint:'دون تحميل · 100 مرحلة · 6 لغات',level:'100 مرحلة',topics:'الأفلام والمسلسلات والرياضة والمزيد',footer:'فكّر والعب وانتصر.',instructions:'اسحب بين نقطتين متجاورتين، واختر الإجابة الصحيحة من أربعة خيارات، وأغلق مربعاً لكسب النقاط.',close:'فهمت',preview:'معاينة اللوحة'},
 es:{brand:'CUADRADOS DE TRIVIA',eyebrow:'PIENSA. CONECTA. CONQUISTA.',titleA:'Cada línea',titleB:'abre una pregunta.',subtitle:'Conecta dos puntos como con un rotulador, responde a preguntas sorprendentes y colorea casillas hasta alcanzar la victoria.',start:'Empezar a jugar',learn:'¿Cómo se juega?',step1:'Conecta puntos',step2:'Responde bien',step3:'Conquista una casilla',hint:'Sin descargas · 100 niveles · 6 idiomas',level:'100 niveles de aventura',topics:'Series, cine, música y deporte',footer:'Mentes despiertas. Juego brillante.',instructions:'Desliza entre dos puntos vecinos, elige la respuesta correcta entre cuatro opciones y cierra una casilla para ganar puntos. Cada nivel tiene su propio tablero.',close:'Entendido',preview:'Vista previa del tablero'}
} as const;

export default function WelcomeScreen({onStart,initialLocale='he'}:{onStart:()=>void;initialLocale?:ActiveLocale}){
 const [locale,setLocale]=useState<ActiveLocale>(initialLocale);
 useEffect(()=>{try{const stored=localStorage.getItem('trivia-language');if(locales.includes(stored as ActiveLocale))setLocale(stored as ActiveLocale)}catch{}},[]);
 const [showRules,setShowRules]=useState(false);
 const w=dictionary[locale];
 const rtl=locale==='he'||locale==='ar';
 const chooseLanguage=(next:ActiveLocale)=>{
  setLocale(next);
  try{localStorage.setItem('trivia-language',next)}catch{}
 };
 return <main className="trivia-welcome" dir={rtl?'rtl':'ltr'} lang={locale}>
  <div className="welcome-atmosphere" aria-hidden="true"/>
  <header className="welcome-topbar">
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
    <span className="welcome-kicker"><span className="welcome-kicker-star" aria-hidden="true">✦</span>{w.eyebrow}</span>
    <h1><span>{w.titleA}</span><span className="welcome-highlight">{w.titleB}</span></h1>
    <p className="welcome-intro">{w.subtitle}</p>
    <div className="welcome-actions">
     <button className="welcome-start" type="button" onClick={onStart}>{w.start}<span aria-hidden="true">✦</span></button>
     <button className="welcome-learn" type="button" aria-expanded={showRules} aria-controls="welcome-instructions"
       onClick={()=>setShowRules(x=>!x)}>{w.learn}<span aria-hidden="true">ⓘ</span></button>
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
       <linearGradient id="welcome-card" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#5D46C7"/><stop offset=".57" stopColor="#251C67"/><stop offset="1" stopColor="#161A4C"/></linearGradient>
       <linearGradient id="welcome-ink" x1="0" x2="1" y1="0" y2="0"><stop stopColor="#FFB461"/><stop offset=".5" stopColor="#FF6D81"/><stop offset="1" stopColor="#FFDA7B"/></linearGradient>
       <linearGradient id="welcome-spark" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#FFE8A0"/><stop offset="1" stopColor="#FF9F58"/></linearGradient>
       <filter id="welcome-glow"><feGaussianBlur stdDeviation="10"/></filter>
       <filter id="welcome-shadow" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="12" stdDeviation="19" floodColor="#04052A" floodOpacity=".5"/></filter>
       <pattern id="welcome-paper" width="27" height="27" patternUnits="userSpaceOnUse"><path d="M 27 0 L 0 0 0 27" fill="none" stroke="#D8CFFF" strokeOpacity=".13" strokeWidth="1"/></pattern>
      </defs>
      <circle cx="270" cy="250" r="220" fill="#D970FF" opacity=".19" filter="url(#welcome-glow)"/>
      <g filter="url(#welcome-shadow)" transform="translate(43 12) rotate(-5 235 230)">
       <rect x="25" y="20" width="430" height="440" rx="32" fill="url(#welcome-card)" stroke="#B4AAFF" strokeWidth="2"/>
       <rect x="39" y="35" width="401" height="410" rx="22" fill="url(#welcome-paper)"/>
       <rect x="100" y="92" width="280" height="290" rx="20" fill="#0C174A" stroke="#AE9FFF" strokeOpacity=".65" strokeWidth="2"/>
       <g stroke="#A8B8FF" strokeWidth="5" strokeOpacity=".33" strokeLinecap="round">
        <path d="M130 130H350M130 240H350M130 350H350M130 130V350M240 130V350M350 130V350"/>
       </g>
       <g className="welcome-square-fill">
        <rect x="131" y="131" width="108" height="108" rx="10" fill="#AE61DE" fillOpacity=".8"/>
        <path d="M185 150L192 174L215 185L192 193L185 216L176 193L155 185L176 174Z" fill="url(#welcome-spark)" stroke="#FFF1D0" strokeWidth="2"/>
       </g>
       <path className="welcome-drawn-edge" d="M240 130V240" stroke="#FF9D64" strokeWidth="12" strokeLinecap="round"/>
       <path className="welcome-drawn-edge" d="M130 240H240" stroke="url(#welcome-ink)" strokeWidth="12" strokeLinecap="round"/>
       <g fill="#EAF5FF" stroke="#7C73D5" strokeWidth="3.5">
        <circle cx="130" cy="130" r="10"/><circle cx="240" cy="130" r="10"/><circle cx="350" cy="130" r="10"/>
        <circle cx="130" cy="240" r="10"/><circle cx="240" cy="240" r="10"/><circle cx="350" cy="240" r="10"/>
        <circle cx="130" cy="350" r="10"/><circle cx="240" cy="350" r="10"/><circle cx="350" cy="350" r="10"/>
       </g>
       <g transform="translate(287 273)" className="welcome-pen">
        <path d="M0 0L33 -44L46 -35L11 8L0 14Z" fill="#FFB76D" stroke="#FFDDA3" strokeWidth="3" strokeLinejoin="round"/>
        <path d="M0 14L1 0L11 8Z" fill="#EBF6FF"/>
        <path d="M33 -44L41 -55L53 -46L46 -35Z" fill="#DE74E9"/>
       </g>
       <path d="M386 103L393 128L420 135L393 143L386 168L379 143L352 135L379 128Z" fill="#FFB76D" opacity=".88"/>
      </g>
    </svg>
    <div className="welcome-art-tag" aria-hidden="true"><span>✦</span> TRIVIA SQUARES <span>✦</span></div>
   </div>
  </section>
  <div className="welcome-features" aria-label={w.level}>
   <div><span aria-hidden="true">✎</span><strong>{w.step1}</strong></div>
   <div><span aria-hidden="true">?</span><strong>{w.step2}</strong></div>
   <div><span aria-hidden="true">▣</span><strong>{w.step3}</strong></div>
  </div>
  <footer className="welcome-footer"><span>{w.footer}</span><div>
    <a href={locale==='he'?'/privacy':'/en/privacy'}>{locale==='he'?'פרטיות':'Privacy'}</a>
    <a href={locale==='he'?'/accessibility':'/en/accessibility'}>{locale==='he'?'נגישות':'Accessibility'}</a>
  </div></footer>
 </main>;
}
