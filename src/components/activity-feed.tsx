'use client';

import { useMemo } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';

export function ActivityFeed() {
    const { user } = useUser();
    const firestore = useFirestore();

    const activityLogsRef = useMemoFirebase(() => 
        user ? query(collection(firestore, `users/${user.uid}/activity_logs`), orderBy('timestamp', 'desc'), limit(20)) : null,
        [user, firestore]
    );

    const { data: activityLogs } = useCollection(activityLogsRef);

    const getBadgeVariant = (type: string) => {
        switch(type) {
            case 'Symptom': return 'destructive';
            case 'Exercise': return 'default';
            case 'Intake': return 'secondary';
            default: return 'outline';
        }
    }

    return (
        <Card className="mt-8">
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
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
