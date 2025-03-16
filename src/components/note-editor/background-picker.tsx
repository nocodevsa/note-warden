
import { useState } from "react";
import { useNotes } from "@/context/notes-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Paintbrush } from "lucide-react";
import { toast } from "sonner";

interface BackgroundPickerProps {
  noteId?: string;
}

const BACKGROUND_COLORS = [
  { name: "White", color: "#FFFFFF" },
  { name: "Soft Gray", color: "#F1F0FB" },
  { name: "Soft Green", color: "#F2FCE2" },
  { name: "Soft Yellow", color: "#FEF7CD" },
  { name: "Soft Orange", color: "#FEC6A1" },
  { name: "Soft Purple", color: "#E5DEFF" },
  { name: "Soft Pink", color: "#FFDEE2" },
  { name: "Soft Peach", color: "#FDE1D3" },
  { name: "Soft Blue", color: "#D3E4FD" },
];

export function BackgroundPicker({ noteId }: BackgroundPickerProps) {
  const { notes, updateNote, defaultNoteBackground, setDefaultNoteBackground } = useNotes();
  const [isOpen, setIsOpen] = useState(false);
  
  const activeNote = noteId ? notes.find(note => note.id === noteId) : null;
  const currentBg = activeNote?.backgroundColor || defaultNoteBackground;
  
  const handleBgChange = (color: string) => {
    if (noteId) {
      updateNote(noteId, { backgroundColor: color });
      toast.success("Note background updated");
    }
    setIsOpen(false);
  };
  
  const setAsDefault = () => {
    if (noteId && activeNote?.backgroundColor) {
      setDefaultNoteBackground(activeNote.backgroundColor);
      toast.success("Set as default background for new notes");
    }
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" title="Change Background">
          <Paintbrush size={18} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="grid grid-cols-3 gap-1 p-2">
          {BACKGROUND_COLORS.map((bg) => (
            <button
              key={bg.color}
              className="w-10 h-10 rounded-md border border-border overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary"
              style={{ backgroundColor: bg.color }}
              onClick={() => handleBgChange(bg.color)}
              title={bg.name}
            />
          ))}
        </div>
        
        {noteId && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={setAsDefault}>
              Set as default
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
