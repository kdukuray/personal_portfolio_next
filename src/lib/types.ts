/** Represents the user's profile / personal information. */
export interface Profile {
  id: string;
  name: string;
  initials: string;
  url: string;
  location: string;
  location_link: string;
  description: string;
  summary: string;
  avatar_url: string;
  email: string;
  phone: string;
  created_at: string;
  updated_at: string;
}

/** Represents a social media or contact link. */
export interface SocialLink {
  id: string;
  profile_id: string;
  name: string;
  url: string;
  icon_key: string;
  show_in_navbar: boolean;
  display_order: number;
}

/** Represents a work experience entry. */
export interface WorkExperience {
  id: string;
  profile_id: string;
  company: string;
  href: string;
  location: string;
  title: string;
  logo_url: string;
  start_date: string;
  end_date: string;
  description: string;
  badges: string[];
  display_order: number;
}

/** Represents an education entry. */
export interface Education {
  id: string;
  profile_id: string;
  school: string;
  href: string;
  degree: string;
  logo_url: string;
  start_date: string;
  end_date: string;
  display_order: number;
}

/** Represents a single skill. */
export interface Skill {
  id: string;
  profile_id: string;
  name: string;
  display_order: number;
}

/** Represents a project entry. */
export interface Project {
  id: string;
  profile_id: string;
  title: string;
  href: string;
  dates: string;
  description: string;
  image_url: string;
  video_url: string;
  active: boolean;
  technologies: string[];
  display_order: number;
}

/** Represents a link associated with a project. */
export interface ProjectLink {
  id: string;
  project_id: string;
  type: string;
  href: string;
  icon_key: string;
}

/** Represents a hackathon entry. */
export interface Hackathon {
  id: string;
  profile_id: string;
  title: string;
  dates: string;
  location: string;
  description: string;
  image_url: string;
  mlh_link: string;
  display_order: number;
}

/** Represents a link associated with a hackathon. */
export interface HackathonLink {
  id: string;
  hackathon_id: string;
  title: string;
  href: string;
  icon_key: string;
}

/** Represents a blog post. */
export interface BlogPost {
  id: string;
  profile_id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  image_url: string;
  published_at: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

/** Convenience type for project with its links. */
export interface ProjectWithLinks extends Project {
  project_links: ProjectLink[];
}

/** Convenience type for hackathon with its links. */
export interface HackathonWithLinks extends Hackathon {
  hackathon_links: HackathonLink[];
}

/** Input type for creating/updating a profile (omits server-managed fields). */
export type ProfileInput = Omit<Profile, "id" | "created_at" | "updated_at">;

/** Input type for creating/updating work experience. */
export type WorkExperienceInput = Omit<WorkExperience, "id" | "profile_id">;

/** Input type for creating/updating education. */
export type EducationInput = Omit<Education, "id" | "profile_id">;

/** Input type for creating/updating a skill. */
export type SkillInput = Omit<Skill, "id" | "profile_id">;

/** Input type for creating/updating a project. */
export type ProjectInput = Omit<Project, "id" | "profile_id">;

/** Input type for creating/updating a project link. */
export type ProjectLinkInput = Omit<ProjectLink, "id" | "project_id">;

/** Input type for creating/updating a hackathon. */
export type HackathonInput = Omit<Hackathon, "id" | "profile_id">;

/** Input type for creating/updating a hackathon link. */
export type HackathonLinkInput = Omit<HackathonLink, "id" | "hackathon_id">;

/** Input type for creating/updating a blog post. */
export type BlogPostInput = Omit<BlogPost, "id" | "profile_id" | "created_at" | "updated_at">;

/** Input type for creating a social link. */
export type SocialLinkInput = Omit<SocialLink, "id" | "profile_id">;
