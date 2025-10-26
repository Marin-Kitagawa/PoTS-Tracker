import DashboardHeader from '@/components/dashboard-header';
import {
  SymptomsChart,
  IntakeChart,
  ExerciseChart,
  CountermeasuresChart,
} from '@/components/charts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Home } from 'lucide-react';
import AppSidebar from '@/components/app-sidebar';

export default function DashboardPage() {
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
                  <SymptomsChart />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Daily Intake Goals</CardTitle>
                </CardHeader>
                <CardContent>
                  <IntakeChart />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Exercise Type Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ExerciseChart />
                </CardContent>
              </Card>
              <Card className="col-span-1 lg:col-span-2">
                <CardHeader>
                  <CardTitle>Physical Countermeasures Effectiveness</CardTitle>
                </CardHeader>
                <CardContent>
                  <CountermeasuresChart />
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
