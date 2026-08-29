-- ====================================================
-- Migration 2: rename the project namespace from
-- `portfolio` to `kalelodukuray` so the schema/bucket
-- match the project (and domain) name.
--
-- RUN ORDER:
--   1. scripts/migrate-bucket.mjs already copied files
--      from `portfolio-media` to `kalelodukuray-media`.
--   2. Run this whole file in the Supabase SQL Editor.
--   3. Dashboard → Integrations → Data API → Settings →
--      "Exposed schemas": check `kalelodukuray` (the old
--      `portfolio` entry disappears with the rename) → Save.
--   4. Deploy the updated code.
--
-- Old buckets `media` and `portfolio-media` are left as
-- backups — delete them from the dashboard once the site
-- is verified.
-- ====================================================

-- 1. Rename the schema. Tables, data, indexes, RLS policies,
--    grants, and default privileges all follow automatically.
alter schema portfolio rename to kalelodukuray;

-- 2. Storage policies for the new bucket (bucket already created
--    by the migration script). Public read, authenticated write.
create policy "Public can read kalelodukuray-media"
  on storage.objects for select
  using (bucket_id = 'kalelodukuray-media');

create policy "Authenticated users can upload to kalelodukuray-media"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'kalelodukuray-media');

create policy "Authenticated users can update kalelodukuray-media"
  on storage.objects for update to authenticated
  using (bucket_id = 'kalelodukuray-media');

create policy "Authenticated users can delete from kalelodukuray-media"
  on storage.objects for delete to authenticated
  using (bucket_id = 'kalelodukuray-media');

-- 3. Rewrite stored URLs from the old bucket to the new one.
update kalelodukuray.profiles set
  avatar_url = replace(avatar_url, '/object/public/portfolio-media/', '/object/public/kalelodukuray-media/');

update kalelodukuray.work_experience set
  logo_url = replace(logo_url, '/object/public/portfolio-media/', '/object/public/kalelodukuray-media/');

update kalelodukuray.education set
  logo_url = replace(logo_url, '/object/public/portfolio-media/', '/object/public/kalelodukuray-media/');

update kalelodukuray.projects set
  image_url = replace(image_url, '/object/public/portfolio-media/', '/object/public/kalelodukuray-media/'),
  video_url = replace(video_url, '/object/public/portfolio-media/', '/object/public/kalelodukuray-media/');

update kalelodukuray.hackathons set
  image_url = replace(image_url, '/object/public/portfolio-media/', '/object/public/kalelodukuray-media/');

update kalelodukuray.blog_posts set
  image_url = replace(image_url, '/object/public/portfolio-media/', '/object/public/kalelodukuray-media/'),
  content   = replace(content,   '/object/public/portfolio-media/', '/object/public/kalelodukuray-media/');
