
import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import CalendarView from '@/components/notes/CalendarView';
import { ResizablePanel } from '@/components/ui/resizable';

const CalendarPage: React.FC = () => {
  return (
    <AppLayout>
      <ResizablePanel defaultSize={100} minSize={30}>
        <CalendarView />
      </ResizablePanel>
    </AppLayout>
  );
};

export default CalendarPage;
