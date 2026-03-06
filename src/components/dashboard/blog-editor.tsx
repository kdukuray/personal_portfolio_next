"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  fetchProfile,
  createBlogPost,
  updateBlogPost,
  uploadMedia,
} from "@/lib/api";
import type { BlogPost } from "@/lib/types";
import { Loader2, Upload, ImageIcon, Eye, Edit3 } from "lucide-react";

/**
 * Props for the BlogEditor component.
 * @param post - An existing post to edit, or undefined for creating a new one.
 */
interface BlogEditorProps {
  post?: BlogPost;
}

/**
 * Blog post editor with split-screen markdown editing and live preview.
 * Supports image upload to Supabase storage with markdown link insertion.
 * On smaller screens, uses tab-based switching between Edit and Preview modes.
 * @param post - If provided, the editor is in "edit" mode for an existing post.
 */
export default function BlogEditor({ post }: BlogEditorProps) {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [title, setTitle] = useState(post?.title || "");
  const [slug, setSlug] = useState(post?.slug || "");
  const [summary, setSummary] = useState(post?.summary || "");
  const [content, setContent] = useState(post?.content || "");
  const [imageUrl, setImageUrl] = useState(post?.image_url || "");
  const [isPublished, setIsPublished] = useState(post?.is_published || false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  /**
   * Generates a URL-safe slug from a string.
   * @param text - The text to slugify.
   * @returns A lowercase, hyphenated slug string.
   */
  function slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  }

  /**
   * Updates the title and auto-generates a slug.
   * @param newTitle - The new title value.
   */
  function handleTitleChange(newTitle: string) {
    setTitle(newTitle);
    if (!post) {
      setSlug(slugify(newTitle));
    }
  }

  /**
   * Uploads an image to Supabase storage and inserts the markdown
   * image syntax at the current cursor position in the textarea.
   * @param e - The file input change event.
   */
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadMedia(file, "blog");
      const markdownImage = `![${file.name}](${url})`;

      if (textareaRef.current) {
        const textarea = textareaRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newContent =
          content.substring(0, start) + markdownImage + content.substring(end);
        setContent(newContent);
        // Move cursor after the inserted text
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd =
            start + markdownImage.length;
          textarea.focus();
        }, 0);
      } else {
        setContent(content + "\n" + markdownImage);
      }
    } catch (error) {
      console.error("Failed to upload image:", error);
    } finally {
      setUploading(false);
    }
  }

  /**
   * Uploads a cover image for the blog post.
   * @param e - The file input change event.
   */
  async function handleCoverImageUpload(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadMedia(file, "blog");
      setImageUrl(url);
    } catch (error) {
      console.error("Failed to upload cover image:", error);
    } finally {
      setUploading(false);
    }
  }

  /**
   * Saves the blog post as a draft or published post.
   * @param publish - Whether to publish the post.
   */
  const handleSave = useCallback(
    async (publish: boolean) => {
      setSaving(true);
      try {
        const profile = await fetchProfile();
        if (!profile) throw new Error("No profile found");

        const input = {
          title,
          slug,
          summary,
          content,
          image_url: imageUrl,
          is_published: publish,
          published_at: publish
            ? post?.published_at || new Date().toISOString()
            : post?.published_at || "",
        };

        if (post) {
          await updateBlogPost(post.id, input);
        } else {
          await createBlogPost(profile.id, input);
        }

        router.push("/dashboard/blogs");
        router.refresh();
      } catch (error) {
        console.error("Failed to save post:", error);
      } finally {
        setSaving(false);
      }
    },
    [title, slug, summary, content, imageUrl, post, router]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* Top bar: metadata fields */}
      <div className="space-y-4 rounded-lg border bg-card p-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Post title"
            />
          </div>
          <div className="space-y-2">
            <Label>Slug</Label>
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="post-slug"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Summary</Label>
          <Textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Brief description of the post"
            rows={2}
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <Label htmlFor="cover-upload" className="cursor-pointer">
              <Button variant="outline" size="sm" asChild disabled={uploading}>
                <span>
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Cover Image
                </span>
              </Button>
            </Label>
            <input
              id="cover-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverImageUpload}
            />
          </div>
          {imageUrl && (
            <span className="text-xs text-muted-foreground truncate max-w-[200px]">
              {imageUrl.split("/").pop()}
            </span>
          )}
        </div>
      </div>

      {/* Editor/Preview split - Desktop: side-by-side, Mobile: tabs */}
      <div className="hidden lg:grid lg:grid-cols-2 lg:gap-4">
        {/* Editor Panel */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Edit3 className="h-4 w-4" />
              Editor
            </Label>
            <div>
              <Label htmlFor="inline-upload" className="cursor-pointer">
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  disabled={uploading}
                >
                  <span>
                    {uploading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="mr-2 h-4 w-4" />
                    )}
                    Insert Image
                  </span>
                </Button>
              </Label>
              <input
                id="inline-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>
          </div>
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your blog post in markdown..."
            className="min-h-[500px] resize-y font-mono text-sm"
          />
        </div>

        {/* Preview Panel */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </Label>
          <div className="min-h-[500px] overflow-y-auto rounded-md border bg-background p-4">
            <article className="prose dark:prose-invert max-w-none">
              {content ? (
                <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
              ) : (
                <p className="text-muted-foreground">
                  Start writing to see the preview...
                </p>
              )}
            </article>
          </div>
        </div>
      </div>

      {/* Mobile: Tab-based editor/preview */}
      <div className="lg:hidden">
        <Tabs defaultValue="edit">
          <TabsList className="w-full">
            <TabsTrigger value="edit" className="flex-1">
              <Edit3 className="mr-2 h-4 w-4" />
              Edit
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex-1">
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </TabsTrigger>
          </TabsList>
          <TabsContent value="edit" className="space-y-2">
            <div className="flex justify-end">
              <Label htmlFor="mobile-upload" className="cursor-pointer">
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  disabled={uploading}
                >
                  <span>
                    {uploading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="mr-2 h-4 w-4" />
                    )}
                    Insert Image
                  </span>
                </Button>
              </Label>
              <input
                id="mobile-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>
            <Textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your blog post in markdown..."
              className="min-h-[400px] resize-y font-mono text-sm"
            />
          </TabsContent>
          <TabsContent value="preview">
            <div className="min-h-[400px] overflow-y-auto rounded-md border bg-background p-4">
              <article className="prose dark:prose-invert max-w-none">
                {content ? (
                  <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
                ) : (
                  <p className="text-muted-foreground">
                    Start writing to see the preview...
                  </p>
                )}
              </article>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3 border-t pt-4">
        <Button variant="outline" onClick={() => router.push("/dashboard/blogs")}>
          Cancel
        </Button>
        <Button
          variant="secondary"
          onClick={() => handleSave(false)}
          disabled={saving}
        >
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save as Draft
        </Button>
        <Button onClick={() => handleSave(true)} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {post?.is_published ? "Update" : "Publish"}
        </Button>
      </div>
    </motion.div>
  );
}
