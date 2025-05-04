import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { AlertTriangleIcon, BugIcon, GithubIcon } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import AuthDebug from '@/components/ui-custom/AuthDebug';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const AuthPage: React.FC = () => {
  const { user, signInWithEmail, signUpWithEmail, signInWithGithub, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDebugger, setShowDebugger] = useState(false);

  // If user is already authenticated, redirect to home page
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleEmailAuth = async (isSignUp: boolean) => {
    setLoading(true);
    setError(null);
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGithubAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGithub();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'GitHub authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex items-center justify-center h-full">
        <div className="w-full max-w-md p-4 space-y-4 relative z-10">
          <div className="w-24 h-24 mb-6 mx-auto rounded-full bg-gradient-to-br from-cosmos-nebula to-cosmos-stardust cosmic-glow flex items-center justify-center float animate-float">
            <span className="text-3xl">✨</span>
          </div>
          
          {showDebugger ? (
            <AuthDebug onClose={() => setShowDebugger(false)} />
          ) : (
            <Card className="bg-card/70 backdrop-blur-lg border-border/30">
              <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-white to-primary/80 bg-clip-text text-transparent">
                  Welcome to Notara
                </CardTitle>
                <CardDescription>
                  Sign in to access your cosmic notes
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive" className="bg-red-900/30 border-red-500/50">
                    <AlertTriangleIcon className="h-4 w-4" />
                    <AlertTitle>Authentication Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <Tabs defaultValue="signin" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="signin">Sign In</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="signin" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    <Button 
                      className="w-full bg-gradient-to-r from-primary to-cosmos-nebula hover:from-cosmos-nebula hover:to-primary transition-all duration-500"
                      onClick={() => handleEmailAuth(false)}
                      disabled={loading}
                    >
                      {loading ? 'Signing in...' : 'Sign In'}
                    </Button>
                  </TabsContent>
                  
                  <TabsContent value="signup" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    <Button 
                      className="w-full bg-gradient-to-r from-primary to-cosmos-nebula hover:from-cosmos-nebula hover:to-primary transition-all duration-500"
                      onClick={() => handleEmailAuth(true)}
                      disabled={loading}
                    >
                      {loading ? 'Signing up...' : 'Sign Up'}
                    </Button>
                  </TabsContent>
                </Tabs>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border/50"></span>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full space-x-2 bg-card hover:bg-muted/50"
                  onClick={handleGithubAuth}
                  disabled={loading}
                >
                  <GithubIcon className="h-4 w-4" />
                  <span>GitHub</span>
                </Button>
              </CardContent>
              
              <CardFooter className="flex flex-col gap-4">
                <p className="text-xs text-muted-foreground">
                  By signing in, you agree to our Terms of Service and Privacy Policy
                </p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs text-muted-foreground hover:text-primary"
                  onClick={() => setShowDebugger(true)}
                >
                  <BugIcon className="h-3 w-3 mr-1" />
                  Debug Authentication
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default AuthPage; 