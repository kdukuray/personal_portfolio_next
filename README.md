<div align="center">
<img alt="Portfolio" src="https://github.com/dillionverma/portfolio/assets/16860528/57ffca81-3f0a-4425-b31d-094f61725455" width="90%">
</div>

# Portfolio [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fdillionverma%2Fportfolio)

Built with next.js, [shadcn/ui](https://ui.shadcn.com/), and [magic ui](https://magicui.design/), deployed on Vercel.

# Features

- Setup only takes a few minutes by editing the [single config file](./src/data/resume.tsx)
- Built using Next.js 14, React, Typescript, Shadcn/UI, TailwindCSS, Framer Motion, Magic UI
- Includes a blog
- Responsive for different devices
- Optimized for Next.js and Vercel

# Getting Started Locally

1. Clone this repository to your local machine:

   ```bash
   git clone https://github.com/dillionverma/portfolio
   ```

2. Move to the cloned directory

   ```bash
   cd portfolio
   ```

3. Install dependencies:

   ```bash
   pnpm install
   ```

4. Start the local Server:

   ```bash
   pnpm dev
   ```

5. Open the [Config file](./src/data/resume.tsx) and make changes

# Supabase

Content (profile, work experience, education, skills, projects, hackathons, blog) lives in Supabase Postgres; the schema is in [`supabase-setup.sql`](./supabase-setup.sql). Run that file in the Supabase SQL editor to create or migrate the tables — it is idempotent.

## Shared instance & namespacing

This project lives in the shared **"Personal Projects Shared"** Supabase instance, which multiple projects use. To keep projects from colliding, each project owns:

- **Its own Postgres schema** — this project's tables all live in the `kalelodukuray` schema (not `public`), named after the site/project. The Supabase clients in `src/lib/supabase/` are configured with `db: { schema: "kalelodukuray" }`, so table names in code stay unprefixed. The schema must be listed under **Settings → API → Exposed schemas** in the Supabase dashboard, or every request 404s.
- **Its own storage bucket** — this project uses `kalelodukuray-media` (public bucket; see `MEDIA_BUCKET` in `src/lib/api.ts`). Storage policies: public read, authenticated write.

Future projects sharing the instance should follow the same pattern: schema `<project>`, bucket `<project>-media`. Auth (`auth.users`) is shared across all projects in the instance.

Migration history: the project first moved from `public`/`media` into a `portfolio` schema/bucket ([`supabase-migration-portfolio-schema.sql`](./supabase-migration-portfolio-schema.sql) + [`scripts/migrate-bucket.mjs`](./scripts/migrate-bucket.mjs)), then was renamed to `kalelodukuray`/`kalelodukuray-media` to match the project name ([`supabase-migration-rename-kalelodukuray.sql`](./supabase-migration-rename-kalelodukuray.sql)).

Notes on `work_experience`:

- `display_order` — position on the homepage. Managed from the dashboard's Work page via the up/down arrows; orders are automatically kept as a clean `0..n-1` sequence.
- `is_active` — toggled from the dashboard's Work page. Inactive jobs stay in the database but are hidden from visitors on the public homepage.

# License

Licensed under the [MIT license](https://github.com/dillionverma/portfolio/blob/main/LICENSE.md).
