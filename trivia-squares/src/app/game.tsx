'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from '../lib/supabasePublicConfig';
import type { PointerEvent as ReactPointerEvent, KeyboardEvent as ReactKeyboardEvent } from 'react';
import { Dot, BoardPoint, dotXY, nearestDot, edgeBetween } from '../lib/dotDrawing';
import { applyLocalAnswer } from '../lib/engine';
import { playGameSound, type SoundCue } from '../lib/gameAudio';
import { offlineQuestions } from '../lib/offlineQuestions';

type Side = 'host' | 'guest' | 'bot';
type Mode = 'bot' | 'online' | 'local';
type Question = { text: string; answers: string[]; edge?: string; kind?: 'edge' | 'bonus' };
type GameState = {
  rows: number;
  cols: number;
  mode: Mode;
  turn: Side;
  edges: Record<string, Side>;
  owners: Record<string, Side>;
  scores: Record<Side, number>;
  streak?: Partial<Record<Side,number>>;
  bonus_ready?: Partial<Record<Side,boolean>>;
  bonus_tokens?: Partial<Record<Side,number>>;
};
type PlayerIdentity = { name: string; color: string; avatar: string };
type RemoteMatch = { id: string; status: string; host_id: string; guest_id: string | null; version: number; state: GameState; question?: Question; players?: { host?: PlayerIdentity; guest?: PlayerIdentity } };
type Profile = { display_name: string; color: string; avatar: string; remember_color: boolean };
type Progress = { level: number; fruits: number; diamonds: number; credits: number; hearts: number };

const palettes = ['#358CFF', '#F97316', '#A855F7', '#10B981', '#EC4899', '#EAB308', '#EF4444', '#06B6D4'];
const avatars = ['🦊', '🦁', '🐼', '🐲', '🦄', '👑', '🚀', '⭐'];
const worlds = [
  { size: 3, name: 'גן הפירות', subtitle: 'ההרפתקה מתחילה כאן', icon: '🍎', slug: 'orchard', badge: 'עולם 01', reward: 'פירות' },
  { size: 4, name: 'מכרות היהלומים', subtitle: 'גלו אוצרות מנצנצים', icon: '💎', slug: 'crystal', badge: 'עולם 02', reward: 'יהלומים' },
  { size: 5, name: 'ממלכת העננים', subtitle: 'הדרך עוברת בין הכוכבים', icon: '☁️', slug: 'clouds', badge: 'עולם 03', reward: 'בונוסים' },
  { size: 6, name: 'גלקסיית הכוכבים', subtitle: 'אתגר המאסטרים הגדול', icon: '🪐', slug: 'galaxy', badge: 'עולם 04', reward: 'גביעים' }
] as const;
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
export default function TriviaGame() {
  const client = useMemo<SupabaseClient | null>(() => {
    return createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
  }, []);
  const [user, setUser] = useState<User | null>(null);
  const [legalAccepted, setLegalAccepted] = useState(false);
  const [adultConfirmed, setAdultConfirmed] = useState(false);
  const [policiesAcknowledged, setPoliciesAcknowledged] = useState(false);
  const [legalBusy, setLegalBusy] = useState(false);
  const [mode, setMode] = useState<Mode>('local');
  const [size, setSize] = useState(3);
  const [local, setLocal] = useState<GameState>(() => empty(3));
  const [localReady, setLocalReady] = useState(false);
  const [online, setOnline] = useState(true);
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
  const [volume, setVolume] = useState(65);
  const play = useCallback((cue: SoundCue) => playGameSound(cue, { muted, volume: volume / 100 }), [muted, volume]);
  const [invite, setInvite] = useState<string | null>(null);
  const botBusy = useRef(false);
  const boardRef = useRef<SVGSVGElement>(null);
  const gesture = useRef<{ pointerId: number; start: Dot } | null>(null);
  const [trace, setTrace] = useState<{ start: Dot; target: BoardPoint; end: Dot | null; ink: BoardPoint[] } | null>(null);
  const [keyboardStart, setKeyboardStart] = useState<Dot | null>(null);
  const [bonusSelect, setBonusSelect] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialPage, setTutorialPage] = useState(0);
  const state = remote?.state || local;
  const player = user?.id && remote?.guest_id === user.id ? 'guest' : 'host';
  const onlineTurn = remote?.state.mode === 'local' || player === state.turn;
  const canPlay = remote ? Boolean(user) && legalAccepted && remote.status === 'playing' && onlineTurn && !busy : !busy;
  const finished = Object.keys(state.owners).length === state.rows * state.cols;
  const earnedBonus = Boolean(remote?.state.bonus_ready?.[state.turn]);
  const availableBonus = Number(remote?.state.bonus_tokens?.[state.turn] || 0);
  const streak = Number(remote?.state.streak?.[state.turn] || 0);
  const world = worlds.find(w => w.size === state.rows) || worlds[0];
  const completed = Object.keys(state.owners).length;
  const percent = Math.round(completed / (state.rows * state.cols) * 100);

  const refresh = useCallback(async (id: string) => {
    if (!client) return;
    const { data, error } = await client.rpc('trivia_get_match', { p_match: id });
    if (!error && data) {
      const m = data as RemoteMatch;
      setRemote(prev => prev && prev.version > m.version ? prev : m);
      setQuestion(m.question || null);
      setEdge(m.question?.edge || null);
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
    try {
      setMuted(localStorage.getItem('trivia-sound-muted') === 'true');
      const v=localStorage.getItem('trivia-sound-volume');
      if (v !== null && Number.isFinite(Number(v))) setVolume(Math.max(0,Math.min(100,Number(v))));
    } catch {}
    if (!localStorage.getItem('trivia-tutorial-seen-v1')) setShowTutorial(true);
    if (!client) return;
    void client.auth.getUser().then(({ data }) => setUser(data.user));
    const { data } = client.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (!session) { setLegalAccepted(false); setRemote(null); setQuestion(null); setEdge(null); setBonusSelect(false); }
    });
    return () => data.subscription.unsubscribe();
  }, [client]);
  useEffect(() => {
    try {
      const stored=localStorage.getItem('trivia-local-game-v1');
      if(stored){
        const value=JSON.parse(stored) as GameState;
        if(value && Number.isInteger(value.rows) && value.rows>=3 && value.rows<=6
          && value.cols===value.rows && value.edges && value.owners && value.scores){
          setLocal(value);
          setSize(value.rows);
        }
      }
    } catch { /* invalid save is ignored */ }
    setLocalReady(true);
    setOnline(navigator.onLine);
    const up=()=>setOnline(true);
    const down=()=>setOnline(false);
    window.addEventListener('online',up); window.addEventListener('offline',down);
    return ()=>{window.removeEventListener('online',up);window.removeEventListener('offline',down)};
  },[]);
  useEffect(() => {
    if(!localReady) return;
    try { localStorage.setItem('trivia-sound-muted', String(muted));localStorage.setItem('trivia-sound-volume', String(volume)); } catch {}
  }, [muted,volume,localReady]);
  useEffect(()=>{
    if(!localReady) return;
    try{localStorage.setItem('trivia-local-game-v1',JSON.stringify(local))}catch{}
  },[local,localReady]);

  useEffect(() => {
    if (!client || !user) return;
    let active = true;
    void (async () => {
      const room = new URLSearchParams(window.location.search).get('room');
      if (room && /^[a-f0-9-]{36}$/i.test(room)) setInvite(room);
      const { data: allowed, error } = await client.rpc('trivia_get_my_legal_acceptance');
      if (!active) return;
      if (error || allowed !== true) {
        setLegalAccepted(false);
        if (error) setMessage('בדיקת תנאי החשבון נכשלה. אפשר להמשיך במשחק מקומי.');
        return;
      }
      setLegalAccepted(true);
      const { data } = await client.rpc('trivia_my_profile');
      if (!active) return;
      if (data?.profile) {
        const p = data.profile as Profile;
        setName(p.display_name);
        if (p.remember_color) { setColor(p.color); setAvatar(p.avatar); setRemember(true); }
        if (data.progress) setProgress(data.progress as Progress);
      }
      const id = localStorage.getItem('trivia-match-' + user.id);
      if (id) await refresh(id);
    })();
    return () => { active = false; };
  }, [client, user, refresh, legalAccepted]);
  useEffect(() => {
    if (!remote || (remote.status !== 'playing' && remote.status !== 'waiting') || !client) return;
    const timer = window.setInterval(() => { void refresh(remote.id); }, 2300);
    return () => window.clearInterval(timer);
  }, [client, remote?.id, remote?.status, refresh]);
  useEffect(() => {
    if (!client || !remote || remote.status !== 'playing' || remote.state.mode !== 'bot' || remote.state.turn !== 'bot' || botBusy.current) return;
    botBusy.current = true;
    void client.rpc('trivia_bot_step', { p_match: remote.id }).then(async ({ data, error }) => {
      if (error) setMessage(error.message);
      else if (data) {
        if (data.finished) play('win');
        else if (Number(data.gained || 0) > 0) play('capture');
        else if (data.correct) play('turn');
        await refresh(remote.id);
      }
      botBusy.current = false;
    });
  }, [client, remote?.id, remote?.version, remote?.state.turn, remote?.status, refresh, play]);

  function hasPreRegistrationAcknowledgement() {
    if (adultConfirmed && policiesAcknowledged) return true;
    setMessage('הרשמה מחוברת מיועדת לבני 18 ומעלה. יש לקרוא את הודעת הפרטיות ואת תנאי השימוש ולסמן אישור לפני יצירת חשבון.');
    return false;
  }
  async function acceptCurrentPolicies() {
    if (!client || !user || !hasPreRegistrationAcknowledgement()) return;
    setLegalBusy(true);
    const { data, error } = await client.rpc('trivia_accept_current_policies', {
      p_adult: adultConfirmed,
      p_acknowledged: policiesAcknowledged
    });
    if (error || data !== true) setMessage(error?.message || 'לא ניתן להשלים את אישור התנאים.');
    else { setLegalAccepted(true); setMessage('אישור התנאים נשמר. אפשר להתחיל לשחק אונליין.'); }
    setLegalBusy(false);
  }
  async function start() {
    setBusy(true); setQuestion(null); setEdge(null); setBonusSelect(false);
    if (mode === 'local' && (!user || !legalAccepted)) {
      setRemote(null); setLocal(empty(size)); setMessage('משחק מקומי ללא הרשמה וללא שמירה בשרת.');
    } else if (client && user && legalAccepted) {
      const { data, error } = await client.rpc('trivia_create_match', { p_mode: mode, p_size: size });
      if (error) setMessage(error.message);
      else if (data) {
        const id = String(data);
        localStorage.setItem('trivia-match-' + user.id, id);
        await refresh(id);
        setMessage(mode === 'online' ? 'החדר נפתח. שלח את הקישור לחבר' : 'המשחק התחיל!');
      }
    } else setMessage('כדי לשחק מול מחשב או חבר נדרשת כניסה לחשבון ואישור תנאי השימוש. המשחק המקומי זמין ללא חשבון.');
    setBusy(false);
  }
  async function join() {
    if (!client || !user || !legalAccepted || !invite) { setMessage('יש להתחבר ולאשר את תנאי השימוש לפני הצטרפות לחדר.'); return; }
    setBusy(true);
    const { error } = await client.rpc('trivia_join_match', { p_match: invite });
    if (error) setMessage(error.message);
    else { localStorage.setItem('trivia-match-' + user.id, invite); await refresh(invite); setInvite(null); setMessage('הצטרפת למשחק!'); }
    setBusy(false);
  }
  async function pick(key: string) {
    if (!canPlay || finished || state.edges[key] || question || bonusSelect) return;
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
    if (!question || (question.kind !== 'bonus' && !edge) || busy) return;
    setBusy(true);
    if (remote && client) {
      const { data, error } = await client.rpc('trivia_answer', { p_match: remote.id, p_answer: i });
      if (error) setMessage(error.message);
      else {
        const gained = Number(data.gained || 0);
        if (data.finished) play('win');
        else if (data.bonus && data.correct) play('bonus');
        else if (gained) play('capture');
        else play(data.correct ? 'correct' : 'wrong');
        setMessage(data.bonus
          ? data.correct ? 'שאלת הזהב הצליחה! הרווחת שני אסימוני סגירה ✨' : 'שאלת הזהב הוחמצה. אפשר לנסות שוב אחרי רצף חדש.'
          : data.correct ? gained ? 'מצוין! כבשת ' + gained + ' ריבועים!' : 'תשובה נכונה, הקו שלך!' : 'תשובה שגויה, התור עובר.');
        setQuestion(null); setEdge(null);
        await refresh(remote.id);
        const { data: update } = await client.rpc('trivia_my_profile');
        if (update?.progress) setProgress(update.progress as Progress);
      }
    } else {
      if (!edge) { setBusy(false); return; }
      const q = practiceQuestions[practiceIndex % practiceQuestions.length];
      const correct = i === q.correct;
      const next = applyLocalAnswer(local, edge, correct);
      setLocal(next);
      const gained = Object.keys(next.owners).length - Object.keys(local.owners).length;
      if (Object.keys(next.owners).length===next.rows*next.cols) play('win');
      else if (gained) play('capture');
      else play(correct ? 'correct' : 'wrong');
      setMessage(correct ? gained ? 'סגרת ' + gained + ' ריבועים!' : 'תשובה נכונה!' : 'תשובה שגויה!');
      setQuestion(null); setEdge(null); setPracticeIndex(v => v + 1);
    }
    setBusy(false);
  }

  async function startGoldQuestion() {
    if (!client || !remote || !canPlay || !earnedBonus || question) return;
    setBusy(true);
    const { data, error } = await client.rpc('trivia_bonus_question',{p_match:remote.id});
    if (error) setMessage(error.message);
    else if (data) {
      setQuestion(data as Question);
      setEdge(null);
      setMessage('שאלת זהב! תשובה נכונה תעניק שתי סגירות בונוס.');
    }
    setBusy(false);
  }

  async function claimBonusSquare(r: number, c: number) {
    if (!client || !remote || !bonusSelect || !canPlay || question || finished) return;
    if (remote.state.owners[r+'-'+c]) return;
    setBusy(true);
    const {data,error}=await client.rpc('trivia_claim_bonus',{p_match:remote.id,p_row:r,p_col:c});
    if(error) setMessage(error.message);
    else {
      setBonusSelect(false);
      setMessage('כיבוש זהב! הרווחת '+data.gained+' ריבועים. נשארו '+data.remaining+' אסימונים.');
      if (data.finished) play('win'); else play('bonus');
      await refresh(remote.id);
      const {data: update}=await client.rpc('trivia_my_profile');
      if(update?.progress) setProgress(update.progress as Progress);
    }
    setBusy(false);
  }

  function dismissTutorial() {
    setShowTutorial(false);
    setTutorialPage(0);
    try { localStorage.setItem('trivia-tutorial-seen-v1','1'); } catch {}
  }

  async function saveProfile() {
    if (remember) localStorage.setItem('trivia-personal-choice', JSON.stringify({ color, avatar }));
    else localStorage.removeItem('trivia-personal-choice');
    if (client && user && legalAccepted) {
      const { error } = await client.rpc('trivia_save_profile', { p_name: name, p_color: color, p_avatar: avatar, p_remember: remember });
      setMessage(error ? error.message : 'הפרופיל נשמר!');
    } else setMessage('העדפות נשמרו במכשיר בלבד');
  }

  function chooseWorld(nextSize: number) {
    if (busy) return;
    setSize(nextSize);
    setRemote(null);
    setLocal(empty(nextSize));
    setQuestion(null);
    setEdge(null);
    setTrace(null);
    gesture.current = null;
    setKeyboardStart(null);
    setBonusSelect(false);
    setMessage('העולם התחלף! גרור קו מנקודה לנקודה סמוכה.');
  }

  function boardPoint(event: ReactPointerEvent<SVGSVGElement>): BoardPoint {
    const svg = event.currentTarget;
    const matrix = svg.getScreenCTM();
    if (matrix) {
      const point = svg.createSVGPoint();
      point.x = event.clientX;
      point.y = event.clientY;
      const localPoint = point.matrixTransform(matrix.inverse());
      return { x: localPoint.x, y: localPoint.y };
    }
    const rect = svg.getBoundingClientRect();
    return { x: (event.clientX - rect.left) * 328 / rect.width, y: (event.clientY - rect.top) * 328 / rect.height };
  }

  function onBoardPointerDown(event: ReactPointerEvent<SVGSVGElement>) {
    if (!canPlay || finished || !!question || bonusSelect || (event.pointerType === 'mouse' && event.button !== 0)) return;
    const start = nearestDot(boardPoint(event), state.rows, state.cols);
    if (!start) return;
    event.preventDefault();
    gesture.current = { pointerId: event.pointerId, start };
    play('marker');
    event.currentTarget.setPointerCapture(event.pointerId);
    setTrace({ start, target: dotXY(start, state.rows, state.cols), end: null, ink: [dotXY(start, state.rows, state.cols)] });
  }

  function onBoardPointerMove(event: ReactPointerEvent<SVGSVGElement>) {
    const active = gesture.current;
    if (!active || event.pointerId !== active.pointerId) return;
    event.preventDefault();
    const target = boardPoint(event);
    const end = nearestDot(target, state.rows, state.cols);
    const valid = end && edgeBetween(active.start, end, state.rows, state.cols);
    setTrace(prev => {
      if (!prev) return null;
      const snapped = valid && !state.edges[valid] ? dotXY(end, state.rows, state.cols) : target;
      const last = prev.ink[prev.ink.length - 1];
      const moved = Math.hypot(snapped.x - last.x, snapped.y - last.y) > 2;
      return { ...prev, target: snapped, end: valid && !state.edges[valid] ? end : null, ink: moved ? [...prev.ink.slice(-160), snapped] : prev.ink };
    });
  }

  function onBoardPointerUp(event: ReactPointerEvent<SVGSVGElement>) {
    const active = gesture.current;
    if (!active || event.pointerId !== active.pointerId) return;
    const end = nearestDot(boardPoint(event), state.rows, state.cols);
    const chosen = end ? edgeBetween(active.start, end, state.rows, state.cols) : null;
    gesture.current = null;
    setTrace(null);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (chosen && !state.edges[chosen]) { play('draw'); void pick(chosen); }
    else setMessage('חבר שתי נקודות סמוכות בגרירה אחת כדי לקבל שאלה.');
  }

  function onBoardPointerCancel(event: ReactPointerEvent<SVGSVGElement>) {
    if (gesture.current?.pointerId !== event.pointerId) return;
    gesture.current = null;
    setTrace(null);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }

  function onDotKeyDown(event: ReactKeyboardEvent<SVGCircleElement>, dot: Dot) {
    if (!canPlay || question || bonusSelect || finished || (event.key !== 'Enter' && event.key !== ' ')) return;
    event.preventDefault();
    if (!keyboardStart) { setKeyboardStart(dot); setMessage('בחר כעת נקודה סמוכה כדי להשלים קו'); return; }
    const chosen = edgeBetween(keyboardStart, dot, state.rows, state.cols);
    setKeyboardStart(null);
    if (chosen && !state.edges[chosen]) { play('draw'); void pick(chosen); }
    else setMessage('יש לבחור רק שתי נקודות סמוכות עם קו פנוי.');
  }

  const colors: Record<Side, string> = {
    host: player === 'host' ? color : remote?.players?.host?.color || '#358CFF',
    guest: player === 'guest' && remote?.state.mode === 'online' ? color : remote?.players?.guest?.color || '#FA9143',
    bot: '#FA9143'
  };
  const opponentIcon = remote?.players?.[player === 'host'?'guest':'host']?.avatar || '🐲';
  const opponentName = remote?.state.mode === 'bot' ? 'המחשב' : remote?.players?.[player === 'host'?'guest':'host']?.name || 'שחקן 2';
  const drawLine = (key: string, x1: number, y1: number, x2: number, y2: number) => {
    const owner = state.edges[key];
    return <g key={key} pointerEvents='none'>
      {owner && <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={colors[owner]} strokeWidth='17' strokeOpacity='.26' strokeLinecap='round' filter='url(#lineGlow)' />}
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={owner ? colors[owner] : '#B7D1F6'} strokeOpacity={owner ? .95 : .2} strokeWidth={owner ? 10 : 3} strokeLinecap='round' strokeDasharray={owner ? undefined : '1 11'} filter={owner ? 'url(#markerTexture)' : undefined}/>
      {owner && <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={colors[owner]} strokeOpacity='.42' strokeWidth='4' strokeLinecap='round' />}
      {owner && <line x1={x1+1} y1={y1+1} x2={x2+1} y2={y2+1} stroke='#FFFFFF' strokeOpacity='.12' strokeWidth='1.5' strokeLinecap='round' />}
    </g>;
  };
  const step = 288 / state.cols;
  const inviteLink = remote?.state.mode === 'online' ? typeof window !== 'undefined' ? window.location.origin + '/?room=' + remote.id : '' : '';
  const themeIndex = Math.max(0, worlds.findIndex(w => w.size === world.size));
  const decorative = ['🍃', '💠', '✨', '🌠'][themeIndex];
  return <main className={'trivia-app theme-' + world.slug} style={css.main}>
    <style>{`
      *{box-sizing:border-box} body{background:#111C48;color:white;font-family:Arial,'Noto Sans Hebrew',sans-serif;font-weight:800;margin:0}
      .trivia-app{--accent:#8CE8FF;min-height:100vh;position:relative;isolation:isolate}
      .theme-orchard{--accent:#A7F57C;--tone:#1F684E;--glow:#90F59B;--backdrop:radial-gradient(ellipse at 15% 4%,#327B65 0%,transparent 42%),radial-gradient(ellipse at 88% 93%,#2C536C 0%,transparent 39%),linear-gradient(160deg,#142E46,#101A3F)}
      .theme-crystal{--accent:#C8B6FF;--tone:#5644A8;--glow:#9C7BFF;--backdrop:radial-gradient(ellipse at 14% 5%,#593D99 0%,transparent 45%),radial-gradient(ellipse at 85% 85%,#244E84 0%,transparent 43%),linear-gradient(160deg,#1C1B55,#0C183D)}
      .theme-clouds{--accent:#A0EDFF;--tone:#267CA6;--glow:#97E8FF;--backdrop:radial-gradient(ellipse at 10% 7%,#2F7898 0%,transparent 48%),radial-gradient(ellipse at 86% 92%,#7973BD 0%,transparent 48%),linear-gradient(160deg,#224D78,#14214A)}
      .theme-galaxy{--accent:#F5B4FF;--tone:#8945B0;--glow:#D77CFF;--backdrop:radial-gradient(ellipse at 15% 8%,#5F338D 0%,transparent 48%),radial-gradient(ellipse at 90% 90%,#2A568F 0%,transparent 42%),linear-gradient(155deg,#201C58,#111337)}
      .trivia-app:before{content:'';position:absolute;inset:0;z-index:-1;background:var(--backdrop);border-radius:0 0 38px 38px;pointer-events:none}
      .trivia-app button,.trivia-app input,.trivia-app select{font:inherit}
      .trivia-app button:focus-visible,.trivia-app input:focus-visible,.trivia-app select:focus-visible,.trivia-app [role=button]:focus-visible{outline:3px solid #FFE78C;outline-offset:3px}
      .trivia-app button{transition:transform .15s ease,box-shadow .15s ease,background .15s ease}
      .trivia-app button:not(:disabled):hover{transform:translateY(-2px)}
      .trivia-app button:disabled{opacity:.55;cursor:not-allowed}
      .hero{text-align:center;padding:8px 0 21px}
      .eyebrow{color:#FFE68C;font-size:12px;letter-spacing:2.2px;font-weight:900}
      .hero h1{font-size:clamp(37px,5vw,65px);letter-spacing:-1.4px;margin:4px;color:#FFFFFF;text-shadow:0 4px 26px #AAB4FF60}
      .hero p{font-size:15px;color:#EBF2FF;margin:6px}
      .adventure-track{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:11px;margin:0 0 20px}
      .world-choice{position:relative;overflow:hidden;isolation:isolate;border:1px solid #FFFFFF55!important;border-radius:18px;padding:14px 15px;min-height:105px;color:#FFFFFF;text-align:right;box-shadow:inset 0 1px 0 #FFFFFF30,0 7px 19px #0A133350;cursor:pointer}
      .world-choice:before{content:'';position:absolute;inset:0;background:linear-gradient(115deg,#FFFFFF27,transparent 60%);z-index:-1}
      .world-choice[data-selected=true]{outline:3px solid #FFE38F;outline-offset:1px;box-shadow:0 0 0 2px #FFE38F35,0 12px 34px #151B4650}
      .wc-badge{font-size:10px;color:#FFFFFF;opacity:.95;font-weight:900;letter-spacing:1px}
      .wc-name{display:block;font-size:18px;line-height:1.3;font-weight:900;text-shadow:0 2px 9px #0008}
      .wc-icon{font-size:29px;float:left;filter:drop-shadow(0 2px 5px #1118)}
      .wc-level{font-size:11px;color:#FFFFFF;font-weight:900;margin-top:5px}
      .game-grid{display:grid;grid-template-columns:minmax(0,1.52fr) minmax(300px,1fr);gap:18px}
      .glass-panel{background:linear-gradient(150deg,#1E3263EF,#17244BEF);border:1px solid #A7C5FF51;border-radius:25px;padding:20px;box-shadow:inset 0 1px 0 #FFFFFF1E,0 15px 37px #040B26A6}
      .arena-panel{background:linear-gradient(165deg,#223C6FCF,#122448F5);padding:17px}
      .arena-title{display:flex;align-items:center;justify-content:space-between;gap:9px;margin:3px 1px 13px}
      .arena-title h2{font-size:21px;margin:0;font-weight:900}
      .arena-title p{margin:5px 0 0;color:#E4F3FF;font-size:12px;font-weight:900}
      .level-pill{border:1px solid #B0C6FF70;border-radius:99px;background:#FFFFFF16;padding:8px 12px;color:#FFFFFF;font-size:11px;font-weight:900}
      .scoreboard{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:8px;margin-bottom:14px}
      .player-tile{display:flex;gap:10px;align-items:center;background:#0A1735A8;border:1px solid #A9CBFF42;border-radius:15px;padding:9px}
      .player-tile.left-side{direction:ltr;text-align:left}
      .player-tile.right-side{direction:rtl}
      .player-tile .portrait{display:grid;place-items:center;flex-shrink:0;width:42px;height:42px;border:2px solid var(--accent);border-radius:14px;background:#274985;font-size:23px}
      .player-tile.other .portrait{border-color:#FFB069;background:#704329}
      .score-name{font-size:11px;color:#E7F0FF}
      .score-num{font-size:26px;line-height:1.1;font-weight:900;color:#FFFFFF;font-variant-numeric:tabular-nums}
      .versus{font-size:11px;color:#FFE783;text-align:center;font-weight:900}
      .arena{position:relative;overflow:hidden;border-radius:23px;padding:15px 10px 9px;border:1px solid #E5F5FF60;box-shadow:inset 0 3px 12px #FFFFFF14,0 14px 27px #0006}
      .arena.orchard{background:radial-gradient(circle at 18% 15%,#7EDD9B73,transparent 44%),radial-gradient(circle at 80% 80%,#B6DD6861,transparent 44%),linear-gradient(155deg,#164B46,#12384E)}
      .arena.crystal{background:radial-gradient(circle at 18% 15%,#E3AFFF80,transparent 42%),radial-gradient(circle at 80% 80%,#95A6FF65,transparent 44%),linear-gradient(145deg,#30245E,#263B78)}
      .arena.clouds{background:radial-gradient(circle at 25% 15%,#D0FCFF9C,transparent 45%),radial-gradient(circle at 85% 80%,#B1BDFF82,transparent 47%),linear-gradient(145deg,#4079A4,#435C9F)}
      .arena.galaxy{background:radial-gradient(circle at 15% 10%,#BD74FF9C,transparent 43%),radial-gradient(circle at 85% 75%,#3D9AFF6B,transparent 41%),linear-gradient(140deg,#1C225D,#473075)}
      .arena:before{content:'✧ ✦ · ✧ · ✦ · ✧';position:absolute;top:9px;left:8px;right:8px;color:#FFFFFF35;font-size:17px;letter-spacing:18px;text-align:center;pointer-events:none}
      .arena:after{content:'';position:absolute;inset:0;pointer-events:none;opacity:.18;background-image:radial-gradient(#FFFFFF 1px,transparent 1px);background-size:25px 25px;mask-image:linear-gradient(130deg,#000 10%,transparent 85%)}
      .arena-inner{position:relative;z-index:1;border-radius:19px;background:linear-gradient(140deg,#07193494,#0C1A37AE);border:1px solid #E2F0FF3B;box-shadow:0 13px 22px #07122975,inset 0 0 32px #1EA7F417}
      .board{display:block;width:100%;max-width:600px;aspect-ratio:1;margin:auto;touch-action:none;user-select:none;-webkit-user-select:none}
      .gesture-hint{text-align:center;display:flex;justify-content:center;gap:8px;align-items:center;margin:12px auto;color:#FFFFFF;font-size:13px;font-weight:900}
      .draw-icon{display:grid;place-items:center;border-radius:10px;background:#FFE586;color:#20325D;width:29px;height:29px;font-size:17px}
      .level-progress{background:#0C1F43;border:1px solid #6F97DB78;border-radius:99px;height:9px;overflow:hidden;margin-top:14px}
      .level-progress-fill{height:100%;background:linear-gradient(90deg,#FED466,var(--accent));border-radius:99px;transition:width .35s}
      .status-line{min-height:45px;display:flex;align-items:center;justify-content:center;text-align:center;color:#FFE889;font-size:14px;font-weight:900}
      .victory-panel{margin:16px auto 8px;text-align:center;background:linear-gradient(130deg,#3E5192,#27406D);border:2px solid #FFDC7B;border-radius:21px;padding:18px;box-shadow:0 15px 38px #0005,inset 0 1px 0 #FFFFFF44}
      .victory-symbol{font-size:45px;filter:drop-shadow(0 3px 9px #FFDE8188)}

      .control-row{display:flex;gap:9px;justify-content:center;flex-wrap:wrap}
      .gold-button{background:linear-gradient(140deg,#FFF0A7,#FFD063)!important;color:#142144!important;border:0;border-radius:12px;box-shadow:inset 0 2px 0 #FFFFFF92,0 5px 15px #0C142A7F;font-weight:900;padding:13px 20px;cursor:pointer}
      .glass-button{background:#38538A;color:#FFFFFF;border:1px solid #B1C8FC70;border-radius:12px;padding:12px 15px;font-weight:900;cursor:pointer}
      .smalltxt{color:#E7EFFB;font-size:12px;font-weight:900}
      .panel-title{font-size:20px;margin:0 0 13px;display:flex;align-items:center;gap:9px;font-weight:900}
      .side-stack{display:grid;gap:15px;align-content:start}
      .mode-row{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}
      .choice{font-weight:900;padding:12px 6px;border-radius:11px;background:#334C82;color:#FFFFFF;border:1px solid #8AB1EF99;cursor:pointer;font-size:12px}
      .choice[aria-pressed=true]{background:#FFE48E;color:#13244A;border-color:#FFECBD}
      .form-field{margin-top:13px;display:block;font-size:13px;color:#E7F0FF}
      .form-input{width:100%;background:#F7FAFF;border:2px solid #AEC7EF;color:#192953;border-radius:11px;padding:11px;font-weight:900;margin-top:6px}
      .swatches{display:flex;gap:7px;flex-wrap:wrap;margin:10px 0}
      .swatch{height:31px;width:31px;border-radius:50%;border:2px solid #FFFFFFAB;cursor:pointer}
      .swatch[aria-pressed=true]{outline:3px solid #FFE18E;outline-offset:2px}
      .avatar-row{display:flex;gap:5px;flex-wrap:wrap;margin:9px 0}
      .avatar-choice{display:grid;place-items:center;border-radius:10px;border:1px solid #8CABE4;background:#2E457B;width:40px;height:40px;font-size:21px;cursor:pointer}
      .avatar-choice[aria-pressed=true]{border:2px solid #FFE18C;background:#506CAC}
      .wallet{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}
      .wallet-item{display:flex;align-items:center;flex-direction:column;gap:5px;background:#2B4678;border:1px solid #739BD366;border-radius:12px;padding:9px 2px;text-align:center}
      .wallet-item strong{font-size:20px;font-weight:900;color:#FFFFFF}
      .wallet-item span{font-size:11px;font-weight:900;color:#EAF2FF}
      .quiz-overlay{position:fixed;inset:0;z-index:30;background:#08132DDF;backdrop-filter:blur(9px);display:grid;place-items:center;padding:14px}
      .quiz-card{width:min(100%,530px);background:linear-gradient(145deg,#304C94,#192E61);border:2px solid #FFD979;border-radius:25px;padding:25px;box-shadow:0 25px 100px #0009,inset 0 2px 0 #FFFFFF40}
      .quiz-badge{display:inline-flex;padding:7px 11px;border-radius:99px;background:#FFE58E;color:#1A2D55;font-weight:900;font-size:12px}
      .quiz-card h2{font-size:clamp(20px,4vw,29px);font-weight:900;line-height:1.4;color:#FFFFFF}
      .answer-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin-top:18px}
      .answer-option{padding:16px;min-height:66px;text-align:right;background:#F3F7FF;color:#1B2E59;border:2px solid #DCE6FC;border-radius:13px;font-weight:900;cursor:pointer}
      .answer-option:not(:disabled):hover{background:#FFE8A4;border-color:#F7C852}
      .answer-letter{display:inline-grid;place-items:center;border-radius:9px;background:#DFE9FF;color:#1E3978;width:28px;height:28px;margin-left:10px}
      .footer{display:flex;gap:22px;flex-wrap:wrap;justify-content:center;margin:27px auto 8px;font-size:13px}
      .footer a{color:#EDF4FF;font-weight:900}
      @media(max-width:850px){.game-grid{grid-template-columns:1fr}.adventure-track{grid-template-columns:repeat(2,minmax(0,1fr))}.glass-panel{padding:14px}.arena{padding:12px 7px 7px}}
      @media(max-width:440px){.player-tile .portrait{width:36px;height:36px}.player-tile{padding:6px}.score-num{font-size:22px}.scoreboard{gap:5px}.world-choice{min-height:89px;padding:9px}.wc-name{font-size:15px}.answer-grid{grid-template-columns:1fr}.wallet{grid-template-columns:repeat(4,minmax(0,1fr))}.quiz-card{padding:16px}}
      @media(prefers-reduced-motion:reduce){*,*:before,*:after{animation:none!important;transition:none!important}}
      @keyframes tileClaim{from{transform:scale(.7);opacity:0}to{transform:scale(1);opacity:1}}
      @keyframes drawTutorial{from{stroke-dashoffset:84}to{stroke-dashoffset:0}}
      .tutorial-stroke{animation:drawTutorial 1.5s ease-in-out both}
      .claimed-tile{animation:tileClaim .36s cubic-bezier(.2,1.3,.4,1);transform-origin:center}
    `}</style>
    <header className='hero'>
      <div className='eyebrow'>✦ TRIVIA SQUARES · ADVENTURE ✦</div>
      <h1>טריוויה ריבועים</h1>
      <p>חברו נקודות, ענו נכון, כבשו ריבועים והפכו לאלופי הטריוויה!</p>
    </header>

    <nav className='adventure-track' aria-label='בחירת עולם'>
      {worlds.map((w, i) => <button
        key={w.slug}
        type='button'
        className='world-choice'
        data-selected={w.size === state.rows}
        onClick={() => chooseWorld(w.size)}
        style={{ background: ['linear-gradient(125deg,#277856,#133E56)','linear-gradient(125deg,#7059B8,#333774)','linear-gradient(125deg,#3C9EC0,#565BBA)','linear-gradient(125deg,#7842AC,#333F86)'][i] }}
      >
        <span className='wc-icon' aria-hidden='true'>{w.icon}</span>
        <span className='wc-badge'>{w.badge}</span>
        <strong className='wc-name'>{w.name}</strong>
        <div className='wc-level'>{w.size}×{w.size} · {w.reward}</div>
      </button>)}
    </nav>

    <div className='game-grid'>
      <section className='glass-panel arena-panel'>
        <div className='arena-title'>
          <div><h2>{world.icon} {world.name}</h2><p>{world.subtitle} • {state.rows * state.cols} ריבועים</p></div>
          <div className='level-pill'>שלב {themeIndex + 1} / 4</div>
        </div>
        <div className='scoreboard'>
          <div className='player-tile right-side'>
            <div className='portrait'>{remote && player === 'guest' ? opponentIcon : avatar}</div>
            <div><div className='score-name'>{remote?.players?.host?.name || name || 'שחקן 1'}</div><div className='score-num'>{state.scores.host}</div></div>
          </div>
          <div className='versus'>{(state.mode === 'local' ? state.turn === 'host' : state.turn === player) ? 'התור שלך' : 'תור היריב'}<div style={{ fontSize: 17 }}>⚔️</div></div>
          <div className='player-tile left-side other'>
            <div className='portrait'>{state.mode === 'bot' ? '🤖' : remote?.players?.guest?.avatar || '🐲'}</div>
            <div><div className='score-name'>{state.mode === 'bot' ? 'המחשב' : remote?.players?.guest?.name || 'שחקן 2'}</div><div className='score-num'>{state.scores.guest + state.scores.bot}</div></div>
          </div>
        </div>
        <div className={'arena ' + world.slug}>
          <div className='arena-inner'>
            <svg
              ref={boardRef}
              className='board'
              viewBox='0 0 328 328'
              role='group'
              aria-label={'לוח ' + world.name + ': גרור מנקודה לנקודה סמוכה. ניווט מקלדת באמצעות Tab ו-Enter על הנקודות.'}
              onPointerDown={onBoardPointerDown}
              onPointerMove={onBoardPointerMove}
              onPointerUp={onBoardPointerUp}
              onPointerCancel={onBoardPointerCancel}
            >
              <defs>
                <filter id='lineGlow' x='-50%' y='-50%' width='200%' height='200%'><feGaussianBlur stdDeviation='4' /></filter>
                <filter id='markerTexture' x='-10%' y='-10%' width='120%' height='120%'>
                  <feTurbulence baseFrequency='.062' numOctaves='2' type='fractalNoise' seed='17' result='grain'/>
                  <feDisplacementMap in='SourceGraphic' in2='grain' scale='1.8' xChannelSelector='R' yChannelSelector='G'/>
                </filter>
                <radialGradient id='dotGlow'><stop offset='0%' stopColor='#FFFFFF'/><stop offset='58%' stopColor='#D7EAFF'/><stop offset='100%' stopColor='#7BA9ED'/></radialGradient>
                <linearGradient id='cellTint' x1='0' y1='0' x2='1' y2='1'><stop offset='0%' stopColor='#FFFFFF' stopOpacity='.12'/><stop offset='100%' stopColor='#FFFFFF' stopOpacity='.015'/></linearGradient>
              </defs>
              {Array.from({ length: state.rows }, (_, r) => Array.from({ length: state.cols }, (_, c) => {
                const owner = state.owners[r + '-' + c];
                const w = 288 / state.cols;
                const h = 288 / state.rows;
                const x = 20 + c * w + 5;
                const y = 20 + r * h + 5;
                return <g key={'cell-' + r + '-' + c} pointerEvents={bonusSelect ? undefined : 'none'}>
                  <rect x={x} y={y} width={w - 10} height={h - 10} rx='10' fill={owner ? colors[owner] : 'url(#cellTint)'} fillOpacity={owner ? '.82' : '1'} className={owner ? 'claimed-tile' : ''} />
                  {bonusSelect && !owner && <rect x={x} y={y} width={w-10} height={h-10} rx='10'
                    role='button' tabIndex={0} aria-label={'כבוש ריבוע בשורה '+(r+1)+' עמודה '+(c+1)}
                    onClick={()=>void claimBonusSquare(r,c)}
                    onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();void claimBonusSquare(r,c)}}}
                    fill='#FFE18C' fillOpacity='.22' stroke='#FFE18C' strokeWidth='3' strokeDasharray='6 4' style={{cursor:'pointer'}} />}
                  {owner ? <>
                    <rect x={x + 3} y={y + 3} width={w - 16} height={h - 16} rx='8' fill='none' stroke='#FFFFFF' strokeOpacity='.4' strokeWidth='1.5' />
                    <text x={x + (w - 10) / 2} y={y + h * .63} textAnchor='middle' fontSize={Math.min(37, w * .42)} aria-hidden='true'>{owner === player ? avatar : owner === 'bot' ? '🤖' : opponentIcon}</text>
                  </> : <text x={x + (w - 10) / 2} y={y + h * .62} textAnchor='middle' fontSize={Math.min(24, w * .3)} opacity='.26' aria-hidden='true'>{decorative}</text>}
                </g>;
              }))}
              {Array.from({ length: state.rows + 1 }, (_, r) => Array.from({ length: state.cols }, (_, c) => drawLine('h-' + r + '-' + c, 20 + c * step, 20 + r * step, 20 + (c + 1) * step, 20 + r * step)))}
              {Array.from({ length: state.rows }, (_, r) => Array.from({ length: state.cols + 1 }, (_, c) => drawLine('v-' + r + '-' + c, 20 + c * step, 20 + r * step, 20 + c * step, 20 + (r + 1) * step)))}
              {trace && <g pointerEvents='none'>
<path d={trace.ink.map((p,i) => (i===0?'M':'L') + p.x.toFixed(1) + ' ' + p.y.toFixed(1)).join(' ') + ' L' + trace.target.x.toFixed(1) + ' ' + trace.target.y.toFixed(1)} fill='none' stroke={trace.end ? '#FFDF70' : '#D5F3FF'} strokeOpacity='.35' strokeWidth='19' strokeLinecap='round' strokeLinejoin='round' filter='url(#lineGlow)'/>
                <path d={trace.ink.map((p,i) => (i===0?'M':'L') + p.x.toFixed(1) + ' ' + p.y.toFixed(1)).join(' ') + ' L' + trace.target.x.toFixed(1) + ' ' + trace.target.y.toFixed(1)} fill='none' stroke={trace.end ? '#FFDE74' : '#CDE9FB'} strokeWidth='10' strokeLinecap='round' strokeLinejoin='round' filter='url(#markerTexture)'/>
                <circle cx={trace.target.x} cy={trace.target.y} r='6' fill='#FFF1BE' fillOpacity='.6'/>
              </g>}
              {Array.from({ length: state.rows + 1 }, (_, r) => Array.from({ length: state.cols + 1 }, (_, c) => {
                const dot: Dot = { row: r, col: c };
                const selected = trace?.start.row === r && trace?.start.col === c || trace?.end?.row === r && trace?.end?.col === c || keyboardStart?.row === r && keyboardStart?.col === c;
                const px = dotXY(dot, state.rows, state.cols);
                return <g key={'dot-' + r + '-' + c}>
                  <circle cx={px.x} cy={px.y} r={selected ? 13 : 10} fill='#BBD9FF' fillOpacity={selected ? '.35' : '.16'} pointerEvents='none' />
                  <circle cx={px.x} cy={px.y} r={selected ? 7.3 : 5.5} fill={selected ? '#FFE48A' : 'url(#dotGlow)'} stroke={selected ? '#FFFFFF' : '#D9EAFF'} strokeWidth='1.5' pointerEvents='none' />
                  <circle cx={px.x} cy={px.y} r='13' fill='transparent' role='button' tabIndex={canPlay ? 0 : -1} aria-label={'נקודה ' + (r + 1) + ', ' + (c + 1)} onKeyDown={event => onDotKeyDown(event, dot)} />
                </g>;
              }))}
            </svg>
          </div>
        </div>
        <div className='gesture-hint'><span className='draw-icon'>✍️</span>{bonusSelect?'בחר ריבוע פנוי לכיבוש בזהב':'גע בנקודה וצייר אל הנקודה הסמוכה כמו בטוש אמיתי'}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}><span className='smalltxt'>שטחים שנכבשו</span><span className='smalltxt'>{completed} / {state.rows * state.cols} · {percent}%</span></div>
        <div className='level-progress'><div className='level-progress-fill' style={{ width: percent + '%' }} /></div>
        {!online && <div role='alert' style={{background:'#D94C37',color:'#FFFFFF',padding:10,borderRadius:12,textAlign:'center',marginTop:12}}>
          📡 החיבור לרשת נותק. משחק מקומי עדיין זמין, ומשחק מחובר יתחדש עם חזרת החיבור.
        </div>}
        {finished && <section className='victory-panel' role='status' aria-label='תוצאות המשחק'>
          <div className='victory-symbol' aria-hidden='true'>🏆</div>
          <h2 style={{margin:'5px 0',fontSize:'clamp(22px,3.8vw,31px)'}}>
            {state.scores.host === state.scores.guest+state.scores.bot
              ? 'תיקו גדול!' : state.scores.host>state.scores.guest+state.scores.bot ? 'אליפות! כל הריבועים נסגרו' : 'היריב ניצח הפעם'}
          </h2>
          <div style={{fontSize:16,color:'#FFEAA6',marginBottom:12}}>
            {'⭐'.repeat(state.scores.host>state.scores.guest+state.scores.bot?3:state.scores.host===state.scores.guest+state.scores.bot?2:1)}
          </div>
          <p style={{margin:'6px 0',color:'#FFFFFF'}}>שחקן 1: {state.scores.host} נקודות · יריב: {state.scores.guest+state.scores.bot} נקודות</p>
          <p className='smalltxt'>🍎 במשחק מחובר צוברים פירות וקרדיטים, ובניצחון גם יהלומים והתקדמות.</p>
          <div className='control-row' style={{marginTop:13}}>
            <button className='gold-button' disabled={busy} onClick={()=>void start()}>🔄 משחק חוזר</button>
            {size<6 && <button className='glass-button' onClick={()=>chooseWorld(size+1)}>🌍 העולם הבא</button>}
          </div>
        </section>}
        <div className='status-line' aria-live='polite'>
          {finished ? '🏆 ' + (state.scores.host === state.scores.guest + state.scores.bot ? 'המשחק הסתיים בתיקו!' : state.scores.host > state.scores.guest + state.scores.bot ? 'ניצחת! כל הכבוד!' : 'היריב ניצח. משחק חוזר?') : message}
        </div>
        {remote?.status === 'waiting' && <p style={{ textAlign: 'center', color: '#FFE48A' }}>ממתינים שהחבר ייכנס לחדר...</p>}
        <div className='control-row'>
          <button className='gold-button' disabled={busy} onClick={() => void start()}>🎮 {remote ? 'משחק חדש' : 'התחל משחק'}</button>
          <button className='glass-button' onClick={() => {
            if (muted) playGameSound('correct',{muted:false,volume:volume/100});
            setMuted(v=>!v);
          }} aria-pressed={muted} aria-label={muted ? 'הפעל צלילים' : 'השתק צלילים'}>
            {muted ? '🔇 הפעל צלילים' : '🔊 השתק צלילים'}
          </button>
          <label className='glass-button' style={{display:'inline-flex',gap:7,alignItems:'center'}} htmlFor='game-volume'>
            עוצמה <input id='game-volume' type='range' min='0' max='100' step='5'
              aria-label='עוצמת הצלילים במשחק' value={volume} onChange={e=>setVolume(Number(e.target.value))}
              style={{width:80,accentColor:'#FFE38F'}} /> {volume}%
          </label>
          <button className='glass-button' onClick={()=>{setTutorialPage(0);setShowTutorial(true)}}>❓ איך משחקים</button>
          {earnedBonus && canPlay && <button className='gold-button' onClick={()=>void startGoldQuestion()} disabled={busy||!!question}>⭐ שאלת זהב!</button>}
          {availableBonus>0 && state.mode!=='online' && <button className='gold-button' disabled={busy||!!question} onClick={()=>setBonusSelect(v=>!v)}>
            ✨ {bonusSelect?'בטל כיבוש בונוס':'כיבוש בונוס'} ({availableBonus})</button>}
          {finished && size < 6 && <button className='glass-button' onClick={() => chooseWorld(size + 1)}>העולם הבא ←</button>}
        </div>
      </section>

      <aside className='side-stack'>
        <section className='glass-panel'>
          <h2 className='panel-title'>🎯 חדר המשחק</h2>
          <div className='mode-row'>
            {([['bot','🤖 מחשב'],['online','🌐 חבר'],['local','👥 מקומי']] as const).map(([value, label]) =>
              <button key={value} className='choice' aria-pressed={mode === value} onClick={() => setMode(value)}>{label}</button>)}
          </div>
          <label className='form-field' htmlFor='board-size'>גודל לוח</label>
          <select id='board-size' className='form-input' value={size} onChange={e => chooseWorld(Number(e.target.value))}>
            {worlds.map(w => <option key={w.size} value={w.size}>{w.icon} {w.name} ({w.size}×{w.size})</option>)}
          </select>
          {inviteLink && <div style={{ marginTop: 13 }}>
            <div className='smalltxt'>קישור לחדר הפרטי</div>
            <button className='glass-button' style={{ marginTop: 7 }} onClick={async () => {
              try {
                if (navigator.share) await navigator.share({title:'טריוויה ריבועים',text:'בוא לשחק איתי בטריוויה ריבועים!',url:inviteLink});
                else { await navigator.clipboard.writeText(inviteLink); setMessage('קישור ההזמנה הועתק'); }
              } catch { setMessage('אפשר להעתיק את ההזמנה ולשלוח לחבר'); }
            }}>📤 שתף הזמנה לחבר</button>
          </div>}
          {invite && client && user && <button className='gold-button' style={{ marginTop: 12 }} disabled={busy} onClick={() => void join()}>הצטרף לחדר שהוזמנת אליו</button>}
        </section>
        <section className='glass-panel'>
          <h2 className='panel-title'>👑 השחקן שלי</h2>
          <label className='form-field' htmlFor='player-name'>כינוי שחקן</label>
          <input id='player-name' className='form-input' value={name} onChange={e => setName(e.target.value)} maxLength={32}/>
          <div className='form-field'>צבע הכיבוש שלי</div>
          <div className='swatches'>{palettes.map(c => <button key={c} className='swatch' style={{ background: c }} aria-label={'בחר צבע ' + c} aria-pressed={color === c} onClick={() => setColor(c)} />)}</div>
          <div className='form-field'>סמל שיופיע בכל ריבוע</div>
          <div className='avatar-row'>{avatars.map(a => <button className='avatar-choice' key={a} aria-label={'בחר אוואטר ' + a} aria-pressed={avatar === a} onClick={() => setAvatar(a)}>{a}</button>)}</div>
          <label className='form-field' style={{ display: 'flex', gap: 10, alignItems: 'center' }}><input type='checkbox' style={{ width: 18, height: 18, accentColor: '#FFDE85' }} checked={remember} onChange={e => setRemember(e.target.checked)} /> זכור את הבחירות שלי תמיד</label>
          <button className='glass-button' style={{ marginTop: 13 }} onClick={() => void saveProfile()}>שמור עיצוב אישי</button>
        </section>
        <section className='glass-panel'>
          <h2 className='panel-title'>💎 אוצרות והישגים</h2>
          <div className='wallet'>
            {([['🍎','פירות',progress.fruits],['💎','יהלומים',progress.diamonds],['🪙','קרדיטים',progress.credits],['❤️','לבבות',progress.hearts]] as const).map(([a,label,count]) =>
              <div className='wallet-item' key={label}><span aria-hidden='true' style={{ fontSize: 24 }}>{a}</span><strong>{count}</strong><span>{label}</span></div>)}
          </div>
          <p className='smalltxt' style={{marginBottom:0}}>🔥 רצף תשובות: {streak} | ⭐ כיבושי בונוס: {availableBonus}</p>
          <p className='smalltxt' style={{marginBottom:0}}>אחרי שלוש תשובות נכונות תקבל שאלת זהב. הצלחה מעניקה שני אסימוני כיבוש. המשחק התחרותי נשאר ללא בונוסים משני ניקוד.</p>
        </section>
        <section className='glass-panel'>
          <h2 className='panel-title'>🔐 מועדון השחקנים</h2>
          {user ? <>
            <p className='smalltxt'>מחובר: {user.email}</p>
            {!legalAccepted && <section style={{background:'#293D72',border:'1px solid #FFDE8D',borderRadius:13,padding:13,margin:'10px 0'}}>
              <h3 style={{margin:'0 0 7px',color:'#FFE7A4'}}>השלמת הרשמה למשחק</h3>
              <p className='smalltxt'>חשבון המשחק מיועד למבוגרים בני 18 ומעלה. משחק מקומי זמין גם ללא חשבון. לפני הפעלת פרופיל וחדרים יש לאשר את התנאים.</p>
              <label style={{display:'flex',gap:9,alignItems:'flex-start',margin:'12px 0'}}>
                <input type='checkbox' checked={adultConfirmed} onChange={e=>setAdultConfirmed(e.target.checked)} style={{width:20,height:20,flexShrink:0}}/>
                אני מאשר/ת שגילי 18 ומעלה
              </label>
              <label style={{display:'flex',gap:9,alignItems:'flex-start',margin:'12px 0'}}>
                <input type='checkbox' checked={policiesAcknowledged} onChange={e=>setPoliciesAcknowledged(e.target.checked)} style={{width:20,height:20,flexShrink:0}}/>
                קראתי את <a href='/privacy' style={{color:'#FFDC88'}}>הודעת הפרטיות</a> ואני מסכים/ה ל<a href='/terms' style={{color:'#FFDC88'}}>תנאי השימוש</a>
              </label>
              <button className='gold-button' disabled={legalBusy||!adultConfirmed||!policiesAcknowledged} onClick={()=>void acceptCurrentPolicies()}>
                {legalBusy?'שומר...':'אשר והפעל משחק מחובר'}
              </button>
            </section>}
            {legalAccepted && <p className='smalltxt' style={{color:'#B0FFD6'}}>החשבון פעיל למשחקים מחוברים.</p>}
            <button className='glass-button' onClick={() => void client?.auth.signOut()}>התנתק</button>
          </>
            : client ? <>
              <p className='smalltxt' style={{lineHeight:1.8,background:'#2E467A',borderRadius:12,padding:10}}>
                הרשמה נדרשת רק למשחקים מחוברים. נאסוף כתובת מייל ומזהה חשבון, ובמשחק נשמור כינוי, תוצאה והתקדמות.
                המסירה לבחירתך; ללא הרשמה ניתן לשחק מקומית.
                הפרטים נשמרים בעזרת Supabase והאתר מאוחסן ב-Vercel.
                <a href='/privacy' style={{color:'#FFE5A5'}}> למדיניות הפרטיות המלאה</a>.
              </p>
              <label style={{display:'flex',gap:9,alignItems:'flex-start',margin:'10px 0'}}>
                <input type='checkbox' checked={adultConfirmed} onChange={e=>setAdultConfirmed(e.target.checked)} style={{width:20,height:20,flexShrink:0}} />
                אני בן/בת 18 ומעלה; חשבונות עצמאיים לילדים אינם זמינים כרגע
              </label>
              <label style={{display:'flex',gap:9,alignItems:'flex-start',margin:'10px 0'}}>
                <input type='checkbox' checked={policiesAcknowledged} onChange={e=>setPoliciesAcknowledged(e.target.checked)} style={{width:20,height:20,flexShrink:0}} />
                קראתי את <a href='/privacy' style={{color:'#FFE5A5'}}>הודעת הפרטיות</a> ואני מסכים/ה ל<a href='/terms' style={{color:'#FFE5A5'}}>תנאי השימוש</a>
              </label>
              <button className='gold-button' disabled={!adultConfirmed||!policiesAcknowledged} onClick={() => {
                if (!hasPreRegistrationAcknowledgement()) return;
                void client.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/' } }).then(({error}) => { if(error)setMessage(error.message); });
              }}>התחבר באמצעות Google</button>
              <label htmlFor='login-email' className='form-field'>דואר אלקטרוני</label>
              <input id='login-email' className='form-input' type='email' autoComplete='email' value={email} onChange={e => setEmail(e.target.value)} />
              <label htmlFor='login-password' className='form-field'>סיסמה</label>
              <input id='login-password' className='form-input' type='password' autoComplete='current-password' value={password} onChange={e => setPassword(e.target.value)} />
              <div className='control-row' style={{ marginTop: 12 }}>
                <button className='glass-button' onClick={async () => { const { error } = await client.auth.signInWithPassword({ email, password }); setMessage(error?.message || 'התחברת בהצלחה'); }}>כניסה</button>
                <button className='glass-button' onClick={async () => { if(!hasPreRegistrationAcknowledgement())return; const { error } = await client.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + '/' } }); setMessage(error?.message || 'נשלח מייל לאימות החשבון'); }}>הרשמה</button>
                <button className='glass-button' onClick={async () => {
                  if(!email.trim()){setMessage('יש להזין כתובת מייל לקבלת קישור איפוס סיסמה.');return;}
                  const {error}=await client.auth.resetPasswordForEmail(email,{redirectTo:window.location.origin+'/auth/reset-password'});
                  setMessage(error?.message||'אם קיים חשבון עם כתובת זו, יישלח אליו קישור לאיפוס סיסמה.');
                }}>שכחתי סיסמה</button>
              </div>
            </> : <p className='smalltxt'>משחק מקומי זמין כעת. התחברות מחייבת הגדרת Supabase במערכת הפריסה.</p>}
        </section>
      </aside>
    </div>

    {showTutorial && <div className='quiz-overlay' role='presentation'>
      <section className='quiz-card' role='dialog' aria-modal='true' aria-label='הסבר משחק' style={{textAlign:'center'}}>
        <span className='quiz-badge'>🧭 הדרך לכיבוש מתחילה כאן</span>
        <h2>{['צייר קו כמו בטוש','ענה נכון על שאלת טריוויה','סגור ריבוע וזכה בנקודות'][tutorialPage]}</h2>
        <svg viewBox='0 0 280 145' aria-hidden='true' style={{width:'100%',maxWidth:320,margin:'0 auto',display:'block'}}>
          {[0,1,2].flatMap(r=>[0,1,2].map(c=><circle key={r+'-'+c} cx={55+c*84} cy={22+r*48} r='7' fill='#FFFFFF' stroke='#9DC9FF' strokeWidth='3'/>))}
          {tutorialPage===0 && <><path d='M55 22 L139 22' stroke='#FFD867' strokeWidth='11' strokeLinecap='round' strokeDasharray='84' className='tutorial-stroke'/><circle cx='139' cy='22' r='9' fill='#FFE8A3'/></>}
          {tutorialPage===1 && <><path d='M55 22 L139 22' stroke='#FFD867' strokeWidth='9' strokeLinecap='round'/><text x='140' y='94' textAnchor='middle' fill='#FFFFFF' fontSize='18' fontWeight='900'>מהי התשובה הנכונה?</text></>}
          {tutorialPage===2 && <><rect x='61' y='28' width='72' height='36' rx='8' fill={color}/><text x='97' y='54' textAnchor='middle' fontSize='25'>{avatar}</text><path d='M55 22 H139 V70 H55 Z' fill='none' stroke='#FFE48A' strokeWidth='8' strokeLinecap='round'/></>}
        </svg>
        <p style={{color:'#ECF4FF',fontSize:15,lineHeight:1.7}}>{[
          'נוגעים בנקודה, גוררים באצבע או בעכבר אל נקודה סמוכה ומשחררים. לא לוחצים על הקו.',
          'לכל קו תופיע שאלה עם ארבע אפשרויות. תשובה שגויה תשאיר את הקו פתוח.',
          'הריבוע יתמלא בצבע ובאוואטר שלך. סגירה מעניקה נקודה ותור נוסף. אחרי רצף תשובות מחכה שאלת זהב!'
        ][tutorialPage]}</p>
        <div className='control-row'>
          <button className='glass-button' onClick={dismissTutorial}>דלג או סיים</button>
          {tutorialPage<2 && <button className='gold-button' onClick={()=>setTutorialPage(v=>v+1)}>הבא ←</button>}
        </div>
      </section>
    </div>}
    {question && <div className='quiz-overlay' role='presentation'>
      <section className='quiz-card' role='dialog' aria-modal='true' aria-label='שאלת טריוויה'>
        <span className='quiz-badge'>{question.kind==='bonus'?'✨ שאלת זהב: הזדמנות לשני כיבושים ✨':'⭐ רק תשובה נכונה תסגור את הקו ⭐'}</span>
        <h2>{question.text}</h2>
        <div className='answer-grid'>
          {question.answers.map((a, i) => <button className='answer-option' key={i} disabled={busy} autoFocus={i === 0} onClick={() => void answer(i)}><span className='answer-letter'>{['א','ב','ג','ד'][i]}</span>{a}</button>)}
        </div>
        <p className='smalltxt' style={{ textAlign: 'center', marginBottom: 0 }}>{question.kind==='bonus'?'תשובה נכונה מעניקה שני אסימוני כיבוש זהב':'תשובה שגויה משאירה את הקו פתוח ומעבירה את התור'}</p>
      </section>
    </div>}

    <footer className='footer'><a href='/privacy'>פרטיות</a><a href='/terms'>תנאי שימוש</a><a href='/cookies'>עוגיות ואחסון</a><a href='/accessibility'>נגישות</a><a href='/account/privacy'>המידע שלי</a></footer>
    <p className='smalltxt' style={{ textAlign: 'center' }}>פרסים וירטואליים בלבד · ללא רכישות בכסף אמיתי</p>
  </main>;
}
