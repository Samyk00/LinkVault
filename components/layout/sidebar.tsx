"use client";

/**
 * @file components/layout/sidebar.tsx
 * @description Application sidebar with folders and navigation
 * @created 2025-10-18
 */

import * as React from "react";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useStore } from "@/store/useStore";
import { useFolderActions } from "@/hooks/use-folder-actions";
import { QuickAccessNav } from "./shared-folder-nav";
import { FoldersSection } from "./folders-section";

export function Sidebar() {
  const links = useStore((state) => state.links);
  
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
          <FoldersSection />
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
