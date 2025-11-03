'use client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, BookOpen, MessageSquare } from "lucide-react";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";

const features = [
  { title: "Symptom Tracking", href: "/home/symptoms", description: "Log daily symptoms and severity." },
  { title: "Exercise", href: "/home/exercise", description: "Track your horizontal and upright exercises." },
  { title: "Volume Expansion", href: "/home/volume-expansion", description: "Monitor your salt and fluid intake." },
  { title: "Sleep Position", href: "/home/sleep-position", description: "Log if you slept with your head elevated." },
  { title: "Compression Garments", href: "/home/compression", description: "Keep track of garment type and duration." },
  { title: "Countermeasures", href: "/home/countermeasures", description: "Record physical countermeasure use." },
  { title: "Skin Cooling", href: "/home/skin-cooling", description: "Log skin surface cooling methods." },
  { title: "All Activities", href: "/home/activity", description: "View and filter all your logged activities." },
];

const secondaryFeatures = [
    { title: "Management Details", href: "/home/details", description: "Learn about POTS management strategies.", icon: BookOpen },
    { title: "Send Feedback", href: "/home/feedback", description: "Report a bug or request a feature.", icon: MessageSquare },
    { title: "Profile", href: "/home/profile", description: "Manage your profile and account settings.", icon: ArrowRight },
]

export default function HomePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile } = useDoc(userProfileRef);

  if (isUserLoading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return <div>Please sign in to continue.</div>
  }

  const displayName = userProfile?.displayName || user.displayName || 'User';

  return (
    <div>
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Welcome, {displayName}</h1>
            <p className="text-muted-foreground">Select a category below to start logging your activities and symptoms.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {features.map((feature) => (
                 <Card key={feature.title}>
                    <CardHeader>
                        <CardTitle>{feature.title}</CardTitle>
                        <CardDescription>{feature.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild variant="outline">
                            <Link href={feature.href}>
                                Go to {feature.title} <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            ))}
             {secondaryFeatures.map((feature) => (
                 <Card key={feature.title}>
                    <CardHeader>
                        <CardTitle>{feature.title}</CardTitle>
                        <CardDescription>{feature.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild variant="outline">
                            <Link href={feature.href}>
                                Go to {feature.title} <feature.icon className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            ))}
        </div>
    </div>
  );
}
