
import { useState } from "react";
import { ChevronRight, ChevronDown, Folder, FolderOpen, MoreVertical, Plus, Edit, Trash } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotes } from "@/context/notes-context";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface FolderItemProps {
  id: string;
  name: string;
  isActive: boolean;
}

export function FolderItem({ id, name, isActive }: FolderItemProps) {
  const { setActiveFolderId, updateFolder, deleteFolder, createNote, notes } = useNotes();
  const [isOpen, setIsOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(name);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const folderNotes = notes.filter(note => note.folderId === id);
  const hasNotes = folderNotes.length > 0;

  const handleRename = () => {
    if (newName.trim()) {
      updateFolder(id, newName.trim());
      setIsRenaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleRename();
    }
  };

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
          onClick={() => hasNotes && setIsOpen(!isOpen)}
        >
          {hasNotes && (isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
        </Button>
        
        <div 
          className={cn(
            "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm w-full cursor-pointer",
            isActive && "bg-accent", 
            "hover:bg-accent/50 transition-colors"
          )}
          onClick={() => setActiveFolderId(id)}
        >
          {isOpen ? <FolderOpen size={16} /> : <Folder size={16} />}
          <span className="flex-grow truncate">{name}</span>
          
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
        </div>
      </div>
      
      {isOpen && hasNotes && (
        <div className="ml-8 pl-2 border-l-2 border-border mt-1">
          {folderNotes.map(note => (
            <NoteLink key={note.id} id={note.id} title={note.title} />
          ))}
        </div>
      )}
      
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
  
  return (
    <div 
      className={cn(
        "text-sm px-2 py-1 rounded-md cursor-pointer truncate",
        isActive ? "bg-accent font-medium" : "hover:bg-accent/50",
        "transition-colors"
      )}
      onClick={() => setActiveNoteId(id)}
    >
      {title || "Untitled Note"}
    </div>
  );
}
