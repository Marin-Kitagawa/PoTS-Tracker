'use client';

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';
import { ActivityFeed } from '@/components/activity-feed';

const symptoms = [
  "Dizziness",
  "Lightheadedness",
  "Tachycardia (fast heart rate)",
  "Fatigue",
  "Brain Fog",
  "Palpitations",
  "Headache",
  "Nausea",
  "Shortness of Breath",
  "Tremulousness",
  "Visual Disturbances"
];

const symptomSchema = z.object({
  symptom: z.string(),
  severity: z.number().min(0).max(10),
  notes: z.string().optional(),
});

type SymptomFormData = z.infer<typeof symptomSchema>;

function logActivity(firestore: any, userId: string, type: string, description: string) {
    if (!firestore || !userId) return;
    const activityColRef = collection(firestore, `users/${userId}/activity_logs`);
    addDocumentNonBlocking(activityColRef, {
        type,
        description,
        timestamp: serverTimestamp()
    });
}

function SymptomLogCard({ symptom, onLog }: { symptom: string, onLog: (data: SymptomFormData) => void }) {
  const { control, handleSubmit, watch, reset } = useForm<SymptomFormData>({
    resolver: zodResolver(symptomSchema),
    defaultValues: {
      symptom: symptom,
      severity: 0,
      notes: '',
    },
  });

  const severity = watch('severity');

  const onSubmit = (data: SymptomFormData) => {
    onLog(data);
    reset({ symptom: symptom, severity: 0, notes: '' });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>{symptom}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Severity: {severity}</Label>
            <Controller
              name="severity"
              control={control}
              render={({ field }) => (
                <Slider
                  min={0}
                  max={10}
                  step={1}
                  value={[field.value]}
                  onValueChange={(value) => field.onChange(value[0])}
                />
              )}
            />
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <Textarea {...field} placeholder="Any specific details..." />
              )}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit">Log Symptom</Button>
        </CardFooter>
      </Card>
    </form>
  );
}

export default function SymptomsPage() {
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();

  const handleLogSymptom = (data: SymptomFormData) => {
    if (!auth.currentUser) {
      toast({
        variant: "destructive",
        title: "Not authenticated",
        description: "You must be logged in to log symptoms.",
      });
      return;
    }

    const logData = {
      ...data,
      userId: auth.currentUser.uid,
      timestamp: new Date(),
    };
    
    const collectionRef = collection(firestore, 'users', auth.currentUser.uid, 'symptom_logs');
    addDocumentNonBlocking(collectionRef, logData);
    
    logActivity(firestore, auth.currentUser.uid, 'Symptom', `Logged ${data.symptom} with severity ${data.severity}.`);

    toast({
      title: "Symptom Logged",
      description: `${data.symptom} was logged with severity ${data.severity}.`,
    });
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Symptom Tracking</h1>
        <p className="text-muted-foreground">Log your daily symptoms, severity, and any relevant notes.</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {symptoms.map(symptom => (
          <SymptomLogCard key={symptom} symptom={symptom} onLog={handleLogSymptom} />
        ))}
      </div>
      <ActivityFeed filterType="Symptom" />
    </div>
  );
}
