'use client';

import React, { useState, useEffect } from 'react';
import { AdminNav } from '@/components/AdminNav';
import { CategoryModal } from '@/components/CategoryModal';
import { ConfirmDeleteModal } from '@/components/ConfirmDeleteModal';
import { Category } from '@/lib/types';
import { getCategoryIcon } from '@/lib/icons';
import { Plus, Edit2, Trash2, Power, Layers } from 'lucide-react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/categories?include_inactive=true');
      if (!res.ok) throw new Error('Failed to fetch categories');
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleToggleStatus = async (cat: Category) => {
    try {
      const res = await fetch(`/api/categories/${cat.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !cat.is_active }),
      });
      if (res.ok) {
        await loadCategories();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteConfirm = async (reassignToId?: string) => {
    if (!categoryToDelete) return;
    try {
      const query = reassignToId ? `?reassign_to=${reassignToId}` : '';
      const res = await fetch(`/api/categories/${categoryToDelete.id}${query}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Failed to delete category');
        return;
      }
      await loadCategories();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <AdminNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-6 h-6 text-[#E11D2A]" />
              Travel Categories
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Add, reorder, edit, and toggle travel category tabs displayed on the owner dashboard.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setCategoryToEdit(null);
              setModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#E11D2A] hover:bg-[#C5131F] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        </div>

        {/* Categories Table / List */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading categories...</div>
          ) : categories.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">No categories found. Click Add Category to create one.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-5 py-3.5 w-16 text-center">Order</th>
                    <th className="px-5 py-3.5">Category</th>
                    <th className="px-5 py-3.5">Slug</th>
                    <th className="px-5 py-3.5 text-center">Portals</th>
                    <th className="px-5 py-3.5 text-center">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal text-slate-800">
                  {categories.map((cat) => {
                    const IconComp = getCategoryIcon(cat.icon);
                    return (
                      <tr key={cat.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Sort Order */}
                        <td className="px-5 py-4 text-center font-semibold text-slate-400">
                          {cat.sort_order}
                        </td>

                        {/* Name & Icon */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-red-50 text-[#E11D2A] flex items-center justify-center flex-shrink-0">
                              <IconComp className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">{cat.name}</div>
                              <div className="text-[11px] text-slate-400 font-mono">Icon: {cat.icon}</div>
                            </div>
                          </div>
                        </td>

                        {/* Slug */}
                        <td className="px-5 py-4 font-mono text-slate-500 text-xs">
                          {cat.slug}
                        </td>

                        {/* Assigned Portals Count */}
                        <td className="px-5 py-4 text-center">
                          <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                            {cat.portal_count || 0}
                          </span>
                        </td>

                        {/* Active Toggle */}
                        <td className="px-5 py-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(cat)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                              cat.is_active
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}
                            title="Click to toggle active state"
                          >
                            <span className={`w-2 h-2 rounded-full ${cat.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                            <span>{cat.is_active ? 'Active' : 'Inactive'}</span>
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setCategoryToEdit(cat);
                                setModalOpen(true);
                              }}
                              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title="Edit Category"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setCategoryToDelete(cat);
                                setDeleteModalOpen(true);
                              }}
                              className="p-1.5 text-slate-400 hover:text-[#E11D2A] hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Category"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Add / Edit Category Modal */}
      <CategoryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={loadCategories}
        categoryToEdit={categoryToEdit}
      />

      {/* Safe Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={`Delete Category "${categoryToDelete?.name}"?`}
        message="Are you sure you want to delete this category? This will remove it from the owner dashboard tabs."
        portalCount={categoryToDelete?.portal_count || 0}
        availableCategories={categories}
        currentCategoryId={categoryToDelete?.id}
      />
    </div>
  );
}
