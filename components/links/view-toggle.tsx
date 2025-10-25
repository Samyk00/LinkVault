/**
 * @file components/links/view-toggle.tsx
 * @description Toggle component for switching between grid and list view
 * @created 2025-10-18
 */

"use client";

import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/store/useStore";

/**
 * View mode toggle button
 * Switches between grid and list view with smooth animations
 * State is persisted in localStorage via AppSettings
 * 
 * @example
 * <ViewToggle />
 */
export function ViewToggle() {
  const settings = useStore((state) => state.settings);
  const updateSettings = useStore((state) => state.updateSettings);

  const isGridView = settings.viewMode === 'grid';

  const handleToggle = (mode: 'grid' | 'list') => {
    updateSettings({ viewMode: mode });
  };

  return (
    <div 
      className="flex items-center gap-1 rounded-md border p-1 bg-background"
      role="group"
      aria-label="View mode selector"
    >
      <Button
        variant={isGridView ? 'secondary' : 'ghost'}
        size="icon"
        className="h-8 w-8"
        onClick={() => handleToggle('grid')}
        aria-label="Grid view"
        aria-pressed={isGridView}
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
      <Button
        variant={!isGridView ? 'secondary' : 'ghost'}
        size="icon"
        className="h-8 w-8"
        onClick={() => handleToggle('list')}
        aria-label="List view"
        aria-pressed={!isGridView}
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  );
}
