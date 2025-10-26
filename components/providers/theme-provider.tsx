"use client";

/**
 * @file components/providers/theme-provider.tsx
 * @description Theme provider for dark/light mode
 * @created 2025-10-18
 */

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children, ...props }: any) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
