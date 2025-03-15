
import { useState, useEffect, useRef } from "react";
import { useNotes } from "@/context/notes-context";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { MarkdownRenderer } from "./markdown-renderer";
import { NoteType } from "@/lib/types";
import { Edit, Eye, Save, Trash, Pin, PinOff, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useIsMobile } from "@/hooks/use-mobile";

export function NoteView() {
  const { notes, activeNoteId, updateNote, isEditing, setIsEditing, deleteNote, togglePinned, setActiveNoteId } = useNotes();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const activeNote = notes.find(note => note.id === activeNoteId) || null;
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const titleInputRef = useRef<HTMLInputElement>(null);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (activeNote) {
      setTitle(activeNote.title);
      setContent(activeNote.content);
    } else {
      setTitle("");
      setContent("");
    }
  }, [activeNote]);

  useEffect(() => {
    if (isEditing && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (activeNoteId) {
      updateNote(activeNoteId, {
        title: title.trim() || "Untitled Note",
        content,
      });
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (activeNoteId) {
      deleteNote(activeNoteId);
      setIsDeleteDialogOpen(false);
    }
  };

  if (!activeNote) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground p-4">
        <div className="text-center max-w-md">
          <h3 className="text-xl font-semibold mb-2">No Note Selected</h3>
          <p>Select a note from the sidebar or create a new one to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between border-b border-border p-4">
        {isMobile && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setActiveNoteId(null)}
            className="mr-2"
          >
            <ArrowLeft size={18} />
          </Button>
        )}
        
        <div className="flex-1 flex items-center">
          {isEditing ? (
            <Input
              ref={titleInputRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Untitled Note"
              className="w-full text-lg font-semibold border-none focus-visible:ring-0 px-0"
            />
          ) : (
            <h1 className="text-xl font-semibold truncate">
              {activeNote.title || "Untitled Note"}
            </h1>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => togglePinned(activeNoteId)}
            aria-label={activeNote.isPinned ? "Unpin note" : "Pin note"}
            title={activeNote.isPinned ? "Unpin note" : "Pin note"}
          >
            {activeNote.isPinned ? <PinOff size={18} /> : <Pin size={18} />}
          </Button>
          
          {isEditing ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSave}
              aria-label="Save"
              title="Save"
            >
              <Save size={18} />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditing(true)}
              aria-label="Edit"
              title="Edit"
            >
              <Edit size={18} />
            </Button>
          )}
          
          {isEditing ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (activeNote) {
                  setTitle(activeNote.title);
                  setContent(activeNote.content);
                }
                setIsEditing(false);
              }}
              aria-label="Cancel"
              title="Cancel"
            >
              <Eye size={18} />
            </Button>
          ) : null}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="text-destructive"
            aria-label="Delete"
            title="Delete"
          >
            <Trash size={18} />
          </Button>
        </div>
      </div>
      
      <div className={cn("flex-1 overflow-y-auto", isEditing ? "p-0" : "p-6")}>
        {isEditing ? (
          <Textarea
            ref={contentTextareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing..."
            className="w-full h-full resize-none border-none rounded-none focus-visible:ring-0 font-mono text-sm p-6"
          />
        ) : (
          <MarkdownRenderer content={content} />
        )}
      </div>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this note.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
