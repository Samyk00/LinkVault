"use client";

/**
 * @file components/layout/sidebar.tsx
 * @description Application sidebar with folders and navigation
 * @created 2025-10-18
 */

import * as React from "react";
import { Star, Trash2, MoreVertical, Edit, Trash, Plus, ChevronRight, ChevronDown, FolderPlus, Folder } from "lucide-react";
import { FOLDER_ICONS } from "@/constants/folder-icons";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStore } from "@/store/useStore";
import { useFolderActions } from "@/hooks/use-folder-actions";

export function Sidebar() {
  const links = useStore((state) => state.links);
  const folders = useStore((state) => state.folders);
  const selectedFolderId = useStore((state) => state.selectedFolderId);
  const currentView = useStore((state) => state.currentView);
  const setSelectedFolder = useStore((state) => state.setSelectedFolder);
  const setCurrentView = useStore((state) => state.setCurrentView);
  const setCreateFolderModalOpen = useStore((state) => state.setCreateFolderModalOpen);
  const expandedFolders = useStore((state) => state.expandedFolders);
  const toggleFolderExpanded = useStore((state) => state.toggleFolderExpanded);
  
  // Use shared folder actions hook
  const { handleEditFolder, handleAddSubFolder, handleDeleteFolder, getFolderCount } = useFolderActions();

  // Calculate counts
  const allLinksCount = links.filter(link => link.deletedAt === null).length;
  const favoritesCount = links.filter(link => link.isFavorite && link.deletedAt === null).length;
  const trashCount = links.filter(link => link.deletedAt !== null).length;

  return (
    <aside className="hidden md:flex w-64 max-w-64 flex-col border-r bg-background">
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-1">
          {/* Quick Access */}
          <div className="mb-4">
            <h4 className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Quick Access
            </h4>
            <nav className="space-y-1">
              <Button
                variant={currentView === 'all' && selectedFolderId === null ? "secondary" : "ghost"}
                className="w-full justify-between gap-2"
                onClick={() => {
                  setCurrentView('all');
                  setSelectedFolder(null);
                }}
              >
                <div className="flex items-center gap-2">
                  <Folder className="h-4 w-4" />
                  <span>All Links</span>
                </div>
                <span className="text-xs text-muted-foreground">{allLinksCount}</span>
              </Button>
              <Button
                variant={currentView === 'favorites' ? "secondary" : "ghost"}
                className="w-full justify-between gap-2"
                onClick={() => {
                  setCurrentView('favorites');
                  setSelectedFolder(null);
                }}
              >
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  <span>Favorites</span>
                </div>
                <span className="text-xs text-muted-foreground">{favoritesCount}</span>
              </Button>
              <Button
                variant={currentView === 'trash' ? "secondary" : "ghost"}
                className="w-full justify-between gap-2"
                onClick={() => {
                  setCurrentView('trash');
                  setSelectedFolder(null);
                }}
              >
                <div className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  <span>Trash</span>
                </div>
                <span className="text-xs text-muted-foreground">{trashCount}</span>
              </Button>
            </nav>
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
                {folders.filter(f => f.parentId === null).map((folder) => {
                  const IconOption = FOLDER_ICONS.find(icon => icon.name === folder.icon);
                  const FolderIcon = IconOption?.icon || FOLDER_ICONS[15].icon;
                  const iconColor = IconOption?.color || folder.color;
                  const subFolders = folders.filter(f => f.parentId === folder.id);
                  const hasSubFolders = subFolders.length > 0;
                  const isExpanded = expandedFolders.has(folder.id);

                  return (
                    <div key={folder.id}>
                      <div className="group relative h-9">
                        {/* Chevron Button */}
                        {hasSubFolders && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute left-0 top-0 h-9 w-6 shrink-0 z-20"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFolderExpanded(folder.id);
                            }}
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                            )}
                          </Button>
                        )}
                        
                        {/* Main Folder Button */}
                        <TooltipProvider delayDuration={500}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant={selectedFolderId === folder.id && currentView === 'all' ? "secondary" : "ghost"}
                                className={`absolute ${hasSubFolders ? 'left-6' : 'left-0'} top-0 h-9 justify-start`}
                                style={{ width: hasSubFolders ? 'calc(100% - 24px - 60px)' : 'calc(100% - 60px)' }}
                                onClick={() => {
                                  setCurrentView('all');
                                  setSelectedFolder(folder.id);
                                }}
                              >
                                <div className="flex items-center gap-1.5 min-w-0 w-full">
                                  <FolderIcon
                                    className="h-3.5 w-3.5 shrink-0"
                                    style={{ color: iconColor }}
                                  />
                                  <span className="truncate text-sm">{folder.name}</span>
                                </div>
                              </Button>
                            </TooltipTrigger>
                            {folder.name.length > 20 && (
                              <TooltipContent side="right" className="max-w-xs">
                                <p>{folder.name}</p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                        
                        {/* Count Badge - Fixed Position */}
                        <div className="absolute right-8 top-0 h-9 flex items-center pointer-events-none z-30">
                          <span className="text-[11px] text-muted-foreground font-medium">{getFolderCount(folder.id)}</span>
                        </div>
                        
                        {/* Three-Dots Menu - Fixed Position */}
                        <div className="absolute right-0 top-0 h-9 flex items-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-40">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">Folder options</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onSelect={() => handleAddSubFolder(folder.id)}>
                                <FolderPlus className="mr-2 h-4 w-4" />
                                Add Sub-folder
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => handleEditFolder(folder.id)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onSelect={() => handleDeleteFolder(folder.id, folder.name)}
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {/* Sub-folders */}
                      {hasSubFolders && isExpanded && (
                        <div className="ml-6 mt-0.5 space-y-0.5 border-l-2 border-border pl-2">
                          {subFolders.map((subFolder) => {
                            const SubIconOption = FOLDER_ICONS.find(icon => icon.name === subFolder.icon);
                            const SubFolderIcon = SubIconOption?.icon || FOLDER_ICONS[15].icon;
                            const subIconColor = SubIconOption?.color || subFolder.color;

                            return (
                              <div key={subFolder.id} className="group relative h-8">
                                {/* Sub-Folder Button */}
                                <TooltipProvider delayDuration={500}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant={selectedFolderId === subFolder.id && currentView === 'all' ? "secondary" : "ghost"}
                                        className="absolute left-0 top-0 h-8 justify-start"
                                        style={{ width: 'calc(100% - 60px)' }}
                                        onClick={() => {
                                          setCurrentView('all');
                                          setSelectedFolder(subFolder.id);
                                        }}
                                      >
                                        <div className="flex items-center gap-1.5 min-w-0 w-full">
                                          <SubFolderIcon
                                            className="h-3 w-3 shrink-0"
                                            style={{ color: subIconColor }}
                                          />
                                          <span className="truncate text-xs">{subFolder.name}</span>
                                        </div>
                                      </Button>
                                    </TooltipTrigger>
                                    {subFolder.name.length > 18 && (
                                      <TooltipContent side="right" className="max-w-xs">
                                        <p>{subFolder.name}</p>
                                      </TooltipContent>
                                    )}
                                  </Tooltip>
                                </TooltipProvider>
                                
                                {/* Count Badge - Fixed Position */}
                                <div className="absolute right-8 top-0 h-8 flex items-center pointer-events-none z-30">
                                  <span className="text-[11px] text-muted-foreground font-medium">{getFolderCount(subFolder.id)}</span>
                                </div>
                                
                                {/* Three-Dots Menu - Fixed Position */}
                                <div className="absolute right-0 top-0 h-8 flex items-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-40">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <MoreVertical className="h-4 w-4" />
                                        <span className="sr-only">Folder options</span>
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onSelect={() => handleEditFolder(subFolder.id)}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        className="text-destructive"
                                        onSelect={() => handleDeleteFolder(subFolder.id, subFolder.name)}
                                      >
                                        <Trash className="mr-2 h-4 w-4" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>
            )}
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
}
