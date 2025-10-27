'use client';

import Link from 'next/link';
import {
  Home,
  LineChart,
  Bed,
  Dumbbell,
  GlassWater,
  Layers,
  Activity,
  Snowflake,
  HeartPulse,
  LogOut,
  User,
  History
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';

const sidebarNavItems = [
  { href: '/home', icon: Home, label: 'Home' },
  { href: '/dashboard', icon: LineChart, label: 'Dashboard' },
  { href: '/home/symptoms', icon: HeartPulse, label: 'Symptoms' },
  { href: '/home/exercise', icon: Dumbbell, label: 'Exercise' },
  { href: '/home/volume-expansion', icon: GlassWater, label: 'Volume Expansion' },
  { href: '/home/sleep-position', icon: Bed, label: 'Sleep Position' },
  { href: '/home/compression', icon: Layers, label: 'Compression' },
  { href: '/home/countermeasures', icon: Activity, label: 'Countermeasures' },
  { href: '/home/skin-cooling', icon: Snowflake, label: 'Skin Cooling' },
  { href: '/home/activity', icon: History, label: 'All Activity' },
];

export default function AppSidebar() {
  const auth = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await auth.signOut();
    router.push('/');
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <TooltipProvider>
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
          {sidebarNavItems.map((item) => (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                >
                  <item.icon className="h-5 w-5" />
                  <span className="sr-only">{item.label}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          ))}
        </nav>
        <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Link
                    href="/home/profile"
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                    >
                    <User className="h-5 w-5" />
                    <span className="sr-only">Profile</span>
                    </Link>
                </TooltipTrigger>
                <TooltipContent side="right">Profile</TooltipContent>
            </Tooltip>
           <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleSignOut}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
              >
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Sign Out</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Sign Out</TooltipContent>
          </Tooltip>
        </nav>
      </TooltipProvider>
    </aside>
  );
}
