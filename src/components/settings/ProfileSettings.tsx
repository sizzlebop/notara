import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';
import { Github, Mail, UserCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

const ProfileSettings = () => {
  const { user, isAuthenticated } = useAuth();
  const [displayName, setDisplayName] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      // Initialize form with user data
      setDisplayName(
        user.user_metadata?.full_name || 
        user.user_metadata?.name || 
        user.email?.split('@')[0] || 
        ''
      );
      setAvatarUrl(user.user_metadata?.avatar_url || '');
    }
  }, [user]);

  const getUserInitials = () => {
    if (!user) return '?';
    
    const name = user.user_metadata?.full_name || user.email || '';
    if (!name) return '?';
    
    if (name.includes('@')) {
      // If it's an email, use first letter of email
      return name.substring(0, 1).toUpperCase();
    }
    
    // If it's a name, use initials
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].substring(0, 1).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getAuthMethod = () => {
    if (!user) return '';
    
    if (user.app_metadata?.provider === 'github') {
      return 'GitHub';
    } else if (user.email) {
      return 'Email';
    }
    
    return '';
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      // In a real implementation, you would update the user metadata via Supabase
      // For now, we'll just show a success message
      toast({
        title: "Profile updated",
        description: "Your profile information has been saved.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update failed",
        description: "There was an error updating your profile.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>Sign in to manage your profile</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <UserCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                You need to sign in to access your profile settings.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="backdrop-blur-md bg-card/80">
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>Manage your personal information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
          <Avatar className="h-24 w-24 cosmic-glow">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt={displayName} />
            ) : (
              <AvatarFallback className="text-xl bg-gradient-to-br from-cosmos-nebula to-cosmos-stardust">
                {getUserInitials()}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-xl font-medium">{displayName || 'User'}</h3>
            <div className="flex items-center justify-center sm:justify-start space-x-1 text-sm text-muted-foreground">
              {getAuthMethod() === 'GitHub' ? (
                <>
                  <Github className="h-4 w-4" />
                  <span>GitHub Account</span>
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4" />
                  <span>Email Account</span>
                </>
              )}
            </div>
            <div className="text-sm text-muted-foreground">{user?.email}</div>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="display-name">Display Name</Label>
            <Input
              id="display-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your display name"
            />
            <p className="text-xs text-muted-foreground">
              This is how your name will appear in the app.
            </p>
          </div>

          {getAuthMethod() !== 'GitHub' && (
            <div className="space-y-2">
              <Label htmlFor="avatar-url">Avatar URL</Label>
              <Input
                id="avatar-url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/your-avatar.jpg"
              />
              <p className="text-xs text-muted-foreground">
                Enter a URL to an image to use as your avatar.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>Account Information</Label>
          <div className="rounded-md bg-secondary/30 p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">User ID</span>
              <span className="text-sm font-mono text-muted-foreground">{user?.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Authentication Method</span>
              <span className="text-sm font-medium">{getAuthMethod()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Email</span>
              <span className="text-sm">{user?.email}</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Cancel</Button>
        <Button 
          onClick={handleSaveProfile} 
          disabled={saving}
          className="bg-gradient-to-r from-primary to-cosmos-nebula hover:from-cosmos-nebula hover:to-primary transition-all duration-500"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProfileSettings; 