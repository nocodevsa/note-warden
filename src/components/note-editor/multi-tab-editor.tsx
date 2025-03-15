
import { useState, useEffect } from "react";
import { useNotes } from "@/context/notes-context";
import { NoteView } from "./note-view";
import { NoteType } from "@/lib/types";
import { X, Plus, SplitSquareVertical, SplitSquareHorizontal, Tag, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export function MultiTabEditor() {
  const { notes, activeNoteId, setActiveNoteId, createNote } = useNotes();
  const [openTabs, setOpenTabs] = useState<string[]>(activeNoteId ? [activeNoteId] : []);
  const [activeTab, setActiveTab] = useState<string | null>(activeNoteId);
  const [layout, setLayout] = useState<"single" | "horizontal" | "vertical">("single");
  const [showDateInfo, setShowDateInfo] = useState(true);
  const [tags, setTags] = useState<string[]>([]);

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

  const activeNote = activeNoteId ? notes.find(n => n.id === activeNoteId) : null;

  // Add tag to the current note (this would need to be integrated with your note update function)
  const addTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

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
    // Fix: Check if newNoteId exists and is a string before adding it
    if (typeof newNoteId === 'string') {
      setOpenTabs(prev => [...prev, newNoteId]);
      setActiveTab(newNoteId);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-border/70 bg-secondary/40">
        <div className="flex-1 overflow-x-auto scrollbar-none">
          <div className="flex">
            {openTabs.map(tabId => {
              const note = notes.find(n => n.id === tabId);
              return (
                <div 
                  key={tabId}
                  className={cn(
                    "flex items-center gap-1 px-4 py-2.5 border-r border-border/50 cursor-pointer",
                    tabId === activeTab ? "bg-white dark:bg-card shadow-sm" : "hover:bg-secondary/80"
                  )}
                  onClick={() => setActiveTab(tabId)}
                >
                  <span className="truncate max-w-[120px] text-sm">{note?.title || "Untitled"}</span>
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
              className="h-10 px-2"
              onClick={handleNewTab}
            >
              <Plus size={16} />
            </Button>
          </div>
        </div>

        <div className="flex border-l border-border/50">
          <Tabs value={layout} onValueChange={(v) => setLayout(v as "single" | "horizontal" | "vertical")}>
            <TabsList className="bg-transparent h-10">
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

      {activeNote && (
        <div className="border-b border-border/50 p-4 bg-white dark:bg-card flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <h1 className="text-xl font-medium">{activeNote.title || "Untitled Note"}</h1>
            <Button variant="outline" size="sm" className="text-xs">
              Only for me
            </Button>
          </div>
          
          {showDateInfo && (
            <div className="flex flex-col gap-1 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar size={14} />
                <span>Created: {format(new Date(activeNote.createdAt), "MMM d, yyyy, h:mm a")}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock size={14} />
                <span>Last modified: {format(new Date(activeNote.updatedAt), "MMM d, yyyy, h:mm a")}</span>
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Tags:</span>
            <div className="flex flex-wrap gap-1">
              <span className="tag tag-design">Design</span>
              <span className="tag tag-study">Study</span>
              <span className="tag tag-projects">Projects</span>
              <span className="tag tag-finance">Finance</span>
              <Button variant="outline" size="sm" className="h-5 text-xs px-2">+ Add tag</Button>
            </div>
          </div>
        </div>
      )}

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
