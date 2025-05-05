import React, { useState, useEffect } from 'react';
import { useNotes } from '@/context/NotesContextTypes';
import { Note } from '@/types';
import { Button } from '@/components/ui/button';
import TagSelector from './TagSelector';
import MarkdownPreview from './MarkdownPreview';

interface NoteEditorProps {
  note?: Note;
  isNew?: boolean;
  onSave?: (note: Note) => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ note, isNew = false, onSave }) => {
  const { addNote, updateNote, tags } = useNotes();
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [selectedTags, setSelectedTags] = useState(note?.tags || []);
  const [isPinned, setIsPinned] = useState(note?.isPinned || false);
  const [isPreview, setIsPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setSelectedTags(note.tags);
      setIsPinned(note.isPinned);
    }
  }, [note]);

  const handleSave = () => {
    setIsSaving(true);
    
    const saveData = {
      title: title || 'Untitled',
      content,
      tags: selectedTags,
      isPinned
    };

    let savedNote;

    if (isNew) {
      savedNote = addNote(saveData);
    } else if (note) {
      updateNote(note.id, saveData);
      savedNote = { ...note, ...saveData };
    }

    setIsSaving(false);
    
    if (onSave && savedNote) {
      onSave(savedNote as Note);
    }
  };

  const togglePin = () => {
    setIsPinned(!isPinned);
  };

  const togglePreview = () => {
    setIsPreview(!isPreview);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border flex justify-between items-center">
        <div className="flex items-center gap-2">
          <button
            onClick={togglePin}
            className={`p-2 rounded-md ${
              isPinned ? 'text-primary' : 'text-muted-foreground'
            }`}
            aria-label={isPinned ? 'Unpin note' : 'Pin note'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={isPinned ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className=""><path d="M12 3L10 14 14 14 12 21 12 21 14 11 10 11 12 3z" transform="rotate(45, 12, 12)"></path></svg>
          </button>
          <div className="flex gap-2">
            <Button
              onClick={togglePreview}
              variant="ghost"
              size="sm"
              className={isPreview ? 'bg-secondary' : ''}
            >
              Preview
            </Button>
          </div>
        </div>
        <div className="flex gap-2">
          <TagSelector
            selectedTags={selectedTags}
            onChange={setSelectedTags}
            availableTags={tags}
          />
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="ml-2"
            size="sm"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      <div className="p-4 flex-1 overflow-auto">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note Title"
          className="w-full text-2xl font-bold mb-4 bg-transparent border-none outline-none focus:ring-0"
        />

        {isPreview ? (
          <MarkdownPreview content={content} />
        ) : (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start typing..."
            className="w-full h-[calc(100%-4rem)] bg-transparent border-none outline-none resize-none font-mono focus:ring-0"
          />
        )}
      </div>
    </div>
  );
};

export default NoteEditor;
