"use client";

/**
 * @file components/modals/create-folder-modal.tsx
 * @description Modal for creating and editing folders
 * @created 2025-10-18
 * @updated 2025-10-18 - Added edit mode functionality
 */

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, AlertCircle } from "lucide-react";
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
import { useStore } from "@/store/useStore";
import { useToast } from "@/hooks/use-toast";
import { FOLDER_ICONS } from "@/constants/folder-icons";
import { canAddSubFolder, getSubFolderCount, MAX_SUB_FOLDERS_PER_FOLDER } from "@/utils/folder-utils";

const folderSchema = z.object({
  name: z.string().min(1, "Name is required").max(30, "Name must be 30 characters or less"),
  iconName: z.string().min(1, "Icon is required"),
});

type FolderFormData = z.infer<typeof folderSchema>;

export function CreateFolderModal() {
  const isOpen = useStore((state) => state.isCreateFolderModalOpen);
  const setIsOpen = useStore((state) => state.setCreateFolderModalOpen);
  const editingFolderId = useStore((state) => state.editingFolderId);
  const setEditingFolder = useStore((state) => state.setEditingFolder);
  const parentFolderId = useStore((state) => state.parentFolderId);
  const setParentFolder = useStore((state) => state.setParentFolder);
  const folders = useStore((state) => state.folders);
  const addFolder = useStore((state) => state.addFolder);
  const updateFolder = useStore((state) => state.updateFolder);
  const { toast } = useToast();

  const editingFolder = editingFolderId ? folders.find(f => f.id === editingFolderId) : null;
  const isEditMode = !!editingFolder;
  const isSubFolder = !!parentFolderId;
  const parentFolder = parentFolderId ? folders.find(f => f.id === parentFolderId) : null;
  
  // Check if parent folder has reached the sub-folder limit
  const canAddMoreSubFolders = parentFolderId ? canAddSubFolder(parentFolderId, folders) : true;
  const currentSubFolderCount = parentFolderId ? getSubFolderCount(parentFolderId, folders) : 0;
  const hasReachedLimit = !canAddMoreSubFolders && !isEditMode;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<FolderFormData>({
    resolver: zodResolver(folderSchema),
    defaultValues: {
      name: "",
      iconName: "Folder",
    },
  });

  const selectedIconName = watch("iconName") || "Folder";
  const selectedIcon = FOLDER_ICONS.find(icon => icon.name === selectedIconName) || FOLDER_ICONS[15];

  // Pre-fill form when editing, clear when adding new
  React.useEffect(() => {
    if (isOpen) {
      if (editingFolder) {
        reset({
          name: editingFolder.name,
          iconName: editingFolder.icon,
        });
      } else {
        // Clear form when opening in add mode
        reset({
          name: "",
          iconName: "Folder",
        });
      }
    }
  }, [isOpen, editingFolder, reset]);

  const onSubmit = (data: FolderFormData) => {
    try {
      // Validate: Cannot create sub-folder inside a sub-folder
      if (!isEditMode && parentFolderId) {
        const parent = folders.find(f => f.id === parentFolderId);
        if (parent?.parentId !== null) {
          toast({
            title: "Cannot create sub-folder",
            description: "Sub-folders can only be created under parent folders, not inside other sub-folders.",
            variant: "destructive",
          });
          return;
        }
        
        // Validate sub-folder limit (now 10)
        if (!canAddSubFolder(parentFolderId, folders)) {
          const count = getSubFolderCount(parentFolderId, folders);
          toast({
            title: "Maximum sub-folders reached",
            description: `"${parent?.name || 'This folder'}" already has ${count} sub-folders. Maximum is ${MAX_SUB_FOLDERS_PER_FOLDER} per folder.`,
            variant: "destructive",
          });
          return;
        }
      }

      const iconOption = FOLDER_ICONS.find(icon => icon.name === data.iconName);
      const color = iconOption?.color || "#F59E0B";

      if (isEditMode && editingFolder) {
        // Update existing folder
        updateFolder(editingFolder.id, {
          name: data.name,
          icon: data.iconName,
          color: color,
        });

        toast({
          title: "Folder updated",
          description: "Your folder has been updated successfully.",
        });
      } else {
        // Create new folder or sub-folder
        addFolder({
          name: data.name,
          description: "",
          color: color,
          icon: data.iconName,
          parentId: parentFolderId,
          isPlatformFolder: false,
        });

        toast({
          title: isSubFolder ? "Sub-folder created" : "Folder created",
          description: isSubFolder 
            ? `Sub-folder created under "${parentFolder?.name}"`
            : "Your folder has been created successfully.",
        });
      }

      handleClose();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${isEditMode ? 'update' : 'create'} folder. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    reset();
    setEditingFolder(null);
    setParentFolder(null);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit Folder' : isSubFolder ? `Create Sub-folder ${parentFolder ? `under "${parentFolder.name}"` : ''}` : 'Create Folder'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? 'Update your folder name and icon.'
              : 'Choose an icon and name for your folder.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 flex-1 min-h-0">
          {/* Warning: Sub-folder limit reached */}
          {hasReachedLimit && (
            <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3">
              <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
              <div className="flex-1 text-sm">
                <p className="font-medium text-destructive">Maximum sub-folders reached</p>
                <p className="text-xs text-destructive/80 mt-1">
                  &quot;{parentFolder?.name}&quot; already has {currentSubFolderCount} sub-folders. 
                  Maximum is {MAX_SUB_FOLDERS_PER_FOLDER} sub-folders per folder.
                </p>
              </div>
            </div>
          )}

          {/* Name Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="name" className="text-sm">Folder Name</Label>
              <span className="text-xs text-muted-foreground">{watch("name")?.length || 0}/30</span>
            </div>
            <Input
              id="name"
              placeholder="My Folder"
              {...register("name")}
              maxLength={30}
              autoFocus
              className="h-9"
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Icon Selector */}
          <div className="flex-1 min-h-0 flex flex-col gap-2">
            <Label className="text-sm">Select Icon</Label>
            
            <div className="grid grid-cols-8 gap-1.5">
              {FOLDER_ICONS.map((iconOption) => {
                const IconComponent = iconOption.icon;
                const isSelected = selectedIconName === iconOption.name;
                return (
                  <button
                    key={iconOption.name}
                    type="button"
                    onClick={() => setValue("iconName", iconOption.name)}
                    className={`aspect-square p-2 rounded-md border-2 transition-all hover:scale-105 flex items-center justify-center ${
                      isSelected
                        ? "border-primary bg-primary/10 scale-105"
                        : "border-border hover:border-primary/50"
                    }`}
                    title={iconOption.name}
                  >
                    <IconComponent 
                      className="h-4 w-4" 
                      style={{ color: iconOption.color }}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || hasReachedLimit}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditMode ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                isEditMode ? 'Update Folder' : 'Create Folder'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
