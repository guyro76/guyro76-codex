-- ארץ-עיר GO! — חשבונות, תפקידים, חבילות והזמנות
--
-- עקרונות שהסכימה הזו אוכפת ברמת מסד הנתונים, לא רק בקוד הלקוח:
-- 1. משתמש יכול לקרוא ולעדכן רק את השורה של עצמו.
-- 2. משתמש **לא יכול** לשנות לעצמו תפקיד או חבילה. זה נאכף בהרשאות
--    ברמת עמודה, כך שגם מי שישלח בקשה ידנית ל-API לא יצליח.
-- 3. הזמנות נראות ונערכות רק על ידי מנהל; מימוש נעשה דרך פונקציה
--    ייעודית, כדי שמשתמש רגיל לא יוכל לקרוא את טבלת ההזמנות כולה.

-- ===== טיפוסים =====
do $$ begin
  create type public.account_role as enum ('user', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.account_tier as enum ('free', 'bronze', 'silver', 'gold');
exception when duplicate_object then null; end $$;

-- ===== חשבונות =====
create table if not exists public.accounts (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  display_name text,
  role public.account_role not null default 'user',
  tier public.account_tier not null default 'free',
  -- null = החבילה אינה פגה (למשל free). אחרת: הרגע שבו יורדים חזרה ל-free.
  tier_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists accounts_role_idx on public.accounts (role);
create index if not exists accounts_tier_idx on public.accounts (tier);

-- ===== הזמנות =====
create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  tier public.account_tier not null default 'silver',
  -- לכמה ימים ההזמנה מזכה. 7 = שבוע התנסות.
  days integer not null default 7 check (days > 0 and days <= 3650),
  max_uses integer not null default 1 check (max_uses > 0),
  used_count integer not null default 0 check (used_count >= 0),
  expires_at timestamptz,
  note text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists invitations_code_idx on public.invitations (code);

create table if not exists public.invitation_redemptions (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations (id) on delete cascade,
  account_id uuid not null references public.accounts (id) on delete cascade,
  redeemed_at timestamptz not null default now(),
  unique (invitation_id, account_id)
);

-- ===== עזר: האם המשתמש הנוכחי מנהל =====
-- security definer כדי שהבדיקה תוכל לקרוא את הטבלה בלי להיתקל ב-RLS
-- של עצמה (אחרת נוצרת רקורסיה בין המדיניות לפונקציה).
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.accounts
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ===== יצירת חשבון אוטומטית בהרשמה =====
-- כל משתמש שנרשם (Google, Apple או מייל) מקבל שורה בחשבונות.
-- כתובת אחת מוגדרת מראש כמנהל המערכת, כך שהחשבון הזה מקבל הרשאות
-- ניהול כבר בכניסה הראשונה — בלי שאף אחד יצטרך לגעת במסד הנתונים.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.accounts (id, email, display_name, role)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      split_part(coalesce(new.email, 'שחקן'), '@', 1)
    ),
    case when lower(new.email) = 'guyro76@gmail.com' then 'admin'::public.account_role
         else 'user'::public.account_role end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ===== שמירת updated_at =====
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists accounts_touch_updated_at on public.accounts;
create trigger accounts_touch_updated_at
  before update on public.accounts
  for each row execute function public.touch_updated_at();

-- ===== RLS =====
alter table public.accounts enable row level security;
alter table public.invitations enable row level security;
alter table public.invitation_redemptions enable row level security;

drop policy if exists accounts_select_own on public.accounts;
create policy accounts_select_own on public.accounts
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists accounts_update_own on public.accounts;
create policy accounts_update_own on public.accounts
  for update using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

drop policy if exists invitations_admin_all on public.invitations;
create policy invitations_admin_all on public.invitations
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists redemptions_select_own on public.invitation_redemptions;
create policy redemptions_select_own on public.invitation_redemptions
  for select using (account_id = auth.uid() or public.is_admin());

-- ===== הרשאות ברמת עמודה =====
-- זה הלב של ההגנה: משתמש מחובר יכול לעדכן את השם התצוגתי שלו בלבד.
-- role ו-tier אינם ניתנים לעדכון על ידו בשום מסלול, גם לא בקריאה
-- ישירה ל-API, כי ההרשאה עצמה לא קיימת.
revoke all on public.accounts from anon, authenticated;
grant select on public.accounts to authenticated;
grant update (display_name) on public.accounts to authenticated;

revoke all on public.invitations from anon, authenticated;
grant select, insert, update, delete on public.invitations to authenticated; -- מסונן ב-RLS למנהל בלבד

revoke all on public.invitation_redemptions from anon, authenticated;
grant select on public.invitation_redemptions to authenticated;

-- ===== מימוש הזמנה =====
-- security definer: מאפשר למשתמש רגיל לממש קוד בלי לתת לו גישת
-- קריאה לטבלת ההזמנות. הפונקציה בודקת תוקף, מכסת שימושים וכפילות,
-- ורק אז משדרגת את החבילה.
create or replace function public.redeem_invitation(invite_code text)
returns table (ok boolean, message text, tier public.account_tier, expires_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  inv public.invitations%rowtype;
  uid uuid := auth.uid();
  new_expiry timestamptz;
begin
  if uid is null then
    return query select false, 'צריך להתחבר כדי לממש קוד', null::public.account_tier, null::timestamptz;
    return;
  end if;

  select * into inv from public.invitations
    where code = upper(trim(invite_code)) for update;

  if not found then
    return query select false, 'הקוד לא נמצא', null::public.account_tier, null::timestamptz;
    return;
  end if;

  if inv.expires_at is not null and inv.expires_at < now() then
    return query select false, 'פג תוקפו של הקוד', null::public.account_tier, null::timestamptz;
    return;
  end if;

  if inv.used_count >= inv.max_uses then
    return query select false, 'הקוד כבר נוצל במלואו', null::public.account_tier, null::timestamptz;
    return;
  end if;

  if exists (select 1 from public.invitation_redemptions r
             where r.invitation_id = inv.id and r.account_id = uid) then
    return query select false, 'כבר מימשת את הקוד הזה', null::public.account_tier, null::timestamptz;
    return;
  end if;

  -- מי שכבר בתוך תקופה בתשלום מקבל הארכה, לא איפוס
  select greatest(coalesce(a.tier_expires_at, now()), now()) + (inv.days || ' days')::interval
    into new_expiry
    from public.accounts a where a.id = uid;

  update public.accounts
     set tier = inv.tier, tier_expires_at = new_expiry
   where id = uid;

  insert into public.invitation_redemptions (invitation_id, account_id) values (inv.id, uid);
  update public.invitations set used_count = used_count + 1 where id = inv.id;

  return query select true, 'הקוד מומש בהצלחה!', inv.tier, new_expiry;
end;
$$;

grant execute on function public.redeem_invitation(text) to authenticated;
grant execute on function public.is_admin() to authenticated;

-- ===== החבילה האפקטיבית =====
-- חבילה שפג תוקפה חוזרת ל-free. מחושב בשליפה כדי שלא נהיה תלויים
-- במשימה מתוזמנת שתרד בדיוק ברגע הלא נכון.
create or replace function public.my_account()
returns table (
  id uuid,
  email text,
  display_name text,
  role public.account_role,
  tier public.account_tier,
  tier_expires_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select a.id, a.email, a.display_name, a.role,
         case when a.tier_expires_at is not null and a.tier_expires_at < now()
              then 'free'::public.account_tier else a.tier end,
         a.tier_expires_at
    from public.accounts a
   where a.id = auth.uid();
$$;

grant execute on function public.my_account() to authenticated;
