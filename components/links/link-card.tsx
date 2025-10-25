/**
 * @file components/links/link-card.tsx
 * @description Link card component for grid view with subtle animations
 * @author LinkVault Team
 * @created 2025-10-18
 * @modified 2025-10-19
 */

"use client";

import { useState } from "react";
import Image from "next/image";
import { Star, MoreVertical, Edit, Trash, Link as LinkIcon, RotateCcw, Copy, CheckSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStore } from "@/store/useStore";
import { Link } from "@/types";
import { getPlatformConfig } from "@/utils/platform";
import { FolderBadge } from "./folder-badge";
import { formatRelativeTime } from "@/utils/date";
import { useToast } from "@/hooks/use-toast";
import * as LucideIcons from "lucide-react";

interface LinkCardProps {
  link: Link;
  isInTrash?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (linkId: string) => void;
  isSelectionModeActive?: boolean;
}

/**
 * Link card component for grid view
 * Displays link with thumbnail, title, description, and metadata
 * Includes actions: edit, favorite, delete, restore
 * 
 * @param link - Link object to display
 * @param isInTrash - Whether the link is in trash view
 */
export function LinkCard({ link, isInTrash = false, isSelected = false, onToggleSelect, isSelectionModeActive = false }: LinkCardProps) {
  const updateLink = useStore((state) => state.updateLink);
  const deleteLink = useStore((state) => state.deleteLink);
  const restoreLink = useStore((state) => state.restoreLink);
  const permanentlyDeleteLink = useStore((state) => state.permanentlyDeleteLink);
  const setEditingLink = useStore((state) => state.setEditingLink);
  const setAddLinkModalOpen = useStore((state) => state.setAddLinkModalOpen);
  const [imageError, setImageError] = useState(false);
  const { toast } = useToast();

  // Get platform icon with fallback
  const platformConfig = getPlatformConfig(link.platform);
  const PlatformIcon = (LucideIcons as any)[platformConfig.icon] || LinkIcon;

  /**
   * Opens link in new tab when card is clicked
   * Prevents opening if clicking on interactive elements
   */
  const handleOpenLink = (e: React.MouseEvent) => {
    // Don't open if clicking on buttons or dropdown
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }

    // If in selection mode, toggle selection instead of opening link
    if (onToggleSelect) {
      onToggleSelect(link.id);
      return;
    }

    // Otherwise, open the link
    window.open(link.url, '_blank', 'noopener,noreferrer');
  };

  /**
   * Opens edit modal with current link data
   */
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingLink(link.id);
    setAddLinkModalOpen(true);
  };

  /**
   * Toggles favorite status of the link
   */
  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateLink(link.id, { isFavorite: !link.isFavorite });
    toast({
      title: link.isFavorite ? "Removed from favorites" : "Added to favorites",
      description: link.isFavorite 
        ? `"${link.title}" has been removed from favorites.`
        : `"${link.title}" has been added to favorites.`,
    });
  };

  /**
   * Soft deletes link (moves to trash)
   */
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteLink(link.id);
    toast({
      title: "Link moved to trash",
      description: `"${link.title}" has been moved to trash.`,
    });
  };

  /**
   * Restores link from trash
   */
  const handleRestore = (e: React.MouseEvent) => {
    e.stopPropagation();
    restoreLink(link.id);
    toast({
      title: "Link restored",
      description: `"${link.title}" has been restored.`,
    });
  };

  /**
   * Copies link URL to clipboard
   */
  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(link.url);
    toast({
      title: "Link copied",
      description: "URL has been copied to clipboard.",
    });
  };

  /**
   * Handles selection toggle
   */
  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleSelect?.(link.id);
  };

  /**
   * Opens link in new tab when card is clicked
   * Prevents opening if clicking on interactive elements
   * In selection mode, toggles selection instead
   */
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't open if clicking on buttons or dropdown
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }

    // If in selection mode, toggle selection instead of opening link
    if (isSelectionModeActive && onToggleSelect) {
      onToggleSelect(link.id);
      return;
    }

    // Otherwise, open the link
    window.open(link.url, '_blank', 'noopener,noreferrer');
  };

  /**
   * Permanently deletes link with confirmation
   */
  const handlePermanentDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmMessage = `Permanently delete "${link.title}"?\n\nThis action cannot be undone.`;

    if (window.confirm(confirmMessage)) {
      permanentlyDeleteLink(link.id);
      toast({
        title: "Link deleted permanently",
        description: "The link has been permanently deleted.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card
      className={`group relative overflow-hidden transition-all duration-200 hover:shadow-md cursor-pointer ${
        isSelected ? 'ring-1 ring-primary ring-offset-1 ring-offset-background' : ''
      }`}
      onClick={handleCardClick}
    >
      {/* Three-Dot Menu - Top Right Corner */}
      <div className="absolute top-2 right-2 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full bg-background/90 backdrop-blur-sm hover:bg-background opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
              aria-label="Link options"
            >
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isInTrash ? (
              <>
                <DropdownMenuItem onClick={handleRestore}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Restore
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handlePermanentDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete Permanently
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem onClick={handleSelect}>
                  <CheckSquare className="mr-2 h-4 w-4" />
                  Select
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopyLink} className="md:hidden">
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleToggleFavorite} className="md:hidden">
                  <Star className={`mr-2 h-4 w-4 ${link.isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                  {link.isFavorite ? 'Unfavorite' : 'Favorite'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Trash
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Thumbnail */}
      <div className="relative h-32 w-full overflow-hidden bg-muted">
        {link.thumbnail && !imageError ? (
          <Image
            src={link.thumbnail}
            alt={link.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
            onError={() => setImageError(true)}
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <PlatformIcon className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        
        {/* Favorite star - Top-left corner (visible when favorited or on hover) */}
        {!isInTrash && (
          <div className={`absolute top-2 left-2 z-10 transition-opacity duration-200 ${
            link.isFavorite ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background/90 transition-colors duration-200"
              onClick={handleToggleFavorite}
              aria-label={link.isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Star
                className={`h-4 w-4 transition-colors duration-200 ${
                  link.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground hover:text-yellow-400'
                }`}
              />
            </Button>
          </div>
        )}
      </div>

      {/* Content */}
      <CardContent className="p-4">
        {/* Title */}
        <div className="mb-2">
          <h3 className="line-clamp-1 text-sm font-semibold leading-tight pr-8">
            {link.title || 'Untitled Link'}
          </h3>
        </div>
        
        {/* Description */}
        {link.description && (
          <p className="mb-3 line-clamp-2 text-xs text-muted-foreground leading-relaxed">
            {link.description}
          </p>
        )}

        {/* Footer with metadata */}
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 min-w-0">
            <PlatformIcon
              className="h-3.5 w-3.5 flex-shrink-0"
              style={{ color: platformConfig.color }}
            />
            <span className="truncate capitalize">{link.platform}</span>
            {link.folderId && !isInTrash && (
              <FolderBadge folderId={link.folderId} className="ml-1" />
            )}
          </div>
          <span className="text-xs flex-shrink-0">
            {formatRelativeTime(link.createdAt)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
