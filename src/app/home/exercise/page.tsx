'use client';
import { ExerciseTrackingCard } from '@/components/feature-cards';

export default function ExercisePage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="lg:col-span-2">
            <h1 className="text-3xl font-bold text-foreground mb-2">Exercise Tracking</h1>
            <p className="text-muted-foreground mb-6">Log your horizontal and upright exercises, duration, and perceived exertion.</p>
        </div>
      <ExerciseTrackingCard />
    </div>
  );
}
