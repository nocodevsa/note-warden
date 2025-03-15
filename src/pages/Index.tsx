
import { useState, useEffect } from "react";
import { Sidebar } from "@/components/sidebar/sidebar";
import { NoteView } from "@/components/note-editor/note-view";
import { NoteList } from "@/components/note-editor/note-list";
import { ThemeProvider } from "@/components/theme-provider";
import { NotesProvider } from "@/context/notes-context";
import { SearchCommand } from "@/components/search-command";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useNotes } from "@/context/notes-context";
import { cn } from "@/lib/utils";

const NoteWrapper = () => {
  const { activeNoteId, createNote } = useNotes();
  const isMobile = useIsMobile();
  
  if (isMobile && !activeNoteId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Note Warden</h2>
        <p className="text-muted-foreground mb-6">Your personal note-taking app</p>
        <Button onClick={() => createNote()}>
          <Plus size={16} className="mr-2" /> Create a new note
        </Button>
      </div>
    );
  }
  
  return (
    <div className={cn("flex-1 flex", isMobile ? "flex-col" : "flex-row")}>
      {!isMobile && <NoteList />}
      <NoteView />
    </div>
  );
};

const Index = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    setSidebarCollapsed(isMobile);
  }, [isMobile]);

  useEffect(() => {
    // Show a welcome toast
    toast("Welcome to Note Warden", {
      description: "Press Ctrl+K to search notes",
      action: {
        label: "Dismiss",
        onClick: () => {},
      },
    });
  }, []);

  return (
    <ThemeProvider defaultTheme="system">
      <NotesProvider>
        <div className="h-screen flex overflow-hidden">
          <Sidebar collapsed={sidebarCollapsed} onCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />
          <NoteWrapper />
          <SearchCommand />
        </div>
      </NotesProvider>
    </ThemeProvider>
  );
};

export default Index;
