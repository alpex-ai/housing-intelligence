'use client';

interface CrashIndicatorGaugeProps {
  value: number;
  max: number;
  label: string;
  riskLevel: 'Low' | 'Moderate' | 'Elevated' | 'High';
}

export function CrashIndicatorGauge({ value, max, label, riskLevel }: CrashIndicatorGaugeProps) {
  const percentage = (value / max) * 100;
  
  const getColor = () => {
    switch (riskLevel) {
      case 'Low': return 'from-green-500 to-green-400';
      case 'Moderate': return 'from-yellow-500 to-yellow-400';
      case 'Elevated': return 'from-orange-500 to-orange-400';
      case 'High': return 'from-red-500 to-red-400';
      default: return 'from-gray-500 to-gray-400';
    }
  };

  return (
    <div className="bg-alpex-card rounded-lg p-4 border border-alpex-border">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-400">{label}</span>
        <span className={`text-xs font-medium px-2 py-1 rounded ${
          riskLevel === 'Low' ? 'bg-green-500/20 text-green-400' :
          riskLevel === 'Moderate' ? 'bg-yellow-500/20 text-yellow-400' :
          riskLevel === 'Elevated' ? 'bg-orange-500/20 text-orange-400' :
          'bg-red-500/20 text-red-400'
        }`}>
          {riskLevel} Risk
        </span>
      </div>
      <div className="text-2xl font-bold text-white mb-2">{value}</div>
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
        <div 
          className={`h-full bg-gradient-to-r ${getColor()} transition-all duration-500`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}
