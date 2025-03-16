import React, { createContext, useContext, useEffect, useState } from "react";
import { NoteType, FolderType, TagType, NoteBackground } from "@/lib/types";
import { sampleNotes, sampleFolders, sampleTags } from "@/lib/sample-data";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { AuthContext } from "./auth-context";

type NotesContextType = {
  notes: NoteType[];
  folders: FolderType[];
  tags: TagType[];
  activeNoteId: string | null;
  activeFolderId: string | null;
  defaultNoteBackground: NoteBackground;
  setActiveNoteId: (id: string | null) => void;
  setActiveFolderId: (id: string | null) => void;
  createNote: (folderId?: string | null) => string;
  updateNote: (id: string, updates: Partial<Omit<NoteType, "id">>) => void;
  deleteNote: (id: string) => void;
  deleteNotes: (ids: string[]) => void;
  createFolder: (folder: Omit<FolderType, "id" | "createdAt">) => string;
  updateFolder: (id: string, updates: Partial<Omit<FolderType, "id">>) => void;
  deleteFolder: (id: string) => void;
  createTag: (tag: Omit<TagType, "id">) => string;
  deleteTag: (id: string) => void;
  setDefaultNoteBackground: (background: NoteBackground) => void;
};

const NotesContext = createContext<NotesContextType | undefined>(undefined);

const LOCAL_STORAGE_KEYS = {
  NOTES: "noteflow_notes",
  FOLDERS: "noteflow_folders",
  TAGS: "noteflow_tags",
  ACTIVE_NOTE: "noteflow_active_note",
  ACTIVE_FOLDER: "noteflow_active_folder",
  DEFAULT_BG: "noteflow_default_bg",
};

export function NotesProvider({ children }: { children: React.ReactNode }) {
  const [notes, setNotes] = useState<NoteType[]>([]);
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [tags, setTags] = useState<TagType[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [defaultNoteBackground, setDefaultNoteBackground] = useState<NoteBackground>("#FFFFFF");

  const { user } = useContext(AuthContext) || { user: null };
  const userPrefix = user ? `user_${user.id}_` : '';

  // Load data from localStorage on mount
  useEffect(() => {
    const storedNotes = localStorage.getItem(`${userPrefix}${LOCAL_STORAGE_KEYS.NOTES}`);
    const storedFolders = localStorage.getItem(`${userPrefix}${LOCAL_STORAGE_KEYS.FOLDERS}`);
    const storedTags = localStorage.getItem(`${userPrefix}${LOCAL_STORAGE_KEYS.TAGS}`);
    const storedActiveNote = localStorage.getItem(`${userPrefix}${LOCAL_STORAGE_KEYS.ACTIVE_NOTE}`);
    const storedActiveFolder = localStorage.getItem(`${userPrefix}${LOCAL_STORAGE_KEYS.ACTIVE_FOLDER}`);
    const storedDefaultBg = localStorage.getItem(`${userPrefix}${LOCAL_STORAGE_KEYS.DEFAULT_BG}`);

    if (storedNotes) setNotes(JSON.parse(storedNotes));
    else setNotes(sampleNotes);

    if (storedFolders) setFolders(JSON.parse(storedFolders));
    else setFolders(sampleFolders);

    if (storedTags) setTags(JSON.parse(storedTags));
    else setTags(sampleTags);

    if (storedActiveNote) setActiveNoteId(JSON.parse(storedActiveNote));
    if (storedActiveFolder) setActiveFolderId(JSON.parse(storedActiveFolder));
    if (storedDefaultBg) setDefaultNoteBackground(JSON.parse(storedDefaultBg));
  }, [userPrefix]);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (notes.length > 0) localStorage.setItem(`${userPrefix}${LOCAL_STORAGE_KEYS.NOTES}`, JSON.stringify(notes));
    if (folders.length > 0) localStorage.setItem(`${userPrefix}${LOCAL_STORAGE_KEYS.FOLDERS}`, JSON.stringify(folders));
    if (tags.length > 0) localStorage.setItem(`${userPrefix}${LOCAL_STORAGE_KEYS.TAGS}`, JSON.stringify(tags));
    localStorage.setItem(`${userPrefix}${LOCAL_STORAGE_KEYS.ACTIVE_NOTE}`, JSON.stringify(activeNoteId));
    localStorage.setItem(`${userPrefix}${LOCAL_STORAGE_KEYS.ACTIVE_FOLDER}`, JSON.stringify(activeFolderId));
    localStorage.setItem(`${userPrefix}${LOCAL_STORAGE_KEYS.DEFAULT_BG}`, JSON.stringify(defaultNoteBackground));
  }, [notes, folders, tags, activeNoteId, activeFolderId, defaultNoteBackground, userPrefix]);

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
          // If content is being updated, store previous version
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
            // Increment version if content changed
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
    
    // If the deleted note was active, clear activeNoteId
    if (activeNoteId === id) {
      setActiveNoteId(null);
    }
  };

  const deleteNotes = (ids: string[]) => {
    setNotes((prevNotes) => prevNotes.filter((note) => !ids.includes(note.id)));
    
    // If the active note was deleted, clear activeNoteId
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

  const createTag = (tag: Omit<TagType, "id">) => {
    const newTag: TagType = {
      id: uuidv4(),
      ...tag,
    };
    setTags((prevTags) => [newTag, ...prevTags]);
    return newTag.id;
  };

  const deleteTag = (id: string) => {
    setTags((prevTags) => prevTags.filter((tag) => tag.id !== id));
  };

  const value = {
    notes,
    folders,
    tags,
    activeNoteId,
    activeFolderId,
    defaultNoteBackground,
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
    setDefaultNoteBackground,
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
