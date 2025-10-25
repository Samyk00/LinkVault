/**
 * @file components/common/bulk-action-bar.tsx
 * @description Floating bulk action bar for selected items
 * @created 2025-10-25
 */

"use client";

import { useState, useEffect } from "react";
import { Folder, Star, Trash2, CheckSquare, Square, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useStore } from "@/store/useStore";
import { useToast } from "@/hooks/use-toast";
import { BulkMoveModal } from "@/components/modals/bulk-move-modal";
import { BulkDeleteModal } from "@/components/modals/bulk-delete-modal";

interface BulkActionBarProps {
  selectedIds: string[];
  onClearSelection: () => void;
  totalVisibleItems: number;
}

export function BulkActionBar({
  selectedIds,
  onClearSelection,
  totalVisibleItems,
}: BulkActionBarProps) {
  const links = useStore((state) => state.links);
  const updateLink = useStore((state) => state.updateLink);
  const deleteLink = useStore((state) => state.deleteLink);
  const { toast } = useToast();

  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Calculate selection state
  const allSelected = selectedIds.length === totalVisibleItems && totalVisibleItems > 0;
  const someSelected = selectedIds.length > 0 && selectedIds.length < totalVisibleItems;
  const noneSelected = selectedIds.length === 0;

  // Get selected links for operations
  const selectedLinks = links.filter(link => selectedIds.includes(link.id));

  /**
   * Handles select all toggle
   */
  const handleSelectAll = () => {
    if (allSelected) {
      onClearSelection();
    } else {
      // Select all visible items by emitting event to parent
      const event = new CustomEvent('selectAllVisible');
      window.dispatchEvent(event);
    }
  };

  /**
   * Handles bulk favorite toggle
   */
  const handleBulkFavorite = () => {
    const hasMixedStates = selectedLinks.some(link => link.isFavorite) &&
                           selectedLinks.some(link => !link.isFavorite);

    // If mixed states, favorite all; otherwise toggle based on first item's state
    const shouldFavorite = hasMixedStates ? true : !selectedLinks[0]?.isFavorite;

    selectedIds.forEach(id => {
      updateLink(id, { isFavorite: shouldFavorite });
    });

    toast({
      title: shouldFavorite ? "Added to favorites" : "Removed from favorites",
      description: `${selectedIds.length} ${selectedIds.length === 1 ? 'item' : 'items'} ${shouldFavorite ? 'added to' : 'removed from'} favorites.`,
    });
  };

  /**
   * Handles bulk delete - opens confirmation modal
   */
  const handleBulkDelete = () => {
    setShowDeleteModal(true);
  };

  /**
   * Confirms bulk delete operation
   */
  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    setShowDeleteModal(false);

    try {
      selectedIds.forEach(id => {
        deleteLink(id);
      });

      toast({
        title: "Items deleted",
        description: `${selectedIds.length} ${selectedIds.length === 1 ? 'item' : 'items'} moved to trash.`,
      });

      onClearSelection();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete some items. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Handles bulk move completion
   */
  const handleMoveComplete = (movedCount: number) => {
    if (movedCount > 0) {
      toast({
        title: "Items moved",
        description: `${movedCount} ${movedCount === 1 ? 'item' : 'items'} moved successfully.`,
      });
      onClearSelection();
    }
  };

  // Don't render if nothing selected
  if (noneSelected) return null;

  return (
    <>
      {/* Floating Action Bar */}
      <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 bg-background border border-black dark:border-white rounded-lg shadow-lg px-3 py-2 flex items-center gap-2 min-w-[280px] max-w-[90vw]">
        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClearSelection}
          className="h-8 w-8 flex-shrink-0"
          aria-label="Clear selection"
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Selection Count */}
        <div className="flex items-center gap-2 text-sm font-medium flex-shrink-0">
          <span>{selectedIds.length}</span>
        </div>

        {/* Select All Checkbox - Desktop */}
        <div className="hidden md:flex items-center gap-2 flex-shrink-0">
          <Checkbox
            checked={allSelected}
            ref={(el: any) => {
              if (el) el.indeterminate = someSelected;
            }}
            onCheckedChange={handleSelectAll}
            aria-label="Select all visible items"
          />
          <span className="text-sm">Select all</span>
        </div>

        {/* Select All Checkbox - Mobile */}
        <div className="md:hidden flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSelectAll}
            className="h-8 w-8"
            aria-label="Select all visible items"
          >
            {allSelected ? (
              <CheckSquare className="h-4 w-4" />
            ) : (
              <Square className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          {/* Move Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMoveModal(true)}
            className="gap-1 px-2 h-8"
          >
            <Folder className="h-4 w-4" />
            <span className="hidden lg:inline text-xs">Move</span>
          </Button>

          {/* Favorite Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleBulkFavorite}
            className="gap-1 px-2 h-8"
          >
            <Star className={`h-4 w-4 ${selectedLinks.some(link => link.isFavorite) ? 'fill-yellow-400 text-yellow-400' : ''}`} />
            <span className="hidden lg:inline text-xs">Favorite</span>
          </Button>

          {/* Delete Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleBulkDelete}
            disabled={isDeleting}
            className="gap-1 px-2 h-8 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden lg:inline text-xs">Delete</span>
          </Button>
        </div>
      </div>

      {/* Bulk Move Modal */}
      <BulkMoveModal
        isOpen={showMoveModal}
        onClose={() => setShowMoveModal(false)}
        selectedIds={selectedIds}
        onComplete={handleMoveComplete}
      />

      {/* Bulk Delete Modal */}
      <BulkDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        selectedCount={selectedIds.length}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </>
  );
}