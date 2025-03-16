
import { useState } from "react";
import { useNotes } from "@/context/notes-context";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Tag as TagIcon, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface TagPickerProps {
  noteId: string;
  tags?: string[];
}

export function TagPicker({ noteId, tags = [] }: TagPickerProps) {
  const { tags: allTags, addTagToNote, removeTagFromNote, createTag, deleteTag } = useNotes();
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#3B82F6");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const noteTags = allTags.filter(tag => tags.includes(tag.id));
  const availableTags = allTags.filter(tag => !tags.includes(tag.id));
  
  const handleCreateTag = () => {
    if (newTagName.trim()) {
      const tagId = createTag(newTagName.trim(), newTagColor);
      addTagToNote(noteId, tagId);
      setNewTagName("");
      setNewTagColor("#3B82F6");
      setIsCreateDialogOpen(false);
    }
  };
  
  const handleDeleteTag = () => {
    if (tagToDelete) {
      deleteTag(tagToDelete);
      setTagToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {noteTags.map(tag => (
        <Badge 
          key={tag.id}
          style={{ 
            backgroundColor: tag.color,
            color: isLightColor(tag.color) ? '#000' : '#fff'
          }}
          className="gap-1 cursor-default group"
        >
          {tag.name}
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 p-0 rounded-full hover:bg-black/20"
              onClick={() => removeTagFromNote(noteId, tag.id)}
              title="Remove from note"
            >
              <X size={10} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 p-0 rounded-full hover:bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => {
                setTagToDelete(tag.id);
                setIsDeleteDialogOpen(true);
              }}
              title="Delete tag completely"
            >
              <Trash2 size={10} />
            </Button>
          </div>
        </Badge>
      ))}
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-6 gap-1">
            <TagIcon size={14} />
            <span>Add Tag</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <ScrollArea className="h-[200px]">
            {availableTags.length > 0 ? (
              availableTags.map(tag => (
                <DropdownMenuItem
                  key={tag.id}
                  onClick={() => addTagToNote(noteId, tag.id)}
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: tag.color }}
                    />
                    {tag.name}
                  </div>
                </DropdownMenuItem>
              ))
            ) : (
              <div className="px-2 py-1 text-sm text-muted-foreground">
                No more tags available
              </div>
            )}
          </ScrollArea>
          
          <DropdownMenuSeparator />
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-start px-2 gap-2">
                <Plus size={14} />
                Create New Tag
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Tag</DialogTitle>
                <DialogDescription>
                  Add a new tag to organize your notes
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label htmlFor="tag-name">Tag Name</label>
                  <Input 
                    id="tag-name"
                    value={newTagName} 
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder="Enter tag name"
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="tag-color">Tag Color</label>
                  <div className="flex gap-2">
                    <Input 
                      type="color"
                      id="tag-color"
                      value={newTagColor}
                      onChange={(e) => setNewTagColor(e.target.value)}
                      className="w-12 h-10 p-1"
                    />
                    <div className="flex-1 flex items-center">
                      <Badge 
                        style={{ 
                          backgroundColor: newTagColor,
                          color: isLightColor(newTagColor) ? '#000' : '#fff'
                        }}
                      >
                        {newTagName || "Preview"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTag} disabled={!newTagName.trim()}>
                  Create Tag
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <DropdownMenuSeparator />
          
          {allTags.length > 0 && (
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => {
                if (allTags.length > 0) {
                  setTagToDelete(allTags[0].id);
                  setIsDeleteDialogOpen(true);
                }
              }}
            >
              <Trash2 size={14} className="mr-2" />
              Manage & Delete Tags
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Delete tag confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tag</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this tag and remove it from all notes. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <div className="text-sm font-medium mb-2">Select tag to delete:</div>
            <div className="flex flex-wrap gap-2">
              {allTags.map(tag => (
                <Badge 
                  key={tag.id}
                  style={{ 
                    backgroundColor: tagToDelete === tag.id ? tag.color : 'transparent',
                    color: tagToDelete === tag.id ? (isLightColor(tag.color) ? '#000' : '#fff') : 'inherit',
                    borderColor: tag.color,
                    borderWidth: '1px'
                  }}
                  className="cursor-pointer"
                  onClick={() => setTagToDelete(tag.id)}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
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
    </div>
  );
}

// Helper function to determine if a color is light
function isLightColor(color: string): boolean {
  // Convert hex to RGB
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate perceived brightness
  // https://www.w3.org/TR/AERT/#color-contrast
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  
  // Return true if color is light
  return brightness > 128;
}
