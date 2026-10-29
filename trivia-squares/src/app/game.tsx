'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

type Side = 'host' | 'guest' | 'bot';
type Mode = 'bot' | 'online' | 'local';
type Question = { text: string; answers: string[]; edge: string };
type GameState = {
  rows: number;
  cols: number;
  mode: Mode;
  turn: Side;
  edges: Record<string, Side>;
  owners: Record<string, Side>;
  scores: Record<Side, number>;
};
type RemoteMatch = { id: string; status: string; host_id: string; guest_id: string | null; version: number; state: GameState; question?: Question };
type Profile = { display_name: string; color: string; avatar: string; remember_color: boolean };
type Progress = { level: number; fruits: number; diamonds: number; credits: number; hearts: number };

const palettes = ['#358CFF', '#F97316', '#A855F7', '#10B981', '#EC4899', '#EAB308', '#EF4444', '#06B6D4'];
const avatars = ['🦊', '🦁', '🐼', '🐲', '🦄', '👑', '🚀', '⭐'];
const practiceQuestions = [
  { text: 'מהי בירת אוסטרליה?', answers: ['סידני', 'מלבורן', 'קנברה', 'פרת'], correct: 2 },
  { text: 'איזה יסוד מסומן באות O?', answers: ['חמצן', 'ברזל', 'מימן', 'זהב'], correct: 0 },
  { text: 'כמה דקות יש בשעה?', answers: ['30', '45', '60', '90'], correct: 2 },
  { text: 'איזו יבשת כוללת את יפן?', answers: ['אירופה', 'אסיה', 'אפריקה', 'אמריקה'], correct: 1 }
];
const empty = (size: number): GameState => ({ rows: size, cols: size, mode: 'local', turn: 'host', edges: {}, owners: {}, scores: { host: 0, guest: 0, bot: 0 } });
const css = {
  main: { maxWidth: 1100, margin: 'auto', padding: '16px' } as React.CSSProperties,
  panel: { background: '#182858', border: '1px solid #5168A9', boxShadow: '0 15px 40px #080f2688', borderRadius: 22, padding: 18 } as React.CSSProperties,
  button: { padding: '12px 16px', background: '#FFDC5B', color: '#17244E', border: 0, borderRadius: 11, fontWeight: 900, cursor: 'pointer' } as React.CSSProperties,
  secondary: { padding: '12px 16px', background: '#334F91', color: '#FFFFFF', border: '1px solid #6A87C4', borderRadius: 11, fontWeight: 900, cursor: 'pointer' } as React.CSSProperties,
  input: { display: 'block', width: '100%', padding: 11, borderRadius: 9, border: '2px solid #B7C7F6', background: '#FFFFFF', color: '#102048', fontWeight: 800, marginTop: 5 } as React.CSSProperties
};
function copyState(s: GameState, edge: string, correct: boolean) {
  if (s.edges[edge]) return s;
  if (!correct) return { ...s, turn: (s.turn === 'host' ? 'guest' : 'host') as Side };
  const edges = { ...s.edges, [edge]: s.turn };
  const owners = { ...s.owners };
  const scores = { ...s.scores };
  let gained = 0;
  for (let r = 0; r < s.rows; r++) for (let c = 0; c < s.cols; c++) {
    const k = r + '-' + c;
    if (owners[k]) continue;
    if (edges['h-' + r + '-' + c] && edges['h-' + (r + 1) + '-' + c] && edges['v-' + r + '-' + c] && edges['v-' + r + '-' + (c + 1)]) {
      owners[k] = s.turn;
      gained++;
    }
  }
  scores[s.turn] += gained;
  return { ...s, edges, owners, scores, turn: (gained ? s.turn : s.turn === 'host' ? 'guest' : 'host') as Side };
}
function sound(gained: number) {
  if (typeof window === 'undefined') return;
  try {
    const AC = window.AudioContext;
    const ctx = new AC();
    const tones = gained > 1 ? [523, 659, 784, 1047] : [523, 659, 784];
    tones.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const amp = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      amp.gain.setValueAtTime(0.0001, ctx.currentTime + i * .095);
      amp.gain.exponentialRampToValueAtTime(.18, ctx.currentTime + i * .095 + .015);
      amp.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime + i * .095 + .28);
      osc.connect(amp).connect(ctx.destination);
      osc.start(ctx.currentTime + i * .095);
      osc.stop(ctx.currentTime + i * .095 + .3);
    });
    void window.setTimeout(() => { void ctx.close(); }, 1300);
  } catch { /* sound is optional */ }
}
export default function TriviaGame() {
  const client = useMemo<SupabaseClient | null>(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    return url && key ? createClient(url, key) : null;
  }, []);
  const [user, setUser] = useState<User | null>(null);
  const [mode, setMode] = useState<Mode>('bot');
  const [size, setSize] = useState(3);
  const [local, setLocal] = useState<GameState>(() => empty(3));
  const [remote, setRemote] = useState<RemoteMatch | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [edge, setEdge] = useState<string | null>(null);
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [name, setName] = useState('שחקן');
  const [color, setColor] = useState('#358CFF');
  const [avatar, setAvatar] = useState('🦊');
  const [remember, setRemember] = useState(false);
  const [progress, setProgress] = useState<Progress>({ level: 1, fruits: 0, diamonds: 0, credits: 0, hearts: 3 });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('בחר מצב משחק והתחל');
  const [busy, setBusy] = useState(false);
  const [muted, setMuted] = useState(false);
  const [invite, setInvite] = useState<string | null>(null);
  const botBusy = useRef(false);
  const state = remote?.state || local;
  const player = user?.id && remote?.guest_id === user.id ? 'guest' : 'host';
  const onlineTurn = remote?.state.mode === 'local' || player === state.turn;
  const canPlay = remote ? remote.status === 'playing' && onlineTurn && !busy : !busy;
  const finished = Object.keys(state.owners).length === state.rows * state.cols;

  const refresh = useCallback(async (id: string) => {
    if (!client) return;
    const { data, error } = await client.rpc('trivia_get_match', { p_match: id });
    if (!error && data) {
      const m = data as RemoteMatch;
      setRemote(prev => prev && prev.version > m.version ? prev : m);
      setQuestion(m.question || null);
      if (m.status === 'completed') setMessage('המשחק הסתיים, כל הכבוד!');
    } else if (error) setMessage('שגיאת טעינת משחק: ' + error.message);
  }, [client]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('trivia-personal-choice');
      if (saved) {
        const v = JSON.parse(saved) as { color: string; avatar: string };
        if (palettes.includes(v.color)) setColor(v.color);
        if (avatars.includes(v.avatar)) setAvatar(v.avatar);
        setRemember(true);
      }
    } catch { /* storage may be disabled */ }
    if (!client) return;
    void client.auth.getUser().then(({ data }) => setUser(data.user));
    const { data } = client.auth.onAuthStateChange((_event, session) => setUser(session?.user || null));
    return () => data.subscription.unsubscribe();
  }, [client]);
  useEffect(() => {
    if (!client || !user) return;
    void (async () => {
      const { data } = await client.rpc('trivia_my_profile');
      if (data?.profile) {
        const p = data.profile as Profile;
        setName(p.display_name);
        if (p.remember_color) { setColor(p.color); setAvatar(p.avatar); setRemember(true); }
        setProgress(data.progress as Progress);
      }
      const id = localStorage.getItem('trivia-match-' + user.id);
      if (id) await refresh(id);
      const room = new URLSearchParams(window.location.search).get('room');
      if (room && /^[a-f0-9-]{36}$/i.test(room)) setInvite(room);
    })();
  }, [client, user, refresh]);
  useEffect(() => {
    if (!remote || remote.status !== 'playing' || !client) return;
    const timer = window.setInterval(() => { void refresh(remote.id); }, 2300);
    return () => window.clearInterval(timer);
  }, [client, remote?.id, remote?.status, refresh]);
  useEffect(() => {
    if (!client || !remote || remote.status !== 'playing' || remote.state.mode !== 'bot' || remote.state.turn !== 'bot' || botBusy.current) return;
    botBusy.current = true;
    void client.rpc('trivia_bot_step', { p_match: remote.id }).then(async ({ data, error }) => {
      if (error) setMessage(error.message);
      else if (data) {
        if ((data.gained || 0) > 0 && !muted) sound(data.gained);
        await refresh(remote.id);
      }
      botBusy.current = false;
    });
  }, [client, remote?.id, remote?.version, remote?.state.turn, remote?.status, refresh, muted]);

  async function start() {
    setBusy(true); setQuestion(null); setEdge(null);
    if (client && user) {
      const { data, error } = await client.rpc('trivia_create_match', { p_mode: mode, p_size: size });
      if (error) setMessage(error.message);
      else if (data) {
        const id = String(data);
        localStorage.setItem('trivia-match-' + user.id, id);
        await refresh(id);
        setMessage(mode === 'online' ? 'החדר נפתח. שלח את הקישור לחבר' : 'המשחק התחיל!');
      }
    } else if (mode === 'local') {
      setRemote(null); setLocal(empty(size)); setMessage('משחק מקומי. כל קו מחייב תשובה נכונה.');
    } else setMessage('למשחק מול מחשב או אונליין יש להתחבר לחשבון.');
    setBusy(false);
  }
  async function join() {
    if (!client || !user || !invite) return;
    setBusy(true);
    const { error } = await client.rpc('trivia_join_match', { p_match: invite });
    if (error) setMessage(error.message);
    else { localStorage.setItem('trivia-match-' + user.id, invite); await refresh(invite); setInvite(null); setMessage('הצטרפת למשחק!'); }
    setBusy(false);
  }
  async function pick(key: string) {
    if (!canPlay || finished || state.edges[key] || question) return;
    if (remote && client) {
      setBusy(true);
      const { data, error } = await client.rpc('trivia_choose_edge', { p_match: remote.id, p_edge: key });
      if (error) setMessage(error.message);
      else { setEdge(key); setQuestion(data as Question); }
      setBusy(false);
    } else {
      setEdge(key);
      const q = practiceQuestions[practiceIndex % practiceQuestions.length];
      setQuestion({ text: q.text, answers: q.answers, edge: key });
    }
  }
  async function answer(i: number) {
    if (!question || !edge || busy) return;
    setBusy(true);
    if (remote && client) {
      const { data, error } = await client.rpc('trivia_answer', { p_match: remote.id, p_answer: i });
      if (error) setMessage(error.message);
      else {
        const gained = Number(data.gained || 0);
        if (gained > 0 && !muted) sound(gained);
        setMessage(data.correct ? gained ? 'מצוין! כבשת ' + gained + ' ריבועים!' : 'תשובה נכונה, הקו שלך!' : 'תשובה שגויה, התור עובר.');
        setQuestion(null); setEdge(null);
        await refresh(remote.id);
      }
    } else {
      const q = practiceQuestions[practiceIndex % practiceQuestions.length];
      const correct = i === q.correct;
      const next = copyState(local, edge, correct);
      setLocal(next);
      const gained = Object.keys(next.owners).length - Object.keys(local.owners).length;
      if (gained && !muted) sound(gained);
      setMessage(correct ? gained ? 'סגרת ' + gained + ' ריבועים!' : 'תשובה נכונה!' : 'תשובה שגויה!');
      setQuestion(null); setEdge(null); setPracticeIndex(v => v + 1);
    }
    setBusy(false);
  }
  async function saveProfile() {
    if (remember) localStorage.setItem('trivia-personal-choice', JSON.stringify({ color, avatar }));
    else localStorage.removeItem('trivia-personal-choice');
    if (client && user) {
      const { error } = await client.rpc('trivia_save_profile', { p_name: name, p_color: color, p_avatar: avatar, p_remember: remember });
      setMessage(error ? error.message : 'הפרופיל נשמר!');
    } else setMessage('העדפות נשמרו במכשיר בלבד');
  }
  const colors: Record<Side, string> = { host: color, guest: '#FA9143', bot: '#FA9143' };
  const drawLine = (key: string, x1: number, y1: number, x2: number, y2: number) => {
    const owner = state.edges[key];
    return <g key={key}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={owner ? colors[owner] : '#7D96C4'} strokeWidth={owner ? 9 : 5} strokeLinecap='round' />
      {!owner && <line x1={x1} y1={y1} x2={x2} y2={y2} stroke='transparent' strokeWidth='26' tabIndex={canPlay ? 0 : -1} role='button' aria-label={'בחר קו ' + key} onClick={() => void pick(key)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); void pick(key); } }} style={{ cursor: canPlay ? 'pointer' : 'default' }} />}
    </g>;
  };
  const step = 288 / state.cols;
  const inviteLink = remote?.state.mode === 'online' ? typeof window !== 'undefined' ? window.location.origin + '/?room=' + remote.id : '' : '';
  return <main style={css.main}>
    <style>{`
      *{box-sizing:border-box} body{background:radial-gradient(circle at 15% 0%,#344995 0%,#172857 45%,#0C1536 100%);color:white;font-weight:800}
      button,input,select{font:inherit} button:focus-visible,input:focus-visible,select:focus-visible,[role=button]:focus-visible{outline:3px solid #FFE479;outline-offset:3px}
      .game-grid{display:grid;grid-template-columns:minmax(300px,1.55fr) minmax(290px,1fr);gap:18px}
      .answer-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
      .smalltxt{color:#DFE8FF;font-size:13px;font-weight:800}
      .choice{padding:8px 16px;background:#344E91;border:2px solid #6D8AD4;border-radius:10px;color:white;font-weight:900;cursor:pointer}
      .choice[aria-pressed=true]{border-color:#FFDF5C;box-shadow:0 0 0 2px #FFDF5C}
      .board{width:100%;max-width:550px;margin:0 auto;display:block;touch-action:manipulation}
      .footer{display:flex;gap:24px;justify-content:center;margin:30px 0 6px}
      .footer a{color:#E5ECFF;font-weight:900}
      @media(max-width:790px){.game-grid{grid-template-columns:1fr}.answer-grid{grid-template-columns:1fr 1fr}}
      @media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
    `}</style>
    <header style={{ textAlign: 'center', padding: '12px 0 20px' }}>
      <div style={{ color: '#FFE174', fontWeight: 900, letterSpacing: 1, fontSize: 12 }}>TRIVIA SQUARES • ADVENTURE</div>
      <h1 style={{ fontSize: 'clamp(30px,5vw,56px)', margin: 7, color: '#FFFFFF' }}>טריוויה ריבועים</h1>
      <p style={{ color: '#E5EBFF', margin: 5 }}>סוגרים ריבועים רק עם תשובה נכונה. מי שכובש יותר - מנצח!</p>
    </header>
    <div className='game-grid'>
      <section style={css.panel}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, paddingBottom: 14, alignItems: 'center' }}>
          <div style={{ padding: 10, background: '#304883', borderRadius: 12 }}>🔵 {state.scores.host} <span className='smalltxt'>שחקן 1</span></div>
          <div style={{ textAlign: 'center' }}><div className='smalltxt'>התור של</div><strong style={{ color: '#FFE174' }}>{state.turn === 'host' ? 'שחקן 1' : state.turn === 'bot' ? 'המחשב' : 'שחקן 2'}</strong></div>
          <div style={{ padding: 10, background: '#304883', borderRadius: 12 }}>🟠 {state.scores.bot + state.scores.guest} <span className='smalltxt'>יריב</span></div>
        </div>
        <svg viewBox='0 0 328 328' className='board' aria-label={'לוח המשחק עם ' + state.rows * state.cols + ' ריבועים'}>
          {Array.from({ length: state.rows }, (_, r) => Array.from({ length: state.cols }, (_, c) => {
            const owner = state.owners[r + '-' + c];
            return owner ? <g key={'cell-' + r + '-' + c}>
              <rect x={20 + c * step + 4} y={20 + r * step + 4} width={step - 8} height={step - 8} rx='9' fill={colors[owner]} opacity='.84' />
              <text x={20 + (c + .5) * step} y={28 + (r + .63) * step} textAnchor='middle' fontSize={step * .36} aria-hidden='true'>{owner === 'host' ? avatar : '🐲'}</text>
            </g> : null;
          }))}
          {Array.from({ length: state.rows + 1 }, (_, r) => Array.from({ length: state.cols }, (_, c) => drawLine('h-' + r + '-' + c, 20 + c * step, 20 + r * step, 20 + (c + 1) * step, 20 + r * step)))}
          {Array.from({ length: state.rows }, (_, r) => Array.from({ length: state.cols + 1 }, (_, c) => drawLine('v-' + r + '-' + c, 20 + c * step, 20 + r * step, 20 + c * step, 20 + (r + 1) * step)))}
          {Array.from({ length: state.rows + 1 }, (_, r) => Array.from({ length: state.cols + 1 }, (_, c) => <circle key={'dot-' + r + '-' + c} cx={20 + c * step} cy={20 + r * step} r='5' fill='#FFF' />))}
        </svg>
        <p aria-live='polite' style={{ minHeight: 30, textAlign: 'center', color: '#FFE479' }}>
          {finished ? 'נגמר המשחק! ' + (state.scores.host === state.scores.guest + state.scores.bot ? 'תיקו!' : state.scores.host > state.scores.guest + state.scores.bot ? 'שחקן 1 ניצח!' : 'היריב ניצח!') : message}
        </p>
        {remote?.status === 'waiting' && <p style={{ color: '#FFE479', textAlign: 'center' }}>ממתינים להצטרפות חבר למשחק...</p>}
        {question && <section style={{ background: '#314887', padding: 15, border: '2px solid #FFE174', borderRadius: 16, marginBottom: 12 }}>
          <div className='smalltxt'>שאלת טריוויה • ארבע תשובות</div>
          <h2 style={{ fontSize: 20, margin: '12px 0' }}>{question.text}</h2>
          <div className='answer-grid'>{question.answers.map((a, i) => <button key={i} disabled={busy} onClick={() => void answer(i)} style={css.button}>{a}</button>)}</div>
        </section>}
        <div style={{ display: 'flex', gap: 9, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button style={css.button} disabled={busy} onClick={() => void start()}>התחל משחק חדש</button>
          <button style={css.secondary} onClick={() => setMuted(m => !m)} aria-pressed={muted}>{muted ? '🔇 הפעל צלילים' : '🔊 השתק צלילים'}</button>
        </div>
      </section>
      <aside style={{ display: 'grid', gap: 16, alignContent: 'start' }}>
        <section style={css.panel}>
          <h2 style={{ margin: '0 0 12px' }}>🎮 בחר מצב משחק</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {([['bot', 'נגד מחשב'], ['online', 'נגד חבר'], ['local', 'על מכשיר אחד']] as const).map(([value, label]) => <button className='choice' key={value} aria-pressed={mode === value} onClick={() => setMode(value)}>{label}</button>)}
          </div>
          <div style={{ display: 'flex', gap: 9, alignItems: 'center', marginTop: 16 }}>
            <label htmlFor='board-size'>גודל לוח</label>
            <select id='board-size' value={size} onChange={e => setSize(Number(e.target.value))} style={css.input}>
              {[3, 4, 5, 6].map(s => <option value={s} key={s}>{s}×{s}</option>)}
            </select>
          </div>
          {inviteLink && <div style={{ marginTop: 12 }}>
            <div className='smalltxt'>קישור הזמנה לחבר</div>
            <button style={css.secondary} onClick={async () => { await navigator.clipboard.writeText(inviteLink); setMessage('קישור ההזמנה הועתק'); }}>העתק קישור לחדר</button>
          </div>}
          {invite && client && user && <button style={{ ...css.button, marginTop: 12 }} disabled={busy} onClick={() => void join()}>הצטרף לחדר שהוזמנת אליו</button>}
        </section>
        <section style={css.panel}>
          <h2 style={{ margin: '0 0 12px' }}>🎨 זהות השחקן</h2>
          <label htmlFor='player-name'>כינוי</label>
          <input id='player-name' value={name} onChange={e => setName(e.target.value)} maxLength={32} style={css.input} />
          <div style={{ marginTop: 13 }} className='smalltxt'>הצבע שלך</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 7 }}>
            {palettes.map(c => <button key={c} aria-label={'בחר צבע ' + c} aria-pressed={color === c} onClick={() => setColor(c)} style={{ width: 32, height: 32, background: c, border: color === c ? '3px solid white' : '2px solid #9BB1E4', borderRadius: '50%', cursor: 'pointer' }} />)}
          </div>
          <div style={{ marginTop: 13 }} className='smalltxt'>אוואטר על הריבועים שלך</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>{avatars.map(a => <button key={a} aria-label={'בחר אוואטר ' + a} aria-pressed={avatar === a} onClick={() => setAvatar(a)} style={{ background: avatar === a ? '#4766AB' : '#293E7E', border: avatar === a ? '2px solid #FFDF5C' : '1px solid #7891C8', padding: 6, fontSize: 22, borderRadius: 9, cursor: 'pointer' }}>{a}</button>)}</div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 9, margin: '12px 0' }}><input style={{ width: 18, height: 18 }} type='checkbox' checked={remember} onChange={e => setRemember(e.target.checked)} /> זכור את הצבע והאוואטר שלי</label>
          <button style={css.secondary} onClick={() => void saveProfile()}>שמור פרופיל</button>
        </section>
        <section style={css.panel}>
          <h2 style={{ margin: '0 0 10px' }}>💎 האוצר שלי</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {([['🍎', 'פירות', progress.fruits], ['💎', 'יהלומים', progress.diamonds], ['🪙', 'קרדיטים', progress.credits], ['❤️', 'לבבות', progress.hearts]] as const).map(([a, label, count]) => <div key={label} style={{ background: '#2E457F', borderRadius: 11, padding: 10 }}>{a} {label}: {count}</div>)}
          </div>
        </section>
        <section style={css.panel}>
          <h2 style={{ margin: '0 0 10px' }}>🔐 חשבון שחקן</h2>
          {user ? <><div className='smalltxt'>מחובר: {user.email}</div><button style={{ ...css.secondary, marginTop: 10 }} onClick={() => void client?.auth.signOut()}>התנתק</button></>
            : client ? <>
              <button style={css.button} onClick={() => void client.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/auth/callback' } })}>התחבר עם Google</button>
              <label htmlFor='login-email' style={{ display: 'block', marginTop: 12 }}>כתובת מייל</label><input id='login-email' type='email' style={css.input} autoComplete='email' value={email} onChange={e => setEmail(e.target.value)} />
              <label htmlFor='login-password' style={{ display: 'block', marginTop: 10 }}>סיסמה</label><input id='login-password' type='password' style={css.input} autoComplete='current-password' value={password} onChange={e => setPassword(e.target.value)} />
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button style={css.secondary} onClick={async () => { const { error } = await client.auth.signInWithPassword({ email, password }); setMessage(error?.message || 'התחברת בהצלחה'); }}>התחברות</button>
                <button style={css.secondary} onClick={async () => { const { error } = await client.auth.signUp({ email, password }); setMessage(error?.message || 'בדוק את המייל לאישור החשבון'); }}>הרשמה</button>
              </div>
            </> : <p className='smalltxt'>התחברות תופעל לאחר הגדרת משתני Supabase ב-Vercel.</p>}
        </section>
      </aside>
    </div>
    <footer className='footer'><a href='/privacy'>מדיניות פרטיות</a><a href='/terms'>תנאי שימוש</a><a href='/accessibility'>הצהרת נגישות</a></footer>
    <div className='smalltxt' style={{ textAlign: 'center', marginBottom: 15 }}>הפרסים הם וירטואליים בלבד. אין רכישות בכסף אמיתי.</div>
  </main>;
}
