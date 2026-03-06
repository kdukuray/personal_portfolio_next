"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  fetchProfile, fetchEducation, createEducation, updateEducation,
  deleteEducation, uploadMedia,
} from "@/lib/api";
import type { Education } from "@/lib/types";
import { Pencil, Trash2, Plus, Loader2, Upload, GraduationCap } from "lucide-react";

/**
 * Dashboard page for managing education entries.
 * Supports creating, editing, and deleting entries with modal forms.
 */
export default function EducationPage() {
  const [items, setItems] = useState<Education[]>([]);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Education | null>(null);
  const [deleting, setDeleting] = useState<Education | null>(null);
  const [saving, setSaving] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);

  const [school, setSchool] = useState("");
  const [degree, setDegree] = useState("");
  const [href, setHref] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [displayOrder, setDisplayOrder] = useState(0);

  /** Loads education data from the database. */
  const loadData = useCallback(async () => {
    try {
      const profile = await fetchProfile();
      if (profile) {
        setProfileId(profile.id);
        const data = await fetchEducation(profile.id);
        setItems(data);
      }
    } catch (error) {
      console.error("Failed to load education:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  /** Opens the creation modal with blank fields. */
  function handleNew() {
    setEditing(null);
    setSchool(""); setDegree(""); setHref("");
    setStartDate(""); setEndDate(""); setLogoUrl("");
    setDisplayOrder(items.length);
    setModalOpen(true);
  }

  /** Opens the editing modal pre-filled with the item's data. */
  function handleEdit(item: Education) {
    setEditing(item);
    setSchool(item.school); setDegree(item.degree); setHref(item.href);
    setStartDate(item.start_date); setEndDate(item.end_date);
    setLogoUrl(item.logo_url); setDisplayOrder(item.display_order);
    setModalOpen(true);
  }

  /** Saves the education entry (create or update). */
  async function handleSave() {
    if (!profileId) return;
    setSaving(true);
    try {
      const input = { school, degree, href, start_date: startDate, end_date: endDate, logo_url: logoUrl, display_order: displayOrder };
      if (editing) await updateEducation(editing.id, input);
      else await createEducation(profileId, input);
      await loadData();
      setModalOpen(false);
    } catch (error) { console.error("Failed to save:", error); }
    finally { setSaving(false); }
  }

  /** Deletes the education entry after confirmation. */
  async function handleConfirmDelete() {
    if (!deleting) return;
    try { await deleteEducation(deleting.id); await loadData(); }
    catch (error) { console.error("Failed to delete:", error); }
    finally { setDeleting(null); }
  }

  /** Uploads a logo image file for the school. */
  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploading(true);
    try { const url = await uploadMedia(file, "logos"); setLogoUrl(url); }
    catch (error) { console.error("Failed to upload:", error); }
    finally { setLogoUploading(false); }
  }

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{items.length} {items.length === 1 ? "entry" : "entries"}</p>
        <Button onClick={handleNew}><Plus className="mr-2 h-4 w-4" />Add Education</Button>
      </div>

      {items.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center justify-center py-10 text-muted-foreground"><GraduationCap className="mb-2 h-10 w-10" /><p>No education entries yet.</p></CardContent></Card>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
              <Card>
                <CardContent className="flex items-start justify-between p-4">
                  <div className="flex gap-3">
                    {item.logo_url && <img src={item.logo_url} alt={item.school} className="h-10 w-10 rounded-full object-cover" />}
                    <div>
                      <p className="font-medium">{item.school}</p>
                      <p className="text-sm text-muted-foreground">{item.degree}</p>
                      <p className="text-xs text-muted-foreground">{item.start_date} - {item.end_date}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleting(item)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit Education" : "Add Education"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {logoUrl && <img src={logoUrl} alt="Logo" className="h-12 w-12 rounded-full object-cover" />}
              <div>
                <Label htmlFor="edu-logo-upload" className="cursor-pointer">
                  <Button variant="outline" size="sm" asChild disabled={logoUploading}>
                    <span>{logoUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}Upload Logo</span>
                  </Button>
                </Label>
                <input id="edu-logo-upload" type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>School</Label><Input value={school} onChange={(e) => setSchool(e.target.value)} /></div>
              <div className="space-y-2"><Label>Degree</Label><Input value={degree} onChange={(e) => setDegree(e.target.value)} /></div>
              <div className="space-y-2"><Label>School URL</Label><Input value={href} onChange={(e) => setHref(e.target.value)} /></div>
              <div className="space-y-2"><Label>Start Date</Label><Input value={startDate} onChange={(e) => setStartDate(e.target.value)} placeholder="e.g. 2024" /></div>
              <div className="space-y-2"><Label>End Date</Label><Input value={endDate} onChange={(e) => setEndDate(e.target.value)} placeholder="e.g. 2026 (expected)" /></div>
              <div className="space-y-2"><Label>Display Order</Label><Input type="number" value={displayOrder} onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)} /></div>
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
          <AlertDialogHeader><AlertDialogTitle>Delete Education</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete &quot;{deleting?.school}&quot;? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleConfirmDelete}>Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
