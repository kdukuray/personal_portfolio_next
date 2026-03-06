"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  fetchProfile, fetchHackathons, createHackathon, updateHackathon,
  deleteHackathon, createHackathonLink, deleteHackathonLink, uploadMedia,
} from "@/lib/api";
import { AVAILABLE_ICON_KEYS } from "@/lib/icon-map";
import type { HackathonWithLinks } from "@/lib/types";
import { Pencil, Trash2, Plus, Loader2, Upload, Trophy, X } from "lucide-react";

/**
 * Dashboard page for managing hackathon entries.
 * Supports full CRUD with nested hackathon links.
 */
export default function HackathonsPage() {
  const [items, setItems] = useState<HackathonWithLinks[]>([]);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<HackathonWithLinks | null>(null);
  const [deleting, setDeleting] = useState<HackathonWithLinks | null>(null);
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  const [title, setTitle] = useState("");
  const [dates, setDates] = useState("");
  const [locationField, setLocationField] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [mlhLink, setMlhLink] = useState("");
  const [displayOrder, setDisplayOrder] = useState(0);
  const [links, setLinks] = useState<{ title: string; href: string; icon_key: string }[]>([]);

  /** Loads hackathons data from the database. */
  const loadData = useCallback(async () => {
    try {
      const profile = await fetchProfile();
      if (profile) {
        setProfileId(profile.id);
        const data = await fetchHackathons(profile.id);
        setItems(data);
      }
    } catch (error) { console.error("Failed to load hackathons:", error); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  /** Opens the creation modal with blank fields. */
  function handleNew() {
    setEditing(null);
    setTitle(""); setDates(""); setLocationField(""); setDescription("");
    setImageUrl(""); setMlhLink(""); setDisplayOrder(items.length); setLinks([]);
    setModalOpen(true);
  }

  /** Opens the editing modal with the hackathon's data. */
  function handleEdit(item: HackathonWithLinks) {
    setEditing(item);
    setTitle(item.title); setDates(item.dates); setLocationField(item.location);
    setDescription(item.description); setImageUrl(item.image_url);
    setMlhLink(item.mlh_link); setDisplayOrder(item.display_order);
    setLinks(item.hackathon_links?.map((l) => ({ title: l.title, href: l.href, icon_key: l.icon_key })) || []);
    setModalOpen(true);
  }

  /** Saves the hackathon (create or update) and manages links. */
  async function handleSave() {
    if (!profileId) return;
    setSaving(true);
    try {
      const input = {
        title, dates, location: locationField, description,
        image_url: imageUrl, mlh_link: mlhLink, display_order: displayOrder,
      };
      let hackathonId: string;
      if (editing) {
        await updateHackathon(editing.id, input);
        hackathonId = editing.id;
        for (const link of editing.hackathon_links || []) {
          await deleteHackathonLink(link.id);
        }
      } else {
        const created = await createHackathon(profileId, input);
        hackathonId = created.id;
      }
      for (const link of links) {
        await createHackathonLink(hackathonId, link);
      }
      await loadData();
      setModalOpen(false);
    } catch (error) { console.error("Failed to save:", error); }
    finally { setSaving(false); }
  }

  /** Deletes the hackathon after confirmation. */
  async function handleConfirmDelete() {
    if (!deleting) return;
    try { await deleteHackathon(deleting.id); await loadData(); }
    catch (error) { console.error("Failed to delete:", error); }
    finally { setDeleting(null); }
  }

  /** Uploads a hackathon image. */
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    try { const url = await uploadMedia(file, "hackathons"); setImageUrl(url); }
    catch (error) { console.error("Failed to upload:", error); }
    finally { setImageUploading(false); }
  }

  /** Adds a new link row. */
  function addLink() { setLinks([...links, { title: "Github", href: "", icon_key: "github" }]); }

  /** Removes a link row. */
  function removeLink(index: number) { setLinks(links.filter((_, i) => i !== index)); }

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{items.length} {items.length === 1 ? "hackathon" : "hackathons"}</p>
        <Button onClick={handleNew}><Plus className="mr-2 h-4 w-4" />Add Hackathon</Button>
      </div>

      {items.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center justify-center py-10 text-muted-foreground"><Trophy className="mb-2 h-10 w-10" /><p>No hackathons yet.</p></CardContent></Card>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
              <Card>
                <CardContent className="flex items-start justify-between p-4">
                  <div className="flex gap-3">
                    {item.image_url && <img src={item.image_url} alt={item.title} className="h-10 w-10 rounded-full object-cover" />}
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.dates}</p>
                      <p className="text-xs text-muted-foreground">{item.location}</p>
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
          <DialogHeader><DialogTitle>{editing ? "Edit Hackathon" : "Add Hackathon"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {imageUrl && <img src={imageUrl} alt="Preview" className="h-12 w-12 rounded-full object-cover" />}
              <div>
                <Label htmlFor="hack-image-upload" className="cursor-pointer">
                  <Button variant="outline" size="sm" asChild disabled={imageUploading}>
                    <span>{imageUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}Upload Image</span>
                  </Button>
                </Label>
                <input id="hack-image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
              <div className="space-y-2"><Label>Dates</Label><Input value={dates} onChange={(e) => setDates(e.target.value)} placeholder="e.g. October 6th - 7th 2025" /></div>
              <div className="space-y-2"><Label>Location</Label><Input value={locationField} onChange={(e) => setLocationField(e.target.value)} /></div>
              <div className="space-y-2"><Label>MLH Link</Label><Input value={mlhLink} onChange={(e) => setMlhLink(e.target.value)} /></div>
            </div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} /></div>
            <div className="space-y-2"><Label>Display Order</Label><Input type="number" value={displayOrder} onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)} /></div>

            <div className="space-y-2">
              <div className="flex items-center justify-between"><Label>Links</Label><Button type="button" variant="outline" size="sm" onClick={addLink}><Plus className="mr-1 h-3 w-3" />Add Link</Button></div>
              {links.map((link, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input className="flex-1" value={link.title} onChange={(e) => { const u = [...links]; u[i].title = e.target.value; setLinks(u); }} placeholder="Title" />
                  <Input className="flex-[2]" value={link.href} onChange={(e) => { const u = [...links]; u[i].href = e.target.value; setLinks(u); }} placeholder="URL" />
                  <Select value={link.icon_key} onValueChange={(val) => { const u = [...links]; u[i].icon_key = val; setLinks(u); }}>
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
          <AlertDialogHeader><AlertDialogTitle>Delete Hackathon</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete &quot;{deleting?.title}&quot;? This will also remove all associated links.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleConfirmDelete}>Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
