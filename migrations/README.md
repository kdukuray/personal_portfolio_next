# Migrations

One-time SQL migrations that were run against the shared **"Personal Projects Shared"** Supabase instance, kept as a historical record of how the database reached its current shape. They have **all already been applied** — do not re-run them.

Numbered in the order they were applied:

| File | Date | What it did |
|---|---|---|
| `001-portfolio-schema.sql` | 2026-08-29 | Moved all tables from the `public` schema into a project-specific `portfolio` schema, and migrated storage from the `media` bucket to `portfolio-media` (files copied by `scripts/migrate-bucket.mjs`, stored URLs rewritten). This established per-project namespacing in the shared instance. |
| `002-rename-kalelodukuray.sql` | 2026-08-29 | Renamed the namespace to match the project/domain name: schema `portfolio` → `kalelodukuray`, bucket `portfolio-media` → `kalelodukuray-media` (files copied by the same script, URLs rewritten again). |

For the **current** database schema, see [`../supabase-setup.sql`](../supabase-setup.sql) — that file is the idempotent, up-to-date setup that would recreate everything on a fresh instance.

For the shared-instance conventions every project must follow (schema-per-project, `<project>-media` buckets, required dashboard steps), see `~/Desktop/Projects/Documentations/supabase-shared-instance/README.md`.

## Adding a future migration

1. Create `NNN-short-description.sql` (next number in sequence) with a header comment stating what it does and any run-order requirements (e.g. storage scripts to run first, dashboard steps after).
2. Run it in the Supabase SQL Editor.
3. Note any manual dashboard steps it required (exposing schemas, deleting buckets) in the header so the record is complete.
