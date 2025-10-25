"use client";

/**
 * @file components/modals/add-link-modal.tsx
 * @description Modal for adding new links with metadata fetching
 * @created 2025-10-18
 */

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Link2, Heading, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/store/useStore";
import { detectPlatform, isValidUrl } from "@/utils/platform";
import { useToast } from "@/hooks/use-toast";
import { FolderTreeSelect } from "@/components/folders/folder-tree-select";

// Delay before fetching metadata to avoid excessive API calls while user is typing
const METADATA_DEBOUNCE_DELAY = 800; // ms

const linkSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(500).optional(),
  folderId: z.string().nullable().optional(),
});

type LinkFormData = z.infer<typeof linkSchema>;

export function AddLinkModal() {
  const isOpen = useStore((state) => state.isAddLinkModalOpen);
  const setIsOpen = useStore((state) => state.setAddLinkModalOpen);
  const editingLinkId = useStore((state) => state.editingLinkId);
  const setEditingLink = useStore((state) => state.setEditingLink);
  const links = useStore((state) => state.links);
  const addLink = useStore((state) => state.addLink);
  const updateLink = useStore((state) => state.updateLink);
  const selectedFolderId = useStore((state) => state.selectedFolderId);
  const currentView = useStore((state) => state.currentView);
  const { toast } = useToast();

  const editingLink = editingLinkId ? links.find(l => l.id === editingLinkId) : null;
  const isEditMode = !!editingLink;

  const [thumbnail, setThumbnail] = useState("");
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<LinkFormData>({
    resolver: zodResolver(linkSchema),
    defaultValues: {
      url: "",
      title: "",
      description: "",
      folderId: null,
    },
  });

  const urlValue = watch("url");

  // Pre-fill form when editing, clear when adding new
  // Smart pre-selection: Auto-select current folder when on folder view
  useEffect(() => {
    if (isOpen) {
      if (editingLink) {
        // Editing mode: Use link's folder
        reset({
          url: editingLink.url,
          title: editingLink.title,
          description: editingLink.description,
          folderId: editingLink.folderId,
        });
        setThumbnail(editingLink.thumbnail);
      } else {
        // Add mode: Smart pre-selection based on current view
        const defaultFolderId = 
          currentView === 'all' && selectedFolderId 
            ? selectedFolderId 
            : null;
        
        reset({
          url: "",
          title: "",
          description: "",
          folderId: defaultFolderId,
        });
        setThumbnail("");
      }
    }
  }, [isOpen, editingLink, reset, currentView, selectedFolderId]);

  // Fetch metadata when URL changes (only in add mode)
  useEffect(() => {
    if (isEditMode) return; // Skip metadata fetch when editing
    if (!urlValue || !isValidUrl(urlValue)) return;

    const timeoutId = setTimeout(async () => {
      setIsFetchingMetadata(true);
      try {
        const response = await fetch("/api/fetch-metadata", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: urlValue }),
        });

        if (response.ok) {
          const data = await response.json();
          setValue("title", data.title || "");
          setValue("description", data.description || "");
          setThumbnail(data.image || "");
        }
      } catch (error) {
        console.error("Failed to fetch metadata:", error);
      } finally {
        setIsFetchingMetadata(false);
      }
    }, METADATA_DEBOUNCE_DELAY);

    return () => clearTimeout(timeoutId);
  }, [urlValue, setValue, isEditMode]);

  const onSubmit = (data: LinkFormData) => {
    try {
      const platform = detectPlatform(data.url);

      if (isEditMode && editingLink) {
        // Update existing link
        updateLink(editingLink.id, {
          url: data.url,
          title: data.title,
          description: data.description || "",
          thumbnail,
          platform,
          folderId: data.folderId || null,
          isFavorite: editingLink.isFavorite,
        });

        toast({
          title: "Link updated",
          description: "Your link has been updated successfully.",
        });
      } else {
        // Add new link
        addLink({
          url: data.url,
          title: data.title,
          description: data.description || "",
          thumbnail,
          platform,
          folderId: data.folderId || null,
          isFavorite: false,
        });

        toast({
          title: "Link added successfully",
          description: "Your link has been saved to LinkVault.",
        });
      }

      handleClose();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${isEditMode ? 'update' : 'add'} link. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    reset();
    setThumbnail("");
    setEditingLink(null);
    setIsOpen(false);
  };


  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>{isEditMode ? 'Edit Link' : 'Add New Link'}</DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? 'Update your link information below.' 
              : "Paste a URL and we'll automatically fetch the metadata."
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
          <div className="space-y-3 overflow-y-auto flex-1 px-1">
            {/* URL Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="url" className="text-sm flex items-center gap-1.5">
                  <Link2 className="h-3.5 w-3.5 text-muted-foreground" />
                  URL
                </Label>
                {/* Loading indicator for metadata fetch */}
                {isFetchingMetadata && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Getting link details</span>
                  </div>
                )}
              </div>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com"
                {...register("url")}
                autoFocus
                className="h-9"
              />
              {errors.url && (
                <p className="text-xs text-destructive">{errors.url.message}</p>
              )}
            </div>

            {/* Title Input */}
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-sm flex items-center gap-1.5">
                <Heading className="h-3.5 w-3.5 text-muted-foreground" />
                Title
              </Label>
              <Input
                id="title"
                placeholder="Link title"
                {...register("title")}
                className="h-9"
              />
              {errors.title && (
                <p className="text-xs text-destructive">{errors.title.message}</p>
              )}
            </div>

            {/* Description Input */}
            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-sm flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Optional description"
                rows={3}
                {...register("description")}
                className="text-sm resize-none overflow-hidden"
              />
              {errors.description && (
                <p className="text-xs text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Folder Selection - Hierarchical Tree */}
            <div>
              <FolderTreeSelect
                value={watch("folderId") || null}
                onChange={(folderId) => setValue("folderId", folderId)}
                placeholder="Optional: Select a folder to organize this link"
                allowClear
              />
            </div>

          </div>

          <DialogFooter className="flex-shrink-0 mt-4">
            <Button type="button" variant="outline" onClick={handleClose} className="h-9">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isFetchingMetadata} className="h-9">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditMode ? 'Updating...' : 'Saving...'}
                </>
              ) : (
                isEditMode ? 'Update Link' : 'Add Link'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
