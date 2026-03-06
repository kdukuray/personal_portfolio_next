"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  fetchProfile, fetchProjects, createProject, updateProject,
  deleteProject, createProjectLink, deleteProjectLink, uploadMedia,
} from "@/lib/api";
import { AVAILABLE_ICON_KEYS, getIconByKey } from "@/lib/icon-map";
import type { ProjectWithLinks, ProjectLink } from "@/lib/types";
import { Pencil, Trash2, Plus, Loader2, Upload, FolderKanban, X } from "lucide-react";

/**
 * Dashboard page for managing project entries.
 * Supports full CRUD with nested project links.
 */
export default function ProjectsPage() {
  const [items, setItems] = useState<ProjectWithLinks[]>([]);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ProjectWithLinks | null>(null);
  const [deleting, setDeleting] = useState<ProjectWithLinks | null>(null);
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  // Form fields
  const [title, setTitle] = useState("");
  const [href, setHref] = useState("");
  const [dates, setDates] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [active, setActive] = useState(true);
  const [technologies, setTechnologies] = useState("");
  const [displayOrder, setDisplayOrder] = useState(0);

  // Links sub-form
  const [links, setLinks] = useState<{ type: string; href: string; icon_key: string }[]>([]);

  /** Loads projects data from the database. */
  const loadData = useCallback(async () => {
    try {
      const profile = await fetchProfile();
      if (profile) {
        setProfileId(profile.id);
        const data = await fetchProjects(profile.id);
        setItems(data);
      }
    } catch (error) { console.error("Failed to load projects:", error); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  /** Opens the creation modal with blank fields. */
  function handleNew() {
    setEditing(null);
    setTitle(""); setHref(""); setDates(""); setDescription("");
    setImageUrl(""); setVideoUrl(""); setActive(true);
    setTechnologies(""); setDisplayOrder(items.length);
    setLinks([]);
    setModalOpen(true);
  }

  /** Opens the editing modal with the project's data. */
  function handleEdit(item: ProjectWithLinks) {
    setEditing(item);
    setTitle(item.title); setHref(item.href); setDates(item.dates);
    setDescription(item.description); setImageUrl(item.image_url);
    setVideoUrl(item.video_url); setActive(item.active);
    setTechnologies(item.technologies?.join(", ") || "");
    setDisplayOrder(item.display_order);
    setLinks(item.project_links?.map((l) => ({ type: l.type, href: l.href, icon_key: l.icon_key })) || []);
    setModalOpen(true);
  }

  /** Saves the project (create or update) and manages links. */
  async function handleSave() {
    if (!profileId) return;
    setSaving(true);
    try {
      const input = {
        title, href, dates, description,
        image_url: imageUrl, video_url: videoUrl, active,
        technologies: technologies.split(",").map((t) => t.trim()).filter(Boolean),
        display_order: displayOrder,
      };
      let projectId: string;
      if (editing) {
        await updateProject(editing.id, input);
        projectId = editing.id;
        // Delete existing links and recreate
        for (const link of editing.project_links || []) {
          await deleteProjectLink(link.id);
        }
      } else {
        const created = await createProject(profileId, input);
        projectId = created.id;
      }
      // Create new links
      for (const link of links) {
        await createProjectLink(projectId, link);
      }
      await loadData();
      setModalOpen(false);
    } catch (error) { console.error("Failed to save:", error); }
    finally { setSaving(false); }
  }

  /** Deletes the project after confirmation. */
  async function handleConfirmDelete() {
    if (!deleting) return;
    try { await deleteProject(deleting.id); await loadData(); }
    catch (error) { console.error("Failed to delete:", error); }
    finally { setDeleting(null); }
  }

  /** Uploads a project image. */
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    try { const url = await uploadMedia(file, "projects"); setImageUrl(url); }
    catch (error) { console.error("Failed to upload:", error); }
    finally { setImageUploading(false); }
  }

  /** Adds a new link row to the links sub-form. */
  function addLink() {
    setLinks([...links, { type: "Website", href: "", icon_key: "globe" }]);
  }

  /** Removes a link row from the links sub-form. */
  function removeLink(index: number) {
    setLinks(links.filter((_, i) => i !== index));
  }

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{items.length} {items.length === 1 ? "project" : "projects"}</p>
        <Button onClick={handleNew}><Plus className="mr-2 h-4 w-4" />Add Project</Button>
      </div>

      {items.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center justify-center py-10 text-muted-foreground"><FolderKanban className="mb-2 h-10 w-10" /><p>No projects yet.</p></CardContent></Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((item, index) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
              <Card className="overflow-hidden">
                {item.image_url && (
                  <img src={item.image_url} alt={item.title} className="h-32 w-full object-cover" />
                )}
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.dates}</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {item.technologies?.slice(0, 4).map((t) => (
                          <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                        ))}
                        {(item.technologies?.length || 0) > 4 && (
                          <Badge variant="outline" className="text-xs">+{item.technologies.length - 4}</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleting(item)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader><DialogTitle>{editing ? "Edit Project" : "Add Project"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {imageUrl && <img src={imageUrl} alt="Preview" className="h-16 w-24 rounded object-cover" />}
              <div>
                <Label htmlFor="proj-image-upload" className="cursor-pointer">
                  <Button variant="outline" size="sm" asChild disabled={imageUploading}>
                    <span>{imageUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}Upload Image</span>
                  </Button>
                </Label>
                <input id="proj-image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
              <div className="space-y-2"><Label>Project URL</Label><Input value={href} onChange={(e) => setHref(e.target.value)} /></div>
              <div className="space-y-2"><Label>Dates</Label><Input value={dates} onChange={(e) => setDates(e.target.value)} placeholder="e.g. Oct 2025 - Present" /></div>
              <div className="space-y-2"><Label>Video URL</Label><Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} /></div>
              <div className="flex items-center gap-2 sm:col-span-2"><Switch checked={active} onCheckedChange={setActive} /><Label>Active Project</Label></div>
            </div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} /></div>
            <div className="space-y-2"><Label>Technologies (comma-separated)</Label><Input value={technologies} onChange={(e) => setTechnologies(e.target.value)} placeholder="e.g. Next.js, TypeScript, Supabase" /></div>
            <div className="space-y-2"><Label>Display Order</Label><Input type="number" value={displayOrder} onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)} /></div>

            {/* Links sub-form */}
            <div className="space-y-2">
              <div className="flex items-center justify-between"><Label>Links</Label><Button type="button" variant="outline" size="sm" onClick={addLink}><Plus className="mr-1 h-3 w-3" />Add Link</Button></div>
              {links.map((link, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input className="flex-1" value={link.type} onChange={(e) => { const updated = [...links]; updated[i].type = e.target.value; setLinks(updated); }} placeholder="Type" />
                  <Input className="flex-[2]" value={link.href} onChange={(e) => { const updated = [...links]; updated[i].href = e.target.value; setLinks(updated); }} placeholder="URL" />
                  <Select value={link.icon_key} onValueChange={(val) => { const updated = [...links]; updated[i].icon_key = val; setLinks(updated); }}>
                    <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                    <SelectContent>{AVAILABLE_ICON_KEYS.map((key) => (<SelectItem key={key} value={key}>{key}</SelectItem>))}</SelectContent>
                  </Select>
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeLink(i)}><X className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete &quot;{deleting?.title}&quot;? This will also remove all associated links.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleConfirmDelete}>Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
