'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Activity, AlertTriangle, BarChart3, BookOpen, CircleDollarSign, Database,
  FileText, LayoutDashboard, Lightbulb, ListTodo, LogIn, LogOut, Menu, Plus,
  RefreshCcw, Settings, ShieldCheck, Trash2, Users, X, Zap,
} from 'lucide-react';
import { getSupabaseBrowserClient, supabaseConfigured } from '../lib/supabase';
import type { AgencyTask, Client, Platform, TaskStatus } from '../lib/types';

type Page = 'dashboard' | 'clients' | 'tasks' | 'knowledge' | 'reports' | 'qa' | 'settings';
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
  ['אל תמדוד רק ROAS', 'בדוק גם רווח גולמי, איכות לידים, החזרות ועלות שירות. ROAS גבוה יכול להסתיר קמפיין לא רווחי.'],
  ['Tracking לפני אופטימיזציה', 'לפני שינוי בידינג ודא שהאירועים, UTM, CRM והייחוס עובדים. נתון שגוי מייצר החלטה שגויה.'],
  ['מונחי חיפוש פעם בשבוע', 'עבר על Search Terms לפי כוונה, הוסף מילות שלילה וחפש הזדמנויות למילות מפתח חדשות.'],
  ['רענון קריאייטיב הוא שינוי זווית', 'ב-Meta החלף Hook, פורמט והוכחה. החלפת צבע בלבד לרוב לא עוצרת שחיקה.'],
];

const glossary: GlossaryItem[] = [
  { term: 'Quality Score', provider: 'Google Ads', definition: 'מדד אבחוני לאיכות מילת המפתח, המודעה ודף הנחיתה.', practical: 'השתמש בו כדי לזהות חוסר התאמה לכוונה, לא כמטרה בפני עצמה.' },
  { term: 'Search Impression Share', provider: 'Google Ads', definition: 'אחוז החשיפות שקיבלת מתוך החשיפות שהיית זכאי לקבל.', practical: 'הפרד אובדן בגלל תקציב מאובדן בגלל דירוג לפני החלטה.' },
  { term: 'Search Terms', provider: 'Google Ads', definition: 'השאילתות בפועל שהפעילו את המודעות.', practical: 'מקור מרכזי למילות שלילה, הרחבת מילות מפתח והבנת כוונה.' },
  { term: 'Performance Max', provider: 'Google Ads', definition: 'קמפיין אוטומטי חוצה ערוצי Google לפי יעד המרה.', practical: 'חלק Asset Groups לפי הצעה עסקית וחבר פיד וערכי המרה איכותיים.' },
  { term: 'Target ROAS', provider: 'Google Ads', definition: 'אסטרטגיית בידינג שמנסה להשיג יחס יעד בין ערך המרות להוצאה.', practical: 'חייבת ערכי המרה אמינים ושינויים הדרגתיים ביעד.' },
  { term: 'Learning Phase', provider: 'Meta Ads', definition: 'תקופה שבה מערכת Meta לומדת איך להשיג את תוצאת האופטימיזציה.', practical: 'צמצם שינויים תכופים ואחד קבוצות מודעות כשאין מספיק אירועים.' },
  { term: 'Frequency', provider: 'Meta Ads', definition: 'מספר החשיפות הממוצע לאדם.', practical: 'פרש יחד עם CTR, CPM והמרות. Frequency גבוה לבדו אינו תקלה.' },
  { term: 'CAPI', provider: 'Meta Ads', definition: 'Conversions API להעברת אירועים מהשרת ל-Meta.', practical: 'הפעל Deduplication מול Pixel ובדוק Event Match Quality.' },
  { term: 'Creative Fatigue', provider: 'Meta Ads', definition: 'ירידה בביצועים עקב חשיפה חוזרת או איבוד רלוונטיות.', practical: 'רענן Hook, זווית, פורמט והוכחה ולא רק עיצוב.' },
  { term: 'Attribution Setting', provider: 'Meta Ads', definition: 'חלון הזמן שבו Meta מייחסת המרה לחשיפה או הקלקה.', practical: 'השווה ל-GA4 ול-CRM וקבע מקור אמת עסקי.' },
];

const navigation = [
  ['dashboard', 'חדר מצב', LayoutDashboard],
  ['clients', 'לקוחות 360°', Users],
  ['tasks', 'משימות ו-SLA', ListTodo],
  ['knowledge', 'טיפים ומילון PPC', BookOpen],
  ['reports', 'דוחות', FileText],
  ['qa', 'QA ובקרה', ShieldCheck],
  ['settings', 'הגדרות', Settings],
] as const;

function money(value: number) {
  return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(value);
}

function localLoad<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) || 'null') || fallback; } catch { return fallback; }
}

export default function Home() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [page, setPage] = useState<Page>('dashboard');
  const [menu, setMenu] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [email, setEmail] = useState('guyro76@gmail.com');
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [tasks, setTasks] = useState<AgencyTask[]>([]);
  const [clientSearch, setClientSearch] = useState('');
  const [knowledgeSearch, setKnowledgeSearch] = useState('');
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
      if (session?.user) await loadCloud(session.user.id);
      else { setClients([]); setTasks([]); }
    });
    return () => { active = false; listener?.data.subscription.unsubscribe(); };
  }, [supabase]);

  async function loadCloud(userId: string) {
    if (!supabase) return;
    const [clientResult, taskResult] = await Promise.all([
      supabase.from('clients').select('*').eq('user_id', userId).order('created_at'),
      supabase.from('agency_tasks').select('*').eq('user_id', userId).order('created_at'),
    ]);
    if (clientResult.error || taskResult.error) {
      setNotice('Supabase מחובר, אך הסכמה עדיין לא הותקנה במלואה.');
      return;
    }
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
    const record = {
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
    setNewClient({ name: '', industry: '', platform: 'שניהם', budget: '25000' });
    setClientModal(false); setNotice('הלקוח נוסף ונשמר.');
  }

  async function deleteClient(id: string) {
    if (!confirm('למחוק את הלקוח?')) return;
    if (supabase && user) await supabase.from('clients').delete().eq('id', id);
    const next = clients.filter(client => client.id !== id); setClients(next); saveLocal(next, tasks);
  }

  async function addTask() {
    if (!newTask.title.trim()) return setNotice('יש למלא כותרת משימה.');
    const record = {
      id: crypto.randomUUID(), user_id: user?.id, client_id: null, title: newTask.title.trim(),
      client_name: newTask.client_name || clients[0]?.name || 'ללא לקוח', due_label: newTask.due_label,
      priority: newTask.priority, status: 'לביצוע' as TaskStatus,
    };
    if (supabase && user) {
      const { data, error } = await supabase.from('agency_tasks').insert(record).select().single();
      if (error) return setNotice(error.message);
      setTasks(value => [...value, data]);
    } else {
      const next = [...tasks, record]; setTasks(next); saveLocal(clients, next);
    }
    setNewTask({ ...newTask, title: '' }); setTaskModal(false); setNotice('המשימה נוצרה.');
  }

  async function cycleTask(task: AgencyTask) {
    const statuses: Record<TaskStatus, TaskStatus> = { 'לביצוע': 'בטיפול', 'בטיפול': 'הושלם', 'הושלם': 'לביצוע' };
    const status = statuses[task.status];
    if (supabase && user) await supabase.from('agency_tasks').update({ status }).eq('id', task.id);
    const next = tasks.map(item => item.id === task.id ? { ...item, status } : item);
    setTasks(next); saveLocal(clients, next);
  }

  function runQa() {
    setQa([
      clients.length ? '✓ קיימים לקוחות במערכת' : '✗ אין לקוחות',
      tasks.every(task => task.title && task.client_name) ? '✓ כל המשימות שלמות' : '✗ נמצאו משימות חסרות',
      glossary.length >= 10 ? '✓ מילון PPC נטען' : '✗ מילון חסר',
      supabaseConfigured ? '✓ משתני Supabase קיימים' : '✗ Supabase עדיין לא הוגדר ב-Vercel',
      user ? '✓ משתמש מאומת' : '• מצב הדגמה ללא התחברות',
    ]);
  }

  const metrics = {
    budget: clients.reduce((sum, client) => sum + client.monthly_budget, 0),
    roas: clients.length ? clients.reduce((sum, client) => sum + client.roas, 0) / clients.length : 0,
    open: tasks.filter(task => task.status !== 'הושלם').length,
    risk: clients.filter(client => client.health < 70).length,
  };
  const filteredClients = clients.filter(client => `${client.name}${client.industry}${client.platform}`.toLowerCase().includes(clientSearch.toLowerCase()));
  const filteredGlossary = glossary.filter(item => (provider === 'הכל' || item.provider === provider) && `${item.term}${item.definition}${item.practical}`.toLowerCase().includes(knowledgeSearch.toLowerCase()));

  if (loading) return <div className="login card"><h1>פפריקה</h1><p>טוען מערכת...</p></div>;

  if (supabase && supabaseConfigured && !user) {
    return <main className="login card">
      <div className="brand"><div className="logo"/><div><h1>פפריקה</h1><small>PPC AGENCY OS</small></div></div>
      <h2>כניסה מאובטחת</h2><p>המערכת מחוברת ל-Supabase. הזן מייל לקבלת קישור כניסה.</p>
      <div className="field"><label>כתובת מייל</label><input className="input" value={email} onChange={event => setEmail(event.target.value)}/></div>
      <button className="btn primary" onClick={signIn}><LogIn size={17}/>שליחת קישור כניסה</button>
      {notice && <div className="notice">{notice}</div>}
    </main>;
  }

  return <div className="shell">
    <aside className={`side ${menu ? 'open' : ''}`}>
      <div className="brand"><div className="logo"/><div><h1>פפריקה</h1><small>PPC AGENCY OS</small></div></div>
      <nav className="nav">{navigation.map(([id, label, Icon]) => <button key={id} className={page === id ? 'active' : ''} onClick={() => { setPage(id); setMenu(false); }}><Icon size={19}/>{label}</button>)}</nav>
    </aside>
    <main className="main">
      <header className="top">
        <div className="top-title"><button className="btn secondary mobile" onClick={() => setMenu(true)}><Menu size={18}/></button><div><small>מערכת ניהול סוכנות</small><h2>{navigation.find(item => item[0] === page)?.[1]}</h2></div></div>
        <div className="top-actions"><button className="btn secondary" onClick={() => setTaskModal(true)}><Plus size={17}/>משימה</button>{user && <button className="btn secondary" onClick={() => supabase?.auth.signOut()}><LogOut size={17}/>יציאה</button>}</div>
      </header>
      <div className="content">
        {!supabaseConfigured && <div className="notice"><Database size={17}/> מצב הדגמה מקומי. לאחר הגדרת משתני Supabase ב-Vercel הנתונים יישמרו בענן.</div>}

        {page === 'dashboard' && <>
          <section className="hero"><h3>בוקר טוב גיא, יש {metrics.open} פעולות פתוחות</h3><p>חדר מצב לניהול לקוחות, תקציבים, משימות, ידע מקצועי ובקרת איכות לסוכנות Google Ads ו-Meta Ads.</p></section>
          <section className="grid metrics"><Metric icon={CircleDollarSign} label="תקציב מנוהל" value={money(metrics.budget)}/><Metric icon={BarChart3} label="ROAS ממוצע" value={metrics.roas.toFixed(2)}/><Metric icon={ListTodo} label="משימות פתוחות" value={String(metrics.open)}/><Metric icon={AlertTriangle} label="לקוחות בסיכון" value={String(metrics.risk)}/></section>
          <section className="grid two"><div className="card"><div className="toolbar"><h3>משימות דחופות</h3><button className="btn primary" onClick={() => setTaskModal(true)}><Plus size={16}/>חדשה</button></div><div className="list">{tasks.filter(task => task.status !== 'הושלם').slice(0, 5).map(task => <TaskRow key={task.id} task={task} cycle={cycleTask}/>)}</div></div><div className="card tips"><span className="pill"><Lightbulb size={14}/> טיפ יומי</span><h3>{tips[tipIndex][0]}</h3><p>{tips[tipIndex][1]}</p><button className="btn primary" onClick={() => setTipIndex((tipIndex + 1) % tips.length)}><RefreshCcw size={16}/>טיפ נוסף</button></div></section>
        </>}

        {page === 'clients' && <><section className="hero"><h3>לקוחות 360°</h3><p>ניהול תיקי לקוח, פלטפורמות, תקציבים, בריאות ו-ROAS.</p></section><div className="toolbar"><input className="input search" placeholder="חיפוש לקוח" value={clientSearch} onChange={event => setClientSearch(event.target.value)}/><button className="btn primary" onClick={() => setClientModal(true)}><Plus size={17}/>לקוח חדש</button></div><div className="card table"><table><thead><tr><th>לקוח</th><th>תחום</th><th>פלטפורמה</th><th>תקציב</th><th>ROAS</th><th>בריאות</th><th/></tr></thead><tbody>{filteredClients.map(client => <tr key={client.id}><td><b>{client.name}</b></td><td>{client.industry}</td><td><span className="pill">{client.platform}</span></td><td>{money(client.monthly_budget)}</td><td>{client.roas}</td><td><span className={`pill ${client.health >= 70 ? 'good' : 'bad'}`}>{client.health}/100</span></td><td><button className="btn secondary" onClick={() => deleteClient(client.id)}><Trash2 size={15}/></button></td></tr>)}</tbody></table></div></>}

        {page === 'tasks' && <><section className="hero"><h3>משימות ו-SLA</h3><p>לחיצה על סטטוס המשימה מקדמת אותה לבטיפול, להשלמה וחזרה לביצוע.</p></section><div className="toolbar"><span/><button className="btn primary" onClick={() => setTaskModal(true)}><Plus size={17}/>משימה חדשה</button></div><div className="grid task-columns">{(['לביצוע', 'בטיפול', 'הושלם'] as TaskStatus[]).map(status => <div className="card" key={status}><h3>{status} ({tasks.filter(task => task.status === status).length})</h3><div className="list">{tasks.filter(task => task.status === status).map(task => <TaskRow key={task.id} task={task} cycle={cycleTask}/>)}</div></div>)}</div></>}

        {page === 'knowledge' && <><section className="hero"><h3>טיפים ומילון PPC</h3><p>ידע יומי והסברים מעשיים למושגים מרכזיים ב-Google Ads וב-Meta Ads.</p></section><div className="toolbar"><input className="input search" placeholder="חיפוש מושג" value={knowledgeSearch} onChange={event => setKnowledgeSearch(event.target.value)}/><select className="input" value={provider} onChange={event => setProvider(event.target.value as typeof provider)}><option>הכל</option><option>Google Ads</option><option>Meta Ads</option></select></div><div className="grid glossary-grid">{filteredGlossary.map(item => <article className="card glossary-item" key={`${item.provider}-${item.term}`}><span className="pill">{item.provider}</span><h4 dir="ltr">{item.term}</h4><p>{item.definition}</p><div className="practical"><b>איך משתמשים בזה בפועל?</b><br/>{item.practical}</div></article>)}</div></>}

        {page === 'reports' && <><section className="hero"><h3>דוחות לקוח</h3><p>סיכום ביצועים, משימות פתוחות והמלצות פעולה.</p></section><div className="card report"><h3>דוח סיכום סוכנות</h3><p>לקוחות פעילים: {clients.length}</p><p>תקציב כולל: {money(metrics.budget)}</p><p>משימות פתוחות: {metrics.open}</p><button className="btn primary" onClick={() => window.print()}><FileText size={17}/>הדפסה או PDF</button></div></>}

        {page === 'qa' && <><section className="hero"><h3>QA ובקרת איכות</h3><p>בדיקה של תקינות הנתונים, המילון, Supabase והמשימות.</p></section><div className="toolbar"><span/><button className="btn primary" onClick={runQa}><Activity size={17}/>הרץ QA</button></div><div className="card list">{qa.length ? qa.map(result => <div className="row" key={result}>{result}</div>) : <p>לחץ על הרץ QA כדי לבצע בדיקה.</p>}</div></>}

        {page === 'settings' && <><section className="hero"><h3>הגדרות מערכת</h3><p>סטטוס תשתית ומידע על סביבת הפרודקשן.</p></section><div className="grid two"><div className="card"><h3><Database size={19}/> Supabase</h3><p>{supabaseConfigured ? 'משתני הסביבה קיימים.' : 'טרם הוגדרו משתני הסביבה בפרויקט Vercel.'}</p><span className={`pill ${supabaseConfigured ? 'good' : 'bad'}`}>{supabaseConfigured ? 'מוגדר' : 'חסר'}</span></div><div className="card"><h3><Zap size={19}/> Vercel</h3><p>הפרויקט בנוי כיישום Next.js עצמאי תחת תיקיית paprika-app.</p><span className="pill">מוכן לפרויקט נפרד</span></div></div></>}
      </div>
    </main>

    {clientModal && <Modal title="לקוח חדש" close={() => setClientModal(false)}><Field label="שם לקוח"><input className="input" value={newClient.name} onChange={event => setNewClient({ ...newClient, name: event.target.value })}/></Field><Field label="תחום"><input className="input" value={newClient.industry} onChange={event => setNewClient({ ...newClient, industry: event.target.value })}/></Field><Field label="פלטפורמה"><select className="input" value={newClient.platform} onChange={event => setNewClient({ ...newClient, platform: event.target.value as Platform })}><option>שניהם</option><option>Google Ads</option><option>Meta Ads</option></select></Field><Field label="תקציב"><input className="input" type="number" value={newClient.budget} onChange={event => setNewClient({ ...newClient, budget: event.target.value })}/></Field><button className="btn primary" onClick={addClient}>שמירה</button></Modal>}
    {taskModal && <Modal title="משימה חדשה" close={() => setTaskModal(false)}><Field label="כותרת"><input className="input" value={newTask.title} onChange={event => setNewTask({ ...newTask, title: event.target.value })}/></Field><Field label="לקוח"><select className="input" value={newTask.client_name} onChange={event => setNewTask({ ...newTask, client_name: event.target.value })}><option value="">בחר לקוח</option>{clients.map(client => <option key={client.id}>{client.name}</option>)}</select></Field><Field label="מועד"><input className="input" value={newTask.due_label} onChange={event => setNewTask({ ...newTask, due_label: event.target.value })}/></Field><button className="btn primary" onClick={addTask}>יצירה</button></Modal>}
    {notice && <div className="status" onClick={() => setNotice('')}>{notice}</div>}
  </div>;
}

function Metric({ icon: Icon, label, value }: { icon: typeof Activity; label: string; value: string }) {
  return <article className="card metric"><Icon size={22}/><small>{label}</small><strong>{value}</strong></article>;
}
function TaskRow({ task, cycle }: { task: AgencyTask; cycle: (task: AgencyTask) => void }) {
  return <div className="row"><b>{task.title}</b><span>{task.client_name} · {task.due_label}</span><div className="row-actions"><button className="btn secondary" onClick={() => cycle(task)}>{task.status}</button></div></div>;
}
function Modal({ title, close, children }: { title: string; close: () => void; children: React.ReactNode }) {
  return <div className="modal"><div className="card modal-box"><div className="toolbar"><h3>{title}</h3><button className="btn secondary" onClick={close}><X size={17}/></button></div>{children}</div></div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="field"><label>{label}</label>{children}</div>;
}
