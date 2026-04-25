create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  github_id text unique,
  github_username text unique not null,
  display_name text,
  avatar_url text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  summary text not null,
  description text not null,
  tech_stack text[] not null default '{}',
  highlights text[] not null default '{}',
  cover_image text,
  repo_url text,
  demo_url text,
  order_index int not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text not null,
  content_markdown text not null default '',
  cover_image text,
  status text not null check (status in ('draft', 'published')) default 'draft',
  is_pinned boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists note_tags (
  note_id uuid not null references notes(id) on delete cascade,
  tag text not null,
  primary key (note_id, tag)
);

create table if not exists site_settings (
  id int primary key default 1,
  hero_title text not null,
  hero_subtitle text not null,
  social_links jsonb not null default '[]'::jsonb,
  project_order text[] not null default '{}',
  updated_at timestamptz not null default now(),
  constraint single_settings_row check (id = 1)
);

alter table profiles enable row level security;
alter table projects enable row level security;
alter table notes enable row level security;
alter table note_tags enable row level security;
alter table site_settings enable row level security;

drop policy if exists "public read projects" on projects;
create policy "public read projects" on projects
for select using (is_published = true);

drop policy if exists "public read published notes" on notes;
create policy "public read published notes" on notes
for select using (status = 'published');

drop policy if exists "public read note tags" on note_tags;
create policy "public read note tags" on note_tags
for select using (
  exists (
    select 1 from notes
    where notes.id = note_tags.note_id
      and notes.status = 'published'
  )
);

drop policy if exists "owner full access profiles" on profiles;
create policy "owner full access profiles" on profiles
for all using (auth.jwt() ->> 'user_name' = 'lulalalual')
with check (auth.jwt() ->> 'user_name' = 'lulalalual');

drop policy if exists "owner full access projects" on projects;
create policy "owner full access projects" on projects
for all using (auth.jwt() ->> 'user_name' = 'lulalalual')
with check (auth.jwt() ->> 'user_name' = 'lulalalual');

drop policy if exists "owner full access notes" on notes;
create policy "owner full access notes" on notes
for all using (auth.jwt() ->> 'user_name' = 'lulalalual')
with check (auth.jwt() ->> 'user_name' = 'lulalalual');

drop policy if exists "owner full access note tags" on note_tags;
create policy "owner full access note tags" on note_tags
for all using (auth.jwt() ->> 'user_name' = 'lulalalual')
with check (auth.jwt() ->> 'user_name' = 'lulalalual');

drop policy if exists "owner full access site settings" on site_settings;
create policy "owner full access site settings" on site_settings
for all using (auth.jwt() ->> 'user_name' = 'lulalalual')
with check (auth.jwt() ->> 'user_name' = 'lulalalual');
