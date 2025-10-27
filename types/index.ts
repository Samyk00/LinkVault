/**
 * @file types/index.ts
 * @description Central type definitions for LinkVault application
 * @created 2025-10-18
 */

export interface Link {
  id: string;
  url: string;
  title: string;
  description: string;
  thumbnail: string;
  platform: Platform;
  folderId: string | null;
  isFavorite: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Folder {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  parentId: string | null;
  isPlatformFolder: boolean;
  platform?: Platform;
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  viewMode: 'grid' | 'list';
}

export type Platform = 
  | 'youtube'
  | 'twitter'
  | 'instagram'
  | 'linkedin'
  | 'tiktok'
  | 'github'
  | 'medium'
  | 'reddit'
  | 'facebook'
  | 'other';

export interface MetadataResponse {
  title: string;
  image: string;
  description: string;
}

export interface SearchFilters {
  query: string;
}
