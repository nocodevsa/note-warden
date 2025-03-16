import { useState } from "react";
import { useNotes } from "@/context/notes-context";
import { useAuth } from "@/context/auth-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Cloud, HardDrive, Palette, Settings as SettingsIcon, Tag as TagIcon, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface SettingsDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { 
    tags, 
    deleteTag, 
    googleDriveSettings, 
    updateGoogleDriveSettings, 
    syncWithGoogleDrive,
    defaultNoteBackground,
    setDefaultNoteBackground,
  } = useNotes();
  
  const { user, logout } = useAuth();
  
  const [tagToDelete, setTagToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [gDriveFolderId, setGDriveFolderId] = useState(googleDriveSettings.folderId || "");
  const [isGDriveEnabled, setIsGDriveEnabled] = useState(googleDriveSettings.isEnabled);
  
  const handleDeleteTag = () => {
    if (tagToDelete) {
      deleteTag(tagToDelete);
      setTagToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };
  
  const handleSaveGDriveSettings = () => {
    updateGoogleDriveSettings({
      isEnabled: isGDriveEnabled,
      folderId: gDriveFolderId.trim() || null,
    });
  };
  
  const handleSyncNow = async () => {
    await syncWithGoogleDrive();
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleString();
  };

  const isLightColor = (color: string): boolean => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    
    return brightness > 128;
  };
  
  const getSyncStatusDisplay = () => {
    switch (googleDriveSettings.syncStatus) {
      case "syncing":
        return (
          <div className="flex items-center text-blue-500 gap-1">
            <Clock size={16} className="animate-pulse" />
            <span>Syncing...</span>
          </div>
        );
      case "success":
        return (
          <div className="flex items-center text-green-500 gap-1">
            <CheckCircle size={16} />
            <span>Synced</span>
          </div>
        );
      case "error":
        return (
          <div className="flex items-center text-red-500 gap-1">
            <AlertCircle size={16} />
            <span>Error</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center text-muted-foreground gap-1">
            <Cloud size={16} />
            <span>Idle</span>
          </div>
        );
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your Noteflow experience
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="account" className="mt-4">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="sync">Google Drive</TabsTrigger>
            <TabsTrigger value="tags">Tags</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
          </TabsList>
          
          {/* Account Tab */}
          <TabsContent value="account" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Account Information</h3>
              <div className="grid grid-cols-[100px_1fr] gap-2 items-center">
                <span className="text-sm text-muted-foreground">Name:</span>
                <span>{user?.name}</span>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-2 items-center">
                <span className="text-sm text-muted-foreground">Email:</span>
                <span>{user?.email}</span>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button variant="destructive" onClick={logout}>
                Logout
              </Button>
            </div>
          </TabsContent>
          
          {/* Google Drive Sync Tab */}
          <TabsContent value="sync" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Google Drive Sync</h3>
              <p className="text-sm text-muted-foreground">
                Sync your notes with Google Drive to keep them backed up and accessible across devices.
              </p>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="gdrive-sync" 
                  checked={isGDriveEnabled}
                  onCheckedChange={setIsGDriveEnabled}
                />
                <Label htmlFor="gdrive-sync">Enable Google Drive Sync</Label>
              </div>
              
              {isGDriveEnabled && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="folder-id">Google Drive Folder ID</Label>
                    <div className="flex space-x-2">
                      <Input 
                        id="folder-id"
                        value={gDriveFolderId}
                        onChange={(e) => setGDriveFolderId(e.target.value)}
                        placeholder="Enter Google Drive folder ID"
                        className="flex-1"
                      />
                      <Button 
                        variant="outline"
                        title="How to find your folder ID"
                        onClick={() => {
                          window.open("https://developers.google.com/drive/api/guides/about-files", "_blank");
                        }}
                      >
                        ?
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Create a folder in Google Drive and enter its ID here. You can find the folder ID in the URL when you open the folder.
                    </p>
                  </div>
                  
                  <div className="space-y-3 border rounded-md p-4">
                    <h4 className="text-sm font-medium">Sync Status</h4>
                    
                    <div className="grid grid-cols-[120px_1fr] gap-2 items-center">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <div>{getSyncStatusDisplay()}</div>
                    </div>
                    
                    <div className="grid grid-cols-[120px_1fr] gap-2 items-center">
                      <span className="text-sm text-muted-foreground">Last synced:</span>
                      <span>{formatDate(googleDriveSettings.lastSyncedAt)}</span>
                    </div>
                    
                    {googleDriveSettings.lastError && (
                      <div className="mt-2">
                        <div className="text-sm text-muted-foreground mb-1">Error details:</div>
                        <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950/20 p-2 rounded-md">
                          {googleDriveSettings.lastError}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={handleSaveGDriveSettings}
                      disabled={!gDriveFolderId.trim() && isGDriveEnabled}
                    >
                      Save Settings
                    </Button>
                    <Button 
                      onClick={handleSyncNow}
                      disabled={!isGDriveEnabled || !googleDriveSettings.folderId || googleDriveSettings.syncStatus === "syncing"}
                    >
                      {googleDriveSettings.syncStatus === "syncing" ? "Syncing..." : "Sync Now"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* Tags Tab */}
          <TabsContent value="tags" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Manage Tags</h3>
              <p className="text-sm text-muted-foreground">
                Delete or organize your tags.
              </p>
              
              <div className="border rounded-md p-4">
                <h4 className="text-sm font-medium mb-2">Your Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {tags.length > 0 ? (
                    tags.map(tag => (
                      <Badge 
                        key={tag.id}
                        style={{ 
                          backgroundColor: tag.color,
                          color: isLightColor(tag.color) ? '#000' : '#fff'
                        }}
                        className="cursor-pointer group"
                        onClick={() => {
                          setTagToDelete(tag.id);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        {tag.name}
                        <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          ×
                        </span>
                      </Badge>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground">No tags created yet</div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Appearance</h3>
              
              <div className="space-y-2">
                <Label>Default Note Background</Label>
                <div className="grid grid-cols-6 gap-2">
                  {[
                    "#FFFFFF", // White
                    "#F9F5EB", // Cream
                    "#EFF9F0", // Mint
                    "#EFF1F5", // Light Blue
                    "#F5EFFF", // Lavender
                    "#FFF4E5", // Light Orange
                  ].map(color => (
                    <div 
                      key={color}
                      className={`h-12 rounded-md cursor-pointer transition-all border ${
                        defaultNoteBackground === color ? 'ring-2 ring-primary' : 'hover:ring-1 hover:ring-muted'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setDefaultNoteBackground(color)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
      
      {/* Delete tag confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tag</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this tag and remove it from all notes. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            {tagToDelete && (
              <Badge 
                style={{ 
                  backgroundColor: tags.find(t => t.id === tagToDelete)?.color,
                  color: isLightColor(tags.find(t => t.id === tagToDelete)?.color || "#000") ? '#000' : '#fff'
                }}
                className="text-base px-3 py-1"
              >
                {tags.find(t => t.id === tagToDelete)?.name}
              </Badge>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTagToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteTag}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
