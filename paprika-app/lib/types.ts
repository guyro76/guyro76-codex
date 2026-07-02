export type Platform = 'Google Ads' | 'Meta Ads' | 'שניהם';
export type TaskStatus = 'לביצוע' | 'בטיפול' | 'הושלם';

export type Client = {
  id: string;
  user_id?: string;
  name: string;
  industry: string;
  platform: Platform;
  monthly_budget: number;
  roas: number;
  health: number;
  created_at?: string;
};

export type AgencyTask = {
  id: string;
  user_id?: string;
  title: string;
  client_id?: string | null;
  client_name: string;
  due_label: string;
  priority: 'גבוהה' | 'בינונית' | 'נמוכה';
  status: TaskStatus;
  created_at?: string;
};
