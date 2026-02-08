import { getCrashIndicators } from '@/lib/data';
import { CrashIndicatorGauge } from '@/components/CrashIndicatorGauge';
import Link from 'next/link';

export default async function CrashIndicatorsPage() {
  const indicators = await getCrashIndicators();

  // Group by risk tier
  const critical = indicators.filter(i => i.category === 'Critical');
  const major = indicators.filter(i => i.category === 'Major');
  const minor = indicators.filter(i => i.category === 'Minor');

  const getRiskColor = (tier?: string | null) => {
    if (tier?.includes('Low')) return 'text-green-500';
    if (tier?.includes('Moderate')) return 'text-yellow-500';
    if (tier?.includes('Elevated')) return 'text-orange-500';
    return 'text-red-500';
  };

  const getRiskBg = (tier?: string | null) => {
    if (tier?.includes('Low')) return 'bg-green-500/20 border-green-500/50';
    if (tier?.includes('Moderate')) return 'bg-yellow-500/20 border-yellow-500/50';
    if (tier?.includes('Elevated')) return 'bg-orange-500/20 border-orange-500/50';
    return 'bg-red-500/20 border-red-500/50';
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/" className="text-gray-400 hover:text-white transition-colors">
            ← Back to Dashboard
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Housing Crash Indicators</h1>
        <p className="text-gray-400">
          Early warning signals tracking market stability
        </p>
      </div>

      {/* Overall Status */}
      <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-white">Current Market Status</h2>
            <p className="text-gray-300 mt-1">
              Risk Score: <span className="text-green-400 font-semibold">Low</span>
            </p>
          </div>
          <div className="text-4xl">🟢</div>
        </div>
      </div>

      {/* Critical Indicators */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Critical Indicators</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {critical.map((indicator) => (
            <div 
              key={indicator.variable_name} 
              className={`rounded-lg p-4 border ${getRiskBg(indicator.risk_tier)}`}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-white">{indicator.variable_name}</h3>
                <span className={`text-2xl ${getRiskColor(indicator.risk_tier)}`}>
                  {indicator.risk_tier?.includes('Low') ? '🟢' :
                   indicator.risk_tier?.includes('Moderate') ? '🟡' :
                   indicator.risk_tier?.includes('Elevated') ? '🟠' : '🔴'}
                </span>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold text-white">{indicator.current_value}{indicator.variable_name.includes('Rate') ? '%' : ''}</span>
              </div>
              <p className={`text-sm mt-1 ${getRiskColor(indicator.risk_tier)}`}>
                {indicator.risk_tier}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Major Indicators */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Major Indicators</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {major.map((indicator) => (
            <div 
              key={indicator.variable_name} 
              className="bg-alpex-card rounded-lg p-4 border border-alpex-border"
            >
              <h3 className="text-sm font-medium text-gray-400">{indicator.variable_name}</h3>
              <div className="mt-2">
                <span className="text-xl font-bold text-white">{indicator.current_value}{indicator.variable_name.includes('Rate') ? '%' : ''}</span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className={`inline-block w-2 h-2 rounded-full ${
                  indicator.risk_tier?.includes('Low') ? 'bg-green-500' :
                  indicator.risk_tier?.includes('Moderate') ? 'bg-yellow-500' :
                  indicator.risk_tier?.includes('Elevated') ? 'bg-orange-500' :
                  'bg-red-500'
                }`} />
                <span className="text-xs text-gray-400">{indicator.risk_tier}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-alpex-card rounded-lg p-4 border border-alpex-border">
        <h3 className="text-sm font-medium text-gray-400 mb-3">Risk Level Legend</h3>
        <div className="flex flex-wrap gap-4 text-sm">
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500" /> 🟢 Low Risk
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-yellow-500" /> 🟡 Moderate Risk
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-orange-500" /> 🟠 Elevated Risk
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500" /> 🔴 High Risk
          </span>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 text-center text-gray-500 text-sm">
        <p>Data from Federal Reserve, BLS, and Census Bureau</p>
      </footer>
    </main>
  );
}
