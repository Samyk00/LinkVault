"use client";

/**
 * @file components/layout/mobile-sidebar.tsx
 * @description Mobile sidebar with slide-out navigation
 * @created 2025-10-18
 */

import * as React from "react";
import { Menu, Plus } from "lucide-react";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useStore } from "@/store/useStore";
import { useFolderActions } from "@/hooks/use-folder-actions";
import { QuickAccessNav, FolderItem } from "./shared-folder-nav";

export function MobileSidebar() {
  const [isOpen, setIsOpen] = React.useState(false);
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

  const handleFolderClick = (folderId: string) => {
    setCurrentView('all');
    setSelectedFolder(folderId);
  };

  const handleViewClick = (view: 'all' | 'favorites' | 'trash') => {
    setCurrentView(view);
    setSelectedFolder(null);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden focus:outline-none focus-visible:ring-0"
        onClick={() => setIsOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <span className="text-lg font-bold">L</span>
                </div>
                <span className="text-lg font-semibold">LinkVault</span>
              </div>
            </SheetTitle>
            <SheetDescription className="sr-only">
              Navigation menu for LinkVault
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="flex-1 h-[calc(100vh-80px)]">
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
                  onViewClick={handleViewClick}
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
                        onFolderClick={handleFolderClick}
                      />
                    ))}
                  </nav>
                )}
              </div>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

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
