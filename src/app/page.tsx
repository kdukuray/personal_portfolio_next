import { HackathonCard } from "@/components/hackathon-card";
import BlurFade from "@/components/magicui/blur-fade";
import BlurFadeText from "@/components/magicui/blur-fade-text";
import { ProjectCard } from "@/components/project-card";
import { ResumeCard } from "@/components/resume-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Markdown from "react-markdown";
import { DATA } from "@/data/resume";
import {
  fetchProfileServer,
  fetchSocialLinksServer,
  fetchWorkExperienceServer,
  fetchEducationServer,
  fetchSkillsServer,
  fetchProjectsServer,
  fetchHackathonsServer,
} from "@/lib/api-server";
import { getIconByKey } from "@/lib/icon-map";

const BLUR_FADE_DELAY = 0.04;

/**
 * Homepage that displays all portfolio sections.
 * Fetches data from Supabase on the server; falls back to hardcoded DATA.
 */
export default async function Page() {
  // Attempt to fetch from Supabase; fall back to hardcoded data
  const profile = await fetchProfileServer();
  const useDb = !!profile;

  const socialLinks = useDb ? await fetchSocialLinksServer(profile!.id) : [];
  // Inactive jobs are hidden from visitors (is_active !== false also keeps
  // rows visible if the column hasn't been added to the database yet).
  const workItems = useDb
    ? (await fetchWorkExperienceServer(profile!.id)).filter(
        (w) => w.is_active !== false
      )
    : [];
  const educationItems = useDb ? await fetchEducationServer(profile!.id) : [];
  const skillItems = useDb ? await fetchSkillsServer(profile!.id) : [];
  const projectItems = useDb ? await fetchProjectsServer(profile!.id) : [];
  const hackathonItems = useDb ? await fetchHackathonsServer(profile!.id) : [];

  // Resolved data (DB or fallback)
  const name = useDb ? profile!.name : DATA.name;
  const initials = useDb ? profile!.initials : DATA.initials;
  const description = useDb ? profile!.description : DATA.description;
  const summaryText = useDb ? profile!.summary : DATA.summary;
  const avatarUrl = useDb ? profile!.avatar_url : DATA.avatarUrl;
  const skills = useDb ? skillItems.map((s) => s.name) : DATA.skills;

  // Contact info for the contact section
  const xLink = useDb
    ? socialLinks.find((l) => l.icon_key === "x")
    : null;
  const contactUrl = xLink?.url || DATA.contact.social.X.url;

  return (
    <main className="flex flex-col min-h-[100dvh] space-y-10 max-w-5xl mx-auto px-6 py-12 sm:py-24">
      <section id="hero">
        <div className="mx-auto w-full space-y-8">
          <div className="gap-2 flex justify-between">
            <div className="flex-col flex flex-1 space-y-1.5">
              <BlurFadeText
                delay={BLUR_FADE_DELAY}
                className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none"
                yOffset={8}
                text={`Hi, I'm ${name.split(" ")[0]} 👋`}
              />
              <BlurFadeText
                className="max-w-[600px] md:text-xl"
                delay={BLUR_FADE_DELAY}
                text={description}
              />
            </div>
            <BlurFade delay={BLUR_FADE_DELAY}>
              <Avatar className="size-28 border">
                <AvatarImage alt={name} src={avatarUrl} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </BlurFade>
          </div>
        </div>
      </section>

      <section id="about">
        <BlurFade delay={BLUR_FADE_DELAY * 3}>
          <h2 className="text-xl font-bold">About</h2>
        </BlurFade>
        <BlurFade delay={BLUR_FADE_DELAY * 4}>
          <Markdown className="prose max-w-full text-pretty font-sans text-sm text-muted-foreground dark:prose-invert">
            {summaryText}
          </Markdown>
        </BlurFade>
      </section>

      <section id="work">
        <div className="flex min-h-0 flex-col gap-y-3">
          <BlurFade delay={BLUR_FADE_DELAY * 5}>
            <h2 className="text-xl font-bold">Work Experience</h2>
          </BlurFade>
          {useDb
            ? workItems.map((work, id) => (
                <BlurFade key={work.id} delay={BLUR_FADE_DELAY * 6 + id * 0.05}>
                  <ResumeCard
                    logoUrl={work.logo_url}
                    altText={work.company}
                    title={work.company}
                    subtitle={work.title}
                    href={work.href}
                    badges={work.badges || []}
                    period={`${work.start_date} - ${work.end_date || "Present"}`}
                    description={work.description}
                  />
                </BlurFade>
              ))
            : DATA.work.map((work, id) => (
                <BlurFade key={work.company} delay={BLUR_FADE_DELAY * 6 + id * 0.05}>
                  <ResumeCard
                    logoUrl={work.logoUrl}
                    altText={work.company}
                    title={work.company}
                    subtitle={work.title}
                    href={work.href}
                    badges={work.badges}
                    period={`${work.start} - ${work.end ?? "Present"}`}
                    description={work.description}
                  />
                </BlurFade>
              ))}
        </div>
      </section>

      <section id="education">
        <div className="flex min-h-0 flex-col gap-y-3">
          <BlurFade delay={BLUR_FADE_DELAY * 7}>
            <h2 className="text-xl font-bold">Education</h2>
          </BlurFade>
          {useDb
            ? educationItems.map((edu, id) => (
                <BlurFade key={edu.id} delay={BLUR_FADE_DELAY * 8 + id * 0.05}>
                  <ResumeCard
                    href={edu.href}
                    logoUrl={edu.logo_url}
                    altText={edu.school}
                    title={edu.school}
                    subtitle={edu.degree}
                    period={`${edu.start_date} - ${edu.end_date}`}
                  />
                </BlurFade>
              ))
            : DATA.education.map((edu, id) => (
                <BlurFade key={edu.school} delay={BLUR_FADE_DELAY * 8 + id * 0.05}>
                  <ResumeCard
                    href={edu.href}
                    logoUrl={edu.logoUrl}
                    altText={edu.school}
                    title={edu.school}
                    subtitle={edu.degree}
                    period={`${edu.start} - ${edu.end}`}
                  />
                </BlurFade>
              ))}
        </div>
      </section>

      <section id="skills">
        <div className="flex min-h-0 flex-col gap-y-3">
          <BlurFade delay={BLUR_FADE_DELAY * 9}>
            <h2 className="text-xl font-bold">Skills</h2>
          </BlurFade>
          <div className="flex flex-wrap gap-1">
            {skills.map((skill, id) => (
              <BlurFade key={skill} delay={BLUR_FADE_DELAY * 10 + id * 0.05}>
                <Badge key={skill}>{skill}</Badge>
              </BlurFade>
            ))}
          </div>
        </div>
      </section>

      <section id="projects">
        <div className="space-y-12 w-full py-12">
          <BlurFade delay={BLUR_FADE_DELAY * 11}>
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-foreground text-background px-3 py-1 text-sm">
                  My Projects
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Check out my latest work
                </h2>
                <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  I&apos;ve worked on a variety of projects, from simple
                  websites to complex web applications. Here are a few of my
                  favorites.
                </p>
              </div>
            </div>
          </BlurFade>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 mx-auto">
            {useDb
              ? projectItems.map((project, id) => (
                  <BlurFade key={project.id} delay={BLUR_FADE_DELAY * 12 + id * 0.05}>
                    <ProjectCard
                      href={project.href}
                      title={project.title}
                      description={project.description}
                      dates={project.dates}
                      tags={project.technologies || []}
                      image={project.image_url}
                      video={project.video_url}
                      links={
                        project.project_links?.map((l) => ({
                          type: l.type,
                          href: l.href,
                          icon: getIconByKey(l.icon_key, "size-3"),
                        })) || []
                      }
                    />
                  </BlurFade>
                ))
              : DATA.projects.map((project, id) => (
                  <BlurFade key={project.title} delay={BLUR_FADE_DELAY * 12 + id * 0.05}>
                    <ProjectCard
                      href={project.href}
                      title={project.title}
                      description={project.description}
                      dates={project.dates}
                      tags={project.technologies}
                      image={project.image}
                      video={project.video}
                      links={project.links}
                    />
                  </BlurFade>
                ))}
          </div>
        </div>
      </section>

      <section id="hackathons">
        <div className="space-y-12 w-full py-12">
          <BlurFade delay={BLUR_FADE_DELAY * 13}>
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-foreground text-background px-3 py-1 text-sm">
                  Hackathons
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  I like building things
                </h2>
                <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  During my time in university, I attended hackathons. People
                  from around the country would come together and build
                  incredible things in 2-3 days. It was eye-opening to see the
                  endless possibilities brought to life by a group of motivated
                  and passionate individuals.
                </p>
              </div>
            </div>
          </BlurFade>
          <BlurFade delay={BLUR_FADE_DELAY * 14}>
            <ul className="mb-4 ml-4 divide-y divide-dashed border-l">
              {useDb
                ? hackathonItems.map((hackathon, id) => (
                    <BlurFade
                      key={hackathon.id}
                      delay={BLUR_FADE_DELAY * 15 + id * 0.05}
                    >
                      <HackathonCard
                        title={hackathon.title}
                        description={hackathon.description}
                        location={hackathon.location}
                        dates={hackathon.dates}
                        image={hackathon.image_url}
                        links={
                          hackathon.hackathon_links?.map((l) => ({
                            title: l.title,
                            href: l.href,
                            icon: getIconByKey(l.icon_key, "h-4 w-4"),
                          })) || []
                        }
                      />
                    </BlurFade>
                  ))
                : DATA.hackathons.map((project, id) => (
                    <BlurFade
                      key={project.title + project.dates}
                      delay={BLUR_FADE_DELAY * 15 + id * 0.05}
                    >
                      <HackathonCard
                        title={project.title}
                        description={project.description}
                        location={project.location}
                        dates={project.dates}
                        image={project.image}
                        links={project.links}
                      />
                    </BlurFade>
                  ))}
            </ul>
          </BlurFade>
        </div>
      </section>

      <section id="contact">
        <div className="grid items-center justify-center gap-4 px-4 text-center md:px-6 w-full py-12">
          <BlurFade delay={BLUR_FADE_DELAY * 16}>
            <div className="space-y-3">
              <div className="inline-block rounded-lg bg-foreground text-background px-3 py-1 text-sm">
                Contact
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                Get in Touch
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Want to chat? Just shoot me a dm{" "}
                <Link
                  href={contactUrl}
                  className="text-blue-500 hover:underline"
                >
                  with a direct question on twitter
                </Link>{" "}
                and I&apos;ll respond whenever I can. I will ignore all
                soliciting.
              </p>
            </div>
          </BlurFade>
        </div>
      </section>
    </main>
  );
}
