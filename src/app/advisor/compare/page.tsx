import { createServerClient } from '@/lib/supabase-server';
import { MetroComparison } from '@/components/MetroComparison';

export default async function ComparePage() {
  const supabase = createServerClient();
  
  // Get unique metro areas (latest data only)
  const { data: metros } = await supabase
    .from('metro_zhvi')
    .select('region_id, region_name, state_name')
    .eq('region_type', 'msa')
    .order('region_name')
    .limit(1000);

  // Get unique list
  const uniqueMetros = metros 
    ? [...new Map(metros.map(m => [m.region_id, m])).values()]
    : [];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Compare Markets</h1>
        <p className="text-gray-400">
          Compare housing markets across different cities and regions
        </p>
      </div>

      <MetroComparison metros={uniqueMetros} />
    </main>
  );
}
