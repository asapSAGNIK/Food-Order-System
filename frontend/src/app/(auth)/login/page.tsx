'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Cookies from 'js-cookie';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setUser } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      Cookies.set('token', res.data.access_token, { expires: 1 });
      Cookies.set('user', JSON.stringify(res.data.user), { expires: 1 });
      setUser(res.data.user);
      router.push('/restaurants');
    } catch (err: any) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-card p-10 rounded-xl shadow-lg border-0">
        <div>
          <h2 className="mt-2 text-center text-3xl font-bold text-foreground">
            Slooze Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-500">
            Enter your credentials to access the food portal
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded text-sm text-center">
              {error}
            </div>
          )}
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground">Email address</label>
              <input
                type="email"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-foreground bg-white rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">Password</label>
              <input
                type="password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-foreground bg-white rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors duration-200"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
        
        <div className="mt-6 border-t border-gray-200 pt-6">
          <p className="text-xs text-gray-500 text-center mb-3 font-bold uppercase tracking-widest">Test Accounts</p>
          <div className="grid grid-cols-1 gap-2 text-[10px] text-foreground">
            <div className="bg-background p-2 rounded shadow-sm border border-accent-light flex justify-between items-center">
              <div><span className="font-bold block text-primary">Nick Fury (Admin)</span> nick@slooze.com</div>
              <span className="bg-white px-1.5 py-0.5 rounded border text-[9px]">GLOBAL</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-background p-2 rounded shadow-sm border border-accent-light">
                <span className="font-bold block text-primary">C. Marvel (Manager)</span>
                marvel@slooze.com
                <span className="block mt-1 text-[9px] opacity-70">Region: INDIA</span>
              </div>
              <div className="bg-background p-2 rounded shadow-sm border border-accent-light">
                <span className="font-bold block text-primary">C. America (Manager)</span>
                america@slooze.com
                <span className="block mt-1 text-[9px] opacity-70">Region: USA</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-background p-2 rounded shadow-sm border border-accent-light">
                <span className="font-bold block text-primary">Thanos (Member)</span>
                thanos@slooze.com
                <span className="block mt-1 text-[9px] opacity-70">Region: INDIA</span>
              </div>
              <div className="bg-background p-2 rounded shadow-sm border border-accent-light">
                <span className="font-bold block text-primary">Travis (Member)</span>
                travis@slooze.com
                <span className="block mt-1 text-[9px] opacity-70">Region: USA</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-400 text-center mt-3 font-medium">Password for all: <span className="text-primary">password123</span></p>
        </div>
      </div>
    </div>
  );
}
