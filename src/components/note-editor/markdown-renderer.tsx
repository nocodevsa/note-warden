
import { memo, useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { LinkPreview } from "./link-preview";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

function MarkdownRendererComponent({ content, className }: MarkdownRendererProps) {
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

  return (
    <div className={cn("note-content prose dark:prose-invert max-w-full", className)}>
      <ReactMarkdown>
        {content}
      </ReactMarkdown>
      
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
