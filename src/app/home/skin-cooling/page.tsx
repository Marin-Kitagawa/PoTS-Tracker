'use client';

import { SkinCoolingCard } from '@/components/feature-cards';
import { ActivityFeed } from '@/components/activity-feed';

export default function SkinCoolingPage() {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-2">
              <h1 className="text-3xl font-bold text-foreground mb-2">Skin Surface Cooling</h1>
              <p className="text-muted-foreground mb-6">Track methods used for skin surface cooling and the conditions of use.</p>
          </div>
        <SkinCoolingCard />
      </div>
      <ActivityFeed />
    </>
  );
}
