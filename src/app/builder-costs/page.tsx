import { getBuilderExpenses } from '@/lib/data';
import { formatCurrency, formatPercent } from '@/lib/utils';
import Link from 'next/link';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function BuilderCostsPage() {
  let expenses: any[] = [];
  let error: string | null = null;
  
  try {
    expenses = await getBuilderExpenses();
    console.log(`Builder costs page: fetched ${expenses.length} expenses`);
  } catch (e) {
    error = String(e);
    console.error('Builder costs page error:', e);
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/" className="text-gray-400 hover:text-white transition-colors">
            ← Back to Dashboard
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Builder Cost Tracker</h1>
        <p className="text-gray-400">
          Material costs affecting new home construction
        </p>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-8">
          <p className="text-red-400">Error loading data: {error}</p>
        </div>
      )}

      {expenses.length === 0 && !error && (
        <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 mb-8">
          <p className="text-yellow-400">No data available. Please check back later.</p>
        </div>
      )}

      {expenses.length > 0 && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {expenses.slice(0, 4).map((expense, index) => (
              <div key={`${expense.material_name}-${index}`} className="bg-alpex-card rounded-lg p-4 border border-alpex-border">
                <h3 className="text-sm font-medium text-gray-400">{expense.material_name}</h3>
                <div className="mt-2">
                  <span className="text-2xl font-bold text-white">
                    {formatCurrency(expense.current_price)}
                  </span>
                </div>
                <div className="mt-2">
                  <span className={`text-sm font-medium ${
                    expense.percent_change > 0 ? 'text-alpex-red' : 'text-alpex-green'
                  }`}>
                    {formatPercent(expense.percent_change)}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">from start</span>
                </div>
              </div>
            ))}
          </div>

          {/* Detailed Table */}
          <div className="bg-alpex-card rounded-lg border border-alpex-border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-alpex-border bg-gray-900/50">
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Material</th>
                  <th className="text-right py-4 px-6 text-sm font-medium text-gray-400">Current Price</th>
                  <th className="text-right py-4 px-6 text-sm font-medium text-gray-400">Start Price</th>
                  <th className="text-right py-4 px-6 text-sm font-medium text-gray-400">Change</th>
                  <th className="text-right py-4 px-6 text-sm font-medium text-gray-400">% Change</th>
                  <th className="text-center py-4 px-6 text-sm font-medium text-gray-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense, index) => (
                  <tr key={`${expense.material_name}-${index}`} className="border-b border-alpex-border/50 hover:bg-white/5">
                    <td className="py-4 px-6 text-sm font-medium text-white">
                      {expense.material_name}
                    </td>
                    <td className="py-4 px-6 text-sm text-right text-gray-300">
                      {formatCurrency(expense.current_price)}
                    </td>
                    <td className="py-4 px-6 text-sm text-right text-gray-400">
                      {formatCurrency(expense.start_price)}
                    </td>
                    <td className="py-4 px-6 text-sm text-right">
                      <span className={expense.total_change > 0 ? 'text-alpex-red' : 'text-alpex-green'}>
                        {expense.total_change > 0 ? '+' : ''}{formatCurrency(Math.abs(expense.total_change))}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-right">
                      <span className={expense.percent_change > 0 ? 'text-alpex-red' : 'text-alpex-green'}>
                        {formatPercent(expense.percent_change)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-center">
                      <span className={`inline-block px-2 py-1 rounded text-xs ${
                        expense.status?.includes('MAJOR Rise') ? 'bg-red-500/20 text-red-400' :
                        expense.status?.includes('MAJOR Drop') ? 'bg-green-500/20 text-green-400' :
                        expense.status?.includes('Rise') ? 'bg-yellow-500/20 text-yellow-400' :
                        expense.status?.includes('Drop') ? 'bg-green-500/20 text-green-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {expense.status || 'Stable'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Footer */}
      <footer className="mt-12 text-center text-gray-500 text-sm">
        <p>Data updated daily from BLS and industry sources</p>
      </footer>
    </main>
  );
}
