'use client';

import { CountermeasuresCard } from '@/components/feature-cards';

export default function CountermeasuresPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-2">
            <h1 className="text-3xl font-bold text-foreground mb-2">Physical Countermeasures</h1>
            <p className="text-muted-foreground mb-6">Record when you use physical countermeasures to manage symptoms.</p>
        </div>
      <CountermeasuresCard />
    </div>
  );
}
