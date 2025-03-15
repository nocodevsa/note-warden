
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LinkPreviewType } from "@/lib/types";
import { ExternalLink } from "lucide-react";

interface LinkPreviewProps {
  url: string;
}

export function LinkPreview({ url }: LinkPreviewProps) {
  const [preview, setPreview] = useState<LinkPreviewType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // In a real app, this would call an API endpoint to fetch link metadata
    // For now, we'll simulate it with a timeout and mock data
    setLoading(true);
    setError(false);
    
    // Mock link preview data - in a real app this would be an API call
    setTimeout(() => {
      const domain = new URL(url).hostname;
      try {
        setPreview({
          url,
          title: `Content from ${domain}`,
          description: "This is a preview of the linked content. In a real app, this would show actual metadata from the URL.",
          image: domain.includes("youtube") 
            ? "https://picsum.photos/seed/youtube/200/100" 
            : "https://picsum.photos/seed/website/200/100"
        });
        setLoading(false);
      } catch (err) {
        console.error("Error parsing URL:", url, err);
        setError(true);
        setLoading(false);
      }
    }, 500);
  }, [url]);

  if (loading) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-3 flex gap-3">
          <Skeleton className="h-20 w-20 rounded-md" />
          <div className="flex-1">
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !preview) {
    return null;
  }

  return (
    <Card className="overflow-hidden hover:bg-accent/50 transition-colors">
      <a href={url} target="_blank" rel="noopener noreferrer" className="no-underline">
        <CardContent className="p-3 flex gap-3">
          {preview.image && (
            <div className="h-20 w-20 rounded-md overflow-hidden flex-shrink-0">
              <img 
                src={preview.image} 
                alt="Link preview" 
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-1">
              <h4 className="text-sm font-medium line-clamp-1 m-0">{preview.title}</h4>
              <ExternalLink size={12} className="text-muted-foreground" />
            </div>
            {preview.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 m-0 mt-1">
                {preview.description}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1 truncate m-0">
              {url}
            </p>
          </div>
        </CardContent>
      </a>
    </Card>
  );
}
