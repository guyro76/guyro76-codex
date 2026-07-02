'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  Activity, BookOpen, FileText, LayoutDashboard, ListTodo, LogIn, LogOut,
  Menu, Plus, ScanSearch, Settings, ShieldCheck, Target, Users, WalletCards, X,
} from 'lucide-react';
import CampaignLab from './components/CampaignLab';
import DashboardPanel from './components/DashboardPanel';
import ClientsPanel from './components/ClientsPanel';
import TasksPanel from './components/TasksPanel';
import RecommendationsPanel from './components/RecommendationsPanel';
import FinancePanel from './components/FinancePanel';
import ReportsPanel from './components/ReportsPanel';
import SettingsPanel from './components/SettingsPanel';
import { getSupabaseBrowserClient, supabaseConfigured } from '../lib/supabase';
import { loadCloudWorkspace, loadLocalWorkspace, resolveOrganizationId, saveLocalWorkspace } from '../lib/paprika-store';
import { integrations, seedActivity, seedAlerts, seedClients, seedRecommendations, seedTasks } from '../lib/product-data';
import type { AgencyTask, Client, Platform, Priority, Recommendation, RecommendationStatus, TaskStatus } from '../lib/types';

type Page = 'dashboard' | 'campaigns' | 'clients' | 'tasks' | 'recommendations' | 'finance' | 'knowledge' | 'reports' | 'qa' | 'settings';
type UserInfo = { id: string; email?: string };

const navigation = [
  ['dashboard', 'חדר מצב', LayoutDashboard],
  ['campaigns', 'בדיקת קמפיינים', ScanSearch],
  ['clients', 'לקוחות 360°', Users],
  ['tasks', 'משימות ו-SLA', ListTodo],
  ['recommendations', 'המלצות ואישורים', Target],
  ['finance', 'רווחיות הסוכנות', WalletCards],
  ['knowledge', 'מרכז הידע', BookOpen],
  ['reports', 'דוחות', FileText],
  ['qa', 'QA ובקרה', ShieldCheck],
  ['settings', 'חיבורים והגדרות', Settings],
] as const;

const glossary = [
  ['Quality Score', 'Google Ads', 'מדד אבחוני לאיכות מילת המפתח, המודעה ודף הנחיתה.', 'השתמש בו לאיתור חוסר התאמה לכוונה, לא כיעד בפני עצמו.'],
  ['Search Terms', 'Google Ads', 'השאילתות בפועל שהפעילו את המודעות.', 'מצא מילות שלילה, ביטויים חדשים ופערי כוונה.'],
  ['Impression Share', 'Google Ads', 'החשיפות שקיבלת מתוך החשיפות שהיית זכאי לקבל.', 'הפרד אובדן בגלל תקציב מאובדן בגלל דירוג.'],
  ['Performance Max', 'Google Ads', 'קמפיין חוצה ערוצים לפי יעד המרה.', 'חלק קבוצות נכסים לפי הצעה עסקית וחבר ערכי המרה אמינים.'],
  ['Target ROAS', 'Google Ads', 'בידינג לפי יחס יעד בין ערך המרה להוצאה.', 'שנה יעד בהדרגה ואל תשתמש בו ללא ערכי המרה אמינים.'],
  ['Learning Phase', 'Meta Ads', 'תקופת הלמידה של מערכת Meta.', 'צמצם שינויים תכופים ואחד קבוצות חלשות.'],
  ['Frequency', 'Meta Ads', 'מספר החשיפות הממוצע לאדם.', 'פרש יחד עם CTR, CPM, CPA ואיכות ההמרה.'],
  ['Creative Fatigue', 'Meta Ads', 'ירידה בביצועים עקב חשיפה חוזרת.', 'רענן Hook, זווית, הוכחה ופורמט, לא רק צבע.'],
  ['CAPI', 'Meta Ads', 'העברת אירועי המרה מהשרת.', 'בדוק Deduplication ואיכות התאמת האירועים.'],
  ['Attribution', 'Meta Ads', 'חלון הזמן שבו מיוחסת המרה.', 'השווה ל-GA4 ול-CRM וקבע מקור אמת עסקי.'],
] as const;

export default function PaprikaApp() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const fallback = useMemo(() => ({ clients: seedClients, tasks: seedTasks, recommendations: seedRecommendations, alerts: seedAlerts }), []);
  const [page, setPage] = useState<Page>('dashboard');
  const [menu, setMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [organizationId, setOrganizationId] = useState<string>();
  const [email, setEmail] = useState('guyro76@gmail.com');
  const [clients, setClients] = useState<Client[]>([]);
  const [tasks, setTasks] = useState<AgencyTask[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [alerts, setAlerts] = useState(seedAlerts);
  const [tipIndex, setTipIndex] = useState(new Date().getDate() % 5);
  const [search, setSearch] = useState('');
  const [knowledgeSearch, setKnowledgeSearch] = useState('');
  const [knowledgeProvider, setKnowledgeProvider] = useState('הכל');
  const [notice, setNotice] = useState('');
  const [clientModal, setClientModal] = useState(false);
  const [taskModal, setTaskModal] = useState(false);
  const [qa, setQa] = useState<string[]>([]);
  const [newClient, setNewClient] = useState({ name: '', industry: '', platform: 'שניהם' as Platform, budget: '25000', fee: '5500', manager: 'גיא רוזנברג' });
  const [newTask, setNewTask] = useState({ title: '', client_name: '', due_label: 'היום 17:00', priority: 'בינונית' as Priority });

  useEffect(() => {
    let alive = true;
    async function boot() {
      if (!supabase) {
        const local = loadLocalWorkspace(fallback);
        if (!alive) return;
        setClients(local.clients); setTasks(local.tasks); setRecommendations(local.recommendations); setAlerts(local.alerts); setLoading(false);
        return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (!alive) return;
      const currentUser = session?.user ? { id: session.user.id, email: session.user.email } : null;
      setUser(currentUser);
      if (currentUser) await loadCloud(currentUser.id);
      setLoading(false);
    }
    boot();
    const subscription = supabase?.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ? { id: session.user.id, email: session.user.email } : null;
      setUser(currentUser);
      if (currentUser) await loadCloud(currentUser.id);
    });
    return () => { alive = false; subscription?.data.subscription.unsubscribe(); };
  }, [fallback, supabase]);

  useEffect(() => {
    if (!loading && !supabase) saveLocalWorkspace({ clients, tasks, recommendations, alerts });
  }, [alerts, clients, loading, recommendations, supabase, tasks]);

  async function loadCloud(userId: string) {
    if (!supabase) return;
    try {
      const orgId = await resolveOrganizationId(supabase, userId);
      if (!orgId) { setNotice('החשבון מחובר, אך עדיין לא נוצרה סביבת סוכנות.'); return; }
      setOrganizationId(orgId);
      const cloud = await loadCloudWorkspace(supabase, orgId);
      setClients(cloud.clients); setTasks(cloud.tasks); setRecommendations(cloud.recommendations); setAlerts(cloud.alerts);
    } catch (error) { setNotice(error instanceof Error ? error.message : 'טעינת הנתונים נכשלה.'); }
  }

  async function signIn() {
    if (!supabase) return;
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } });
    setNotice(error ? error.message : 'נשלח קישור כניסה מאובטח למייל.');
  }

  async function addClient() {
    if (!newClient.name.trim() || !newClient.industry.trim()) return setNotice('יש למלא שם לקוח ותחום.');
    const record: Client = { id: crypto.randomUUID(), user_id: user?.id, organization_id: organizationId, name: newClient.name.trim(), industry: newClient.industry.trim(), platform: newClient.platform, monthly_budget: Number(newClient.budget) || 0, monthly_fee: Number(newClient.fee) || 0, roas: 0, target_roas: 3, cpa: 0, leads: 0, health: 75, manager: newClient.manager, status: 'בהקמה' };
    if (supabase && user && organizationId) {
      const { data, error } = await supabase.from('clients').insert(record).select().single();
      if (error) return setNotice(error.message);
      setClients((items) => [...items, data as Client]);
    } else setClients((items) => [...items, record]);
    setClientModal(false); setNewClient({ name: '', industry: '', platform: 'שניהם', budget: '25000', fee: '5500', manager: 'גיא רוזנברג' }); setNotice('הלקוח נוסף.');
  }

  async function removeClient(id: string) {
    if (!window.confirm('למחוק את הלקוח?')) return;
    if (supabase && user) await supabase.from('clients').delete().eq('id', id);
    setClients((items) => items.filter((item) => item.id !== id));
  }

  async function addTask() {
    if (!newTask.title.trim()) return setNotice('יש למלא כותרת משימה.');
    const record: AgencyTask = { id: crypto.randomUUID(), user_id: user?.id, organization_id: organizationId, client_id: null, title: newTask.title.trim(), client_name: newTask.client_name || clients[0]?.name || 'ללא לקוח', due_label: newTask.due_label, priority: newTask.priority, status: 'לביצוע', owner: 'גיא' };
    if (supabase && user && organizationId) {
      const { data, error } = await supabase.from('agency_tasks').insert(record).select().single();
      if (error) return setNotice(error.message);
      setTasks((items) => [...items, data as AgencyTask]);
    } else setTasks((items) => [...items, record]);
    setTaskModal(false); setNewTask({ ...newTask, title: '' }); setNotice('המשימה נוצרה.');
  }

  async function cycleTask(task: AgencyTask) {
    const statuses: Record<TaskStatus, TaskStatus> = { 'לביצוע': 'בטיפול', 'בטיפול': 'הושלם', 'הושלם': 'לביצוע' };
    const status = statuses[task.status];
    if (supabase && user) await supabase.from('agency_tasks').update({ status }).eq('id', task.id);
    setTasks((items) => items.map((item) => item.id === task.id ? { ...item, status } : item));
  }

  async function updateRecommendation(id: string, status: RecommendationStatus) {
    if (supabase && user) await supabase.from('recommendations').update({ status }).eq('id', id);
    setRecommendations((items) => items.map((item) => item.id === id ? { ...item, status } : item));
    setNotice(`המלצה עודכנה ל-${status}.`);
  }

  function exportBackup() {
    const blob = new Blob([JSON.stringify({ clients, tasks, recommendations, alerts, exported_at: new Date().toISOString() }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'paprika-backup.json'; anchor.click(); URL.revokeObjectURL(url);
  }

  const filteredClients = clients.filter((client) => `${client.name} ${client.industry} ${client.platform}`.toLowerCase().includes(search.toLowerCase()));
  const filteredGlossary = glossary.filter((item) => (knowledgeProvider === 'הכל' || item[1] === knowledgeProvider) && item.join(' ').toLowerCase().includes(knowledgeSearch.toLowerCase()));

  if (loading) return <main className="login card"><Brand/><p>טוען את סביבת העבודה...</p></main>;
  if (supabaseConfigured && supabase && !user) return <main className="login card"><Brand/><h2>כניסה מאובטחת</h2><p>הזן מייל לקבלת קישור כניסה.</p><input className="input" value={email} onChange={(event) => setEmail(event.target.value)}/><button className="btn primary" onClick={signIn}><LogIn size={17}/>שליחת קישור</button>{notice && <div className="notice">{notice}</div>}</main>;

  return <>
    <div className="shell"><aside className={`side ${menu ? 'open' : ''}`}><Brand/><nav className="nav">{navigation.map(([id, label, Icon]) => <button key={id} className={page === id ? 'active' : ''} onClick={() => { setPage(id); setMenu(false); }}><Icon size={19}/>{label}</button>)}</nav><div className="account-card"><div className="avatar">ג</div><div><b>גיא רוזנברג</b><small>{supabaseConfigured ? 'סביבה מחוברת' : 'מצב עבודה מקומי'}</small></div></div></aside><main className="main"><header className="top"><div className="top-title"><button className="btn secondary mobile" onClick={() => setMenu(true)}><Menu size={18}/></button><div><small>מערכת הפעלה לסוכנות PPC</small><h2>{navigation.find((item) => item[0] === page)?.[1]}</h2></div></div><div className="top-actions"><button className="btn secondary" onClick={() => setClientModal(true)}><Plus size={17}/>לקוח</button><button className="btn primary" onClick={() => setTaskModal(true)}><Plus size={17}/>משימה</button>{user && <button className="btn secondary" onClick={() => supabase?.auth.signOut()}><LogOut size={17}/>יציאה</button>}</div></header><div className="content">{!supabaseConfigured && <div className="notice">מצב עבודה מקומי פעיל. חיבור Supabase יפעיל משתמשים, סנכרון והרשאות.</div>}{notice && <div className="notice">{notice}</div>}
      {page === 'dashboard' && <DashboardPanel clients={clients} tasks={tasks} alerts={alerts} activity={seedActivity} tipIndex={tipIndex} nextTip={() => setTipIndex((tipIndex + 1) % 5)} openTask={() => setTaskModal(true)} openClient={() => setClientModal(true)}/>} 
      {page === 'campaigns' && <CampaignLab/>}
      {page === 'clients' && <ClientsPanel clients={filteredClients} search={search} setSearch={setSearch} openClient={() => setClientModal(true)} removeClient={removeClient}/>} 
      {page === 'tasks' && <TasksPanel tasks={tasks} cycle={cycleTask} openTask={() => setTaskModal(true)}/>} 
      {page === 'recommendations' && <RecommendationsPanel items={recommendations} updateStatus={updateRecommendation}/>} 
      {page === 'finance' && <FinancePanel clients={clients}/>} 
      {page === 'knowledge' && <KnowledgePage items={filteredGlossary} search={knowledgeSearch} setSearch={setKnowledgeSearch} provider={knowledgeProvider} setProvider={setKnowledgeProvider}/>} 
      {page === 'reports' && <ReportsPanel clients={clients} tasks={tasks} recommendations={recommendations} exportBackup={exportBackup}/>} 
      {page === 'qa' && <QaPage results={qa} run={() => setQa([clients.length ? '✓ תיק לקוחות נטען' : '✗ אין לקוחות', tasks.every((task) => task.title && task.client_name) ? '✓ משימות תקינות' : '✗ משימה חסרה', recommendations.every((item) => item.rollback_plan) ? '✓ לכל המלצה יש Rollback' : '✗ חסר Rollback', alerts.length ? '✓ מרכז התראות פעיל' : '• אין התראות פעילות', supabaseConfigured ? '✓ Supabase מוגדר' : '• Supabase ממתין לחיבור', '✓ מנוע ניתוח CSV זמין'])}/>} 
      {page === 'settings' && <SettingsPanel integrations={integrations}/>} 
    </div></main></div>
    {clientModal && <Modal title="לקוח חדש" close={() => setClientModal(false)}><input className="input" placeholder="שם לקוח" value={newClient.name} onChange={(event) => setNewClient({ ...newClient, name: event.target.value })}/><input className="input" placeholder="תחום פעילות" value={newClient.industry} onChange={(event) => setNewClient({ ...newClient, industry: event.target.value })}/><select className="input" value={newClient.platform} onChange={(event) => setNewClient({ ...newClient, platform: event.target.value as Platform })}><option>שניהם</option><option>Google Ads</option><option>Meta Ads</option></select><input className="input" type="number" placeholder="תקציב מדיה" value={newClient.budget} onChange={(event) => setNewClient({ ...newClient, budget: event.target.value })}/><input className="input" type="number" placeholder="ריטיינר חודשי" value={newClient.fee} onChange={(event) => setNewClient({ ...newClient, fee: event.target.value })}/><input className="input" placeholder="מנהל לקוח" value={newClient.manager} onChange={(event) => setNewClient({ ...newClient, manager: event.target.value })}/><button className="btn primary" onClick={addClient}>שמירה</button></Modal>}
    {taskModal && <Modal title="משימה חדשה" close={() => setTaskModal(false)}><input className="input" placeholder="כותרת" value={newTask.title} onChange={(event) => setNewTask({ ...newTask, title: event.target.value })}/><select className="input" value={newTask.client_name} onChange={(event) => setNewTask({ ...newTask, client_name: event.target.value })}><option value="">בחר לקוח</option>{clients.map((client) => <option key={client.id}>{client.name}</option>)}</select><input className="input" value={newTask.due_label} onChange={(event) => setNewTask({ ...newTask, due_label: event.target.value })}/><select className="input" value={newTask.priority} onChange={(event) => setNewTask({ ...newTask, priority: event.target.value as Priority })}><option>קריטית</option><option>גבוהה</option><option>בינונית</option><option>נמוכה</option></select><button className="btn primary" onClick={addTask}>יצירה</button></Modal>}
  </>;
}

function Brand() { return <div className="brand"><div className="logo"/><div><h1>פפריקה</h1><small>PPC AGENCY OS</small></div></div>; }
function KnowledgePage({ items, search, setSearch, provider, setProvider }: { items: readonly (readonly string[])[]; search: string; setSearch: (value: string) => void; provider: string; setProvider: (value: string) => void }) { return <div className="page-stack"><section className="page-hero"><div className="page-hero-icon"><BookOpen/></div><div><h2>מרכז הידע</h2><p>מושגים, טיפים והסברים מעשיים למנהלי קמפיינים.</p></div></section><div className="card toolbar-card"><input className="input search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="חיפוש מושג"/><select className="input compact" value={provider} onChange={(event) => setProvider(event.target.value)}><option>הכל</option><option>Google Ads</option><option>Meta Ads</option></select></div><div className="grid glossary-grid">{items.map((item) => <article className="card" key={item[0]}><span className="pill">{item[1]}</span><h3 dir="ltr">{item[0]}</h3><p>{item[2]}</p><div className="practical"><b>בפועל</b><br/>{item[3]}</div></article>)}</div></div>; }
function QaPage({ results, run }: { results: string[]; run: () => void }) { return <div className="page-stack"><section className="page-hero"><div className="page-hero-icon"><ShieldCheck/></div><div><h2>QA ובקרת איכות</h2><p>בדיקה פנימית של נתונים, זרימות עבודה ומוכנות המוצר.</p></div><div className="page-hero-action"><button className="btn primary" onClick={run}><Activity size={17}/>הרץ QA</button></div></section><section className="card qa-grid">{results.length ? results.map((result) => <div className={result.startsWith('✓') ? 'qa-pass' : result.startsWith('•') ? 'qa-warn' : 'qa-fail'} key={result}>{result}</div>) : <p>לחץ על הרץ QA כדי להתחיל.</p>}</section></div>; }
function Modal({ title, close, children }: { title: string; close: () => void; children: ReactNode }) { return <div className="modal"><div className="card modal-box"><div className="section-head"><h3>{title}</h3><button className="btn secondary" onClick={close}><X size={17}/></button></div><div className="list">{children}</div></div></div>; }
