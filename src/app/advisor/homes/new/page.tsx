'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';

export default function AddHomePage() {
  const [nickname, setNickname] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [mortgageBalance, setMortgageBalance] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/auth/signin');
        return;
      }

      // Insert home
      const { data: home, error: homeError } = await supabase
        .from('user_homes')
        .insert({
          user_id: user.id,
          nickname: nickname || null,
          address: address || null,
          city,
          state,
          zip_code: zipCode || null,
          purchase_price: purchasePrice ? parseFloat(purchasePrice) : null,
          purchase_date: purchaseDate || null,
          current_mortgage_balance: mortgageBalance ? parseFloat(mortgageBalance) : null,
          property_type: 'single_family'
        })
        .select()
        .single();

      if (homeError) throw homeError;

      // Insert initial appraisal if provided
      if (currentValue && home) {
        const { error: appraisalError } = await supabase
          .from('home_appraisals')
          .insert({
            home_id: home.id,
            appraisal_date: new Date().toISOString().split('T')[0],
            appraised_value: parseFloat(currentValue),
            appraisal_source: 'user_estimate'
          });

        if (appraisalError) throw appraisalError;
      }

      router.push('/advisor');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to add home');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/advisor" className="text-gray-400 hover:text-white transition-colors text-sm">
          ← Back to Advisor
        </Link>
        <h1 className="text-3xl font-bold text-white mt-4 mb-2">Add Your Home</h1>
        <p className="text-gray-400">Track your property and get personalized insights</p>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-alpex-card rounded-lg p-6 border border-alpex-border space-y-6">
        {/* Basic Info */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Property Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Property Nickname
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="e.g., Primary Residence, Rental Property"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-alpex-green"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Street Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Main St"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-alpex-green"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                City *
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-alpex-green"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                State *
              </label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="TX"
                maxLength={2}
                required
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-alpex-green"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                ZIP Code
              </label>
              <input
                type="text"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                placeholder="78701"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-alpex-green"
              />
            </div>
          </div>
        </div>

        {/* Purchase Info */}
        <div className="border-t border-alpex-border pt-6">
          <h3 className="text-lg font-semibold text-white mb-4">Purchase Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Purchase Price
              </label>
              <input
                type="number"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                placeholder="350000"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-alpex-green"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Purchase Date
              </label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-alpex-green"
              />
            </div>
          </div>
        </div>

        {/* Current Status */}
        <div className="border-t border-alpex-border pt-6">
          <h3 className="text-lg font-semibold text-white mb-4">Current Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Current Mortgage Balance
              </label>
              <input
                type="number"
                value={mortgageBalance}
                onChange={(e) => setMortgageBalance(e.target.value)}
                placeholder="280000"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-alpex-green"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Estimated Current Value
              </label>
              <input
                type="number"
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                placeholder="450000"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-alpex-green"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="border-t border-alpex-border pt-6">
          <div className="flex gap-4">
            <Link
              href="/advisor"
              className="px-6 py-3 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-alpex-green text-black font-semibold rounded-lg hover:bg-alpex-green/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Adding Home...' : 'Add Home'}
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}
