import type { ReactNode } from 'react';

type Section = { heading: string; content: ReactNode };
export default function LegalArticle({title,updated,sections}:{title:string;updated:string;sections:Section[]}) {
  return <main style={{minHeight:'100vh',padding:'35px 16px',background:'radial-gradient(circle at top,#2D477F,#111A3A)',color:'#FFFFFF',fontFamily:'Arial,sans-serif',fontWeight:800}}>
    <article style={{maxWidth:850,margin:'auto',border:'1px solid #9BB8F477',background:'#182B59F5',borderRadius:23,padding:'clamp(17px,4vw,36px)',boxShadow:'0 12px 45px #0006'}}>
      <a href='/' style={{color:'#FFEB9D'}}>← חזרה למשחק</a>
      <h1 style={{fontSize:'clamp(28px,4vw,40px)',marginBottom:5}}>{title}</h1>
      <p style={{color:'#DCE8FF'}}>עודכן לאחרונה: {updated}</p>
      <p style={{background:'#3A4A75',border:'1px solid #EACB7A',color:'#FFF0BB',padding:12,borderRadius:10}}>
        המסמך נמצא בבחינה לקראת השקה. פרטי המפעיל והתקשרות, ההסדרים הנדרשים ובדיקות ההתאמה הסופיות יושלמו לפני פתיחה ציבורית.
      </p>
      {sections.map((s,i)=><section key={i} style={{borderTop:'1px solid #91ACDF44',padding:'13px 0',lineHeight:1.85}}>
        <h2 style={{fontSize:20,color:'#FFE28B',margin:'8px 0'}}>{s.heading}</h2><div style={{fontSize:15,color:'#EEF4FF'}}>{s.content}</div>
      </section>)}
      <a href='/' style={{color:'#FFEB9D'}}>חזרה למשחק</a>
    </article>
  </main>;
}
