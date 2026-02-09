'use client';

import { BuilderExpense } from '@/lib/types';
import { formatCurrency, formatPercent } from '@/lib/utils';

interface BuilderExpenseCardProps {
  expense: BuilderExpense;
}

export function BuilderExpenseCard({ expense }: BuilderExpenseCardProps) {
  const percentChange = expense.percent_change ?? 0;
  const isRising = percentChange > 0;
  const isMajor = Math.abs(percentChange) > 10;

  return (
    <div className="bg-alpex-card rounded-lg p-4 border border-alpex-border">
      <h3 className="text-sm font-medium text-gray-400">{expense.material_name}</h3>
      <div className="mt-2">
        <span className="text-2xl font-bold text-white">
          {formatCurrency(expense.current_price ?? 0)}
        </span>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <span className={`text-sm font-medium ${
          isRising ? 'text-alpex-red' : 'text-alpex-green'
        }`}>
          {isRising ? '↑' : '↓'} {formatPercent(percentChange)}
        </span>
        <span className="text-xs text-gray-500">
          from {formatCurrency(expense.start_price ?? 0)}
        </span>
      </div>
      {isMajor && (
        <div className="mt-2">
          <span className={`inline-block px-2 py-1 rounded text-xs ${
            isRising ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
          }`}>
            MAJOR {isRising ? 'Rise' : 'Drop'}
          </span>
        </div>
      )}
    </div>
  );
}
