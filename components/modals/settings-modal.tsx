"use client";

/**
 * @file components/modals/settings-modal.tsx
 * @description Settings modal with export/import functionality
 * @created 2025-10-18
 */

import * as React from "react";
import { Download, Upload, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { useStore } from "@/store/useStore";
import { useToast } from "@/hooks/use-toast";
import { storage } from "@/services/storage";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const links = useStore((state) => state.links);
  const folders = useStore((state) => state.folders);
  const importData = useStore((state) => state.importData);
  const exportData = useStore((state) => state.exportData);
  const { toast } = useToast();

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleExport = () => {
    try {
      const data = exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `linkvault-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Export successful",
        description: "Your data has been exported successfully.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonString = e.target?.result as string;
        const success = importData(jsonString);

        if (success) {
          toast({
            title: "Import successful",
            description: "Your data has been imported successfully.",
          });
          onClose();
        } else {
          throw new Error('Import failed');
        }
      } catch (error) {
        toast({
          title: "Import failed",
          description: "Invalid backup file. Please check the file and try again.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to delete all data? This action cannot be undone.')) {
      storage.clear();
      window.location.reload();
    }
  };

  // Calculate storage size properly
  const storageSize = storage.getStorageSize();
  const storageKB = storageSize / 1024;
  const storageMB = storageSize / (1024 * 1024);
  
  const formattedStorage = storageMB >= 1 
    ? `${storageMB.toFixed(2)} MB` 
    : `${storageKB.toFixed(2)} KB`;
  
  // Count only user-created folders (exclude platform folders that are auto-created)
  const userCreatedFolders = folders.filter(f => !f.isPlatformFolder).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Manage your LinkVault settings and data.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full flex flex-col flex-1 min-h-0">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Appearance</CardTitle>
                <CardDescription>
                  Customize your theme
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Theme</span>
                  <ThemeToggle />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data" className="space-y-4 overflow-y-auto pr-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Storage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Links</p>
                    <p className="text-2xl font-bold">{links.length}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Folders</p>
                    <p className="text-2xl font-bold">{userCreatedFolders}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Storage</p>
                    <p className="text-2xl font-bold">{formattedStorage}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Backup & Restore</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button onClick={handleExport} className="gap-2">
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Import
                  </Button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/json"
                  onChange={handleImport}
                  className="hidden"
                />
              </CardContent>
            </Card>

            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
                <CardDescription>
                  Irreversible actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleClearData}
                  variant="destructive"
                  className="w-full gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear All Data
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
