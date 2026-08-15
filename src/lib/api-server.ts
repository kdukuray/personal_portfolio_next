import { createClient } from "@/lib/supabase/server";
import { createStaticClient } from "@/lib/supabase/static";
import type {
  Profile,
  SocialLink,
  WorkExperience,
  Education,
  Skill,
  ProjectWithLinks,
  HackathonWithLinks,
  BlogPost,
} from "@/lib/types";

/**
 * Server-side API wrappers that use the server Supabase client.
 * These are used in Server Components and Route Handlers where
 * the browser client is not available.
 */

/**
 * Fetches the site owner's profile (server-side).
 * @returns The profile, or null if none exists.
 */
export async function fetchProfileServer(): Promise<Profile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .limit(1)
    .single();
  if (error) {
    if (error.code === "PGRST116") return null;
    return null;
  }
  return data as Profile;
}

/**
 * Fetches all social links for a profile (server-side).
 * @param profileId - The profile ID.
 * @returns Array of social links.
 */
export async function fetchSocialLinksServer(
  profileId: string
): Promise<SocialLink[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("social_links")
    .select("*")
    .eq("profile_id", profileId)
    .order("display_order", { ascending: true });
  if (error) return [];
  return data as SocialLink[];
}

/**
 * Fetches all work experience entries (server-side).
 * @param profileId - The profile ID.
 * @returns Array of work experience entries.
 */
export async function fetchWorkExperienceServer(
  profileId: string
): Promise<WorkExperience[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("work_experience")
    .select("*")
    .eq("profile_id", profileId)
    .order("display_order", { ascending: true })
    .order("id", { ascending: true });
  if (error) return [];
  return data as WorkExperience[];
}

/**
 * Fetches all education entries (server-side).
 * @param profileId - The profile ID.
 * @returns Array of education entries.
 */
export async function fetchEducationServer(
  profileId: string
): Promise<Education[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("education")
    .select("*")
    .eq("profile_id", profileId)
    .order("display_order", { ascending: true });
  if (error) return [];
  return data as Education[];
}

/**
 * Fetches all skills (server-side).
 * @param profileId - The profile ID.
 * @returns Array of skills.
 */
export async function fetchSkillsServer(
  profileId: string
): Promise<Skill[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("skills")
    .select("*")
    .eq("profile_id", profileId)
    .order("display_order", { ascending: true });
  if (error) return [];
  return data as Skill[];
}

/**
 * Fetches all projects with links (server-side).
 * @param profileId - The profile ID.
 * @returns Array of projects with their links.
 */
export async function fetchProjectsServer(
  profileId: string
): Promise<ProjectWithLinks[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*, project_links(*)")
    .eq("profile_id", profileId)
    .order("display_order", { ascending: true });
  if (error) return [];
  return data as ProjectWithLinks[];
}

/**
 * Fetches all hackathons with links (server-side).
 * @param profileId - The profile ID.
 * @returns Array of hackathons with their links.
 */
export async function fetchHackathonsServer(
  profileId: string
): Promise<HackathonWithLinks[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("hackathons")
    .select("*, hackathon_links(*)")
    .eq("profile_id", profileId)
    .order("display_order", { ascending: true });
  if (error) return [];
  return data as HackathonWithLinks[];
}

/**
 * Fetches all published blog posts (server-side).
 * @returns Array of published blog posts sorted by date.
 */
export async function fetchPublishedBlogPostsServer(): Promise<BlogPost[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("is_published", true)
    .order("published_at", { ascending: false });
  if (error) return [];
  return data as BlogPost[];
}

/**
 * Fetches a single published blog post by slug (server-side).
 * @param slug - The blog post slug.
 * @returns The blog post, or null if not found.
 */
export async function fetchBlogPostBySlugServer(
  slug: string
): Promise<BlogPost | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();
  if (error) return null;
  return data as BlogPost;
}

/**
 * Gets the current authenticated user (server-side).
 * @returns The user, or null if not logged in.
 */
export async function getCurrentUserServer() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

// ─────────────────────────────────────────────
// Static / build-time helpers (no cookies required)
// ─────────────────────────────────────────────

/**
 * Fetches all published blog post slugs using a cookieless client.
 * Safe to call at build time in generateStaticParams where cookies()
 * is not available.
 * @returns Array of objects containing the slug of each published post.
 */
export async function fetchPublishedBlogSlugsStatic(): Promise<
  { slug: string }[]
> {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("slug")
    .eq("is_published", true);
  if (error) return [];
  return (data as { slug: string }[]) ?? [];
}
