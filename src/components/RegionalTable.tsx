'use client';

import { RegionalAffordability } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface RegionalTableProps {
  data: RegionalAffordability[];
}

export function RegionalTable({ data }: RegionalTableProps) {
  const regions = ['Northeast', 'Midwest', 'South', 'West'];
  
  // Group by region
  const regionData = regions.map(region => {
    const regionEntry = data.find(d => d.region.toLowerCase() === region.toLowerCase());
    return {
      region,
      id: regionEntry?.id || '',
      date: regionEntry?.date || '',
      median_home_price: regionEntry?.median_home_price,
      median_qualifying_income: regionEntry?.median_qualifying_income,
      median_family_income: regionEntry?.median_family_income,
      median_mortgage_payment: regionEntry?.median_mortgage_payment,
      affordability_score: regionEntry?.affordability_score,
    };
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-alpex-border">
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Region</th>
            <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Median Home Price</th>
            <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Qualifying Income</th>
            <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Family Income</th>
            <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Mortgage Payment</th>
            <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Affordability Score</th>
          </tr>
        </thead>
        <tbody>
          {regionData.map((row) => (
            <tr key={row.region} className="border-b border-alpex-border/50 hover:bg-white/5">
              <td className="py-3 px-4 text-sm font-medium text-white">{row.region}</td>
              <td className="py-3 px-4 text-sm text-right text-gray-300">
                {row.median_home_price ? formatCurrency(row.median_home_price) : '-'}
              </td>
              <td className="py-3 px-4 text-sm text-right text-gray-300">
                {row.median_qualifying_income ? formatCurrency(row.median_qualifying_income) : '-'}
              </td>
              <td className="py-3 px-4 text-sm text-right text-gray-300">
                {row.median_family_income ? formatCurrency(row.median_family_income) : '-'}
              </td>
              <td className="py-3 px-4 text-sm text-right text-gray-300">
                {row.median_mortgage_payment ? `$${row.median_mortgage_payment.toLocaleString()}` : '-'}
              </td>
              <td className="py-3 px-4 text-sm text-right">
                {row.affordability_score ? (
                  <span className={
                    row.affordability_score >= 100 ? 'text-alpex-green' :
                    row.affordability_score >= 80 ? 'text-alpex-yellow' :
                    'text-alpex-red'
                  }>
                    {row.affordability_score.toFixed(1)}
                  </span>
                ) : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
