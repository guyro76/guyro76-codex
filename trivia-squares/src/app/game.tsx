'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from '../lib/supabasePublicConfig';
import type { PointerEvent as ReactPointerEvent, KeyboardEvent as ReactKeyboardEvent } from 'react';
import { Dot, BoardPoint, dotXY, nearestDot, edgeBetween } from '../lib/dotDrawing';
import { applyLocalAnswer, repairSoloBoard } from '../lib/engine';
import {awardPremiumSquares} from '../lib/premiumCaptures';
import {normalizedPlayerName,selectPlayerName,validPlayerName} from '../lib/playerName';
import { playGameSound, type SoundCue } from '../lib/gameAudio';
import { offlineQuestions } from '../lib/offlineQuestions';
import { englishQuestions } from '../lib/englishQuestions';
import { internationalQuestions } from '../lib/internationalQuestions';
import {freshLocalQuestionReserve,freshLocalQuestions,countLocalReserve,LOCAL_QUESTION_RELEASE_BATCH} from '../lib/freshQuestions';
import {questionTopics,ALL_QUESTION_TOPICS,parseTopicPreferences,topicForQuestion,type QuestionTopic} from '../lib/questionTopics';
import { translate,translatedWorlds,localeDirection,isActiveLocale,type ActiveLocale } from '../lib/i18n';
import StageReward from '../components/StageReward';
import CaptureTile, {type CaptureStyle} from '../components/CaptureTile';
import {reassignCapture,type LocalOwner,type LocalOwnerMode} from '../lib/captureOwnership';
import TutorialPreview from '../components/TutorialPreview';
import LocalQuestionBackup from '../components/LocalQuestionBackup';
import GameTimeBar from '../components/GameTimeBar';
import {CAMPAIGN_STAGES,STAGE_COUNT,stageFor,canOpenStage} from '../lib/campaignStages';
import './tutorial.css';
import './premium.css';

function hasActualOpponent(guest:unknown,host=''):boolean{
 if(typeof guest!=='string')return false;
 const name=guest.trim();
 return name.length>=2 && !/^(?:שחקן\s*(?:2|שני|ב)|player\s*(?:2|two)|second\s*player)$/iu.test(name)
  && name.toLocaleLowerCase()!==host.trim().toLocaleLowerCase();
}
function canonicalQuestion(text:string):string {
  return text.normalize('NFKC').toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
}
type Side = 'host' | 'guest' | 'bot';
type Mode = 'bot' | 'online' | 'local' | 'solo';
type Question = { text: string; answers: string[]; edge?: string; id?: number; locale?: ActiveLocale; kind?: 'edge' | 'bonus' | 'premium_bonus'; premium?: boolean; premiumOwner?: Side; deadline_at?: string | null; extensions?: number };
type WrongAnswerFeedback = { text:string; answers:string[]; selectedIndex:number; correctIndex:number | null };
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
  time_freeze?: Partial<Record<Side,boolean>>;
  campaign_stage?: number;
};
type PlayerIdentity = { name: string; color: string; line_color?: string; avatar: string };
type RemoteMatch = { id: string; status: string; host_id: string; guest_id: string | null; version: number; state: GameState; question?: Question; players?: { host?: PlayerIdentity; guest?: PlayerIdentity } };
type Profile = { display_name: string; color: string; line_color?: string; avatar: string; remember_color: boolean; locale?: ActiveLocale };
type Progress = { level: number; fruits: number; diamonds: number; credits: number; hearts: number; time_charms?: number };
type SkinId='regular'|'urban'|'vintage'|'retro'|'pop'|'future';
const skins:{id:SkinId;he:string;en:string;colors:[string,string,string]}[]=[
 {id:'regular',he:'רגיל · מקורי',en:'Original',colors:['#1F3265','#688FD8','#F9DA90']},
 {id:'urban',he:'אורבני · מטרופולין',en:'Urban Metro',colors:['#172935','#5A8C9C','#F4BD70']},
 {id:'vintage',he:'וינטג׳ קלאסי',en:'Classic Vintage',colors:['#583D36','#D1AC7C','#F7E9CE']},
 {id:'retro',he:'רטרו · ארקייד',en:'Retro Arcade',colors:['#302B5D','#FAAE4C','#71D4BC']},
 {id:'pop',he:'פופ · צבעוני',en:'Pop Art',colors:['#F34594','#FFD952','#4994EA']},
 {id:'future',he:'עתידני AI · סגול כתום',en:'AI Future · Purple & Orange',colors:['#42117E','#F15A24','#E946CC']}
];

const palettes = ['#358CFF', '#F97316', '#A855F7', '#10B981', '#EC4899', '#EAB308', '#EF4444', '#06B6D4'];
const avatars = ['🦊', '🦁', '🐼', '🐲', '🦄', '👑', '🚀', '⭐'];
const worlds = [
  { size: 3, name: 'גן הפירות', subtitle: 'ההרפתקה מתחילה כאן', icon: '🍎', slug: 'orchard', badge: 'עולם 01', reward: 'פירות' },
  { size: 4, name: 'מכרות היהלומים', subtitle: 'גלו אוצרות מנצנצים', icon: '💎', slug: 'crystal', badge: 'עולם 02', reward: 'יהלומים' },
  { size: 5, name: 'ממלכת העננים', subtitle: 'הדרך עוברת בין הכוכבים', icon: '☁️', slug: 'clouds', badge: 'עולם 03', reward: 'בונוסים' },
  { size: 6, name: 'גלקסיית הכוכבים', subtitle: 'אתגר המאסטרים הגדול', icon: '🪐', slug: 'galaxy', badge: 'עולם 04', reward: 'גביעים' }
] as const;
const empty = (size: number, kind:'solo'|'local'='solo'): GameState => ({ rows: size, cols: size, mode: kind, turn: 'host', edges: {}, owners: {}, scores: { host: 0, guest: 0, bot: 0 } });
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
  const [locale, setLocale] = useState<ActiveLocale>('he');
  const [languageLoaded, setLanguageLoaded] = useState(false);
  const tr = useCallback((value: string) => translate(locale,value),[locale]);
  const [legalAccepted, setLegalAccepted] = useState(false);
  const [adultConfirmed, setAdultConfirmed] = useState(false);
  const [policiesAcknowledged, setPoliciesAcknowledged] = useState(false);
  const [legalBusy, setLegalBusy] = useState(false);
  const [mode, setMode] = useState<Mode>('solo');
  const [size, setSize] = useState(3);
  const [stageId,setStageId]=useState(1);
  const [localStageCompleted,setLocalStageCompleted]=useState(0);
  const [serverStageCompleted,setServerStageCompleted]=useState(0);
  const [stageStarted,setStageStarted]=useState(false);
  const [local, setLocal] = useState<GameState>(() => empty(3));
  const [stageRunId,setStageRunId] = useState('local-first');
  const [localReady, setLocalReady] = useState(false);
  const [online, setOnline] = useState(true);
  const [remote, setRemote] = useState<RemoteMatch | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [wrongAnswerFeedback,setWrongAnswerFeedback]=useState<WrongAnswerFeedback|null>(null);
  const [skin,setSkin]=useState<SkinId>('regular');
  const [skinPickerOpen,setSkinPickerOpen]=useState(false);
  const [selectedTopics,setSelectedTopics]=useState<QuestionTopic[]>([...ALL_QUESTION_TOPICS]);
  const toggleTopic=(id:QuestionTopic)=>setSelectedTopics(previous=>{
    const next=previous.includes(id)?previous.filter(t=>t!==id):[...previous,id];
    return next.length?next:previous;
  });
  const [edge, setEdge] = useState<string | null>(null);
  const usedLocalQuestionIds=useRef<Set<number>>(new Set());
  const lastQuestionCategory=useRef<string|null>(null);
  const seenQuestionTexts=useRef<Set<string>>(new Set());
  const [localPoolRelease,setLocalPoolRelease]=useState<{he:number;en:number}>({he:0,en:0});
  const localPoolRef=useRef<{he:number;en:number}>({he:0,en:0});
  const rememberShownQuestion=useCallback((text:string)=>{
    const fingerprint=canonicalQuestion(text);
    if(!fingerprint || seenQuestionTexts.current.has(fingerprint))return;
    seenQuestionTexts.current.add(fingerprint);
    try{localStorage.setItem('trivia-question-text-history-v1',JSON.stringify([...seenQuestionTexts.current]))}catch{}
  },[]);
  const serverHistoryCountRef=useRef<{userId:string;total:number}|null>(null);
  const syncAccountQuestionHistory=useCallback(async ():Promise<boolean>=>{
    if(!client || !user)return true;
    const {data:stats,error:statsError}=await client.rpc('trivia_my_question_stats');
    if(statsError||!stats)return false;
    const total=['he','en','ru','fr','ar'].reduce((count,key)=>{
      const value=(stats as Record<string,{seen?:number}>)[key];
      return count+Number(value?.seen||0);
    },0);
    if(serverHistoryCountRef.current?.userId===user.id &&
       serverHistoryCountRef.current.total===total)return true;
    // One count request on each start; bulk history pages only after new remote play.
    for(let page=0;page<100;page++){
      const {data,error}=await client.rpc('trivia_read_seen_question_texts',{p_page:page});
      if(error || !Array.isArray(data))return false;
      for(const text of data) if(typeof text==='string')
        seenQuestionTexts.current.add(canonicalQuestion(text));
      if(data.length<300)break;
    }
    serverHistoryCountRef.current={userId:user.id,total};
    try{
      localStorage.setItem('trivia-question-text-history-v1',JSON.stringify([...seenQuestionTexts.current]));
    }catch{}
    return true;
  },[client,user?.id]);
  const expandLocalPool=useCallback((preferred:'he'|'en')=>{
    const current=localPoolRef.current;
    const nextIndex=Math.min(countLocalReserve(preferred),current[preferred]+LOCAL_QUESTION_RELEASE_BATCH);
    const grown=nextIndex-current[preferred];
    const next={...current,[preferred]:nextIndex};
    localPoolRef.current=next;
    setLocalPoolRelease(next);
    try{localStorage.setItem('trivia-local-pool-release-v1',JSON.stringify(next))}catch{}
    return grown;
  },[]);
  const [secondsLeft,setSecondsLeft]=useState<number | null>(null);
  const timeoutBusy=useRef(false);
  const lastTickRef=useRef<number | null>(null);
  const [localCredits,setLocalCredits]=useState<Record<'host'|'guest',number>>({host:0,guest:0});
  const [localCharms,setLocalCharms]=useState<Record<'host'|'guest',number>>({host:0,guest:0});
  const [localWallet,setLocalWallet]=useState({stars:0,fruits:0,diamonds:0});
  const [localFreeze,setLocalFreeze]=useState<Record<'host'|'guest',boolean>>({host:false,guest:false});
  const [name, setName] = useState('');
  const [nameSavedOnDevice,setNameSavedOnDevice]=useState(false);
  const [nameSyncedToAccount,setNameSyncedToAccount]=useState(false);
  const nameEditedRef=useRef(false);
  const lastSyncedNameRef=useRef('');
  const updatePlayerName=(value:string)=>{
    const next=value.slice(0,32);
    nameEditedRef.current=true;
    setName(next);
    setNameSyncedToAccount(false);
    if(validPlayerName(next)){
      try{localStorage.setItem('trivia-player-name',normalizedPlayerName(next));setNameSavedOnDevice(true)}
      catch{setNameSavedOnDevice(false)}
    }else setNameSavedOnDevice(false);
  };
  const [color, setColor] = useState('#358CFF');
  const [lineColor, setLineColor] = useState('#358CFF');
  const [avatar, setAvatar] = useState('🦊');
  const [remember, setRemember] = useState(false);
  const [guestName,setGuestName]=useState('');
  const [guestColor,setGuestColor]=useState('#F97316');
  const [guestAvatar,setGuestAvatar]=useState('👑');
  const [captureStyle,setCaptureStyle]=useState<CaptureStyle>('lumen');
  const [ownerMode,setOwnerMode]=useState<LocalOwnerMode>('auto_with_override');
  const [capturePending,setCapturePending]=useState<{keys:string[];from:'new'|'edit'}|null>(null);
  const [progress, setProgress] = useState<Progress>({ level: 1, fruits: 0, diamonds: 0, credits: 0, hearts: 3 });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('בחר מצב משחק והתחל');
  const [busy, setBusy] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(65);
  const play = useCallback((cue: SoundCue) => playGameSound(cue, { muted, volume: volume / 100 }), [muted, volume]);
  const rewardSound=useCallback((cue:'bonus'|'win')=>playGameSound(cue,{muted,volume:volume/100}),[muted,volume]);
  const [invite, setInvite] = useState<string | null>(null);
  const botBusy = useRef(false);
  const boardRef = useRef<SVGSVGElement>(null);
  const gesture = useRef<{ pointerId: number; start: Dot } | null>(null);
  const inkPointsRef=useRef<BoardPoint[]>([]);
  const inkGlowRef=useRef<SVGPathElement>(null);
  const inkLineRef=useRef<SVGPathElement>(null);
  const inkCursorRef=useRef<SVGCircleElement>(null);
  const [trace, setTrace] = useState<{ start: Dot; target: BoardPoint; end: Dot | null; ink: BoardPoint[] } | null>(null);
  const [keyboardStart, setKeyboardStart] = useState<Dot | null>(null);
  const [bonusSelect, setBonusSelect] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialPage, setTutorialPage] = useState(0);
  useEffect(()=>{
    if(!showTutorial)return;
    const previous=document.activeElement as HTMLElement|null;
    const dialog=document.getElementById('tutorial-modal');
    dialog?.focus({preventScroll:true});
    return ()=>{if(previous?.isConnected)previous.focus({preventScroll:true});};
  },[showTutorial]);
  const state = remote?.state || local;
  const player = user?.id && remote?.guest_id === user.id ? 'guest' : 'host';
  const onlineTurn = remote?.state.mode === 'local' || player === state.turn;
  const validName = validPlayerName(name) && name.length <= 32;
  const providerGoogle = Boolean(user?.app_metadata?.provider === 'google' || user?.app_metadata?.providers?.includes('google'));
  const googleName = providerGoogle ? String(user?.user_metadata?.full_name || user?.user_metadata?.name || '').trim().slice(0,70) : '';
  const googlePhotoRaw = providerGoogle ? String(user?.user_metadata?.avatar_url || user?.user_metadata?.picture || '') : '';
  const googlePhoto = /^https:\/\//i.test(googlePhotoRaw) ? googlePhotoRaw : '';
  const canPlay = validName && localReady && !showTutorial && !capturePending && !wrongAnswerFeedback && (remote ? Boolean(user) && legalAccepted && remote.status === 'playing' && onlineTurn && !busy : !busy);
  const finished = !capturePending && !question && !wrongAnswerFeedback && Object.keys(state.owners).length === state.rows * state.cols;
  const completedStage = mode==='local'||mode==='solo' ? localStageCompleted : serverStageCompleted;
  const stageUnlocked = Math.min(STAGE_COUNT,completedStage+1);
  const selectedStage = stageFor(stageId);
  const stageBusy=busy||!!question||(stageStarted&&!finished);
  const earnedBonus = Boolean(remote?.state.bonus_ready?.[state.turn]);
  const availableBonus = Number(remote?.state.bonus_tokens?.[state.turn] || 0);
  const streak = Number(remote?.state.streak?.[state.turn] || 0);
  const currentLocalSide: 'host'|'guest' = state.mode==='solo' ? 'host' : state.turn === 'guest' ? 'guest' : 'host';
  const currentCredits = remote ? progress.credits : localCredits[currentLocalSide];
  const currentCharms = remote ? (progress.time_charms || 0) : localCharms[currentLocalSide];
  const timeFreezeActive = remote
    ? Boolean(remote.state.time_freeze?.[player])
    : localFreeze[currentLocalSide];
  const showTimer = Boolean(question) && question?.deadline_at !== null && !timeFreezeActive;
  const timerText = secondsLeft === null ? '01:00' : String(Math.floor(secondsLeft/60)).padStart(2,'0')+':'+String(secondsLeft%60).padStart(2,'0');
  const world = worlds.find(w => w.slug === selectedStage.theme) || worlds[0];
  const questionBank = (locale==='he'||locale==='en')
    ? [
      ...(locale === 'en' ? englishQuestions : offlineQuestions),
      ...freshLocalQuestions(locale,countLocalReserve(locale))
    ]
    : internationalQuestions.filter(q=>q.locale===locale);
  const completed = Object.keys(state.owners).length;
  const percent = Math.round(completed / (state.rows * state.cols) * 100);

  const refresh = useCallback(async (id: string) => {
    if (!client) return;
    const { data, error } = await client.rpc('trivia_get_match', { p_match: id });
    if (!error && data) {
      const m = data as RemoteMatch;
      setRemote(prev => prev && prev.version > m.version ? prev : m);
      setQuestion(m.question || null);
      if(m.question?.text)rememberShownQuestion(m.question.text);
      setEdge(m.question?.edge || null);
      if (m.status === 'completed') setMessage('המשחק הסתיים, כל הכבוד!');
      if(m.state.campaign_stage && Number.isInteger(m.state.campaign_stage)){
        setStageId(m.state.campaign_stage);
        setSize(stageFor(m.state.campaign_stage).size);
        try{localStorage.setItem('trivia-stage-id-v1',String(m.state.campaign_stage))}catch{}
      }
      setStageStarted(m.status==='playing'||m.status==='waiting');
    } else if (error) setMessage('שגיאת טעינת משחק: ' + error.message);
  }, [client,rememberShownQuestion]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('trivia-language');
      if(isActiveLocale(stored))setLocale(stored);
    } catch{}
    setLanguageLoaded(true);
  }, []);
  useEffect(()=>{
    if(!languageLoaded)return;
    document.documentElement.lang=locale;
    document.documentElement.dir=localeDirection(locale);
    try{localStorage.setItem('trivia-language',locale)}catch{}
    if(user&&client)void client.rpc('trivia_set_locale',{p_locale:locale}).then(({error})=>{
      if(error)setMessage(locale==='en'?'Could not save language preference: '+error.message:'שמירת העדפת השפה נכשלה: '+error.message);
    });
  },[locale,languageLoaded,client,user?.id]);
  useEffect(() => {
    try {
      const saved = localStorage.getItem('trivia-personal-choice');
      if (saved) {
        const v = JSON.parse(saved) as { color: string; lineColor?: string; avatar: string };
        if (palettes.includes(v.color)) setColor(v.color);
        if (v.lineColor && /^#[0-9a-fA-F]{6}$/.test(v.lineColor)) setLineColor(v.lineColor);
        if (avatars.includes(v.avatar)) setAvatar(v.avatar);
        setRemember(true);
      }
      const savedCapture=JSON.parse(localStorage.getItem('trivia-capture-settings-v1')||'{}') as {style?:CaptureStyle;ownerMode?:LocalOwnerMode;guestName?:string;guestColor?:string;guestAvatar?:string};
       if(['lumen','neon','seal','prism','token'].includes(savedCapture.style||''))setCaptureStyle(savedCapture.style!);
       if(['auto','manual','auto_with_override'].includes(savedCapture.ownerMode||''))setOwnerMode(savedCapture.ownerMode!);
       if(hasActualOpponent(savedCapture.guestName,localStorage.getItem('trivia-player-name')||''))setGuestName(savedCapture.guestName!.trim().slice(0,32));
       if(palettes.includes(savedCapture.guestColor||''))setGuestColor(savedCapture.guestColor!);
       if(avatars.includes(savedCapture.guestAvatar||''))setGuestAvatar(savedCapture.guestAvatar!);
       setSelectedTopics(parseTopicPreferences(JSON.parse(localStorage.getItem('trivia-question-topics-v1')||'null')));
       const storedSkin=localStorage.getItem('trivia-skin-v1');
       const migratedSkin:Record<string,SkinId>={royal:'regular',ocean:'urban',neon:'future',stone:'vintage',forest:'retro'};
       if(skins.some(item=>item.id===storedSkin))setSkin(storedSkin as SkinId);
       else if(storedSkin&&migratedSkin[storedSkin])setSkin(migratedSkin[storedSkin]);
       const seen=JSON.parse(localStorage.getItem('trivia-question-text-history-v1')||'[]') as string[];
      if(Array.isArray(seen))seenQuestionTexts.current=new Set(seen.filter(x=>typeof x==='string'));
      const storedPool=JSON.parse(localStorage.getItem('trivia-local-pool-release-v1')||'{}') as {he?:number;en?:number};
      const available={he:Math.max(0,Math.min(countLocalReserve('he'),Math.trunc(Number(storedPool.he)||0))),
        en:Math.max(0,Math.min(countLocalReserve('en'),Math.trunc(Number(storedPool.en)||0)))};
      localPoolRef.current=available;setLocalPoolRelease(available);
      const ids=JSON.parse(localStorage.getItem('trivia-used-question-ids')||'[]') as number[];
      if(Array.isArray(ids)){
        usedLocalQuestionIds.current=new Set(ids.filter(x=>Number.isInteger(x)));
        // Upgrade IDs-only legacy history into the permanent text fingerprints.
        for(const q of [...offlineQuestions,...englishQuestions,...freshLocalQuestionReserve,...internationalQuestions])
          if(usedLocalQuestionIds.current.has(q.id))
            seenQuestionTexts.current.add(canonicalQuestion(q.text));
      }
      try{localStorage.setItem('trivia-question-text-history-v1',JSON.stringify([...seenQuestionTexts.current]))}catch{}
      const savedRun=localStorage.getItem('trivia-stage-run-id');
      if(savedRun && /^local-[a-zA-Z0-9_-]{1,72}$/.test(savedRun))setStageRunId(savedRun);
      const storedName=selectPlayerName(localStorage.getItem('trivia-player-name'),null);
      if(storedName){setName(storedName);setNameSavedOnDevice(true)}
    } catch { /* storage may be disabled */ }
    try {
      setMuted(localStorage.getItem('trivia-sound-muted') === 'true');
      const v=localStorage.getItem('trivia-sound-volume');
      if (v !== null && Number.isFinite(Number(v))) setVolume(Math.max(0,Math.min(100,Number(v))));
    } catch {}
    try {
      if (!localStorage.getItem('trivia-tutorial-seen-v1')) setShowTutorial(true);
    } catch { setShowTutorial(true); }
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
      const savedLevel=Number(localStorage.getItem('trivia-stage-id-v1')||'1');
      const completed=Number(localStorage.getItem('trivia-stage-completed-v1')||'0');
      const safeCompleted=Number.isInteger(completed)?Math.min(30,Math.max(0,completed)):0;
      setLocalStageCompleted(safeCompleted);
      if(Number.isInteger(savedLevel)&&savedLevel>=1&&savedLevel<=Math.min(30,safeCompleted+1)){
        setStageId(savedLevel);setSize(stageFor(savedLevel).size);
      }
      setStageStarted(localStorage.getItem('trivia-stage-started-v1')==='true');
      const savedMode=localStorage.getItem('trivia-mode-v2');
      if(savedMode==='solo'||savedMode==='local'||savedMode==='online'||savedMode==='bot')setMode(savedMode);
    }catch{}
    try {
      const stored=localStorage.getItem('trivia-local-game-v1');
      if(stored){
        const value=JSON.parse(stored) as GameState;
        if(value && Number.isInteger(value.rows) && value.rows>=3 && value.rows<=6
          && value.cols===value.rows && value.edges && value.owners && value.scores){
          // Restore only a board whose size matches the saved locked campaign stage.
          const savedStage=Number(localStorage.getItem('trivia-stage-id-v1')||'1');
          const validStage=Number.isInteger(savedStage)&&savedStage>=1&&savedStage<=30?savedStage:1;
          if(stageFor(validStage).size===value.rows){
            const savedCapture=JSON.parse(localStorage.getItem('trivia-capture-settings-v1')||'{}') as {guestName?:string};
            const realGuest=hasActualOpponent(savedCapture.guestName,localStorage.getItem('trivia-player-name')||'');
            const migrating=value.mode==='local'&&!realGuest;
            const repaired=migrating?{...repairSoloBoard(value),mode:'solo' as const}:value;
            setLocal(repaired);setSize(repaired.rows);
            if(migrating){
              setMode('solo');localStorage.setItem('trivia-mode-v2','solo');
              // Restore earned credits and charms from the phantom player without clearing the board.
              try{
                const rewards=JSON.parse(localStorage.getItem('trivia-local-rewards')||'{}');
                localStorage.setItem('trivia-local-rewards',JSON.stringify({
                  credits:{host:Number(rewards.credits?.host||0)+Number(rewards.credits?.guest||0),guest:0},
                  charms:{host:Number(rewards.charms?.host||0)+Number(rewards.charms?.guest||0),guest:0},wallet:rewards.wallet
                }));
              }catch{}
            }
          }
        }
      }
    } catch { /* invalid save is ignored */ }
    try {
      const rewards=JSON.parse(localStorage.getItem('trivia-local-rewards')||'null');
      if(rewards?.credits) setLocalCredits(rewards.credits);
      if(rewards?.charms) setLocalCharms(rewards.charms);
      if(rewards?.wallet){const w=rewards.wallet;setLocalWallet({stars:Math.max(0,Number(w.stars)||0),fruits:Math.max(0,Number(w.fruits)||0),diamonds:Math.max(0,Number(w.diamonds)||0)});}
    }catch{}
    try{
      const pending=JSON.parse(localStorage.getItem('trivia-local-question')||'null') as Question|null;
      if(pending?.id && pending?.edge && [...offlineQuestions,...englishQuestions,...freshLocalQuestionReserve,...internationalQuestions].some(q=>q.id===pending.id)){
        setQuestion(pending);
        setEdge(pending.edge);
      }
    }catch{}
    setLocalReady(true);
    setOnline(navigator.onLine);
    const up=()=>setOnline(true);
    const down=()=>setOnline(false);
    window.addEventListener('online',up); window.addEventListener('offline',down);
    return ()=>{window.removeEventListener('online',up);window.removeEventListener('offline',down)};
  },[]);
  useEffect(()=>{
    if(!localReady)return;
    try{localStorage.setItem('trivia-capture-settings-v1',JSON.stringify({style:captureStyle,ownerMode,guestName,guestColor,guestAvatar}));}catch{}
  },[localReady,captureStyle,ownerMode,guestName,guestColor,guestAvatar]);
  useEffect(()=>{
    if(!localReady)return;
    try{localStorage.setItem('trivia-question-topics-v1',JSON.stringify(selectedTopics));}catch{}
  },[localReady,selectedTopics]);
  useEffect(()=>{
    if(!localReady)return;
    try{localStorage.setItem('trivia-skin-v1',skin)}catch{}
  },[localReady,skin]);
  useEffect(() => {
    if(!localReady) return;
    try { localStorage.setItem('trivia-sound-muted', String(muted));localStorage.setItem('trivia-sound-volume', String(volume)); } catch {}
  }, [muted,volume,localReady]);
  useEffect(()=>{
    if(!localReady)return;
    try {
      localStorage.setItem('trivia-stage-id-v1',String(stageId));
      localStorage.setItem('trivia-stage-completed-v1',String(localStageCompleted));
      localStorage.setItem('trivia-stage-started-v1',String(stageStarted));
    }catch{}
  },[localReady,stageId,localStageCompleted,stageStarted]);
  useEffect(()=>{
    if(!finished||!localReady)return;
    if(remote){
      if(client&&user)void client.rpc('trivia_get_campaign_progress').then(({data,error})=>{
        if(!error&&typeof data==='number')setServerStageCompleted(v=>Math.max(v,data));
      });
    }else{
      setLocalStageCompleted(v=>Math.max(v,stageId));
    }
  },[finished,remote?.id,stageId,localReady,client,user?.id]);

  useEffect(()=>{
    if(!localReady) return;
    try{localStorage.setItem('trivia-local-game-v1',JSON.stringify(local))}catch{}
  },[local,localReady]);
  useEffect(()=>{
    if(!localReady) return;
    try{localStorage.setItem('trivia-local-rewards',JSON.stringify({credits:localCredits,charms:localCharms,wallet:localWallet}))}catch{}
  },[localCredits,localCharms,localWallet,localReady]);
  useEffect(()=>{
    if(!localReady || remote) return;
    try{
      if(question?.id && question.edge) localStorage.setItem('trivia-local-question',JSON.stringify(question));
      else localStorage.removeItem('trivia-local-question');
    }catch{}
  },[question,localReady,remote]);

  useEffect(() => {
    if(!question) {setSecondsLeft(null);lastTickRef.current=null;return;}
    if(question.deadline_at === null) {setSecondsLeft(null);return;}
    const deadline=question.deadline_at ? new Date(question.deadline_at).getTime() : Date.now()+60_000;
    let cancelled=false;
    const update=()=>{
      if(cancelled) return;
      const left=Math.max(0,Math.ceil((deadline-Date.now())/1000));
      setSecondsLeft(previous=>previous===left?previous:left);
      if(left>=1&&(left<=10 || left%5===0)&&lastTickRef.current!==left){lastTickRef.current=left;play('clock');}
      if(left===0 && !timeoutBusy.current){
        timeoutBusy.current=true;
        if(remote&&client){
          void (async()=>{
            try{
              const {error}=await client.rpc('trivia_timeout_question',{p_match:remote.id});
              if(!error){
                setQuestion(null);setEdge(null);play('wrong');
                setMessage('הדקה הסתיימה! התור עבר.');
                await refresh(remote.id);
              }else if(!error.message.includes('No pending question')&&!error.message.includes('Question not expired')){
                setMessage('שגיאת זמן: '+error.message);
              }else await refresh(remote.id);
            }finally{timeoutBusy.current=false;}
          })();
        }else{
          setLocal(prev=>({...prev,turn:prev.mode==='solo'?'host':prev.turn==='host'?'guest':'host'}));
          setQuestion(null);setEdge(null);play('wrong');
          setMessage('הזמן נגמר! הקו לא נצבע והתור עבר.');
          timeoutBusy.current=false;
        }
      }
    };
    update();const interval=window.setInterval(update,1000);
    return()=>{cancelled=true;window.clearInterval(interval);lastTickRef.current=null;};
  },[question?.deadline_at,question?.id,question?.edge,question?.text,client,remote?.id,refresh,play]);

  useEffect(() => {
    if (!client || !user || !languageLoaded) return;
    let active = true;
    void (async () => {
      const room = new URLSearchParams(window.location.search).get('room');
      if (room && /^[a-f0-9-]{36}$/i.test(room)) setInvite(room);
      // Fetch server-side history on every signed-in device before local gameplay.
      const synced=await syncAccountQuestionHistory();
      if(!active)return;
      if(!synced && navigator.onLine)
        setMessage(locale==='en'?'Unable to sync your question history. Try again online.':'לא ניתן לסנכרן היסטוריית שאלות. נסה שוב כשיש חיבור תקין.');
      const {data:campProgress,error:campError}=await client.rpc('trivia_get_campaign_progress');
      if(!campError&&typeof campProgress==='number')setServerStageCompleted(campProgress);
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
        if(!localStorage.getItem('trivia-language') && p.locale && isActiveLocale(p.locale))setLocale(p.locale);
        const accountName=selectPlayerName(p.display_name,String(user?.user_metadata?.full_name||user?.user_metadata?.name||''));
        // Never replace a nickname typed during this visit or previously saved on this device.
        if(!nameEditedRef.current){
          const chosen=selectPlayerName(localStorage.getItem('trivia-player-name'),accountName);
          if(chosen){
            setName(chosen);
            try{localStorage.setItem('trivia-player-name',chosen);setNameSavedOnDevice(true)}catch{}
          }
        }
        if (p.remember_color) {
          setColor(p.color);setAvatar(p.avatar);setRemember(true);
          if(p.line_color) setLineColor(p.line_color);
        }
        if (data.progress) setProgress(data.progress as Progress);
      }
      const id = localStorage.getItem('trivia-match-' + user.id);
      if (id) await refresh(id);
    })();
    return () => { active = false; };
  }, [client, user, refresh, legalAccepted, languageLoaded, syncAccountQuestionHistory]);
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
    // Restarting this same stage is allowed, but unlocking another stage requires completion.
    if(stageId>stageUnlocked){setMessage(locale==='en'?'Finish the earlier stages to unlock this one.':'יש לסיים את השלבים הקודמים כדי לפתוח את השלב הזה.');return;}
    if (!validName) { setMessage('כדי להתחיל יש להזין שם שחקן של 2–32 תווים ולשמור אותו.'); return; }
    try { localStorage.setItem('trivia-player-name',name.trim()); } catch {}
    setBusy(true); setQuestion(null); setWrongAnswerFeedback(null); setEdge(null); setBonusSelect(false); setCapturePending(null);
    if(mode==='local' && !hasActualOpponent(guestName,name)){
      setMessage('כדי לשחק בשניים יש להקליד שם אמיתי של משתתף נוסף. למשחק לבד בחרו משחק עצמאי.');
      document.getElementById('local-guest-name')?.focus();setBusy(false);return;
    }
    if (mode === 'local'||mode === 'solo') {
      if(user&&client&&navigator.onLine&&!await syncAccountQuestionHistory()){
        setMessage(locale==='en'?'Unable to sync your question history. Please retry.':'אי אפשר להתחיל משחק מחובר לפני סנכרון היסטוריית השאלות.');
        setBusy(false);return;
      }
      const added=(locale==='he'||locale==='en')?expandLocalPool(locale):0;
      const nextRun='local-'+crypto.randomUUID();
      setStageRunId(nextRun);
      try{localStorage.setItem('trivia-stage-run-id',nextRun)}catch{}
      setRemote(null); setLocal(empty(selectedStage.size,mode==='local'?'local':'solo')); setLocalFreeze({host:false,guest:false});
      setStageStarted(true);
      setMessage(added>0
       ? (locale==='en'?added+' fresh reviewed questions added to your practice bank.':'נוספו '+added+' שאלות חדשות ממאגר מאושר.')
       : (locale==='en'?'Local game ready. Your previous questions will not repeat.':'משחק מקומי מוכן. שאלות שכבר הוצגו לא יחזרו.'));
    } else if (client && user && legalAccepted) {
      const {error:localeError}=await client.rpc('trivia_set_locale',{p_locale:locale});
      if(localeError){setMessage(localeError.message);setBusy(false);return;}
      // Unify previous local play with the signed-in, device-independent history.
      const localSeen=[...offlineQuestions,...englishQuestions,...freshLocalQuestionReserve,...internationalQuestions]
       .filter(q=>seenQuestionTexts.current.has(canonicalQuestion(q.text)))
       .map(q=>q.text);
      for(let offset=0;offset<localSeen.length;offset+=300){
        const {error:importError}=await client.rpc('trivia_import_local_history',{
          p_question_texts:localSeen.slice(offset,offset+300)
        });
        if(importError){setMessage('Unable to sync past questions: '+importError.message);setBusy(false);return;}
      }
      const {error:profileError}=await client.rpc('trivia_save_appearance',{
        p_name:name.trim(),p_color:color,p_line_color:lineColor,p_avatar:avatar,p_remember:remember
      });
      if(profileError){setMessage('שמירת שם השחקן נכשלה: '+profileError.message);setBusy(false);return;}
      const { data, error } = await client.rpc('trivia_create_campaign_match', { p_mode: mode, p_stage: stageId });
      if (error) setMessage(error.message);
      else if (data) {
        setStageStarted(true);
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
    if (!validName) {setMessage('יש להקליד שם שחקן לפני הצטרפות לחדר.');return;}
    setBusy(true);
    const {error:localeError}=await client.rpc('trivia_set_locale',{p_locale:locale});
    if(localeError){setMessage(localeError.message);setBusy(false);return;}
    const {error: profileError}=await client.rpc('trivia_save_appearance',{
      p_name:name.trim(),p_color:color,p_line_color:lineColor,p_avatar:avatar,p_remember:remember
    });
    if(profileError){setMessage(profileError.message);setBusy(false);return;}
    const { error } = await client.rpc('trivia_join_match', { p_match: invite });
    if (error) setMessage(error.message);
    else { localStorage.setItem('trivia-match-' + user.id, invite); await refresh(invite); setInvite(null); setMessage('הצטרפת למשחק!'); }
    setBusy(false);
  }
  async function pick(key: string) {
    if(!stageStarted)setStageStarted(true);
    if (!canPlay || finished || state.edges[key] || question || bonusSelect) return;
    if (remote && client) {
      setBusy(true);
      const { data, error } = await client.rpc('trivia_choose_edge', { p_match: remote.id, p_edge: key });
      if (error) setMessage(error.message);
      else { setEdge(key); setQuestion(data as Question); if(data?.text)rememberShownQuestion(String(data.text));await refresh(remote.id); }
      setBusy(false);
    } else {
      setEdge(key);
      const remaining=questionBank.filter(q=>
        selectedTopics.includes(topicForQuestion(q.category,q.text)) &&
        !usedLocalQuestionIds.current.has(q.id) && !seenQuestionTexts.current.has(canonicalQuestion(q.text)));
      // Rotate categories fairly: movies, music and TV are accessible from the first stage.
      // Never sacrifice the ban on repeating a previously seen question.
      const alternatives=remaining.filter(v=>v.category!==lastQuestionCategory.current);
      const pool=alternatives.length?alternatives:remaining;
      const categories=[...new Set(pool.map(v=>v.category))];
      const category=categories[Math.floor(Math.random()*categories.length)];
      const inCategory=pool.filter(v=>v.category===category);
      const q=usedLocalQuestionIds.current.size===0 && locale==='he'
        ? remaining.find(v=>v.text.includes('בירת אוסטרליה')) || inCategory[0]
        : inCategory[Math.floor(Math.random()*inCategory.length)];
      if(!q){
        setEdge(null);
        setMessage(locale==='en'?'No unused questions remain in your selected topics. Choose additional topics to continue the same stage.':'אין כרגע שאלות חדשות בנושאים שנבחרו. אפשר לסמן נושאים נוספים ולהמשיך באותו השלב בלי לאפס את הלוח.');
        return;
      }
      if(user&&client&&navigator.onLine){
        // Register the question globally before showing it on an authenticated device.
        setBusy(true);
        const {error}=await client.rpc('trivia_import_local_history',{p_question_texts:[q.text]});
        if(error){
          setEdge(null);setBusy(false);
          setMessage(locale==='en'?'Could not secure your question history. Please retry.':'שמירת היסטוריית השאלות נכשלה. נסה שוב.');
          return;
        }
        setBusy(false);
      }
      lastQuestionCategory.current=q.category;
      usedLocalQuestionIds.current.add(q.id);
      rememberShownQuestion(q.text);
      try{localStorage.setItem('trivia-used-question-ids',JSON.stringify([...usedLocalQuestionIds.current]))}catch{}
      setQuestion({id:q.id,text:q.text,answers:q.answers,locale,edge:key,premium:q.id%11===0,deadline_at:new Date(Date.now()+60_000).toISOString(),extensions:0});
    }
  }
  async function answer(i: number) {
    if (!question || (question.kind !== 'bonus' && !edge) || busy) return;
    if (question.deadline_at && Date.now() >= new Date(question.deadline_at).getTime()) {
      setMessage('הזמן הסתיים — אין אפשרות לשלוח תשובה מאוחרת.');
      return;
    }
    setBusy(true);
    if (remote && client) {
      const { data, error } = await client.rpc('trivia_answer', { p_match: remote.id, p_answer: i });
      if (error) setMessage(error.message);
      else {
        const gained = Number(data.gained || 0);
        if(data.correct===false){
          const idx=Number(data.correct_index);
          setWrongAnswerFeedback({text:question.text,answers:[...question.answers],selectedIndex:i,
            correctIndex:Number.isInteger(idx)&&idx>=0&&idx<question.answers.length?idx:null});
        }
        if (data.finished) play('win');
        else if (data.bonus && data.correct) play('bonus');
        else if (gained) play('capture');
        else play(data.correct ? 'correct' : 'wrong');
        setMessage(locale==='en'
          ? (data.bonus
              ? data.correct?'Golden question complete! Two bonus captures earned! ✨':'Golden question missed. Try a new streak.'
              : data.correct ? gained?'Great! You claimed '+gained+' squares!':'Correct! The line is yours!':'Wrong answer. Next player.')
          : (data.bonus
              ? data.correct?'שאלת הזהב הצליחה! הרווחת שני אסימוני סגירה ✨':'שאלת הזהב הוחמצה. אפשר לנסות שוב אחרי רצף חדש.'
              : data.correct ? gained?'מצוין! כבשת '+gained+' ריבועים!':'תשובה נכונה, הקו שלך!':'תשובה שגויה, התור עובר.'));
        setQuestion(null); setEdge(null);
        await refresh(remote.id);
        const { data: update } = await client.rpc('trivia_my_profile');
        if (update?.progress) setProgress(update.progress as Progress);
      }
    } else {
      if (!edge) { setBusy(false); return; }
      const q=[...englishQuestions,...offlineQuestions,...freshLocalQuestionReserve,...internationalQuestions].find(v=>v.id===question.id);
      if(!q){setMessage('לא נמצאה השאלה המקורית.');setBusy(false);return;}
      const correct = i === q.correct;
      if(question.kind==='premium_bonus'){
        const side:Side=question.premiumOwner || (local.mode==='solo'?'host':local.turn);
        if(correct){
          const captured=awardPremiumSquares(local,edge,side,2);
          const doubled={...captured.board,scores:{...captured.board.scores,[side]:captured.board.scores[side]+captured.captured.length}};
          setLocal(doubled);
          const amount=Math.max(10,captured.captured.length*20);
          setLocalCredits(prev=>({...prev,[side==='guest'?'guest':'host']:prev[side==='guest'?'guest':'host']+amount}));
          setLocalWallet(prev=>({...prev,stars:prev.stars+4,fruits:prev.fruits+captured.captured.length*2,diamonds:prev.diamonds+(captured.captured.length?1:0)}));
          play('bonus');
          playGameSound('coin',{muted,volume:volume/100},.28);
          playGameSound('star',{muted,volume:volume/100},.58);
          if(captured.captured.length)playGameSound('diamond',{muted,volume:volume/100},.85);
          setMessage(locale==='he'
            ? 'פרימיום! כבשת '+captured.captured.length+' ריבועים, ניקוד ופרסים כפולים.'
            : 'Premium bonus! '+captured.captured.length+' extra captures, double points and prizes.');
        }else{
          setWrongAnswerFeedback({text:question.text,answers:[...question.answers],selectedIndex:i,correctIndex:q.correct});
          play('wrong');
          setMessage(locale==='he'?'שאלת הפרימיום לא נענתה נכון. אפשר ללמוד את התשובה ולהמשיך.':'Premium bonus missed. Review the answer and continue.');
        }
        setQuestion(null);setEdge(null);setBusy(false);return;
      }
      if(!correct){
        setWrongAnswerFeedback({text:question.text,answers:[...question.answers],selectedIndex:i,correctIndex:q.correct});
      }
      const next = applyLocalAnswer(local, edge, correct, local.mode==='solo');
      setLocal(next);
      const newSquares=Object.keys(next.owners).filter(key=>!local.owners[key]);
      const gained = newSquares.length;
      if(gained && local.mode==='local' && ownerMode==='manual')setCapturePending({keys:newSquares,from:'new'});
      if (Object.keys(next.owners).length===next.rows*next.cols) play('win');
      else if (gained) play('capture');
      else play(correct ? 'correct' : 'wrong');
      setMessage(locale==='en'?
 (correct?(gained?'You captured '+gained+' squares!':'Correct answer!'):'Wrong answer!'):
 (correct?(gained?'סגרת '+gained+' ריבועים!':'תשובה נכונה!'):'תשובה שגויה!'));
      if(correct){
        setLocalWallet(prev=>({...prev,stars:prev.stars+1,fruits:prev.fruits+gained}));
        playGameSound('star',{muted,volume:volume/100},.25);
        if(gained)playGameSound('fruit',{muted,volume:volume/100},.48);
      }
      if(gained>0){
        setLocalCredits(prev=>({...prev,[local.mode==='solo'?'host':local.turn==='guest'?'guest':'host']:prev[local.mode==='solo'?'host':local.turn==='guest'?'guest':'host']+10*gained}));
        if(Object.keys(next.owners).length===next.rows*next.cols && ownerMode!=='manual'){
          const winner=next.scores.host>next.scores.guest?'host':next.scores.guest>next.scores.host?'guest':null;
          if(winner)setLocalCharms(prev=>({...prev,[winner]:prev[winner]+1}));
        }
      }
      if(correct && question.premium){
        const unused=questionBank.filter(item=>item.id!==q.id &&
          selectedTopics.includes(topicForQuestion(item.category,item.text)) &&
          !usedLocalQuestionIds.current.has(item.id) &&
          !seenQuestionTexts.current.has(canonicalQuestion(item.text)));
        const followUp=unused.length?unused[Math.floor(Math.random()*unused.length)]:null;
        if(followUp){
          usedLocalQuestionIds.current.add(followUp.id);rememberShownQuestion(followUp.text);
          try{localStorage.setItem('trivia-used-question-ids',JSON.stringify([...usedLocalQuestionIds.current]))}catch{}
          setQuestion({id:followUp.id,text:followUp.text,answers:[...followUp.answers],locale,edge,
            kind:'premium_bonus',premiumOwner:local.mode==='solo'?'host':local.turn,
            deadline_at:new Date(Date.now()+60_000).toISOString(),extensions:0});
          setMessage(locale==='he'?'תשובת פרימיום נכונה! שאלת בונוס פותחת עד שני ריבועים סמוכים וניקוד כפול.':
            'Premium answer correct! Bonus question unlocks up to two neighbouring squares and double rewards.');
          play('bonus');setBusy(false);return;
        }
      }
      setQuestion(null); setEdge(null);
    }
    setBusy(false);
  }

  async function extendQuestionTime() {
    if(!question || question.deadline_at===null || !question.deadline_at || (secondsLeft??0)<=0) return;
    if((question.extensions||0)>=1){setMessage('אפשר להאריך כל שאלה פעם אחת בלבד.');return;}
    if(currentCredits<25){setMessage('להארכת זמן דרושים 25 קרדיטים שנצברו במשחק.');return;}
    if(remote&&client){
      setBusy(true);
      const {data,error}=await client.rpc('trivia_extend_question',{p_match:remote.id});
      if(error)setMessage(error.message);
      else{
        setQuestion(prev=>prev?{...prev,deadline_at:String(data.deadline_at),extensions:1}:prev);
        setProgress(prev=>({...prev,credits:Math.max(0,prev.credits-25)}));
        setMessage('רכשת 30 שניות נוספות!');
        play('bonus');
        await refresh(remote.id);
      }
      setBusy(false);
    }else{
      setLocalCredits(prev=>({...prev,[currentLocalSide]:prev[currentLocalSide]-25}));
      setQuestion(prev=>prev?{...prev,deadline_at:new Date(new Date(prev.deadline_at!).getTime()+30_000).toISOString(),extensions:1}:prev);
      play('bonus');
      setMessage('נוספו 30 שניות תמורת 25 קרדיטים.');
    }
  }

  async function activateTimeCharm(){
    if(!validName || finished || timeFreezeActive || currentCharms<1){setMessage('אין קמע זמן פנוי, או שהוא כבר פעיל בשלב הזה.');return;}
    if(remote&&client){
      setBusy(true);
      const{error}=await client.rpc('trivia_activate_time_charm',{p_match:remote.id});
      if(error)setMessage(error.message);
      else{
        setProgress(prev=>({...prev,time_charms:Math.max(0,(prev.time_charms||0)-1)}));
        await refresh(remote.id);
        play('bonus');
        setMessage('קמע הזמן הופעל! לא יהיה טיימר לשאלות שלך עד סוף השלב.');
      }
      setBusy(false);
    }else{
      setLocalCharms(prev=>({...prev,[currentLocalSide]:prev[currentLocalSide]-1}));
      setLocalFreeze(prev=>({...prev,[currentLocalSide]:true}));
      if(question)setQuestion(prev=>prev?{...prev,deadline_at:null}:prev);
      play('bonus');
      setMessage('קמע הזמן פעיל בשבילך עד תום השלב.');
    }
  }

  async function startGoldQuestion() {
    if (!client || !remote || !canPlay || !earnedBonus || question) return;
    setBusy(true);
    const { data, error } = await client.rpc('trivia_bonus_question',{p_match:remote.id});
    if (error) setMessage(error.message);
    else if (data) {
      setQuestion(data as Question);
      setEdge(null);
      await refresh(remote.id);
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

  // Debounced account persistence for signed-in players. Local saving happens immediately on input.
  useEffect(()=>{
    if(!client || !user || !legalAccepted || !localReady || !validName || !nameEditedRef.current)return;
    const nickname=normalizedPlayerName(name);
    const key=user.id+':'+nickname;
    if(lastSyncedNameRef.current===key)return;
    const timeout=window.setTimeout(()=>{
      void client.rpc('trivia_save_appearance',{
        p_name:nickname,p_color:color,p_line_color:lineColor,p_avatar:avatar,p_remember:remember
      }).then(({error})=>{
        if(error){setNameSyncedToAccount(false);return;}
        lastSyncedNameRef.current=key;
        setNameSyncedToAccount(true);
      });
    },900);
    return ()=>window.clearTimeout(timeout);
  },[name,user?.id,client,legalAccepted,localReady,validName,color,lineColor,avatar,remember]);

  function dismissTutorial() {
    setShowTutorial(false);
    setTutorialPage(0);
    try { localStorage.setItem('trivia-tutorial-seen-v1','1'); } catch {}
  }

  async function saveProfile() {
    if (!validName) {setMessage('שם שחקן חייב להכיל לפחות שני תווים.');return;}
    try {
      localStorage.setItem('trivia-player-name',normalizedPlayerName(name));
      setNameSavedOnDevice(true);
      if(remember) localStorage.setItem('trivia-personal-choice',JSON.stringify({color,lineColor,avatar}));
      else localStorage.removeItem('trivia-personal-choice');
    } catch {}
    if (client && user && legalAccepted) {
      const { error } = await client.rpc('trivia_save_appearance', {
        p_name:name.trim(),p_color:color,p_line_color:lineColor,p_avatar:avatar,p_remember:remember
      });
      if(!error){lastSyncedNameRef.current=user.id+':'+normalizedPlayerName(name);setNameSyncedToAccount(true)}
      setMessage(error ? error.message : 'הפרופיל נשמר!');
    } else setMessage('העדפות נשמרו במכשיר בלבד');
  }

  function chooseCaptureOwner(owner:LocalOwner){
    if(!capturePending || remote || local.mode==='solo')return;
    const next=reassignCapture(local,capturePending.keys,owner);
    setLocal(next);
    if(capturePending.from==='new' && Object.keys(next.owners).length===next.rows*next.cols){
      const winner=next.scores.host>next.scores.guest?'host':next.scores.guest>next.scores.host?'guest':null;
      if(winner)setLocalCharms(prev=>({...prev,[winner]:prev[winner]+1}));
      play('win');
    }
    setCapturePending(null);
    setMessage(locale==='en'?'Square assigned to '+(owner==='host'?name:guestName):'הריבוע שויך ל'+(owner==='host'?name:guestName));
  }
  function chooseStage(nextId:number) {
    if(!canOpenStage(nextId,completedStage,stageId,finished) || stageBusy){
      setMessage(locale==='en'?'Finish the current stage before opening another.':'יש לסיים את השלב הנוכחי לפני שעוברים לשלב אחר.');
      return;
    }
    if(nextId===stageId)return;
    const next=stageFor(nextId);
    if(locale==='he'||locale==='en')expandLocalPool(locale);
    const nextRun='local-'+crypto.randomUUID();
    setStageRunId(nextRun);
    try{
      localStorage.setItem('trivia-stage-run-id',nextRun);
      localStorage.setItem('trivia-stage-id-v1',String(nextId));
    }catch{}
    setStageId(nextId);setSize(next.size);
    setStageStarted(false);setRemote(null);setLocal(empty(next.size,mode==='local'?'local':'solo'));
    setQuestion(null);setEdge(null);setTrace(null);gesture.current=null;
    setKeyboardStart(null);setBonusSelect(false);setCapturePending(null);setLocalFreeze({host:false,guest:false});
    setMessage(locale==='en'?('Stage '+nextId+' unlocked. Draw between adjacent dots.'):('שלב '+nextId+' נפתח. גרור קו בין נקודות סמוכות.'));
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
    if (!canPlay || finished || !!question || bonusSelect || (event.pointerType === 'mouse' && event.button !== 0)) {
      if(!validName && !showTutorial){setMessage(locale==='en'?'Enter a player name to draw your first line.':'כדי לצייר קו, הזן קודם שם שחקן.');document.getElementById('quick-player-name')?.focus();}
      return;
    }
    const start = nearestDot(boardPoint(event), state.rows, state.cols);
    if (!start) return;
    event.preventDefault();
    gesture.current = { pointerId: event.pointerId, start };
    inkPointsRef.current=[dotXY(start, state.rows, state.cols)];
    play('marker');
    event.currentTarget.setPointerCapture(event.pointerId);
    setTrace({ start, target: dotXY(start, state.rows, state.cols), end: null, ink: [dotXY(start, state.rows, state.cols)] });
  }

  function onBoardPointerMove(event: ReactPointerEvent<SVGSVGElement>) {
    const active=gesture.current;
    if(!active || event.pointerId!==active.pointerId)return;
    event.preventDefault();
    const target=boardPoint(event);
    const start=dotXY(active.start,state.rows,state.cols);
    if(Math.hypot(target.x-start.x,target.y-start.y)>10)play('marker');
    const end=nearestDot(target,state.rows,state.cols);
    const valid=end?edgeBetween(active.start,end,state.rows,state.cols):null;
    const snapped=valid&&!state.edges[valid]&&end?dotXY(end,state.rows,state.cols):target;
    const points=inkPointsRef.current;
    const last=points[points.length-1];
    if(!last || Math.hypot(snapped.x-last.x,snapped.y-last.y)>1.6){
      points.push(snapped);
      if(points.length>56)points.splice(1,points.length-56);
    }
    // Update only the active SVG paths: a drag no longer re-renders the entire board.
    const d=points.map((p,i)=>(i?'L':'M')+p.x.toFixed(1)+' '+p.y.toFixed(1)).join(' ');
    inkGlowRef.current?.setAttribute('d',d);
    inkLineRef.current?.setAttribute('d',d);
    inkCursorRef.current?.setAttribute('cx',String(snapped.x));
    inkCursorRef.current?.setAttribute('cy',String(snapped.y));
  }

  function onBoardPointerUp(event: ReactPointerEvent<SVGSVGElement>) {
    const active = gesture.current;
    if (!active || event.pointerId !== active.pointerId) return;
    const end = nearestDot(boardPoint(event), state.rows, state.cols);
    const chosen = end ? edgeBetween(active.start, end, state.rows, state.cols) : null;
    gesture.current = null;
    inkPointsRef.current=[];
    setTrace(null);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (chosen && !state.edges[chosen]) { play('draw'); void pick(chosen); }
    else setMessage('חבר שתי נקודות סמוכות בגרירה אחת כדי לקבל שאלה.');
  }

  function onBoardPointerCancel(event: ReactPointerEvent<SVGSVGElement>) {
    if (gesture.current?.pointerId !== event.pointerId) return;
    gesture.current = null;
    inkPointsRef.current=[];
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
    guest: state.mode==='solo'?color:state.mode==='local' ? guestColor : player === 'guest' && remote?.state.mode === 'online' ? color : remote?.players?.guest?.color || '#FA9143',
    bot: '#FA9143'
  };
  const lineColors: Record<Side,string> = {
    host: player === 'host' ? lineColor : remote?.players?.host?.line_color || '#358CFF',
    guest: state.mode==='solo'?lineColor:state.mode==='local'?guestColor:player === 'guest' && remote?.state.mode === 'online' ? lineColor : remote?.players?.guest?.line_color || '#F97316',
    bot: '#FB923C'
  };
  const opponentIcon = state.mode==='local' ? guestAvatar : remote?.players?.[player === 'host'?'guest':'host']?.avatar || '🐲';
  const opponentName = state.mode==='local' ? guestName : remote?.state.mode === 'bot' ? tr('המחשב') : remote?.players?.[player === 'host'?'guest':'host']?.name || tr('שחקן 2');
  const drawLine = (key: string, x1: number, y1: number, x2: number, y2: number) => {
    const owner = state.edges[key];
    return <g key={key} pointerEvents='none'>
      {owner && <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={lineColors[owner]} strokeWidth='17' strokeOpacity='.26' strokeLinecap='round' />}
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={owner ? lineColors[owner] : '#B7D1F6'} strokeOpacity={owner ? .95 : .2} strokeWidth={owner ? 10 : 3} strokeLinecap='round' strokeDasharray={owner ? undefined : '1 11'}/>
      {owner && <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={lineColors[owner]} strokeOpacity='.42' strokeWidth='4' strokeLinecap='round' />}
      {owner && <line x1={x1+1} y1={y1+1} x2={x2+1} y2={y2+1} stroke='#FFFFFF' strokeOpacity='.12' strokeWidth='1.5' strokeLinecap='round' />}
    </g>;
  };
  const step = 288 / state.cols;
  const inviteLink = remote?.state.mode === 'online' ? typeof window !== 'undefined' ? window.location.origin + '/?room=' + remote.id : '' : '';
  const stageLocalReward=useCallback((prize:string)=>{
    if(prize.includes('קרדיטים')){
      const amount=Number.parseInt(prize,10)||0;
      setLocalCredits(prev=>({...prev,host:prev.host+amount}));
    }else if(prize.includes('קמע')){
      setLocalCharms(prev=>({...prev,host:prev.host+1}));
    }else if(prize.includes('פירות')){
      setLocalWallet(prev=>({...prev,fruits:prev.fruits+(Number.parseInt(prize,10)||0)}));
      playGameSound('fruit',{muted,volume:volume/100},.15);
    }else if(prize.includes('יהלום')){
      setLocalWallet(prev=>({...prev,diamonds:prev.diamonds+1}));
      playGameSound('diamond',{muted,volume:volume/100},.15);
    }
    if(prize.includes('קרדיטים'))playGameSound('coin',{muted,volume:volume/100},.15);
    setMessage('קיבלת את הפרס: '+prize);
  },[muted,volume]);
  const stageRemoteReward=useCallback(()=>{
    if(client)void client.rpc('trivia_my_profile').then(({data})=>{
      if(data?.progress)setProgress(data.progress as Progress);
    });
  },[client]);
  const advanceStage=()=>{
    if(!finished||stageId>=STAGE_COUNT||stageId>completedStage)return;
    chooseStage(stageId+1);
  };
  const themeIndex = Math.max(0, worlds.findIndex(w => w.size === world.size));
  const displayWorld={
    name:locale==='en'?selectedStage.nameEn:selectedStage.nameHe,
    subtitle:locale==='en'?selectedStage.subtitleEn:selectedStage.subtitleHe
  };
  const decorative = ['🍃', '💠', '✨', '🌠'][themeIndex];
  return <main className={'trivia-app theme-' + world.slug + ' skin-' + skin} style={css.main} dir={localeDirection(locale)} lang={locale}>
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
      .google-player-header{display:inline-flex;align-items:center;gap:12px;direction:rtl;background:#132857BB;border:1px solid #E4EFFF66;border-radius:99px;padding:6px 14px;margin-bottom:11px;max-width:100%;text-align:right;box-shadow:0 5px 20px #08143260}
      .eyebrow{color:#FFE68C;font-size:12px;letter-spacing:2.2px;font-weight:900}
      .hero h1{font-size:clamp(37px,5vw,65px);letter-spacing:-1.4px;margin:4px;color:#FFFFFF;text-shadow:0 4px 26px #AAB4FF60}
      .hero p{font-size:15px;color:#EBF2FF;margin:6px}
      .hero-name{margin:14px auto 0;max-width:440px;display:flex;align-items:center;gap:9px;justify-content:center;flex-wrap:wrap;background:rgba(13,30,65,.58);padding:9px 13px;border:1px solid #E3EDFF70;border-radius:15px}
      .hero-name label{font-size:13px;color:#FFE5A0;font-weight:900}
      .hero-name input{width:min(100%,230px);border-radius:9px;border:2px solid #DCE9FF;background:#FFF;color:#192A54;padding:10px;font-size:15px;font-weight:900}
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
      .arena-inner{
        position:relative;z-index:1;border-radius:19px;overflow:hidden;
        background-color:rgba(244,250,255,.105);
        background-image:linear-gradient(rgba(214,235,255,.25) 1px,transparent 1px),
          linear-gradient(90deg,rgba(214,235,255,.25) 1px,transparent 1px);
        background-size:24px 24px;
        border:1px solid rgba(237,246,255,.65);
        box-shadow:0 13px 22px #07122965,inset 0 0 26px rgba(255,255,255,.08);
      }
      .arena-inner:before{
        content:'';position:absolute;left:4px;top:14px;bottom:14px;width:9px;
        background:radial-gradient(circle,rgba(236,247,255,.83) 2.5px,transparent 3.4px) center top/9px 23px repeat-y;
        pointer-events:none;opacity:.8;
      }
      .arena-inner:after{
        content:'';position:absolute;inset:0;pointer-events:none;
        background:linear-gradient(90deg,rgba(255,115,141,.28) 1px,transparent 1px);
        background-size:100% 100%;background-position:24px 0;background-repeat:no-repeat;
        opacity:.45;
      }
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
      .hourglass-spin{display:inline-block;animation:timeglass-turn 3s ease-in-out infinite;transform-origin:center center}
      .question-timer{display:flex;justify-content:center;align-items:center;gap:10px;background:rgba(8,20,52,.42);border:1px solid #FFF3B380;border-radius:14px;padding:12px;margin:15px 0;color:#FFE6A0;font-size:23px;font-weight:900;font-variant-numeric:tabular-nums}
      .question-timer.urgent{color:#FFE1E1;border-color:#F97F7F;background:#732F45AA}
      .question-timer .clock-label{font-size:12px;font-weight:900}
      @keyframes timeglass-turn{0%,30%{transform:rotate(0deg)}55%,95%{transform:rotate(180deg)}100%{transform:rotate(360deg)}}
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
    <GameTimeBar locale={locale}/>
    <div className='skin-picker-bar'>
      <button type='button' className='skin-palette-trigger' aria-expanded={skinPickerOpen}
        aria-controls='skin-picker-panel' onClick={()=>setSkinPickerOpen(v=>!v)}
        aria-label={tr('בחר סקין למשחק')} title={tr('בחר סקין למשחק')}>
        <span className='skin-palette-icon' aria-hidden='true'>🎨</span><span>{tr('עיצוב המשחק')}</span>
      </button>
      {skinPickerOpen&&<section id='skin-picker-panel' className='skin-picker-panel' aria-label={tr('בחר סקין למשחק')}>
        <div className='skin-picker-title'>{locale==='he'?'6 סקינים לבחירה · ההתקדמות נשמרת':'6 skins to choose from · progress is preserved'}</div>
        <div className='skin-picker-options' role='group' aria-label={tr('ערכות עיצוב')}>
          {skins.map(theme=><button type='button' key={theme.id} className='skin-picker-item'
            aria-pressed={skin===theme.id} onClick={()=>{setSkin(theme.id);setSkinPickerOpen(false)}}>
            <span className='skin-picker-swatch' aria-hidden='true' style={{background:`linear-gradient(135deg,${theme.colors.join(',')})`}}/>
            <strong>{locale==='he'?theme.he:theme.en}</strong>
            {skin===theme.id&&<span className='skin-picker-selected' aria-hidden='true'>✓</span>}
          </button>)}
        </div>
      </section>}
    </div>
    <header className='hero'>
      {user && <div className='google-player-header' aria-label={tr('החשבון המחובר')}>
        {googlePhoto ? <img src={googlePhoto} referrerPolicy='no-referrer' alt={tr('תמונת הפרופיל שלך מ-Google')}
           style={{width:44,height:44,objectFit:'cover',borderRadius:'50%',border:'2px solid #FFE08A'}} />
          : <span aria-hidden='true' style={{fontSize:28}}>{avatar}</span>}
        <span><strong>{googleName || name || 'שחקן מחובר'}</strong><small style={{display:'block',fontSize:11,color:'#DAE9FF'}}>{providerGoogle ? 'מחובר באמצעות Google' : 'מחובר לחשבון המשחק'}</small></span>
      </div>}
      <div className='locale-switch' role='group' aria-label={locale==='he'?'בחירת שפת המשחק':'Game language'}>
        <button type='button' lang='he' aria-pressed={locale==='he'} disabled={!!question}
          className='locale-option' onClick={()=>setLocale('he')}>{tr("עברית")}</button>
        <button type='button' lang='en' aria-pressed={locale==='en'} disabled={!!question}
          className='locale-option' onClick={()=>setLocale('en')}>English</button>
        <button type='button' lang='ru' aria-pressed={locale==='ru'} disabled={!!question} className='locale-option'
          onClick={()=>setLocale('ru')}>Русский</button>
        <button type='button' lang='fr' aria-pressed={locale==='fr'} disabled={!!question} className='locale-option'
          onClick={()=>setLocale('fr')}>Français</button>
        <button type='button' lang='ar' aria-pressed={locale==='ar'} disabled={!!question} className='locale-option'
          onClick={()=>setLocale('ar')}>العربية</button>
      </div>
      <div className='eyebrow'>✦ TRIVIA SQUARES · ADVENTURE ✦</div>
      <h1>{tr('טריוויה ריבועים')}</h1>
      <p>{tr("חברו נקודות, ענו נכון, כבשו ריבועים והפכו לאלופי הטריוויה!")}</p>
      <div className='hero-name'>
        <label htmlFor='quick-player-name'>{tr("שם שחקן (חובה)")}</label>
        <input id='quick-player-name' type='text' minLength={2} maxLength={32} required
          value={name} onChange={e=>updatePlayerName(e.target.value)}
          placeholder={tr('הקלד שם לפני המשחק')} autoComplete='nickname'/>
        {validName && nameSavedOnDevice && <span className='player-name-autosaved' role='status'>
          {locale==='en'?(nameSyncedToAccount?'Name saved on device and account':'Name saved automatically on this device'):(nameSyncedToAccount?'השם נשמר במכשיר ובחשבון':'השם נשמר אוטומטית במכשיר')}
        </span>}
      </div>
    </header>

    <section className='campaign-section' aria-label={locale==='en'?'Thirty sequential stages':'שלושים שלבים לפי סדר'}>
      <div className='campaign-heading'>
        <h2>{locale==='en'?'Adventure: 30 stages':'הרפתקה: 30 שלבים'}</h2>
        <span>{locale==='en'?'Completed: ':'הושלמו: '}{completedStage} / {STAGE_COUNT}</span>
      </div>
      <div className='campaign-progress' role='progressbar' aria-valuemin={0} aria-valuemax={30} aria-valuenow={completedStage}
           aria-label={locale==='en'?'Completed campaign stages':'שלבים שהושלמו'}>
        <span style={{width:(completedStage/STAGE_COUNT*100)+'%'}}/>
      </div>
      <div className='campaign-track' aria-label={locale==='en'?'Select an unlocked stage':'בחירת שלב פתוח'}>
        {CAMPAIGN_STAGES.map(stage=>{
          const unlocked=stage.id<=stageUnlocked;
          const isSelected=stage.id===stageId;
          const enabled=unlocked&&(isSelected||!stageBusy)&&(!stageStarted||finished||isSelected);
          return <button key={stage.id} type='button' className={'campaign-stage-card theme-card-'+stage.theme}
             aria-current={isSelected?'step':undefined}
             aria-disabled={!enabled} disabled={!enabled} data-stage={stage.id} data-locked={!unlocked}
             onClick={()=>chooseStage(stage.id)}>
            <span className='campaign-stage-number'>{isSelected?'✦ ':unlocked?'': '🔒 '}{String(stage.id).padStart(2,'0')}</span>
            <strong className='campaign-stage-icon' aria-hidden='true'>{stage.icon}</strong>
            <span className='campaign-stage-title'>{locale==='en'?stage.nameEn:stage.nameHe}</span>
            <small>{unlocked?(locale==='en'?'Board':'לוח')+' '+stage.size+'×'+stage.size:(locale==='en'?'Locked':'נעול')}</small>
          </button>
        })}
      </div>
      <p className='campaign-rule'>{locale==='en'
        ?'Stages unlock one at a time. Finish every square of the current board to open the next stage.'
        :'כל שלב נפתח רק אחרי שסוגרים את כל הריבועים בשלב שלפניו. אי אפשר לדלג על שלבים.'}</p>
    </section>

    <div className='game-grid'>
      <section className='glass-panel arena-panel'>
        <div className='arena-title'>
          <div><h2>{world.icon} {displayWorld.name}</h2><p>{displayWorld.subtitle} • {state.rows * state.cols} {tr(' ריבועים').trim()}</p></div>
          <div className='level-pill'>{locale==='en'?'Stage ':'שלב '}{stageId} / {STAGE_COUNT}</div>
        </div>
        <div className='scoreboard'>
          <div className='player-tile right-side'>
            <div className='portrait'>{remote && player === 'guest' ? opponentIcon : avatar}</div>
            <div><div className='score-name'>{remote?.players?.host?.name || name || tr('שחקן 1')}</div><div className='score-num'>{state.scores.host}</div></div>
          </div>
          <div className='versus'>{tr((state.mode === 'local' ? state.turn === 'host' : state.turn === player) ? 'התור שלך' : 'תור היריב')}<div style={{ fontSize: 17 }}>⚔️</div></div>
          {state.mode!=='solo' && <div className='player-tile left-side other'>
            <div className='portrait'>{state.mode === 'bot' ? '🤖' : state.mode==='local' ? guestAvatar : remote?.players?.guest?.avatar || '🐲'}</div>
            <div><div className='score-name'>{state.mode === 'bot' ? tr('המחשב') : state.mode==='local' ? guestName : remote?.players?.guest?.name || tr('שחקן 2')}</div><div className='score-num'>{state.scores.guest + state.scores.bot}</div></div>
          </div>}
        </div>
        <div className={'arena ' + world.slug}>
          <div className='arena-inner'>
            <svg
              ref={boardRef}
              className='board'
              viewBox='0 0 328 328'
              role='group'
              aria-label={locale==='en'
   ? 'Board '+displayWorld.name+': draw between adjacent dots. Keyboard users can press Tab then Enter on the dots.'
   : 'לוח '+world.name+': גרור מנקודה לנקודה סמוכה. ניווט מקלדת באמצעות Tab ו-Enter על הנקודות.'}
              onPointerDown={onBoardPointerDown}
              onPointerMove={onBoardPointerMove}
              onPointerUp={onBoardPointerUp}
              onPointerCancel={onBoardPointerCancel}
            >
              <defs>
                <filter id='lineGlow' x='-50%' y='-50%' width='200%' height='200%'><feGaussianBlur stdDeviation='4' /></filter>
                <radialGradient id='dotGlow'><stop offset='0%' stopColor='#FFFFFF'/><stop offset='58%' stopColor='#D7EAFF'/><stop offset='100%' stopColor='#7BA9ED'/></radialGradient>
                <linearGradient id='cellTint' x1='0' y1='0' x2='1' y2='1'><stop offset='0%' stopColor='#FFFFFF' stopOpacity='.12'/><stop offset='100%' stopColor='#FFFFFF' stopOpacity='.015'/></linearGradient>
              </defs>
              {Array.from({ length: state.rows }, (_, r) => Array.from({ length: state.cols }, (_, c) => {
                const owner = state.owners[r + '-' + c];
                const w = 288 / state.cols;
                const h = 288 / state.rows;
                const x = 20 + c * w + 5;
                const y = 20 + r * h + 5;
                const ownerName=state.mode==='solo'?(name||'Player 1'):owner==='host'?(remote?.players?.host?.name||name||'Player 1'):owner==='guest'?(state.mode==='local'?guestName:remote?.players?.guest?.name||'Player 2'):'Computer';
                const ownerIcon=state.mode==='solo'?avatar:owner==='host'?(remote?.players?.host?.avatar||avatar):owner==='guest'?(state.mode==='local'?guestAvatar:remote?.players?.guest?.avatar||'👑'):'🤖';
                const editable=Boolean(owner && !remote && state.mode==='local' && ownerMode!=='auto' && !bonusSelect && !question);
                return <g key={'cell-' + r + '-' + c} pointerEvents={bonusSelect || editable ? undefined : 'none'}>
                  {owner
                    ? <CaptureTile row={r} col={c} x={x} y={y} width={w-10} height={h-10}
                        color={colors[owner]} name={ownerName} icon={ownerIcon} style={captureStyle}
                        locale={locale} selectable={editable} onSelect={()=>setCapturePending({keys:[r+'-'+c],from:'edit'})}/>
                    : <rect x={x} y={y} width={w-10} height={h-10} rx='10' fill='url(#cellTint)'/>}
                  {bonusSelect && !owner && <rect x={x} y={y} width={w-10} height={h-10} rx='10'
                    role='button' tabIndex={0} aria-label={locale==='en'?'Capture square at row '+(r+1)+', column '+(c+1):'כבוש ריבוע בשורה '+(r+1)+' עמודה '+(c+1)}
                    onClick={()=>void claimBonusSquare(r,c)}
                    onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();void claimBonusSquare(r,c)}}}
                    fill='#FFE18C' fillOpacity='.22' stroke='#FFE18C' strokeWidth='3' strokeDasharray='6 4' style={{cursor:'pointer'}} />}
                  {!owner && <text x={x+(w-10)/2} y={y+h*.62} textAnchor='middle'
                    fontSize={Math.min(24,w*.3)} opacity='.22' aria-hidden='true'>{decorative}</text>}
                </g>;
              }))}
              {Array.from({ length: state.rows + 1 }, (_, r) => Array.from({ length: state.cols }, (_, c) => drawLine('h-' + r + '-' + c, 20 + c * step, 20 + r * step, 20 + (c + 1) * step, 20 + r * step)))}
              {Array.from({ length: state.rows }, (_, r) => Array.from({ length: state.cols + 1 }, (_, c) => drawLine('v-' + r + '-' + c, 20 + c * step, 20 + r * step, 20 + c * step, 20 + (r + 1) * step)))}
              {trace && <g pointerEvents='none'>
                <path ref={inkGlowRef} d={'M'+trace.target.x+' '+trace.target.y} fill='none' stroke={lineColor} strokeOpacity='.35' strokeWidth='19' strokeLinecap='round' strokeLinejoin='round' filter='url(#lineGlow)'/>
                <path ref={inkLineRef} d={'M'+trace.target.x+' '+trace.target.y} fill='none' stroke={lineColor} strokeWidth='10' strokeLinecap='round' strokeLinejoin='round'/>
                <circle ref={inkCursorRef} cx={trace.target.x} cy={trace.target.y} r='6' fill='#FFF1BE' fillOpacity='.6'/>
              </g>}
              {Array.from({ length: state.rows + 1 }, (_, r) => Array.from({ length: state.cols + 1 }, (_, c) => {
                const dot: Dot = { row: r, col: c };
                const selected = trace?.start.row === r && trace?.start.col === c || trace?.end?.row === r && trace?.end?.col === c || keyboardStart?.row === r && keyboardStart?.col === c;
                const px = dotXY(dot, state.rows, state.cols);
                return <g key={'dot-' + r + '-' + c}>
                  <circle cx={px.x} cy={px.y} r={selected ? 13 : 10} fill='#BBD9FF' fillOpacity={selected ? '.35' : '.16'} pointerEvents='none' />
                  <circle cx={px.x} cy={px.y} r={selected ? 7.3 : 5.5} fill={selected ? '#FFE48A' : 'url(#dotGlow)'} stroke={selected ? '#FFFFFF' : '#D9EAFF'} strokeWidth='1.5' pointerEvents='none' />
                  <circle cx={px.x} cy={px.y} r='13' fill='transparent' role='button' tabIndex={canPlay ? 0 : -1} aria-label={locale==='en'?'Dot row '+(r+1)+', column '+(c+1):'נקודה '+(r+1)+', '+(c+1)} onKeyDown={event => onDotKeyDown(event, dot)} />
                </g>;
              }))}
            </svg>
          </div>
        </div>
        {!validName && <div className='board-start-hint' role='status'>
          <label htmlFor='board-start-name'>{locale==='en'?'Enter your name to unlock marker drawing':'כדי לצייר קו ראשון, הכנס שם שחקן'}</label>
          <input id='board-start-name' type='text' minLength={2} maxLength={32} value={name}
            placeholder={locale==='en'?'Player name':'שם השחקן'} onChange={e=>updatePlayerName(e.target.value)} />
        </div>}
        {!remote && state.mode==='local' && ownerMode!=='auto' && <p className='capture-tip'>{locale==='en'?'Tap any captured square to correct its owner.':'ניתן ללחוץ על ריבוע שנכבש כדי לשנות למי הוא שייך.'}</p>}
        <div className='gesture-hint'><span className='draw-icon'>✍️</span>{tr(bonusSelect?'בחר ריבוע פנוי לכיבוש בזהב':'בחר כל שתי נקודות סמוכות ופשוט צייר ביניהן בטוש, בכל מקום בלוח')}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}><span className='smalltxt'>{tr("שטחים שנכבשו")}</span><span className='smalltxt'>{completed} / {state.rows * state.cols} · {percent}%</span></div>
        <div className='level-progress'><div className='level-progress-fill' style={{ width: percent + '%' }} /></div>
        {!online && <div role='alert' style={{background:'#D94C37',color:'#FFFFFF',padding:10,borderRadius:12,textAlign:'center',marginTop:12}}>
          {tr("📡 החיבור לרשת נותק. משחק מקומי עדיין זמין, ומשחק מחובר יתחדש עם חזרת החיבור.")}
        </div>}
        {finished && <section className='victory-panel' role='status' aria-label={locale==='en'?'Match result':'תוצאות המשחק'}>
          <div className='victory-symbol' aria-hidden='true'>🏆</div>
          <h2 style={{margin:'5px 0',fontSize:'clamp(22px,3.8vw,31px)'}}>
            {state.mode==='solo' ? tr('אליפות! כל הריבועים נסגרו') : state.scores.host === state.scores.guest+state.scores.bot
              ? tr('תיקו גדול!') : state.scores.host>state.scores.guest+state.scores.bot ? tr('אליפות! כל הריבועים נסגרו') : tr('היריב ניצח הפעם')}
          </h2>
          <div style={{fontSize:16,color:'#FFEAA6',marginBottom:12}}>
            {'⭐'.repeat(state.scores.host>state.scores.guest+state.scores.bot?3:state.scores.host===state.scores.guest+state.scores.bot?2:1)}
          </div>
          <p style={{margin:'6px 0',color:'#FFFFFF'}}>{name||tr('שחקן 1')}: {state.scores.host} {tr('נקודות')}{state.mode==='solo'?'':' · '+(state.mode==='local'?guestName:tr('יריב'))+': '+(state.scores.guest+state.scores.bot)+' '+tr('נקודות')}</p>
          <p className='smalltxt'>{tr("🍎 במשחק מחובר צוברים פירות וקרדיטים, ובניצחון גם יהלומים והתקדמות.")}</p>
          <div className='control-row' style={{marginTop:13}}>
            <button className='gold-button' disabled={busy} onClick={()=>void start()}>{tr("🔄 משחק חוזר")}</button>
            {stageId<STAGE_COUNT && <button className='glass-button' disabled={stageId>completedStage} onClick={advanceStage}>{locale==='en'?'Next stage':'השלב הבא'}</button>}
          </div>
        </section>}
        <div className='status-line' aria-live='polite'>
          {finished ? '🏆 ' + tr(state.mode==='solo'?'ניצחת! כל הכבוד!':state.scores.host === state.scores.guest + state.scores.bot ? 'המשחק הסתיים בתיקו!' : state.scores.host > state.scores.guest + state.scores.bot ? 'ניצחת! כל הכבוד!' : 'היריב ניצח. משחק חוזר?') : tr(message)}
        </div>
        {remote?.status === 'waiting' && <p style={{ textAlign: 'center', color: '#FFE48A' }}>{tr("ממתינים שהחבר ייכנס לחדר...")}</p>}
        <div className='control-row'>
          <button className='gold-button' disabled={busy || !validName} onClick={() => void start()}>🎮 {tr(remote ? 'משחק חדש' : 'התחל משחק')}</button>
          <button className='glass-button' onClick={() => {
            if (muted) playGameSound('correct',{muted:false,volume:volume/100});
            setMuted(v=>!v);
          }} aria-pressed={muted} aria-label={tr(muted ? 'הפעל צלילים' : 'השתק צלילים')}>
            {tr(muted ? '🔇 הפעל צלילים' : '🔊 השתק צלילים')}
          </button>
          <label className='glass-button' style={{display:'inline-flex',gap:7,alignItems:'center'}} htmlFor='game-volume'>
            {tr("עוצמה")} <input id='game-volume' type='range' min='0' max='100' step='5'
              aria-label={tr('עוצמת הצלילים במשחק')} value={volume} onChange={e=>setVolume(Number(e.target.value))}
              style={{width:80,accentColor:'#FFE38F'}} /> {volume}%
          </label>
          <button className='glass-button' onClick={()=>{setTutorialPage(0);setShowTutorial(true)}}>{tr("❓ איך משחקים")}</button>
          {earnedBonus && canPlay && <button className='gold-button' onClick={()=>void startGoldQuestion()} disabled={busy||!!question}>{tr("⭐ שאלת זהב!")}</button>}
          {availableBonus>0 && state.mode!=='online' && <button className='gold-button' disabled={busy||!!question} onClick={()=>setBonusSelect(v=>!v)}>
            ✨ {tr(bonusSelect?'בטל כיבוש בונוס':'כיבוש בונוס')} ({availableBonus})</button>}
          {finished && stageId<STAGE_COUNT && <button className='glass-button' disabled={stageId>completedStage} onClick={advanceStage}>{locale==='en'?'Next stage →':'השלב הבא ←'}</button>}
        </div>
        {finished && <StageReward
          locale={locale}
          stageNumber={stageId}
          stageKey={remote?.id||stageRunId}
          remoteMatchId={remote?.id}
          worldSize={state.rows}
          client={remote?client:null}
          onAdvance={advanceStage}
          onLocalPrize={stageLocalReward}
          onRemotePrize={stageRemoteReward}
          onSound={rewardSound}
        />}
      </section>

      <aside className='side-stack'>
        <section className='glass-panel'>
          <h2 className='panel-title'>{tr("🎯 חדר המשחק")}</h2>
          <div className='mode-row'>
            {([['solo','👤 משחק עצמאי','👤 Solo'],['bot','🤖 נגד מחשב','🤖 Vs computer'],['online','🌐 נגד חבר','🌐 Vs friend'],['local','👥 שניים במכשיר','👥 Two players'] ] as const).map(([value, he, en]) =>
              <button key={value} className='choice' disabled={stageStarted&&!finished} aria-pressed={mode===value}
                onClick={()=>{setMode(value);try{localStorage.setItem('trivia-mode-v2',value)}catch{};
                 if(value==='solo'&&!remote){setLocal(prev=>({...repairSoloBoard(prev),mode:'solo'}));setCapturePending(null)}
                 if(value==='local'&&!remote){setLocal(prev=>({...prev,mode:'local'}))}
                 if(value!=='local'&&value!=='solo'&&stageId>serverStageCompleted+1){setStageId(serverStageCompleted+1);setSize(stageFor(Math.min(STAGE_COUNT,serverStageCompleted+1)).size)} }}>
                {locale==='en'?en:he}</button>)}
          </div>
          <details className='question-topic-panel' open={!stageStarted}>
            <summary>☑️ {tr('נושאי השאלות שלי')} <span className='question-topic-count'>({selectedTopics.length}/{questionTopics.length})</span></summary>
            <p className='smalltxt'>{tr('בחרו נושאים לפני המשחק או בכל שלב. הבחירה נשמרת גם לאחר יציאה. נדרש נושא אחד לפחות.')}</p>
            <div className='question-topic-options' role='group' aria-label={tr('נושאי השאלות')}>
              {questionTopics.map(t=><label className='question-topic-option' key={t.id}>
                <input type='checkbox' checked={selectedTopics.includes(t.id)} onChange={()=>toggleTopic(t.id)} />
                <span>{t[locale]}</span>
              </label>)}
            </div>
            <button type='button' className='glass-button topic-select-all' onClick={()=>setSelectedTopics([...ALL_QUESTION_TOPICS])}>{tr('בחר את כל הנושאים')}</button>
          </details>
          <div className='form-field'>{tr('גודל לוח')}</div>
          <output id='board-size' className='form-input stage-board-size' aria-label={locale==='en'?'Current board size':'גודל הלוח הנוכחי'}>
            {selectedStage.size} × {selectedStage.size} · {locale==='en'?'Determined by stage':'נקבע לפי שלב'}
          </output>
          {inviteLink && <div style={{ marginTop: 13 }}>
            <div className='smalltxt'>{tr("קישור לחדר הפרטי")}</div>
            <button className='glass-button' style={{ marginTop: 7 }} onClick={async () => {
              try {
                if (navigator.share) await navigator.share({title:'טריוויה ריבועים',text:'בוא לשחק איתי בטריוויה ריבועים!',url:inviteLink});
                else { await navigator.clipboard.writeText(inviteLink); setMessage('קישור ההזמנה הועתק'); }
              } catch { setMessage('אפשר להעתיק את ההזמנה ולשלוח לחבר'); }
            }}>{tr("📤 שתף הזמנה לחבר")}</button>
          </div>}
          {invite && client && user && <button className='gold-button' style={{ marginTop: 12 }} disabled={busy} onClick={() => void join()}>{tr("הצטרף לחדר שהוזמנת אליו")}</button>}
        </section>
        <section className='glass-panel'>
          <h2 className='panel-title'>{tr("👑 השחקן שלי")}</h2>
          <label className='form-field' htmlFor='player-name'>{tr("כינוי שחקן")}</label>
          <input id='player-name' className='form-input' value={name} onChange={e => updatePlayerName(e.target.value)} maxLength={32} minLength={2} required placeholder={tr('הקלד שם שחקן (חובה)')} aria-required='true'/>
          {!validName && <p className='smalltxt' role='status' style={{color:'#FFE7A1'}}>{tr("יש למלא שם שחקן לפני ציור הקו הראשון.")}</p>}
          <div className='form-field'>{tr("צבע הכיבוש שלי")}</div>
          <div className='swatches'>{palettes.map(c => <button key={c} className='swatch' style={{ background: c }} aria-label={tr('בחר צבע ')+c} aria-pressed={color === c} onClick={() => setColor(c)} />)}</div>
          <div className='form-field'>{tr("🖍️ צבע הטוש לקווים")}</div>
          <div className='swatches' role='group' aria-label={tr('בחר את צבע הקו')}>
            {palettes.map(c => <button key={'line-'+c} className='swatch' style={{background:c}}
              aria-label={tr('בחר צבע קו ')+c} aria-pressed={lineColor===c} onClick={()=>setLineColor(c)}/>)}
            <input type='color' aria-label={tr('צבע קו מותאם אישית')} value={lineColor}
              onChange={e=>setLineColor(e.target.value)} style={{width:42,height:35,border:0,background:'none'}}/>
          </div>
          <div style={{margin:'4px 0 9px',fontSize:12,color:'#E6F3FF'}}>{tr("תצוגת הטוש:")} <span style={{display:'inline-block',width:80,borderTop:'8px solid '+lineColor,borderRadius:9,verticalAlign:'middle'}}/></div>
          <div className='form-field'>{tr("סמל שיופיע בכל ריבוע")}</div>
          <div className='avatar-row'>{avatars.map(a => <button className='avatar-choice' key={a} aria-label={tr('בחר אוואטר ')+a} aria-pressed={avatar === a} onClick={() => setAvatar(a)}>{a}</button>)}</div>
          <section className='capture-personalization' aria-label={locale==='en'?'Square capture customization':'התאמה אישית לכיבוש הריבועים'}>
             <h3>{locale==='en'?'Captured square design':'עיצוב הריבוע שנכבש'}</h3>
             <div className='capture-style-options' role='group' aria-label={locale==='en'?'Capture visual style':'סגנון כיבוש'}>
               {([['lumen','אור יוקרתי','Lumen glow'],['neon','ניאון','Neon'],['seal','חותמת מתכת','Metal seal'],['prism','קריסטל','Prism'],['token','סמל שחקן','Player token']] as const).map(([key,he,en])=><button key={key}
                 type='button' className='capture-style-option' aria-pressed={captureStyle===key} onClick={()=>setCaptureStyle(key)}>
                 <span className={'capture-style-preview preview-'+key} aria-hidden='true'>✦</span><strong>{locale==='en'?en:he}</strong>
               </button>)}
             </div>
             {mode==='local' && <>
               <h3>{locale==='en'?'Who gets a captured square?':'מי מקבל ריבוע שנסגר?'}</h3>
               <select className='form-input capture-owner-mode' aria-label={locale==='en'?'Captured square ownership mode':'אופן שיוך ריבוע'}
                 value={ownerMode} onChange={e=>setOwnerMode(e.target.value as LocalOwnerMode)}>
                 <option value='auto_with_override'>{locale==='en'?'Automatic + tap to correct':'אוטומטי עם אפשרות לשינוי ידני'}</option>
                 <option value='manual'>{locale==='en'?'Ask me after each capture':'בחירה ידנית לאחר כל סגירה'}</option>
                 <option value='auto'>{locale==='en'?'Automatic only':'אוטומטי בלבד'}</option>
               </select>
               <h3>{locale==='en'?'Second player — required name':'משתתף נוסף — חובה להזין שם'}</h3>
               <label className='form-field' htmlFor='local-guest-name'>{locale==='en'?'Real second player name':'שם המשתתף הנוסף'}</label>
               <input className='form-input' id='local-guest-name' maxLength={32} value={guestName} placeholder={locale==='en'?'A real player name':'לדוגמה: עדי'}
                  onChange={e=>setGuestName(e.target.value.slice(0,32))}/>
                {!hasActualOpponent(guestName,name)&&<p className='smalltxt'>ללא שם של משתתף אמיתי, בחרו ״משחק עצמאי״. לא יוקצה יותר ניקוד לשחקן 2 אוטומטי.</p>}
               <div className='form-field'>{locale==='en'?'Player 2 capture color':'צבע הכיבוש של שחקן 2'}</div>
               <div className='swatches' role='group' aria-label={locale==='en'?'Player 2 color':'צבע שחקן 2'}>
                 {palettes.map(c=><button key={'guest-'+c} type='button' className='swatch'
                    style={{background:c}} aria-label={c} aria-pressed={guestColor===c} onClick={()=>setGuestColor(c)}/>) }
               </div>
               <div className='form-field'>{locale==='en'?'Player 2 icon':'סמל שחקן 2'}</div>
               <div className='avatar-row' role='group' aria-label={locale==='en'?'Player 2 avatar':'סמל שחקן 2'}>
                 {avatars.map(a=><button type='button' key={'guest-icon-'+a} className='avatar-choice'
                   aria-label={a} aria-pressed={guestAvatar===a} onClick={()=>setGuestAvatar(a)}>{a}</button>)}
               </div>
             </>}
             {mode!=='local' && <p className='smalltxt'>{locale==='en'?'Online and bot ownership is verified by the game engine to keep scores fair.':'במשחק מחובר או מול המחשב הבעלות נקבעת לפי מנוע המשחק כדי לשמור על ניקוד הוגן.'}</p>}
           </section>
           <label className='form-field' style={{ display: 'flex', gap: 10, alignItems: 'center' }}><input type='checkbox' style={{ width: 18, height: 18, accentColor: '#FFDE85' }} checked={remember} onChange={e => setRemember(e.target.checked)} /> {tr("זכור את הבחירות שלי תמיד")}</label>
          <button className='glass-button' style={{ marginTop: 13 }} disabled={!validName} onClick={() => void saveProfile()}>{tr("שמור שם, צבע טוש ועיצוב אישי")}</button>
        </section>
        <section className='glass-panel'>
          <h2 className='panel-title'>{tr("💎 אוצרות והישגים")}</h2>
          <div className='wallet'>
            {([['🍎','פירות',remote?progress.fruits:localWallet.fruits],['💎','יהלומים',remote?progress.diamonds:localWallet.diamonds],['🪙','קרדיטים',currentCredits],['⭐','כוכבים',remote?0:localWallet.stars],['❤️','לבבות',progress.hearts]] as const).map(([a,label,count]) =>
              <div className='wallet-item' key={label}><span aria-hidden='true' style={{ fontSize: 24 }}>{a}</span><strong>{count}</strong><span>{tr(label)}</span></div>)}
          </div>
          <p className='smalltxt' style={{margin:'10px 0 5px'}}>{tr("⏳ כל שאלה: דקה. אפשר לקנות עוד 30 שניות ב־25 קרדיטים, פעם אחת לשאלה.")}</p>
          <p className='smalltxt' style={{margin:'0 0 9px'}}>{tr("♾️ קמע זמן מבטל את הטיימר עבורך עד סוף השלב. זוכים בקמע עם ניצחון במשחק מחובר או מקומי.")}</p>
          <p className='smalltxt' style={{margin:'0 0 8px'}}>{tr('קרדיטים זמינים: ')}{currentCredits} | {tr('קמעות זמן: ')}{currentCharms} {timeFreezeActive?tr('· ללא שעון כרגע'):''}</p>
          {!timeFreezeActive && currentCharms>0 && <button className='glass-button' disabled={busy} onClick={()=>void activateTimeCharm()}>{tr("הפעל קמע זמן עד סוף השלב")}</button>}
          <p className='smalltxt' style={{marginBottom:0}}>🔥 {tr('רצף תשובות: ')}{streak} | ⭐ {tr('כיבושי בונוס: ')}{availableBonus}</p>
          <p className='smalltxt' style={{marginBottom:0}}>{tr("אחרי שלוש תשובות נכונות תקבל שאלת זהב. הצלחה מעניקה שני אסימוני כיבוש. המשחק התחרותי נשאר ללא בונוסים משני ניקוד.")}</p>
        </section>
        <section className='glass-panel'>
          <h2 className='panel-title'>{tr("🔐 מועדון השחקנים")}</h2>
          {user ? <>
            <p className='smalltxt'>{tr('מחובר: ')}{user.email}</p>
            {!legalAccepted && <section style={{background:'#293D72',border:'1px solid #FFDE8D',borderRadius:13,padding:13,margin:'10px 0'}}>
              <h3 style={{margin:'0 0 7px',color:'#FFE7A4'}}>{tr("השלמת הרשמה למשחק")}</h3>
              <p className='smalltxt'>{tr("חשבון המשחק מיועד למבוגרים בני 18 ומעלה. משחק מקומי זמין גם ללא חשבון. לפני הפעלת פרופיל וחדרים יש לאשר את התנאים.")}</p>
              <label style={{display:'flex',gap:9,alignItems:'flex-start',margin:'12px 0'}}>
                <input type='checkbox' checked={adultConfirmed} onChange={e=>setAdultConfirmed(e.target.checked)} style={{width:20,height:20,flexShrink:0}}/>
                {tr("אני מאשר/ת שגילי 18 ומעלה")}
              </label>
              <label style={{display:'flex',gap:9,alignItems:'flex-start',margin:'12px 0'}}>
                <input type='checkbox' checked={policiesAcknowledged} onChange={e=>setPoliciesAcknowledged(e.target.checked)} style={{width:20,height:20,flexShrink:0}}/>
                {tr("קראתי את")} <a href={locale==='en'?'/en/privacy':'/privacy'} style={{color:'#FFDC88'}}>{tr("הודעת הפרטיות")}</a> {tr("ואני מסכים/ה ל")}<a href={locale==='en'?'/en/terms':'/terms'} style={{color:'#FFDC88'}}>{tr("תנאי השימוש")}</a>
              </label>
              <button className='gold-button' disabled={legalBusy||!adultConfirmed||!policiesAcknowledged} onClick={()=>void acceptCurrentPolicies()}>
                {tr(legalBusy?'שומר...':'אשר והפעל משחק מחובר')}
              </button>
            </section>}
            {legalAccepted && <p className='smalltxt' style={{color:'#B0FFD6'}}>{tr("החשבון פעיל למשחקים מחוברים.")}</p>}
            <button className='glass-button' onClick={() => void client?.auth.signOut()}>{tr("התנתק")}</button>
          </>
            : client ? <>
              <p className='smalltxt' style={{lineHeight:1.8,background:'#2E467A',borderRadius:12,padding:10}}>
                {locale==='en'
                   ? 'Registration is only needed for connected play. We collect your email and account ID. Your nickname, score and progress are saved to your account. You can play locally without signing up. Data is stored using Supabase and the website runs on Vercel.'
                   : 'הרשמה נדרשת רק למשחקים מחוברים. נאסוף כתובת מייל ומזהה חשבון, ובמשחק נשמור כינוי, תוצאה והתקדמות. המסירה לבחירתך; ללא הרשמה ניתן לשחק מקומית. הפרטים נשמרים בעזרת Supabase והאתר מאוחסן ב-Vercel.'}
                <a href={locale==='en'?'/en/privacy':'/privacy'} style={{color:'#FFE5A5'}}> {tr("למדיניות הפרטיות המלאה")}</a>.
              </p>
              <label style={{display:'flex',gap:9,alignItems:'flex-start',margin:'10px 0'}}>
                <input type='checkbox' checked={adultConfirmed} onChange={e=>setAdultConfirmed(e.target.checked)} style={{width:20,height:20,flexShrink:0}} />
                {tr("אני בן/בת 18 ומעלה; חשבונות עצמאיים לילדים אינם זמינים כרגע")}
              </label>
              <label style={{display:'flex',gap:9,alignItems:'flex-start',margin:'10px 0'}}>
                <input type='checkbox' checked={policiesAcknowledged} onChange={e=>setPoliciesAcknowledged(e.target.checked)} style={{width:20,height:20,flexShrink:0}} />
                {tr("קראתי את")} <a href={locale==='en'?'/en/privacy':'/privacy'} style={{color:'#FFE5A5'}}>{tr("הודעת הפרטיות")}</a> {tr("ואני מסכים/ה ל")}<a href={locale==='en'?'/en/terms':'/terms'} style={{color:'#FFE5A5'}}>{tr("תנאי השימוש")}</a>
              </label>
              <button className='gold-button' disabled={!adultConfirmed||!policiesAcknowledged} onClick={() => {
                if (!hasPreRegistrationAcknowledgement()) return;
                void client.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/' } }).then(({error}) => { if(error)setMessage(error.message); });
              }}>{tr("התחבר באמצעות Google")}</button>
              <label htmlFor='login-email' className='form-field'>{tr("דואר אלקטרוני")}</label>
              <input id='login-email' className='form-input' type='email' autoComplete='email' value={email} onChange={e => setEmail(e.target.value)} />
              <label htmlFor='login-password' className='form-field'>{tr("סיסמה")}</label>
              <input id='login-password' className='form-input' type='password' autoComplete='current-password' value={password} onChange={e => setPassword(e.target.value)} />
              <div className='control-row' style={{ marginTop: 12 }}>
                <button className='glass-button' onClick={async () => { const { error } = await client.auth.signInWithPassword({ email, password }); setMessage(error?.message || 'התחברת בהצלחה'); }}>{tr("כניסה")}</button>
                <button className='glass-button' onClick={async () => { if(!hasPreRegistrationAcknowledgement())return; const { error } = await client.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + '/' } }); setMessage(error?.message || 'נשלח מייל לאימות החשבון'); }}>{tr("הרשמה")}</button>
                <button className='glass-button' onClick={async () => {
                  if(!email.trim()){setMessage('יש להזין כתובת מייל לקבלת קישור איפוס סיסמה.');return;}
                  const {error}=await client.auth.resetPasswordForEmail(email,{redirectTo:window.location.origin+'/auth/reset-password'});
                  setMessage(error?.message||'אם קיים חשבון עם כתובת זו, יישלח אליו קישור לאיפוס סיסמה.');
                }}>{tr("שכחתי סיסמה")}</button>
              </div>
            </> : <p className='smalltxt'>{tr("משחק מקומי זמין כעת. התחברות מחייבת הגדרת Supabase במערכת הפריסה.")}</p>}
        </section>
      </aside>
    </div>

    {capturePending && !remote && <div className='quiz-overlay' role='presentation'>
      <section className='capture-owner-dialog' role='dialog' aria-modal='true'
        aria-label={locale==='en'?'Who captured this square?':'מי סגר את הריבוע?'}>
        <span className='capture-owner-eyebrow'>{locale==='en'?'CAPTURE COMPLETE':'כיבוש הריבוע'}</span>
        <h2>{locale==='en'?'Who captured this square?':'מי סגר את הריבוע?'}</h2>
        <p>{locale==='en'?'Choose the player who gets the point.':'בחר למי לשייך את הריבוע והנקודה.'}</p>
        <div className='capture-owner-buttons'>
          <button type='button' className='capture-owner-choice' autoFocus onClick={()=>chooseCaptureOwner('host')}>
            <span className='capture-owner-symbol' style={{borderColor:color}}>{avatar}</span>
            <strong>{name || (locale==='en'?'Player 1':'שחקן 1')}</strong>
            <span className='capture-owner-caption'>{locale==='en'?'Player 1':'שחקן 1'}</span>
          </button>
          <button type='button' className='capture-owner-choice' onClick={()=>chooseCaptureOwner('guest')}>
            <span className='capture-owner-symbol' style={{borderColor:guestColor}}>{guestAvatar}</span>
            <strong>{guestName || (locale==='en'?'Player 2':'שחקן 2')}</strong>
            <span className='capture-owner-caption'>{locale==='en'?'Player 2':'שחקן 2'}</span>
          </button>
        </div>
        {capturePending.from==='edit' && <button type='button' className='glass-button capture-cancel'
          onClick={()=>setCapturePending(null)}>{locale==='en'?'Cancel':'ביטול'}</button>}
      </section>
    </div>}
    {showTutorial && <div className='quiz-overlay' role='presentation'>
      <section id='tutorial-modal' tabIndex={-1} className='quiz-card' role='dialog' aria-modal='true' aria-label={tr('הסבר משחק')}
        onKeyDown={e=>{if(e.key==='Escape'){e.stopPropagation();dismissTutorial()}}}
        style={{textAlign:'center'}}>
        <div className='tutorial-language-picker' role='group' aria-label={locale==='he'?'שפת ההדרכה':'Tutorial language'}>
          <button type='button' lang='he' aria-pressed={locale==='he'} onClick={()=>setLocale('he')}>עברית</button>
          <button type='button' lang='en' aria-pressed={locale==='en'} onClick={()=>setLocale('en')}>English</button>
          <button type='button' lang='ru' aria-pressed={locale==='ru'} onClick={()=>setLocale('ru')}>Русский</button>
          <button type='button' lang='fr' aria-pressed={locale==='fr'} onClick={()=>setLocale('fr')}>Français</button>
          <button type='button' lang='ar' aria-pressed={locale==='ar'} onClick={()=>setLocale('ar')}>العربية</button>
        </div>
        <span className='quiz-badge'>{tr("🧭 הדרך לכיבוש מתחילה כאן")}</span>
        <h2>{tr(['צייר קו כמו בטוש','ענה נכון על שאלת טריוויה','סגור ריבוע וזכה בנקודות'][tutorialPage])}</h2>
        <TutorialPreview locale={locale} page={tutorialPage} color={lineColor} avatar={avatar}/>
        <p style={{color:'#ECF4FF',fontSize:15,lineHeight:1.7}}>{tr([
          'נוגעים בנקודה, גוררים באצבע או בעכבר אל נקודה סמוכה ומשחררים. לא לוחצים על הקו.',
          'לכל קו תופיע שאלה עם ארבע אפשרויות. תשובה שגויה תשאיר את הקו פתוח.',
          'הריבוע יתמלא בצבע ובאוואטר שלך. סגירה מעניקה נקודה ותור נוסף. אחרי רצף תשובות מחכה שאלת זהב!'
        ][tutorialPage])}</p>
        <div className='control-row'>
          <button id='tutorial-dismiss' className='glass-button' onClick={dismissTutorial}>{tr("דלג או סיים")}</button>
           <button type='button' className='gold-button' onClick={dismissTutorial}>{locale==='en'?'Go to game board':'עבור ללוח המשחק'}</button>
          {tutorialPage>0 && <button className='glass-button' onClick={()=>setTutorialPage(p=>Math.max(0,p-1))}>{locale==='en'?'Back':'הקודם'}</button>}
          {tutorialPage<2 && <button className='gold-button' onClick={()=>setTutorialPage(v=>v+1)}>{tr("הבא ←")}</button>}
        </div>
      </section>
    </div>}
    {wrongAnswerFeedback && <div className='quiz-overlay answer-feedback-overlay' role='presentation'>
      <section className='quiz-card answer-feedback-card' role='dialog' aria-modal='true' aria-labelledby='wrong-answer-title'
        aria-describedby='wrong-answer-description' tabIndex={-1}>
        <span className='quiz-badge'>{tr('אפשר ללמוד גם מטעויות')}</span>
        <h2 id='wrong-answer-title'>{tr('התשובה הנכונה היא:')}</h2>
        <p id='wrong-answer-description' className='feedback-original-question'>{wrongAnswerFeedback.text}</p>
        <div className='answer-grid feedback-answers'>
          {wrongAnswerFeedback.answers.map((answer,index)=><div key={index}
            className={'answer-option feedback-answer'+(index===wrongAnswerFeedback.correctIndex?' feedback-correct':index===wrongAnswerFeedback.selectedIndex?' feedback-wrong':'')}
            aria-label={(index===wrongAnswerFeedback.correctIndex?tr('התשובה הנכונה')+': ':index===wrongAnswerFeedback.selectedIndex?tr('התשובה שבחרת')+': ':'')+answer}>
            <span className='answer-letter' aria-hidden='true'>{index===wrongAnswerFeedback.correctIndex?'✓':index===wrongAnswerFeedback.selectedIndex?'✕':String(index+1)}</span>
            <span>{answer}</span>
          </div>)}
        </div>
        {wrongAnswerFeedback.correctIndex===null&&<p className='smalltxt' role='status'>{tr('לא ניתן לאמת כרגע את התשובה הנכונה. אפשר להמשיך במשחק.')}</p>}
        <button className='gold-button answer-feedback-continue' type='button' autoFocus
          onClick={()=>setWrongAnswerFeedback(null)}>{tr('המשך למשחק')}</button>
      </section>
    </div>}
    {question && <div className='quiz-overlay' role='presentation'>
      <section className='quiz-card' role='dialog' aria-modal='true' aria-label={tr('שאלת טריוויה')}>
        <span className='quiz-badge'>{question.kind==='premium_bonus'?'💎 '+tr('שאלת פרימיום · ניקוד ופרסים כפולים'):question.premium?'✨ '+tr('שאלת פרימיום · תשובה נכונה תפתח בונוס'):tr(question.kind==='bonus'?'✨ שאלת זהב: הזדמנות לשני כיבושים ✨':'⭐ רק תשובה נכונה תסגור את הקו ⭐')}</span>
        <div className={'question-timer '+((secondsLeft??60)<=10?'urgent':'')} role='timer' aria-live='off'>
          <span className='hourglass-spin' aria-hidden='true'>⌛</span>
          {question.deadline_at===null || timeFreezeActive
            ? <span>∞ <span className='clock-label'>{tr("קמע זמן פעיל עד סוף השלב")}</span></span>
            : <span>{timerText} <span className='clock-label'>{tr("נותרו לענות")}</span></span>}
        </div>
        <h2>{question.text}</h2>
        <div className='control-row' style={{marginBottom:13}}>
          {showTimer && <button className='glass-button' disabled={busy || currentCredits<25 || (question.extensions||0)>=1 || (secondsLeft??0)<=0}
            onClick={()=>void extendQuestionTime()}>⏳ {tr('+30 שניות · 25 קרדיטים')} ({currentCredits})</button>}
          {!timeFreezeActive && currentCharms>0 && <button className='gold-button' disabled={busy}
            onClick={()=>void activateTimeCharm()}>♾️ {tr('הפעל קמע זמן')} ({currentCharms})</button>}
        </div>
        <div className='answer-grid'>
          {question.answers.map((a, i) => <button className='answer-option' key={i} disabled={busy} autoFocus={i === 0} onClick={() => void answer(i)}><span className='answer-letter'>{(locale==='en'?['A','B','C','D']:['א','ב','ג','ד'])[i]}</span>{a}</button>)}
        </div>
        <p className='smalltxt' style={{ textAlign: 'center', marginBottom: 0 }}>{tr(question.kind==='premium_bonus'?'תשובה נכונה מעניקה עד שני כיבושים סמוכים, ניקוד ופרסים כפולים. אם נשאר ריבוע אחד ייכבש רק הוא.':question.kind==='bonus'?'תשובה נכונה מעניקה שני אסימוני כיבוש זהב':'תשובה שגויה משאירה את הקו פתוח ומעבירה את התור')}</p>
      </section>
    </div>}

    <LocalQuestionBackup locale={locale} onRestored={entries=>{for(const item of entries)seenQuestionTexts.current.add(item)}}/>
    <footer className='footer'><a href={locale==='en'?'/en/privacy':'/privacy'}>{tr("פרטיות")}</a><a href={locale==='en'?'/en/terms':'/terms'}>{tr("תנאי שימוש")}</a><a href={locale==='en'?'/en/cookies':'/cookies'}>{tr("עוגיות ואחסון")}</a><a href={locale==='en'?'/en/accessibility':'/accessibility'}>{tr("נגישות")}</a><a href='/account/privacy'>{tr("המידע שלי")}</a></footer>
    <div id='app-footer' className='game-author-credit' role='contentinfo'>
      <span className='game-author-credit-copy' dir={locale==='en'?'ltr':'rtl'}>
        {locale==='en'
         ? '© 2026 Designed and developed by Guy Rosenberg · All rights reserved ©'
         : '© 2026 תוכנן ובוצע ע״י גיא רוזנברג · כל הזכויות שמורות ©'}
      </span>
    </div>
  </main>;
}
