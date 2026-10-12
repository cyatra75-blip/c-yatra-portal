'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CatraLogo } from '@/components/CatraLogo';
import { HeroBanner } from '@/components/HeroBanner';
import { CategoryGrid } from '@/components/CategoryGrid';
import { PortalCard } from '@/components/PortalCard';
import { PortalSearch } from '@/components/PortalSearch';
import { Category, Portal } from '@/lib/types';
import { getCategoryIcon } from '@/lib/icons';
import { User, LogOut, ChevronDown, ExternalLink, Shield } from 'lucide-react';

export default function OwnerDashboardPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [portals, setPortals] = useState<Portal[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<{ email: string; full_name: string; role: string } | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  // 1. Fetch user profile, categories, and portals on mount
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        // Fetch current user
        const meRes = await fetch('/api/auth/me');
        if (meRes.ok) {
          const meData = await meRes.json();
          setUserProfile(meData.user);
          if (meData.user?.role === 'admin') {
            const params = new URLSearchParams(window.location.search);
            if (params.get('view') !== 'owner') {
              router.push('/admin/portals');
              return;
            }
          }
        }

        // Fetch active categories
        const catRes = await fetch('/api/categories');
        if (!catRes.ok) throw new Error('Failed to load categories');
        const catData = await catRes.json();
        const activeCategories: Category[] = catData.categories || [];
        setCategories(activeCategories);

        if (activeCategories.length > 0) {
          setSelectedCategoryId(activeCategories[0].id);
        }

        // Fetch active portals
        const portRes = await fetch('/api/portals');
        if (!portRes.ok) throw new Error('Failed to load portals');
        const portData = await portRes.json();
        setPortals(portData.portals || []);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch {
      window.location.href = '/login';
    }
  };

  // Find currently active category
  const selectedCategory = useMemo(() => {
    return categories.find((c) => c.id === selectedCategoryId) || categories[0];
  }, [categories, selectedCategoryId]);

  // Filter portals for selected category and search input
  const filteredPortals = useMemo(() => {
    if (!selectedCategoryId) return [];
    return portals.filter((p) => {
      if (p.category_id !== selectedCategoryId) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchName = p.name.toLowerCase().includes(query);
        const matchDesc = p.description?.toLowerCase().includes(query) || false;
        if (!matchName && !matchDesc) return false;
      }
      return true;
    });
  }, [portals, selectedCategoryId, searchQuery]);

  const SelectedIcon = selectedCategory ? getCategoryIcon(selectedCategory.icon) : null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Admin Preview Banner (visible when admin previews owner dashboard) */}
      {userProfile?.role === 'admin' && (
        <aside aria-label="Admin Preview Mode" className="bg-slate-900 text-white px-4 py-2 text-xs flex items-center justify-between z-50 shadow-md">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-medium text-slate-200">
              Admin Mode: You are previewing the Owner Dashboard.
            </span>
          </div>
          <Link
            href="/admin/portals"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#E11D2A] hover:bg-red-700 text-white font-semibold text-xs transition-colors shadow-xs"
          >
            <span>Back to Admin Panel</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </aside>
      )}

      {/* 1. Header (Reference Layout) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          {/* C-Yatra original logo on the left */}
          <div className="flex items-center shrink-0">
            <CatraLogo size="sm" priority />
          </div>

          {/* User profile / logout control on the right */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors select-none cursor-pointer"
              aria-expanded={profileOpen}
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs sm:text-sm shadow-2xs">
                {userProfile?.full_name?.charAt(0) || <User className="w-4 h-4" />}
              </div>
              <span className="hidden sm:inline font-semibold text-xs sm:text-sm text-slate-800">
                {userProfile?.full_name || 'Samridh Tomar'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {/* Profile Dropdown Menu */}
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {userProfile?.full_name || 'Samridh Tomar'}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {userProfile?.email || 'owner@cyatra.com'}
                  </p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-red-50 text-[#E11D2A] text-[10px] font-semibold uppercase">
                    Role: {userProfile?.role || 'owner'}
                  </span>
                </div>

                {userProfile?.role === 'admin' && (
                  <button
                    type="button"
                    onClick={() => router.push('/admin/portals')}
                    className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                  >
                    <Shield className="w-4 h-4 text-[#E11D2A]" />
                    <span>Admin Control Center</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 text-xs font-semibold text-[#E11D2A] hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Page Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 space-y-6 sm:space-y-8">
        
        {/* 2. Scenic Udaipur Hero Banner */}
        <section aria-label="Hero Banner">
          <HeroBanner />
        </section>

        {/* 3. Category Selector Cards */}
        <section aria-label="Travel Categories">
          {loading ? (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="h-20 w-24 bg-slate-200/70 rounded-2xl animate-pulse flex-shrink-0"
                />
              ))}
            </div>
          ) : (
            <CategoryGrid
              categories={categories}
              selectedCategoryId={selectedCategoryId}
              onSelectCategory={(id) => {
                setSelectedCategoryId(id);
                setSearchQuery('');
              }}
            />
          )}
        </section>

        {/* 4. Portal Listing Section */}
        <section aria-label="Portal Listing" className="space-y-4 sm:space-y-5">
          {/* Section Heading & Search Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-1 border-b border-slate-200/60">
            <div className="flex items-start gap-2.5">
              {SelectedIcon && (
                <div className="mt-0.5 text-[#E11D2A]">
                  <SelectedIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              )}
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                  {selectedCategory ? `${selectedCategory.name} Booking Portals` : 'Booking Portals'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Open multiple {selectedCategory?.name?.toLowerCase() || 'travel'} booking portals and find the best rates for your clients.
                </p>
              </div>
            </div>

            {/* Portal Search */}
            <div className="w-full sm:w-auto">
              <PortalSearch
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search portal..."
              />
            </div>
          </div>

          {/* Portal Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-20 bg-slate-200/60 rounded-2xl animate-pulse"
                />
              ))}
            </div>
          ) : filteredPortals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {filteredPortals.map((portal) => (
                <PortalCard key={portal.id} portal={portal} />
              ))}
            </div>
          ) : (
            /* Clean Empty States */
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                {SelectedIcon ? <SelectedIcon className="w-6 h-6" /> : <User className="w-6 h-6" />}
              </div>
              <p className="text-sm font-semibold text-slate-800">
                {searchQuery ? 'No matching portals found.' : 'No portals added to this category yet.'}
              </p>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="mt-2 text-xs text-[#E11D2A] hover:underline font-medium cursor-pointer"
                >
                  Clear search filter
                </button>
              )}
            </div>
          )}
        </section>

      </main>

      {/* Subtle Footer */}
      <footer className="mt-auto border-t border-slate-200/60 py-5 bg-white text-center text-xs text-slate-400">
        <p>© {new Date().getFullYear()} C-Yatra. All travel portals are properties of their respective owners.</p>
      </footer>
    </div>
  );
}
