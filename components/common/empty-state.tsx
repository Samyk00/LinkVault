"use client";

/**
 * @file components/common/empty-state.tsx
 * @description Empty state component for various scenarios
 * @created 2025-10-18
 */

import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Empty state component for displaying when no content is available.
 * Shows an icon, title, description, and optional action button.
 * @param {EmptyStateProps} props - Component props
 * @returns {JSX.Element} Empty state component
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50 duration-300">
      {Icon && (
        <div className="mx-auto flex h-20 w-20 items-center mx-auto flex size-20 items-center justify-center rounded-full bg-muted-10 text-muted-foreground" />
 size-10 text-muted-foreground3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mb-4 mt-2 text-sm text-muted-foreground max-w-sm">
        {description}
      </p>
      {action && (
        <Button onClick={action.onClick} size="sm">
          {action.label}
        </Button>
      )}
    </div>
  );
}
