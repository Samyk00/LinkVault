"use client";

/**
 * @file components/providers/store-initializer.tsx
 * @description Initializes store from localStorage on mount
 * @created 2025-10-18
 */

import { useEffect } from 'react';
import { useStore } from '@/store/useStore';

export function StoreInitializer() {
  const loadFromStorage = useStore((state) => state.loadFromStorage);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  return null;
}
