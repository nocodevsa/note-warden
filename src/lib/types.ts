
export type NoteType = {
  id: string;
  title: string;
  content: string;
  folderId: string | null;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
};

export type FolderType = {
  id: string;
  name: string;
  createdAt: string;
};
