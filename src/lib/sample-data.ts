
import { FolderType, NoteType } from "./types";

export const sampleFolders: FolderType[] = [
  {
    id: "f1",
    name: "Personal",
    createdAt: new Date().toISOString(),
  },
  {
    id: "f2",
    name: "Work",
    createdAt: new Date().toISOString(),
  },
  {
    id: "f3",
    name: "Projects",
    createdAt: new Date().toISOString(),
  },
];

export const sampleNotes: NoteType[] = [
  {
    id: "n1",
    title: "Welcome to Note Warden",
    content: `# Welcome to Note Warden
    
This is your new home for all your notes and ideas.

## Features:
- **Markdown Support**: Format your notes with Markdown
- **Folders**: Organize your notes with folders
- **Pinned Notes**: Keep important notes at the top
- **Auto-save**: Your notes are automatically saved
- **Dark Mode**: Toggle between light and dark mode

Try creating a new note or folder to get started!`,
    folderId: null,
    isPinned: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "n2",
    title: "Shopping List",
    content: `## Grocery List
- Milk
- Eggs
- Bread
- Apples
- Bananas
- Chicken
- Rice
- Pasta`,
    folderId: "f1",
    isPinned: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "n3",
    title: "Project Ideas",
    content: `# Project Ideas
1. **Mobile App**: Note-taking app with cloud sync
2. **Website**: Personal portfolio with blog
3. **Game**: 2D platformer with pixel art

## Technologies to explore:
- React Native
- Three.js
- WebAssembly`,
    folderId: "f3",
    isPinned: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "n4",
    title: "Meeting Notes",
    content: `# Team Meeting - 2023-06-15

## Attendees:
- John
- Sarah
- Mike
- Lisa

## Agenda:
1. Project status updates
2. Timeline review
3. Budget discussion
4. Next steps

## Action Items:
- [ ] John: Update project documentation
- [ ] Sarah: Schedule follow-up meeting
- [ ] Mike: Research new tools
- [ ] Lisa: Prepare budget report`,
    folderId: "f2",
    isPinned: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
