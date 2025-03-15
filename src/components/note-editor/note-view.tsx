
import { useState, useEffect, useRef } from "react";
import { useNotes } from "@/context/notes-context";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { MarkdownRenderer } from "./markdown-renderer";
import { NoteType } from "@/lib/types";
import { Edit, Eye, Save, Trash, Pin, PinOff, ArrowLeft, Image, Link, Bold, Italic, List, Code, Table } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";

export function NoteView() {
  const { notes, activeNoteId, updateNote, isEditing, setIsEditing, deleteNote, togglePinned, setActiveNoteId } = useNotes();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const activeNote = notes.find(note => note.id === activeNoteId) || null;
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
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
    
    // Handle files
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };
  
  const handleFiles = (files: FileList) => {
    // Set editor mode for file uploads
    if (!isEditing) {
      setIsEditing(true);
    }
    
    // Process each file
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        // For images, we'd normally upload to cloud storage
        // For this demo, we'll use a data URL
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            // Insert markdown image syntax at cursor position or at end
            const imageMarkdown = `\n![${file.name}](${e.target.result})\n`;
            
            if (contentTextareaRef.current) {
              const textarea = contentTextareaRef.current;
              const cursorPos = textarea.selectionStart;
              const textBefore = content.substring(0, cursorPos);
              const textAfter = content.substring(textarea.selectionEnd);
              
              setContent(textBefore + imageMarkdown + textAfter);
              
              // Set cursor position after the inserted text
              setTimeout(() => {
                textarea.selectionStart = textarea.selectionEnd = cursorPos + imageMarkdown.length;
                textarea.focus();
              }, 0);
            } else {
              setContent(content + imageMarkdown);
            }
            
            toast.success(`Added image: ${file.name}`);
          }
        };
        reader.readAsDataURL(file);
      } else {
        // For other files, just add a link
        toast.info(`File uploads other than images are not fully supported yet`);
        const fileInfo = `\n[${file.name} (${(file.size / 1024).toFixed(1)} KB)](file-upload)\n`;
        setContent(content + fileInfo);
      }
    });
  };
  
  const insertMarkdownSyntax = (syntax: string, placeholder?: string) => {
    if (!isEditing) {
      setIsEditing(true);
      setTimeout(() => insertMarkdownSyntax(syntax, placeholder), 100);
      return;
    }
    
    if (contentTextareaRef.current) {
      const textarea = contentTextareaRef.current;
      const cursorPos = textarea.selectionStart;
      const selectedText = content.substring(textarea.selectionStart, textarea.selectionEnd);
      const text = selectedText || placeholder || '';
      
      const textBefore = content.substring(0, textarea.selectionStart);
      const textAfter = content.substring(textarea.selectionEnd);
      
      const formattedText = syntax.replace('{}', text);
      setContent(textBefore + formattedText + textAfter);
      
      // Set cursor position appropriately
      setTimeout(() => {
        if (selectedText) {
          // If text was selected, put cursor after the formatted text
          textarea.selectionStart = textarea.selectionEnd = 
            cursorPos + formattedText.length;
        } else {
          // If no text was selected, put cursor where the placeholder is
          const cursorOffset = syntax.indexOf('{}');
          textarea.selectionStart = textarea.selectionEnd = 
            cursorPos + cursorOffset;
        }
        textarea.focus();
      }, 0);
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
    <div 
      className="h-full flex flex-col"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
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
      
      {/* Toolbar for markdown formatting */}
      {isEditing && (
        <div className="flex items-center gap-1 p-1 border-b border-border">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => insertMarkdownSyntax('**{}**', 'bold text')}
            title="Bold"
          >
            <Bold size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => insertMarkdownSyntax('*{}*', 'italic text')}
            title="Italic"
          >
            <Italic size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => insertMarkdownSyntax('\n- {}\n', 'list item')}
            title="Bullet List"
          >
            <List size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => insertMarkdownSyntax('\n```\n{}\n```\n', 'code')}
            title="Code Block"
          >
            <Code size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => insertMarkdownSyntax('\n| Header | Header |\n| ------ | ------ |\n| Cell | Cell |\n', '')}
            title="Table"
          >
            <Table size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => insertMarkdownSyntax('[{}](url)', 'link text')}
            title="Link"
          >
            <Link size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              // Create a file input and trigger click
              const fileInput = document.createElement('input');
              fileInput.type = 'file';
              fileInput.accept = 'image/*';
              fileInput.multiple = true;
              fileInput.onchange = (e) => {
                const files = (e.target as HTMLInputElement).files;
                if (files && files.length > 0) {
                  handleFiles(files);
                }
              };
              fileInput.click();
            }}
            title="Add Image"
          >
            <Image size={16} />
          </Button>
        </div>
      )}
      
      <div className={cn(
        "flex-1 overflow-y-auto", 
        isEditing ? "p-0" : "p-6",
        isDragOver && "bg-accent/20 border-2 border-dashed border-primary"
      )}>
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
      
      {isDragOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/70 pointer-events-none">
          <div className="bg-card p-6 rounded-lg shadow-lg text-center">
            <Image size={48} className="mx-auto mb-2 text-primary" />
            <h3 className="text-lg font-medium">Drop to Upload</h3>
            <p className="text-muted-foreground">Drop images or files here</p>
          </div>
        </div>
      )}
      
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
