"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { fetchProfile, fetchSkills, createSkill, updateSkill, deleteSkill } from "@/lib/api";
import type { Skill } from "@/lib/types";
import { Pencil, Trash2, Plus, Loader2, Wrench } from "lucide-react";

/**
 * Dashboard page for managing skills.
 * Displays skills as badges with edit/delete actions.
 */
export default function SkillsPage() {
  const [items, setItems] = useState<Skill[]>([]);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Skill | null>(null);
  const [deleting, setDeleting] = useState<Skill | null>(null);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [displayOrder, setDisplayOrder] = useState(0);

  /** Loads skills from the database. */
  const loadData = useCallback(async () => {
    try {
      const profile = await fetchProfile();
      if (profile) {
        setProfileId(profile.id);
        const data = await fetchSkills(profile.id);
        setItems(data);
      }
    } catch (error) { console.error("Failed to load skills:", error); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  /** Opens the modal for adding a new skill. */
  function handleNew() {
    setEditing(null);
    setName("");
    setDisplayOrder(items.length);
    setModalOpen(true);
  }

  /** Opens the modal for editing an existing skill. */
  function handleEdit(item: Skill) {
    setEditing(item);
    setName(item.name);
    setDisplayOrder(item.display_order);
    setModalOpen(true);
  }

  /** Saves the skill (create or update). */
  async function handleSave() {
    if (!profileId) return;
    setSaving(true);
    try {
      const input = { name, display_order: displayOrder };
      if (editing) await updateSkill(editing.id, input);
      else await createSkill(profileId, input);
      await loadData();
      setModalOpen(false);
    } catch (error) { console.error("Failed to save:", error); }
    finally { setSaving(false); }
  }

  /** Deletes the skill after confirmation. */
  async function handleConfirmDelete() {
    if (!deleting) return;
    try { await deleteSkill(deleting.id); await loadData(); }
    catch (error) { console.error("Failed to delete:", error); }
    finally { setDeleting(null); }
  }

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{items.length} {items.length === 1 ? "skill" : "skills"}</p>
        <Button onClick={handleNew}><Plus className="mr-2 h-4 w-4" />Add Skill</Button>
      </div>

      {items.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center justify-center py-10 text-muted-foreground"><Wrench className="mb-2 h-10 w-10" /><p>No skills yet.</p></CardContent></Card>
      ) : (
        <Card>
          <CardContent className="flex flex-wrap gap-2 p-4">
            {items.map((item, index) => (
              <motion.div key={item.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.02 }}>
                <Badge variant="secondary" className="group flex items-center gap-1 py-1.5 pl-3 pr-1 text-sm">
                  {item.name}
                  <button onClick={() => handleEdit(item)} className="ml-1 rounded p-0.5 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-muted">
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button onClick={() => setDeleting(item)} className="rounded p-0.5 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive/20">
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </button>
                </Badge>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>{editing ? "Edit Skill" : "Add Skill"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Skill Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. TypeScript" /></div>
            <div className="space-y-2"><Label>Display Order</Label><Input type="number" value={displayOrder} onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Skill</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete &quot;{deleting?.name}&quot;?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleConfirmDelete}>Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
