import { createServerClient } from '@/lib/supabase-server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface Props {
  params: { id: string };
}

interface Scenario {
  id: string;
  name: string;
  created_at: string;
  scenario_type: string;
  analysis_results: any;
  user_homes: {
    nickname: string | null;
    city: string;
    state: string;
  } | null;
}

export default async function ScenarioDetailPage({ params }: Props) {
  const supabase = createServerClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect('/auth/signin');
  }

  const { data: scenario } = await supabase
    .from('user_scenarios')
    .select(`
      *,
      user_homes (nickname, city, state)
    `)
    .eq('id', params.id)
    .eq('user_id', session.user.id)
    .single() as { data: Scenario | null };

  if (!scenario) {
    notFound();
  }

  const analysis = scenario.analysis_results;
  
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
        <h1 className="text-3xl font-bold text-white mt-4 mb-2">{scenario.name}</h1>
        <p className="text-gray-400">
          Created {new Date(scenario.created_at).toLocaleDateString()} • {scenario.scenario_type.replace(/_/g, ' ')}
        </p>
      </div>

      {analysis ? (
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
            <h3 className="text-lg font-semibold text-white mb-3">Our Analysis</h3>
            <ul className="space-y-2">
              {analysis.reasoning.map((reason: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-gray-300">
                  <span className="text-alpex-green">•</span>
                  {reason}
                </li>
              ))}
            </ul>
          </div>

          {/* Financials */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-3">Financial Breakdown</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-sm text-gray-400">Current Value</p>
                <p className="text-xl font-semibold text-white">${analysis.homeAnalysis?.homeValue?.toLocaleString() || 'N/A'}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-sm text-gray-400">Your Equity</p>
                <p className="text-xl font-semibold text-alpex-green">${analysis.homeAnalysis?.equity?.toLocaleString() || 'N/A'}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-sm text-gray-400">Cash from Sale</p>
                <p className="text-xl font-semibold text-white">${analysis.financials?.cashFromSale?.toLocaleString() || 'N/A'}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-sm text-gray-400">Down Payment Needed</p>
                <p className="text-xl font-semibold text-white">${analysis.financials?.downPaymentNeeded?.toLocaleString() || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Link
              href="/advisor/scenarios/new"
              className="flex-1 py-3 bg-alpex-green text-black font-semibold rounded-lg hover:bg-alpex-green/90 transition-colors text-center"
            >
              Create New Scenario
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-alpex-card rounded-lg p-8 border border-alpex-border text-center">
          <p className="text-gray-400">No analysis data available for this scenario.</p>
        </div>
      )}
    </main>
  );
}
