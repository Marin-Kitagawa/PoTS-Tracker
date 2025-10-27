'use client';

import { useMemo, useState } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collectionGroup, query, where, orderBy, Timestamp, QueryConstraint } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, formatDistanceToNow, startOfDay, endOfDay } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from '@/components/ui/button';
import { CalendarIcon, Search } from 'lucide-react';
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

export default function AllActivityPage() {
    const { user } = useUser();
    const firestore = useFirestore();

    const [typeFilter, setTypeFilter] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [dateRange, setDateRange] = useState<DateRange | undefined>();

    const activityLogsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        
        const constraints: QueryConstraint[] = [orderBy('timestamp', 'desc')];

        if (typeFilter) {
            constraints.push(where('type', '==', typeFilter));
        }

        if (dateRange?.from) {
            constraints.push(where('timestamp', '>=', startOfDay(dateRange.from)));
        }
        if (dateRange?.to) {
            constraints.push(where('timestamp', '<=', endOfDay(dateRange.to)));
        } else if (dateRange?.from) {
            // if only from is selected, query for that single day
             constraints.push(where('timestamp', '<=', endOfDay(dateRange.from)));
        }

        return query(collectionGroup(firestore, `activity_logs`), ...constraints);
    }, [firestore, typeFilter, dateRange]);

    const { data: activityLogs, isLoading } = useCollection(activityLogsQuery);

    const filteredLogs = useMemo(() => {
        if (!activityLogs) return [];
        // client-side filtering for search term as Firestore doesn't support text search on arbitrary strings well
        if (!searchTerm) return activityLogs;
        
        return activityLogs.filter(log => 
            log.description.toLowerCase().includes(searchTerm.toLowerCase())
        );

    }, [activityLogs, searchTerm]);

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
                                    <div key={log.id} className="flex items-start gap-4 p-2 rounded-md hover:bg-muted">
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium text-foreground">{log.description}</p>
                                                <Badge variant={getBadgeVariant(log.type)} className="capitalize">{log.type}</Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {log.timestamp ? formatDistanceToNow(log.timestamp.toDate(), { addSuffix: true }) : 'Just now'}
                                                <span className="mx-2">•</span>
                                                {log.timestamp ? format(log.timestamp.toDate(), 'PPP p') : ''}
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
