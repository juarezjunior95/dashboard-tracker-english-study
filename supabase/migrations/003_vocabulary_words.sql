-- Vocabulary tracking table for English study dashboard.
create table if not exists public.vocabulary_words (
  id uuid primary key default gen_random_uuid(),
  word text not null unique,
  learned_date date not null default current_date,
  review_count integer not null default 0 check (review_count >= 0),
  reviewed_at date
);

create index if not exists vocabulary_words_learned_date_idx
  on public.vocabulary_words (learned_date desc);

create index if not exists vocabulary_words_reviewed_at_idx
  on public.vocabulary_words (reviewed_at desc);

alter table public.vocabulary_words enable row level security;

-- Dev / single-user setup. Replace with auth policies later.
create policy "vocabulary_words_select" on public.vocabulary_words for select using (true);
create policy "vocabulary_words_insert" on public.vocabulary_words for insert with check (true);
create policy "vocabulary_words_update" on public.vocabulary_words for update using (true) with check (true);
create policy "vocabulary_words_delete" on public.vocabulary_words for delete using (true);
