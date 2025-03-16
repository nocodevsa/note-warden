
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useNotes } from "@/context/notes-context";
import { useAuth } from "@/context/auth-context";
import { FolderItem } from "@/components/sidebar/folder-item";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { FolderColorPicker } from "./folder-color-picker";
import { FolderIconPicker } from "./folder-icon-picker";
import {
  ChevronRight,
  ChevronLeft,
  PlusCircle,
  Folder,
  FilePlus,
  LogOut,
  Settings,
  Search,
} from "lucide-react";

export function Sidebar({
  collapsed = false,
  onCollapse,
}: {
  collapsed?: boolean;
  onCollapse?: () => void;
}) {
  const { folders, createFolder, createNote, activeFolderId, setActiveFolderId } = useNotes();
  const { user, logout } = useAuth();
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [selectedColor, setSelectedColor] = useState<string>("#4F46E5");
  const [selectedIcon, setSelectedIcon] = useState<string>("folder");

  const handleCreateFolder = () => {
    const trimmedName = folderName.trim();
    if (!trimmedName) {
      toast.error("Folder name cannot be empty");
      return;
    }

    createFolder({
      name: trimmedName,
      color: selectedColor,
      icon: selectedIcon,
    });

    setIsAddingFolder(false);
    setFolderName("");
    toast.success(`Folder "${trimmedName}" created`);
  };

  const handleCreateNote = () => {
    createNote();
    toast.success("New note created");
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
  };

  return (
    <div
      className={cn(
        "group border-r border-border relative flex flex-col h-full bg-sidebar",
        collapsed ? "w-16" : "w-60"
      )}
    >
      <div className="flex items-center h-16 px-4 border-b border-border">
        <div className="flex items-center flex-1 gap-2">
          {!collapsed && (
            <div className="font-semibold text-lg flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                N
              </div>
              <span>Noteflow</span>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onCollapse}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>

      <div className="flex items-center justify-between p-4">
        <Button
          variant="secondary"
          size="sm"
          className={cn(
            "flex-1 justify-start gap-2",
            collapsed && "justify-center px-0"
          )}
          onClick={handleCreateNote}
        >
          <FilePlus size={16} />
          {!collapsed && <span>New Note</span>}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8", collapsed && "hidden")}
          onClick={() => setIsAddingFolder(true)}
        >
          <PlusCircle size={16} />
        </Button>
      </div>

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="space-y-1 p-2">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "w-full justify-start",
                !activeFolderId ? "bg-accent" : "",
                collapsed && "justify-center px-0"
              )}
              onClick={() => setActiveFolderId(null)}
            >
              <Search
                size={16}
                className={cn("mr-2", collapsed && "mr-0")}
              />
              {!collapsed && <span>All Notes</span>}
            </Button>

            <div className="mt-6">
              {!collapsed && (
                <h3 className="mb-2 px-4 text-xs font-medium text-muted-foreground">
                  FOLDERS
                </h3>
              )}
              <div className="space-y-1">
                {folders.map((folder) => (
                  <FolderItem
                    key={folder.id}
                    folder={folder}
                    collapsed={collapsed}
                    activeFolderId={activeFolderId}
                    onSelectFolder={(id) => setActiveFolderId(id)}
                  />
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>

      <div className="sticky bottom-0 mt-auto border-t border-border p-4">
        <div className="flex flex-col gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn(
              "justify-start gap-2", 
              collapsed && "justify-center px-0"
            )}
          >
            <Settings size={16} />
            {!collapsed && <span>Settings</span>}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn(
              "justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20", 
              collapsed && "justify-center px-0"
            )}
            onClick={handleLogout}
          >
            <LogOut size={16} />
            {!collapsed && <span>Logout</span>}
          </Button>
        </div>
        
        {!collapsed && user && (
          <div className="mt-4 flex items-center gap-2 px-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium truncate">{user.name}</span>
              <span className="text-xs text-muted-foreground truncate">{user.email}</span>
            </div>
          </div>
        )}
      </div>

      <Dialog open={isAddingFolder} onOpenChange={setIsAddingFolder}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label
                htmlFor="folderName"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Folder name
              </label>
              <Input
                id="folderName"
                placeholder="Enter folder name"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Color</label>
              <FolderColorPicker
                selectedColor={selectedColor}
                onChange={setSelectedColor}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Icon</label>
              <FolderIconPicker
                selectedIcon={selectedIcon}
                onChange={setSelectedIcon}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddingFolder(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateFolder}>Create Folder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
