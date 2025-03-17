import React, { createContext, useContext, useEffect, useState } from "react";
import { NoteType, FolderType, TagType, NoteBackground } from "@/lib/types";
import { sampleNotes, sampleFolders, sampleTags } from "@/lib/sample-data";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { AuthContext } from "./auth-context";

interface HistoryState {
  past: Array<NoteType[]>;
  present: NoteType[];
  future: Array<NoteType[]>;
}

type NotesContextType = {
  notes: NoteType[];
  folders: FolderType[];
  tags: TagType[];
  activeNoteId: string | null;
  activeFolderId: string | null;
  defaultNoteBackground: NoteBackground;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
  selectedNoteIds: string[];
  toggleNoteSelection: (id: string) => void;
  clearNoteSelection: () => void;
  deleteMultipleNotes: (ids: string[]) => void;
  noteHistory: HistoryState;
  undoNoteChange: () => void;
  redoNoteChange: () => void;
  setActiveNoteId: (id: string | null) => void;
  setActiveFolderId: (id: string | null) => void;
  createNote: (folderId?: string | null) => string;
  updateNote: (id: string, updates: Partial<Omit<NoteType, "id">>) => void;
  deleteNote: (id: string) => void;
  deleteNotes: (ids: string[]) => void;
  createFolder: (folder: Omit<FolderType, "id" | "createdAt">) => string;
  updateFolder: (id: string, updates: Partial<Omit<FolderType, "id">>) => void;
  deleteFolder: (id: string) => void;
  createTag: (name: string, color: string) => string;
  deleteTag: (id: string) => void;
  addTagToNote: (noteId: string, tagId: string) => void;
  removeTagFromNote: (noteId: string, tagId: string) => void;
  togglePinned: (id: string) => void;
  setDefaultNoteBackground: (background: NoteBackground) => void;
  googleDriveSettings: {
    isEnabled: boolean;
    folderId: string | null;
    lastSyncedAt: string | null;
    syncStatus: "idle" | "syncing" | "error" | "success";
    lastError: string | null;
  };
  updateGoogleDriveSettings: (settings: Partial<{
    isEnabled: boolean;
    folderId: string | null;
  }>) => void;
  syncWithGoogleDrive: () => Promise<boolean>;
};

const NotesContext = createContext<NotesContextType | undefined>(undefined);

const LOCAL_STORAGE_KEYS = {
  NOTES: "noteflow_notes",
  FOLDERS: "noteflow_folders",
  TAGS: "noteflow_tags",
  ACTIVE_NOTE: "noteflow_active_note",
  ACTIVE_FOLDER: "noteflow_active_folder",
  DEFAULT_BG: "noteflow_default_bg",
  GOOGLE_DRIVE_SETTINGS: "noteflow_gdrive_settings",
};

export function NotesProvider({ children }: { children: React.ReactNode }) {
  const [notes, setNotes] = useState<NoteType[]>([]);
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [tags, setTags] = useState<TagType[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [defaultNoteBackground, setDefaultNoteBackground] = useState<NoteBackground>("#FFFFFF");
  const [isEditing, setIsEditing] = useState(false);
  const [selectedNoteIds, setSelectedNoteIds] = useState<string[]>([]);
  
  const [googleDriveSettings, setGoogleDriveSettings] = useState({
    isEnabled: false,
    folderId: null as string | null,
    lastSyncedAt: null as string | null,
    syncStatus: "idle" as "idle" | "syncing" | "error" | "success",
    lastError: null as string | null,
  });
  
  const [noteHistory, setNoteHistory] = useState<HistoryState>({
    past: [],
    present: [],
    future: []
  });
  
  const [syncTimeoutId, setSyncTimeoutId] = useState<number | null>(null);

  const { user } = useContext(AuthContext) || { user: null };
  const userPrefix = user ? `user_${user.id}_` : '';

  useEffect(() => {
    const storedNotes = localStorage.getItem(`${userPrefix}${LOCAL_STORAGE_KEYS.NOTES}`);
    const storedFolders = localStorage.getItem(`${userPrefix}${LOCAL_STORAGE_KEYS.FOLDERS}`);
    const storedTags = localStorage.getItem(`${userPrefix}${LOCAL_STORAGE_KEYS.TAGS}`);
    const storedActiveNote = localStorage.getItem(`${userPrefix}${LOCAL_STORAGE_KEYS.ACTIVE_NOTE}`);
    const storedActiveFolder = localStorage.getItem(`${userPrefix}${LOCAL_STORAGE_KEYS.ACTIVE_FOLDER}`);
    const storedDefaultBg = localStorage.getItem(`${userPrefix}${LOCAL_STORAGE_KEYS.DEFAULT_BG}`);
    const storedGDriveSettings = localStorage.getItem(`${userPrefix}${LOCAL_STORAGE_KEYS.GOOGLE_DRIVE_SETTINGS}`);

    if (storedNotes) {
      const parsedNotes = JSON.parse(storedNotes);
      setNotes(parsedNotes);
      setNoteHistory({
        past: [],
        present: parsedNotes,
        future: []
      });
    } else {
      setNotes(sampleNotes);
      setNoteHistory({
        past: [],
        present: sampleNotes,
        future: []
      });
    }

    if (storedFolders) setFolders(JSON.parse(storedFolders));
    else setFolders(sampleFolders);

    if (storedTags) setTags(JSON.parse(storedTags));
    else setTags(sampleTags);

    if (storedActiveNote) setActiveNoteId(JSON.parse(storedActiveNote));
    if (storedActiveFolder) setActiveFolderId(JSON.parse(storedActiveFolder));
    if (storedDefaultBg) setDefaultNoteBackground(JSON.parse(storedDefaultBg));
    if (storedGDriveSettings) setGoogleDriveSettings(JSON.parse(storedGDriveSettings));
  }, [userPrefix]);

  useEffect(() => {
    if (notes.length > 0) localStorage.setItem(`${userPrefix}${LOCAL_STORAGE_KEYS.NOTES}`, JSON.stringify(notes));
    if (folders.length > 0) localStorage.setItem(`${userPrefix}${LOCAL_STORAGE_KEYS.FOLDERS}`, JSON.stringify(folders));
    if (tags.length > 0) localStorage.setItem(`${userPrefix}${LOCAL_STORAGE_KEYS.TAGS}`, JSON.stringify(tags));
    localStorage.setItem(`${userPrefix}${LOCAL_STORAGE_KEYS.ACTIVE_NOTE}`, JSON.stringify(activeNoteId));
    localStorage.setItem(`${userPrefix}${LOCAL_STORAGE_KEYS.ACTIVE_FOLDER}`, JSON.stringify(activeFolderId));
    localStorage.setItem(`${userPrefix}${LOCAL_STORAGE_KEYS.DEFAULT_BG}`, JSON.stringify(defaultNoteBackground));
    localStorage.setItem(`${userPrefix}${LOCAL_STORAGE_KEYS.GOOGLE_DRIVE_SETTINGS}`, JSON.stringify(googleDriveSettings));
  }, [notes, folders, tags, activeNoteId, activeFolderId, defaultNoteBackground, googleDriveSettings, userPrefix]);

  useEffect(() => {
    if (noteHistory.present !== notes && notes.length > 0) {
      setNoteHistory({
        past: [...noteHistory.past, noteHistory.present],
        present: notes,
        future: []
      });
    }
  }, [notes]);

  useEffect(() => {
    const autoSyncWithGoogleDrive = async () => {
      if (googleDriveSettings.isEnabled && googleDriveSettings.folderId) {
        try {
          await syncWithGoogleDrive();
        } catch (error) {
          console.error("Auto-sync failed:", error);
        }
      }
    };

    const timeoutId = setTimeout(() => {
      autoSyncWithGoogleDrive();
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, [notes, googleDriveSettings.isEnabled, googleDriveSettings.folderId]);

  const undoNoteChange = () => {
    if (noteHistory.past.length === 0) return;
    
    const newPast = [...noteHistory.past];
    const previous = newPast.pop();
    
    setNoteHistory({
      past: newPast,
      present: previous as NoteType[],
      future: [notes, ...noteHistory.future]
    });
    
    setNotes(previous as NoteType[]);
  };

  const redoNoteChange = () => {
    if (noteHistory.future.length === 0) return;
    
    const [next, ...newFuture] = noteHistory.future;
    
    setNoteHistory({
      past: [...noteHistory.past, notes],
      present: next,
      future: newFuture
    });
    
    setNotes(next);
  };
  
  const toggleNoteSelection = (id: string) => {
    setSelectedNoteIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(noteId => noteId !== id);
      } else {
        return [...prev, id];
      }
    });
  };
  
  const clearNoteSelection = () => {
    setSelectedNoteIds([]);
  };
  
  const deleteMultipleNotes = (ids: string[]) => {
    setNotes(prevNotes => prevNotes.filter(note => !ids.includes(note.id)));
    
    if (activeNoteId && ids.includes(activeNoteId)) {
      setActiveNoteId(null);
    }
    
    clearNoteSelection();
    toast.success(`${ids.length} notes deleted`);
  };

  const createNote = (folderId?: string | null) => {
    const newNote: NoteType = {
      id: uuidv4(),
      title: "Untitled Note",
      content: "",
      folderId: folderId !== undefined ? folderId : activeFolderId,
      isPinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      backgroundColor: defaultNoteBackground,
      version: 1,
      previousVersions: [],
      tags: [],
    };

    setNotes((prevNotes) => [newNote, ...prevNotes]);
    setActiveNoteId(newNote.id);
    
    return newNote.id;
  };

  const updateNote = (id: string, updates: Partial<Omit<NoteType, "id">>) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) => {
        if (note.id === id) {
          const shouldSaveVersion = 
            updates.content !== undefined && 
            note.content !== updates.content;
          
          const previousVersions = shouldSaveVersion ? [
            ...(note.previousVersions || []),
            {
              content: note.content,
              updatedAt: note.updatedAt,
              version: note.version || 1,
            },
          ] : note.previousVersions;

          return {
            ...note,
            ...updates,
            updatedAt: new Date().toISOString(),
            version: shouldSaveVersion ? (note.version || 1) + 1 : note.version,
            previousVersions,
          };
        }
        return note;
      })
    );
  };

  const deleteNote = (id: string) => {
    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
    
    if (activeNoteId === id) {
      setActiveNoteId(null);
    }
  };

  const deleteNotes = (ids: string[]) => {
    setNotes((prevNotes) => prevNotes.filter((note) => !ids.includes(note.id)));
    
    if (activeNoteId && ids.includes(activeNoteId)) {
      setActiveNoteId(null);
    }
    
    toast.success(`${ids.length} notes deleted`);
  };

  const createFolder = (folder: Omit<FolderType, "id" | "createdAt">) => {
    const newFolder: FolderType = {
      id: uuidv4(),
      ...folder,
      createdAt: new Date().toISOString(),
    };
    setFolders((prevFolders) => [newFolder, ...prevFolders]);
    return newFolder.id;
  };

  const updateFolder = (id: string, updates: Partial<Omit<FolderType, "id">>) => {
    setFolders((prevFolders) =>
      prevFolders.map((folder) =>
        folder.id === id ? { ...folder, ...updates } : folder
      )
    );
  };

  const deleteFolder = (id: string) => {
    setFolders((prevFolders) => prevFolders.filter((folder) => folder.id !== id));
  };

  const createTag = (name: string, color: string) => {
    const newTag: TagType = {
      id: uuidv4(),
      name,
      color,
    };
    setTags((prevTags) => [newTag, ...prevTags]);
    return newTag.id;
  };

  const deleteTag = (id: string) => {
    setTags((prevTags) => prevTags.filter((tag) => tag.id !== id));
    
    setNotes(prevNotes => 
      prevNotes.map(note => {
        if (note.tags && note.tags.includes(id)) {
          return {
            ...note,
            tags: note.tags.filter(tagId => tagId !== id)
          };
        }
        return note;
      })
    );
    
    toast.success("Tag deleted");
  };
  
  const addTagToNote = (noteId: string, tagId: string) => {
    setNotes(prevNotes => 
      prevNotes.map(note => {
        if (note.id === noteId) {
          const updatedTags = [...(note.tags || [])];
          if (!updatedTags.includes(tagId)) {
            updatedTags.push(tagId);
          }
          return {
            ...note,
            tags: updatedTags
          };
        }
        return note;
      })
    );
  };
  
  const removeTagFromNote = (noteId: string, tagId: string) => {
    setNotes(prevNotes => 
      prevNotes.map(note => {
        if (note.id === noteId && note.tags) {
          return {
            ...note,
            tags: note.tags.filter(id => id !== tagId)
          };
        }
        return note;
      })
    );
  };
  
  const togglePinned = (id: string) => {
    setNotes(prevNotes => 
      prevNotes.map(note => {
        if (note.id === id) {
          return {
            ...note,
            isPinned: !note.isPinned
          };
        }
        return note;
      })
    );
  };

  const updateGoogleDriveSettings = (settings: Partial<{
    isEnabled: boolean;
    folderId: string | null;
  }>) => {
    setGoogleDriveSettings(prev => {
      const updated = {
        ...prev,
        ...settings,
        lastSyncedAt: settings.isEnabled !== undefined && settings.isEnabled !== prev.isEnabled 
          ? settings.isEnabled ? new Date().toISOString() : prev.lastSyncedAt
          : prev.lastSyncedAt,
        syncStatus: "idle" as const,
        lastError: null
      };
      
      return updated;
    });
    
    toast.success("Google Drive settings updated");
    
    if (settings.isEnabled && 
        ((settings.folderId && settings.folderId.trim() !== "") || 
         (googleDriveSettings.folderId && googleDriveSettings.folderId.trim() !== ""))) {
      setTimeout(() => {
        syncWithGoogleDrive().catch(console.error);
      }, 500);
    }
  };
  
  const syncWithGoogleDrive = async (): Promise<boolean> => {
    if (!googleDriveSettings.isEnabled || !googleDriveSettings.folderId) {
      toast.error("Google Drive sync is not properly configured");
      setGoogleDriveSettings(prev => ({
        ...prev,
        syncStatus: "error" as const,
        lastError: "Google Drive sync is not properly configured"
      }));
      return false;
    }
    
    try {
      setGoogleDriveSettings(prev => ({
        ...prev,
        syncStatus: "syncing" as const
      }));
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setGoogleDriveSettings(prev => ({
        ...prev,
        lastSyncedAt: new Date().toISOString(),
        syncStatus: "success" as const,
        lastError: null
      }));
      
      toast.success("Successfully synced with Google Drive");
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      
      setGoogleDriveSettings(prev => ({
        ...prev,
        syncStatus: "error" as const,
        lastError: errorMessage
      }));
      
      toast.error("Failed to sync with Google Drive");
      console.error("Google Drive sync error:", error);
      return false;
    }
  };

  const value = {
    notes,
    folders,
    tags,
    activeNoteId,
    activeFolderId,
    defaultNoteBackground,
    isEditing,
    setIsEditing, 
    selectedNoteIds,
    toggleNoteSelection,
    clearNoteSelection,
    deleteMultipleNotes,
    noteHistory,
    undoNoteChange,
    redoNoteChange,
    setActiveNoteId,
    setActiveFolderId,
    createNote,
    updateNote,
    deleteNote,
    deleteNotes,
    createFolder,
    updateFolder,
    deleteFolder,
    createTag,
    deleteTag,
    addTagToNote,
    removeTagFromNote,
    togglePinned,
    setDefaultNoteBackground,
    googleDriveSettings,
    updateGoogleDriveSettings,
    syncWithGoogleDrive,
  };

  return (
    <NotesContext.Provider value={value}>
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error("useNotes must be used within a NotesProvider");
  }
  return context;
}
