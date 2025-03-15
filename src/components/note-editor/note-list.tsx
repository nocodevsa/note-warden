
import { useNotes } from "@/context/notes-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Eye, LayoutGrid, Pin, Plus } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useState } from "react";
import { toast } from "sonner";

export function NoteList() {
  const { notes, folders, activeNoteId, activeFolderId, setActiveNoteId, createNote, updateNote } = useNotes();
  const [viewType, setViewType] = useState<"list" | "grid">("list");
  const [draggingNoteId, setDraggingNoteId] = useState<string | null>(null);
  
  let filteredNotes = activeFolderId === null 
    ? notes.filter(note => !note.folderId) 
    : notes.filter(note => note.folderId === activeFolderId);
  
  // Sort notes: pinned first, then by updated date
  filteredNotes = [...filteredNotes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
  
  const activeFolder = folders.find(folder => folder.id === activeFolderId);
  
  const handleDragStart = (e: React.DragEvent, noteId: string) => {
    e.dataTransfer.setData("noteId", noteId);
    setDraggingNoteId(noteId);
  };
  
  const handleDragEnd = () => {
    setDraggingNoteId(null);
  };
  
  return (
    <div className="h-full flex flex-col border-r border-border">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="font-semibold">
          {activeFolderId ? activeFolder?.name : 'All Notes'}
        </h2>
        <div className="flex items-center gap-2">
          <ToggleGroup type="single" value={viewType} onValueChange={(value) => value && setViewType(value as "list" | "grid")}>
            <ToggleGroupItem value="list" aria-label="List view">
              <Eye size={16} />
            </ToggleGroupItem>
            <ToggleGroupItem value="grid" aria-label="Grid view">
              <LayoutGrid size={16} />
            </ToggleGroupItem>
          </ToggleGroup>
          <Button size="sm" onClick={() => createNote(activeFolderId)}>
            <Plus size={16} className="mr-1" /> New
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        {filteredNotes.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground p-4">
            <div className="text-center">
              <p>No notes yet</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => createNote(activeFolderId)}
              >
                <Plus size={16} className="mr-1" /> Create one
              </Button>
            </div>
          </div>
        ) : viewType === "list" ? (
          <div className="space-y-1">
            {filteredNotes.map(note => (
              <div
                key={note.id}
                className={cn(
                  "p-2 rounded-md cursor-pointer",
                  activeNoteId === note.id ? "bg-accent" : "hover:bg-accent/50",
                  draggingNoteId === note.id ? "opacity-50" : "opacity-100",
                  "transition-colors"
                )}
                onClick={() => setActiveNoteId(note.id)}
                draggable
                onDragStart={(e) => handleDragStart(e, note.id)}
                onDragEnd={handleDragEnd}
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium truncate">
                    {note.title || "Untitled Note"}
                  </h3>
                  {note.isPinned && <Pin size={14} className="text-note-accent" />}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {new Date(note.updatedAt).toLocaleDateString()} • 
                  {note.content.length > 60 
                    ? note.content.substring(0, 60).replace(/[#*_~`]/g, '').trim() + '...' 
                    : note.content.replace(/[#*_~`]/g, '').trim() || "No content"}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {filteredNotes.map(note => (
              <div
                key={note.id}
                className={cn(
                  "p-3 rounded-md cursor-pointer border",
                  activeNoteId === note.id ? "bg-accent border-primary" : "hover:bg-accent/50 border-border",
                  draggingNoteId === note.id ? "opacity-50" : "opacity-100",
                  "transition-colors h-32 flex flex-col"
                )}
                onClick={() => setActiveNoteId(note.id)}
                draggable
                onDragStart={(e) => handleDragStart(e, note.id)}
                onDragEnd={handleDragEnd}
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium truncate">
                    {note.title || "Untitled Note"}
                  </h3>
                  {note.isPinned && <Pin size={14} className="text-note-accent flex-shrink-0" />}
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  {new Date(note.updatedAt).toLocaleDateString()}
                </p>
                <p className="text-sm line-clamp-3 text-muted-foreground flex-1">
                  {note.content.replace(/[#*_~`]/g, '').trim() || "No content"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
