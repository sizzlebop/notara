
import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import MoodBoard from '@/components/moodboard/MoodBoard';
import { useNotes } from '@/context/NotesContext';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

const MoodBoardPage: React.FC = () => {
  const { moodBoards, addMoodBoard } = useNotes();
  const [selectedMoodBoardId, setSelectedMoodBoardId] = useState<string | null>(
    moodBoards.length > 0 ? moodBoards[0].id : null
  );
  const [isCreatingBoard, setIsCreatingBoard] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');

  const handleCreateMoodBoard = () => {
    if (!newBoardName.trim()) return;
    
    const newBoard = addMoodBoard({ name: newBoardName });
    setNewBoardName('');
    setIsCreatingBoard(false);
    setSelectedMoodBoardId(newBoard.id);
  };
  
  return (
    <AppLayout>
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-border flex justify-between items-center">
          <h2 className="text-xl font-bold">Mood Boards</h2>
          <Button onClick={() => setIsCreatingBoard(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Mood Board
          </Button>
        </div>
        
        {moodBoards.length > 0 && (
          <div className="border-b border-border">
            <div className="flex overflow-x-auto py-2 px-4">
              {moodBoards.map(board => (
                <button
                  key={board.id}
                  className={`px-4 py-2 rounded-md whitespace-nowrap mr-2 ${
                    selectedMoodBoardId === board.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary/30 hover:bg-secondary/50'
                  }`}
                  onClick={() => setSelectedMoodBoardId(board.id)}
                >
                  {board.name}
                </button>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex-1 overflow-hidden">
          {selectedMoodBoardId ? (
            <div className="h-full w-full">
              <MoodBoard id={selectedMoodBoardId} />
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center">
              <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-br from-cosmos-stardust to-cosmos-aurora nebula-glow flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">Create Your First Mood Board</h2>
              <p className="text-muted-foreground mb-6 max-w-md">
                Collect and organize images, quotes, and ideas in a visual board.
                Perfect for inspiration and creative projects.
              </p>
              <Button onClick={() => setIsCreatingBoard(true)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Create Mood Board
              </Button>
            </div>
          )}
        </div>
        
        <Dialog open={isCreatingBoard} onOpenChange={setIsCreatingBoard}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Mood Board</DialogTitle>
            </DialogHeader>
            <Input
              value={newBoardName}
              onChange={(e) => setNewBoardName(e.target.value)}
              placeholder="Mood Board Name"
              className="mt-4"
            />
            <DialogFooter className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsCreatingBoard(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateMoodBoard}>
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default MoodBoardPage;
