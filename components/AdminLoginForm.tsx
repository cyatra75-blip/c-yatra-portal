'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Shield } from 'lucide-react';
import { CatraLogo } from './CatraLogo';

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
          portalType: 'admin',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed. Administrator privileges required.');
      }

      router.push('/admin/portals');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An error occurred during admin authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[420px] bg-white rounded-3xl shadow-2xl p-7 sm:p-9 border border-slate-100 flex flex-col items-center">
      <div className="mb-2">
        <CatraLogo size="md" priority />
      </div>

      <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-semibold tracking-wide uppercase">
        <Shield className="w-3 h-3 text-[#E11D2A]" />
        Admin Control
      </div>

      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-3">
        Admin Login
      </h2>
      <p className="text-xs sm:text-sm text-slate-500 text-center mt-1 mb-6">
        Manage travel categories and booking portals
      </p>

      {error && (
        <div className="w-full mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Admin email"
              autoComplete="email"
              className="w-full pl-10 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E11D2A]/20 focus:border-[#E11D2A] transition-all"
            />
          </div>
        </div>

        <div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="h-4 w-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin password"
              autoComplete="current-password"
              className="w-full pl-10 pr-11 py-2.5 sm:py-3 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E11D2A]/20 focus:border-[#E11D2A] transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 px-4 bg-[#E11D2A] hover:bg-[#C5131F] active:scale-[0.99] text-white font-semibold text-sm rounded-xl shadow-md shadow-red-500/20 flex items-center justify-center gap-2 transition-all duration-150 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Verifying Admin...</span>
            </div>
          ) : (
            <>
              <span>Admin Login</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="w-full mt-6 pt-5 border-t border-slate-100 flex flex-col items-center text-center">
        <div className="flex items-center gap-1.5 text-slate-900 font-semibold text-xs">
          <Lock className="w-3.5 h-3.5 text-slate-700" />
          <span>Restricted Admin Area</span>
        </div>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Only authorized administrators may access portal settings.
        </p>
      </div>
    </div>
  );
}
