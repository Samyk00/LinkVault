/**
 * @file hooks/use-folder-actions.ts
 * @description Shared folder actions hook for sidebar components
 * @author LinkVault Team
 * @created 2025-10-19
 * @modified 2025-10-19
 */

import { useStore } from "@/store/useStore";
import { useToast } from "@/hooks/use-toast";
import { Folder } from "@/types";
import {
  canAddSubFolder,
  MAX_SUB_FOLDERS_PER_FOLDER,
  getSubFolderCount,
  getAllDescendantFolderIds
} from "@/utils/folder-utils";

/**
 * Custom hook providing shared folder management actions
 * Extracts common logic from sidebar and mobile-sidebar components
 * 
 * @returns Object containing folder action handlers and utility functions
 */
export function useFolderActions() {
  const folders = useStore((state) => state.folders);
  const links = useStore((state) => state.links);
  const selectedFolderId = useStore((state) => state.selectedFolderId);
  const setCreateFolderModalOpen = useStore((state) => state.setCreateFolderModalOpen);
  const setEditingFolder = useStore((state) => state.setEditingFolder);
  const setParentFolder = useStore((state) => state.setParentFolder);
  const deleteFolder = useStore((state) => state.deleteFolder);
  const setSelectedFolder = useStore((state) => state.setSelectedFolder);
  const { toast } = useToast();

  /**
   * Handles editing a folder
   * Opens the folder modal in edit mode
   */
  const handleEditFolder = (folderId: string) => {
    setEditingFolder(folderId);
    setCreateFolderModalOpen(true);
  };

  /**
   * Handles adding a sub-folder
   * Validates sub-folder limit before opening modal
   */
  const handleAddSubFolder = (parentId: string) => {
    // Check if parent folder has reached the sub-folder limit
    if (!canAddSubFolder(parentId, folders)) {
      const parentFolder = folders.find(f => f.id === parentId);
      const count = getSubFolderCount(parentId, folders);
      toast({
        title: "Maximum sub-folders reached",
        description: `"${parentFolder?.name || 'This folder'}" already has ${count} sub-folders. You cannot create more than ${MAX_SUB_FOLDERS_PER_FOLDER} sub-folders per folder.`,
        variant: "destructive",
      });
      return;
    }
    
    setParentFolder(parentId);
    setCreateFolderModalOpen(true);
  };

  /**
   * Handles folder deletion with confirmation
   * Shows appropriate warning based on folder contents
   */
  const handleDeleteFolder = (folderId: string, folderName: string) => {
    // Get all sub-folder IDs recursively
    const getAllSubFolderIds = (parentId: string): string[] => {
      const subFolders = folders.filter(f => f.parentId === parentId);
      const subFolderIds = subFolders.map(f => f.id);
      const nestedIds = subFolders.flatMap(f => getAllSubFolderIds(f.id));
      return [...subFolderIds, ...nestedIds];
    };
    
    const allAffectedFolderIds = [folderId, ...getAllSubFolderIds(folderId)];
    const linksInFolder = links.filter(link => 
      allAffectedFolderIds.includes(link.folderId || '')
    );
    const linkCount = linksInFolder.length;
    
    let confirmMessage = `Delete folder "${folderName}"?`;
    
    if (linkCount > 0) {
      confirmMessage += `\n\nThis folder contains ${linkCount} link${linkCount > 1 ? 's' : ''}. The link${linkCount > 1 ? 's' : ''} will not be deleted and will remain in "All Links".`;
    } else {
      confirmMessage += '\n\nThis folder is empty.';
    }
    
    const confirmed = window.confirm(confirmMessage);
    if (confirmed) {
      deleteFolder(folderId);
      // Clear selection if the deleted folder was selected
      if (selectedFolderId === folderId) {
        setSelectedFolder(null);
      }
      toast({
        title: "Folder deleted",
        description: `"${folderName}" has been deleted.`,
      });
    }
  };

  /**
   * Calculates number of links in a specific folder (recursive - includes sub-folders)
   */
  const getFolderCount = (folderId: string): number => {
    // Get all descendant folder IDs (including the folder itself)
    const descendantIds = getAllDescendantFolderIds(folderId, folders);

    // Count links in all descendant folders
    return links.filter(
      link => link.folderId && descendantIds.includes(link.folderId) && link.deletedAt === null
    ).length;
  };

  return {
    handleEditFolder,
    handleAddSubFolder,
    handleDeleteFolder,
    getFolderCount,
  };
}
