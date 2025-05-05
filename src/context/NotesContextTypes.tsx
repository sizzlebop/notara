import React, { createContext } from 'react';
import { Note, NoteTag, MoodBoard } from '../types';

export interface NotesContextType {
  notes: Note[];
  tags: NoteTag[];
  moodBoards: MoodBoard[];
  activeNote: Note | null;
  addNote: (note: Partial<Note>) => Note;
  updateNote: (id: string, note: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  addTag: (tag: Partial<NoteTag>) => void;
  updateTag: (id: string, tag: Partial<NoteTag>) => void;
  deleteTag: (id: string) => void;
  setActiveNote: (note: Note | null) => void;
  addMoodBoard: (moodBoard: Partial<MoodBoard>) => MoodBoard;
  updateMoodBoard: (id: string, moodBoard: Partial<MoodBoard>) => void;
  deleteMoodBoard: (id: string) => void;
}

export const NotesContext = createContext<NotesContextType | undefined>(undefined);

export const useNotes = (): NotesContextType => {
  const context = React.useContext(NotesContext);
  if (context === undefined) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
}; 