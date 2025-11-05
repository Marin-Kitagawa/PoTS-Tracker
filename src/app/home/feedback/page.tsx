'use client';

import { useActionState, useRef, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { useUser } from '@/firebase';
import { sendFeedback } from '@/app/actions/send-feedback';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Send, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Submitting...' : 'Submit Feedback'}
      <Send className="ml-2 h-4 w-4" />
    </Button>
  );
}

export default function FeedbackPage() {
  const { user, isUserLoading } = useUser();
  const initialState = { success: false, error: null };
  const [state, formAction] = useActionState(sendFeedback, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (state.success) {
      toast({
        title: 'Feedback Sent!',
        description: 'Thank you for your feedback. We appreciate you helping us improve the app.',
      });
      formRef.current?.reset();
    } else if (state.error) {
      toast({
        variant: 'destructive',
        title: 'Oh no! Something went wrong.',
        description: state.error,
      });
    }
  }, [state, toast]);

  if (isUserLoading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    // Should be handled by layout/auth wrapper, but as a fallback.
    return <p>Please sign in to provide feedback.</p>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Submit Feedback</h1>
        <p className="text-muted-foreground">Have a bug to report, a feature to request, or some feedback?</p>
      </div>

       {user && !user.emailVerified && (
        <Alert variant="destructive" className="mb-6">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Email Verification Required</AlertTitle>
          <AlertDescription>
            You must verify your email address before you can submit feedback. Please check your inbox for a verification link or visit your profile to resend it.
          </AlertDescription>
        </Alert>
       )}

      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertTitle>Email Server Configuration</AlertTitle>
        <AlertDescription>
            <p>This form sends an email using the SMTP settings in the <code>.env</code> file. If you see an error about the email service not being configured or failing to send, please ensure your credentials are correct.</p>
            <p className="mt-2">Many email providers (like Gmail/Google Workspace) require an <strong className="font-semibold">App Password</strong> instead of your regular password for security. See these guides for more info:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><Link href="https://support.google.com/accounts/answer/185833" target="_blank" rel="noopener noreferrer" className="underline">Google/Gmail App Passwords</Link></li>
                <li><Link href="https://support.microsoft.com/en-us/account-billing/using-app-passwords-with-apps-that-don-t-support-two-step-verification-5896ed9b-4263-e681-128a-a6f2979a7944" target="_blank" rel="noopener noreferrer" className="underline">Microsoft/Outlook App Passwords</Link></li>
            </ul>
        </AlertDescription>
      </Alert>

      <Card>
        <form ref={formRef} action={formAction}>
          <input type="hidden" name="userEmail" value={user.email || ''} />
          <CardHeader>
            <CardTitle>Feedback Form</CardTitle>
            <CardDescription>Let us know what's on your mind. We read every submission. Markdown is supported.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="type">Feedback Type</Label>
              <Select name="type" defaultValue="bug" required disabled={!user.emailVerified}>
                <SelectTrigger id="type" className="w-full md:w-1/2">
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bug">Bug Report</SelectItem>
                  <SelectItem value="feature">Feature Request</SelectItem>
                  <SelectItem value="feedback">General Feedback</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                name="message"
                placeholder="Please be as detailed as possible... You can use Markdown for formatting."
                rows={8}
                required
                minLength={10}
                disabled={!user.emailVerified}
              />
            </div>
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
