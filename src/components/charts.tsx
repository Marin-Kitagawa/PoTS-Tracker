"use client";

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { format } from 'date-fns';

const symptomsChartConfig = {
  dizziness: { label: 'Dizziness', color: 'hsl(var(--chart-1))' },
  lightheadedness: { label: 'Lightheadedness', color: 'hsl(var(--chart-2))' },
  tachycardia: { label: 'Tachycardia', color: 'hsl(var(--chart-3))' },
  fatigue: { label: 'Fatigue', color: 'hsl(var(--chart-4))' },
  brainFog: { label: 'Brain Fog', color: 'hsl(var(--chart-5))' },
  palpitations: { label: 'Palpitations', color: 'hsl(var(--chart-1))' },
  headache: { label: 'Headache', color: 'hsl(var(--chart-2))' },
  nausea: { label: 'Nausea', color: 'hsl(var(--chart-3))' },
  shortnessOfBreath: { label: 'Shortness of Breath', color: 'hsl(var(--chart-4))' },
  tremulousness: { label: 'Tremulousness', color: 'hsl(var(--chart-5))' },
  visualDisturbances: { label: 'Visual Disturbances', color: 'hsl(var(--chart-1))' },
} satisfies ChartConfig;

export function SymptomsChart({ data: rawData }: { data: any[] | null }) {
  const { data, chartConfig } = useMemo(() => {
    if (!rawData) return { data: [], chartConfig: {} };

    const processedData = rawData
        .sort((a, b) => a.timestamp.toDate() - b.timestamp.toDate())
        .map(log => ({
            date: format(log.timestamp.toDate(), 'MMM d'),
            symptom: log.symptom,
            severity: log.severity,
        }));
        
    const groupedByDate = processedData.reduce((acc, curr) => {
        (acc[curr.date] = acc[curr.date] || { date: curr.date })[curr.symptom] = curr.severity;
        return acc;
    }, {} as Record<string, any>);

    const uniqueSymptoms = [...new Set(processedData.map(d => d.symptom))];
    const camelCaseSymptoms = uniqueSymptoms.map(s => s.replace(/\s+/g, '').replace(/^\w/, c => c.toLowerCase()));

    const dynamicChartConfig = camelCaseSymptoms.reduce((acc, symptom, index) => {
        const originalSymptomName = uniqueSymptoms[index];
        acc[symptom] = {
            label: originalSymptomName,
            color: `hsl(var(--chart-${(index % 5) + 1}))`,
        };
        return acc;
    }, {} as ChartConfig);

    return { data: Object.values(groupedByDate), chartConfig: dynamicChartConfig };
  }, [rawData]);

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            domain={[0, 10]}
            label={{ value: 'Severity (0-10)', angle: -90, position: 'insideLeft', offset: 10 }}
          />
          <Tooltip content={<ChartTooltipContent />} />
          <Legend />
          {Object.keys(chartConfig).map((symptomKey) => (
             <Line key={symptomKey} type="monotone" dataKey={symptomKey.replace(/\s+/g, '').replace(/^\w/, c => c.toLowerCase())} stroke={`var(--color-${symptomKey})`} strokeWidth={2} dot={false} name={chartConfig[symptomKey].label} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

export function IntakeChart({ data: rawData }: { data: any[] | null }) {
    const data = useMemo(() => {
        if (!rawData || rawData.length === 0) {
             return [
                { name: 'Sodium', actual: 0, goal: 10 },
                { name: 'Fluid', actual: 0, goal: 3 },
            ];
        }
        const latestLog = rawData.sort((a,b) => b.date.toMillis() - a.date.toMillis())[0];
        return [
            { name: 'Sodium', actual: latestLog.saltIntake, goal: 10 },
            { name: 'Fluid', actual: latestLog.fluidIntake / 1000, goal: 3 },
        ];
    }, [rawData]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical" margin={{ left: 10 }}>
        <CartesianGrid horizontal={false} />
        <XAxis type="number" />
        <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={60} />
        <Tooltip />
        <Legend />
        <Bar dataKey="actual" name="Actual" fill="hsl(var(--primary))" radius={4} />
        <Bar dataKey="goal" name="Goal" fill="hsl(var(--muted))" radius={4} />
      </BarChart>
    </ResponsiveContainer>
  );
}

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))'];

export function ExerciseChart({ data: rawData }: { data: any[] | null }) {
    const data = useMemo(() => {
        if (!rawData) return [];
        const exerciseCounts = rawData.reduce((acc, log) => {
            acc[log.exerciseType] = (acc[log.exerciseType] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(exerciseCounts).map(([name, value]) => ({
            name,
            value,
        }));

    }, [rawData]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

const allCountermeasures = [
    'Squeeze a rubber ball',
    'Leg crossing + muscle tensing',
    'Muscle pumping (swaying/tiptoeing)',
    'Squatting / sitting / lying down',
    'Cough CPR (forceful coughing)',
    'Negative-pressure breathing (ITD device)',
    'Skin surface cooling'
  ];

export function CountermeasuresChart({ data: rawData }: { data: any[] | null }) {
    const data = useMemo(() => {
        const countermeasureCounts = allCountermeasures.reduce((acc, cm) => {
            acc[cm] = 0;
            return acc;
        }, {} as Record<string, number>);

        const countermeasureDurations = allCountermeasures.reduce((acc, cm) => {
            acc[cm] = 0;
            return acc;
        }, {} as Record<string, number>);


        if (rawData) {
            rawData.forEach(log => {
                if (countermeasureCounts.hasOwnProperty(log.countermeasureType)) {
                    countermeasureCounts[log.countermeasureType]++;
                    countermeasureDurations[log.countermeasureType] += log.duration;
                }
            });
        }
        
        const maxCount = Math.max(...Object.values(countermeasureCounts), 1);
        const maxDuration = Math.max(...Object.values(countermeasureDurations), 1);


        return Object.keys(countermeasureCounts).map((subject) => ({
            subject,
            count: countermeasureCounts[subject],
            duration: countermeasureDurations[subject],
            fullMarkCount: maxCount,
            fullMarkDuration: maxDuration,
        }));
    }, [rawData]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="subject" />
        <PolarRadiusAxis angle={30} domain={[0, 'dataMax + 1']} />
        <Radar name="Times Used" dataKey="count" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.6} />
        <Radar name="Total Duration (min)" dataKey="duration" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.6} />
        <Tooltip />
        <Legend />
      </RadarChart>
    </ResponsiveContainer>
  );
}
