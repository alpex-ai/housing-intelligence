'use client';

import { HousingMetric } from '@/lib/types';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface AffordabilityChartProps {
  data: HousingMetric[];
}

export function AffordabilityChart({ data }: AffordabilityChartProps) {
  const chartData = data.map((d) => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    index: d.affordability_index,
    target: 125,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
        <XAxis 
          dataKey="date" 
          stroke="#6b7280"
          tick={{ fill: '#6b7280', fontSize: 12 }}
        />
        <YAxis 
          stroke="#6b7280"
          tick={{ fill: '#6b7280', fontSize: 12 }}
          domain={[80, 140]}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#141414',
            border: '1px solid #2a2a2a',
            borderRadius: '6px',
          }}
          labelStyle={{ color: '#9ca3af' }}
          formatter={(value: number, name: string) => [
            value.toFixed(1),
            name === 'target' ? 'Target' : 'Affordability Index'
          ]}
        />
        <ReferenceLine 
          y={125} 
          stroke="#22c55e" 
          strokeDasharray="5 5"
          label={{ value: 'Target (125)', fill: '#22c55e', fontSize: 12, position: 'right' }}
        />
        <Area
          type="monotone"
          dataKey="index"
          stroke="#eab308"
          fill="#eab308"
          fillOpacity={0.2}
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
