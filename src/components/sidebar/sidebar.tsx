
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FolderItem } from "./folder-item";
import { cn } from "@/lib/utils";
import { useNotes } from "@/context/notes-context";
import { ChevronLeft, Files, FolderPlus, PanelLeft, Plus, Settings, Star, Tag, History, CloudUpload, Monitor } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { FolderColorPicker } from "./folder-color-picker";
import { FolderIconPicker } from "./folder-icon-picker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SidebarProps {
  collapsed: boolean;
  onCollapse: () => void;
}

export function Sidebar({ collapsed, onCollapse }: SidebarProps) {
  const { folders, notes, createNote, createFolder, activeNoteId, activeFolderId, setActiveFolderId, setActiveNoteId } = useNotes();
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [folderColor, setFolderColor] = useState("");
  const [folderIcon, setFolderIcon] = useState("folder");
  const [syncProvider, setSyncProvider] = useState<string>("none");
  const [activeSidebarTab, setActiveSidebarTab] = useState("folders");
  
  const pinnedNotes = notes.filter(note => note.isPinned);
  const allNotes = activeFolderId === null ? notes.filter(note => !note.folderId) : notes.filter(note => note.folderId === activeFolderId);
  
  // Get root folders (no parent ID)
  const rootFolders = folders.filter(folder => !folder.parentId);

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      const folderId = createFolder(newFolderName.trim());
      
      // Apply customizations
      if (folderColor || folderIcon !== "folder") {
        updateFolder(folderId, newFolderName.trim(), {
          color: folderColor,
          icon: folderIcon
        });
      }
      
      setNewFolderName("");
      setFolderColor("");
      setFolderIcon("folder");
      setIsCreatingFolder(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCreateFolder();
    }
  };

  const handleSyncChange = (provider: string) => {
    setSyncProvider(provider);
    toast.success(`Sync provider changed to ${provider === "none" ? "none" : provider}`);
    // In a real app, we would implement actual sync functionality here
  };

  if (collapsed) {
    return (
      <div className="h-screen w-12 bg-sidebar border-r border-sidebar-border flex flex-col items-center py-4 gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onCollapse}
          aria-label="Expand sidebar"
        >
          <PanelLeft size={20} />
        </Button>
        <Separator className="w-8" />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => createNote()}
          className="mt-2"
          aria-label="Create new note"
        >
          <Plus size={20} />
        </Button>
      </div>
    );
  }

  return (
    <div className="h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-4 flex items-center justify-between">
        <h1 className="font-semibold text-lg text-sidebar-foreground">Note Warden</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={onCollapse}
          aria-label="Collapse sidebar"
        >
          <ChevronLeft size={18} />
        </Button>
      </div>
      
      <div className="p-2 flex gap-2">
        <Button 
          onClick={() => createNote()} 
          className="flex-1"
          variant="default"
        >
          <Plus size={16} className="mr-2" /> New Note
        </Button>
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => setIsCreatingFolder(true)}
          aria-label="Create new folder"
        >
          <FolderPlus size={16} />
        </Button>
      </div>
      
      <Tabs value={activeSidebarTab} onValueChange={setActiveSidebarTab} className="flex-1 flex flex-col">
        <TabsList className="mx-2 mb-1 grid grid-cols-3 h-9">
          <TabsTrigger value="folders" className="text-xs">Folders</TabsTrigger>
          <TabsTrigger value="tags" className="text-xs">Tags</TabsTrigger>
          <TabsTrigger value="recent" className="text-xs">Recent</TabsTrigger>
        </TabsList>
        
        <TabsContent value="folders" className="flex-1 overflow-y-auto px-2 space-y-1">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start text-sm font-medium", 
              activeFolderId === null && !activeNoteId && "bg-sidebar-accent"
            )}
            onClick={() => {
              setActiveFolderId(null);
              setActiveNoteId(null);
            }}
          >
            <Files size={16} className="mr-2" />
            All Notes
          </Button>
          
          {pinnedNotes.length > 0 && (
            <div className="mt-2">
              <div className="flex items-center px-2 mb-1">
                <Star size={14} className="mr-2 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Pinned</span>
              </div>
              <div className="pl-6 space-y-1">
                {pinnedNotes.map(note => (
                  <div 
                    key={note.id}
                    className={cn(
                      "text-sm px-2 py-1 rounded-md cursor-pointer truncate",
                      activeNoteId === note.id ? "bg-sidebar-accent font-medium" : "hover:bg-sidebar-accent/50",
                      "transition-colors"
                    )}
                    onClick={() => setActiveNoteId(note.id)}
                  >
                    {note.title || "Untitled Note"}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-4">
            <div className="text-xs font-medium text-muted-foreground px-2 mb-1">FOLDERS</div>
            {rootFolders.map(folder => (
              <FolderItem
                key={folder.id}
                id={folder.id}
                name={folder.name}
                isActive={activeFolderId === folder.id}
                color={folder.color}
                icon={folder.icon}
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="tags" className="flex-1 overflow-y-auto px-2">
          <div className="text-xs font-medium text-muted-foreground px-2 mb-2">TAGS</div>
          <div className="flex flex-wrap gap-2 p-2">
            <Badge variant="outline" className="bg-folder-red/20 hover:bg-folder-red/30 cursor-pointer">
              Important
            </Badge>
            <Badge variant="outline" className="bg-folder-blue/20 hover:bg-folder-blue/30 cursor-pointer">
              Work
            </Badge>
            <Badge variant="outline" className="bg-folder-green/20 hover:bg-folder-green/30 cursor-pointer">
              Personal
            </Badge>
            <Badge variant="outline" className="bg-folder-purple/20 hover:bg-folder-purple/30 cursor-pointer">
              Ideas
            </Badge>
          </div>
          <div className="p-4 text-center text-muted-foreground text-sm">
            Tags feature coming soon...
          </div>
        </TabsContent>
        
        <TabsContent value="recent" className="flex-1 overflow-y-auto px-2">
          <div className="text-xs font-medium text-muted-foreground px-2 mb-2">RECENTLY EDITED</div>
          <div className="space-y-1">
            {notes.slice(0, 10).map(note => (
              <div 
                key={note.id}
                className={cn(
                  "text-sm px-2 py-1.5 rounded-md cursor-pointer",
                  activeNoteId === note.id ? "bg-sidebar-accent font-medium" : "hover:bg-sidebar-accent/50",
                  "transition-colors"
                )}
                onClick={() => setActiveNoteId(note.id)}
              >
                <div className="flex justify-between items-center">
                  <span className="truncate">{note.title || "Untitled Note"}</span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="p-2 border-t border-sidebar-border flex items-center justify-between">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Settings">
              <Settings size={18} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Settings</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Monitor size={16} className="mr-2" />
              Appearance
            </DropdownMenuItem>
            <DropdownMenuItem>
              <CloudUpload size={16} className="mr-2" />
              Sync Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <History size={16} className="mr-2" />
              Backup &amp; Restore
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Select
          value={syncProvider}
          onValueChange={handleSyncChange}
        >
          <SelectTrigger className="w-[130px] h-9">
            <SelectValue placeholder="Sync: Off" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Sync: Off</SelectItem>
            <SelectItem value="google-drive">Google Drive</SelectItem>
            <SelectItem value="dropbox">Dropbox</SelectItem>
          </SelectContent>
        </Select>
        
        <ThemeToggle />
      </div>
      
      <Dialog open={isCreatingFolder} onOpenChange={setIsCreatingFolder}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <Input 
              placeholder="Folder name" 
              value={newFolderName} 
              onChange={(e) => setNewFolderName(e.target.value)} 
              autoFocus 
              onKeyDown={handleKeyDown}
            />
            
            <Tabs defaultValue="icon" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="icon">Icon</TabsTrigger>
                <TabsTrigger value="color">Color</TabsTrigger>
              </TabsList>
              <TabsContent value="icon" className="pt-4">
                <FolderIconPicker value={folderIcon} onChange={setFolderIcon} />
              </TabsContent>
              <TabsContent value="color" className="pt-4">
                <FolderColorPicker value={folderColor} onChange={setFolderColor} />
              </TabsContent>
            </Tabs>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreatingFolder(false)}>Cancel</Button>
            <Button onClick={handleCreateFolder}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
