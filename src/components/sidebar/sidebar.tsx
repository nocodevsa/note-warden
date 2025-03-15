
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FolderItem } from "./folder-item";
import { cn } from "@/lib/utils";
import { useNotes } from "@/context/notes-context";
import { ChevronLeft, Files, FolderPlus, PanelLeft, Plus, Settings, Star } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";

interface SidebarProps {
  collapsed: boolean;
  onCollapse: () => void;
}

export function Sidebar({ collapsed, onCollapse }: SidebarProps) {
  const { folders, notes, createNote, createFolder, activeNoteId, activeFolderId, setActiveFolderId, setActiveNoteId } = useNotes();
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  
  const pinnedNotes = notes.filter(note => note.isPinned);
  const allNotes = activeFolderId === null ? notes.filter(note => !note.folderId) : notes.filter(note => note.folderId === activeFolderId);

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      createFolder(newFolderName.trim());
      setNewFolderName("");
      setIsCreatingFolder(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCreateFolder();
    }
  };

  if (collapsed) {
    return (
      <div className="h-screen w-12 bg-sidebar border-r border-border flex flex-col items-center py-4 gap-4">
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
    <div className="h-screen w-64 bg-sidebar border-r border-border flex flex-col">
      <div className="p-4 flex items-center justify-between">
        <h1 className="font-semibold text-lg">Note Warden</h1>
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
      
      <div className="flex-1 overflow-y-auto px-2">
        <div className="mb-2">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start text-sm font-medium", 
              activeFolderId === null && !activeNoteId && "bg-accent"
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
                      activeNoteId === note.id ? "bg-accent font-medium" : "hover:bg-accent/50",
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
        </div>
        
        <div className="mt-4">
          <div className="text-xs font-medium text-muted-foreground px-2 mb-1">FOLDERS</div>
          {folders.map(folder => (
            <FolderItem
              key={folder.id}
              id={folder.id}
              name={folder.name}
              isActive={activeFolderId === folder.id}
            />
          ))}
        </div>
      </div>
      
      <div className="p-2 border-t border-border flex items-center justify-between">
        <Button variant="ghost" size="icon" aria-label="Settings">
          <Settings size={18} />
        </Button>
        <ThemeToggle />
      </div>
      
      <Dialog open={isCreatingFolder} onOpenChange={setIsCreatingFolder}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <Input 
            placeholder="Folder name" 
            value={newFolderName} 
            onChange={(e) => setNewFolderName(e.target.value)} 
            autoFocus 
            onKeyDown={handleKeyDown}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreatingFolder(false)}>Cancel</Button>
            <Button onClick={handleCreateFolder}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
