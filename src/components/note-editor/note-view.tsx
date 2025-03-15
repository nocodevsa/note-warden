
import { useState, useEffect, useRef } from "react";
import { useNotes } from "@/context/notes-context";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { MarkdownRenderer } from "./markdown-renderer";
import { Edit, Eye, Save, Trash, Pin, PinOff, ArrowLeft, Image, Link, Bold, Italic, List, Code, Table, Lock, Globe, History, ExternalLink, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface NoteViewProps {
  noteId?: string;
}

export function NoteView({ noteId }: NoteViewProps) {
  const { notes, updateNote, isEditing, setIsEditing, deleteNote, togglePinned, setActiveNoteId } = useNotes();
  const activeNoteId = noteId || notes[0]?.id;
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isVersionDialogOpen, setIsVersionDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  
  const activeNote = notes.find(note => note.id === activeNoteId) || null;
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);
  
  const titleInputRef = useRef<HTMLInputElement>(null);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (activeNote) {
      setTitle(activeNote.title);
      setContent(activeNote.content);
      setIsPasswordProtected(activeNote.isPasswordProtected || false);
      setIsPublic(activeNote.isPublic || false);
    } else {
      setTitle("");
      setContent("");
      setIsPasswordProtected(false);
      setIsPublic(false);
    }
  }, [activeNote]);

  useEffect(() => {
    if (isEditing && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (activeNoteId) {
      // Generate a version if content changed
      let versions = activeNote?.previousVersions || [];
      let newVersion = activeNote?.version || 1;

      if (content !== activeNote?.content) {
        newVersion++;
        versions = [
          ...(versions || []),
          {
            content: activeNote?.content || "",
            updatedAt: activeNote?.updatedAt || new Date().toISOString(),
            version: activeNote?.version || 1
          }
        ];
      }

      updateNote(activeNoteId, {
        title: title.trim() || "Untitled Note",
        content,
        version: newVersion,
        previousVersions: versions
      });
      setIsEditing(false);
      toast.success("Note saved");
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

  const handlePasswordProtect = () => {
    if (activeNoteId) {
      updateNote(activeNoteId, {
        isPasswordProtected,
        password: isPasswordProtected ? password : undefined
      });
      setIsPasswordDialogOpen(false);
      toast.success(isPasswordProtected ? "Note password protected" : "Password protection removed");
    }
  };

  const handleShareNote = () => {
    if (activeNoteId) {
      const publicLink = isPublic ? `${window.location.origin}/share/${activeNoteId}` : undefined;
      updateNote(activeNoteId, {
        isPublic,
        publicLink
      });
      setIsShareDialogOpen(false);
      
      if (isPublic && publicLink) {
        navigator.clipboard.writeText(publicLink);
        toast.success("Public link copied to clipboard");
      } else {
        toast.success("Note is now private");
      }
    }
  };

  const handleRestoreVersion = () => {
    if (activeNoteId && selectedVersion && activeNote?.previousVersions) {
      const version = activeNote.previousVersions.find(v => v.version === selectedVersion);
      if (version) {
        setContent(version.content);
        setIsVersionDialogOpen(false);
        setIsEditing(true);
        toast.success(`Restored version ${selectedVersion}`);
      }
    }
  };

  const handleExportNote = (format: string) => {
    if (!activeNote) return;
    
    let exportContent = '';
    let mimeType = 'text/plain';
    let fileExtension = 'txt';
    
    switch (format) {
      case 'markdown':
        exportContent = activeNote.content;
        fileExtension = 'md';
        break;
      case 'html':
        exportContent = `<!DOCTYPE html>
<html>
<head>
  <title>${activeNote.title}</title>
  <meta charset="utf-8">
  <style>
    body { font-family: system-ui, sans-serif; line-height: 1.5; max-width: 800px; margin: 0 auto; padding: 2rem; }
    img { max-width: 100%; }
    pre { background: #f5f5f5; padding: 1rem; overflow-x: auto; }
    blockquote { border-left: 4px solid #ddd; margin-left: 0; padding-left: 1rem; color: #666; }
  </style>
</head>
<body>
  <h1>${activeNote.title}</h1>
  <div class="content">
    ${activeNote.content}
  </div>
</body>
</html>`;
        mimeType = 'text/html';
        fileExtension = 'html';
        break;
      case 'json':
        exportContent = JSON.stringify({
          title: activeNote.title,
          content: activeNote.content,
          createdAt: activeNote.createdAt,
          updatedAt: activeNote.updatedAt
        }, null, 2);
        mimeType = 'application/json';
        fileExtension = 'json';
        break;
      default:
        exportContent = activeNote.content.replace(/[#*_~`]/g, '');
    }
    
    const blob = new Blob([exportContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeNote.title || 'Untitled'}.${fileExtension}`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    setIsExportDialogOpen(false);
    toast.success(`Note exported as ${format.toUpperCase()}`);
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
              {activeNote.isPasswordProtected && <Lock size={14} className="inline-block ml-2 text-muted-foreground" />}
              {activeNote.isPublic && <Globe size={14} className="inline-block ml-2 text-muted-foreground" />}
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
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <ExternalLink size={18} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsShareDialogOpen(true)}>
                <Globe size={16} className="mr-2" />
                Share Note
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsPasswordDialogOpen(true)}>
                <Lock size={16} className="mr-2" />
                Password Protect
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsExportDialogOpen(true)}>
                <Download size={16} className="mr-2" />
                Export Note
              </DropdownMenuItem>
              {(activeNote.previousVersions?.length || 0) > 0 && (
                <DropdownMenuItem onClick={() => setIsVersionDialogOpen(true)}>
                  <History size={16} className="mr-2" />
                  Version History
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          
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
        <div className="flex items-center gap-1 p-1 border-b border-border overflow-x-auto">
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
      
      {/* Password Protection Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Password Protection</DialogTitle>
            <DialogDescription>
              Protect your note with a password to keep it secure.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex items-center space-x-2 py-4">
            <Switch 
              id="password-protection" 
              checked={isPasswordProtected}
              onCheckedChange={setIsPasswordProtected}
            />
            <Label htmlFor="password-protection">Enable password protection</Label>
          </div>
          
          {isPasswordProtected && (
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              autoComplete="new-password"
            />
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>Cancel</Button>
            <Button onClick={handlePasswordProtect} disabled={isPasswordProtected && !password}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Share Note Dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Share Note</DialogTitle>
            <DialogDescription>
              Make your note publicly accessible with a shareable link.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex items-center space-x-2 py-4">
            <Switch 
              id="public-note" 
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
            <Label htmlFor="public-note">Make note public</Label>
          </div>
          
          {isPublic && activeNote.publicLink && (
            <div className="flex gap-2">
              <Input 
                value={activeNote.publicLink} 
                readOnly
                className="flex-1"
              />
              <Button 
                variant="outline" 
                onClick={() => {
                  navigator.clipboard.writeText(activeNote.publicLink || "");
                  toast.success("Link copied to clipboard");
                }}
              >
                Copy
              </Button>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsShareDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleShareNote}>
              {isPublic ? "Update Sharing" : "Make Private"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Version History Dialog */}
      <Dialog open={isVersionDialogOpen} onOpenChange={setIsVersionDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Version History</DialogTitle>
            <DialogDescription>
              View and restore previous versions of this note.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Select
              value={selectedVersion?.toString() || ""}
              onValueChange={(value) => setSelectedVersion(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a version" />
              </SelectTrigger>
              <SelectContent>
                {activeNote.previousVersions?.map((version) => (
                  <SelectItem key={version.version} value={version.version.toString()}>
                    Version {version.version} - {new Date(version.updatedAt).toLocaleString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsVersionDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleRestoreVersion} disabled={!selectedVersion}>
              Restore Version
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Export Note Dialog */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Export Note</DialogTitle>
            <DialogDescription>
              Export your note in different formats.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4 py-4">
            <Button variant="outline" onClick={() => handleExportNote('markdown')}>
              Markdown (.md)
            </Button>
            <Button variant="outline" onClick={() => handleExportNote('html')}>
              HTML (.html)
            </Button>
            <Button variant="outline" onClick={() => handleExportNote('txt')}>
              Text (.txt)
            </Button>
            <Button variant="outline" onClick={() => handleExportNote('json')}>
              JSON (.json)
            </Button>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExportDialogOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
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
