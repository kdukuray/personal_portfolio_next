import BlurFade from "@/components/magicui/blur-fade";
import { fetchPublishedBlogPostsServer } from "@/lib/api-server";
import Link from "next/link";

export const metadata = {
  title: "Blog",
  description: "My thoughts on software development, life, and more.",
};

const BLUR_FADE_DELAY = 0.04;

/**
 * Public blog listing page.
 * Fetches published posts from Supabase and displays them in a list.
 */
export default async function BlogPage() {
  const posts = await fetchPublishedBlogPostsServer();

  return (
    <section className="max-w-5xl mx-auto px-6 py-12 sm:py-24">
      <BlurFade delay={BLUR_FADE_DELAY}>
        <h1 className="font-medium text-2xl mb-8 tracking-tighter">blog</h1>
      </BlurFade>
      {posts.length === 0 ? (
        <BlurFade delay={BLUR_FADE_DELAY * 2}>
          <p className="text-muted-foreground">No posts yet. Check back soon!</p>
        </BlurFade>
      ) : (
        posts.map((post, id) => (
          <BlurFade delay={BLUR_FADE_DELAY * 2 + id * 0.05} key={post.slug}>
            <Link
              className="flex flex-col space-y-1 mb-4"
              href={`/blog/${post.slug}`}
            >
              <div className="w-full flex flex-col">
                <p className="tracking-tight">{post.title}</p>
                <p className="h-6 text-xs text-muted-foreground">
                  {post.published_at
                    ? new Date(post.published_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : ""}
                </p>
              </div>
            </Link>
          </BlurFade>
        ))
      )}
    </section>
  );
}
