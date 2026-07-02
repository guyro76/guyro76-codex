'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  Activity, AlertTriangle, BarChart3, BookOpen, CircleDollarSign, Database,
  FileText, LayoutDashboard, Lightbulb, ListTodo, LogIn, LogOut, Menu, Plus,
  RefreshCcw, ScanSearch, Settings, ShieldCheck, Trash2, Users, X, Zap,
} from 'lucide-react';
import CampaignLab from './components/CampaignLab';
import { getSupabaseBrowserClient, supabaseConfigured } from '../lib/supabase';
import type { AgencyTask, Client, Platform, TaskStatus } from '../lib/types';

type Page = 'dashboard' | 'campaigns' | 'clients' | 'tasks' | 'knowledge' | 'reports' | 'qa' | 'settings';
type UserInfo = { id: string; email?: string };
type GlossaryItem = { term: string; provider: 'Google Ads' | 'Meta Ads'; definition: string; practical: string };

const seedClients: Client[] = [
  { id: '1', name: 'אלפא נדל״ן', industry: 'נדל״ן', platform: 'שניהם', monthly_budget: 128000, roas: 4.2, health: 88 },
  { id: '2', name: 'קליניקת אור', industry: 'בריאות ואסתטיקה', platform: 'Meta Ads', monthly_budget: 46000, roas: 2.6, health: 62 },
  { id: '3', name: 'טקפוינט', industry: 'B2B וטכנולוגיה', platform: 'Google Ads', monthly_budget: 76000, roas: 3.7, health: 81 },
];

const seedTasks: AgencyTask[] = [
  { id: '1', title: 'בדיקת חריגת תקציב בקמפיין Performance Max', client_name: 'אלפא נדל״ן', due_label: 'היום 12:00', priority: 'גבוהה', status: 'לביצוע' },
  { id: '2', title: 'אישור 3 מודעות חדשות לרימרקטינג', client_name: 'קליניקת אור', due_label: 'היום 15:30', priority: 'בינונית', status: 'בטיפול' },
  { id: '3', title: 'הוספת מילות שלילה מחיפוש שבועי', client_name: 'טקפוינט', due_label: 'מחר 10:00', priority: 'גבוהה', status: 'לביצוע' },
];

const tips = [
  ['אל תמדוד רק ROAS', 'בדוק גם רווח גולמי, איכות לידים, החזרות ועלות שירות.'],
  ['Tracking לפני אופטימיזציה', 'לפני שינוי בידינג ודא שהאירועים, UTM, CRM והייחוס עובדים.'],
  ['מונחי חיפוש פעם בשבוע', 'עבור על Search Terms לפי כוונה והוסף מילות שלילה רק לאחר בדיקה.'],
  ['רענון קריאייטיב הוא שינוי זווית', 'ב-Meta החלף Hook, פורמט והוכחה, לא רק צבע.'],
];

const glossary: GlossaryItem[] = [
  { term: 'Quality Score', provider: 'Google Ads', definition: 'מדד אבחוני לאיכות מילת המפתח, המודעה ודף הנחיתה.', practical: 'זהה חוסר התאמה לכוונת החיפוש.' },
  { term: 'Search Impression Share', provider: 'Google Ads', definition: 'אחוז החשיפות מתוך החשיפות שהיית זכאי לקבל.', practical: 'הפרד אובדן בגלל תקציב מאובדן בגלל דירוג.' },
  { term: 'Search Terms', provider: 'Google Ads', definition: 'השאילתות בפועל שהפעילו את המודעות.', practical: 'מצא מילות שלילה והזדמנויות חדשות.' },
  { term: 'Performance Max', provider: 'Google Ads', definition: 'קמפיין חוצה ערוצי Google לפי יעד המרה.', practical: 'חלק Asset Groups לפי הצעה עסקית.' },
  { term: 'Target ROAS', provider: 'Google Ads', definition: 'בידינג לפי יחס יעד בין ערך המרות להוצאה.', practical: 'דורש ערכי המרה אמינים ושינויים הדרגתיים.' },
  { term: 'Learning Phase', provider: 'Meta Ads', definition: 'תקופת למידה של מערכת Meta.', practical: 'צמצם שינויים תכופים ואחד קבוצות חלשות.' },
  { term: 'Frequency', provider: 'Meta Ads', definition: 'מספר החשיפות הממוצע לאדם.', practical: 'פרש יחד עם CTR, CPM והמרות.' },
  { term: 'CAPI', provider: 'Meta Ads', definition: 'Conversions API להעברת אירועים מהשרת.', practical: 'הפעל Deduplication ובדוק Event Match Quality.' },
  { term: 'Creative Fatigue', provider: 'Meta Ads', definition: 'ירידה בביצועים עקב חשיפה חוזרת.', practical: 'רענן Hook, זווית, פורמט והוכחה.' },
  { term: 'Attribution Setting', provider: 'Meta Ads', definition: 'חלון הזמן שבו מיוחסת המרה.', practical: 'השווה ל-GA4 ול-CRM וקבע מקור אמת.' },
];

const navigation = [
  ['dashboard', 'חדר מצב', LayoutDashboard],
  ['campaigns', 'בדיקת קמפיינים', ScanSearch],
  ['clients', 'לקוחות 360°', Users],
  ['tasks', 'משימות ו-SLA', ListTodo],
  ['knowledge', 'טיפים ומילון PPC', BookOpen],
  ['reports', 'דוחות', FileText],
  ['qa', 'QA ובקרה', ShieldCheck],
  ['settings', 'חיבורים והגדרות', Settings],
] as const;

const money = (value: number) => new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(value);
function localLoad<T>(key: string, fallback: T): T { try { return JSON.parse(localStorage.getItem(key) || 'null') || fallback; } catch { return fallback; } }

export default function PaprikaApp() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [page, setPage] = useState<Page>('dashboard');
  const [menu, setMenu] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [email, setEmail] = useState('guyro76@gmail.com');
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [tasks, setTasks] = useState<AgencyTask[]>([]);
  const [search, setSearch] = useState('');
  const [provider, setProvider] = useState<'הכל' | 'Google Ads' | 'Meta Ads'>('הכל');
  const [tipIndex, setTipIndex] = useState(new Date().getDate() % tips.length);
  const [notice, setNotice] = useState('');
  const [clientModal, setClientModal] = useState(false);
  const [taskModal, setTaskModal] = useState(false);
  const [qa, setQa] = useState<string[]>([]);
  const [newClient, setNewClient] = useState({ name: '', industry: '', platform: 'שניהם' as Platform, budget: '25000' });
  const [newTask, setNewTask] = useState({ title: '', client_name: '', due_label: 'היום 17:00', priority: 'בינונית' as AgencyTask['priority'] });

  useEffect(() => {
    let active = true;
    async function boot() {
      if (!supabase) {
        setClients(localLoad('paprika-clients', seedClients));
        setTasks(localLoad('paprika-tasks', seedTasks));
        setLoading(false);
        return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (!active) return;
      setUser(session?.user ? { id: session.user.id, email: session.user.email } : null);
      if (session?.user) await loadCloud(session.user.id);
      setLoading(false);
    }
    boot();
    const listener = supabase?.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ? { id: session.user.id, email: session.user.email } : null);
      if (session?.user) await loadCloud(session.user.id); else { setClients([]); setTasks([]); }
    });
    return () => { active = false; listener?.data.subscription.unsubscribe(); };
  }, [supabase]);

  async function loadCloud(userId: string) {
    if (!supabase) return;
    const [clientResult, taskResult] = await Promise.all([
      supabase.from('clients').select('*').eq('user_id', userId).order('created_at'),
      supabase.from('agency_tasks').select('*').eq('user_id', userId).order('created_at'),
    ]);
    if (clientResult.error || taskResult.error) return setNotice('Supabase מחובר, אך הסכמה עדיין לא הותקנה במלואה.');
    setClients(clientResult.data || []);
    setTasks(taskResult.data || []);
  }

  function saveLocal(nextClients = clients, nextTasks = tasks) {
    if (!supabase) {
      localStorage.setItem('paprika-clients', JSON.stringify(nextClients));
      localStorage.setItem('paprika-tasks', JSON.stringify(nextTasks));
    }
  }

  async function signIn() {
    if (!supabase) return setNotice('חסרים משתני Supabase בפרויקט Vercel.');
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } });
    setNotice(error ? error.message : 'נשלח אליך קישור כניסה למייל.');
  }

  async function addClient() {
    if (!newClient.name.trim() || !newClient.industry.trim()) return setNotice('יש למלא שם לקוח ותחום פעילות.');
    const record: Client = {
      id: crypto.randomUUID(), user_id: user?.id, name: newClient.name.trim(), industry: newClient.industry.trim(),
      platform: newClient.platform, monthly_budget: Number(newClient.budget) || 0, roas: 0, health: 75,
    };
    if (supabase && user) {
      const { data, error } = await supabase.from('clients').insert(record).select().single();
      if (error) return setNotice(error.message);
      setClients(value => [...value, data]);
    } else {
      const next = [...clients, record]; setClients(next); saveLocal(next, tasks);
    }
    setClientModal(false); setNewClient({ name: '', industry: '', platform: 'שניהם', budget: '25000' }); setNotice('הלקוח נוסף.');
  }

  async function addTask() {
    if (!newTask.title.trim()) return setNotice('יש למלא כותרת משימה.');
    const record: AgencyTask = {
      id: crypto.randomUUID(), user_id: user?.id, client_id: null, title: newTask.title.trim(),
      client_name: newTask.client_name || clients[0]?.name || 'ללא לקוח', due_label: newTask.due_label,
      priority: newTask.priority, status: 'לביצוע',
    };
    if (supabase && user) {
      const { data, error } = await supabase.from('agency_tasks').insert(record).select().single();
      if (error) return setNotice(error.message);
      setTasks(value => [...value, data]);
    } else {
      const next = [...tasks, record]; setTasks(next); saveLocal(clients, next);
    }
    setTaskModal(false); setNewTask({ ...newTask, title: '' }); setNotice('המשימה נוצרה.');
  }

  async function cycleTask(task: AgencyTask) {
    const statuses: Record<TaskStatus, TaskStatus> = { 'לביצוע': 'בטיפול', 'בטיפול': 'הושלם', 'הושלם': 'לביצוע' };
    const status = statuses[task.status];
    if (supabase && user) await supabase.from('agency_tasks').update({ status }).eq('id', task.id);
    const next = tasks.map(item => item.id === task.id ? { ...item, status } : item);
    setTasks(next); saveLocal(clients, next);
  }

  async function deleteClient(id: string) {
    if (!confirm('למחוק את הלקוח?')) return;
    if (supabase && user) await supabase.from('clients').delete().eq('id', id);
    const next = clients.filter(item => item.id !== id); setClients(next); saveLocal(next, tasks);
  }

  const metrics = {
    budget: clients.reduce((sum, item) => sum + item.monthly_budget, 0),
    roas: clients.length ? clients.reduce((sum, item) => sum + item.roas, 0) / clients.length : 0,
    open: tasks.filter(item => item.status !== 'הושלם').length,
    risk: clients.filter(item => item.health < 70).length,
  };
  const filteredClients = clients.filter(item => `${item.name}${item.industry}${item.platform}`.toLowerCase().includes(search.toLowerCase()));
  const filteredGlossary = glossary.filter(item => (provider === 'הכל' || item.provider === provider) && `${item.term}${item.definition}${item.practical}`.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="login card"><h1>פפריקה</h1><p>טוען מערכת...</p></div>;
  if (supabase && supabaseConfigured && !user) {
    return <main className="login card"><Brand/><h2>כניסה מאובטחת</h2><p>הזן מייל לקבלת קישור כניסה.</p><input className="input" value={email} onChange={event => setEmail(event.target.value)}/><button className="btn primary" onClick={signIn}><LogIn size={17}/>שליחת קישור</button>{notice && <div className="notice">{notice}</div>}</main>;
  }

  return <>
    <div className="shell">
      <aside className={`side ${menu ? 'open' : ''}`}><Brand/><nav className="nav">{navigation.map(([id,label,Icon]) => <button key={id} className={page === id ? 'active' : ''} onClick={() => { setPage(id); setMenu(false); }}><Icon size={19}/>{label}</button>)}</nav></aside>
      <main className="main">
        <header className="top"><div className="top-title"><button className="btn secondary mobile" onClick={() => setMenu(true)}><Menu size={18}/></button><div><small>מערכת ניהול סוכנות</small><h2>{navigation.find(item => item[0] === page)?.[1]}</h2></div></div><div className="top-actions"><button className="btn secondary" onClick={() => setTaskModal(true)}><Plus size={17}/>משימה</button>{user && <button className="btn secondary" onClick={() => supabase?.auth.signOut()}><LogOut size={17}/>יציאה</button>}</div></header>
        <div className="content">
          {!supabaseConfigured && <div className="notice"><Database size={17}/> מצב הדגמה מקומי. לאחר הגדרת Supabase הנתונים יישמרו בענן.</div>}
          {notice && <div className="notice">{notice}</div>}
          {page === 'dashboard' && <Dashboard metrics={metrics} tasks={tasks} tipIndex={tipIndex} setTipIndex={setTipIndex} openTask={() => setTaskModal(true)} cycleTask={cycleTask}/>} 
          {page === 'campaigns' && <CampaignLab/>}
          {page === 'clients' && <ClientsPage clients={filteredClients} search={search} setSearch={setSearch} openClient={() => setClientModal(true)} deleteClient={deleteClient}/>} 
          {page === 'tasks' && <TasksPage tasks={tasks} cycleTask={cycleTask}/>} 
          {page === 'knowledge' && <KnowledgePage search={search} setSearch={setSearch} provider={provider} setProvider={setProvider} items={filteredGlossary}/>} 
          {page === 'reports' && <ReportsPage clients={clients} metrics={metrics}/>} 
          {page === 'qa' && <QaPage qa={qa} run={() => setQa([clients.length ? '✓ לקוחות נטענו' : '✗ אין לקוחות', tasks.every(item => item.title) ? '✓ משימות תקינות' : '✗ משימה חסרה', glossary.length >= 10 ? '✓ מילון נטען' : '✗ מילון חסר', '✓ מנוע CSV זמין', supabaseConfigured ? '✓ Supabase מוגדר' : '• Supabase טרם הוגדר'])}/>} 
          {page === 'settings' && <SettingsPage/>}
        </div>
      </main>
    </div>
    {clientModal && <Modal title="לקוח חדש" close={() => setClientModal(false)}><input className="input" placeholder="שם לקוח" value={newClient.name} onChange={event => setNewClient({...newClient,name:event.target.value})}/><input className="input" placeholder="תחום" value={newClient.industry} onChange={event => setNewClient({...newClient,industry:event.target.value})}/><select className="input" value={newClient.platform} onChange={event => setNewClient({...newClient,platform:event.target.value as Platform})}><option>שניהם</option><option>Google Ads</option><option>Meta Ads</option></select><input className="input" type="number" value={newClient.budget} onChange={event => setNewClient({...newClient,budget:event.target.value})}/><button className="btn primary" onClick={addClient}>שמירה</button></Modal>}
    {taskModal && <Modal title="משימה חדשה" close={() => setTaskModal(false)}><input className="input" placeholder="כותרת" value={newTask.title} onChange={event => setNewTask({...newTask,title:event.target.value})}/><select className="input" value={newTask.client_name} onChange={event => setNewTask({...newTask,client_name:event.target.value})}><option value="">בחר לקוח</option>{clients.map(item => <option key={item.id}>{item.name}</option>)}</select><input className="input" value={newTask.due_label} onChange={event => setNewTask({...newTask,due_label:event.target.value})}/><button className="btn primary" onClick={addTask}>יצירה</button></Modal>}
  </>;
}

function Brand(){ return <div className="brand"><div className="logo"/><div><h1>פפריקה</h1><small>PPC AGENCY OS</small></div></div>; }
function Metric({ icon: Icon, label, value }: { icon: typeof Activity; label: string; value: string }) { return <div className="card metric"><Icon size={20}/><small>{label}</small><strong>{value}</strong></div>; }
function TaskRow({ task, cycle }: { task: AgencyTask; cycle: (task: AgencyTask) => void }) { return <button className="row" onClick={() => cycle(task)}><div><b>{task.title}</b><small>{task.client_name} · {task.due_label}</small></div><span className="pill">{task.status}</span></button>; }

function Dashboard({ metrics, tasks, tipIndex, setTipIndex, openTask, cycleTask }: { metrics: {budget:number;roas:number;open:number;risk:number}; tasks:AgencyTask[]; tipIndex:number; setTipIndex:(value:number)=>void; openTask:()=>void; cycleTask:(task:AgencyTask)=>void }) {
  return <><section className="hero"><h3>בוקר טוב גיא, יש {metrics.open} פעולות פתוחות</h3><p>חדר מצב לניהול לקוחות, תקציבים, משימות וניתוח קמפיינים.</p></section><section className="grid metrics"><Metric icon={CircleDollarSign} label="תקציב" value={money(metrics.budget)}/><Metric icon={BarChart3} label="ROAS" value={metrics.roas.toFixed(2)}/><Metric icon={ListTodo} label="משימות" value={String(metrics.open)}/><Metric icon={AlertTriangle} label="בסיכון" value={String(metrics.risk)}/></section><section className="grid two"><div className="card"><div className="toolbar"><h3>משימות דחופות</h3><button className="btn primary" onClick={openTask}><Plus size={16}/>חדשה</button></div><div className="list">{tasks.filter(item => item.status !== 'הושלם').slice(0,5).map(item => <TaskRow key={item.id} task={item} cycle={cycleTask}/>)}</div></div><div className="card tips"><span className="pill"><Lightbulb size={14}/> טיפ יומי</span><h3>{tips[tipIndex][0]}</h3><p>{tips[tipIndex][1]}</p><button className="btn primary" onClick={() => setTipIndex((tipIndex + 1) % tips.length)}><RefreshCcw size={16}/>טיפ נוסף</button></div></section></>;
}

function ClientsPage({ clients, search, setSearch, openClient, deleteClient }: { clients:Client[]; search:string; setSearch:(v:string)=>void; openClient:()=>void; deleteClient:(id:string)=>void }) { return <><section className="hero"><h3>לקוחות 360°</h3><p>תיקי לקוחות, תקציבים ובריאות.</p></section><div className="toolbar"><input className="input search" placeholder="חיפוש" value={search} onChange={event => setSearch(event.target.value)}/><button className="btn primary" onClick={openClient}><Plus size={17}/>לקוח חדש</button></div><div className="card table"><table><thead><tr><th>לקוח</th><th>תחום</th><th>פלטפורמה</th><th>תקציב</th><th>ROAS</th><th>בריאות</th><th/></tr></thead><tbody>{clients.map(item => <tr key={item.id}><td><b>{item.name}</b></td><td>{item.industry}</td><td>{item.platform}</td><td>{money(item.monthly_budget)}</td><td>{item.roas}</td><td>{item.health}/100</td><td><button className="btn secondary" onClick={() => deleteClient(item.id)}><Trash2 size={15}/></button></td></tr>)}</tbody></table></div></>; }
function TasksPage({ tasks, cycleTask }: { tasks:AgencyTask[]; cycleTask:(task:AgencyTask)=>void }) { return <><section className="hero"><h3>משימות ו-SLA</h3><p>לחיצה על סטטוס מקדמת את המשימה.</p></section><div className="grid task-columns">{(['לביצוע','בטיפול','הושלם'] as TaskStatus[]).map(status => <div className="card" key={status}><h3>{status}</h3><div className="list">{tasks.filter(item => item.status === status).map(item => <TaskRow key={item.id} task={item} cycle={cycleTask}/>)}</div></div>)}</div></>; }
function KnowledgePage({ search, setSearch, provider, setProvider, items }: { search:string; setSearch:(v:string)=>void; provider:'הכל'|'Google Ads'|'Meta Ads'; setProvider:(v:'הכל'|'Google Ads'|'Meta Ads')=>void; items:GlossaryItem[] }) { return <><section className="hero"><h3>טיפים ומילון PPC</h3><p>ידע מעשי ל-Google Ads ול-Meta Ads.</p></section><div className="toolbar"><input className="input search" value={search} onChange={event => setSearch(event.target.value)} placeholder="חיפוש מושג"/><select className="input" value={provider} onChange={event => setProvider(event.target.value as typeof provider)}><option>הכל</option><option>Google Ads</option><option>Meta Ads</option></select></div><div className="grid glossary-grid">{items.map(item => <article className="card" key={item.term}><span className="pill">{item.provider}</span><h3 dir="ltr">{item.term}</h3><p>{item.definition}</p><div className="practical"><b>בפועל</b><br/>{item.practical}</div></article>)}</div></>; }
function ReportsPage({ clients, metrics }: { clients:Client[]; metrics:{budget:number;open:number} }) { return <><section className="hero"><h3>דוחות</h3><p>סיכום ביצועים ופעולות.</p></section><div className="card report"><h3>סיכום סוכנות</h3><p>לקוחות: {clients.length}</p><p>תקציב: {money(metrics.budget)}</p><p>משימות פתוחות: {metrics.open}</p><button className="btn primary" onClick={() => window.print()}><FileText size={17}/>PDF</button></div></>; }
function QaPage({ qa, run }: { qa:string[]; run:()=>void }) { return <><section className="hero"><h3>QA ובקרה</h3><p>בדיקת תשתית ומנוע הניתוח.</p></section><div className="toolbar"><button className="btn primary" onClick={run}><Activity size={17}/>הרץ QA</button></div><div className="card list">{qa.length ? qa.map(item => <div className="row" key={item}>{item}</div>) : <p>לחץ על הרץ QA.</p>}</div></>; }
function SettingsPage(){ return <><section className="hero"><h3>חיבורים והגדרות</h3><p>Google Ads, Meta Ads, Supabase ותוסף הדפדפן.</p></section><div className="grid two"><div className="card"><h3><Database size={19}/> Supabase</h3><p>{supabaseConfigured ? 'משתני הסביבה קיימים.' : 'נדרש להגדיר משתני סביבה ולהריץ מיגרציות.'}</p></div><div className="card"><h3><Zap size={19}/> Google Ads</h3><p>חיבור קריאה בלבד באמצעות OAuth ו-Developer Token.</p><a className="btn primary" href="/api/google/oauth/start">חיבור Google Ads</a></div><div className="card"><h3><Zap size={19}/> Meta Ads</h3><p>חיבור קריאה בלבד באמצעות ads_read.</p><span className="pill">מוכן להגדרת App</span></div><div className="card"><h3><ScanSearch size={19}/> תוסף דפדפן</h3><p>Side Panel לסריקת טבלאות גלויות והעברת Snapshot לפפריקה.</p><span className="pill good">קוד התוסף מוכן</span></div></div></>; }
function Modal({ title, close, children }: { title:string; close:()=>void; children:ReactNode }) { return <div className="modal"><div className="card modal-box"><div className="toolbar"><h3>{title}</h3><button className="btn secondary" onClick={close}><X size={17}/></button></div><div className="list">{children}</div></div></div>; }
