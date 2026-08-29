-- ====================================================
-- Migration: namespace this project inside the shared
-- "Personal Projects Shared" Supabase instance.
--
--   * All tables move from the `public` schema into a new
--     `portfolio` schema. Data, indexes, foreign keys, and
--     RLS policies move with them automatically — nothing
--     is copied or lost.
--   * Storage policies are created for the new
--     `portfolio-media` bucket.
--   * Stored file URLs are rewritten from the old `media`
--     bucket to `portfolio-media`.
--
-- RUN ORDER:
--   1. First run scripts/migrate-bucket.mjs (copies the
--      files and creates the portfolio-media bucket).
--   2. Then run this whole file in the Supabase SQL Editor.
--   3. Then, in the dashboard: Settings → API →
--      "Exposed schemas" → add `portfolio`.
--
-- Future projects in this instance get their own schema
-- (e.g. `kaludia`) and their own bucket (e.g. `kaludia-media`).
-- ====================================================

-- 1. Create the project schema and let the Supabase API roles use it.
create schema if not exists portfolio;
grant usage on schema portfolio to anon, authenticated, service_role;

-- 2. Move every table into it. RLS policies and indexes follow the
--    tables; policy subqueries keep pointing at the right tables
--    because Postgres stores them by internal id, not by name.
alter table public.profiles        set schema portfolio;
alter table public.social_links    set schema portfolio;
alter table public.work_experience set schema portfolio;
alter table public.education       set schema portfolio;
alter table public.skills          set schema portfolio;
alter table public.projects        set schema portfolio;
alter table public.project_links   set schema portfolio;
alter table public.hackathons      set schema portfolio;
alter table public.hackathon_links set schema portfolio;
alter table public.blog_posts      set schema portfolio;

-- 3. Grants. Tables in `public` get these automatically on creation;
--    a custom schema needs them spelled out. RLS still controls what
--    anon/authenticated can actually do.
grant all on all tables    in schema portfolio to anon, authenticated, service_role;
grant all on all routines  in schema portfolio to anon, authenticated, service_role;
grant all on all sequences in schema portfolio to anon, authenticated, service_role;
alter default privileges in schema portfolio
  grant all on tables    to anon, authenticated, service_role;
alter default privileges in schema portfolio
  grant all on routines  to anon, authenticated, service_role;
alter default privileges in schema portfolio
  grant all on sequences to anon, authenticated, service_role;

-- 4. Storage policies for the new bucket (created by the migration
--    script). Mirrors the old `media` bucket: public read, and only
--    logged-in users can write.
create policy "Public can read portfolio-media"
  on storage.objects for select
  using (bucket_id = 'portfolio-media');

create policy "Authenticated users can upload to portfolio-media"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'portfolio-media');

create policy "Authenticated users can update portfolio-media"
  on storage.objects for update to authenticated
  using (bucket_id = 'portfolio-media');

create policy "Authenticated users can delete from portfolio-media"
  on storage.objects for delete to authenticated
  using (bucket_id = 'portfolio-media');

-- 5. Rewrite stored URLs that point at the old bucket. Only the
--    bucket segment of Supabase storage URLs changes; external URLs
--    are untouched because the search string won't match them.
update portfolio.profiles set
  avatar_url = replace(avatar_url, '/object/public/media/', '/object/public/portfolio-media/');

update portfolio.work_experience set
  logo_url = replace(logo_url, '/object/public/media/', '/object/public/portfolio-media/');

update portfolio.education set
  logo_url = replace(logo_url, '/object/public/media/', '/object/public/portfolio-media/');

update portfolio.projects set
  image_url = replace(image_url, '/object/public/media/', '/object/public/portfolio-media/'),
  video_url = replace(video_url, '/object/public/media/', '/object/public/portfolio-media/');

update portfolio.hackathons set
  image_url = replace(image_url, '/object/public/media/', '/object/public/portfolio-media/');

-- blog content is markdown that may embed uploaded images inline.
update portfolio.blog_posts set
  image_url = replace(image_url, '/object/public/media/', '/object/public/portfolio-media/'),
  content   = replace(content,   '/object/public/media/', '/object/public/portfolio-media/');

-- NOT included on purpose: deleting the old `media` bucket. Keep it
-- as a backup until the site is verified, then delete it from the
-- dashboard (Storage → media → delete bucket).
