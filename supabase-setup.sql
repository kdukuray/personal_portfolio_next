-- ====================================================
-- Supabase Setup SQL for Personal Portfolio Dashboard
-- Run this in your Supabase SQL Editor
--
-- This project lives in the shared "Personal Projects
-- Shared" Supabase instance. Everything is namespaced in
-- the `kalelodukuray` schema (and the `kalelodukuray-media`
-- storage bucket) so other projects can share the
-- instance without collisions. After running this on a
-- fresh instance, also add `kalelodukuray` to Settings → API
-- → "Exposed schemas" in the Supabase dashboard.
--
-- (Already-existing databases were migrated with
-- the migration SQL files instead.)
-- ====================================================

-- Project schema + access for the Supabase API roles.
create schema if not exists kalelodukuray;
grant usage on schema kalelodukuray to anon, authenticated, service_role;
alter default privileges in schema kalelodukuray
  grant all on tables to anon, authenticated, service_role;
alter default privileges in schema kalelodukuray
  grant all on routines to anon, authenticated, service_role;
alter default privileges in schema kalelodukuray
  grant all on sequences to anon, authenticated, service_role;

-- 1. PROFILES TABLE
-- Stores the site owner's personal information.
create table if not exists kalelodukuray.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  initials text not null default '',
  url text not null default '',
  location text not null default '',
  location_link text not null default '',
  description text not null default '',
  summary text not null default '',
  avatar_url text not null default '',
  email text not null default '',
  phone text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. SOCIAL LINKS TABLE
-- Stores social media and contact links for the profile.
create table if not exists kalelodukuray.social_links (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references kalelodukuray.profiles(id) on delete cascade,
  name text not null default '',
  url text not null default '',
  icon_key text not null default 'globe',
  show_in_navbar boolean not null default true,
  display_order integer not null default 0
);

-- 3. WORK EXPERIENCE TABLE
create table if not exists kalelodukuray.work_experience (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references kalelodukuray.profiles(id) on delete cascade,
  company text not null default '',
  href text not null default '',
  location text not null default '',
  title text not null default '',
  logo_url text not null default '',
  start_date text not null default '',
  end_date text not null default '',
  description text not null default '',
  badges text[] not null default '{}',
  is_active boolean not null default true,
  display_order integer not null default 0
);

-- Migration for databases created before is_active existed (safe to re-run).
alter table kalelodukuray.work_experience
  add column if not exists is_active boolean not null default true;

-- 4. EDUCATION TABLE
create table if not exists kalelodukuray.education (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references kalelodukuray.profiles(id) on delete cascade,
  school text not null default '',
  href text not null default '',
  degree text not null default '',
  logo_url text not null default '',
  start_date text not null default '',
  end_date text not null default '',
  display_order integer not null default 0
);

-- 5. SKILLS TABLE
create table if not exists kalelodukuray.skills (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references kalelodukuray.profiles(id) on delete cascade,
  name text not null default '',
  display_order integer not null default 0
);

-- 6. PROJECTS TABLE
create table if not exists kalelodukuray.projects (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references kalelodukuray.profiles(id) on delete cascade,
  title text not null default '',
  href text not null default '',
  dates text not null default '',
  description text not null default '',
  image_url text not null default '',
  video_url text not null default '',
  active boolean not null default true,
  technologies text[] not null default '{}',
  display_order integer not null default 0
);

-- 7. PROJECT LINKS TABLE
create table if not exists kalelodukuray.project_links (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references kalelodukuray.projects(id) on delete cascade,
  type text not null default '',
  href text not null default '',
  icon_key text not null default 'globe'
);

-- 8. HACKATHONS TABLE
create table if not exists kalelodukuray.hackathons (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references kalelodukuray.profiles(id) on delete cascade,
  title text not null default '',
  dates text not null default '',
  location text not null default '',
  description text not null default '',
  image_url text not null default '',
  mlh_link text not null default '',
  display_order integer not null default 0
);

-- 9. HACKATHON LINKS TABLE
create table if not exists kalelodukuray.hackathon_links (
  id uuid primary key default gen_random_uuid(),
  hackathon_id uuid not null references kalelodukuray.hackathons(id) on delete cascade,
  title text not null default '',
  href text not null default '',
  icon_key text not null default 'globe'
);

-- 10. BLOG POSTS TABLE
create table if not exists kalelodukuray.blog_posts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references kalelodukuray.profiles(id) on delete cascade,
  slug text not null unique,
  title text not null default '',
  summary text not null default '',
  content text not null default '',
  image_url text not null default '',
  published_at timestamptz,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================

-- Enable RLS on all tables
alter table kalelodukuray.profiles enable row level security;
alter table kalelodukuray.social_links enable row level security;
alter table kalelodukuray.work_experience enable row level security;
alter table kalelodukuray.education enable row level security;
alter table kalelodukuray.skills enable row level security;
alter table kalelodukuray.projects enable row level security;
alter table kalelodukuray.project_links enable row level security;
alter table kalelodukuray.hackathons enable row level security;
alter table kalelodukuray.hackathon_links enable row level security;
alter table kalelodukuray.blog_posts enable row level security;

-- PUBLIC READ POLICIES (anyone can read for the public website)
create policy "Public profiles are viewable by everyone"
  on kalelodukuray.profiles for select using (true);

create policy "Public social links are viewable by everyone"
  on kalelodukuray.social_links for select using (true);

create policy "Public work experience is viewable by everyone"
  on kalelodukuray.work_experience for select using (true);

create policy "Public education is viewable by everyone"
  on kalelodukuray.education for select using (true);

create policy "Public skills are viewable by everyone"
  on kalelodukuray.skills for select using (true);

create policy "Public projects are viewable by everyone"
  on kalelodukuray.projects for select using (true);

create policy "Public project links are viewable by everyone"
  on kalelodukuray.project_links for select using (true);

create policy "Public hackathons are viewable by everyone"
  on kalelodukuray.hackathons for select using (true);

create policy "Public hackathon links are viewable by everyone"
  on kalelodukuray.hackathon_links for select using (true);

create policy "Published blog posts are viewable by everyone"
  on kalelodukuray.blog_posts for select using (true);

-- AUTHENTICATED WRITE POLICIES (only the profile owner can modify)
create policy "Users can update their own profile"
  on kalelodukuray.profiles for update using (auth.uid() = id);

create policy "Users can insert their own social links"
  on kalelodukuray.social_links for insert with check (auth.uid() = profile_id);
create policy "Users can update their own social links"
  on kalelodukuray.social_links for update using (auth.uid() = profile_id);
create policy "Users can delete their own social links"
  on kalelodukuray.social_links for delete using (auth.uid() = profile_id);

create policy "Users can insert their own work experience"
  on kalelodukuray.work_experience for insert with check (auth.uid() = profile_id);
create policy "Users can update their own work experience"
  on kalelodukuray.work_experience for update using (auth.uid() = profile_id);
create policy "Users can delete their own work experience"
  on kalelodukuray.work_experience for delete using (auth.uid() = profile_id);

create policy "Users can insert their own education"
  on kalelodukuray.education for insert with check (auth.uid() = profile_id);
create policy "Users can update their own education"
  on kalelodukuray.education for update using (auth.uid() = profile_id);
create policy "Users can delete their own education"
  on kalelodukuray.education for delete using (auth.uid() = profile_id);

create policy "Users can insert their own skills"
  on kalelodukuray.skills for insert with check (auth.uid() = profile_id);
create policy "Users can update their own skills"
  on kalelodukuray.skills for update using (auth.uid() = profile_id);
create policy "Users can delete their own skills"
  on kalelodukuray.skills for delete using (auth.uid() = profile_id);

create policy "Users can insert their own projects"
  on kalelodukuray.projects for insert with check (auth.uid() = profile_id);
create policy "Users can update their own projects"
  on kalelodukuray.projects for update using (auth.uid() = profile_id);
create policy "Users can delete their own projects"
  on kalelodukuray.projects for delete using (auth.uid() = profile_id);

create policy "Users can insert project links for their projects"
  on kalelodukuray.project_links for insert with check (
    exists (select 1 from kalelodukuray.projects where id = project_id and profile_id = auth.uid())
  );
create policy "Users can update project links for their projects"
  on kalelodukuray.project_links for update using (
    exists (select 1 from kalelodukuray.projects where id = project_id and profile_id = auth.uid())
  );
create policy "Users can delete project links for their projects"
  on kalelodukuray.project_links for delete using (
    exists (select 1 from kalelodukuray.projects where id = project_id and profile_id = auth.uid())
  );

create policy "Users can insert their own hackathons"
  on kalelodukuray.hackathons for insert with check (auth.uid() = profile_id);
create policy "Users can update their own hackathons"
  on kalelodukuray.hackathons for update using (auth.uid() = profile_id);
create policy "Users can delete their own hackathons"
  on kalelodukuray.hackathons for delete using (auth.uid() = profile_id);

create policy "Users can insert hackathon links for their hackathons"
  on kalelodukuray.hackathon_links for insert with check (
    exists (select 1 from kalelodukuray.hackathons where id = hackathon_id and profile_id = auth.uid())
  );
create policy "Users can update hackathon links for their hackathons"
  on kalelodukuray.hackathon_links for update using (
    exists (select 1 from kalelodukuray.hackathons where id = hackathon_id and profile_id = auth.uid())
  );
create policy "Users can delete hackathon links for their hackathons"
  on kalelodukuray.hackathon_links for delete using (
    exists (select 1 from kalelodukuray.hackathons where id = hackathon_id and profile_id = auth.uid())
  );

create policy "Users can insert their own blog posts"
  on kalelodukuray.blog_posts for insert with check (auth.uid() = profile_id);
create policy "Users can update their own blog posts"
  on kalelodukuray.blog_posts for update using (auth.uid() = profile_id);
create policy "Users can delete their own blog posts"
  on kalelodukuray.blog_posts for delete using (auth.uid() = profile_id);

-- ====================================================
-- INDEXES for better query performance
-- ====================================================
create index if not exists idx_social_links_profile on kalelodukuray.social_links(profile_id);
create index if not exists idx_work_experience_profile on kalelodukuray.work_experience(profile_id);
create index if not exists idx_education_profile on kalelodukuray.education(profile_id);
create index if not exists idx_skills_profile on kalelodukuray.skills(profile_id);
create index if not exists idx_projects_profile on kalelodukuray.projects(profile_id);
create index if not exists idx_project_links_project on kalelodukuray.project_links(project_id);
create index if not exists idx_hackathons_profile on kalelodukuray.hackathons(profile_id);
create index if not exists idx_hackathon_links_hackathon on kalelodukuray.hackathon_links(hackathon_id);
create index if not exists idx_blog_posts_profile on kalelodukuray.blog_posts(profile_id);
create index if not exists idx_blog_posts_slug on kalelodukuray.blog_posts(slug);
create index if not exists idx_blog_posts_published on kalelodukuray.blog_posts(is_published, published_at desc);
