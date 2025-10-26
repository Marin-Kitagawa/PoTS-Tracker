'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth, useUser, useFirestore, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import {
  updateProfile,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser,
  sendEmailVerification,
} from 'firebase/auth';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

const profileSchema = z.object({
  displayName: z.string().min(1, 'Name is required').optional(),
});

const emailSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

export default function ProfilePage() {
  const { user } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  const [isReauthenticating, setIsReauthenticating] = useState(false);
  const [reauthAction, setReauthAction] = useState<(() => Promise<void>) | null>(null);
  const [reauthPassword, setReauthPassword] = useState('');


  const { register: registerProfile, handleSubmit: handleSubmitProfile, formState: { errors: profileErrors }, reset: resetProfile } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { displayName: user?.displayName || '' },
  });

  useEffect(() => {
    if (user) {
      resetProfile({ displayName: user.displayName || '' });
    }
  }, [user, resetProfile]);

  const { register: registerEmail, handleSubmit: handleSubmitEmail, formState: { errors: emailErrors } } = useForm({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: user?.email || '', password: '' },
  });

  const { register: registerPassword, handleSubmit: handleSubmitPassword, formState: { errors: passwordErrors } } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmitProfile = async (data: z.infer<typeof profileSchema>) => {
    if (!user || !firestore) return;
    try {
      // Update Auth
      await updateProfile(user, { displayName: data.displayName });
      
      // Update Firestore
      const userDocRef = doc(firestore, 'users', user.uid);
      setDocumentNonBlocking(userDocRef, { displayName: data.displayName }, { merge: true });

      toast({ title: 'Success', description: 'Your name has been updated.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  const onSubmitEmail = async (data: z.infer<typeof emailSchema>) => {
    const action = async () => {
        if (!user || !firestore) return;
        try {
            // Update Auth
            await updateEmail(user, data.email);
            
            // Update Firestore
            const userDocRef = doc(firestore, 'users', user.uid);
            setDocumentNonBlocking(userDocRef, { email: data.email }, { merge: true });

            toast({ title: 'Success', description: 'Your email has been updated. Please verify your new email.' });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        }
    };
    promptForReauthentication(data.password, action);
  };
  
  const onSubmitPassword = async (data: z.infer<typeof passwordSchema>) => {
      const action = async () => {
        if (!user) return;
        try {
          await updatePassword(user, data.newPassword);
          toast({ title: 'Success', description: 'Your password has been updated.' });
        } catch (error: any) {
          toast({ variant: 'destructive', title: 'Error', description: error.message });
        }
      };
      promptForReauthentication(data.currentPassword, action);
  };

  const handleDeleteAccount = async () => {
      const action = async () => {
        if (!user) return;
        try {
          await deleteUser(user);
          toast({ title: 'Account Deleted', description: 'Your account has been permanently deleted.' });
          router.push('/');
        } catch (error: any) {
          toast({ variant: 'destructive', title: 'Error', description: error.message });
        }
      };
      // For account deletion, we need to be extra sure, so we prompt for password.
      // We open a new reauth dialog specifically for this.
      setReauthAction(() => action);
      setIsReauthenticating(true);
  };

  const promptForReauthentication = async (password: string, action: () => Promise<void>) => {
    if (!user || !user.email) return;
    const credential = EmailAuthProvider.credential(user.email, password);
    try {
        await reauthenticateWithCredential(user, credential);
        await action();
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Authentication Failed', description: 'The password you entered is incorrect. Please try again.' });
    }
  };
  
  const handleReauthentication = async () => {
    if (!user || !user.email || !reauthAction) return;

    const credential = EmailAuthProvider.credential(user.email, reauthPassword);
    try {
        await reauthenticateWithCredential(user, credential);
        await reauthAction();
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Authentication Failed', description: 'The password you entered is incorrect. Please try again.' });
    } finally {
        setIsReauthenticating(false);
        setReauthPassword('');
        setReauthAction(null);
    }
  };

  const handleResendVerification = async () => {
    if (!user) return;
    try {
        await sendEmailVerification(user);
        toast({ title: 'Verification Email Sent', description: 'Please check your inbox.' });
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  }

  return (
    <>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Profile</h1>
          <p className="text-muted-foreground">Manage your account settings.</p>
        </div>

        {user && !user.emailVerified && (
          <Alert>
            <Terminal className="h-4 w-4" />
            <AlertTitle>Email not verified</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              <p>Please check your inbox to verify your email address.</p>
              <Button variant="outline" onClick={handleResendVerification}>Resend Verification</Button>
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Update Name</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmitProfile(onSubmitProfile)}>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="displayName">Name</Label>
                <Input id="displayName" {...registerProfile('displayName')} />
                {profileErrors.displayName && <p className="text-destructive text-sm">{profileErrors.displayName.message}</p>}
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit">Save Name</Button>
            </CardFooter>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Update Email</CardTitle>
            <CardDescription>You will need to enter your current password to change your email.</CardDescription>
          </CardHeader>
           <form onSubmit={handleSubmitEmail(onSubmitEmail)}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">New Email</Label>
                <Input id="email" type="email" {...registerEmail('email')} />
                 {emailErrors.email && <p className="text-destructive text-sm">{emailErrors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-password">Current Password</Label>
                <Input id="email-password" type="password" {...registerEmail('password')} />
                 {emailErrors.password && <p className="text-destructive text-sm">{emailErrors.password.message}</p>}
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit">Update Email</Button>
            </CardFooter>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Update Password</CardTitle>
            <CardDescription>You will need to enter your current password to change it.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmitPassword(onSubmitPassword)}>
            <CardContent className="space-y-4">
               <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" type="password" {...registerPassword('currentPassword')} />
                 {passwordErrors.currentPassword && <p className="text-destructive text-sm">{passwordErrors.currentPassword.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" {...registerPassword('newPassword')} />
                {passwordErrors.newPassword && <p className="text-destructive text-sm">{passwordErrors.newPassword.message}</p>}
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit">Update Password</Button>
            </CardFooter>
          </form>
        </Card>

        <Card className="border-destructive">
           <CardHeader>
            <CardTitle>Delete Account</CardTitle>
            <CardDescription>This action is irreversible and will permanently delete all your data.</CardDescription>
          </CardHeader>
          <CardFooter>
             <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive">Delete My Account</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your account
                        and remove your data from our servers. Please enter your password to confirm.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-2">
                        <Label htmlFor="delete-password">Password</Label>
                        <Input 
                            id="delete-password" 
                            type="password"
                            value={reauthPassword}
                            onChange={(e) => setReauthPassword(e.target.value)}
                        />
                    </div>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount} disabled={!reauthPassword}>
                        Continue
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
