import type { ActivityItem, AgencyTask, AlertItem, Client, IntegrationState, Recommendation } from './types';

export const seedClients: Client[] = [
  { id: 'client-1', name: 'אלפא נדל״ן', industry: 'נדל״ן', platform: 'שניהם', monthly_budget: 128000, monthly_fee: 9200, roas: 4.2, target_roas: 3.8, cpa: 184, leads: 136, health: 88, manager: 'גיא רוזנברג', status: 'פעיל' },
  { id: 'client-2', name: 'קליניקת אור', industry: 'בריאות ואסתטיקה', platform: 'Meta Ads', monthly_budget: 46000, monthly_fee: 6200, roas: 2.6, target_roas: 3.2, cpa: 243, leads: 61, health: 62, manager: 'גיא רוזנברג', status: 'בסיכון' },
  { id: 'client-3', name: 'טקפוינט', industry: 'B2B וטכנולוגיה', platform: 'Google Ads', monthly_budget: 76000, monthly_fee: 7800, roas: 3.7, target_roas: 3.4, cpa: 318, leads: 79, health: 81, manager: 'גיא רוזנברג', status: 'פעיל' },
  { id: 'client-4', name: 'מרקט השף', industry: 'איקומרס', platform: 'שניהם', monthly_budget: 92000, monthly_fee: 8400, roas: 5.1, target_roas: 4.1, cpa: 96, leads: 284, health: 93, manager: 'גיא רוזנברג', status: 'פעיל' },
];

export const seedTasks: AgencyTask[] = [
  { id: 'task-1', title: 'בדיקת חריגת תקציב ב-Performance Max', client_name: 'אלפא נדל״ן', due_label: 'היום 12:00', priority: 'קריטית', status: 'לביצוע', owner: 'גיא' },
  { id: 'task-2', title: 'אישור 3 מודעות חדשות לרימרקטינג', client_name: 'קליניקת אור', due_label: 'היום 15:30', priority: 'גבוהה', status: 'בטיפול', owner: 'גיא' },
  { id: 'task-3', title: 'הוספת מילות שלילה מדוח Search Terms', client_name: 'טקפוינט', due_label: 'מחר 10:00', priority: 'גבוהה', status: 'לביצוע', owner: 'גיא' },
  { id: 'task-4', title: 'שליחת דוח חודשי והמלצות', client_name: 'מרקט השף', due_label: 'היום 17:00', priority: 'בינונית', status: 'הושלם', owner: 'גיא' },
];

export const seedRecommendations: Recommendation[] = [
  { id: 'rec-1', client_name: 'אלפא נדל״ן', platform: 'Google Ads', title: 'להעביר 15% תקציב לקמפיין החיפוש הממיר', reason: 'הקמפיין מציג CPA נמוך ב-24% מהממוצע ויציבות במשך 14 יום.', action: 'העבר 15% מתקציב Performance Max לקמפיין החיפוש והגדר בדיקת תוצאה בעוד 7 ימים.', expected_impact: '+18% לידים צפויים', confidence: 91, severity: 'high', status: 'ממתין', rollback_plan: 'החזר את התקציב אם CPA עולה ביותר מ-15% במשך 3 ימים.' },
  { id: 'rec-2', client_name: 'קליניקת אור', platform: 'Meta Ads', title: 'לעצור קריאייטיב שחוק ולהעלות וריאציה חדשה', reason: 'Frequency הגיע ל-6.8, CTR ירד ב-31% ו-CPM עלה במשך 9 ימים.', action: 'עצור את הקריאייטיב החלש והפעל שתי וריאציות עם Hook חדש וקבוצת ביקורת.', expected_impact: 'חיסכון משוער של ₪3,800', confidence: 94, severity: 'critical', status: 'ממתין', rollback_plan: 'השאר את המודעה המקורית מושהית ולא מחוקה כדי לאפשר שחזור.' },
  { id: 'rec-3', client_name: 'טקפוינט', platform: 'Google Ads', title: 'להרחיב כיסוי לביטויי חיפוש איכותיים', reason: 'אובדן נתח חשיפה בגלל דירוג ומאגר מילות מפתח מצומצם.', action: 'הוסף 8 ביטויי כוונה גבוהה, שפר RSA ודף נחיתה, והפעל ניסוי מבוקר.', expected_impact: '+12% נפח חיפוש', confidence: 82, severity: 'medium', status: 'אושר', rollback_plan: 'השהה מילות מפתח שאינן משיגות המרה לאחר סף קליקים מוסכם.' },
];

export const seedAlerts: AlertItem[] = [
  { id: 'alert-1', client_name: 'קליניקת אור', title: 'חריגה מיעד CPA', details: 'CPA גבוה ב-27% מהיעד בשלושת הימים האחרונים.', severity: 'critical', created_at: 'לפני 18 דקות' },
  { id: 'alert-2', client_name: 'אלפא נדל״ן', title: 'תקציב יומי לקראת מיצוי', details: 'הקמפיין המוביל ניצל 91% מהתקציב לפני השעה 16:00.', severity: 'high', created_at: 'לפני 42 דקות' },
  { id: 'alert-3', client_name: 'טקפוינט', title: 'Tracking דורש בדיקה', details: 'פער של 19% בין Google Ads ל-GA4 במספר ההמרות.', severity: 'medium', created_at: 'היום 09:20' },
];

export const seedActivity: ActivityItem[] = [
  { id: 'activity-1', actor: 'גיא', action: 'אישר המלצה', entity: 'טקפוינט · הרחבת ביטויי חיפוש', created_at: 'היום 11:12' },
  { id: 'activity-2', actor: 'פפריקה', action: 'יצרה התראה', entity: 'קליניקת אור · חריגת CPA', created_at: 'היום 10:48' },
  { id: 'activity-3', actor: 'גיא', action: 'השלים משימה', entity: 'מרקט השף · דוח חודשי', created_at: 'אתמול 17:06' },
];

export const integrations: IntegrationState[] = [
  { id: 'google_ads', name: 'Google Ads', status: 'pending', details: 'חיבור OAuth לקריאה בלבד, MCC ו-Developer Token.' },
  { id: 'meta_ads', name: 'Meta Ads', status: 'pending', details: 'Marketing API עם ads_read ו-Business Manager.' },
  { id: 'ga4', name: 'Google Analytics 4', status: 'pending', details: 'אירועים, הכנסות, משפכים וייחוס.' },
  { id: 'crm', name: 'CRM', status: 'disconnected', details: 'איכות לידים, עסקאות והכנסות בפועל.' },
  { id: 'supabase', name: 'Supabase', status: 'pending', details: 'Auth, מסד נתונים, Storage ו-RLS ייעודיים לפפריקה.' },
];

export const dailyTips = [
  ['אל תמדוד רק ROAS', 'בדוק גם רווח גולמי, איכות לידים, ביטולים ועלות השירות. קמפיין עם ROAS גבוה יכול עדיין להיות לא רווחי.'],
  ['Tracking לפני אופטימיזציה', 'אמת אירועי המרה, UTM, GA4 ו-CRM לפני שינוי בידינג. נתון שגוי יוצר החלטה שגויה.'],
  ['מונחי חיפוש פעם בשבוע', 'עבור על Search Terms לפי כוונה עסקית והוסף מילות שלילה רק לאחר בדיקה.'],
  ['שחיקת קריאייטיב מתחילה מוקדם', 'ב-Meta עקוב אחר Frequency, CPM וירידת CTR. החלף Hook וזווית, לא רק צבע.'],
  ['המלצה חייבת Rollback', 'כל שינוי מהותי בתקציב צריך לכלול סיבה, השפעה צפויה ותנאי חזרה ברורים.'],
];
