'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { AdminNav } from '@/components/AdminNav';
import { PortalModal } from '@/components/PortalModal';
import { ConfirmDeleteModal } from '@/components/ConfirmDeleteModal';
import { Portal, Category } from '@/lib/types';
import { Plus, Edit2, Trash2, Search, ExternalLink, Globe, Compass, CheckCircle2, XCircle } from 'lucide-react';

export default function AdminPortalsPage() {
  const [portals, setPortals] = useState<Portal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [portalToEdit, setPortalToEdit] = useState<Portal | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [portalToDelete, setPortalToDelete] = useState<Portal | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [catsRes, portsRes] = await Promise.all([
        fetch('/api/categories?include_inactive=true'),
        fetch('/api/portals?include_inactive=true'),
      ]);

      if (catsRes.ok) {
        const catData = await catsRes.json();
        setCategories(catData.categories || []);
      }

      if (portsRes.ok) {
        const portData = await portsRes.json();
        setPortals(portData.portals || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleStatus = async (portal: Portal) => {
    try {
      const res = await fetch(`/api/portals/${portal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !portal.is_active }),
      });
      if (res.ok) {
        await loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!portalToDelete) return;
    try {
      const res = await fetch(`/api/portals/${portalToDelete.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Failed to delete portal');
        return;
      }
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // Filter portals by category and search
  const filteredPortals = useMemo(() => {
    return portals.filter((p) => {
      if (selectedCategoryFilter !== 'all' && p.category_id !== selectedCategoryFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchDesc = p.description?.toLowerCase().includes(q) || false;
        const matchUrl = p.website_url.toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchUrl) return false;
      }
      return true;
    });
  }, [portals, selectedCategoryFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <AdminNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Compass className="w-6 h-6 text-[#E11D2A]" />
              Booking Portals Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Add, edit, reorder, and configure third-party booking portal links and brand logos.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setPortalToEdit(null);
              setModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#E11D2A] hover:bg-[#C5131F] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Portal</span>
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Category:</span>
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E11D2A]"
            >
              <option value="all">All Categories ({portals.length})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by name or URL..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E11D2A]"
            />
          </div>
        </div>

        {/* Portals Table */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading booking portals...</div>
          ) : filteredPortals.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">
              No portals match your criteria. Click &quot;Add Portal&quot; to create one.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-5 py-3.5 w-16 text-center">Order</th>
                    <th className="px-5 py-3.5">Portal Details</th>
                    <th className="px-5 py-3.5">Category</th>
                    <th className="px-5 py-3.5">Target Website URL</th>
                    <th className="px-5 py-3.5 text-center">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal text-slate-800">
                  {filteredPortals.map((portal) => (
                    <tr key={portal.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Sort Order */}
                      <td className="px-5 py-4 text-center font-semibold text-slate-400">
                        {portal.sort_order}
                      </td>

                      {/* Name, Logo & Description */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-1 flex-shrink-0 overflow-hidden shadow-2xs">
                            {portal.logo_url ? (
                              <img
                                src={portal.logo_url}
                                alt={portal.name}
                                className="w-full h-full object-contain rounded-lg"
                              />
                            ) : (
                              <Globe className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{portal.name}</div>
                            {portal.description && (
                              <div className="text-[11px] text-slate-500 max-w-xs truncate">
                                {portal.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category Badge */}
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-800">
                          {portal.category?.name || 'Uncategorized'}
                        </span>
                      </td>

                      {/* Website URL */}
                      <td className="px-5 py-4 max-w-xs">
                        <a
                          href={portal.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-slate-600 hover:text-[#E11D2A] truncate font-mono text-xs max-w-full"
                          title={portal.website_url}
                        >
                          <span className="truncate">{portal.website_url}</span>
                          <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                        </a>
                      </td>

                      {/* Active Status */}
                      <td className="px-5 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(portal)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                            portal.is_active
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                          title="Click to toggle active state"
                        >
                          <span className={`w-2 h-2 rounded-full ${portal.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          <span>{portal.is_active ? 'Active' : 'Inactive'}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setPortalToEdit(portal);
                              setModalOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Edit Portal"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setPortalToDelete(portal);
                              setDeleteModalOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-[#E11D2A] hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Portal"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Add / Edit Portal Modal */}
      <PortalModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={loadData}
        portalToEdit={portalToEdit}
        categories={categories}
        defaultCategoryId={selectedCategoryFilter !== 'all' ? selectedCategoryFilter : undefined}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={`Delete Portal "${portalToDelete?.name}"?`}
        message="Are you sure you want to delete this booking portal? It will no longer be visible to the owner."
      />
    </div>
  );
}
