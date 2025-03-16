
import { createContext, useContext, useEffect, useState } from "react";
import { FolderType, NoteType, TagType } from "@/lib/types";
import { sampleFolders, sampleNotes } from "@/lib/sample-data";
import { toast } from "sonner";

type NotesContextType = {
  notes: NoteType[];
  folders: FolderType[];
  tags: TagType[];
  activeNoteId: string | null;
  activeFolderId: string | null;
  isEditing: boolean;
  noteHistory: { past: NoteType[], future: NoteType[] };
  selectedNoteIds: string[];
  defaultNoteBackground: string;
  setActiveNoteId: (id: string | null) => void;
  setActiveFolderId: (id: string | null) => void;
  setIsEditing: (isEditing: boolean) => void;
  createNote: (folderId?: string | null) => void;
  updateNote: (id: string, updates: Partial<Omit<NoteType, "id">>) => void;
  deleteNote: (id: string) => void;
  deleteMultipleNotes: (ids: string[]) => void;
  createFolder: (name: string, parentId?: string | null) => string;
  updateFolder: (id: string, name: string, updates?: Partial<Omit<FolderType, "id" | "name" | "createdAt">>) => void;
  deleteFolder: (id: string) => void;
  togglePinned: (id: string) => void;
  addAttachment: (noteId: string, attachmentUrl: string) => void;
  removeAttachment: (noteId: string, attachmentUrl: string) => void;
  exportNote: (id: string, format: "markdown" | "txt" | "pdf") => void;
  createTag: (name: string, color: string) => string;
  updateTag: (id: string, updates: Partial<Omit<TagType, "id">>) => void;
  deleteTag: (id: string) => void;
  addTagToNote: (noteId: string, tagId: string) => void;
  removeTagFromNote: (noteId: string, tagId: string) => void;
  undoNoteChange: () => void;
  redoNoteChange: () => void;
  toggleNoteSelection: (id: string) => void;
  clearNoteSelection: () => void;
  setDefaultNoteBackground: (color: string) => void;
};

const NotesContext = createContext<NotesContextType | undefined>(undefined);

const DEFAULT_TAGS: TagType[] = [
  { id: "tag1", name: "Important", color: "#EF4444" },
  { id: "tag2", name: "Personal", color: "#3B82F6" },
  { id: "tag3", name: "Work", color: "#10B981" },
];

export const NotesProvider = ({ children }: { children: React.ReactNode }) => {
  const [notes, setNotes] = useState<NoteType[]>(() => {
    const savedNotes = localStorage.getItem("notes");
    return savedNotes ? JSON.parse(savedNotes) : sampleNotes;
  });
  
  const [folders, setFolders] = useState<FolderType[]>(() => {
    const savedFolders = localStorage.getItem("folders");
    return savedFolders ? JSON.parse(savedFolders) : sampleFolders;
  });
  
  const [tags, setTags] = useState<TagType[]>(() => {
    const savedTags = localStorage.getItem("tags");
    return savedTags ? JSON.parse(savedTags) : DEFAULT_TAGS;
  });
  
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [noteHistory, setNoteHistory] = useState<{ past: NoteType[], future: NoteType[] }>({ past: [], future: [] });
  const [selectedNoteIds, setSelectedNoteIds] = useState<string[]>([]);
  const [defaultNoteBackground, setDefaultNoteBackground] = useState<string>(() => {
    const savedBg = localStorage.getItem("defaultNoteBackground");
    return savedBg || "#F1F0FB"; // Default soft gray
  });

  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem("folders", JSON.stringify(folders));
  }, [folders]);
  
  useEffect(() => {
    localStorage.setItem("tags", JSON.stringify(tags));
  }, [tags]);
  
  useEffect(() => {
    localStorage.setItem("defaultNoteBackground", defaultNoteBackground);
  }, [defaultNoteBackground]);

  const createNote = (folderId?: string | null) => {
    const newNote: NoteType = {
      id: `n${Date.now()}`,
      title: "Untitled Note",
      content: "",
      folderId: folderId !== undefined ? folderId : activeFolderId,
      isPinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      attachments: [],
      backgroundColor: defaultNoteBackground,
      tags: []
    };
    
    setNotes(prev => [newNote, ...prev]);
    setActiveNoteId(newNote.id);
    setIsEditing(true);
    toast.success("New note created");
    return newNote.id;
  };

  const updateNote = (id: string, updates: Partial<Omit<NoteType, "id">>) => {
    // Add current note to history before updating
    const currentNote = notes.find(note => note.id === id);
    if (currentNote) {
      setNoteHistory(prev => ({
        past: [...prev.past, {...currentNote}],
        future: []
      }));
    }
    
    setNotes(prev => prev.map(note => 
      note.id === id 
        ? { ...note, ...updates, updatedAt: new Date().toISOString() } 
        : note
    ));
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
    if (activeNoteId === id) {
      setActiveNoteId(null);
    }
    // Remove from selection if present
    setSelectedNoteIds(prev => prev.filter(noteId => noteId !== id));
    toast.success("Note deleted");
  };
  
  const deleteMultipleNotes = (ids: string[]) => {
    setNotes(prev => prev.filter(note => !ids.includes(note.id)));
    if (activeNoteId && ids.includes(activeNoteId)) {
      setActiveNoteId(null);
    }
    setSelectedNoteIds([]);
    toast.success(`${ids.length} notes deleted`);
  };

  const createFolder = (name: string, parentId?: string | null) => {
    const newFolder: FolderType = {
      id: `f${Date.now()}`,
      name,
      parentId: parentId || null,
      createdAt: new Date().toISOString(),
    };
    setFolders(prev => [...prev, newFolder]);
    toast.success("Folder created");
    return newFolder.id;
  };

  const updateFolder = (id: string, name: string, updates?: Partial<Omit<FolderType, "id" | "name" | "createdAt">>) => {
    setFolders(prev => prev.map(folder => 
      folder.id === id ? { ...folder, name, ...updates } : folder
    ));
    toast.success("Folder updated");
  };

  const deleteFolder = (id: string) => {
    setFolders(prev => prev.filter(folder => folder.id !== id));
    setNotes(prev => prev.map(note => 
      note.folderId === id ? { ...note, folderId: null } : note
    ));
    if (activeFolderId === id) {
      setActiveFolderId(null);
    }
    toast.success("Folder deleted");
  };

  const togglePinned = (id: string) => {
    setNotes(prev => prev.map(note => 
      note.id === id ? { ...note, isPinned: !note.isPinned } : note
    ));
  };
  
  const addAttachment = (noteId: string, attachmentUrl: string) => {
    setNotes(prev => prev.map(note => {
      if (note.id === noteId) {
        const attachments = note.attachments || [];
        return {
          ...note,
          attachments: [...attachments, attachmentUrl],
          updatedAt: new Date().toISOString()
        };
      }
      return note;
    }));
  };
  
  const removeAttachment = (noteId: string, attachmentUrl: string) => {
    setNotes(prev => prev.map(note => {
      if (note.id === noteId && note.attachments) {
        return {
          ...note,
          attachments: note.attachments.filter(url => url !== attachmentUrl),
          updatedAt: new Date().toISOString()
        };
      }
      return note;
    }));
  };
  
  const exportNote = (id: string, format: "markdown" | "txt" | "pdf") => {
    const note = notes.find(n => n.id === id);
    if (!note) return;
    
    if (format === "markdown" || format === "txt") {
      // Create a blob with the content
      const content = format === "markdown" 
        ? note.content 
        : note.content.replace(/[#*_~`]/g, ''); // Strip markdown for txt
      
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      
      // Create a link and trigger download
      const a = document.createElement("a");
      a.href = url;
      a.download = `${note.title || "Untitled Note"}.${format}`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(`Note exported as ${format.toUpperCase()}`);
    } else if (format === "pdf") {
      toast.info("PDF export is not implemented in this demo");
      // Would normally use a library like jsPDF here
    }
  };
  
  // Tag functionality
  const createTag = (name: string, color: string) => {
    const newTag: TagType = {
      id: `tag-${Date.now()}`,
      name,
      color
    };
    setTags(prev => [...prev, newTag]);
    toast.success(`Tag "${name}" created`);
    return newTag.id;
  };
  
  const updateTag = (id: string, updates: Partial<Omit<TagType, "id">>) => {
    setTags(prev => prev.map(tag => 
      tag.id === id ? { ...tag, ...updates } : tag
    ));
    toast.success("Tag updated");
  };
  
  const deleteTag = (id: string) => {
    setTags(prev => prev.filter(tag => tag.id !== id));
    // Remove tag from all notes that have it
    setNotes(prev => prev.map(note => ({
      ...note,
      tags: note.tags?.filter(tagId => tagId !== id) || []
    })));
    toast.success("Tag deleted");
  };
  
  const addTagToNote = (noteId: string, tagId: string) => {
    setNotes(prev => prev.map(note => {
      if (note.id === noteId) {
        const tags = note.tags || [];
        if (!tags.includes(tagId)) {
          return {
            ...note,
            tags: [...tags, tagId],
            updatedAt: new Date().toISOString()
          };
        }
      }
      return note;
    }));
  };
  
  const removeTagFromNote = (noteId: string, tagId: string) => {
    setNotes(prev => prev.map(note => {
      if (note.id === noteId && note.tags) {
        return {
          ...note,
          tags: note.tags.filter(id => id !== tagId),
          updatedAt: new Date().toISOString()
        };
      }
      return note;
    }));
  };
  
  // Undo/Redo functionality
  const undoNoteChange = () => {
    if (noteHistory.past.length === 0) return;
    
    const previous = noteHistory.past[noteHistory.past.length - 1];
    const current = notes.find(note => note.id === previous.id);
    
    if (current) {
      // Move current state to future
      setNoteHistory(prev => ({
        past: prev.past.slice(0, -1),
        future: [{ ...current }, ...prev.future]
      }));
      
      // Restore previous state
      setNotes(prev => prev.map(note => 
        note.id === previous.id ? { ...previous } : note
      ));
      
      toast.info("Undid last change");
    }
  };
  
  const redoNoteChange = () => {
    if (noteHistory.future.length === 0) return;
    
    const next = noteHistory.future[0];
    const current = notes.find(note => note.id === next.id);
    
    if (current) {
      // Move current state to past
      setNoteHistory(prev => ({
        past: [...prev.past, { ...current }],
        future: prev.future.slice(1)
      }));
      
      // Apply future state
      setNotes(prev => prev.map(note => 
        note.id === next.id ? { ...next } : note
      ));
      
      toast.info("Redid last change");
    }
  };
  
  // Note selection functionality
  const toggleNoteSelection = (id: string) => {
    setSelectedNoteIds(prev => 
      prev.includes(id) 
        ? prev.filter(noteId => noteId !== id) 
        : [...prev, id]
    );
  };
  
  const clearNoteSelection = () => {
    setSelectedNoteIds([]);
  };

  return (
    <NotesContext.Provider
      value={{
        notes,
        folders,
        tags,
        activeNoteId,
        activeFolderId,
        isEditing,
        noteHistory,
        selectedNoteIds,
        defaultNoteBackground,
        setActiveNoteId,
        setActiveFolderId,
        setIsEditing,
        createNote,
        updateNote,
        deleteNote,
        deleteMultipleNotes,
        createFolder,
        updateFolder,
        deleteFolder,
        togglePinned,
        addAttachment,
        removeAttachment,
        exportNote,
        createTag,
        updateTag,
        deleteTag,
        addTagToNote,
        removeTagFromNote,
        undoNoteChange,
        redoNoteChange,
        toggleNoteSelection,
        clearNoteSelection,
        setDefaultNoteBackground
      }}
    >
      {children}
    </NotesContext.Provider>
  );
};

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error("useNotes must be used within a NotesProvider");
  }
  return context;
};
