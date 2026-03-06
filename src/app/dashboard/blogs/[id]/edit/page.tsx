"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import BlogEditor from "@/components/dashboard/blog-editor";
import { fetchBlogPostById } from "@/lib/api";
import type { BlogPost } from "@/lib/types";
import { Loader2 } from "lucide-react";

/**
 * Page for editing an existing blog post.
 * Fetches the post by ID from the URL params and passes it to BlogEditor.
 */
export default function EditBlogPostPage() {
  const params = useParams();
  const id = params.id as string;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    /** Loads the blog post data by ID. */
    async function loadPost() {
      try {
        const data = await fetchBlogPostById(id);
        setPost(data);
      } catch (error) {
        console.error("Failed to load post:", error);
      } finally {
        setLoading(false);
      }
    }
    if (id) loadPost();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="py-10 text-center text-muted-foreground">
        <p>Blog post not found.</p>
      </div>
    );
  }

  return <BlogEditor post={post} />;
}
