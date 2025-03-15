
import { memo, useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { LinkPreview } from "./link-preview";
import { useNotes } from "@/context/notes-context";
import { toast } from "sonner";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

function MarkdownRendererComponent({ content, className }: MarkdownRendererProps) {
  const { notes, setActiveNoteId } = useNotes();
  // Extract URLs from markdown content for link previews
  const [urls, setUrls] = useState<string[]>([]);
  
  useEffect(() => {
    // Simple regex to find URLs in markdown content
    const urlRegex = /(https?:\/\/[^\s)]+)/g;
    const matches = content.match(urlRegex);
    if (matches) {
      setUrls([...new Set(matches)]); // Remove duplicates
    } else {
      setUrls([]);
    }
  }, [content]);

  // Process internal note links
  const processedContent = content.replace(/\[\[([^\]]+)\]\]/g, (match, noteName) => {
    // Find the note by title
    const linkedNote = notes.find(n => 
      n.title.toLowerCase() === noteName.toLowerCase()
    );
    
    if (linkedNote) {
      // Return a special link format that we can interpret later
      return `[${noteName}](#note-link-${linkedNote.id})`;
    }
    
    // If no note found with that title, return a placeholder or a way to create it
    return `[${noteName} (create)](#create-note-${encodeURIComponent(noteName)})`;
  });

  // Handle note link clicks
  const handleLinkClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    
    if (target.tagName === 'A') {
      const href = (target as HTMLAnchorElement).getAttribute('href');
      
      if (href?.startsWith('#note-link-')) {
        e.preventDefault();
        const noteId = href.replace('#note-link-', '');
        setActiveNoteId(noteId);
      } 
      else if (href?.startsWith('#create-note-')) {
        e.preventDefault();
        const noteName = decodeURIComponent(href.replace('#create-note-', ''));
        // You would need to implement logic to create a new note here
        toast.info(`Creating note "${noteName}" is not implemented yet`);
      }
    }
  };

  return (
    <div 
      className={cn("note-content prose dark:prose-invert max-w-full", className)}
      onClick={handleLinkClick}
    >
      <div className="w-full">
        <ReactMarkdown>
          {processedContent}
        </ReactMarkdown>
      </div>
      
      {/* Link previews section */}
      {urls.length > 0 && (
        <div className="mt-4 space-y-2">
          {urls.map((url) => (
            <LinkPreview key={url} url={url} />
          ))}
        </div>
      )}
    </div>
  );
}

export const MarkdownRenderer = memo(MarkdownRendererComponent);
