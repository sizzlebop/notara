import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { useNotes } from '@/context/NotesContextTypes';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CalendarIcon, Clock } from 'lucide-react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { cn } from '@/lib/utils';

const CalendarView: React.FC = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { notes, addNote } = useNotes();
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventContent, setEventContent] = useState('');
  const [eventTime, setEventTime] = useState('');
  
  // Filter notes for the selected date
  const notesOnDate = notes.filter(note => {
    if (!date) return false;
    const noteDate = new Date(note.createdAt);
    return (
      noteDate.getDate() === date.getDate() &&
      noteDate.getMonth() === date.getMonth() &&
      noteDate.getFullYear() === date.getFullYear()
    );
  });

  const handleAddEvent = () => {
    if (!eventTitle.trim() || !date) return;
    
    const eventDate = new Date(date.setHours(
      parseInt(eventTime.split(':')[0] || '0'),
      parseInt(eventTime.split(':')[1] || '0')
    ));
    
    addNote({
      title: eventTitle,
      content: eventContent,
      tags: [],
      isPinned: false,
      createdAt: eventDate.toISOString()
    });
    
    setEventTitle('');
    setEventContent('');
    setEventTime('');
    setIsAddingEvent(false);
  };
  
  return (
    <div className="flex flex-col h-full p-4 space-y-4 overflow-x-hidden">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-primary" />
          Calendar
        </h2>
        <Button onClick={() => setIsAddingEvent(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Event
        </Button>
      </div>
      
      <ResizablePanelGroup
        direction="horizontal"
        className="h-[calc(100%-3rem)] w-full"
      >
        <ResizablePanel 
          defaultSize={45} 
          minSize={40}
          className="bg-card/50 rounded-lg border border-border/50 backdrop-blur-sm shadow-lg cosmic-glow min-w-[400px]"
        >
          <div className="p-4 h-full flex flex-col items-center pt-8">
            <div className="calendar-wrapper w-full max-w-[380px]">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className={cn(
                  "mx-auto border-none bg-transparent",
                  "w-full [&_.rdp-caption]:text-xl [&_.rdp-caption]:font-semibold"
                )}
              />
              
              <div className="text-center mt-6">
                <h3 className="text-xl font-medium">
                  {date ? format(date, 'MMMM d, yyyy') : 'Select a date'}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Click on a date to view or add events
                </p>
              </div>
            </div>
          </div>
        </ResizablePanel>
        
        <ResizableHandle withHandle className="bg-border/30 hover:bg-primary/50 transition-colors" />
        
        <ResizablePanel defaultSize={55} className="bg-card/30 rounded-lg p-4 border border-border/50 flex flex-col min-w-[300px]">
          <h3 className="text-md font-semibold mb-3 px-2">
            {date ? `Events for ${format(date, 'MMMM d, yyyy')}` : 'Select a date'}
          </h3>
          
          {notesOnDate.length > 0 ? (
            <div className="space-y-3 overflow-y-auto flex-1">
              {notesOnDate.map(note => {
                const noteTime = new Date(note.createdAt);
                return (
                  <Card key={note.id} className="bg-secondary/30 hover:bg-secondary/40 transition-colors border-border/50 cosmic-glow">
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">{note.title}</h4>
                        <div className="text-sm text-muted-foreground flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {format(noteTime, 'h:mm a')}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{note.content.substring(0, 100)}</p>
                      <div className="flex gap-1 mt-1">
                        {note.tags.map(tag => (
                          <span 
                            key={tag.id} 
                            className="px-1.5 py-0.5 text-xs rounded-full" 
                            style={{ backgroundColor: `${tag.color}30`, color: tag.color }}
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground flex-1 flex flex-col items-center justify-center">
              <p>No events for this date</p>
              <Button variant="link" onClick={() => setIsAddingEvent(true)} className="mt-2">
                Add an event
              </Button>
            </div>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
      
      <Dialog open={isAddingEvent} onOpenChange={setIsAddingEvent}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Event for {date ? format(date, 'MMMM d, yyyy') : 'Selected Date'}</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="event-title" className="text-sm font-medium">
                Event Title
              </label>
              <Input
                id="event-title"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder="Enter event title"
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="event-time" className="text-sm font-medium">
                Time
              </label>
              <Input
                id="event-time"
                type="time"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="event-content" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="event-content"
                value={eventContent}
                onChange={(e) => setEventContent(e.target.value)}
                placeholder="Event details..."
                rows={4}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingEvent(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddEvent}>
              Add Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarView;
