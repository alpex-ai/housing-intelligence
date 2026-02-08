'use client';

import { HouseholdExpense } from '@/lib/types';
import { formatCurrency, formatPercent } from '@/lib/utils';

interface ExpenseCategoryCardProps {
  expenses: HouseholdExpense[];
  category: string;
}

export function ExpenseCategoryCard({ expenses, category }: ExpenseCategoryCardProps) {
  const totalChange = expenses.reduce((sum, exp) => sum + exp.percent_change, 0) / expenses.length;

  return (
    <div className="bg-alpex-card rounded-lg p-6 border border-alpex-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{category}</h3>
        <span className={`text-sm font-medium ${
          totalChange > 5 ? 'text-alpex-red' :
          totalChange > 0 ? 'text-alpex-yellow' :
          'text-alpex-green'
        }`}>
          {formatPercent(totalChange)} avg
        </span>
      </div>
      <div className="space-y-3">
        {expenses.map((expense) => (
          <div key={expense.item_name} className="flex items-center justify-between">
            <span className="text-sm text-gray-300">{expense.item_name}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-white">{formatCurrency(expense.current_price)}</span>
              <span className={`text-xs ${
                expense.percent_change > 10 ? 'text-alpex-red' :
                expense.percent_change > 0 ? 'text-alpex-yellow' :
                expense.percent_change < -5 ? 'text-alpex-green' :
                'text-gray-400'
              }`}>
                {formatPercent(expense.percent_change)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
