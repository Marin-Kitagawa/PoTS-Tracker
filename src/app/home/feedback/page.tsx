'use client';

import { useActionState, useFormStatus } from 'react-dom';
import { useUser } from '@/firebase';
import { sendFeedback } from '@/app/actions/send-feedback';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

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
  const [initialState, setInitialState] = useState<{ success: boolean; error: string | null }>({ success: false, error: null });
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

  if (!user.emailVerified) {
    return (
      <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Email Verification Required</AlertTitle>
        <AlertDescription>
          You must verify your email address before you can submit feedback. Please check your inbox for a verification link or visit your profile to resend it.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Submit Feedback</h1>
        <p className="text-muted-foreground">Have a bug to report, a feature to request, or some feedback?</p>
      </div>

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
              <Select name="type" defaultValue="bug" required>
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
