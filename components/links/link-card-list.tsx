/**
 * @file components/links/link-card-list.tsx
 * @description List view variant of link card - horizontal layout
 * @created 2025-10-18
 */

"use client";

import { useState } from "react";
import Image from "next/image";
import { Link, Star, MoreVertical, Edit, Trash2, Copy, RotateCcw, XCircle, CheckSquare } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link as LinkType } from "@/types";
import { getPlatformConfig } from "@/utils/platform";
import { formatRelativeTime } from "@/utils/date";
import { useStore } from "@/store/useStore";
import { useToast } from "@/hooks/use-toast";
import { FolderBadge } from "./folder-badge";
import * as LucideIcons from "lucide-react";

interface LinkCardListProps {
  link: LinkType;
  isInTrash?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (linkId: string) => void;
  isSelectionModeActive?: boolean;
}

/**
 * List view card component
 * Displays link information in horizontal layout for list view
 * 
 * @example
 * <LinkCardList link={link} />
 */
export function LinkCardList({ link, isInTrash = false, isSelected = false, onToggleSelect, isSelectionModeActive = false }: LinkCardListProps) {
  const [imageError, setImageError] = useState(false);
  const toggleFavorite = useStore((state) => state.toggleFavorite);
  const deleteLink = useStore((state) => state.deleteLink);
  const restoreLink = useStore((state) => state.restoreLink);
  const permanentlyDeleteLink = useStore((state) => state.permanentlyDeleteLink);
  const setEditingLink = useStore((state) => state.setEditingLink);
  const setAddLinkModalOpen = useStore((state) => state.setAddLinkModalOpen);
  const { toast } = useToast();

  const platformConfig = getPlatformConfig(link.platform);
  const PlatformIcon = (LucideIcons as any)[platformConfig.icon] || Link;

  const handleOpenLink = () => {
    // If in selection mode, toggle selection instead of opening link
    if (isSelectionModeActive && onToggleSelect) {
      onToggleSelect(link.id);
      return;
    }
    // Otherwise, open the link
    window.open(link.url, "_blank", "noopener,noreferrer");
  };

  const handleSelect = () => {
    onToggleSelect?.(link.id);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(link.id);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(link.url);
    toast({
      title: "Link copied",
      description: "URL has been copied to clipboard.",
    });
  };

  const handleEdit = () => {
    setEditingLink(link.id);
    setAddLinkModalOpen(true);
  };

  const handleDelete = () => {
    deleteLink(link.id);
    toast({
      title: "Moved to trash",
      description: `"${link.title}" has been moved to trash.`,
    });
  };

  const handleRestore = () => {
    restoreLink(link.id);
    toast({
      title: "Link restored",
      description: `"${link.title}" has been restored.`,
    });
  };

  const handlePermanentDelete = () => {
    if (confirm(`Permanently delete "${link.title}"? This action cannot be undone.`)) {
      permanentlyDeleteLink(link.id);
      toast({
        title: "Link deleted",
        description: "Link has been permanently deleted.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card
      className={`group relative cursor-pointer overflow-hidden transition-all hover:shadow-md ${
        isSelected ? 'ring-1 ring-primary ring-offset-1 ring-offset-background' : ''
      }`}
      onClick={handleOpenLink}
    >
      <div className="flex items-center gap-3 p-3 md:gap-4 md:p-4">
        {/* Thumbnail */}
        <div className="relative h-16 w-20 md:h-20 md:w-28 flex-shrink-0 overflow-hidden rounded-md bg-muted">
          {link.thumbnail && !imageError ? (
            <Image
              src={link.thumbnail}
              alt={link.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              onError={() => setImageError(true)}
              unoptimized
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <PlatformIcon className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Content - Title and Description */}
        <div className="flex-1 min-w-0">
          <h3 className="line-clamp-2 md:line-clamp-1 text-sm font-semibold leading-tight mb-1">
            {link.title}
          </h3>
          {link.description && (
            <p className="hidden md:block line-clamp-1 text-xs text-muted-foreground mb-2">
              {link.description}
            </p>
          )}
          
          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-1 md:mt-2">
            <div className="flex items-center gap-1">
              <div 
                className="flex items-center justify-center"
                style={{ color: platformConfig.color }}
                title={platformConfig.name}
              >
                <PlatformIcon className="h-3 w-3 md:h-3.5 md:w-3.5" />
              </div>
              <span className="text-xs text-muted-foreground hidden sm:inline">{platformConfig.name}</span>
            </div>
            
            <span className="text-xs text-muted-foreground">
              {formatRelativeTime(link.createdAt)}
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
          {/* Folder Badge - Desktop only */}
          <div className="hidden md:block">
            <FolderBadge folderId={link.folderId} />
          </div>
          
          {/* Favorite Star - Desktop only (visible when favorited or on hover) */}
          <div className={`hidden md:flex flex-shrink-0 transition-opacity ${
            link.isFavorite ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleToggleFavorite}
              aria-label={link.isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Star
                className={`h-3.5 w-3.5 transition-colors ${
                  link.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground hover:text-yellow-400'
                }`}
              />
            </Button>
          </div>
          
          {/* Copy Button - Desktop only (visible on hover) */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleCopyLink();
            }}
            aria-label="Copy link"
          >
            <Copy className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
          </Button>

          {/* More Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              {isInTrash ? (
                <>
                  <DropdownMenuItem 
                    onSelect={(e) => {
                      e?.stopPropagation();
                      handleRestore();
                    }}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Restore
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-destructive"
                    onSelect={(e) => {
                      e?.stopPropagation();
                      handlePermanentDelete();
                    }}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Delete Forever
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e?.stopPropagation();
                      handleSelect();
                    }}
                  >
                    <CheckSquare className="mr-2 h-4 w-4" />
                    Select
                  </DropdownMenuItem>
                  {/* Star - Mobile only */}
                  <DropdownMenuItem
                    className="md:hidden"
                    onSelect={(e) => {
                      e?.stopPropagation();
                      handleToggleFavorite(e as any);
                    }}
                  >
                    <Star className={`mr-2 h-4 w-4 ${
                      link.isFavorite ? 'fill-yellow-400 text-yellow-400' : ''
                    }`} />
                    {link.isFavorite ? 'Unfavorite' : 'Favorite'}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="md:hidden"
                    onSelect={(e) => {
                      e?.stopPropagation();
                      handleCopyLink();
                    }}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onSelect={(e) => {
                      e?.stopPropagation();
                      handleEdit();
                    }}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onSelect={(e) => {
                      e?.stopPropagation();
                      handleDelete();
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Trash
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  );
}
