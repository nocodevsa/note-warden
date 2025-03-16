export type NoteType = {
  id: string;
  title: string;
  content: string;
  folderId: string | null;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  attachments?: string[]; // URLs to attached files/images
  isPasswordProtected?: boolean;
  password?: string;
  isPublic?: boolean;
  publicLink?: string;
  version?: number;
  previousVersions?: Array<{
    content: string;
    updatedAt: string;
    version: number;
  }>;
  linkedNotes?: string[]; // IDs of linked notes
  tags?: string[]; // IDs of associated tags
};

export type FolderType = {
  id: string;
  name: string;
  createdAt: string;
  color?: string; // For color-coded folders
  icon?: string; // Icon name from lucide-react
  parentId?: string | null; // For subfolders
  children?: FolderType[]; // For nested folder structure
};

export type TagType = {
  id: string;
  name: string;
  color: string;
};

export type LinkPreviewType = {
  url: string;
  title?: string;
  description?: string;
  image?: string;
};

export type WhiteboardItem = {
  id: string;
  type: 'sticky' | 'shape' | 'connector' | 'text' | 'image';
  x: number;
  y: number;
  width?: number;
  height?: number;
  content?: string;
  color?: string;
  zIndex: number;
};

export type Whiteboard = {
  id: string;
  name: string;
  items: WhiteboardItem[];
  createdAt: string;
  updatedAt: string;
  isShared?: boolean;
  sharedWith?: string[];
};

export type SyncProvider = 'none' | 'google-drive' | 'dropbox';

export type AppSettingsType = {
  theme: 'light' | 'dark' | 'system';
  syncProvider: SyncProvider;
  autoSaveInterval: number; // in milliseconds
  defaultView: 'list' | 'grid' | 'dual';
  isAutoSyncEnabled: boolean;
};

export type NoteBackgroundType = {
  color: string;
  name: string;
};

export type NoteBackground = string;
