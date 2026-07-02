import type { SupabaseClient } from '@supabase/supabase-js';
import type { AgencyTask, AlertItem, Client, Recommendation } from './types';

const keys = {
  clients: 'paprika-v2-clients',
  tasks: 'paprika-v2-tasks',
  recommendations: 'paprika-v2-recommendations',
  alerts: 'paprika-v2-alerts',
};

export type WorkspaceData = {
  clients: Client[];
  tasks: AgencyTask[];
  recommendations: Recommendation[];
  alerts: AlertItem[];
};

export function loadLocalWorkspace(fallback: WorkspaceData): WorkspaceData {
  if (typeof window === 'undefined') return fallback;
  const read = <T,>(key: string, value: T): T => {
    try { return JSON.parse(window.localStorage.getItem(key) || 'null') || value; }
    catch { return value; }
  };
  return {
    clients: read(keys.clients, fallback.clients),
    tasks: read(keys.tasks, fallback.tasks),
    recommendations: read(keys.recommendations, fallback.recommendations),
    alerts: read(keys.alerts, fallback.alerts),
  };
}

export function saveLocalWorkspace(data: WorkspaceData) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(keys.clients, JSON.stringify(data.clients));
  window.localStorage.setItem(keys.tasks, JSON.stringify(data.tasks));
  window.localStorage.setItem(keys.recommendations, JSON.stringify(data.recommendations));
  window.localStorage.setItem(keys.alerts, JSON.stringify(data.alerts));
}

export async function loadCloudWorkspace(supabase: SupabaseClient, organizationId: string): Promise<WorkspaceData> {
  const [clients, tasks, recommendations, alerts] = await Promise.all([
    supabase.from('clients').select('*').eq('organization_id', organizationId).order('created_at'),
    supabase.from('agency_tasks').select('*').eq('organization_id', organizationId).order('created_at'),
    supabase.from('recommendations').select('*').eq('organization_id', organizationId).order('created_at', { ascending: false }),
    supabase.from('alerts').select('*').eq('organization_id', organizationId).eq('resolved', false).order('created_at', { ascending: false }),
  ]);
  const error = clients.error || tasks.error || recommendations.error || alerts.error;
  if (error) throw new Error(error.message);
  return {
    clients: (clients.data || []) as Client[],
    tasks: (tasks.data || []) as AgencyTask[],
    recommendations: (recommendations.data || []) as Recommendation[],
    alerts: (alerts.data || []) as AlertItem[],
  };
}

export async function resolveOrganizationId(supabase: SupabaseClient, userId: string, email?: string) {
  const membership = await supabase
    .from('memberships')
    .select('organization_id')
    .eq('user_id', userId)
    .order('created_at')
    .limit(1)
    .maybeSingle();
  if (membership.error) throw new Error(membership.error.message);
  if (membership.data?.organization_id) return membership.data.organization_id as string;

  const baseName = (email?.split('@')[0] || 'Paprika').replace(/[^a-zA-Z0-9_-]/g, '') || 'Paprika';
  const slug = `${baseName.toLowerCase()}-${userId.slice(0, 8)}`;
  const organization = await supabase
    .from('organizations')
    .insert({ name: `${baseName} Agency`, slug, owner_id: userId, plan: 'trial' })
    .select('id')
    .single();
  if (organization.error || !organization.data) throw new Error(organization.error?.message || 'לא ניתן ליצור סביבת סוכנות.');

  const membershipInsert = await supabase.from('memberships').insert({ organization_id: organization.data.id, user_id: userId, role: 'owner' });
  if (membershipInsert.error) throw new Error(membershipInsert.error.message);
  await supabase.from('subscriptions').insert({ organization_id: organization.data.id, status: 'trial', plan: 'trial' });
  return organization.data.id as string;
}
