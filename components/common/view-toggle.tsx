"use client";

/**
 * @file components/common/view-toggle.tsx
 * @description Toggle between grid and list views
 * @created 2025-10-18
 */

import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/store/useStore";

export function ViewToggle() {
  const viewMode = useStore((state) => state.settings.viewMode);
  const updateSettings = useStore((state) => state.updateSettings);

  return (
    <div className="flex items-center gap-1 rounded-md border p-1">
      <Button
        variant={viewMode === "grid" ? "secondary" : "ghost"}
        size="icon"
        className="h-7 w-7"
        onClick={() => updateSettings({ viewMode: "grid" })}
      >
        <LayoutGrid className="h-4 w-4" />
        <span className="sr-only">Grid view</span>
      </Button>
      <Button
        variant={viewMode === "list" ? "secondary" : "ghost"}
        size="icon"
        className="h-7 w-7"
        onClick={() => updateSettings({ viewMode: "list" })}
      >
        <List className="h-4 w-4" />
        <span className="sr-only">List view</span>
      </Button>
    </div>
  );
}
