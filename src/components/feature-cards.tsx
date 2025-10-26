"use client";

import { useState, useMemo } from 'react';
import { Dumbbell, GlassWater, Bed, Layers, Activity, Snowflake, Plus, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore, useUser, addDocumentNonBlocking, setDocumentNonBlocking, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import { Calendar } from '@/components/ui/calendar';
import { format, isSameDay } from 'date-fns';
import { ActivityFeed } from './activity-feed';

function logActivity(firestore: any, userId: string, type: string, description: string) {
    if (!firestore || !userId) return;
    const activityColRef = collection(firestore, `users/${userId}/activity_logs`);
    addDocumentNonBlocking(activityColRef, {
        type,
        description,
        timestamp: serverTimestamp()
    });
}

export function ExerciseTrackingCard() {
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const [exerciseType, setExerciseType] = useState('');
  const [duration, setDuration] = useState(30);
  const [rpe, setRpe] = useState(4);
  
  const handleLogExercise = () => {
    if (!user) {
      toast({ variant: 'destructive', title: "Not Authenticated" });
      return;
    }
    if (!exerciseType) {
        toast({ variant: 'destructive', title: "Please select an exercise type." });
        return;
    }

    const logData = {
        userProfileId: user.uid,
        exerciseType,
        duration,
        rpe,
        date: serverTimestamp(),
    };

    const collectionRef = collection(firestore, `users/${user.uid}/exercise_logs`);
    addDocumentNonBlocking(collectionRef, logData);
    logActivity(firestore, user.uid, 'Exercise', `Logged ${duration} minutes of ${exerciseType}.`);
    toast({ title: "Exercise Logged", description: `You've logged a ${duration}-minute session.` });
  };


  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Log New Exercise</CardTitle>
        <Dumbbell className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="exercise-type">Exercise Type</Label>
            <Select onValueChange={setExerciseType} value={exerciseType}>
              <SelectTrigger id="exercise-type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="horizontal">Horizontal (e.g., rowing, swimming)</SelectItem>
                <SelectItem value="upright">Upright (e.g., walking, cycling)</SelectItem>
                <SelectItem value="resistance">Resistance Training</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input id="duration" type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} placeholder="e.g., 30" />
          </div>
          <div className="space-y-2">
            <Label>RPE (Rate of Perceived Exertion): {rpe}</Label>
            <div className="flex items-center gap-2">
              <Slider value={[rpe]} onValueChange={(vals) => setRpe(vals[0])} max={10} step={1} className="w-full" />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleLogExercise}>Log Exercise</Button>
      </CardFooter>
    </Card>
  );
}

export function VolumeExpansionCard() {
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const [sodium, setSodium] = useState(0);
  const [fluid, setFluid] = useState(0);
  const sodiumGoal = 10; // 10g
  const fluidGoal = 3000; // 3L in ml

  const handleLog = () => {
     if (!user) {
      toast({ variant: 'destructive', title: "Not Authenticated" });
      return;
    }
    const logData = {
        userProfileId: user.uid,
        saltIntake: sodium,
        fluidIntake: fluid,
        date: serverTimestamp(),
    };
    const collectionRef = collection(firestore, `users/${user.uid}/volume_expansion_logs`);
    addDocumentNonBlocking(collectionRef, logData);
    if (sodium > 0) logActivity(firestore, user.uid, 'Intake', `Logged ${sodium}g of sodium.`);
    if (fluid > 0) logActivity(firestore, user.uid, 'Intake', `Logged ${fluid}ml of fluid.`);
    toast({ title: "Intake Logged", description: `Sodium: ${sodium}g, Fluid: ${fluid / 1000}L` });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Log Daily Intake</CardTitle>
        <GlassWater className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="mb-2 flex items-center justify-between">
            <span>Sodium Intake (g)</span>
            <span className="text-xs text-muted-foreground">{sodium} / {sodiumGoal}g</span>
          </Label>
          <div className="flex items-center gap-2">
            <Input type="number" value={sodium} onChange={e => setSodium(Math.max(0, Number(e.target.value)))} className="flex-1" />
            <Button size="icon" variant="outline" onClick={() => setSodium(p => Math.max(0, p-1))}><Minus className="h-4 w-4" /></Button>
            <Button size="icon" variant="outline" onClick={() => setSodium(p => p+1)}><Plus className="h-4 w-4" /></Button>
          </div>
          <Progress value={(sodium / sodiumGoal) * 100} className="mt-2 h-2" />
        </div>
        <div>
          <Label className="mb-2 flex items-center justify-between">
            <span>Fluid Intake (ml)</span>
            <span className="text-xs text-muted-foreground">{fluid} / {fluidGoal}ml</span>
          </Label>
          <div className="flex items-center gap-2">
            <Input type="number" value={fluid} onChange={e => setFluid(Math.max(0, Number(e.target.value)))} className="flex-1" />
            <Button size="icon" variant="outline" onClick={() => setFluid(p => Math.max(0, p-250))}><Minus className="h-4 w-4" /></Button>
            <Button size="icon" variant="outline" onClick={() => setFluid(p => p+250)}><Plus className="h-4 w-4" /></Button>
          </div>
          <Progress value={(fluid / fluidGoal) * 100} className="mt-2 h-2" />
        </div>
      </CardContent>
       <CardFooter>
        <Button onClick={handleLog}>Log Intake</Button>
      </CardFooter>
    </Card>
  );
}

export function SleepLoggingCard() {
    const { toast } = useToast();
    const { user } = useUser();
    const firestore = useFirestore();

    const collectionRef = useMemoFirebase(() => {
        if (!user) return null;
        return collection(firestore, `users/${user.uid}/sleep_position_logs`);
    }, [user, firestore]);

    const { data: sleepLogs } = useCollection(collectionRef);
    
    const loggedDates = useMemo(() => {
        return sleepLogs
            ?.filter(log => log.headElevated)
            .map(log => log.date.toDate()) || [];
    }, [sleepLogs]);

    const handleDayClick = (date: Date) => {
        if (!user) {
            toast({ variant: 'destructive', title: "Not Authenticated" });
            return;
        }

        const dateId = format(date, 'yyyy-MM-dd');
        const docRef = doc(firestore, `users/${user.uid}/sleep_position_logs/${dateId}`);
        const isAlreadyLogged = loggedDates.some(loggedDate => isSameDay(loggedDate, date));

        const logData = {
            userProfileId: user.uid,
            headElevated: !isAlreadyLogged,
            date: date,
        };

        setDocumentNonBlocking(docRef, logData, { merge: true });
        const activityDescription = `Logged elevated head sleep for ${format(date, 'PPP')}: ${!isAlreadyLogged ? "Yes" : "No"}`;
        logActivity(firestore, user.uid, 'Sleep', activityDescription);
        toast({ title: "Sleep Log Updated", description: `Head elevated on ${format(date, 'PPP')}: ${!isAlreadyLogged ? "Yes" : "No"}` });
    };
    
    return (
      <Card>
        <CardHeader>
          <CardTitle>Elevated Head Sleep Calendar</CardTitle>
          <CardDescription>Click a date to mark it as a night you slept with your head elevated.</CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="multiple"
            selected={loggedDates}
            onDayClick={handleDayClick}
            className="rounded-md border"
            modifiers={{
                logged: loggedDates,
            }}
            modifiersStyles={{
                logged: {
                    backgroundColor: 'hsl(var(--primary))',
                    color: 'hsl(var(--primary-foreground))'
                }
            }}
          />
        </CardContent>
      </Card>
    );
  }

  export function CompressionTrackingCard() {
    const { toast } = useToast();
    const { user } = useUser();
    const firestore = useFirestore();

    const [garmentType, setGarmentType] = useState('');
    const [duration, setDuration] = useState(8);

    const handleLog = () => {
        if (!user) {
            toast({ variant: 'destructive', title: 'Not Authenticated' });
            return;
        }
        if (!garmentType) {
            toast({ variant: 'destructive', title: 'Please select a garment type.' });
            return;
        }
        const logData = {
            userProfileId: user.uid,
            garmentType,
            duration,
            date: serverTimestamp(),
        };
        const collectionRef = collection(firestore, `users/${user.uid}/compression_garment_logs`);
        addDocumentNonBlocking(collectionRef, logData);
        logActivity(firestore, user.uid, 'Compression', `Logged ${duration} hours of ${garmentType} garment use.`);
        toast({ title: "Compression Use Logged" });
    }

    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Log Compression Use</CardTitle>
          <Layers className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="compression-type">Garment Type</Label>
            <Select onValueChange={setGarmentType} value={garmentType}>
              <SelectTrigger id="compression-type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="abdomen">Abdomen-high</SelectItem>
                <SelectItem value="full-lower">Full-lower-body</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="compression-duration">Duration (hours)</Label>
            <Input id="compression-duration" type="number" value={duration} onChange={e => setDuration(Number(e.target.value))} placeholder="e.g., 8" />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleLog}>Log Use</Button>
        </CardFooter>
      </Card>
    );
  }
  
  const countermeasures = [
    { id: 'squeeze', name: 'Squeeze rubber ball' },
    { id: 'leg-cross', name: 'Leg crossing with tensing' },
    { id: 'pump', name: 'Muscle pumping (e.g., calf raises)' },
    { id: 'squat', name: 'Squatting/Sitting/Lying down' },
  ];
  
  export function CountermeasuresCard() {
    const { toast } = useToast();
    const { user } = useUser();
    const firestore = useFirestore();

    const [duration, setDuration] = useState(5);

    const handleLog = (name: string) => {
      if (!user) {
            toast({ variant: 'destructive', title: 'Not Authenticated' });
            return;
      }
      const logData = {
          userProfileId: user.uid,
          countermeasureType: name,
          duration: duration,
          timestamp: serverTimestamp(),
      };

      const collectionRef = collection(firestore, `users/${user.uid}/physical_countermeasure_logs`);
      addDocumentNonBlocking(collectionRef, logData);

      logActivity(firestore, user.uid, 'Countermeasure', `Logged ${duration} minutes of ${name}.`);

      toast({ title: "Countermeasure Logged", description: `${name} for ${duration} minutes.` });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Physical Countermeasures</CardTitle>
                <CardDescription>Log the use of physical countermeasures to manage symptoms.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label>Duration (minutes): {duration}</Label>
                    <Slider defaultValue={[duration]} onValueChange={(vals) => setDuration(vals[0])} max={60} step={1} />
                </div>
                <div className="space-y-2">
                    <Label>Log an activity</Label>
                    <div className="flex flex-wrap gap-2">
                        {countermeasures.map(cm => (
                            <Button key={cm.id} variant="outline" size="sm" onClick={() => handleLog(cm.name)}>{cm.name}</Button>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
  }

  export function SkinCoolingCard() {
    const { toast } = useToast();
    const { user } = useUser();
    const firestore = useFirestore();

    const [coolingMethod, setCoolingMethod] = useState('');
    const [usageConditions, setUsageConditions] = useState('');
    const [frequency, setFrequency] = useState(1);

    const handleLog = () => {
        if (!user) {
            toast({ variant: 'destructive', title: 'Not Authenticated' });
            return;
        }
        if (!coolingMethod) {
            toast({ variant: 'destructive', title: 'Please select a cooling method.' });
            return;
        }
        const logData = {
            userProfileId: user.uid,
            coolingMethod,
            usageConditions,
            frequency,
            date: serverTimestamp(),
        };

        const collectionRef = collection(firestore, `users/${user.uid}/skin_surface_cooling_logs`);
        addDocumentNonBlocking(collectionRef, logData);

        logActivity(firestore, user.uid, 'Skin Cooling', `Logged ${coolingMethod} for skin cooling, ${frequency} time(s).`);
        toast({ title: "Skin Cooling Logged" });
    };

    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Log Skin Cooling</CardTitle>
          <Snowflake className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cooling-method">Cooling Method</Label>
            <Select onValueChange={setCoolingMethod} value={coolingMethod}>
              <SelectTrigger id="cooling-method">
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cool-shower">Cool shower</SelectItem>
                <SelectItem value="ice-pack">Ice pack</SelectItem>
                <SelectItem value="cooling-vest">Cooling vest</SelectItem>
                <SelectItem value="spray-bottle">Spray bottle</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
              <Label htmlFor="frequency">Frequency (times today)</Label>
              <Input id="frequency" type="number" value={frequency} onChange={(e) => setFrequency(Number(e.target.value))} placeholder="e.g., 3" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cooling-conditions">Usage Conditions</Label>
            <Textarea id="cooling-conditions" value={usageConditions} onChange={e => setUsageConditions(e.target.value)} placeholder="e.g., During exercise, when feeling lightheaded..." />
          </div>
           <p className="text-xs text-muted-foreground pt-2">Protocol notifications can provide reminders for skin cooling.</p>
        </CardContent>
        <CardFooter>
          <Button onClick={handleLog}>Log Usage</Button>
        </CardFooter>
      </Card>
    );
  }
