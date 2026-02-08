'use client';

import { cn, formatPercent, getTrendColor } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  target?: string;
  isPercent?: boolean;
}

export function MetricCard({ title, value, change, target, isPercent = false }: MetricCardProps) {
  const changeFormatted = isPercent 
    ? formatPercent(change, 2) 
    : formatPercent(change, 1);

  return (
    <div className="bg-alpex-card rounded-lg p-4 border border-alpex-border">
      <h3 className="text-sm font-medium text-gray-400">{title}</h3>
      <div className="mt-2">
        <span className="text-2xl font-bold text-white">{value}</span>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <span className={cn(
          "text-sm font-medium",
          getTrendColor(change, title.includes('Rate'))
        )}>
          {change > 0 ? '↑' : change < 0 ? '↓' : '→'} {changeFormatted}
        </span>
        <span className="text-xs text-gray-500">vs last month</span>
      </div>
      {target && (
        <div className="mt-2 pt-2 border-t border-alpex-border">
          <span className="text-xs text-gray-500">Target: </span>
          <span className="text-xs text-gray-300">{target}</span>
        </div>
      )}
    </div>
  );
}
