"use client";

/**
 * @file app/page.tsx
 * @description Main application page
 * @created 2025-10-18
 */

import { useMemo, useState, useEffect } from "react";
import { Star, Trash2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { LinkGrid } from "@/components/links/link-grid";
import { ViewToggle } from "@/components/links/view-toggle";
import { AddLinkModal } from "@/components/modals/add-link-modal";
import { CreateFolderModal } from "@/components/modals/create-folder-modal";
import { MobileFAB } from "@/components/common/mobile-fab";
import { EmptyState } from "@/components/common/empty-state";
import { BulkActionBar } from "@/components/common/bulk-action-bar";
import { useStore } from "@/store/useStore";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useSpecificFolderDescendants } from "@/hooks/use-folder-descendants";
import { DEBOUNCE_DELAY } from "@/constants";

export default function Home() {
  const links = useStore((state) => state.links);
  const folders = useStore((state) => state.folders);
  const selectedFolderId = useStore((state) => state.selectedFolderId);
  const currentView = useStore((state) => state.currentView);
  const searchFilters = useStore((state) => state.searchFilters);
  const setSearchFilters = useStore((state) => state.setSearchFilters);
  const setAddLinkModalOpen = useStore((state) => state.setAddLinkModalOpen);
  const isHydrated = useStore((state) => state.isHydrated);
  
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Get all descendant folder IDs for the selected folder (includes parent + all sub-folders)
  const descendantFolderIds = useSpecificFolderDescendants(selectedFolderId, folders);

  // Filter links based on view, folder, and search query
  const filteredLinks = useMemo(() => {
    let filtered = links;

    // Filter by view
    if (currentView === 'trash') {
      // Show only deleted links in trash
      filtered = filtered.filter((link) => link.deletedAt !== null);
    } else {
      // Exclude deleted links from all other views
      filtered = filtered.filter((link) => link.deletedAt === null);

      if (currentView === 'favorites') {
        filtered = filtered.filter((link) => link.isFavorite);
      } else {
        // Filter by folder in 'all' view - includes all sub-folders recursively
        if (selectedFolderId && descendantFolderIds.length > 0) {
          filtered = filtered.filter((link) =>
            link.folderId && descendantFolderIds.includes(link.folderId)
          );
        }
      }
    }

    // Filter by search query
    if (searchFilters.query) {
      const query = searchFilters.query.toLowerCase();
      filtered = filtered.filter(
        (link) =>
          link.title.toLowerCase().includes(query) ||
          link.description.toLowerCase().includes(query) ||
          link.url.toLowerCase().includes(query)
      );
    }

    // Sort by date (newest first)
    return filtered.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [links, selectedFolderId, currentView, searchFilters, descendantFolderIds]);

  // Handle selection toggle
  const handleToggleSelect = (linkId: string) => {
    setSelectedIds(prev =>
      prev.includes(linkId)
        ? prev.filter(id => id !== linkId)
        : [...prev, linkId]
    );
  };

  // Handle clear selection
  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  // Listen for select all event from bulk action bar
  useEffect(() => {
    const handleSelectAllEvent = () => {
      // Use the current filteredLinks from the closure
      const visibleLinkIds = filteredLinks.map(link => link.id);
      setSelectedIds(prev => {
        const allSelected = visibleLinkIds.every(id => prev.includes(id));
        if (allSelected) {
          // Deselect all visible
          return prev.filter(id => !visibleLinkIds.includes(id));
        } else {
          // Select all visible
          const newSelection = [...prev];
          visibleLinkIds.forEach(id => {
            if (!newSelection.includes(id)) {
              newSelection.push(id);
            }
          });
          return newSelection;
        }
      });
    };
    window.addEventListener('selectAllVisible', handleSelectAllEvent);
    return () => window.removeEventListener('selectAllVisible', handleSelectAllEvent);
  }, [filteredLinks]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchFilters({ query });
    
    // Show loading state when searching
    if (query) {
      setIsSearching(true);
      setTimeout(() => setIsSearching(false), DEBOUNCE_DELAY);
    }
  };

  // Get folder name if a folder is selected
  const selectedFolder = selectedFolderId 
    ? folders.find(f => f.id === selectedFolderId) 
    : null;
  
  // Get dynamic title
  const pageTitle = currentView === 'favorites' 
    ? 'Favorites' 
    : currentView === 'trash' 
    ? 'Trash' 
    : selectedFolder 
    ? selectedFolder.name 
    : 'All Links';
  
  // Dynamic font size based on title length (reduced for better hierarchy)
  const getTitleClassName = () => {
    const length = pageTitle.length;
    if (length > 25) return 'text-base sm:text-lg md:text-xl';
    if (length > 18) return 'text-lg sm:text-xl md:text-xl';
    return 'text-xl md:text-2xl';
  };

  // Clear selection when switching views
  useEffect(() => {
    setSelectedIds([]);
  }, [currentView]);

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'k',
      ctrlKey: true,
      callback: () => setAddLinkModalOpen(true),
    },
  ]);


  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="container p-4 md:p-6">
            <div className="mb-6">
              {/* Mobile: Search first, then title below */}
              {/* Desktop: Title left, search right */}
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-2">
                {/* Search Bar + View Toggle - First on mobile, right on desktop */}
                <div className="flex items-center gap-2 md:order-2">
                  <div className="flex-1 md:w-[300px] lg:w-[400px]">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search..."
                        value={searchFilters.query}
                        onChange={handleSearchChange}
                        className="pl-10 h-9 text-sm"
                      />
                    </div>
                  </div>
                  <ViewToggle />
                </div>
                
                {/* Title + Count - Below search on mobile, left on desktop */}
                <div className="flex items-baseline gap-2 min-w-0 md:order-1 md:flex-1">
                  <h1 className={`${getTitleClassName()} font-bold tracking-tight truncate`}>
                    {pageTitle}
                  </h1>
                  <span className="text-sm text-muted-foreground sm:text-base flex-shrink-0">
                    ({filteredLinks.length})
                  </span>
                </div>
              </div>
            </div>
            {currentView === 'favorites' && filteredLinks.length === 0 && links.length > 0 ? (
              <EmptyState
                icon={Star}
                title="No favorites yet"
                description="Click the star icon on any link card to mark it as a favorite and see it here."
              />
            ) : currentView === 'trash' && filteredLinks.length === 0 ? (
              <EmptyState
                icon={Trash2}
                title="Trash is empty"
                description="Deleted links will appear here. You'll be able to restore them or delete them permanently."
              />
            ) : (
              <LinkGrid
                links={filteredLinks}
                isInTrash={currentView === 'trash'}
                isLoading={isSearching}
                selectedIds={selectedIds}
                onToggleSelect={handleToggleSelect}
                isSelectionModeActive={selectedIds.length > 0}
              />
            )}
          </div>
        </main>
      </div>

      <AddLinkModal />
      <CreateFolderModal />
      <MobileFAB />

      {/* Bulk Action Bar */}
      <BulkActionBar
        selectedIds={selectedIds}
        onClearSelection={handleClearSelection}
        totalVisibleItems={filteredLinks.length}
      />
    </div>
  );
}
