-- Zodiaque & 28 Lettres — initial account and saved-profile schema
-- Apply only to the dedicated Zodiaque Supabase project.
-- All personal rows are private and scoped to auth.uid().

create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  preferred_language text not null default 'fr'
    check (preferred_language in ('fr', 'ar', 'en')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_display_name_length check (char_length(display_name) <= 120)
);

create table if not exists public.saved_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  label text not null,
  subject_name text not null default '',
  birth_date date,
  birth_time time,
  timezone text,
  latitude double precision,
  longitude double precision,
  location_label text not null default '',
  calculation_snapshot jsonb not null default '{}'::jsonb,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint saved_profiles_label_length check (char_length(trim(label)) between 1 and 120),
  constraint saved_profiles_subject_name_length check (char_length(subject_name) <= 120),
  constraint saved_profiles_notes_length check (char_length(notes) <= 4000),
  constraint saved_profiles_latitude_range check (latitude is null or latitude between -90 and 90),
  constraint saved_profiles_longitude_range check (longitude is null or longitude between -180 and 180)
);

create index if not exists saved_profiles_user_updated_idx
  on public.saved_profiles (user_id, updated_at desc);

alter table public.profiles enable row level security;
alter table public.saved_profiles enable row level security;

drop policy if exists "Users can read their own account profile" on public.profiles;
create policy "Users can read their own account profile"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their own account profile" on public.profiles;
create policy "Users can create their own account profile"
  on public.profiles for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own account profile" on public.profiles;
create policy "Users can update their own account profile"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own account profile" on public.profiles;
create policy "Users can delete their own account profile"
  on public.profiles for delete to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can read their own saved profiles" on public.saved_profiles;
create policy "Users can read their own saved profiles"
  on public.saved_profiles for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their own saved profiles" on public.saved_profiles;
create policy "Users can create their own saved profiles"
  on public.saved_profiles for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own saved profiles" on public.saved_profiles;
create policy "Users can update their own saved profiles"
  on public.saved_profiles for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own saved profiles" on public.saved_profiles;
create policy "Users can delete their own saved profiles"
  on public.saved_profiles for delete to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.saved_profiles to authenticated;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists saved_profiles_set_updated_at on public.saved_profiles;
create trigger saved_profiles_set_updated_at
  before update on public.saved_profiles
  for each row execute function public.set_updated_at();
