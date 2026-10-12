'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { CatraLogo } from './CatraLogo';
import { LogOut, Layers, ExternalLink } from 'lucide-react';

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch {
      window.location.href = '/admin/login';
    }
  };

  const isCategories = pathname.startsWith('/admin/categories');
  const isPortals = pathname.startsWith('/admin/portals');

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between">
        {/* Left: Brand Logo + Admin Badge */}
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/admin/portals" className="flex items-center gap-2 shrink-0">
            <CatraLogo size="sm" priority />
          </Link>
          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md bg-slate-900 text-white text-[11px] font-semibold uppercase tracking-wider">
            Admin
          </span>
        </div>

        {/* Center: Admin Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/admin/categories"
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              isCategories
                ? 'bg-[#E11D2A] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Categories
          </Link>
          <Link
            href="/admin/portals"
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              isPortals
                ? 'bg-[#E11D2A] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Manage Portals
          </Link>
        </nav>

        {/* Right: View Owner Portal & Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/dashboard?view=owner"
            target="_blank"
            className="hidden md:inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#E11D2A] font-medium transition-colors px-2 py-1"
            title="Preview Owner Dashboard in new tab"
          >
            <span>View Owner Dashboard</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 hover:text-[#E11D2A] hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
