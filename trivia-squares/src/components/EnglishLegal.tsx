import type {ReactNode} from 'react';
type Kind='privacy'|'terms'|'accessibility'|'cookies';
type Section={heading:string;body:ReactNode};
const pages:Record<Kind,{title:string;intro:string;sections:Section[]}>={
 privacy:{
  title:'Privacy notice',intro:'Last updated 29 October 2026. Pre-launch draft: the operator identity and verified contact details must be completed before public release.',
  sections:[
   {heading:'Why and what we collect',body:'You can play locally without registering. Connected accounts use email, an account identifier, player name and selected style. Connected matches store the moves, results, earned virtual items and current progress. We record the time and version of terms accepted.'},
   {heading:'Is information optional?',body:'Yes: creating an online account is optional. If you decline account information, online multiplayer, online progress and connected rewards cannot operate, but local play remains available.'},
   {heading:'Suppliers and international data processing',body:'Supabase hosts authentication and private game records. Vercel hosts the website. Their operational security logs may contain device and access information. The full supplier, location, transfer and retention analysis remains a pre-launch action.'},
   {heading:'Your rights and how to contact us',body:'Account holders can export game records and submit a data-deletion request through My data. Requests must be reviewed and completed according to applicable laws. The legal operator name and contact email are not yet published: this is an outstanding public-launch requirement.'},
   {heading:'Children',body:'Independent connected accounts are currently intended for adults aged 18 and over. A younger player can use local play with adult supervision. Do not enter a child’s real name, school, address or sensitive information as a nickname.'},
   {heading:'Advertising and analytics',body:'This release does not enable advertising pixels, analytics trackers, marketing email or real-money purchasing. Any future use would require an updated notice and a suitable compliance process.'}
  ]
 },
 terms:{
  title:'Terms of use',intro:'Last updated 29 October 2026. This is a pre-launch draft and is not yet a final legal agreement.',
  sections:[
   {heading:'Game rules',body:'Draw a line between adjacent dots. Answer a trivia question correctly to claim the line. Completing squares awards points. Optional virtual rewards, collectible cards and between-stage mini-games are part of the experience.'},
   {heading:'Accounts and age',body:'Connected accounts require an adult 18+ confirmation and explicit acceptance of the current terms. Local play is available without creating an account. Accounts for children are not yet supported.'},
   {heading:'Virtual items',body:'Fruit, gems, credits, time charms and collectible cards are virtual game features only. They have no cash value. There is no real-money purchase or cash-out in this version.'},
   {heading:'Fair use',body:'Do not automate answers, manipulate game state, interfere with other players or use misleading account information. Server-enforced game actions may be rejected when they violate the rules.'},
   {heading:'Availability and service changes',body:'This application is under development, so features and availability may change. Do not rely on it for critical information. The operator and legal contact details must be published before a public commercial launch.'},
   {heading:'Privacy',body:'See the Privacy notice for the purpose and handling of personal data, and Cookies & storage for local device storage.'}
  ]
 },
 accessibility:{
  title:'Accessibility statement',intro:'Accessibility testing is ongoing. Automated checks alone cannot certify compliance or replace screen-reader and real-device testing.',
  sections:[
   {heading:'Current features',body:'The UI uses visible labels, keyboard-selectable dots, focusable controls, responsive layouts, reduced-motion support and a mute/volume control for original sounds. Hebrew is right-to-left and English is left-to-right.'},
   {heading:'Outstanding verification',body:'Before public release we must complete human testing with screen readers, actual mobile Safari, keyboard-only flow, large text, focus and timing alternatives, and correct any identified issues.'},
   {heading:'Alternative access',body:'The operator must publish a real accessibility contact method and provide an alternative route for users who cannot operate the game. Contact details are currently missing: public release is not yet approved.'}
  ]
 },
 cookies:{
  title:'Cookies and device storage',intro:'Last updated 29 October 2026.',
  sections:[
   {heading:'Local game storage',body:'The browser may store the local board, used question identifiers, player nickname, selected language, colour preferences, earned local collectibles, mute/volume settings and whether the tutorial has been shown.'},
   {heading:'Connected authentication',body:'Supabase Auth may store technically necessary session tokens in the browser. Supabase and Vercel may process service and security log entries.'},
   {heading:'Marketing tracking',body:'This release does not enable advertising pixels or optional analytics tracking. If optional tracking is introduced later, we will review its legal requirements before activation.'},
   {heading:'Deleting local records',body:'You can delete the game’s local information in your browser’s site-storage settings or use the local deletion control on the Hebrew Cookies & storage page. Connected account data requires separate handling through My data.'}
  ]
 }
};
export default function EnglishLegal({kind}:{kind:Kind}){
 const page=pages[kind];
 const linkColor='#FFE5A6';
 return <main lang='en' dir='ltr' style={{minHeight:'100vh',padding:'24px 14px',background:'radial-gradient(circle at top,#31538C,#101E3E 60%)',color:'#F5FAFF',fontFamily:'Arial,sans-serif'}}>
  <article style={{maxWidth:830,margin:'0 auto',background:'rgba(21,41,83,.78)',border:'1px solid #D9E8FF55',boxShadow:'0 18px 60px #0006',borderRadius:25,padding:'clamp(18px,4vw,35px)',lineHeight:1.7}}>
   <nav aria-label='Legal pages' style={{display:'flex',gap:12,flexWrap:'wrap',marginBottom:20}}>
    <a href='/' style={{color:linkColor}}>Game</a>
    <a href='/en/privacy' style={{color:linkColor}}>Privacy</a>
    <a href='/en/terms' style={{color:linkColor}}>Terms</a>
    <a href='/en/cookies' style={{color:linkColor}}>Cookies</a>
    <a href='/en/accessibility' style={{color:linkColor}}>Accessibility</a>
   </nav>
   <h1 style={{fontSize:'clamp(30px,5vw,42px)',fontWeight:900}}>{page.title}</h1>
   <p>{page.intro}</p>
   {page.sections.map(s=><section key={s.heading} style={{marginTop:20}}><h2 style={{fontSize:21,color:'#FFE6AA'}}>{s.heading}</h2><p>{s.body}</p></section>)}
   <p style={{marginTop:26}}>Data rights: <a href='/account/privacy' style={{color:linkColor}}>Account data management (currently in Hebrew)</a>.</p>
  </article>
 </main>;
}
