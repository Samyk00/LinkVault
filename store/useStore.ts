/**
 * @file store/useStore.ts
 * @description Zustand store for global application state
 * @created 2025-10-18
 */

import { create } from 'zustand';
import { Link, Folder, AppSettings, SearchFilters } from '@/types';
import { STORAGE_KEYS, DEFAULT_SETTINGS } from '@/constants';
import { storage } from '@/services/storage';
import { PLATFORM_FOLDERS } from '@/constants/folder-icons';

interface AppState {
  // Data
  links: Link[];
  folders: Folder[];
  settings: AppSettings;
  
  // UI State
  isHydrated: boolean; // Track if store has loaded from localStorage
  isAddLinkModalOpen: boolean;
  isCreateFolderModalOpen: boolean;
  selectedFolderId: string | null;
  editingLinkId: string | null;
  editingFolderId: string | null;
  parentFolderId: string | null; // For creating sub-folders
  currentView: 'all' | 'favorites' | 'trash';
  searchFilters: SearchFilters;
  expandedFolders: Set<string>; // Track which folders are expanded
  
  // Actions - Links
  addLink: (link: Omit<Link, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>) => void;
  updateLink: (id: string, updates: Partial<Link>) => void;
  deleteLink: (id: string) => void; // Soft delete (move to trash)
  restoreLink: (id: string) => void; // Restore from trash
  permanentlyDeleteLink: (id: string) => void; // Permanently delete
  toggleFavorite: (id: string) => void;
  
  // Actions - Folders
  addFolder: (folder: Omit<Folder, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateFolder: (id: string, updates: Partial<Folder>) => void;
  deleteFolder: (id: string) => void;
  toggleFolderExpanded: (id: string) => void;
  setParentFolder: (folderId: string | null) => void;
  
  // Actions - Settings
  updateSettings: (settings: Partial<AppSettings>) => void;
  
  // Actions - UI
  setAddLinkModalOpen: (isOpen: boolean) => void;
  setCreateFolderModalOpen: (isOpen: boolean) => void;
  setSelectedFolder: (folderId: string | null) => void;
  setEditingLink: (linkId: string | null) => void;
  setEditingFolder: (folderId: string | null) => void;
  setCurrentView: (view: 'all' | 'favorites' | 'trash') => void;
  setSearchFilters: (filters: Partial<SearchFilters>) => void;
  
  // Actions - Data Management
  loadFromStorage: () => void;
  exportData: () => string;
  importData: (jsonString: string) => boolean;
}

export const useStore = create<AppState>((set, get) => ({
  // Initial State
  links: [],
  folders: [],
  settings: DEFAULT_SETTINGS,
  isHydrated: false,
  isAddLinkModalOpen: false,
  isCreateFolderModalOpen: false,
  selectedFolderId: null,
  editingLinkId: null,
  editingFolderId: null,
  parentFolderId: null,
  currentView: 'all',
  expandedFolders: new Set<string>(),
  searchFilters: {
    query: '',
  },

  // Link Actions
  addLink: (linkData) => {
    const newLink: Link = {
      ...linkData,
      id: crypto.randomUUID(),
      deletedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((state) => {
      const updatedLinks = [...state.links, newLink];
      storage.setItem(STORAGE_KEYS.LINKS, updatedLinks);
      return { links: updatedLinks };
    });
  },

  updateLink: (id, updates) => {
    set((state) => {
      const updatedLinks = state.links.map((link) =>
        link.id === id
          ? { ...link, ...updates, updatedAt: new Date().toISOString() }
          : link
      );
      storage.setItem(STORAGE_KEYS.LINKS, updatedLinks);
      return { links: updatedLinks };
    });
  },

  deleteLink: (id) => {
    // Soft delete - move to trash
    set((state) => {
      const updatedLinks = state.links.map((link) =>
        link.id === id
          ? { ...link, deletedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
          : link
      );
      storage.setItem(STORAGE_KEYS.LINKS, updatedLinks);
      return { links: updatedLinks };
    });
  },

  restoreLink: (id) => {
    set((state) => {
      const updatedLinks = state.links.map((link) =>
        link.id === id
          ? { ...link, deletedAt: null, updatedAt: new Date().toISOString() }
          : link
      );
      storage.setItem(STORAGE_KEYS.LINKS, updatedLinks);
      return { links: updatedLinks };
    });
  },

  permanentlyDeleteLink: (id) => {
    set((state) => {
      const updatedLinks = state.links.filter((link) => link.id !== id);
      storage.setItem(STORAGE_KEYS.LINKS, updatedLinks);
      return { links: updatedLinks };
    });
  },

  toggleFavorite: (id) => {
    set((state) => {
      const updatedLinks = state.links.map((link) =>
        link.id === id
          ? { ...link, isFavorite: !link.isFavorite, updatedAt: new Date().toISOString() }
          : link
      );
      storage.setItem(STORAGE_KEYS.LINKS, updatedLinks);
      return { links: updatedLinks };
    });
  },

  // Folder Actions
  addFolder: (folderData) => {
    const newFolder: Folder = {
      ...folderData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((state) => {
      const updatedFolders = [...state.folders, newFolder];
      storage.setItem(STORAGE_KEYS.FOLDERS, updatedFolders);
      return { folders: updatedFolders };
    });
  },

  updateFolder: (id, updates) => {
    set((state) => {
      const updatedFolders = state.folders.map((folder) =>
        folder.id === id
          ? { ...folder, ...updates, updatedAt: new Date().toISOString() }
          : folder
      );
      storage.setItem(STORAGE_KEYS.FOLDERS, updatedFolders);
      return { folders: updatedFolders };
    });
  },

  deleteFolder: (id) => {
    set((state) => {
      const updatedFolders = state.folders.filter((folder) => folder.id !== id);
      storage.setItem(STORAGE_KEYS.FOLDERS, updatedFolders);
      return { folders: updatedFolders };
    });
  },

  // Settings Actions
  updateSettings: (newSettings) => {
    set((state) => {
      const updatedSettings = { ...state.settings, ...newSettings };
      storage.setItem(STORAGE_KEYS.SETTINGS, updatedSettings);
      return { settings: updatedSettings };
    });
  },

  // UI Actions
  setAddLinkModalOpen: (isOpen) => set({ isAddLinkModalOpen: isOpen }),
  setCreateFolderModalOpen: (isOpen) => set({ isCreateFolderModalOpen: isOpen }),
  setSelectedFolder: (folderId) => set({ selectedFolderId: folderId }),
  setEditingLink: (linkId) => set({ editingLinkId: linkId }),
  setEditingFolder: (folderId) => set({ editingFolderId: folderId }),
  setParentFolder: (folderId) => set({ parentFolderId: folderId }),
  setCurrentView: (view) => set({ currentView: view }),
  toggleFolderExpanded: (id) => set((state) => {
    const newExpanded = new Set(state.expandedFolders);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    return { expandedFolders: newExpanded };
  }),
  setSearchFilters: (filters) =>
    set((state) => ({
      searchFilters: { ...state.searchFilters, ...filters },
    })),

  // Data Management Actions
  loadFromStorage: () => {
    const links = storage.getItem<Link[]>(STORAGE_KEYS.LINKS) || [];
    let folders = storage.getItem<Folder[]>(STORAGE_KEYS.FOLDERS) || [];
    const settings = storage.getItem<AppSettings>(STORAGE_KEYS.SETTINGS) || DEFAULT_SETTINGS;

    // Initialize platform folders if no folders exist
    if (folders.length === 0) {
      folders = PLATFORM_FOLDERS.map((pf, index) => ({
        id: `platform-folder-${index}-${Date.now()}`,
        name: pf.name,
        description: '',
        color: pf.color,
        icon: pf.iconName,
        parentId: null,
        isPlatformFolder: true,
        platform: pf.platform,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      storage.setItem(STORAGE_KEYS.FOLDERS, folders);
    }

    set({ links, folders, settings, isHydrated: true });
  },

  exportData: () => {
    return storage.exportData();
  },

  importData: (jsonString) => {
    const success = storage.importData(jsonString);
    if (success) {
      get().loadFromStorage();
    }
    return success;
  },
}));
