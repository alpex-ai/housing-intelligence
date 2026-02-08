import { getHouseholdExpenses } from '@/lib/data';
import { formatCurrency, formatPercent } from '@/lib/utils';
import Link from 'next/link';

export default async function HouseholdExpensesPage() {
  const categories = await getHouseholdExpenses();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/" className="text-gray-400 hover:text-white transition-colors">
            ← Back to Dashboard
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Household Cost Tracker</h1>
        <p className="text-gray-400">
          Essentials and discretionary spending affecting home budgets
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {categories.slice(0, 4).map((cat: {category: string; categoryTotal: number; categoryChange: number}) => (
          <div key={cat.category} className="bg-alpex-card rounded-lg p-4 border border-alpex-border">
            <h3 className="text-sm font-medium text-gray-400">{cat.category}</h3>
            <div className="mt-2">
              <span className="text-2xl font-bold text-white">
                {formatCurrency(cat.categoryTotal)}
              </span>
            </div>
            <div className="mt-2">
              <span className={`text-sm font-medium ${
                cat.categoryChange > 5 ? 'text-alpex-red' :
                cat.categoryChange > 0 ? 'text-alpex-yellow' :
                'text-alpex-green'
              }`}>
                {formatPercent(cat.categoryChange)}
              </span>
              <span className="text-xs text-gray-500 ml-2">avg change</span>
            </div>
          </div>
        ))}
      </div>

      {/* Category Cards */}
      {categories.map((category: {category: string; categoryChange: number; items: Array<{item_name: string; current_price: number; start_price: number; percent_change: number}>}) => (
        <div key={category.category} className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">{category.category}</h2>
            <span className={`text-sm font-medium ${
              category.categoryChange > 5 ? 'text-alpex-red' :
              category.categoryChange > 0 ? 'text-alpex-yellow' :
              'text-alpex-green'
            }`}>
              {formatPercent(category.categoryChange)} avg
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {category.items.map((item: {item_name: string; current_price: number; start_price: number; percent_change: number}) => (
              <div 
                key={item.item_name} 
                className="bg-alpex-card rounded-lg p-4 border border-alpex-border hover:border-alpex-border/80 transition-colors"
              >
                <h3 className="text-sm font-medium text-gray-400">{item.item_name}</h3>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-white">
                    {formatCurrency(item.current_price)}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className={`text-sm font-medium ${
                    item.percent_change > 10 ? 'text-alpex-red' :
                    item.percent_change > 0 ? 'text-alpex-yellow' :
                    item.percent_change < -5 ? 'text-alpex-green' :
                    'text-gray-400'
                  }`}>
                    {formatPercent(item.percent_change)}
                  </span>
                  <span className="text-xs text-gray-500">
                    from {formatCurrency(item.start_price)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Footer */}
      <footer className="mt-12 text-center text-gray-500 text-sm">
        <p>Data source: BLS Consumer Price Index</p>
      </footer>
    </main>
  );
}
