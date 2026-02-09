'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Home {
  id: string;
  nickname: string | null;
  city: string;
  state: string;
}

interface Metro {
  region_id: number;
  region_name: string;
  state_name: string | null;
}

interface ScenarioAnalysis {
  recommendation: 'SELL_NOW' | 'WAIT' | 'HOLD' | 'RELOCATE';
  confidence: 'high' | 'medium' | 'low';
  reasoning: string[];
  homeAnalysis: {
    homeValue: number;
    equity: number;
    netProceeds: number;
  };
  targetHomePrice: number;
  financials: {
    cashFromSale: number;
    downPaymentNeeded: number;
    canAffordMove: boolean;
  };
  currentMetro: {
    regionName: string;
    yoyChange: number;
    trendDirection: string;
  } | null;
  targetMetro: {
    regionName: string;
    yoyChange: number;
    trendDirection: string;
  } | null;
  projectedHomeValue: {
    '6months': number;
    '12months': number;
  };
}

export default function NewScenarioPage() {
  const [homes, setHomes] = useState<Home[]>([]);
  const [metros, setMetros] = useState<Metro[]>([]);
  const [selectedHome, setSelectedHome] = useState('');
  const [targetCity, setTargetCity] = useState('');
  const [scenarioType, setScenarioType] = useState('sell_and_buy');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<ScenarioAnalysis | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    loadHomes();
    loadMetros();
  }, []);

  const loadHomes = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('user_homes')
      .select('id, nickname, city, state')
      .eq('user_id', user.id);

    if (data) setHomes(data);
  };

  const loadMetros = async () => {
    const { data } = await supabase
      .from('metro_zhvi')
      .select('region_id, region_name, state_name')
      .eq('region_type', 'msa')
      .order('region_name')
      .limit(500);

    if (data) {
      const seen = new Set<number>();
      const unique = data.filter((m: any) => {
        if (seen.has(m.region_id)) return false;
        seen.add(m.region_id);
        return true;
      });
      setMetros(unique);
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setAnalysis(null);

    try {
      const response = await fetch('/api/analyze-scenario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          homeId: selectedHome,
          targetCity,
          scenarioType
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      setAnalysis(data.analysis);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!analysis) return;
    
    setSaving(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth/signin');
      return;
    }

    const { data: scenario, error: saveError } = await supabase
      .from('user_scenarios')
      .insert({
        user_id: user.id,
        name: `${homes.find(h => h.id === selectedHome)?.nickname || 'My Home'} → ${targetCity}`,
        home_id: selectedHome,
        target_city: targetCity,
        scenario_type: scenarioType,
        analysis_results: analysis
      })
      .select()
      .single();

    if (saveError) {
      setError(saveError.message);
    } else {
      router.push(`/advisor/scenarios/${scenario.id}`);
    }
    
    setSaving(false);
  };

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'SELL_NOW': return 'bg-green-500 text-white';
      case 'RELOCATE': return 'bg-blue-500 text-white';
      case 'WAIT': return 'bg-yellow-500 text-black';
      case 'HOLD': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/advisor" className="text-gray-400 hover:text-white transition-colors text-sm">
          ← Back to Advisor
        </Link>
        <h1 className="text-3xl font-bold text-white mt-4 mb-2">Create Scenario</h1>
        <p className="text-gray-400">Should you sell your home and move to a new city?</p>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleAnalyze} className="bg-alpex-card rounded-lg p-6 border border-alpex-border mb-8">
        <div className="space-y-6">
          {/* Home Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Your Home *
            </label>
            <select
              value={selectedHome}
              onChange={(e) => setSelectedHome(e.target.value)}
              required
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-alpex-green"
            >
              <option value="">Choose a home...</option>
              {homes.map((home) => (
                <option key={home.id} value={home.id}>
                  {home.nickname || `${home.city}, ${home.state}`}
                </option>
              ))}
            </select>
            {homes.length === 0 && (
              <p className="text-sm text-yellow-500 mt-2">
                No homes found. <Link href="/advisor/homes/new" className="underline">Add a home first</Link>
              </p>
            )}
          </div>

          {/* Target City */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Target City *
            </label>
            <select
              value={targetCity}
              onChange={(e) => setTargetCity(e.target.value)}
              required
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-alpex-green"
            >
              <option value="">Select target metro area...</option>
              {metros.map((metro) => (
                <option key={metro.region_id} value={metro.region_name}>
                  {metro.region_name}
                </option>
              ))}
            </select>
          </div>

          {/* Scenario Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Scenario Type *
            </label>
            <select
              value={scenarioType}
              onChange={(e) => setScenarioType(e.target.value)}
              required
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-alpex-green"
            >
              <option value="sell_and_buy">Sell current home & buy in new city</option>
              <option value="rent_current_buy_new">Keep current as rental & buy in new city</option>
              <option value="keep_and_buy">Keep current & buy second home in new city</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading || !selectedHome || !targetCity}
            className="w-full py-3 bg-alpex-green text-black font-semibold rounded-lg hover:bg-alpex-green/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Analyzing...' : 'Analyze Scenario'}
          </button>
        </div>
      </form>

      {/* Analysis Results */}
      {analysis && (
        <div className="bg-alpex-card rounded-lg p-6 border border-alpex-border">
          {/* Recommendation */}
          <div className="text-center mb-8">
            <div className={`inline-block px-8 py-4 rounded-lg text-2xl font-bold ${getRecommendationColor(analysis.recommendation)}`}>
              {analysis.recommendation.replace(/_/g, ' ')}
            </div>
            <p className="text-gray-400 mt-2">
              Confidence: <span className="text-white capitalize">{analysis.confidence}</span>
            </p>
          </div>

          {/* Reasoning */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-3">Analysis</h3>
            <ul className="space-y-2">
              {analysis.reasoning.map((reason, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-300">
                  <span className="text-alpex-green">•</span>
                  {reason}
                </li>
              ))}
            </ul>
          </div>

          {/* Market Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="text-sm text-gray-400 mb-1">Your Current Market</h4>
              <p className="text-xl font-semibold text-white">{analysis.currentMetro?.regionName || 'Unknown'}</p>
              <p className={`text-lg ${analysis.currentMetro?.yoyChange && analysis.currentMetro.yoyChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {analysis.currentMetro?.yoyChange ? `${analysis.currentMetro.yoyChange > 0 ? '+' : ''}${analysis.currentMetro.yoyChange.toFixed(1)}% YoY` : 'N/A'}
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="text-sm text-gray-400 mb-1">Target Market</h4>
              <p className="text-xl font-semibold text-white">{analysis.targetMetro?.regionName || targetCity}</p>
              <p className={`text-lg ${analysis.targetMetro?.yoyChange && analysis.targetMetro.yoyChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {analysis.targetMetro?.yoyChange ? `${analysis.targetMetro.yoyChange > 0 ? '+' : ''}${analysis.targetMetro.yoyChange.toFixed(1)}% YoY` : 'N/A'}
              </p>
            </div>
          </div>

          {/* Financials */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-3">Financial Breakdown</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-sm text-gray-400">Current Value</p>
                <p className="text-xl font-semibold text-white">${analysis.homeAnalysis.homeValue.toLocaleString()}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-sm text-gray-400">Your Equity</p>
                <p className="text-xl font-semibold text-alpex-green">${analysis.homeAnalysis.equity.toLocaleString()}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-sm text-gray-400">Cash from Sale</p>
                <p className="text-xl font-semibold text-white">${analysis.financials.cashFromSale.toLocaleString()}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-sm text-gray-400">Down Payment Needed</p>
                <p className="text-xl font-semibold text-white">${analysis.financials.downPaymentNeeded.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 bg-alpex-blue text-white font-semibold rounded-lg hover:bg-alpex-blue/90 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save This Scenario'}
          </button>
        </div>
      )}
    </main>
  );
}
