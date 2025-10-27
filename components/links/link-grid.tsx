"use client";

/**
 * @file components/links/link-grid.tsx
 * @description Grid view for displaying links with lazy loading
 * @created 2025-10-18
 * @updated 2025-10-18 - Added lazy loading and improved skeleton
 */

import { useState, useEffect, useRef } from "react";
import { Link } from "@/types";
import { LinkCard } from "./link-card";
import { LinkCardList } from "./link-card-list";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { useStore } from "@/store/useStore";
import { Sparkles } from "lucide-react";
import { INITIAL_LOAD_DELAY } from "@/constants";

const INITIAL_LOAD = 12; // Load 12 cards initially
const LOAD_MORE = 12; // Load 12 more when scrolling

interface LinkGridProps {
  links: Link[];
  isLoading?: boolean;
  isInTrash?: boolean;
  selectedIds?: string[];
  onToggleSelect?: (linkId: string) => void;
  isSelectionModeActive?: boolean;
}

// Skeleton component that matches LinkCard layout
function LinkCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      {/* Thumbnail skeleton */}
      <Skeleton className="h-48 w-full rounded-none" />
      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
      {/* Footer skeleton */}
      <div className="px-4 pb-4 flex items-center justify-between">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
}

export function LinkGrid({ links, isLoading = false, isInTrash = false, selectedIds = [], onToggleSelect, isSelectionModeActive = false }: LinkGridProps) {
  const setAddLinkModalOpen = useStore((state) => state.setAddLinkModalOpen);
  const settings = useStore((state) => state.settings);
  const [displayedLinks, setDisplayedLinks] = useState<Link[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  
  const isListView = settings.viewMode === 'list';

  // Reset displayed links when links change
  useEffect(() => {
    setDisplayedLinks(links.slice(0, INITIAL_LOAD));
  }, [links]);

  // Lazy loading with intersection observer
  useEffect(() => {
    // Don't set up observer if all links are displayed
    if (displayedLinks.length >= links.length) {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      return;
    }

    // Create observer if it doesn't exist
    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            setIsLoadingMore(true);
            // Fast loading for better UX
            setTimeout(() => {
              setDisplayedLinks(prev => {
                const nextIndex = prev.length;
                const nextBatch = links.slice(nextIndex, nextIndex + LOAD_MORE);
                return [...prev, ...nextBatch];
              });
              setIsLoadingMore(false);
            }, INITIAL_LOAD_DELAY);
          }
        },
        { 
          rootMargin: '300px',
          threshold: 0.1 
        }
      );
    }

    // Observe the load more ref
    const currentRef = loadMoreRef.current;
    if (currentRef && observerRef.current) {
      observerRef.current.observe(currentRef);
    }

    return () => {
      // Cleanup: unobserve but keep the observer instance
      if (observerRef.current && currentRef) {
        observerRef.current.unobserve(currentRef);
      }
    };
  }, [displayedLinks.length, links.length, links]);

  if (isLoading) {
    return (
      <div className={isListView ? "flex flex-col gap-4" : "grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"}>
        {Array.from({ length: INITIAL_LOAD }).map((_, i) => (
          <LinkCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (links.length === 0) {
    return (
      <EmptyState
        icon={Sparkles}
        title="No links yet"
        description="Start building your collection by adding your first link. Paste any URL and we'll automatically fetch the title and thumbnail!"
        action={{
          label: "Add Your First Link",
          onClick: () => setAddLinkModalOpen(true),
        }}
      />
    );
  }

  return (
    <>
      <div className={`transition-all duration-300 ease-in-out ${
        isListView 
          ? "flex flex-col gap-4" 
          : "grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      }`}>
        {displayedLinks.map((link) => (
          isListView ? (
            <LinkCardList
              key={link.id}
              link={link}
              isInTrash={isInTrash}
              isSelected={selectedIds.includes(link.id)}
              onToggleSelect={onToggleSelect}
              isSelectionModeActive={isSelectionModeActive}
            />
          ) : (
            <LinkCard
              key={link.id}
              link={link}
              isInTrash={isInTrash}
              isSelected={selectedIds.includes(link.id)}
              onToggleSelect={onToggleSelect}
              isSelectionModeActive={isSelectionModeActive}
            />
          )
        ))}
        
        {/* Loading more skeletons */}
        {isLoadingMore && Array.from({ length: 6 }).map((_, i) => (
          <LinkCardSkeleton key={`loading-${i}`} />
        ))}
      </div>
      
      {/* Intersection observer target */}
      {displayedLinks.length < links.length && !isLoadingMore && (
        <div ref={loadMoreRef} className="h-10 mt-6" />
      )}
    </>
  );
}
