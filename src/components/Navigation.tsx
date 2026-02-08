'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, HardHat, ShoppingCart, AlertTriangle, TrendingUp, User, Sparkles } from 'lucide-react';
import { useAuth } from './AuthProvider';

const navItems = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Builder Costs', href: '/builder-costs', icon: HardHat },
  { name: 'Household Expenses', href: '/household-expenses', icon: ShoppingCart },
  { name: 'Crash Indicators', href: '/crash-indicators', icon: AlertTriangle },
];

export function Navigation() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <nav className="bg-alpex-card border-b border-alpex-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-alpex-blue to-alpex-green rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">Alpex Housing</span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-white/10 text-white"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </Link>
            ))}
            
            {/* Advisor Link - Highlighted */}
            <Link
              href="/advisor"
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                pathname.startsWith('/advisor')
                  ? "bg-alpex-green/20 text-alpex-green border border-alpex-green/50"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              <Sparkles className="w-4 h-4" />
              Advisor
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/advisor"
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm text-gray-300 hover:text-white transition-colors"
                >
                  <User className="w-4 h-4" />
                  {user.full_name || user.email}
                </Link>
                <button
                  onClick={signOut}
                  className="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/signin"
                  className="px-3 py-1.5 text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-4 py-1.5 text-sm bg-alpex-green text-black font-medium rounded-lg hover:bg-alpex-green/90 transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
