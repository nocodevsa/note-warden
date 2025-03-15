
import { useState } from "react";
import { NotesProvider } from "@/context/notes-context";
import { ThemeProvider } from "@/components/theme-provider";
import { Sidebar } from "@/components/sidebar/sidebar";
import { MultiTabEditor } from "@/components/note-editor/multi-tab-editor";
import { NoteList } from "@/components/note-editor/note-list";
import { SearchCommand } from "@/components/search-command";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Index() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isMobile = useIsMobile();

  return (
    <ThemeProvider defaultTheme="system">
      <NotesProvider>
        <div className="flex h-screen overflow-hidden">
          {!isMobile && <Sidebar collapsed={sidebarCollapsed} onCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />}
          
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 flex overflow-hidden">
              {!isMobile && (
                <div className="w-72 border-r border-border overflow-y-auto">
                  <NoteList />
                </div>
              )}
              <div className="flex-1 overflow-hidden">
                <MultiTabEditor />
              </div>
            </div>
          </div>
        </div>
        <SearchCommand />
      </NotesProvider>
    </ThemeProvider>
  );
}
