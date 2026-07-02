export type Platform = 'Google Ads' | 'Meta Ads' | 'שניהם';
export type TaskStatus = 'לביצוע' | 'בטיפול' | 'הושלם';
export type Priority = 'קריטית' | 'גבוהה' | 'בינונית' | 'נמוכה';
export type RecommendationStatus = 'ממתין' | 'אושר' | 'נדחה' | 'בוצע';
export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type Client = {
  id: string;
  user_id?: string;
  organization_id?: string;
  name: string;
  industry: string;
  platform: Platform;
  monthly_budget: number;
  monthly_fee: number;
  roas: number;
  target_roas: number;
  cpa: number;
  leads: number;
  health: number;
  manager: string;
  status: 'פעיל' | 'בהקמה' | 'בסיכון' | 'מושהה';
  created_at?: string;
};

export type AgencyTask = {
  id: string;
  user_id?: string;
  organization_id?: string;
  title: string;
  client_id?: string | null;
  client_name: string;
  due_label: string;
  priority: Priority;
  status: TaskStatus;
  owner?: string;
  created_at?: string;
};

export type Recommendation = {
  id: string;
  user_id?: string;
  organization_id?: string;
  client_id?: string | null;
  client_name: string;
  platform: Platform;
  title: string;
  reason: string;
  action: string;
  expected_impact: string;
  confidence: number;
  severity: Severity;
  status: RecommendationStatus;
  rollback_plan: string;
  created_at?: string;
};

export type AlertItem = {
  id: string;
  client_name: string;
  title: string;
  details: string;
  severity: Severity;
  created_at: string;
};

export type ActivityItem = {
  id: string;
  actor: string;
  action: string;
  entity: string;
  created_at: string;
};

export type IntegrationState = {
  id: 'google_ads' | 'meta_ads' | 'ga4' | 'crm' | 'supabase';
  name: string;
  status: 'connected' | 'pending' | 'error' | 'disconnected';
  last_sync?: string;
  details: string;
};
