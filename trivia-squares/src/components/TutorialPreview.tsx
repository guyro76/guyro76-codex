'use client';
import type {ActiveLocale} from '../lib/i18n';
import CaptureTile from './CaptureTile';

const demo:Record<ActiveLocale,{label:string;step:(page:number)=>string;alt:[string,string,string];question:string;answers:[string,string,string,string];player:string;caption:[string,string,string]}>={
 he:{label:'הדגמה בלבד. הלוח שעליו מציירים נמצא מאחורי חלון ההדרכה.',step:p=>'שלב הדרכה '+(p+1)+' מתוך 3',alt:['הדגמה: הטוש מחבר שתי נקודות סמוכות','הדגמה: מופיעות ארבע תשובות והתשובה הנכונה מסומנת','הדגמה: ריבוע שהושלם נצבע ומציג את סמל השחקן'],question:'מהי בירת צרפת?',answers:['לונדון','פריז','רומא','ברלין'],player:'שחקן',caption:['גררו אצבע או עכבר בין כל שתי נקודות סמוכות — בלי אלכסון.','כל קו חדש ותקין פותח שאלה עם טיימר.','סגרו ריבוע, צברו נקודה וגלו קלף אספנות.']},
 en:{label:'Demonstration only. The playable board is behind this guide.',step:p=>'Tutorial step '+(p+1)+' of 3',alt:['Demo: a marker draws horizontally between adjacent dots','Demo: four answers appear and one correct answer is highlighted','Demo: a completed square fills with player color and icon'],question:'What is the capital of France?',answers:['London','Paris','Rome','Berlin'],player:'Player',caption:['Slide a finger or mouse between neighboring dots — never diagonally.','Every valid new line opens a timed trivia question.','Complete the square to earn the point and reveal your collectible.']},
 ru:{label:'Это демонстрация. Игровое поле находится за окном инструкции.',step:p=>'Шаг '+(p+1)+' из 3',alt:['Демо: фломастер соединяет соседние точки','Демо: четыре ответа и правильный выделен','Демо: квадрат заполняется цветом и значком игрока'],question:'Какова столица Франции?',answers:['Лондон','Париж','Рим','Берлин'],player:'Игрок',caption:['Проведите пальцем или мышью между соседними точками — без диагоналей.','Каждая новая линия открывает вопрос с таймером.','Закройте квадрат, чтобы получить очко и коллекционную карту.']},
 fr:{label:'Démonstration uniquement. Le véritable plateau se trouve derrière cette fenêtre.',step:p=>'Étape '+(p+1)+' sur 3',alt:['Démo : le feutre relie deux points voisins','Démo : quatre réponses, la bonne est indiquée','Démo : une case se remplit de couleur'],question:'Quelle est la capitale de la France ?',answers:['Londres','Paris','Rome','Berlin'],player:'Joueur',caption:['Glissez le doigt ou la souris entre deux points voisins, jamais en diagonale.','Chaque nouvelle ligne ouvre une question chronométrée.','Fermez une case pour gagner un point et une carte.']},
 ar:{label:'عرض توضيحي فقط. لوحة اللعب خلف نافذة الإرشاد.',step:p=>'خطوة '+(p+1)+' من 3',alt:['رسم خط بين نقطتين متجاورتين','ظهور أربع إجابات وإبراز الصحيحة','ملء المربع بلون اللاعب ورمزه'],question:'ما عاصمة فرنسا؟',answers:['لندن','باريس','روما','برلين'],player:'لاعب',caption:['اسحب بالإصبع أو الفأرة بين نقطتين متجاورتين، دون خطوط قطرية.','يفتح كل خط جديد سؤالًا محدد الوقت.','أغلق مربعًا لتحصل على نقطة وبطاقة قابلة للجمع.']},
 es:{label:'Solo es una demostración. El tablero real está detrás de esta guía.',step:p=>'Paso '+(p+1)+' de 3',alt:['Demostración: el rotulador conecta dos puntos vecinos','Demostración: aparecen cuatro respuestas y se destaca la correcta','Demostración: se colorea una casilla con tu icono'],question:'¿Cuál es la capital de Francia?',answers:['Londres','París','Roma','Berlín'],player:'Jugador',caption:['Desliza el dedo o el ratón entre dos puntos vecinos, nunca en diagonal.','Cada nueva línea abre una pregunta de trivia con tiempo limitado.','Cierra una casilla para ganar un punto y descubrir tu carta coleccionable.']}
};

/** An illustration of real moves, not a second playable board or a stock video. */
export default function TutorialPreview({locale,page,color,avatar}:{locale:ActiveLocale;page:number;color:string;avatar:string}) {
 const t=demo[locale];
 return <div className='lumen-tutorial-preview' data-testid='tutorial-preview' data-locale={locale} data-step={page} key={page}>
  <p className='tutorial-demo-label'>{t.label}</p>
  <div className='lumen-tutorial-step-indicator' role='group' aria-label={t.step(page)}>
   {[0,1,2].map(i=><span key={i} className={i===page?'active':''} aria-hidden='true'/>)}
  </div>
  <svg viewBox='0 0 340 225' className='lumen-tutorial-visual' role='img' aria-label={
    t.alt[page as 0|1|2]
  }>
   <defs>
    <linearGradient id='tutSurface' x1='0' y1='0' x2='1' y2='1'><stop offset='0%' stopColor='#E3FCFF' stopOpacity='.19'/><stop offset='100%' stopColor='#7CC8EC' stopOpacity='.05'/></linearGradient>
    <pattern id='tutGrid' width='20' height='20' patternUnits='userSpaceOnUse'><path d='M20 0H0V20' fill='none' stroke='#D5F5FF' strokeOpacity='.22' strokeWidth='1'/></pattern>
    <linearGradient id='tutMarker' x1='0' y1='0' x2='1' y2='0'><stop stopColor='#FFF6C1'/><stop offset='100%' stopColor={color}/></linearGradient>
   </defs>
   <rect x='13' y='10' width='314' height='205' rx='22' fill='url(#tutSurface)' stroke='#D9F5FF' strokeOpacity='.52'/>
   <rect x='13' y='10' width='314' height='205' rx='22' fill='url(#tutGrid)'/>
   <path d='M35 28V197' stroke='#FF9EAC' strokeOpacity='.42' strokeWidth='2'/>
   {[0,1,2].flatMap(r=>[0,1,2].map(c=><g key={r+'-'+c}>
     <circle cx={80+c*90} cy={49+r*65} r='12' fill='#BCE0FF' fillOpacity='.2'/>
     <circle cx={80+c*90} cy={49+r*65} r='6' fill='#FFFDF5' stroke='#D4EFFF' strokeWidth='2'/>
    </g>))}
   {page===0&&<g>
     <path className='lumen-tutorial-ink' d='M80 49H170' stroke='url(#tutMarker)' strokeWidth='11' fill='none' strokeLinecap='round'/>
     <g className='lumen-tutorial-pen'><path d='M0 -21L11 -10L-7 13L-15 18L-11 7Z' fill='#FFF1BC' stroke='#BDA6FF' strokeWidth='2'/><path d='M-15 18L-11 7L-7 13Z' fill={color}/></g>
     <path d='M80 58H170' stroke='#FFFFFF' strokeDasharray='3 9' opacity='.24'/>
   </g>}
   {page===1&&<g>
     <path d='M80 49H170' stroke={color} strokeWidth='9' strokeLinecap='round'/>
     <rect x='40' y='78' width='260' height='110' rx='15' fill='#132953' fillOpacity='.94' stroke='#E6F7FF' strokeOpacity='.6'/>
     <text x='170' y='99' textAnchor='middle' fontFamily='Arial,sans-serif' fill='#FFECB5' fontSize='12' fontWeight='bold'>{t.question}</text>
     {['A','B','C','D'].map((v,i)=>{
       const labels=t.answers;
       const x=51+(i%2)*124,y=111+Math.floor(i/2)*33;
       return <g key={v} className={i===1?'lumen-tutorial-answer-correct':''}>
         <rect x={x} y={y} width='114' height='26' rx='8' fill={i===1?'#A2F4C5':'#D5E6FF'} stroke={i===1?'#FFFFFF':'#D5E6FF'} />
         <text x={x+57} y={y+18} textAnchor='middle' fontFamily='Arial,sans-serif' fill='#10234D' fontSize='12' fontWeight='bold'>{labels[i]}</text>
       </g>;
     })}
   </g>}
   {page===2&&<g>
     <path d='M80 49H170V114H80Z' stroke={color} strokeWidth='10' fill='none' strokeLinejoin='round' strokeLinecap='round'/>
     <CaptureTile row={0} col={0} x={90} y={59} width={70} height={45} color={color}
       name={t.player} icon={avatar} style='lumen' locale={locale} idPrefix='tutorial'/>
     <g className='lumen-tutorial-star' fill='#FFE8A0'><path d='M217 66l7 14 15 3-11 11 3 16-14-8-14 8 3-16-11-11 15-3z'/><circle cx='270' cy='151' r='4'/><circle cx='51' cy='155' r='3'/></g>
     <text x='226' y='130' fill='#FFE9B3' textAnchor='middle' fontFamily='Arial,sans-serif' fontWeight='900' fontSize='18'>+1</text>
   </g>}
  </svg>
  <p className='lumen-tutorial-step-caption'>
   {t.caption[page as 0|1|2]}
  </p>
 </div>;
}
