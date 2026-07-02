create or replace function public.assign_paprika_organization()
returns trigger
language plpgsql
security invoker
as $$
begin
  if new.organization_id is null then
    select m.organization_id
    into new.organization_id
    from public.memberships m
    where m.user_id = auth.uid()
    order by m.created_at
    limit 1;
  end if;
  return new;
end;
$$;

drop trigger if exists data_imports_assign_org on public.data_imports;
create trigger data_imports_assign_org before insert on public.data_imports for each row execute function public.assign_paprika_organization();
drop trigger if exists campaign_rows_assign_org on public.campaign_rows;
create trigger campaign_rows_assign_org before insert on public.campaign_rows for each row execute function public.assign_paprika_organization();
drop trigger if exists recommendations_assign_org on public.recommendations;
create trigger recommendations_assign_org before insert on public.recommendations for each row execute function public.assign_paprika_organization();
drop trigger if exists connections_assign_org on public.ad_connections;
create trigger connections_assign_org before insert on public.ad_connections for each row execute function public.assign_paprika_organization();
drop trigger if exists audit_assign_org on public.audit_events;
create trigger audit_assign_org before insert on public.audit_events for each row execute function public.assign_paprika_organization();
drop trigger if exists browser_assign_org on public.browser_ingest_events;
create trigger browser_assign_org before insert on public.browser_ingest_events for each row execute function public.assign_paprika_organization();
