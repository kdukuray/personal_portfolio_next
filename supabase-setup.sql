-- ====================================================
-- Supabase Setup SQL for Personal Portfolio Dashboard
-- Run this in your Supabase SQL Editor
-- ====================================================

-- 1. PROFILES TABLE
-- Stores the site owner's personal information.
create table if not exists public.profiles (
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
create table if not exists public.social_links (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  name text not null default '',
  url text not null default '',
  icon_key text not null default 'globe',
  show_in_navbar boolean not null default true,
  display_order integer not null default 0
);

-- 3. WORK EXPERIENCE TABLE
create table if not exists public.work_experience (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  company text not null default '',
  href text not null default '',
  location text not null default '',
  title text not null default '',
  logo_url text not null default '',
  start_date text not null default '',
  end_date text not null default '',
  description text not null default '',
  badges text[] not null default '{}',
  display_order integer not null default 0
);

-- 4. EDUCATION TABLE
create table if not exists public.education (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  school text not null default '',
  href text not null default '',
  degree text not null default '',
  logo_url text not null default '',
  start_date text not null default '',
  end_date text not null default '',
  display_order integer not null default 0
);

-- 5. SKILLS TABLE
create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  name text not null default '',
  display_order integer not null default 0
);

-- 6. PROJECTS TABLE
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
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
create table if not exists public.project_links (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  type text not null default '',
  href text not null default '',
  icon_key text not null default 'globe'
);

-- 8. HACKATHONS TABLE
create table if not exists public.hackathons (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null default '',
  dates text not null default '',
  location text not null default '',
  description text not null default '',
  image_url text not null default '',
  mlh_link text not null default '',
  display_order integer not null default 0
);

-- 9. HACKATHON LINKS TABLE
create table if not exists public.hackathon_links (
  id uuid primary key default gen_random_uuid(),
  hackathon_id uuid not null references public.hackathons(id) on delete cascade,
  title text not null default '',
  href text not null default '',
  icon_key text not null default 'globe'
);

-- 10. BLOG POSTS TABLE
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
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
alter table public.profiles enable row level security;
alter table public.social_links enable row level security;
alter table public.work_experience enable row level security;
alter table public.education enable row level security;
alter table public.skills enable row level security;
alter table public.projects enable row level security;
alter table public.project_links enable row level security;
alter table public.hackathons enable row level security;
alter table public.hackathon_links enable row level security;
alter table public.blog_posts enable row level security;

-- PUBLIC READ POLICIES (anyone can read for the public website)
create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Public social links are viewable by everyone"
  on public.social_links for select using (true);

create policy "Public work experience is viewable by everyone"
  on public.work_experience for select using (true);

create policy "Public education is viewable by everyone"
  on public.education for select using (true);

create policy "Public skills are viewable by everyone"
  on public.skills for select using (true);

create policy "Public projects are viewable by everyone"
  on public.projects for select using (true);

create policy "Public project links are viewable by everyone"
  on public.project_links for select using (true);

create policy "Public hackathons are viewable by everyone"
  on public.hackathons for select using (true);

create policy "Public hackathon links are viewable by everyone"
  on public.hackathon_links for select using (true);

create policy "Published blog posts are viewable by everyone"
  on public.blog_posts for select using (true);

-- AUTHENTICATED WRITE POLICIES (only the profile owner can modify)
create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert their own social links"
  on public.social_links for insert with check (auth.uid() = profile_id);
create policy "Users can update their own social links"
  on public.social_links for update using (auth.uid() = profile_id);
create policy "Users can delete their own social links"
  on public.social_links for delete using (auth.uid() = profile_id);

create policy "Users can insert their own work experience"
  on public.work_experience for insert with check (auth.uid() = profile_id);
create policy "Users can update their own work experience"
  on public.work_experience for update using (auth.uid() = profile_id);
create policy "Users can delete their own work experience"
  on public.work_experience for delete using (auth.uid() = profile_id);

create policy "Users can insert their own education"
  on public.education for insert with check (auth.uid() = profile_id);
create policy "Users can update their own education"
  on public.education for update using (auth.uid() = profile_id);
create policy "Users can delete their own education"
  on public.education for delete using (auth.uid() = profile_id);

create policy "Users can insert their own skills"
  on public.skills for insert with check (auth.uid() = profile_id);
create policy "Users can update their own skills"
  on public.skills for update using (auth.uid() = profile_id);
create policy "Users can delete their own skills"
  on public.skills for delete using (auth.uid() = profile_id);

create policy "Users can insert their own projects"
  on public.projects for insert with check (auth.uid() = profile_id);
create policy "Users can update their own projects"
  on public.projects for update using (auth.uid() = profile_id);
create policy "Users can delete their own projects"
  on public.projects for delete using (auth.uid() = profile_id);

create policy "Users can insert project links for their projects"
  on public.project_links for insert with check (
    exists (select 1 from public.projects where id = project_id and profile_id = auth.uid())
  );
create policy "Users can update project links for their projects"
  on public.project_links for update using (
    exists (select 1 from public.projects where id = project_id and profile_id = auth.uid())
  );
create policy "Users can delete project links for their projects"
  on public.project_links for delete using (
    exists (select 1 from public.projects where id = project_id and profile_id = auth.uid())
  );

create policy "Users can insert their own hackathons"
  on public.hackathons for insert with check (auth.uid() = profile_id);
create policy "Users can update their own hackathons"
  on public.hackathons for update using (auth.uid() = profile_id);
create policy "Users can delete their own hackathons"
  on public.hackathons for delete using (auth.uid() = profile_id);

create policy "Users can insert hackathon links for their hackathons"
  on public.hackathon_links for insert with check (
    exists (select 1 from public.hackathons where id = hackathon_id and profile_id = auth.uid())
  );
create policy "Users can update hackathon links for their hackathons"
  on public.hackathon_links for update using (
    exists (select 1 from public.hackathons where id = hackathon_id and profile_id = auth.uid())
  );
create policy "Users can delete hackathon links for their hackathons"
  on public.hackathon_links for delete using (
    exists (select 1 from public.hackathons where id = hackathon_id and profile_id = auth.uid())
  );

create policy "Users can insert their own blog posts"
  on public.blog_posts for insert with check (auth.uid() = profile_id);
create policy "Users can update their own blog posts"
  on public.blog_posts for update using (auth.uid() = profile_id);
create policy "Users can delete their own blog posts"
  on public.blog_posts for delete using (auth.uid() = profile_id);

-- ====================================================
-- INDEXES for better query performance
-- ====================================================
create index if not exists idx_social_links_profile on public.social_links(profile_id);
create index if not exists idx_work_experience_profile on public.work_experience(profile_id);
create index if not exists idx_education_profile on public.education(profile_id);
create index if not exists idx_skills_profile on public.skills(profile_id);
create index if not exists idx_projects_profile on public.projects(profile_id);
create index if not exists idx_project_links_project on public.project_links(project_id);
create index if not exists idx_hackathons_profile on public.hackathons(profile_id);
create index if not exists idx_hackathon_links_hackathon on public.hackathon_links(hackathon_id);
create index if not exists idx_blog_posts_profile on public.blog_posts(profile_id);
create index if not exists idx_blog_posts_slug on public.blog_posts(slug);
create index if not exists idx_blog_posts_published on public.blog_posts(is_published, published_at desc);
