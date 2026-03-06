import { createClient } from "@/lib/supabase/client";
import type {
  Profile,
  ProfileInput,
  SocialLink,
  SocialLinkInput,
  WorkExperience,
  WorkExperienceInput,
  Education,
  EducationInput,
  Skill,
  SkillInput,
  Project,
  ProjectInput,
  ProjectLink,
  ProjectLinkInput,
  ProjectWithLinks,
  Hackathon,
  HackathonInput,
  HackathonLink,
  HackathonLinkInput,
  HackathonWithLinks,
  BlogPost,
  BlogPostInput,
} from "@/lib/types";

// ─────────────────────────────────────────────
// Auth helpers
// ─────────────────────────────────────────────

/**
 * Signs in a user with email and password.
 * @param email - The user's email address.
 * @param password - The user's password.
 * @returns The Supabase auth response data.
 */
export async function signIn(email: string, password: string) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw new Error(error.message);
  return data;
}

/**
 * Signs up a new user with email and password.
 * @param email - The user's email address.
 * @param password - The user's chosen password.
 * @returns The Supabase auth response data.
 */
export async function signUp(email: string, password: string) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) throw new Error(error.message);
  return data;
}

/**
 * Signs out the current user.
 */
export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

/**
 * Gets the currently logged-in user.
 * @returns The current user object, or null if not logged in.
 */
export async function getCurrentUser() {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) throw new Error(error.message);
  return user;
}

/**
 * Sends a password reset email to the given address.
 * The email will contain a link that redirects to the provided redirectTo URL
 * with a one-time code that can be exchanged for a session.
 * @param email - The user's email address.
 * @param redirectTo - The URL to redirect to after the user clicks the link (should point to /auth/callback?next=/reset-password).
 */
export async function resetPasswordForEmail(
  email: string,
  redirectTo: string
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });
  if (error) throw new Error(error.message);
}

/**
 * Updates the currently authenticated user's password.
 * Must be called while the user has an active recovery session
 * (i.e. after clicking the password reset link from their email).
 * @param newPassword - The new password to set.
 */
export async function updatePassword(newPassword: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw new Error(error.message);
}

// ─────────────────────────────────────────────
// Profile
// ─────────────────────────────────────────────

/**
 * Fetches the first profile from the profiles table.
 * Since this is a personal site, there is only one profile.
 * @returns The profile data.
 */
export async function fetchProfile(): Promise<Profile | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .limit(1)
    .single();
  if (error) {
    if (error.code === "PGRST116") return null; // No rows
    throw new Error(error.message);
  }
  return data as Profile;
}

/**
 * Updates the user's profile.
 * @param id - The profile ID to update.
 * @param input - The fields to update.
 * @returns The updated profile.
 */
export async function updateProfile(
  id: string,
  input: Partial<ProfileInput>
): Promise<Profile> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Profile;
}

// ─────────────────────────────────────────────
// Social Links
// ─────────────────────────────────────────────

/**
 * Fetches all social links for a profile, ordered by display_order.
 * @param profileId - The profile ID.
 * @returns Array of social links.
 */
export async function fetchSocialLinks(
  profileId: string
): Promise<SocialLink[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("social_links")
    .select("*")
    .eq("profile_id", profileId)
    .order("display_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data as SocialLink[];
}

/**
 * Creates a new social link.
 * @param profileId - The profile ID to associate with.
 * @param input - The social link data.
 * @returns The newly created social link.
 */
export async function createSocialLink(
  profileId: string,
  input: SocialLinkInput
): Promise<SocialLink> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("social_links")
    .insert({ ...input, profile_id: profileId })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as SocialLink;
}

/**
 * Updates an existing social link.
 * @param id - The social link ID.
 * @param input - The fields to update.
 * @returns The updated social link.
 */
export async function updateSocialLink(
  id: string,
  input: Partial<SocialLinkInput>
): Promise<SocialLink> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("social_links")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as SocialLink;
}

/**
 * Deletes a social link.
 * @param id - The social link ID to delete.
 */
export async function deleteSocialLink(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("social_links").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ─────────────────────────────────────────────
// Work Experience
// ─────────────────────────────────────────────

/**
 * Fetches all work experience entries, ordered by display_order.
 * @param profileId - The profile ID.
 * @returns Array of work experience entries.
 */
export async function fetchWorkExperience(
  profileId: string
): Promise<WorkExperience[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("work_experience")
    .select("*")
    .eq("profile_id", profileId)
    .order("display_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data as WorkExperience[];
}

/**
 * Creates a new work experience entry.
 * @param profileId - The profile ID.
 * @param input - The work experience data.
 * @returns The newly created work experience.
 */
export async function createWorkExperience(
  profileId: string,
  input: WorkExperienceInput
): Promise<WorkExperience> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("work_experience")
    .insert({ ...input, profile_id: profileId })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as WorkExperience;
}

/**
 * Updates a work experience entry.
 * @param id - The work experience ID.
 * @param input - The fields to update.
 * @returns The updated work experience.
 */
export async function updateWorkExperience(
  id: string,
  input: Partial<WorkExperienceInput>
): Promise<WorkExperience> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("work_experience")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as WorkExperience;
}

/**
 * Deletes a work experience entry.
 * @param id - The work experience ID to delete.
 */
export async function deleteWorkExperience(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("work_experience")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
}

// ─────────────────────────────────────────────
// Education
// ─────────────────────────────────────────────

/**
 * Fetches all education entries, ordered by display_order.
 * @param profileId - The profile ID.
 * @returns Array of education entries.
 */
export async function fetchEducation(
  profileId: string
): Promise<Education[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("education")
    .select("*")
    .eq("profile_id", profileId)
    .order("display_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data as Education[];
}

/**
 * Creates a new education entry.
 * @param profileId - The profile ID.
 * @param input - The education data.
 * @returns The newly created education entry.
 */
export async function createEducation(
  profileId: string,
  input: EducationInput
): Promise<Education> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("education")
    .insert({ ...input, profile_id: profileId })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Education;
}

/**
 * Updates an education entry.
 * @param id - The education ID.
 * @param input - The fields to update.
 * @returns The updated education entry.
 */
export async function updateEducation(
  id: string,
  input: Partial<EducationInput>
): Promise<Education> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("education")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Education;
}

/**
 * Deletes an education entry.
 * @param id - The education ID to delete.
 */
export async function deleteEducation(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("education").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ─────────────────────────────────────────────
// Skills
// ─────────────────────────────────────────────

/**
 * Fetches all skills for a profile, ordered by display_order.
 * @param profileId - The profile ID.
 * @returns Array of skills.
 */
export async function fetchSkills(profileId: string): Promise<Skill[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("skills")
    .select("*")
    .eq("profile_id", profileId)
    .order("display_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data as Skill[];
}

/**
 * Creates a new skill.
 * @param profileId - The profile ID.
 * @param input - The skill data.
 * @returns The newly created skill.
 */
export async function createSkill(
  profileId: string,
  input: SkillInput
): Promise<Skill> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("skills")
    .insert({ ...input, profile_id: profileId })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Skill;
}

/**
 * Updates a skill.
 * @param id - The skill ID.
 * @param input - The fields to update.
 * @returns The updated skill.
 */
export async function updateSkill(
  id: string,
  input: Partial<SkillInput>
): Promise<Skill> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("skills")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Skill;
}

/**
 * Deletes a skill.
 * @param id - The skill ID to delete.
 */
export async function deleteSkill(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("skills").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ─────────────────────────────────────────────
// Projects
// ─────────────────────────────────────────────

/**
 * Fetches all projects with their associated links, ordered by display_order.
 * @param profileId - The profile ID.
 * @returns Array of projects with links.
 */
export async function fetchProjects(
  profileId: string
): Promise<ProjectWithLinks[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*, project_links(*)")
    .eq("profile_id", profileId)
    .order("display_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data as ProjectWithLinks[];
}

/**
 * Creates a new project.
 * @param profileId - The profile ID.
 * @param input - The project data.
 * @returns The newly created project.
 */
export async function createProject(
  profileId: string,
  input: ProjectInput
): Promise<Project> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("projects")
    .insert({ ...input, profile_id: profileId })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Project;
}

/**
 * Updates a project.
 * @param id - The project ID.
 * @param input - The fields to update.
 * @returns The updated project.
 */
export async function updateProject(
  id: string,
  input: Partial<ProjectInput>
): Promise<Project> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("projects")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Project;
}

/**
 * Deletes a project and its associated links (cascade).
 * @param id - The project ID to delete.
 */
export async function deleteProject(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ─────────────────────────────────────────────
// Project Links
// ─────────────────────────────────────────────

/**
 * Creates a new project link.
 * @param projectId - The project ID.
 * @param input - The project link data.
 * @returns The newly created project link.
 */
export async function createProjectLink(
  projectId: string,
  input: ProjectLinkInput
): Promise<ProjectLink> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("project_links")
    .insert({ ...input, project_id: projectId })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as ProjectLink;
}

/**
 * Updates a project link.
 * @param id - The project link ID.
 * @param input - The fields to update.
 * @returns The updated project link.
 */
export async function updateProjectLink(
  id: string,
  input: Partial<ProjectLinkInput>
): Promise<ProjectLink> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("project_links")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as ProjectLink;
}

/**
 * Deletes a project link.
 * @param id - The project link ID to delete.
 */
export async function deleteProjectLink(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("project_links")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
}

// ─────────────────────────────────────────────
// Hackathons
// ─────────────────────────────────────────────

/**
 * Fetches all hackathons with their associated links, ordered by display_order.
 * @param profileId - The profile ID.
 * @returns Array of hackathons with links.
 */
export async function fetchHackathons(
  profileId: string
): Promise<HackathonWithLinks[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("hackathons")
    .select("*, hackathon_links(*)")
    .eq("profile_id", profileId)
    .order("display_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data as HackathonWithLinks[];
}

/**
 * Creates a new hackathon.
 * @param profileId - The profile ID.
 * @param input - The hackathon data.
 * @returns The newly created hackathon.
 */
export async function createHackathon(
  profileId: string,
  input: HackathonInput
): Promise<Hackathon> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("hackathons")
    .insert({ ...input, profile_id: profileId })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Hackathon;
}

/**
 * Updates a hackathon.
 * @param id - The hackathon ID.
 * @param input - The fields to update.
 * @returns The updated hackathon.
 */
export async function updateHackathon(
  id: string,
  input: Partial<HackathonInput>
): Promise<Hackathon> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("hackathons")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Hackathon;
}

/**
 * Deletes a hackathon and its associated links (cascade).
 * @param id - The hackathon ID to delete.
 */
export async function deleteHackathon(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("hackathons").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ─────────────────────────────────────────────
// Hackathon Links
// ─────────────────────────────────────────────

/**
 * Creates a new hackathon link.
 * @param hackathonId - The hackathon ID.
 * @param input - The hackathon link data.
 * @returns The newly created hackathon link.
 */
export async function createHackathonLink(
  hackathonId: string,
  input: HackathonLinkInput
): Promise<HackathonLink> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("hackathon_links")
    .insert({ ...input, hackathon_id: hackathonId })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as HackathonLink;
}

/**
 * Deletes a hackathon link.
 * @param id - The hackathon link ID to delete.
 */
export async function deleteHackathonLink(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("hackathon_links")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
}

// ─────────────────────────────────────────────
// Blog Posts
// ─────────────────────────────────────────────

/**
 * Fetches published blog posts, ordered by published_at descending.
 * Used on the public blog listing page.
 * @returns Array of published blog posts.
 */
export async function fetchPublishedBlogPosts(): Promise<BlogPost[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("is_published", true)
    .order("published_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data as BlogPost[];
}

/**
 * Fetches all blog posts (published and drafts) for the dashboard.
 * @param profileId - The profile ID.
 * @param page - The page number (1-indexed).
 * @param pageSize - Number of posts per page.
 * @returns An object with posts and total count for pagination.
 */
export async function fetchAllBlogPosts(
  profileId: string,
  page: number = 1,
  pageSize: number = 10
): Promise<{ posts: BlogPost[]; count: number }> {
  const supabase = createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("blog_posts")
    .select("*", { count: "exact" })
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
    .range(from, to);
  if (error) throw new Error(error.message);
  return { posts: data as BlogPost[], count: count ?? 0 };
}

/**
 * Fetches a single blog post by slug.
 * @param slug - The blog post slug.
 * @returns The blog post, or null if not found.
 */
export async function fetchBlogPost(slug: string): Promise<BlogPost | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .single();
  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(error.message);
  }
  return data as BlogPost;
}

/**
 * Fetches a single blog post by ID.
 * @param id - The blog post ID.
 * @returns The blog post, or null if not found.
 */
export async function fetchBlogPostById(id: string): Promise<BlogPost | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("id", id)
    .single();
  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(error.message);
  }
  return data as BlogPost;
}

/**
 * Creates a new blog post.
 * @param profileId - The profile ID.
 * @param input - The blog post data.
 * @returns The newly created blog post.
 */
export async function createBlogPost(
  profileId: string,
  input: BlogPostInput
): Promise<BlogPost> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .insert({ ...input, profile_id: profileId })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as BlogPost;
}

/**
 * Updates a blog post.
 * @param id - The blog post ID.
 * @param input - The fields to update.
 * @returns The updated blog post.
 */
export async function updateBlogPost(
  id: string,
  input: Partial<BlogPostInput>
): Promise<BlogPost> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as BlogPost;
}

/**
 * Deletes a blog post.
 * @param id - The blog post ID to delete.
 */
export async function deleteBlogPost(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("blog_posts").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ─────────────────────────────────────────────
// Media / Storage
// ─────────────────────────────────────────────

/**
 * Uploads a file to Supabase storage in the "media" bucket.
 * @param file - The File to upload.
 * @param folder - Optional subfolder within the bucket (e.g. "blog", "avatars").
 * @returns The public URL of the uploaded file.
 */
export async function uploadMedia(
  file: File,
  folder: string = ""
): Promise<string> {
  const supabase = createClient();
  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filePath = folder
    ? `${folder}/${timestamp}_${sanitizedName}`
    : `${timestamp}_${sanitizedName}`;

  const { error } = await supabase.storage
    .from("media")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });
  if (error) throw new Error(error.message);

  const {
    data: { publicUrl },
  } = supabase.storage.from("media").getPublicUrl(filePath);

  return publicUrl;
}
