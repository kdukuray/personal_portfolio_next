import { createBrowserClient } from "@supabase/ssr";

/**
 * Creates a Supabase client for use in browser/client components.
 * Uses the public anon key and project URL from environment variables.
 * @returns A Supabase browser client instance.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    // All tables for this site live in the "kalelodukuray" schema of the shared
    // "Personal Projects Shared" Supabase instance.
    { db: { schema: "kalelodukuray" } }
  );
}
