'use client';

import { CompressionTrackingCard } from '@/components/feature-cards';
import { ActivityFeed } from '@/components/activity-feed';

export default function CompressionPage() {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-2">
              <h1 className="text-3xl font-bold text-foreground mb-2">Compression Garments</h1>
              <p className="text-muted-foreground mb-6">Log the type of compression garment used and for how long.</p>
          </div>
        <CompressionTrackingCard />
      </div>
      <ActivityFeed />
    </>
  );
}
