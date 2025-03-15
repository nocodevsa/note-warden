
import { useNotes } from "@/context/notes-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Eye, LayoutGrid, Pin, Plus, MoreHorizontal, Calendar } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useState } from "react";
import { format, isThisWeek, isToday, isYesterday, startOfWeek, endOfWeek, isWithinInterval } from "date-fns";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function NoteList() {
  const { notes, folders, activeNoteId, activeFolderId, setActiveNoteId, createNote, updateNote } = useNotes();
  const [viewType, setViewType] = useState<"list" | "grid">("list");
  const [draggingNoteId, setDraggingNoteId] = useState<string | null>(null);
  const [groupBy, setGroupBy] = useState<"none" | "week" | "day">("week");
  
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

  const togglePin = (noteId: string, isPinned: boolean) => {
    updateNote(noteId, { isPinned: !isPinned });
    toast(`Note ${!isPinned ? "pinned" : "unpinned"}`);
  };

  // Group notes by time period
  const groupNotes = () => {
    if (groupBy === "none") return { "All Notes": filteredNotes };
    
    const groups: Record<string, typeof filteredNotes> = {};
    
    if (groupBy === "week") {
      const thisWeek: typeof filteredNotes = [];
      const lastWeek: typeof filteredNotes = [];
      const older: typeof filteredNotes = [];
      
      filteredNotes.forEach(note => {
        const date = new Date(note.updatedAt);
        if (isThisWeek(date)) {
          thisWeek.push(note);
        } else {
          // Check if the note is from the previous week
          const lastWeekStart = startOfWeek(new Date());
          lastWeekStart.setDate(lastWeekStart.getDate() - 7);
          const lastWeekEnd = endOfWeek(lastWeekStart);
          
          if (isWithinInterval(date, { start: lastWeekStart, end: lastWeekEnd })) {
            lastWeek.push(note);
          } else {
            older.push(note);
          }
        }
      });
      
      if (thisWeek.length > 0) groups["This week"] = thisWeek;
      if (lastWeek.length > 0) groups["Last week"] = lastWeek;
      if (older.length > 0) groups["Older"] = older;
    } else if (groupBy === "day") {
      const today: typeof filteredNotes = [];
      const yesterday: typeof filteredNotes = [];
      const older: typeof filteredNotes = [];
      
      filteredNotes.forEach(note => {
        const date = new Date(note.updatedAt);
        if (isToday(date)) {
          today.push(note);
        } else if (isYesterday(date)) {
          yesterday.push(note);
        } else {
          older.push(note);
        }
      });
      
      if (today.length > 0) groups["Today"] = today;
      if (yesterday.length > 0) groups["Yesterday"] = yesterday;
      if (older.length > 0) groups["Older"] = older;
    }
    
    return groups;
  };
  
  const noteGroups = groupNotes();
  
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
          <Button size="sm" onClick={() => createNote(activeFolderId)} className="bg-primary">
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
        ) : (
          <div className="space-y-4">
            {Object.entries(noteGroups).map(([groupName, groupNotes]) => (
              <div key={groupName}>
                {groupBy !== "none" && (
                  <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                    <Calendar size={14} className="mr-1" />
                    {groupName}
                  </h3>
                )}
                
                {viewType === "list" ? (
                  <div className="space-y-1">
                    {groupNotes.map(note => (
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
                          <div className="flex items-center gap-1">
                            {note.isPinned && <Pin size={14} className="text-note-accent" />}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                  <MoreHorizontal size={14} />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => togglePin(note.id, note.isPinned)}>
                                  <Pin size={14} className="mr-2" />
                                  {note.isPinned ? "Unpin note" : "Pin note"}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {format(new Date(note.updatedAt), "MMM d")} • 
                          {note.content.length > 60 
                            ? note.content.substring(0, 60).replace(/[#*_~`]/g, '').trim() + '...' 
                            : note.content.replace(/[#*_~`]/g, '').trim() || "No content"}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {groupNotes.map(note => (
                      <div
                        key={note.id}
                        className={cn(
                          "note-card",
                          activeNoteId === note.id ? "border-primary ring-1 ring-primary" : "",
                          draggingNoteId === note.id ? "opacity-50" : "opacity-100"
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
                          <div className="flex items-center gap-1">
                            {note.isPinned && <Pin size={14} className="text-note-accent" />}
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation();
                                togglePin(note.id, note.isPinned);
                              }}
                            >
                              <MoreHorizontal size={14} />
                            </Button>
                          </div>
                        </div>
                        <p className="note-card-date mb-2">
                          {format(new Date(note.updatedAt), "MMM d, yyyy")}
                        </p>
                        <p className="text-sm line-clamp-3 text-muted-foreground flex-1">
                          {note.content.replace(/[#*_~`]/g, '').trim() || "No content"}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
