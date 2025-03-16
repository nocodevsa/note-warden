
import { useState } from "react";
import { ChevronRight, ChevronDown, FolderIcon, FolderOpen, MoreVertical, Plus, Edit, Trash, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotes } from "@/context/notes-context";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { FolderColorPicker } from "./folder-color-picker";
import { FolderIconPicker } from "./folder-icon-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import * as LucideIcons from "lucide-react";
import { FolderType } from "@/lib/types";

export interface FolderItemProps {
  folder: FolderType;
  collapsed: boolean;
  activeFolderId: string | null;
  onSelectFolder: (id: string) => void;
}

export function FolderItem({ folder, collapsed, activeFolderId, onSelectFolder }: FolderItemProps) {
  const { id, name, color, icon, parentId } = folder;
  const { updateFolder, deleteFolder, createNote, notes, updateNote, folders, createFolder } = useNotes();
  const [isOpen, setIsOpen] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(name);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedColor, setSelectedColor] = useState(color || "");
  const [selectedIcon, setSelectedIcon] = useState(icon || "folder");
  
  const isActive = activeFolderId === id;
  const folderNotes = notes.filter(note => note.folderId === id);
  const hasNotes = folderNotes.length > 0;
  
  // Find child folders
  const childFolders = folders.filter(folder => folder.parentId === id);
  const hasChildren = childFolders.length > 0;

  const handleRename = () => {
    if (newName.trim()) {
      updateFolder(id, { name: newName.trim() });
      setIsRenaming(false);
    }
  };

  const handleCustomize = () => {
    updateFolder(id, { 
      color: selectedColor, 
      icon: selectedIcon 
    });
    setIsCustomizing(false);
    toast.success("Folder customized");
  };

  const handleCreateSubfolder = () => {
    if (newFolderName.trim()) {
      createFolder({
        name: newFolderName.trim(),
        parentId: id
      });
      setNewFolderName("");
      setIsOpen(true); // Open the folder to show the new subfolder
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleRename();
    }
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  
  const handleDragLeave = () => {
    setIsDragOver(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const noteId = e.dataTransfer.getData("noteId");
    if (noteId) {
      // Move note to this folder
      updateNote(noteId, { folderId: id });
      toast(`Note moved to "${name}" folder`);
    }
  };

  // Fix: Properly handle dynamic icon component
  let IconComponent: any = isOpen ? FolderOpen : FolderIcon;
  
  if (icon && Object.prototype.hasOwnProperty.call(LucideIcons, icon)) {
    IconComponent = (LucideIcons as any)[icon];
  }

  return (
    <div>
      <div className="flex items-center group">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "flex h-8 w-8 p-0 mr-1 data-[state=open]:bg-accent", 
            isActive && "bg-accent"
          )}
          onClick={() => (hasNotes || hasChildren) && setIsOpen(!isOpen)}
        >
          {(hasNotes || hasChildren) && (isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
        </Button>
        
        <div 
          className={cn(
            "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm w-full cursor-pointer",
            isActive && "bg-accent", 
            isDragOver && "bg-accent/70 border-2 border-dashed border-primary",
            color && `text-folder-${color}`,
            "hover:bg-accent/50 transition-colors"
          )}
          onClick={() => onSelectFolder(id)}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <IconComponent size={16} className={color ? `text-folder-${color}` : ""} />
          {!collapsed && <span className="flex-grow truncate">{name}</span>}
          
          {!collapsed && (
            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6"
                onClick={(e) => { 
                  e.stopPropagation(); 
                  createNote(id);
                }}
              >
                <Plus size={14} />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical size={14} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsRenaming(true)}>
                    <Edit size={14} className="mr-2" />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsCustomizing(true)}>
                    <Palette size={14} className="mr-2" />
                    Customize
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-destructive focus:text-destructive"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    <Trash size={14} className="mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
      
      {isOpen && !collapsed && (
        <div className="ml-8 pl-2 border-l-2 border-border mt-1">
          {/* Add new subfolder input */}
          <div className="py-1">
            <div className="flex items-center gap-1">
              <Input 
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="New subfolder..."
                size={1}
                className="h-7 text-xs"
                onKeyDown={(e) => e.key === "Enter" && handleCreateSubfolder()}
              />
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7"
                onClick={handleCreateSubfolder}
              >
                <Plus size={14} />
              </Button>
            </div>
          </div>

          {/* Child folders */}
          {childFolders.map(childFolder => (
            <FolderItem 
              key={childFolder.id}
              folder={childFolder}
              collapsed={collapsed}
              activeFolderId={activeFolderId}
              onSelectFolder={onSelectFolder}
            />
          ))}

          {/* Notes in this folder */}
          {folderNotes.map(note => (
            <NoteLink key={note.id} id={note.id} title={note.title} />
          ))}
        </div>
      )}
      
      {/* Dialogs */}
      <Dialog open={isRenaming} onOpenChange={setIsRenaming}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rename Folder</DialogTitle>
          </DialogHeader>
          <Input 
            value={newName} 
            onChange={(e) => setNewName(e.target.value)} 
            autoFocus 
            onKeyDown={handleKeyDown}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenaming(false)}>Cancel</Button>
            <Button onClick={handleRename}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isCustomizing} onOpenChange={setIsCustomizing}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Customize Folder</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="icon" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="icon">Icon</TabsTrigger>
              <TabsTrigger value="color">Color</TabsTrigger>
            </TabsList>
            <TabsContent value="icon" className="pt-4">
              <FolderIconPicker value={selectedIcon} onChange={setSelectedIcon} />
            </TabsContent>
            <TabsContent value="color" className="pt-4">
              <FolderColorPicker value={selectedColor} onChange={setSelectedColor} />
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCustomizing(false)}>Cancel</Button>
            <Button onClick={handleCustomize}>Apply</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the folder "{name}". Notes in this folder will be moved to All Notes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteFolder(id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function NoteLink({ id, title }: { id: string; title: string }) {
  const { activeNoteId, setActiveNoteId } = useNotes();
  const isActive = activeNoteId === id;
  
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("noteId", id);
  };
  
  return (
    <div 
      className={cn(
        "text-sm px-2 py-1 rounded-md cursor-pointer truncate",
        isActive ? "bg-accent font-medium" : "hover:bg-accent/50",
        "transition-colors"
      )}
      onClick={() => setActiveNoteId(id)}
      draggable
      onDragStart={handleDragStart}
    >
      {title || "Untitled Note"}
    </div>
  );
}
