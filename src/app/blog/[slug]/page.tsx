import { fetchBlogPostBySlugServer, fetchPublishedBlogSlugsStatic, fetchProfileServer } from "@/lib/api-server";
import { markdownToHTML } from "@/data/blog";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

/**
 * Generates static params for all published blog posts.
 * Used by Next.js for static generation of blog post pages.
 * @returns Array of slug params for each published post.
 */
export async function generateStaticParams() {
  const slugs = await fetchPublishedBlogSlugsStatic();
  return slugs.map((row) => ({ slug: row.slug }));
}

/**
 * Generates metadata for a specific blog post page (SEO).
 * @param params - The route params containing the slug.
 * @returns Metadata object for the page, or undefined if post not found.
 */
export async function generateMetadata({
  params,
}: {
  params: {
    slug: string;
  };
}): Promise<Metadata | undefined> {
  const post = await fetchBlogPostBySlugServer(params.slug);
  if (!post) return undefined;

  const profile = await fetchProfileServer();
  const siteUrl = profile?.url || "https://kalelodukuray.com";

  const ogImage = post.image_url
    ? `${siteUrl}${post.image_url}`
    : `${siteUrl}/og?title=${post.title}`;

  return {
    title: post.title,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      type: "article",
      publishedTime: post.published_at,
      url: `${siteUrl}/blog/${post.slug}`,
      images: [{ url: ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.summary,
      images: [ogImage],
    },
  };
}

/**
 * Renders a single blog post page.
 * Fetches the post from Supabase by slug and renders the markdown content.
 * @param params - The route params containing the slug.
 */
export default async function Blog({
  params,
}: {
  params: {
    slug: string;
  };
}) {
  const post = await fetchBlogPostBySlugServer(params.slug);

  if (!post) {
    notFound();
  }

  const profile = await fetchProfileServer();
  const siteUrl = profile?.url || "https://kalelodukuray.com";
  const authorName = profile?.name || "Kalelo Dukuray";

  // Convert markdown content to HTML
  const htmlContent = await markdownToHTML(post.content);

  return (
    <section id="blog" className="max-w-5xl mx-auto px-6 py-12 sm:py-24">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            datePublished: post.published_at,
            dateModified: post.updated_at,
            description: post.summary,
            image: post.image_url
              ? `${siteUrl}${post.image_url}`
              : `${siteUrl}/og?title=${post.title}`,
            url: `${siteUrl}/blog/${post.slug}`,
            author: {
              "@type": "Person",
              name: authorName,
            },
          }),
        }}
      />
      <h1 className="title font-medium text-2xl tracking-tighter max-w-[650px]">
        {post.title}
      </h1>
      <div className="flex justify-between items-center mt-2 mb-8 text-sm max-w-[650px]">
        <Suspense fallback={<p className="h-5" />}>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {formatDate(post.published_at)}
          </p>
        </Suspense>
      </div>
      <article
        className="prose dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      ></article>
    </section>
  );
}
