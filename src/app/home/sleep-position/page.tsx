'use client';

import { SleepLoggingCard } from '@/components/feature-cards';

export default function SleepPositionPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
       <div className="lg:col-span-2">
            <h1 className="text-3xl font-bold text-foreground mb-2">Sleep Position</h1>
            <p className="text-muted-foreground mb-6">Log whether you slept with your head elevated to help manage symptoms.</p>
        </div>
      <SleepLoggingCard />
    </div>
  );
}
