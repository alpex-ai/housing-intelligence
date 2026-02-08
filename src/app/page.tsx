import { getLatestHousingMetrics, getHousingMetricsHistory, getRegionalAffordability } from '@/lib/data';
import { MetricCard } from '@/components/MetricCard';
import { HealthIndexCard } from '@/components/HealthIndexCard';
import { PriceChart } from '@/components/PriceChart';
import { AffordabilityChart } from '@/components/AffordabilityChart';
import { RegionalTable } from '@/components/RegionalTable';
import { formatCurrency, formatPercent } from '@/lib/utils';
import Link from 'next/link';
import { ArrowRight, HardHat, ShoppingCart, AlertTriangle } from 'lucide-react';

export default async function Home() {
  const [latestMetrics, metricsHistory, regionalData] = await Promise.all([
    getLatestHousingMetrics(),
    getHousingMetricsHistory(12),
    getRegionalAffordability(),
  ]);

  if (!latestMetrics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Loading data...</p>
      </div>
    );
  }

  const healthIndex = latestMetrics.healthIndex;
  const prevMetrics = metricsHistory.length > 1 ? metricsHistory[metricsHistory.length - 2] : null;
  
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Housing Intelligence Dashboard
        </h1>
        <p className="text-gray-400">
          Comprehensive housing affordability tracking. Data updated daily from FRED.
        </p>
      </div>

      {/* Health Index */}
      <div className="mb-8">
        <HealthIndexCard 
          score={healthIndex.score} 
          lastUpdated={latestMetrics.date}
        />
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link href="/builder-costs" className="bg-alpex-card rounded-lg p-4 border border-alpex-border hover:border-alpex-blue/50 transition-colors group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <HardHat className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="font-medium text-white group-hover:text-blue-400 transition-colors">Builder Costs</h3>
                <p className="text-xs text-gray-400">Material prices & trends</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-blue-400 transition-colors" />
          </div>
        </Link>
        
        <Link href="/household-expenses" className="bg-alpex-card rounded-lg p-4 border border-alpex-border hover:border-alpex-green/50 transition-colors group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <ShoppingCart className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="font-medium text-white group-hover:text-green-400 transition-colors">Household Expenses</h3>
                <p className="text-xs text-gray-400">Cost of living index</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-green-400 transition-colors" />
          </div>
        </Link>
        
        <Link href="/crash-indicators" className="bg-alpex-card rounded-lg p-4 border border-alpex-border hover:border-alpex-red/50 transition-colors group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="font-medium text-white group-hover:text-red-400 transition-colors">Crash Indicators</h3>
                <p className="text-xs text-gray-400">Risk monitoring</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-red-400 transition-colors" />
          </div>
        </Link>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          title="Median Home Price"
          value={formatCurrency(latestMetrics.median_home_value)}
          change={prevMetrics ? ((latestMetrics.median_home_value - prevMetrics.median_home_value) / prevMetrics.median_home_value * 100) : 0}
          target="$385,000"
        />
        <MetricCard
          title="New Construction"
          value={formatCurrency(latestMetrics.median_new_home_sale_price)}
          change={prevMetrics ? ((latestMetrics.median_new_home_sale_price - prevMetrics.median_new_home_sale_price) / prevMetrics.median_new_home_sale_price * 100) : 0}
          target="$401,800"
        />
        <MetricCard
          title="Mortgage Rate"
          value={`${latestMetrics.mortgage_rate}%`}
          change={prevMetrics ? (latestMetrics.mortgage_rate - prevMetrics.mortgage_rate) : 0}
          target="6.72%"
          isPercent
        />
        <MetricCard
          title="Affordability Index"
          value={latestMetrics.affordability_index.toFixed(1)}
          change={prevMetrics ? ((latestMetrics.affordability_index - prevMetrics.affordability_index) / prevMetrics.affordability_index * 100) : 0}
          target="125"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-alpex-card rounded-lg p-6 border border-alpex-border">
          <h3 className="text-lg font-semibold text-white mb-4">Price Trends</h3>
          <PriceChart data={metricsHistory} />
        </div>
        <div className="bg-alpex-card rounded-lg p-6 border border-alpex-border">
          <h3 className="text-lg font-semibold text-white mb-4">Affordability Over Time</h3>
          <AffordabilityChart data={metricsHistory} />
        </div>
      </div>

      {/* Regional Breakdown */}
      <div className="bg-alpex-card rounded-lg p-6 border border-alpex-border">
        <h3 className="text-lg font-semibold text-white mb-4">Affordability by Region</h3>
        <RegionalTable data={regionalData} />
      </div>

      {/* Footer */}
      <footer className="mt-12 pt-8 border-t border-alpex-border text-center text-gray-500 text-sm">
        <p>Data sources: FRED, Census Bureau, BLS. Last updated: {latestMetrics.date}</p>
        <p className="mt-2">© 2026 Alpex AI. All rights reserved.</p>
      </footer>
    </main>
  );
}
