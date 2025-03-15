
import { useEffect, useState } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useNotes } from "@/context/notes-context";
import { Pin } from "lucide-react";

export function SearchCommand() {
  const [open, setOpen] = useState(false);
  const { notes, folders, setActiveNoteId, setActiveFolderId } = useNotes();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = (id: string, type: "note" | "folder") => {
    if (type === "note") {
      setActiveNoteId(id);
    } else {
      setActiveFolderId(id);
      setActiveNoteId(null);
    }
    setOpen(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search notes and folders..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        <CommandGroup heading="Notes">
          {notes.map((note) => (
            <CommandItem
              key={note.id}
              onSelect={() => handleSelect(note.id, "note")}
            >
              <div className="flex items-center gap-2 w-full truncate">
                <span className="truncate">{note.title || "Untitled Note"}</span>
                {note.isPinned && <Pin size={14} className="text-note-accent" />}
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
        
        <CommandGroup heading="Folders">
          {folders.map((folder) => (
            <CommandItem
              key={folder.id}
              onSelect={() => handleSelect(folder.id, "folder")}
            >
              {folder.name}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
