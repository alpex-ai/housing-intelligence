'use client';

import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import Link from 'next/link';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await signUp(email, password, fullName);
    
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
    
    setLoading(false);
  };

  if (success) {
    return (
      <main className="max-w-md mx-auto px-4 py-16">
        <div className="bg-alpex-card rounded-lg p-8 border border-alpex-border text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Check your email</h1>
          <p className="text-gray-400">
            We've sent you a confirmation link. Please check your email to complete your registration.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-md mx-auto px-4 py-16">
      <div className="bg-alpex-card rounded-lg p-8 border border-alpex-border">
        <h1 className="text-2xl font-bold text-white mb-2">Create Account</h1>
        <p className="text-gray-400 mb-6">Get personalized housing insights</p>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-alpex-green"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-alpex-green"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-alpex-green"
              minLength={8}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-alpex-green hover:bg-alpex-green/90 text-black font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-4 text-center text-gray-400 text-sm">
          Already have an account?{' '}
          <Link href="/auth/signin" className="text-alpex-green hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
