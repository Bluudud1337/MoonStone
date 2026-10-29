-- MoonStone account cloud saves
-- Run this entire file in Supabase SQL Editor.
create table if not exists public.moonstone_user_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.moonstone_user_data enable row level security;

revoke all on table public.moonstone_user_data from anon;
grant select, insert, update on table public.moonstone_user_data to authenticated;

drop policy if exists "Users can read their own MoonStone data" on public.moonstone_user_data;
create policy "Users can read their own MoonStone data"
  on public.moonstone_user_data for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their own MoonStone data" on public.moonstone_user_data;
create policy "Users can insert their own MoonStone data"
  on public.moonstone_user_data for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own MoonStone data" on public.moonstone_user_data;
create policy "Users can update their own MoonStone data"
  on public.moonstone_user_data for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
