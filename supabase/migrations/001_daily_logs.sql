-- English Study Tracker: one row per calendar day (local date as YYYY-MM-DD).
create table if not exists public.daily_logs (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  speaking_done boolean not null default false,
  vocab_done boolean not null default false,
  review_done boolean not null default false,
  minutes_studied integer not null default 0 check (minutes_studied >= 0),
  notes text not null default ''
);

create index if not exists daily_logs_date_idx on public.daily_logs (date desc);

alter table public.daily_logs enable row level security;

-- Dev / single-user: replace with auth.uid() policies when you add Supabase Auth.
create policy "daily_logs_select" on public.daily_logs for select using (true);
create policy "daily_logs_insert" on public.daily_logs for insert with check (true);
create policy "daily_logs_update" on public.daily_logs for update using (true) with check (true);
create policy "daily_logs_delete" on public.daily_logs for delete using (true);
