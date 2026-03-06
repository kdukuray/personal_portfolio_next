"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  fetchProfile,
  updateProfile,
  fetchSocialLinks,
  createSocialLink,
  updateSocialLink,
  deleteSocialLink,
  uploadMedia,
  getCurrentUser,
} from "@/lib/api";
import { AVAILABLE_ICON_KEYS, getIconByKey } from "@/lib/icon-map";
import type { Profile, SocialLink } from "@/lib/types";
import { Pencil, Trash2, Plus, Upload, Loader2 } from "lucide-react";

/**
 * Dashboard profile page for editing personal information and social links.
 * Fetches the current profile and social links from Supabase on mount.
 */
export default function DashboardProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Profile form state
  const [name, setName] = useState("");
  const [initials, setInitials] = useState("");
  const [description, setDescription] = useState("");
  const [summary, setSummary] = useState("");
  const [location, setLocation] = useState("");
  const [locationLink, setLocationLink] = useState("");
  const [url, setUrl] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  // Social link modal state
  const [socialModalOpen, setSocialModalOpen] = useState(false);
  const [editingSocial, setEditingSocial] = useState<SocialLink | null>(null);
  const [socialName, setSocialName] = useState("");
  const [socialUrl, setSocialUrl] = useState("");
  const [socialIconKey, setSocialIconKey] = useState("globe");
  const [socialNavbar, setSocialNavbar] = useState(true);
  const [socialOrder, setSocialOrder] = useState(0);

  // Delete confirmation state
  const [deletingSocial, setDeletingSocial] = useState<SocialLink | null>(null);

  /** Loads profile and social links from the database. */
  const loadData = useCallback(async () => {
    try {
      const user = await getCurrentUser();
      if (!user) return;

      const profileData = await fetchProfile();
      if (profileData) {
        setProfile(profileData);
        setName(profileData.name);
        setInitials(profileData.initials);
        setDescription(profileData.description);
        setSummary(profileData.summary);
        setLocation(profileData.location);
        setLocationLink(profileData.location_link);
        setUrl(profileData.url);
        setEmail(profileData.email);
        setPhone(profileData.phone);
        setAvatarUrl(profileData.avatar_url);

        const links = await fetchSocialLinks(profileData.id);
        setSocialLinks(links);
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /**
   * Saves the updated profile to the database.
   */
  async function handleSaveProfile() {
    if (!profile) return;
    setSaving(true);
    try {
      const updated = await updateProfile(profile.id, {
        name,
        initials,
        description,
        summary,
        location,
        location_link: locationLink,
        url,
        email,
        phone,
        avatar_url: avatarUrl,
      });
      setProfile(updated);
    } catch (error) {
      console.error("Failed to save profile:", error);
    } finally {
      setSaving(false);
    }
  }

  /**
   * Uploads an avatar image file and updates the avatar URL.
   * @param e - The file input change event.
   */
  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const publicUrl = await uploadMedia(file, "avatars");
      setAvatarUrl(publicUrl);
    } catch (error) {
      console.error("Failed to upload avatar:", error);
    } finally {
      setAvatarUploading(false);
    }
  }

  /**
   * Opens the social link modal for creating a new link.
   */
  function handleNewSocial() {
    setEditingSocial(null);
    setSocialName("");
    setSocialUrl("");
    setSocialIconKey("globe");
    setSocialNavbar(true);
    setSocialOrder(socialLinks.length);
    setSocialModalOpen(true);
  }

  /**
   * Opens the social link modal for editing an existing link.
   * @param link - The social link to edit.
   */
  function handleEditSocial(link: SocialLink) {
    setEditingSocial(link);
    setSocialName(link.name);
    setSocialUrl(link.url);
    setSocialIconKey(link.icon_key);
    setSocialNavbar(link.show_in_navbar);
    setSocialOrder(link.display_order);
    setSocialModalOpen(true);
  }

  /**
   * Saves a social link (create or update).
   */
  async function handleSaveSocial() {
    if (!profile) return;
    try {
      if (editingSocial) {
        await updateSocialLink(editingSocial.id, {
          name: socialName,
          url: socialUrl,
          icon_key: socialIconKey,
          show_in_navbar: socialNavbar,
          display_order: socialOrder,
        });
      } else {
        await createSocialLink(profile.id, {
          name: socialName,
          url: socialUrl,
          icon_key: socialIconKey,
          show_in_navbar: socialNavbar,
          display_order: socialOrder,
        });
      }
      const links = await fetchSocialLinks(profile.id);
      setSocialLinks(links);
      setSocialModalOpen(false);
    } catch (error) {
      console.error("Failed to save social link:", error);
    }
  }

  /**
   * Confirms deletion of a social link.
   */
  async function handleConfirmDeleteSocial() {
    if (!deletingSocial || !profile) return;
    try {
      await deleteSocialLink(deletingSocial.id);
      const links = await fetchSocialLinks(profile.id);
      setSocialLinks(links);
    } catch (error) {
      console.error("Failed to delete social link:", error);
    } finally {
      setDeletingSocial(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="py-10 text-center text-muted-foreground">
        <p>No profile found. Please set up your Supabase tables and seed your profile data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Info */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20 overflow-hidden rounded-full border bg-muted">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-muted-foreground">
                  {initials}
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="avatar-upload" className="cursor-pointer">
                <Button variant="outline" size="sm" asChild disabled={avatarUploading}>
                  <span>
                    {avatarUploading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="mr-2 h-4 w-4" />
                    )}
                    Upload Avatar
                  </span>
                </Button>
              </Label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="initials">Initials</Label>
              <Input id="initials" value={initials} onChange={(e) => setInitials(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="locationLink">Location Link</Label>
              <Input id="locationLink" value={locationLink} onChange={(e) => setLocationLink(e.target.value)} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="url">Website URL</Label>
              <Input id="url" value={url} onChange={(e) => setUrl(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Short Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">Summary (Markdown)</Label>
            <Textarea
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={6}
            />
          </div>

          <Button onClick={handleSaveProfile} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Profile"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Social Links</CardTitle>
          <Button size="sm" onClick={handleNewSocial}>
            <Plus className="mr-2 h-4 w-4" />
            Add Link
          </Button>
        </CardHeader>
        <CardContent>
          {socialLinks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No social links yet.</p>
          ) : (
            <div className="space-y-2">
              {socialLinks.map((link, index) => (
                <motion.div
                  key={link.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div className="flex items-center gap-3">
                    {getIconByKey(link.icon_key, "h-5 w-5")}
                    <div>
                      <p className="text-sm font-medium">{link.name}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[200px] sm:max-w-none">
                        {link.url}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditSocial(link)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingSocial(link)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Social Link Modal */}
      <Dialog open={socialModalOpen} onOpenChange={setSocialModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSocial ? "Edit Social Link" : "Add Social Link"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={socialName}
                onChange={(e) => setSocialName(e.target.value)}
                placeholder="e.g. GitHub"
              />
            </div>
            <div className="space-y-2">
              <Label>URL</Label>
              <Input
                value={socialUrl}
                onChange={(e) => setSocialUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label>Icon</Label>
              <Select value={socialIconKey} onValueChange={setSocialIconKey}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_ICON_KEYS.map((key) => (
                    <SelectItem key={key} value={key}>
                      <span className="flex items-center gap-2">
                        {getIconByKey(key, "h-4 w-4")}
                        {key}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={socialNavbar}
                onCheckedChange={setSocialNavbar}
              />
              <Label>Show in Navbar</Label>
            </div>
            <div className="space-y-2">
              <Label>Display Order</Label>
              <Input
                type="number"
                value={socialOrder}
                onChange={(e) => setSocialOrder(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSocialModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSocial}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Social Link Confirmation */}
      <AlertDialog
        open={!!deletingSocial}
        onOpenChange={(open) => !open && setDeletingSocial(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Social Link</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the social link &quot;{deletingSocial?.name}&quot;?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDeleteSocial}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
