'use client';
import { VolumeExpansionCard } from '@/components/feature-cards';
import { ActivityFeed } from '@/components/activity-feed';


export default function VolumeExpansionPage() {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-2">
              <h1 className="text-3xl font-bold text-foreground mb-2">Volume Expansion</h1>
              <p className="text-muted-foreground mb-6">Monitor your daily salt and fluid intake to manage your blood volume.</p>
          </div>
        <VolumeExpansionCard />
      </div>
      <ActivityFeed />
    </>
  );
}
