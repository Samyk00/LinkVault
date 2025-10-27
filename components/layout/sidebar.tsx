"use client";

/**
 * @file components/layout/sidebar.tsx
 * @description Application sidebar with folders and navigation
 * @created 2025-10-18
 */

import * as React from "react";
import { Plus } from "lucide-react";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useStore } from "@/store/useStore";
import { useFolderActions } from "@/hooks/use-folder-actions";
import { QuickAccessNav, FolderItem } from "./shared-folder-nav";

export function Sidebar() {
  const links = useStore((state) => state.links);
  const folders = useStore((state) => state.folders);
  const setSelectedFolder = useStore((state) => state.setSelectedFolder);
  const setCurrentView = useStore((state) => state.setCurrentView);
  const setCreateFolderModalOpen = useStore((state) => state.setCreateFolderModalOpen);
  
  // Use shared folder actions hook
  const { 
    confirmDeleteFolder,
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    folderToDelete,
  } = useFolderActions();

  // Calculate counts
  const allLinksCount = links.filter(link => link.deletedAt === null).length;
  const favoritesCount = links.filter(link => link.isFavorite && link.deletedAt === null).length;
  const trashCount = links.filter(link => link.deletedAt !== null).length;

  return (
    <>
      <aside className="hidden md:flex w-64 max-w-64 flex-col border-r bg-background">
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-1">
          {/* Quick Access */}
          <div className="mb-4">
            <h4 className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Quick Access
            </h4>
            <QuickAccessNav
              allLinksCount={allLinksCount}
              favoritesCount={favoritesCount}
              trashCount={trashCount}
            />
          </div>

          {/* Folders */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Folders
              </h4>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 hover:bg-primary/10"
                onClick={() => setCreateFolderModalOpen(true)}
                aria-label="Add folder"
              >
                <Plus className="h-4 w-4 text-primary" />
              </Button>
            </div>
            {folders.length > 0 && (
              <nav className="space-y-0.5">
                {folders.filter(f => f.parentId === null).map((folder) => (
                  <FolderItem
                    key={folder.id}
                    folder={folder}
                    onFolderClick={(folderId) => {
                      setCurrentView('all');
                      setSelectedFolder(folderId);
                    }}
                  />
                ))}
              </nav>
            )}
          </div>
        </div>
      </ScrollArea>
      </aside>

      {/* Folder Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDeleteFolder}
        title="Delete folder?"
        description={
          folderToDelete
            ? folderToDelete.linkCount > 0
              ? `"${folderToDelete.name}" contains ${folderToDelete.linkCount} link${folderToDelete.linkCount > 1 ? 's' : ''}. Links will remain in "All Links".`
              : `"${folderToDelete.name}" is empty and will be deleted.`
            : ""
        }
        confirmText="Delete"
        variant="destructive"
      />
    </>
  );
}
