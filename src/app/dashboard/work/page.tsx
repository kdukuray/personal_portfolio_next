"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  fetchProfile,
  fetchWorkExperience,
  createWorkExperience,
  updateWorkExperience,
  deleteWorkExperience,
  uploadMedia,
} from "@/lib/api";
import type { WorkExperience } from "@/lib/types";
import { Pencil, Trash2, Plus, Loader2, Upload, Briefcase } from "lucide-react";

/**
 * Dashboard page for managing work experience entries.
 * Supports creating, editing, and deleting work entries with modal forms.
 */
export default function WorkExperiencePage() {
  const [items, setItems] = useState<WorkExperience[]>([]);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<WorkExperience | null>(null);
  const [deleting, setDeleting] = useState<WorkExperience | null>(null);
  const [saving, setSaving] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);

  // Form fields
  const [company, setCompany] = useState("");
  const [title, setTitle] = useState("");
  const [locationField, setLocationField] = useState("");
  const [href, setHref] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [descriptionField, setDescriptionField] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [badges, setBadges] = useState("");
  const [displayOrder, setDisplayOrder] = useState(0);

  /** Loads work experience data from the database. */
  const loadData = useCallback(async () => {
    try {
      const profile = await fetchProfile();
      if (profile) {
        setProfileId(profile.id);
        const data = await fetchWorkExperience(profile.id);
        setItems(data);
      }
    } catch (error) {
      console.error("Failed to load work experience:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /** Resets the form fields and opens the creation modal. */
  function handleNew() {
    setEditing(null);
    setCompany("");
    setTitle("");
    setLocationField("");
    setHref("");
    setStartDate("");
    setEndDate("");
    setDescriptionField("");
    setLogoUrl("");
    setBadges("");
    setDisplayOrder(items.length);
    setModalOpen(true);
  }

  /**
   * Pre-fills the form and opens the editing modal.
   * @param item - The work experience entry to edit.
   */
  function handleEdit(item: WorkExperience) {
    setEditing(item);
    setCompany(item.company);
    setTitle(item.title);
    setLocationField(item.location);
    setHref(item.href);
    setStartDate(item.start_date);
    setEndDate(item.end_date);
    setDescriptionField(item.description);
    setLogoUrl(item.logo_url);
    setBadges(item.badges?.join(", ") || "");
    setDisplayOrder(item.display_order);
    setModalOpen(true);
  }

  /** Saves the work experience entry (create or update). */
  async function handleSave() {
    if (!profileId) return;
    setSaving(true);
    try {
      const input = {
        company,
        title,
        location: locationField,
        href,
        start_date: startDate,
        end_date: endDate,
        description: descriptionField,
        logo_url: logoUrl,
        badges: badges
          .split(",")
          .map((b) => b.trim())
          .filter(Boolean),
        display_order: displayOrder,
      };
      if (editing) {
        await updateWorkExperience(editing.id, input);
      } else {
        await createWorkExperience(profileId, input);
      }
      await loadData();
      setModalOpen(false);
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setSaving(false);
    }
  }

  /** Deletes the selected work experience entry after confirmation. */
  async function handleConfirmDelete() {
    if (!deleting) return;
    try {
      await deleteWorkExperience(deleting.id);
      await loadData();
    } catch (error) {
      console.error("Failed to delete:", error);
    } finally {
      setDeleting(null);
    }
  }

  /**
   * Uploads a logo image file.
   * @param e - The file input change event.
   */
  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploading(true);
    try {
      const url = await uploadMedia(file, "logos");
      setLogoUrl(url);
    } catch (error) {
      console.error("Failed to upload logo:", error);
    } finally {
      setLogoUploading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {items.length} {items.length === 1 ? "entry" : "entries"}
        </p>
        <Button onClick={handleNew}>
          <Plus className="mr-2 h-4 w-4" />
          Add Work Experience
        </Button>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10 text-muted-foreground">
            <Briefcase className="mb-2 h-10 w-10" />
            <p>No work experience entries yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card>
                <CardContent className="flex items-start justify-between p-4">
                  <div className="flex gap-3">
                    {item.logo_url && (
                      <img
                        src={item.logo_url}
                        alt={item.company}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <p className="font-medium">{item.company}</p>
                      <p className="text-sm text-muted-foreground">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.start_date} - {item.end_date || "Present"} | {item.location}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleting(item)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Work Experience" : "Add Work Experience"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {logoUrl && (
                <img src={logoUrl} alt="Logo" className="h-12 w-12 rounded-full object-cover" />
              )}
              <div>
                <Label htmlFor="logo-upload" className="cursor-pointer">
                  <Button variant="outline" size="sm" asChild disabled={logoUploading}>
                    <span>
                      {logoUploading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="mr-2 h-4 w-4" />
                      )}
                      Upload Logo
                    </span>
                  </Button>
                </Label>
                <input id="logo-upload" type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Company</Label>
                <Input value={company} onChange={(e) => setCompany(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input value={locationField} onChange={(e) => setLocationField(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Company URL</Label>
                <Input value={href} onChange={(e) => setHref(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input value={startDate} onChange={(e) => setStartDate(e.target.value)} placeholder="e.g. Dec 2024" />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input value={endDate} onChange={(e) => setEndDate(e.target.value)} placeholder="e.g. Present" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={descriptionField} onChange={(e) => setDescriptionField(e.target.value)} rows={4} />
            </div>
            <div className="space-y-2">
              <Label>Badges (comma-separated)</Label>
              <Input value={badges} onChange={(e) => setBadges(e.target.value)} placeholder="e.g. Remote, Full-time" />
            </div>
            <div className="space-y-2">
              <Label>Display Order</Label>
              <Input type="number" value={displayOrder} onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Work Experience</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleting?.company} - {deleting?.title}&quot;?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
