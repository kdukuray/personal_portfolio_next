/**
 * One-time migration: copy every object from the old "media" bucket into the
 * new "portfolio-media" bucket, as part of namespacing this project inside the
 * shared "Personal Projects Shared" Supabase instance.
 *
 * The old bucket and its files are left untouched as a backup — delete the
 * "media" bucket manually from the Supabase dashboard once you've verified
 * the site works.
 *
 * Usage:
 *   SUPABASE_SERVICE_ROLE_KEY="<your service role key>" node scripts/migrate-bucket.mjs
 *
 * The Supabase URL is read from .env.local automatically. The service role
 * key is NOT stored anywhere — pass it inline as shown above. Find it in the
 * Supabase dashboard under Settings → API → service_role.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const OLD_BUCKET = "media";
const NEW_BUCKET = "portfolio-media";

// Minimal .env.local parser (only need the URL; no dotenv dependency).
const envUrl = readFileSync(new URL("../.env.local", import.meta.url), "utf8")
  .split("\n")
  .find((line) => line.startsWith("NEXT_PUBLIC_SUPABASE_URL="))
  ?.split("=")[1]
  ?.trim();

const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!envUrl || !serviceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL in .env.local or SUPABASE_SERVICE_ROLE_KEY in env."
  );
  process.exit(1);
}

const supabase = createClient(envUrl, serviceKey);

/** Recursively list every file path in a bucket (list() is per-folder). */
async function listAllFiles(bucket, prefix = "") {
  const files = [];
  let offset = 0;
  const limit = 100;
  for (;;) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(prefix, { limit, offset });
    if (error) throw new Error(`list "${prefix}": ${error.message}`);
    for (const entry of data) {
      const path = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.id === null) {
        // Folders come back with a null id.
        files.push(...(await listAllFiles(bucket, path)));
      } else {
        files.push(path);
      }
    }
    if (data.length < limit) break;
    offset += limit;
  }
  return files;
}

// 1. Create the new bucket (public, like the old one).
const { error: createError } = await supabase.storage.createBucket(NEW_BUCKET, {
  public: true,
});
if (createError && !/already exists/i.test(createError.message)) {
  throw new Error(`createBucket: ${createError.message}`);
}
console.log(`Bucket "${NEW_BUCKET}" ready.`);

// 2. Copy every object across.
const files = await listAllFiles(OLD_BUCKET);
console.log(`Found ${files.length} file(s) in "${OLD_BUCKET}".`);

let copied = 0;
let skipped = 0;
for (const path of files) {
  const { error } = await supabase.storage
    .from(OLD_BUCKET)
    .copy(path, path, { destinationBucket: NEW_BUCKET });
  if (error) {
    if (/already exists|resource already exists/i.test(error.message)) {
      skipped++; // safe to re-run
      continue;
    }
    throw new Error(`copy "${path}": ${error.message}`);
  }
  copied++;
  console.log(`  copied ${path}`);
}

// 3. Verify.
const newFiles = await listAllFiles(NEW_BUCKET);
console.log(
  `Done. Copied ${copied}, skipped ${skipped} (already present). ` +
    `"${NEW_BUCKET}" now has ${newFiles.length} file(s), "${OLD_BUCKET}" has ${files.length}.`
);
if (newFiles.length < files.length) {
  console.error("WARNING: new bucket has fewer files than the old one!");
  process.exit(1);
}
