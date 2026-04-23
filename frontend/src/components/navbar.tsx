'use client';

import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, ShoppingBag, Settings, Store } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  return (
    <nav className="bg-card shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="font-black text-xl tracking-tighter text-primary">SLOOZE</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/restaurants"
                className={`${
                  pathname.startsWith('/restaurants')
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:border-accent-light hover:text-primary'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors`}
              >
                <Store className="w-4 h-4 mr-2" />
                Restaurants
              </Link>
              <Link
                href="/orders"
                className={`${
                  pathname.startsWith('/orders')
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:border-accent-light hover:text-primary'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors`}
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                Orders
              </Link>
              {user.role === 'ADMIN' && (
                <Link
                  href="/settings/payment"
                  className={`${
                    pathname.startsWith('/settings')
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:border-accent-light hover:text-primary'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors`}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex-col items-end mr-4 hidden sm:flex">
                <span className="text-sm font-bold text-foreground">{user.name}</span>
                <span className="text-xs text-gray-500 tracking-wide">{user.role} • {user.country}</span>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-2 border border-transparent rounded-full text-primary hover:bg-accent-light focus:outline-none transition-colors"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
