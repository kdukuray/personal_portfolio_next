"use client";

import BlogEditor from "@/components/dashboard/blog-editor";

/**
 * Page for creating a new blog post.
 * Uses the shared BlogEditor component without an existing post.
 */
export default function NewBlogPostPage() {
  return <BlogEditor />;
}
