'use client';
import { HeartPulse, History, Menu, User } from 'lucide-react';
import Link from 'next/link';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from './ui/button';


const mobileNavItems = [
  { href: '/home', label: 'Home' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/home/symptoms', label: 'Symptoms' },
  { href: '/home/exercise', label: 'Exercise' },
  { href: '/home/volume-expansion', label: 'Volume Expansion' },
  { href: '/home/sleep-position', label: 'Sleep Position' },
  { href: '/home/compression', label: 'Compression' },
  { href: '/home/countermeasures', label: 'Countermeasures' },
  { href: '/home/skin-cooling', label: 'Skin Cooling' },
  { href: '/home/activity', label: 'All Activities' },
  { href: '/home/profile', label: 'Profile' },
];

const DashboardHeader = () => {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
       <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline" className="sm:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="sm:max-w-xs">
            <nav className="grid gap-6 text-lg font-medium">
              <Link
                href="#"
                className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
              >
                <HeartPulse className="h-5 w-5 transition-all group-hover:scale-110" />
                <span className="sr-only">POTS Tracker</span>
              </Link>
              {mobileNavItems.map(item => (
                 <Link key={item.href} href={item.href} className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
                    {item.label}
                 </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-3">
          <HeartPulse className="h-8 w-8 text-primary hidden sm:block" />
          <h1 className="font-headline text-2xl font-bold tracking-wider text-foreground hidden sm:block">
            POTS Tracker
          </h1>
        </div>
    </header>
  );
};

export default DashboardHeader;
