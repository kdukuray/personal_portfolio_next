import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Creates a lightweight Supabase client that does NOT depend on Next.js
 * request-scoped APIs (e.g. cookies()).  This is safe to call during
 * static generation at build time (generateStaticParams, generateMetadata
 * outside a request, etc.).
 *
 * Only the public anon key is used, so this client has the same permissions
 * as an unauthenticated visitor — perfect for reading public data.
 *
 * @returns A Supabase client instance without cookie/session handling.
 */
export function createStaticClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
