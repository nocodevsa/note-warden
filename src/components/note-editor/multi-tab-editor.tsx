
import { useState, useEffect } from "react";
import { useNotes } from "@/context/notes-context";
import { NoteView } from "./note-view";
import { NoteType } from "@/lib/types";
import { X, Plus, SplitSquareVertical, SplitSquareHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function MultiTabEditor() {
  const { notes, activeNoteId, setActiveNoteId, createNote } = useNotes();
  const [openTabs, setOpenTabs] = useState<string[]>(activeNoteId ? [activeNoteId] : []);
  const [activeTab, setActiveTab] = useState<string | null>(activeNoteId);
  const [layout, setLayout] = useState<"single" | "horizontal" | "vertical">("single");

  // When activeNoteId changes externally, update tabs
  useEffect(() => {
    if (activeNoteId && !openTabs.includes(activeNoteId)) {
      setOpenTabs(prev => [...prev, activeNoteId]);
    }
    if (activeNoteId) {
      setActiveTab(activeNoteId);
    }
  }, [activeNoteId]);

  // When activeTab changes, update activeNoteId
  useEffect(() => {
    if (activeTab) {
      setActiveNoteId(activeTab);
    }
  }, [activeTab, setActiveNoteId]);

  const handleCloseTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenTabs(prev => prev.filter(id => id !== tabId));
    
    // If closing the active tab, activate another tab
    if (tabId === activeTab && openTabs.length > 1) {
      const index = openTabs.indexOf(tabId);
      const newActiveTab = openTabs[index === 0 ? 1 : index - 1];
      setActiveTab(newActiveTab);
    } else if (openTabs.length === 1) {
      // If closing the last tab
      setActiveTab(null);
    }
  };

  const handleNewTab = () => {
    const newNoteId = createNote();
    setOpenTabs(prev => [...prev, newNoteId]);
    setActiveTab(newNoteId);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-border">
        <div className="flex-1 overflow-x-auto scrollbar-none">
          <div className="flex">
            {openTabs.map(tabId => {
              const note = notes.find(n => n.id === tabId);
              return (
                <div 
                  key={tabId}
                  className={cn(
                    "flex items-center gap-1 px-3 py-2 border-r border-border cursor-pointer",
                    tabId === activeTab ? "bg-accent" : "hover:bg-secondary"
                  )}
                  onClick={() => setActiveTab(tabId)}
                >
                  <span className="truncate max-w-[120px]">{note?.title || "Untitled"}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 rounded-full ml-1 opacity-50 hover:opacity-100"
                    onClick={(e) => handleCloseTab(tabId, e)}
                  >
                    <X size={12} />
                  </Button>
                </div>
              );
            })}
            <Button
              variant="ghost"
              size="sm"
              className="h-9 px-2"
              onClick={handleNewTab}
            >
              <Plus size={16} />
            </Button>
          </div>
        </div>

        <div className="flex border-l border-border">
          <Tabs value={layout} onValueChange={(v) => setLayout(v as "single" | "horizontal" | "vertical")}>
            <TabsList className="bg-transparent h-9">
              <TabsTrigger value="single" className="px-2 h-8">
                <div className="w-4 h-4 bg-primary/20 rounded" />
              </TabsTrigger>
              <TabsTrigger value="horizontal" className="px-2 h-8">
                <SplitSquareHorizontal size={16} />
              </TabsTrigger>
              <TabsTrigger value="vertical" className="px-2 h-8">
                <SplitSquareVertical size={16} />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {layout === "single" && (
          activeTab ? <NoteView key={activeTab} noteId={activeTab} /> : 
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">No Note Open</h3>
              <p className="mb-4">Open a note from the sidebar or create a new one.</p>
              <Button onClick={handleNewTab}>New Note</Button>
            </div>
          </div>
        )}

        {layout === "horizontal" && (
          <div className="grid grid-cols-2 h-full divide-x divide-border">
            {openTabs.length > 0 ? (
              <>
                <NoteView key={openTabs[0]} noteId={openTabs[0]} />
                <div className="h-full overflow-y-auto">
                  {openTabs.length > 1 ? (
                    <NoteView key={openTabs[1]} noteId={openTabs[1]} />
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      <Button onClick={handleNewTab}>Open Another Note</Button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="col-span-2 flex items-center justify-center text-muted-foreground">
                <Button onClick={handleNewTab}>New Note</Button>
              </div>
            )}
          </div>
        )}

        {layout === "vertical" && (
          <div className="grid grid-rows-2 h-full divide-y divide-border">
            {openTabs.length > 0 ? (
              <>
                <NoteView key={openTabs[0]} noteId={openTabs[0]} />
                <div className="h-full overflow-y-auto">
                  {openTabs.length > 1 ? (
                    <NoteView key={openTabs[1]} noteId={openTabs[1]} />
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      <Button onClick={handleNewTab}>Open Another Note</Button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="row-span-2 flex items-center justify-center text-muted-foreground">
                <Button onClick={handleNewTab}>New Note</Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
