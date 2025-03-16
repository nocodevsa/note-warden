
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useNotes } from "@/context/notes-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MarkdownRenderer } from "@/components/note-editor/markdown-renderer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Lock } from "lucide-react";

export default function SharedNote() {
  const { id } = useParams<{ id: string }>();
  const { notes } = useNotes();
  const [password, setPassword] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError] = useState("");
  
  const note = notes.find(n => n.id === id);
  
  useEffect(() => {
    if (note && !note.isPasswordProtected) {
      setIsUnlocked(true);
    }
  }, [note]);
  
  if (!note) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Note Not Found</CardTitle>
            <CardDescription>
              The note you're looking for doesn't exist or is not shared.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/">Go Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!note.isPublic) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Private Note</CardTitle>
            <CardDescription>
              This note is not shared publicly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/">Go Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const handleUnlock = () => {
    if (note.password === password) {
      setIsUnlocked(true);
      setError("");
    } else {
      setError("Incorrect password");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border p-4">
        <div className="container max-w-4xl mx-auto flex items-center justify-between">
          <Button asChild variant="ghost" size="sm">
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft size={16} />
              Back to Notes
            </Link>
          </Button>
        </div>
      </header>
      
      <main className="flex-1 container max-w-4xl mx-auto p-4">
        {note.isPasswordProtected && !isUnlocked ? (
          <Card className="max-w-md mx-auto mt-12">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock size={18} /> Password Protected Note
              </CardTitle>
              <CardDescription>
                This note is protected. Enter the password to view it.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                />
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button onClick={handleUnlock} className="w-full">Unlock</Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">{note.title}</h1>
            <div className="text-sm text-muted-foreground">
              {new Date(note.updatedAt).toLocaleString()}
            </div>
            <Card style={{ backgroundColor: note.backgroundColor || "white" }}>
              <CardContent className="p-6">
                <MarkdownRenderer content={note.content} />
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
