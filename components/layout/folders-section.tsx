"use client";

/**
 * @file components/layout/folders-section.tsx
 * @description Shared folders section component for sidebar navigation
 * @created 2025-10-27
 */

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/store/useStore";
import { FolderItem } from "./shared-folder-nav";

interface FoldersSectionProps {
  onFolderClick?: (folderId: string) => void;
}

/**
 * Folders section component that displays folder list with add button.
 * Used in both desktop sidebar and mobile sidebar.
 * @param {FoldersSectionProps} props - Component props
 * @returns {JSX.Element} Folders section component
 */
export function FoldersSection({ onFolderClick }: FoldersSectionProps) {
  const folders = useStore((state) => state.folders);
  const setSelectedFolder = useStore((state) => state.setSelectedFolder);
  const setCurrentView = useStore((state) => state.setCurrentView);
  const setCreateFolderModalOpen = useStore((state) => state.setCreateFolderModalOpen);

  const handleFolderClick = (folderId: string) => {
    if (onFolderClick) {
      onFolderClick(folderId);
    } else {
      setCurrentView('all');
      setSelectedFolder(folderId);
    }
  };

  return (
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
  );
}
