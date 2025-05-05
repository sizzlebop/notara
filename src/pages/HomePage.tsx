import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useNotes } from '@/context/NotesContextTypes';
import NotesList from '@/components/notes/NotesList';
import NoteEditor from '@/components/notes/NoteEditor';
import { Note } from '@/types';
import { Button } from '@/components/ui/button';
import { Plus, FileText } from 'lucide-react';
import { ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

const HomePage: React.FC = () => {
  const { notes, activeNote, setActiveNote, addNote, deleteNote } = useNotes();
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [starField, setStarField] = useState<React.ReactNode[]>([]);
  
  // Generate random stars for the background
  useEffect(() => {
    const stars = [];
    const count = 50;
    
    for (let i = 0; i < count; i++) {
      const size = Math.random() > 0.8 ? 'star-large' : Math.random() > 0.5 ? 'star-medium' : 'star-small';
      const delay = `${Math.random() * 5}s`;
      
      stars.push(
        <div 
          key={i}
          className={`star ${size}`}
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDelay: delay,
          }}
        />
      );
    }
    
    setStarField(stars);
  }, []);
  
  const handleSelectNote = (note: Note) => {
    setActiveNote(note);
    setIsCreatingNote(false);
  };
  
  const handleCreateNote = () => {
    setActiveNote(null);
    setIsCreatingNote(true);
  };
  
  const handleSaveNewNote = (note: Note) => {
    setActiveNote(note);
    setIsCreatingNote(false);
  };
  
  const handleDeleteNote = (id: string) => {
    deleteNote(id);
  };
  
  return (
    <AppLayout>
      <ResizablePanel defaultSize={25} minSize={15} maxSize={40}>
        <div className="h-full flex flex-col">
          <div className="flex-1 overflow-hidden">
            <NotesList
              notes={notes}
              activeNoteId={activeNote?.id || null}
              onSelectNote={handleSelectNote}
              onDeleteNote={handleDeleteNote}
            />
          </div>
        </div>
      </ResizablePanel>
      
      <ResizableHandle withHandle className="bg-border/30 hover:bg-primary/50 transition-colors" />
      
      <ResizablePanel defaultSize={75}>
        <div className="h-full border-l border-border/30 relative">
          {starField}
          
          {isCreatingNote ? (
            <NoteEditor isNew={true} onSave={handleSaveNewNote} />
          ) : activeNote ? (
            <NoteEditor note={activeNote} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center relative z-10">
              <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-br from-cosmos-nebula to-cosmos-stardust cosmic-glow flex items-center justify-center float animate-float">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-white to-primary/80 bg-clip-text text-transparent animate-fade-in">Welcome to Notara</h2>
              <p className="text-muted-foreground mb-6 max-w-md animate-slide-up">
                Create and organize your notes with a beautiful cosmic-themed interface. 
                Get started by selecting a note or creating a new one.
              </p>
              <Button 
                onClick={handleCreateNote}
                className="bg-gradient-to-r from-primary to-cosmos-nebula hover:from-cosmos-nebula hover:to-primary transition-all duration-500 animate-slide-up btn-glow"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Note
              </Button>
            </div>
          )}
        </div>
      </ResizablePanel>
    </AppLayout>
  );
};

export default HomePage;
