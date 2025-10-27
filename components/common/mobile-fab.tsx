/**
 * @file components/common/mobile-fab.tsx
 * @description Floating Action Button for mobile devices
 * @author LinkVault Team
 * @created 2025-10-18
 * @modified 2025-10-19
 */

"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/store/useStore";

/**
 * Mobile Floating Action Button
 * Displays a fixed button in the bottom-right corner on mobile devices
 * Opens the Add Link modal when clicked
 */
export function MobileFAB() {
  const setAddLinkModalOpen = useStore((state) => state.setAddLinkModalOpen);

  return (
    <Button
      size="lg"
      className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg md:hidden transition-shadow duration-200 hover:shadow-xl"
      onClick={() => setAddLinkModalOpen(true)}
      aria-label="Add new link"
    >
      <Plus className="h-6 w-6" />
      <span className="sr-only">Add Link</span>
    </Button>
  );
}
