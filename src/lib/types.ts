
export type NoteType = {
  id: string;
  title: string;
  content: string;
  folderId: string | null;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  attachments?: string[]; // URLs to attached files/images
};

export type FolderType = {
  id: string;
  name: string;
  createdAt: string;
  color?: string; // For color-coded folders
  parentId?: string | null; // For subfolders
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
