import DashboardHeader from '@/components/dashboard-header';
import {
  ExerciseTrackingCard,
  VolumeExpansionCard,
  SleepLoggingCard,
  CompressionTrackingCard,
  CountermeasuresCard,
  SkinCoolingCard,
} from '@/components/feature-cards';
import { DosageRecommendation } from '@/components/dosage-recommendation';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <DashboardHeader />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            <ExerciseTrackingCard />
            <VolumeExpansionCard />
            <SleepLoggingCard />
            <CompressionTrackingCard />
            <CountermeasuresCard />
            <SkinCoolingCard />
          </div>
          <div className="mt-8">
            <DosageRecommendation />
          </div>
        </div>
      </main>
    </div>
  );
}
