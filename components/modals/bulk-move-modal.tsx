/**
 * @file components/modals/bulk-move-modal.tsx
 * @description Modal for bulk moving selected links to folders
 * @created 2025-10-25
 */

"use client";

import { useState, useMemo } from "react";
import { FolderPlus, Search, Check } from "lucide-react";
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
import { useStore } from "@/store/useStore";
import { useToast } from "@/hooks/use-toast";
import { getRootFolders } from "@/utils/folder-utils";
import { FolderTreeItem } from "@/components/folders/folder-tree-item";

interface BulkMoveModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedIds: string[];
  onComplete: (movedCount: number) => void;
}

interface FolderTreeItemProps {
  folder: any;
  allFolders: any[];
  selectedId: string | null;
  onSelect: (folderId: string) => void;
  expandedIds: Set<string>;
  onToggleExpand: (folderId: string) => void;
  showCheckIcon?: boolean;
}

export function BulkMoveModal({
  isOpen,
  onClose,
  selectedIds,
  onComplete,
}: BulkMoveModalProps) {
  const links = useStore((state) => state.links);
  const folders = useStore((state) => state.folders);
  const updateLink = useStore((state) => state.updateLink);
  const { toast } = useToast();

  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [isMoving, setIsMoving] = useState(false);

  // Get selected links
  const selectedLinks = links.filter(link => selectedIds.includes(link.id));

  // Filter folders based on search
  const filteredFolders = useMemo(() => {
    if (!searchQuery) return folders;

    const query = searchQuery.toLowerCase();
    return folders.filter(folder =>
      folder.name.toLowerCase().includes(query)
    );
  }, [folders, searchQuery]);

  // Get root folders for display
  const rootFolders = useMemo(() => {
    return getRootFolders(filteredFolders);
  }, [filteredFolders]);

  /**
   * Handles folder selection toggle
   */
  const handleFolderSelect = (folderId: string | null) => {
    setSelectedFolderId(selectedFolderId === folderId ? null : folderId);
  };

  /**
   * Handles folder expansion toggle
   */
  const handleToggleExpand = (folderId: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  /**
   * Handles the bulk move operation
   */
  const handleMove = async () => {
    if (!selectedFolderId) return;

    setIsMoving(true);
    let movedCount = 0;

    try {
      // Check if any links are already in the target folder
      const alreadyInFolder = selectedLinks.filter(link => link.folderId === selectedFolderId);

      if (alreadyInFolder.length > 0) {
        const proceed = window.confirm(
          `${alreadyInFolder.length} ${alreadyInFolder.length === 1 ? 'item is' : 'items are'} already in the selected folder. Continue moving all selected items (including those already in the folder)?`
        );

        if (!proceed) {
          setIsMoving(false);
          return;
        }
      }

      // Move links to selected folder
      selectedIds.forEach(id => {
        const link = links.find(l => l.id === id);
        if (link && link.folderId !== selectedFolderId) {
          updateLink(id, { folderId: selectedFolderId });
          movedCount++;
        }
      });

      onComplete(movedCount);
      handleClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to move items. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsMoving(false);
    }
  };

  /**
   * Handles modal close
   */
  const handleClose = () => {
    setSelectedFolderId(null);
    setSearchQuery("");
    setExpandedIds(new Set());
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Move Items</DialogTitle>
          <DialogDescription>
            Choose a folder to move {selectedIds.length} selected {selectedIds.length === 1 ? 'item' : 'items'} to.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col flex-1 min-h-0">
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search folders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Folder Tree */}
          <div className="flex-1 overflow-y-auto border rounded-md p-2 custom-scrollbar">
            {rootFolders.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <FolderPlus className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? "No folders found" : "No folders available"}
                </p>
              </div>
            ) : (
              <div className="space-y-1" role="tree" aria-label="Folder tree">
                {/* None option */}
                <button
                  type="button"
                  onClick={() => setSelectedFolderId(null)}
                  className={`w-full text-left px-2 py-2 text-sm rounded hover:bg-accent transition-colors flex items-center gap-2 ${
                    selectedFolderId === null ? 'bg-accent' : ''
                  }`}
                >
                  {selectedFolderId === null && <Check className="h-4 w-4" />}
                  <span className="text-muted-foreground italic">None (remove from folders)</span>
                </button>

                {/* Folder tree */}
                {rootFolders.map((folder) => (
                  <FolderTreeItem
                    key={folder.id}
                    folder={folder}
                    allFolders={filteredFolders}
                    selectedId={selectedFolderId}
                    onSelect={handleFolderSelect}
                    expandedIds={expandedIds}
                    onToggleExpand={handleToggleExpand}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleMove}
            disabled={!selectedFolderId && selectedFolderId !== null || isMoving}
          >
            {isMoving ? "Moving..." : `Move ${selectedIds.length} ${selectedIds.length === 1 ? 'Item' : 'Items'}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}