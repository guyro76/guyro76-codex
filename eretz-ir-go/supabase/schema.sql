-- סכמת Supabase למשחק מרחוק וללוח תוצאות מקוון (אופציונלי לחלוטין)
-- המשחק המקומי עובד גם בלי זה.

create table if not exists rooms (
  id uuid primary key default gen_random_uuid(),
  code text unique not null check (char_length(code) between 4 and 6),
  host_nickname text not null check (char_length(host_nickname) <= 20),
  letter text,
  category_ids jsonb not null default '[]',
  round_seconds int not null default 180,
  status text not null default 'lobby' check (status in ('lobby','playing','done')),
  content_pack_version text,
  created_at timestamptz not null default now()
);

create table if not exists room_participants (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references rooms(id) on delete cascade,
  nickname text not null check (char_length(nickname) <= 20), -- כינוי בלבד, ללא שמות מלאים
  joined_at timestamptz not null default now(),
  finished boolean not null default false
);

create table if not exists round_submissions (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references rooms(id) on delete cascade,
  participant_id uuid not null references room_participants(id) on delete cascade,
  answers jsonb not null,
  submitted_at timestamptz not null default now(),
  -- מניעת שליחה אחרי הזמן נבדקת בצד השרת:
  constraint one_submission unique (room_id, participant_id)
);

create table if not exists leaderboard_entries (
  id uuid primary key default gen_random_uuid(),
  nickname text not null check (char_length(nickname) <= 20),
  score int not null check (score >= 0 and score <= 2000), -- זיהוי ניקוד בלתי אפשרי
  originality int not null default 0 check (originality between 0 and 100),
  daily_date date,
  content_pack_version text,
  created_at timestamptz not null default now()
);

-- RLS: קריאה פתוחה לחדרים לפי קוד, כתיבה מוגבלת
alter table rooms enable row level security;
alter table room_participants enable row level security;
alter table round_submissions enable row level security;
alter table leaderboard_entries enable row level security;

create policy "read rooms by code" on rooms for select using (true);
create policy "create room" on rooms for insert with check (true);
create policy "read participants" on room_participants for select using (true);
create policy "join room" on room_participants for insert with check (true);
create policy "read submissions" on round_submissions for select using (true);
create policy "submit once" on round_submissions for insert with check (true);
create policy "read leaderboard" on leaderboard_entries for select using (true);
create policy "append leaderboard" on leaderboard_entries for insert with check (true);

-- הגבלת קצב שליחות מומלצת: הפעילו את ההרחבה supabase_realtime על rooms בלבד,
-- והוסיפו Edge Function לאימות תוצאות לפני הכנסתן ל-leaderboard_entries.
