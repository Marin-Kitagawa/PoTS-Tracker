import DashboardHeader from '@/components/dashboard-header';
import {
  ExerciseTrackingCard,
  VolumeExpansionCard,
  SleepLoggingCard,
  CompressionTrackingCard,
  CountermeasuresCard,
  SkinCoolingCard,
} from '@/components/feature-cards';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LineChart } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <DashboardHeader />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex justify-end mb-6">
            <Button asChild>
              <Link href="/dashboard">
                <LineChart className="mr-2 h-4 w-4" />
                View Dashboard
              </Link>
            </Button>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            <ExerciseTrackingCard />
            <VolumeExpansionCard />
            <SleepLoggingCard />
            <CompressionTrackingCard />
            <CountermeasuresCard />
            <SkinCoolingCard />
          </div>
        </div>
      </main>
    </div>
  );
}
