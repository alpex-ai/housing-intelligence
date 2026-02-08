'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface Metro {
  region_id: number;
  region_name: string;
  state_name: string | null;
}

interface MetroData {
  date: string;
  [key: string]: string | number;
}

export function MetroComparison({ metros }: { metros: Metro[] }) {
  const [selectedMetros, setSelectedMetros] = useState<number[]>([]);
  const [metroData, setMetroData] = useState<MetroData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const supabase = createClientComponentClient();

  const filteredMetros = metros.filter(m => 
    m.region_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleMetro = async (regionId: number) => {
    let newSelection: number[];
    
    if (selectedMetros.includes(regionId)) {
      newSelection = selectedMetros.filter(id => id !== regionId);
    } else {
      if (selectedMetros.length >= 4) {
        alert('You can compare up to 4 metros at a time');
        return;
      }
      newSelection = [...selectedMetros, regionId];
    }
    
    setSelectedMetros(newSelection);
    
    if (newSelection.length > 0) {
      await fetchMetroData(newSelection);
    } else {
      setMetroData([]);
    }
  };

  const fetchMetroData = async (regionIds: number[]) => {
    setLoading(true);
    
    // Get last 24 months of data for selected metros
    const { data } = await supabase
      .from('metro_zhvi')
      .select('region_id, region_name, date, home_value')
      .in('region_id', regionIds)
      .gte('date', new Date(Date.now() - 730 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('date');

    if (data) {
      // Transform data for chart
      const groupedByDate: { [date: string]: MetroData } = {};
      
      data.forEach(row => {
        if (!groupedByDate[row.date]) {
          groupedByDate[row.date] = { date: row.date };
        }
        groupedByDate[row.date][row.region_name] = row.home_value;
      });
      
      setMetroData(Object.values(groupedByDate));
    }
    
    setLoading(false);
  };

  const selectedMetroNames = metros
    .filter(m => selectedMetros.includes(m.region_id))
    .map(m => m.region_name);

  const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Metro Selector */}
      <div className="lg:col-span-1">
        <div className="bg-alpex-card rounded-lg border border-alpex-border p-4">
          <h3 className="font-semibold text-white mb-3">Select Cities</h3>
          
          <input
            type="text"
            placeholder="Search cities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm mb-3 focus:outline-none focus:border-alpex-green"
          />
          
          <div className="max-h-96 overflow-y-auto space-y-1">
            {filteredMetros.slice(0, 50).map((metro) => (
              <button
                key={metro.region_id}
                onClick={() => toggleMetro(metro.region_id)}
                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                  selectedMetros.includes(metro.region_id)
                    ? 'bg-alpex-green/20 text-alpex-green border border-alpex-green/50'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                {metro.region_name}
              </button>
            ))}
          </div>
          
          {filteredMetros.length > 50 && (
            <p className="text-xs text-gray-500 mt-2 text-center">
              Showing 50 of {filteredMetros.length} results. Refine your search.
            </p>
          )}
        </div>

        {/* Selected Summary */}
        {selectedMetros.length > 0 && (
          <div className="bg-alpex-card rounded-lg border border-alpex-border p-4 mt-4">
            <h3 className="font-semibold text-white mb-3">Selected ({selectedMetros.length}/4)</h3>
            <div className="space-y-2">
              {selectedMetroNames.map((name, i) => (
                <div key={name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: colors[i] }}
                  />
                  <span className="text-sm text-gray-300">{name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="lg:col-span-2">
        <div className="bg-alpex-card rounded-lg border border-alpex-border p-6">
          {loading ? (
            <div className="h-96 flex items-center justify-center">
              <p className="text-gray-400">Loading data...</p>
            </div>
          ) : metroData.length > 0 ? (
            <>
              <h3 className="font-semibold text-white mb-4">Home Value Trends (24 months)</h3>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metroData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#9ca3af"
                      tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                    />
                    <YAxis 
                      stroke="#9ca3af"
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                      labelStyle={{ color: '#9ca3af' }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Legend />
                    {selectedMetroNames.map((name, i) => (
                      <Line
                        key={name}
                        type="monotone"
                        dataKey={name}
                        stroke={colors[i]}
                        strokeWidth={2}
                        dot={false}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <div className="h-96 flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-400 mb-2">Select up to 4 cities to compare</p>
                <p className="text-sm text-gray-500">Home value trends will appear here</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
