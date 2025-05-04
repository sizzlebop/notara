import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Github, LogOut, ExternalLink, Copy, Share2, Save, Download, UserCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

const SettingsPage: React.FC = () => {
  const [theme, setTheme] = useState('dark');
  const [fontSize, setFontSize] = useState('16');
  const [autoSave, setAutoSave] = useState(true);
  const [spellCheck, setSpellCheck] = useState(true);
  const [exportFormat, setExportFormat] = useState('markdown');
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');

  const { user, isAuthenticated, signInWithGithub, signOut } = useAuth();

  const handleSaveSettings = () => {
    toast({
      title: "Settings saved",
      description: "Your settings have been updated successfully."
    });
  };

  const handleResetSettings = () => {
    setTheme('dark');
    setFontSize('16');
    setAutoSave(true);
    setSpellCheck(true);
    setExportFormat('markdown');
    
    toast({
      title: "Settings reset",
      description: "Your settings have been reset to defaults."
    });
  };

  const handleConnectSupabase = () => {
    if (!supabaseUrl || !supabaseKey) {
      toast({
        title: "Missing credentials",
        description: "Please enter both Supabase URL and API key",
        variant: "destructive"
      });
      return;
    }

    // Initialize Supabase with the provided credentials
    // This would typically update the supabase client in a real app
    toast({
      title: "Supabase connected",
      description: "Your Supabase credentials have been saved."
    });
  };

  const handleExportData = () => {
    toast({
      title: "Export successful",
      description: `Your data has been exported in ${exportFormat} format.`
    });
  };

  const handleShareApp = () => {
    navigator.clipboard.writeText(window.location.origin);
    toast({
      title: "Link copied",
      description: "App link copied to clipboard"
    });
  };

  const handleConnectGDrive = () => {
    toast({
      title: "Google Drive integration",
      description: isAuthenticated ? "Connecting to Google Drive..." : "Please sign in first to connect to Google Drive."
    });
  };

  const handleConnectDropbox = () => {
    toast({
      title: "Dropbox integration",
      description: isAuthenticated ? "Connecting to Dropbox..." : "Please sign in first to connect to Dropbox."
    });
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 max-w-5xl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <Tabs defaultValue="appearance" className="w-full">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="appearance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Theme Settings</CardTitle>
                <CardDescription>Customize how Notara looks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                      <SelectItem value="cosmic">Cosmic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="font-size">Font Size</Label>
                  <Select value={fontSize} onValueChange={setFontSize}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select font size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12">Small (12px)</SelectItem>
                      <SelectItem value="14">Medium (14px)</SelectItem>
                      <SelectItem value="16">Large (16px)</SelectItem>
                      <SelectItem value="18">X-Large (18px)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="animations">Enable Animations</Label>
                  <Switch id="animations" defaultChecked />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleResetSettings}>Reset</Button>
                <Button onClick={handleSaveSettings}>Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="editor" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Editor Settings</CardTitle>
                <CardDescription>Customize your writing experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="autosave">Auto Save</Label>
                  <Switch 
                    id="autosave" 
                    checked={autoSave} 
                    onCheckedChange={setAutoSave} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="spellcheck">Spell Check</Label>
                  <Switch 
                    id="spellcheck" 
                    checked={spellCheck} 
                    onCheckedChange={setSpellCheck} 
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="markdown-preview">Live Markdown Preview</Label>
                  <Switch id="markdown-preview" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="line-numbers">Show Line Numbers</Label>
                  <Switch id="line-numbers" />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleResetSettings}>Reset</Button>
                <Button onClick={handleSaveSettings}>Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="account" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isAuthenticated ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cosmos-nebula via-cosmos-aurora to-cosmos-stardust flex items-center justify-center font-medium text-white">
                        {user?.user_metadata?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="font-medium">{user?.user_metadata?.full_name || user?.email}</p>
                        <p className="text-sm text-muted-foreground">{user?.email}</p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <Link to="/settings/profile" className="w-full">
                      <Button 
                        variant="outline" 
                        className="w-full flex items-center gap-2 justify-center"
                      >
                        <UserCircle size={16} />
                        Manage Profile
                      </Button>
                    </Link>
                    
                    <Button 
                      onClick={signOut} 
                      variant="destructive" 
                      className="w-full flex items-center gap-2 justify-center"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Supabase Credentials</Label>
                      <p className="text-sm text-muted-foreground mb-2">
                        Enter your Supabase credentials to enable authentication and data sync.
                      </p>
                      <Input
                        placeholder="Supabase URL"
                        value={supabaseUrl}
                        onChange={(e) => setSupabaseUrl(e.target.value)}
                        className="mb-2"
                      />
                      <Input
                        type="password"
                        placeholder="Supabase API Key"
                        value={supabaseKey}
                        onChange={(e) => setSupabaseKey(e.target.value)}
                      />
                      <Button onClick={handleConnectSupabase} className="w-full mt-2">
                        Connect Supabase
                      </Button>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <p className="text-sm text-muted-foreground mb-4">
                        Sign in to enable sync across devices and other features.
                      </p>
                      <Button onClick={signInWithGithub} variant="outline" className="w-full flex items-center gap-2">
                        <Github size={16} />
                        Sign in with GitHub
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>External Integrations</CardTitle>
                <CardDescription>Connect to external services</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">GitHub</h3>
                      <p className="text-sm text-muted-foreground">Sync your notes with GitHub repositories</p>
                    </div>
                    <Button 
                      onClick={isAuthenticated ? () => {} : signInWithGithub} 
                      variant="outline" 
                      className="flex items-center gap-2"
                    >
                      <Github size={16} />
                      {isAuthenticated ? "Connected" : "Connect"}
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">Google Drive</h3>
                      <p className="text-sm text-muted-foreground">Back up notes to Google Drive</p>
                    </div>
                    <Button onClick={handleConnectGDrive} variant="outline" className="flex items-center gap-2">
                      <ExternalLink size={16} />
                      Connect
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">Dropbox</h3>
                      <p className="text-sm text-muted-foreground">Sync notes with Dropbox</p>
                    </div>
                    <Button onClick={handleConnectDropbox} variant="outline" className="flex items-center gap-2">
                      <ExternalLink size={16} />
                      Connect
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label>Export Data</Label>
                  <div className="flex gap-2">
                    <Select value={exportFormat} onValueChange={setExportFormat}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="markdown">Markdown (.md)</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="html">HTML</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={handleExportData} className="flex items-center gap-2">
                      <Download size={16} />
                      Export
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="about" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>About Notara</CardTitle>
                <CardDescription>App information and links</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium text-lg mb-2">Notara</h3>
                  <p className="text-muted-foreground">Version 1.0.0</p>
                  <p className="text-muted-foreground mt-4">
                    A beautiful note-taking app with a cosmic theme and powerful features.
                  </p>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h3 className="font-medium">Share Notara</h3>
                  <Button onClick={handleShareApp} variant="outline" className="flex items-center gap-2">
                    <Share2 size={16} />
                    Copy Link
                  </Button>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h3 className="font-medium">Support</h3>
                  <div className="flex flex-col gap-2">
                    <Button variant="link" className="h-auto p-0 justify-start" asChild>
                      <a href="/markdown-cheatsheet" className="flex items-center gap-2">
                        <ExternalLink size={14} />
                        Markdown Cheatsheet
                      </a>
                    </Button>
                    <Button variant="link" className="h-auto p-0 justify-start" asChild>
                      <a href="#" className="flex items-center gap-2">
                        <ExternalLink size={14} />
                        Report an Issue
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-xs text-muted-foreground">
                  © {new Date().getFullYear()} Notara. All rights reserved.
                </p>
              </CardFooter>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
