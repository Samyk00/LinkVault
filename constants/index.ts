/**
 * @file constants/index.ts
 * @description Application-wide constants and configuration
 * @created 2025-10-18
 */

import { Platform } from '@/types';

export const PLATFORM_CONFIG: Record<Platform, { 
  name: string; 
  color: string; 
  icon: string;
  domains: string[];
}> = {
  youtube: {
    name: 'YouTube',
    color: '#FF0000',
    icon: 'Youtube',
    domains: ['youtube.com', 'youtu.be'],
  },
  twitter: {
    name: 'Twitter',
    color: '#1DA1F2',
    icon: 'Twitter',
    domains: ['twitter.com', 'x.com'],
  },
  instagram: {
    name: 'Instagram',
    color: '#E4405F',
    icon: 'Instagram',
    domains: ['instagram.com'],
  },
  linkedin: {
    name: 'LinkedIn',
    color: '#0077B5',
    icon: 'Linkedin',
    domains: ['linkedin.com'],
  },
  tiktok: {
    name: 'TikTok',
    color: '#000000',
    icon: 'Music',
    domains: ['tiktok.com'],
  },
  github: {
    name: 'GitHub',
    color: '#181717',
    icon: 'Github',
    domains: ['github.com'],
  },
  medium: {
    name: 'Medium',
    color: '#00AB6C',
    icon: 'BookOpen',
    domains: ['medium.com'],
  },
  reddit: {
    name: 'Reddit',
    color: '#FF4500',
    icon: 'MessageCircle',
    domains: ['reddit.com'],
  },
  facebook: {
    name: 'Facebook',
    color: '#1877F2',
    icon: 'Facebook',
    domains: ['facebook.com'],
  },
  other: {
    name: 'Other',
    color: '#6B7280',
    icon: 'Link',
    domains: [],
  },
};

export const STORAGE_KEYS = {
  LINKS: 'linkvault_links',
  FOLDERS: 'linkvault_folders',
  SETTINGS: 'linkvault_settings',
} as const;

export const DEFAULT_SETTINGS = {
  theme: 'system' as const,
  viewMode: 'grid' as const,
};

// Timing constants
export const DEBOUNCE_DELAY = 300; // ms
export const SEARCH_DEBOUNCE_DELAY = 300; // ms
export const METADATA_FETCH_TIMEOUT = 10000; // ms
export const INITIAL_LOAD_DELAY = 150; // ms for lazy loading
