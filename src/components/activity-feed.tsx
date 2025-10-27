'use client';

import { useMemo } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit, where, QueryConstraint } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';

export function ActivityFeed({ filterType }: { filterType?: string }) {
    const { user } = useUser();
    const firestore = useFirestore();

    const activityLogsRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;

        const constraints: QueryConstraint[] = [orderBy('timestamp', 'desc'), limit(20)];
        if (filterType) {
            constraints.push(where('type', '==', filterType));
        }

        return query(collection(firestore, `users/${user.uid}/activity_logs`), ...constraints);
    }, [user, firestore, filterType]);

    const { data: activityLogs } = useCollection(activityLogsRef);

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
                        {activityLogs && activityLogs.length > 0 ? (
                            activityLogs.map(log => (
                                <div key={log.id} className="flex items-start gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                             <p className="text-sm text-muted-foreground">{log.description}</p>
                                             <Badge variant={getBadgeVariant(log.type)} className="capitalize">{log.type}</Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {log.timestamp ? formatDistanceToNow(log.timestamp.toDate(), { addSuffix: true }) : 'Just now'}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-muted-foreground text-center">No activity logged yet.</p>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}
