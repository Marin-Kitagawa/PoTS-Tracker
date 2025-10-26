'use client';

import { useMemo } from 'react';
import DashboardHeader from '@/components/dashboard-header';
import {
  SymptomsChart,
  IntakeChart,
  ExerciseChart,
  CountermeasuresChart,
  CompressionGarmentChart,
} from '@/components/charts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import AppSidebar from '@/components/app-sidebar';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';

export default function DashboardPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const symptomLogsRef = useMemoFirebase(() => 
    user ? collection(firestore, `users/${user.uid}/symptom_logs`) : null,
    [user, firestore]
  );
  const { data: symptomLogs } = useCollection(symptomLogsRef);

  const intakeLogsRef = useMemoFirebase(() =>
    user ? collection(firestore, `users/${user.uid}/volume_expansion_logs`) : null,
    [user, firestore]
  );
  const { data: intakeLogs } = useCollection(intakeLogsRef);

  const exerciseLogsRef = useMemoFirebase(() =>
    user ? collection(firestore, `users/${user.uid}/exercise_logs`) : null,
    [user, firestore]
  );
  const { data: exerciseLogs } = useCollection(exerciseLogsRef);

  const countermeasuresLogsRef = useMemoFirebase(() =>
    user ? collection(firestore, `users/${user.uid}/physical_countermeasure_logs`) : null,
    [user, firestore]
  );
  const { data: countermeasuresLogs } = useCollection(countermeasuresLogsRef);

  const compressionLogsRef = useMemoFirebase(() =>
    user ? collection(firestore, `users/${user.uid}/compression_garment_logs`) : null,
    [user, firestore]
  );
  const { data: compressionLogs } = useCollection(compressionLogsRef);

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <AppSidebar />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <DashboardHeader />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
              <Card className="col-span-1 lg:col-span-2">
                <CardHeader>
                  <CardTitle>Symptom Severity Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <SymptomsChart data={symptomLogs} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Daily Intake Goals</CardTitle>
                </CardHeader>
                <CardContent>
                  <IntakeChart data={intakeLogs} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Exercise Type Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ExerciseChart data={exerciseLogs} />
                </CardContent>
              </Card>
               <Card>
                <CardHeader>
                  <CardTitle>Compression Garment Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <CompressionGarmentChart data={compressionLogs} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Physical Countermeasures Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <CountermeasuresChart data={countermeasuresLogs} />
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
