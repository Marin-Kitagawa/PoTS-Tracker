import { HeartPulse } from 'lucide-react';

const DashboardHeader = () => {
  return (
    <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="flex items-center gap-3">
          <HeartPulse className="h-8 w-8 text-primary" />
          <h1 className="font-headline text-2xl font-bold tracking-wider text-foreground">
            POTS Tracker
          </h1>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
