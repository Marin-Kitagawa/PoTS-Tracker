'use client';

import { useMemo, useState } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// This map helps us find the right collection name for a given type
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

    const dateField = log.timestamp || log.date;

    switch(type) {
        case 'Symptom':
            return {
                id: log.id,
                type: 'Symptom',
                description: `Logged ${log.symptom} with severity ${log.severity}.`,
                timestamp: dateField?.toDate() || new Date(),
            };
        case 'Exercise':
            return {
                id: log.id,
                type: 'Exercise',
                description: `Logged ${log.duration} minutes of ${log.exerciseType}.`,
                timestamp: dateField?.toDate() || new Date(),
            };
        case 'Intake':
             return {
                id: log.id,
                type: 'Intake',
                description: `Logged Sodium: ${log.saltIntake}g, Fluid: ${log.fluidIntake}ml.`,
                timestamp: dateField?.toDate() || new Date(),
            };
        case 'Sleep':
             return {
                id: log.id,
                type: 'Sleep',
                description: `Logged elevated head sleep: ${log.headElevated ? 'Yes' : 'No'}.`,
                timestamp: dateField?.toDate() || new Date(),
            };
        case 'Compression':
             return {
                id: log.id,
                type: 'Compression',
                description: `Logged ${log.duration} hours of ${log.garmentType} garment use.`,
                timestamp: dateField?.toDate() || new Date(),
            };
        case 'Countermeasure':
             return {
                id: log.id,
                type: 'Countermeasure',
                description: `Logged ${log.duration} minutes of ${log.countermeasureType}.`,
                timestamp: dateField?.toDate() || new Date(),
            };
        case 'Skin Cooling':
             return {
                id: log.id,
                type: 'Skin Cooling',
                description: `Logged ${log.coolingMethod} for skin cooling, ${log.frequency} time(s).`,
                timestamp: dateField?.toDate() || new Date(),
            };
        default:
             if (log.type && log.description) {
                 return {
                    id: log.id,
                    type: log.type,
                    description: log.description,
                    timestamp: dateField?.toDate() || new Date(),
                }
             }
            return null;
    }
}

type NormalizedLog = {
    id: string;
    type: string;
    description: string;
    timestamp: Date;
}

export function ActivityFeed({ filterType }: { filterType?: string }) {
    const { user } = useUser();
    const firestore = useFirestore();

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    const activityLogsRef = useMemoFirebase(() => {
        if (!user || !firestore || !filterType) return null;

        const collectionName = collectionMap[filterType];
        if (!collectionName) return null;
        
        let dateField = 'timestamp'; // default
        if (['Exercise', 'Intake', 'Sleep', 'Compression', 'Skin Cooling'].includes(filterType)) {
            dateField = 'date';
        }

        return query(collection(firestore, `users/${user.uid}/${collectionName}`), orderBy(dateField, 'desc'));

    }, [user, firestore, filterType]);

    const { data: activityLogs, isLoading } = useCollection(activityLogsRef);

    const normalizedLogs = useMemo(() => {
        if (!activityLogs || !filterType) return [];
        return activityLogs.map(log => normalizeLog(log, filterType)).filter(Boolean) as NormalizedLog[];
    }, [activityLogs, filterType]);

    const totalPages = Math.ceil(normalizedLogs.length / itemsPerPage);
    const paginatedLogs = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return normalizedLogs.slice(startIndex, endIndex);
    }, [normalizedLogs, currentPage, itemsPerPage]);

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
    }

    return (
        <Card className="mt-8">
            <CardHeader>
                <CardTitle>Recent {filterType || ''} Activity</CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-72">
                    <div className="space-y-4">
                        {isLoading && <p className="text-muted-foreground text-center">Loading activity...</p>}
                        {!isLoading && paginatedLogs && paginatedLogs.length > 0 ? (
                            paginatedLogs.map(log => (
                                <div key={log.id} className="flex items-start gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                             <p className="text-sm text-muted-foreground">{log.description}</p>
                                             <Badge variant={getBadgeVariant(log.type)} className="capitalize">{log.type}</Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {log.timestamp ? formatDistanceToNow(log.timestamp, { addSuffix: true }) : 'Just now'}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                           !isLoading && <p className="text-muted-foreground text-center py-8">No activity logged yet.</p>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
             <CardFooter className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Select value={String(itemsPerPage)} onValueChange={(value) => { setItemsPerPage(Number(value)); setCurrentPage(1); }}>
                        <SelectTrigger className="w-[80px]">
                            <SelectValue placeholder="Results" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="5">5</SelectItem>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                        </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                        Results per page
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                        Page {currentPage} of {totalPages > 0 ? totalPages : 1}
                    </span>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages || totalPages === 0}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </CardFooter>
        </Card>
    )
}
