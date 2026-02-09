import { createServerClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface Home {
  id: string;
  nickname: string | null;
  city: string;
  state: string;
  purchase_price: number | null;
  current_mortgage_balance: number | null;
}

interface Scenario {
  id: string;
  name: string;
  scenario_type: string;
  target_city: string;
}

export default async function AdvisorPage() {
  const supabase = createServerClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect('/auth/signin');
  }

  // Get user's homes
  const { data: homes } = await supabase
    .from('user_homes')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false }) as { data: Home[] | null };

  // Get user's scenarios
  const { data: scenarios } = await supabase
    .from('user_scenarios')
    .select('*')
    .eq('user_id', session.user.id)
    .order('updated_at', { ascending: false }) as { data: Scenario[] | null };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Personal Housing Advisor</h1>
        <p className="text-gray-400">
          Get personalized insights and recommendations for your housing decisions
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        <Link 
          href="/advisor/homes/new"
          className="bg-alpex-card rounded-lg p-6 border border-alpex-border hover:border-alpex-green transition-colors"
        >
          <div className="text-3xl mb-3">🏠</div>
          <h3 className="text-lg font-semibold text-white mb-1">Add Your Home</h3>
          <p className="text-sm text-gray-400">Track your property value and equity</p>
        </Link>

        <Link 
          href="/advisor/compare"
          className="bg-alpex-card rounded-lg p-6 border border-alpex-border hover:border-alpex-green transition-colors"
        >
          <div className="text-3xl mb-3">📊</div>
          <h3 className="text-lg font-semibold text-white mb-1">Compare Markets</h3>
          <p className="text-sm text-gray-400">See how your city stacks up</p>
        </Link>

        <Link 
          href="/advisor/scenarios/new"
          className="bg-alpex-card rounded-lg p-6 border border-alpex-border hover:border-alpex-green transition-colors"
        >
          <div className="text-3xl mb-3">🎯</div>
          <h3 className="text-lg font-semibold text-white mb-1">Create Scenario</h3>
          <p className="text-sm text-gray-400">&ldquo;Should I sell and move?&rdquo;</p>
        </Link>
      </div>

      {/* Your Homes */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Your Homes</h2>
          <Link 
            href="/advisor/homes/new"
            className="text-sm text-alpex-green hover:underline"
          >
            + Add Home
          </Link>
        </div>

        {homes && homes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {homes.map((home: Home) => (
              <div key={home.id} className="bg-alpex-card rounded-lg p-6 border border-alpex-border">
                <h3 className="font-semibold text-white mb-1">{home.nickname || 'Unnamed Property'}</h3>
                <p className="text-sm text-gray-400 mb-3">{home.city}, {home.state}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Purchase Price:</span>
                    <span className="text-white">${home.purchase_price?.toLocaleString() || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Mortgage Balance:</span>
                    <span className="text-white">${home.current_mortgage_balance?.toLocaleString() || 'N/A'}</span>
                  </div>
                </div>
                <Link 
                  href={`/advisor/homes/${home.id}`}
                  className="mt-4 block text-center py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors"
                >
                  View Details
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-alpex-card rounded-lg p-8 border border-alpex-border text-center">
            <p className="text-gray-400 mb-4">You haven&apos;t added any homes yet</p>
            <Link 
              href="/advisor/homes/new"
              className="inline-block px-4 py-2 bg-alpex-green text-black font-semibold rounded-lg hover:bg-alpex-green/90 transition-colors"
            >
              Add Your First Home
            </Link>
          </div>
        )}
      </div>

      {/* Saved Scenarios */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Saved Scenarios</h2>
          <Link 
            href="/advisor/scenarios/new"
            className="text-sm text-alpex-green hover:underline"
          >
            + New Scenario
          </Link>
        </div>

        {scenarios && scenarios.length > 0 ? (
          <div className="space-y-3">
            {scenarios.map((scenario: Scenario) => (
              <div key={scenario.id} className="bg-alpex-card rounded-lg p-4 border border-alpex-border flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-white">{scenario.name}</h3>
                  <p className="text-sm text-gray-400">
                    {scenario.scenario_type.replace(/_/g, ' ')} • {scenario.target_city}
                  </p>
                </div>
                <Link 
                  href={`/advisor/scenarios/${scenario.id}`}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors"
                >
                  View Analysis
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-alpex-card rounded-lg p-8 border border-alpex-border text-center">
            <p className="text-gray-400 mb-4">No scenarios created yet</p>
            <Link 
              href="/advisor/scenarios/new"
              className="inline-block px-4 py-2 bg-alpex-green text-black font-semibold rounded-lg hover:bg-alpex-green/90 transition-colors"
            >
              Create Your First Scenario
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
