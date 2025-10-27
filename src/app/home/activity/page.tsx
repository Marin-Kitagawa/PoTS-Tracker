'use client';

import { useMemo, useState, useEffect } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, formatDistanceToNow, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { DateRange } from 'react-day-picker';

const activityTypes = ["Symptom", "Exercise", "Intake", "Sleep", "Compression", "Countermeasure", "Skin Cooling"];

const getBadgeVariant = (type: string) => {
    switch(type) {
        case 'Symptom': return 'destructive';
        case 'Exercise': return 'default';
        case 'Intake': return 'secondary';
        case 'Sleep': return 'default';
        case 'Compression': return 'secondary';
        case 'Countermeasure': return 'default';
        case 'Skin Cooling': return 'secondary';
        default: return 'outline';
    }
};

const collectionMap: Record<string, string> = {
    Symptom: 'symptom_logs',
    Exercise: 'exercise_logs',
    Intake: 'volume_expansion_logs',
    Sleep: 'sleep_position_logs',
    Compression: 'compression_garment_logs',
    Countermeasure: 'physical_countermeasure_logs',
    'Skin Cooling': 'skin_surface_cooling_logs'
};

const normalizeLog = (log: any, type: string): NormalizedLog | null => {
    if (!log.id) return null;

    switch(type) {
        case 'Symptom':
            return {
                id: log.id,
                type: 'Symptom',
                description: `${log.symptom} - Severity: ${log.severity}${log.notes ? ` (${log.notes})` : ''}`,
                timestamp: log.timestamp?.toDate() || new Date(),
            };
        case 'Exercise':
            return {
                id: log.id,
                type: 'Exercise',
                description: `${log.exerciseType} for ${log.duration} mins (RPE: ${log.rpe})`,
                timestamp: log.date?.toDate() || new Date(),
            };
        case 'Intake':
             return {
                id: log.id,
                type: 'Intake',
                description: `Sodium: ${log.saltIntake}g, Fluid: ${log.fluidIntake}ml`,
                timestamp: log.date?.toDate() || new Date(),
            };
        case 'Sleep':
             return {
                id: log.id,
                type: 'Sleep',
                description: `Elevated head during sleep: ${log.headElevated ? 'Yes' : 'No'}`,
                timestamp: log.date?.toDate() || new Date(),
            };
        case 'Compression':
             return {
                id: log.id,
                type: 'Compression',
                description: `Used ${log.garmentType} for ${log.duration} hours`,
                timestamp: log.date?.toDate() || new Date(),
            };
        case 'Countermeasure':
             return {
                id: log.id,
                type: 'Countermeasure',
                description: `Used ${log.countermeasureType} for ${log.duration} minutes`,
                timestamp: log.timestamp?.toDate() || new Date(),
            };
        case 'Skin Cooling':
             return {
                id: log.id,
                type: 'Skin Cooling',
                description: `Used ${log.coolingMethod} (${log.frequency} times). Conditions: ${log.usageConditions}`,
                timestamp: log.date?.toDate() || new Date(),
            };
        default:
            return null;
    }
}


type NormalizedLog = {
    id: string;
    type: string;
    description: string;
    timestamp: Date;
}

export default function AllActivityPage() {
    const { user } = useUser();
    const firestore = useFirestore();

    const [typeFilter, setTypeFilter] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    
    // Fetch from all collections
    const { data: symptomLogs } = useCollection(useMemoFirebase(() => user ? collection(firestore, 'users', user.uid, collectionMap.Symptom) : null, [user, firestore]));
    const { data: exerciseLogs } = useCollection(useMemoFirebase(() => user ? collection(firestore, 'users', user.uid, collectionMap.Exercise) : null, [user, firestore]));
    const { data: intakeLogs } = useCollection(useMemoFirebase(() => user ? collection(firestore, 'users', user.uid, collectionMap.Intake) : null, [user, firestore]));
    const { data: sleepLogs } = useCollection(useMemoFirebase(() => user ? collection(firestore, 'users', user.uid, collectionMap.Sleep) : null, [user, firestore]));
    const { data: compressionLogs } = useCollection(useMemoFirebase(() => user ? collection(firestore, 'users', user.uid, collectionMap.Compression) : null, [user, firestore]));
    const { data: countermeasureLogs } = useCollection(useMemoFirebase(() => user ? collection(firestore, 'users', user.uid, collectionMap.Countermeasure) : null, [user, firestore]));
    const { data: skinCoolingLogs } = useCollection(useMemoFirebase(() => user ? collection(firestore, 'users', user.uid, collectionMap['Skin Cooling']) : null, [user, firestore]));

    const [isLoading, setIsLoading] = useState(true);

    const allLogs = useMemo(() => {
        const logs: NormalizedLog[] = [];
        if (symptomLogs) logs.push(...symptomLogs.map(log => normalizeLog(log, 'Symptom')).filter(Boolean) as NormalizedLog[]);
        if (exerciseLogs) logs.push(...exerciseLogs.map(log => normalizeLog(log, 'Exercise')).filter(Boolean) as NormalizedLog[]);
        if (intakeLogs) logs.push(...intakeLogs.map(log => normalizeLog(log, 'Intake')).filter(Boolean) as NormalizedLog[]);
        if (sleepLogs) logs.push(...sleepLogs.map(log => normalizeLog(log, 'Sleep')).filter(Boolean) as NormalizedLog[]);
        if (compressionLogs) logs.push(...compressionLogs.map(log => normalizeLog(log, 'Compression')).filter(Boolean) as NormalizedLog[]);
        if (countermeasureLogs) logs.push(...countermeasureLogs.map(log => normalizeLog(log, 'Countermeasure')).filter(Boolean) as NormalizedLog[]);
        if (skinCoolingLogs) logs.push(...skinCoolingLogs.map(log => normalizeLog(log, 'Skin Cooling')).filter(Boolean) as NormalizedLog[]);
        
        return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }, [symptomLogs, exerciseLogs, intakeLogs, sleepLogs, compressionLogs, countermeasureLogs, skinCoolingLogs]);

    useEffect(() => {
        // A simple loading state based on whether all logs have been fetched at least once
        if (symptomLogs && exerciseLogs && intakeLogs && sleepLogs && compressionLogs && countermeasureLogs && skinCoolingLogs) {
            setIsLoading(false);
        }
    }, [symptomLogs, exerciseLogs, intakeLogs, sleepLogs, compressionLogs, countermeasureLogs, skinCoolingLogs]);

    const filteredLogs = useMemo(() => {
        return allLogs.filter(log => {
            // Type filter
            if (typeFilter && log.type !== typeFilter) {
                return false;
            }
            // Search term filter
            if (searchTerm && !log.description.toLowerCase().includes(searchTerm.toLowerCase())) {
                return false;
            }
            // Date range filter
            if (dateRange?.from) {
                const end = dateRange.to || endOfDay(dateRange.from);
                if (!isWithinInterval(log.timestamp, { start: startOfDay(dateRange.from), end: endOfDay(end) })) {
                    return false;
                }
            }
            return true;
        });
    }, [allLogs, typeFilter, searchTerm, dateRange]);

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground">All Activity</h1>
                <p className="text-muted-foreground">View, filter, and search all your logged activities.</p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <Input 
                                placeholder="Search descriptions..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full"
                            />
                        </div>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-full md:w-[180px]">
                                <SelectValue placeholder="Filter by type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">All Types</SelectItem>
                                {activityTypes.map(type => (
                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal md:w-[280px]",
                                        !dateRange && "text-muted-foreground"
                                    )}
                                >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateRange?.from ? (
                                    dateRange.to ? (
                                    <>
                                        {format(dateRange.from, "LLL dd, y")} -{" "}
                                        {format(dateRange.to, "LLL dd, y")}
                                    </>
                                    ) : (
                                    format(dateRange.from, "LLL dd, y")
                                    )
                                ) : (
                                    <span>Pick a date range</span>
                                )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                mode="range"
                                selected={dateRange}
                                onSelect={setDateRange}
                                initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[60vh]">
                        <div className="space-y-4">
                            {isLoading && <p>Loading activities...</p>}
                            {!isLoading && filteredLogs && filteredLogs.length > 0 ? (
                                filteredLogs.map(log => (
                                    <div key={`${log.type}-${log.id}`} className="flex items-start gap-4 p-2 rounded-md hover:bg-muted">
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium text-foreground">{log.description}</p>
                                                <Badge variant={getBadgeVariant(log.type)} className="capitalize">{log.type}</Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {log.timestamp ? formatDistanceToNow(log.timestamp, { addSuffix: true }) : 'Just now'}
                                                <span className="mx-2">•</span>
                                                {log.timestamp ? format(log.timestamp, 'PPP p') : ''}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                !isLoading && <p className="text-muted-foreground text-center py-8">No activities found for the selected filters.</p>
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
}

    