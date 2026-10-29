'use client';
import {useEffect,useState} from 'react';
import {createClient} from '@supabase/supabase-js';
type Color='blue'|'orange';
type State={edges:Record<string,Color>,owners:Record<string,Color>,turn:Color,scores:Record<Color,number>};
const init=():State=>({edges:{},owners:{},turn:'blue',scores:{blue:0,orange:0}});
const questions=[
['מהי בירת אוסטרליה?','סידני','קנברה','מלבורן','פרת',1],
['כמה צלעות יש למשושה?','5','6','7','8',1],
['איזו פלנטה מכונה כוכב הלכת האדום?','נוגה','צדק','מאדים','שבתאי',2],
['כמה דקות יש בשעה?','30','50','60','90',2],
['מהו היסוד שסמלו O?','זהב','חמצן','מימן','ברזל',1]
] as const;
function closed(edges:State['edges'],r:number,c:number){return Boolean(edges[`h-${r}-${c}`]&&edges[`h-${r+1}-${c}`]&&edges[`v-${r}-${c}`]&&edges[`v-${r}-${c+1}`])}
export default function Page(){
 const [game,setGame]=useState<State>(init);const [chosen,setChosen]=useState('');const [q,setQ]=useState(0);const [color,setColor]=useState('#2563eb');const [avatar,setAvatar]=useState('🦊');const [message,setMessage]=useState('בחר קו כדי להתחיל');const [level,setLevel]=useState(3);const [user,setUser]=useState<any>(null);const [email,setEmail]=useState('');const [pass,setPass]=useState('');
 const client=typeof window!=='undefined'&&process.env.NEXT_PUBLIC_SUPABASE_URL&&process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY):null;
 useEffect(()=>{try{setColor(localStorage.getItem('trivia-color')||'#2563eb');setAvatar(localStorage.getItem('trivia-avatar')||'🦊')}catch{};if(client){client.auth.getUser().then(({data})=>setUser(data.user));const{data:sub}=client.auth.onAuthStateChange((_ev,session)=>setUser(session?.user||null));return()=>sub.subscription.unsubscribe()}},[]);
 function answer(i:number){const correct=i===questions[q%questions.length][5];setGame(prev=>{if(!chosen||prev.edges[chosen])return prev;if(!correct)return {...prev,turn:prev.turn==='blue'?'orange':'blue'};const next={...prev,edges:{...prev.edges,[chosen]:prev.turn},owners:{...prev.owners},scores:{...prev.scores}};let gain=0;for(let r=0;r<level;r++)for(let c=0;c<level;c++){const cell=`${r}-${c}`;if(!next.owners[cell]&&closed(next.edges,r,c)){next.owners[cell]=prev.turn;next.scores[prev.turn]++;gain++}}if(!gain)next.turn=prev.turn==='blue'?'orange':'blue';return next});setMessage(correct?'תשובה נכונה!':'תשובה שגויה, התור עובר');setChosen('');setQ(v=>v+1)}
 const rows=level,cell=290/rows;const all=Object.keys(game.owners).length===rows*rows;
 const btn={background:'#ffda4a',color:'#151b36',border:0,borderRadius:12,padding:'12px 16px',fontWeight:900,cursor:'pointer'} as const;
 return <main style={{maxWidth:1050,margin:'auto',padding:20}}><header style={{textAlign:'center'}}><h1 style={{fontSize:44,marginBottom:5}}>טריוויה ריבועים</h1><p>עונים נכון, סוגרים שטחים, מנצחים!</p></header><section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(310px,1fr))',gap:24}}>
 <article style={{background:'#223773',borderRadius:22,padding:20}}>
 <div style={{display:'flex',justifyContent:'space-between',marginBottom:12}}><b>כחול: {game.scores.blue}</b><b>התור: {game.turn==='blue'?'כחול':'כתום'}</b><b>כתום: {game.scores.orange}</b></div>
 <svg viewBox='0 0 330 330' width='100%' role='img' aria-label='לוח המשחק' style={{maxWidth:480}}>
 {Array.from({length:rows},(_,r)=>Array.from({length:rows},(_,c)=>game.owners[`${r}-${c}`]?<g key={`s${r}${c}`}><rect x={20+c*cell+5} y={20+r*cell+5} width={cell-10} height={cell-10} rx='8' fill={game.owners[`${r}-${c}`]==='blue'?color:'#fb923c'} opacity='.75'/><text x={20+(c+.5)*cell} y={25+(r+.58)*cell} fontSize={cell*.36} textAnchor='middle'>{avatar}</text></g>:null))}
 {Array.from({length:rows+1},(_,r)=>Array.from({length:rows},(_,c)=>{const k=`h-${r}-${c}`;return <line key={k} x1={20+c*cell} y1={20+r*cell} x2={20+(c+1)*cell} y2={20+r*cell} stroke={game.edges[k]==='blue'?color:game.edges[k]==='orange'?'#fb923c':'#647ca9'} strokeWidth='9' strokeLinecap='round' onClick={()=>!game.edges[k]&&setChosen(k)} style={{cursor:'pointer'}}/>}))}
 {Array.from({length:rows},(_,r)=>Array.from({length:rows+1},(_,c)=>{const k=`v-${r}-${c}`;return <line key={k} x1={20+c*cell} y1={20+r*cell} x2={20+c*cell} y2={20+(r+1)*cell} stroke={game.edges[k]==='blue'?color:game.edges[k]==='orange'?'#fb923c':'#647ca9'} strokeWidth='9' strokeLinecap='round' onClick={()=>!game.edges[k]&&setChosen(k)} style={{cursor:'pointer'}}/>}))}
 {Array.from({length:rows+1},(_,r)=>Array.from({length:rows+1},(_,c)=><circle key={`d${r}${c}`} cx={20+c*cell} cy={20+r*cell} r='5' fill='white'/>))}
 </svg>
 <p aria-live='polite'>{all?`המשחק הסתיים! ${game.scores.blue===game.scores.orange?'תיקו':game.scores.blue>game.scores.orange?'הכחול ניצח':'הכתום ניצח'}`:message}</p>
 <button style={btn} onClick={()=>{setGame(init());setChosen('')}}>משחק חדש</button>
 </article>
 <aside style={{background:'#223773',borderRadius:22,padding:20}}>
 <h2>עולם המשחק</h2><select value={level} onChange={e=>{setLevel(Number(e.target.value));setGame(init());setChosen('')}} style={{padding:12,borderRadius:9,color:'#111',fontWeight:800}}>{[3,4,5,6].map(n=><option value={n} key={n}>{n}×{n}</option>)}</select>
 <h2>התאמה אישית</h2><label>צבע שחקן <input type='color' value={color} onChange={e=>{setColor(e.target.value);localStorage.setItem('trivia-color',e.target.value)}}/></label><label>אוואטר <select value={avatar} onChange={e=>{setAvatar(e.target.value);localStorage.setItem('trivia-avatar',e.target.value)}}>{['🦊','🦁','🐼','🐲','👑','⭐'].map(x=><option key={x}>{x}</option>)}</select></label>
 {chosen?<section style={{background:'#354b95',padding:14,borderRadius:16}}><h2>שאלת טריוויה</h2><p>{questions[q%questions.length][0]}</p><div style={{display:'grid',gap:8}}>{questions[q%questions.length].slice(1,5).map((a,i)=><button key={i} style={btn} onClick={()=>answer(i)}>{a}</button>)}</div></section>:<p>בחר קו פנוי על הלוח כדי לענות על שאלה.</p>}
 <h2>כניסה לחשבון</h2>{user?<><p>מחובר: {user.email}</p><button style={btn} onClick={()=>client?.auth.signOut()}>התנתק</button></>:client?<><button style={btn} onClick={()=>client.auth.signInWithOAuth({provider:'google',options:{redirectTo:window.location.origin+'/auth/callback'}})}>התחבר עם Google</button><label>מייל<input value={email} onChange={e=>setEmail(e.target.value)} type='email'/></label><label>סיסמה<input type='password' value={pass} onChange={e=>setPass(e.target.value)}/></label><button style={btn} onClick={async()=>{const{error}=await client.auth.signInWithPassword({email,password:pass});setMessage(error?.message||'התחברת בהצלחה')}}>כניסה במייל</button> <button style={btn} onClick={async()=>{const{error}=await client.auth.signUp({email,password:pass});setMessage(error?.message||'נשלח אימות במייל')}}>הרשמה</button></>:<p>התחברות דורשת הגדרת Supabase ב-Vercel.</p>}
 </aside></section><footer style={{display:'flex',justifyContent:'center',gap:20,marginTop:24,flexWrap:'wrap'}}><a style={{color:'white'}} href='/privacy'>פרטיות</a><a style={{color:'white'}} href='/terms'>תנאי שימוש</a><a style={{color:'white'}} href='/accessibility'>נגישות</a></footer></main>
}
