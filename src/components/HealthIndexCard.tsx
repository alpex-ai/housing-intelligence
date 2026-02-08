'use client';

import { cn, formatPercent, getTrendColor } from '@/lib/utils';

interface HealthIndexCardProps {
  score: number;
  lastUpdated: string;
}

export function HealthIndexCard({ score, lastUpdated }: HealthIndexCardProps) {
  const getStatus = (score: number) => {
    if (score >= 80) return { label: 'Affordable Market', color: 'text-alpex-green', bgColor: 'bg-green-500/20', borderColor: 'border-green-500/50' };
    if (score >= 60) return { label: 'Moderate Strain', color: 'text-alpex-yellow', bgColor: 'bg-yellow-500/20', borderColor: 'border-yellow-500/50' };
    return { label: 'Nowhere Close to Affordable', color: 'text-alpex-red', bgColor: 'bg-red-500/20', borderColor: 'border-red-500/50' };
  };

  const status = getStatus(score);

  return (
    <div className={cn(
      "rounded-lg p-6 border-2",
      status.bgColor,
      status.borderColor
    )}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
            Housing Health Index
          </h2>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-5xl font-bold text-white">{score.toFixed(1)}</span>
            <span className={cn("text-lg font-medium", status.color)}>
              {status.label}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-4xl">
            {score >= 80 ? '🟢' : score >= 60 ? '🟡' : '🔴'}
          </div>
        </div>
      </div>
      <p className="mt-4 text-sm text-gray-400">
        Last updated: {lastUpdated}
      </p>
    </div>
  );
}
