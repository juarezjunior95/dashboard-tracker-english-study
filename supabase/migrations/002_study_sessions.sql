-- Tracks individual study sessions.
create table if not exists public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  duration_minutes integer not null check (duration_minutes >= 0),
  activity_type text not null,
  notes text
);

create index if not exists study_sessions_date_idx on public.study_sessions (date desc);
create index if not exists study_sessions_activity_idx on public.study_sessions (activity_type);

alter table public.study_sessions enable row level security;

-- Dev / single-user: replace with auth.uid() policies when auth is enabled.
create policy "study_sessions_select" on public.study_sessions for select using (true);
create policy "study_sessions_insert" on public.study_sessions for insert with check (true);
create policy "study_sessions_update" on public.study_sessions for update using (true) with check (true);
create policy "study_sessions_delete" on public.study_sessions for delete using (true);