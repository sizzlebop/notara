
import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { useNotes } from '@/context/NotesContext';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CalendarIcon, Clock } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

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
    <div className="flex flex-col h-full p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-primary" />
          Calendar
        </h2>
        <Button onClick={() => setIsAddingEvent(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Event
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100%-3rem)] overflow-hidden">
        <div className="bg-card/50 p-6 rounded-lg border border-border/50 backdrop-blur-sm shadow-lg cosmic-glow h-full flex flex-col">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="w-full max-w-full"
            classNames={{
              months: "flex flex-col sm:flex-row space-y-4 sm:space-x-8 sm:space-y-0",
              month: "space-y-6 w-full",
              caption: "flex justify-center pt-2 pb-1 relative items-center",
              caption_label: "text-base font-medium",
              nav: "space-x-2 flex items-center",
              nav_button: "h-8 w-8 bg-primary/10 rounded-full hover:bg-primary/20 transition-colors",
              table: "w-full border-collapse space-y-2",
              head_row: "flex w-full",
              head_cell: "text-muted-foreground rounded-md w-10 h-10 font-normal text-sm",
              row: "flex w-full mt-3",
              cell: "h-10 w-10 text-center text-sm relative [&:has([aria-selected])]:bg-primary/20 rounded-full",
              day: "h-10 w-10 p-0 font-normal aria-selected:opacity-100 rounded-full",
              day_selected: "bg-primary text-white hover:bg-primary hover:text-white",
              day_today: "bg-accent text-accent-foreground",
            }}
          />
          
          <div className="mt-6 text-center">
            <h3 className="text-lg font-medium">
              {date ? format(date, 'MMMM d, yyyy') : 'Select a date'}
            </h3>
            <p className="text-sm text-muted-foreground">
              Click on a date to view or add events
            </p>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto bg-card/30 rounded-lg p-4 border border-border/50 flex flex-col">
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
        </div>
      </div>
      
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
