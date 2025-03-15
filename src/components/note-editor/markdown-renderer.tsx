
import { memo } from "react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

function MarkdownRendererComponent({ content, className }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      className={cn("note-content prose dark:prose-invert max-w-full", className)}
    >
      {content}
    </ReactMarkdown>
  );
}

export const MarkdownRenderer = memo(MarkdownRendererComponent);
