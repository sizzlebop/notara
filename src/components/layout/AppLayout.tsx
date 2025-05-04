import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import ThemeSwitcher from '../ui-custom/ThemeSwitcher';
import { Search, Bell, Settings, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="h-screen flex overflow-hidden font-poppins">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <main className={cn(
        "flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300",
        isSidebarOpen ? "ml-64" : "ml-0"
      )}>
        <header className="p-3 flex justify-between items-center border-b border-border/40 bg-card/80 backdrop-blur-md">
          <div className="flex items-center">
            {!isSidebarOpen && (
              <Button 
                onClick={() => setIsSidebarOpen(true)}
                variant="ghost"
                size="icon"
                className="mr-4 rounded-full hover:bg-secondary/50 transition-colors hover:scale-105"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <div className="flex items-center">
              <div className="mr-2 h-8 w-8 rounded-full overflow-hidden bg-gradient-to-br from-cosmos-nebula to-cosmos-stardust cosmic-glow flex items-center justify-center">
                <img src="/logo.png" alt="Notara Logo" className="w-full h-full object-cover" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-cosmos-nebula bg-clip-text text-transparent">Notara</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-secondary/50 transition-colors hover:scale-105">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-secondary/50 transition-colors hover:scale-105">
              <Bell className="h-5 w-5" />
            </Button>
            <Link to="/settings">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-secondary/50 transition-colors hover:scale-105">
                <Settings className="h-5 w-5" />
              </Button>
            </Link>
            <ThemeSwitcher />
          </div>
        </header>
        
        <div className="flex-1 overflow-hidden">
          <ResizablePanelGroup 
            direction="horizontal" 
            className="h-full animate-fade-in"
          >
            {children}
          </ResizablePanelGroup>
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
