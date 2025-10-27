/**
 * @file components/modals/bulk-delete-modal.tsx
 * @description Confirmation modal for bulk delete operations
 * @created 2025-10-25
 */

"use client";

import { Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface BulkDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCount: number;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export function BulkDeleteModal({
  isOpen,
  onClose,
  selectedCount,
  onConfirm,
  isDeleting = false,
}: BulkDeleteModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <Trash2 className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <DialogTitle>Delete Selected Items</DialogTitle>
              <DialogDescription className="mt-1">
                Are you sure you want to delete {selectedCount} selected {selectedCount === 1 ? 'item' : 'items'}?
                This action cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : `Delete ${selectedCount} ${selectedCount === 1 ? 'Item' : 'Items'}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}