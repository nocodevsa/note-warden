
import { createContext, useContext, useEffect, useState } from "react";
import { FolderType, NoteType } from "@/lib/types";
import { sampleFolders, sampleNotes } from "@/lib/sample-data";
import { toast } from "sonner";

type NotesContextType = {
  notes: NoteType[];
  folders: FolderType[];
  activeNoteId: string | null;
  activeFolderId: string | null;
  isEditing: boolean;
  setActiveNoteId: (id: string | null) => void;
  setActiveFolderId: (id: string | null) => void;
  setIsEditing: (isEditing: boolean) => void;
  createNote: (folderId?: string | null) => void;
  updateNote: (id: string, updates: Partial<Omit<NoteType, "id">>) => void;
  deleteNote: (id: string) => void;
  createFolder: (name: string) => void;
  updateFolder: (id: string, name: string) => void;
  deleteFolder: (id: string) => void;
  togglePinned: (id: string) => void;
};

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export const NotesProvider = ({ children }: { children: React.ReactNode }) => {
  const [notes, setNotes] = useState<NoteType[]>(() => {
    const savedNotes = localStorage.getItem("notes");
    return savedNotes ? JSON.parse(savedNotes) : sampleNotes;
  });
  
  const [folders, setFolders] = useState<FolderType[]>(() => {
    const savedFolders = localStorage.getItem("folders");
    return savedFolders ? JSON.parse(savedFolders) : sampleFolders;
  });
  
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem("folders", JSON.stringify(folders));
  }, [folders]);

  const createNote = (folderId?: string | null) => {
    const newNote: NoteType = {
      id: `n${Date.now()}`,
      title: "Untitled Note",
      content: "",
      folderId: folderId !== undefined ? folderId : activeFolderId,
      isPinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setNotes(prev => [newNote, ...prev]);
    setActiveNoteId(newNote.id);
    setIsEditing(true);
    toast.success("New note created");
  };

  const updateNote = (id: string, updates: Partial<Omit<NoteType, "id">>) => {
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
    toast.success("Note deleted");
  };

  const createFolder = (name: string) => {
    const newFolder: FolderType = {
      id: `f${Date.now()}`,
      name,
      createdAt: new Date().toISOString(),
    };
    setFolders(prev => [...prev, newFolder]);
    toast.success("Folder created");
    return newFolder.id;
  };

  const updateFolder = (id: string, name: string) => {
    setFolders(prev => prev.map(folder => 
      folder.id === id ? { ...folder, name } : folder
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

  return (
    <NotesContext.Provider
      value={{
        notes,
        folders,
        activeNoteId,
        activeFolderId,
        isEditing,
        setActiveNoteId,
        setActiveFolderId,
        setIsEditing,
        createNote,
        updateNote,
        deleteNote,
        createFolder,
        updateFolder,
        deleteFolder,
        togglePinned,
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
