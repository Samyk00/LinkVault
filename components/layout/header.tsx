"use client";

/**
 * @file components/layout/header.tsx
 * @description Main application header
 * @created 2025-10-18
 */

import { Plus, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { useStore } from "@/store/useStore";
import { useState } from "react";
import { SettingsModal } from "@/components/modals/settings-modal";

export function Header() {
  const setAddLinkModalOpen = useStore((state) => state.setAddLinkModalOpen);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center gap-4 px-4">
          {/* Mobile Menu Button */}
          <MobileSidebar />

          {/* Logo - Hidden on mobile, shown on desktop */}
          <div className="hidden md:flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="text-lg font-bold">L</span>
            </div>
            <span className="text-lg font-semibold">
              LinkVault
            </span>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Add Link - Hidden on mobile (FAB available) */}
            <Button
              onClick={() => setAddLinkModalOpen(true)}
              className="hidden md:flex gap-2"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Link</span>
            </Button>
            {/* Settings - Mobile and Desktop (Rightmost) */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSettingsOpen(true)}
              aria-label="Settings"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
}
