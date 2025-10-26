"use client";

import { useState } from 'react';
import { Dumbbell, GlassWater, Bed, Layers, Activity, Snowflake, Plus, Minus, Info } from 'lucide-react';
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
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

export function ExerciseTrackingCard() {
  const { toast } = useToast();
  const [duration, setDuration] = useState(30);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Exercise Tracking</CardTitle>
        <Dumbbell className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="exercise-type">Exercise Type</Label>
            <Select>
              <SelectTrigger id="exercise-type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="horizontal">Horizontal (e.g., rowing, swimming)</SelectItem>
                <SelectItem value="upright">Upright (e.g., walking, cycling)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input id="duration" type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} placeholder="e.g., 30" />
          </div>
          <div className="space-y-2">
            <Label>RPE (Rate of Perceived Exertion)</Label>
            <div className="flex items-center gap-2">
              <Slider defaultValue={[4]} max={10} step={1} className="w-full" />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={() => toast({ title: "Exercise Logged", description: `You've logged a ${duration}-minute session.` })}>Log Exercise</Button>
      </CardFooter>
    </Card>
  );
}

export function VolumeExpansionCard() {
  const { toast } = useToast();
  const [sodium, setSodium] = useState(0);
  const [fluid, setFluid] = useState(0);
  const sodiumGoal = 10; // 10g
  const fluidGoal = 3000; // 3L in ml

  const handleLog = () => {
    toast({ title: "Intake Logged", description: `Sodium: ${sodium}g, Fluid: ${fluid / 1000}L` });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Volume Expansion</CardTitle>
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
    const [isElevated, setIsElevated] = useState(false);
  
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sleep Position</CardTitle>
          <Bed className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="head-elevated" className="text-base">Head Elevated</Label>
                <CardDescription>Did you sleep with your head elevated 4-6 inches?</CardDescription>
              </div>
              <Switch id="head-elevated" checked={isElevated} onCheckedChange={setIsElevated} />
            </div>
             <p className="text-xs text-muted-foreground pt-2">Reminder notifications for this can be configured in settings.</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={() => toast({ title: "Sleep Logged", description: `Head elevated: ${isElevated ? "Yes" : "No"}` })}>Log Sleep</Button>
        </CardFooter>
      </Card>
    );
  }

  export function CompressionTrackingCard() {
    const { toast } = useToast();

    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Compression Garments</CardTitle>
          <Layers className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="compression-type">Garment Type</Label>
            <Select>
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
            <Input id="compression-duration" type="number" placeholder="e.g., 8" />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={() => toast({ title: "Compression Use Logged" })}>Log Use</Button>
        </CardFooter>
      </Card>
    );
  }
  
  const countermeasures = [
    { id: 'squeeze', name: 'Squeeze rubber ball' },
    { id: 'leg-cross', name: 'Leg crossing with tensing' },
    { id: 'pump', name: 'Muscle pumping (e.g., calf raises)' },
    { id: 'squat', name: 'Squatting/Sitting/Lying down' },
    { id: 'cpr', name: 'Cough CPR' },
  ];
  
  export function CountermeasuresCard() {
    const { toast } = useToast();
    const [log, setLog] = useState<{name: string, time: string}[]>([]);
  
    const handleLog = (name: string) => {
      const now = new Date();
      const newLog = { name, time: now.toLocaleTimeString() };
      setLog(prev => [newLog, ...prev.slice(0, 4)]);
      toast({ title: "Countermeasure Logged", description: `${name} at ${newLog.time}` });
    };

    return (
        <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Physical Countermeasures</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="space-y-2 mb-4">
                <Label>Log an activity</Label>
                <div className="flex flex-wrap gap-2">
                    {countermeasures.map(cm => (
                        <Button key={cm.id} variant="outline" size="sm" onClick={() => handleLog(cm.name)}>{cm.name}</Button>
                    ))}
                </div>
            </div>
            <div className="space-y-2">
                <Label>Recent Logs</Label>
                {log.length > 0 ? (
                    <div className="space-y-2 rounded-md border p-2">
                        {log.map((entry, index) => (
                            <p key={index} className="text-sm text-muted-foreground">{entry.name} at {entry.time}</p>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">No recent countermeasures logged.</p>
                )}
            </div>
             <Alert className="mt-4">
              <Info className="h-4 w-4" />
              <AlertTitle>Get AI Reminders</AlertTitle>
              <AlertDescription>
                AI can analyze your day and suggest reminders for countermeasures you might have missed. This feature is coming soon!
              </AlertDescription>
            </Alert>
        </CardContent>
        </Card>
    );
  }

  export function SkinCoolingCard() {
    const { toast } = useToast();
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Skin Surface Cooling</CardTitle>
          <Snowflake className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cooling-method">Cooling Method</Label>
            <Select>
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
            <Label htmlFor="cooling-conditions">Usage Conditions</Label>
            <Textarea id="cooling-conditions" placeholder="e.g., During exercise, when feeling lightheaded..." />
          </div>
           <p className="text-xs text-muted-foreground pt-2">Protocol notifications can provide reminders for skin cooling.</p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => toast({ title: "Skin Cooling Logged" })}>Log Usage</Button>
        </CardFooter>
      </Card>
    );
  }
