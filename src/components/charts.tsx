"use client";

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

const symptomData = [
  { date: 'Mon', dizziness: 4, fatigue: 5, heartRate: 7 },
  { date: 'Tue', dizziness: 3, fatigue: 4, heartRate: 6 },
  { date: 'Wed', dizziness: 5, fatigue: 6, heartRate: 8 },
  { date: 'Thu', dizziness: 4, fatigue: 5, heartRate: 7 },
  { date: 'Fri', dizziness: 2, fatigue: 3, heartRate: 5 },
  { date: 'Sat', dizziness: 3, fatigue: 4, heartRate: 6 },
  { date: 'Sun', dizziness: 1, fatigue: 2, heartRate: 4 },
];

const symptomsChartConfig = {
  dizziness: {
    label: 'Dizziness',
    color: 'hsl(var(--chart-1))',
  },
  fatigue: {
    label: 'Fatigue',
    color: 'hsl(var(--chart-2))',
  },
  heartRate: {
    label: 'High Heart Rate',
    color: 'hsl(var(--chart-3))',
  },
} satisfies ChartConfig;

export function SymptomsChart() {
  return (
    <ChartContainer config={symptomsChartConfig} className="min-h-[200px] w-full">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={symptomData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            domain={[0, 10]}
            label={{ value: 'Severity (1-10)', angle: -90, position: 'insideLeft', offset: 10 }}
          />
          <Tooltip content={<ChartTooltipContent />} />
          <Legend />
          <Line type="monotone" dataKey="dizziness" stroke="var(--color-dizziness)" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="fatigue" stroke="var(--color-fatigue)" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="heartRate" stroke="var(--color-heartRate)" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

const intakeData = [
  { name: 'Sodium', actual: 8, goal: 10, fill: 'hsl(var(--chart-1))' },
  { name: 'Fluid', actual: 2.5, goal: 3, fill: 'hsl(var(--chart-2))' },
];

export function IntakeChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={intakeData} layout="vertical" margin={{ left: 10 }}>
        <CartesianGrid horizontal={false} />
        <XAxis type="number" />
        <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={60} />
        <Tooltip />
        <Legend />
        <Bar dataKey="actual" name="Actual" fill="currentColor" radius={4} className="fill-primary" />
        <Bar dataKey="goal" name="Goal" fill="hsl(var(--muted))" radius={4} />
      </BarChart>
    </ResponsiveContainer>
  );
}

const exerciseData = [
  { name: 'Horizontal', value: 400, fill: 'hsl(var(--chart-1))' },
  { name: 'Upright', value: 300, fill: 'hsl(var(--chart-2))' },
];

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))'];

export function ExerciseChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={exerciseData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
          {exerciseData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

const countermeasureData = [
  { subject: 'Squeezing Ball', A: 8, fullMark: 10 },
  { subject: 'Leg Crossing', A: 7, fullMark: 10 },
  { subject: 'Muscle Pumping', A: 9, fullMark: 10 },
  { subject: 'Squatting', A: 6, fullMark: 10 },
  { subject: 'Cough CPR', A: 4, fullMark: 10 },
];

export function CountermeasuresChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={countermeasureData}>
        <PolarGrid />
        <PolarAngleAxis dataKey="subject" />
        <PolarRadiusAxis angle={30} domain={[0, 10]} />
        <Radar name="Effectiveness" dataKey="A" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.6} />
        <Tooltip />
        <Legend />
      </RadarChart>
    </ResponsiveContainer>
  );
}
