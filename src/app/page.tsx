
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HeartPulse, LogIn, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/firebase';
import {
  initiateEmailSignUp,
  initiateEmailSignIn,
  initiateGoogleSignIn,
  initiateGitHubSignIn,
} from '@/firebase/non-blocking-login';
import { Separator } from '@/components/ui/separator';

// Simple SVG icons for brands
const GoogleIcon = () => (
  <svg className="mr-2 h-4 w-4" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039L38.485 13.85C34.597 10.334 29.608 8 24 8c-13.255 0-24 10.745-24 24s10.745 24 24 24c11.026 0 20.24-7.818 22.46-18.069H43.611z" />
    <path fill="#FF3D00" d="M6.306 14.691c-2.459 3.999-3.905 8.601-3.905 13.309s1.446 9.31 3.905 13.309l7.585-5.979C12.443 32.191 12 28.754 12 25c0-3.754.443-7.191 1.891-10.309l-7.585-5.979z" />
    <path fill="#4CAF50" d="M24 44c5.608 0 10.597-2.334 14.485-5.85l-7.961-6.191c-2.119 1.885-4.902 3.039-7.961 3.039c-5.223 0-9.651-3.343-11.303-8H2.468C4.76 36.182 13.974 44 24 44z" />
    <path fill="#1976D2" d="M43.611 20.083H24v8h19.611c-0.219-2.73-1.04-5.337-2.399-7.755L43.611 20.083z" />
  </svg>
);

const GitHubIcon = () => (
  <svg className="mr-2 h-4 w-4" viewBox="0 0 16 16">
    <path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59c.4.07.55-.17.55-.38c0-.19-.01-.82-.01-1.49c-2.01.37-2.53-.49-2.69-.94c-.09-.23-.48-.94-.82-1.13c-.28-.15-.68-.52-.01-.53c.63-.01 1.08.58 1.23.82c.72 1.21 1.87.87 2.33.66c.07-.52.28-.87.51-1.07c-1.78-.2-3.64-.89-3.64-3.95c0-.87.31-1.59.82-2.15c-.08-.2-.36-1.02.08-2.12c0 0 .67-.21 2.2.82c.64-.18 1.32-.27 2-.27c.68 0 1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82c.44 1.1.16 1.92.08 2.12c.51.56.82 1.27.82 2.15c0 3.07-1.87 3.75-3.65 3.95c.29.25.54.73.54 1.48c0 1.07-.01 1.93-.01 2.2c0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
  </svg>
);

export default function AuthenticationPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { toast } = useToast();
  const auth = useAuth();
  const router = useRouter();

  const handleSignUp = () => {
    if (!name || !email || !password) {
      toast({
        variant: 'destructive',
        title: 'Missing fields',
        description: 'Please enter your name, email, and password.',
      });
      return;
    }
    initiateEmailSignUp(auth, email, password, name);
    toast({
      title: 'Sign up initiated',
      description: 'Please check your email for verification.',
    });
    router.push('/home');
  };

  const handleLogin = () => {
    if (!email || !password) {
      toast({
        variant: 'destructive',
        title: 'Missing fields',
        description: 'Please enter both email and password.',
      });
      return;
    }
    initiateEmailSignIn(auth, email, password);
    router.push('/home');
  };

  const handleSocialSignIn = (provider: 'google' | 'github') => {
    const signInFunction = provider === 'google' ? initiateGoogleSignIn : initiateGitHubSignIn;
    signInFunction(auth);
    router.push('/home');
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="flex items-center gap-3 mb-8">
        <HeartPulse className="h-12 w-12 text-primary" />
        <h1 className="font-headline text-5xl font-bold tracking-wider text-foreground">
          POTS Tracker
        </h1>
      </div>
      <Tabs defaultValue="login" className="w-full max-w-md">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login"><LogIn className="mr-2" />Login</TabsTrigger>
          <TabsTrigger value="signup"><UserPlus className="mr-2" />Sign Up</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>Login</CardTitle>
              <CardDescription>
                Access your account to track your progress.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" onClick={() => handleSocialSignIn('google')}>
                  <GoogleIcon /> Google
                </Button>
                <Button variant="outline" onClick={() => handleSocialSignIn('github')}>
                  <GitHubIcon /> GitHub
                </Button>
              </div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input id="login-email" type="email" placeholder="m@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={handleLogin}>Login</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="signup">
          <Card>
            <CardHeader>
              <CardTitle>Sign Up</CardTitle>
              <CardDescription>
                Create an account to start managing your POTS symptoms.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" onClick={() => handleSocialSignIn('google')}>
                  <GoogleIcon /> Google
                </Button>
                <Button variant="outline" onClick={() => handleSocialSignIn('github')}>
                  <GitHubIcon /> GitHub
                </Button>
              </div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
               <div className="space-y-2">
                <Label htmlFor="signup-name">Full Name</Label>
                <Input id="signup-name" type="text" placeholder="Jane Doe" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input id="signup-email" type="email" placeholder="m@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input id="signup-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={handleSignUp}>Create Account</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
