'use client';

import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Category } from '@/lib/types';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reassignCategoryId?: string) => Promise<void>;
  title: string;
  message: string;
  portalCount?: number;
  availableCategories?: Category[];
  currentCategoryId?: string;
}

export function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  portalCount = 0,
  availableCategories = [],
  currentCategoryId,
}: ConfirmDeleteModalProps) {
  const [loading, setLoading] = useState(false);
  const [reassignOption, setReassignOption] = useState<'reassign' | 'delete'>(
    portalCount > 0 ? 'reassign' : 'delete'
  );
  const otherCategories = availableCategories.filter((c) => c.id !== currentCategoryId);
  const [selectedReassignCategory, setSelectedReassignCategory] = useState<string>(
    otherCategories[0]?.id || ''
  );

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      if (portalCount > 0 && reassignOption === 'reassign' && selectedReassignCategory) {
        await onConfirm(selectedReassignCategory);
      } else {
        await onConfirm(undefined);
      }
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center text-[#E11D2A] flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-slate-900">{title}</h3>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">{message}</p>
            </div>
          </div>

          {/* If deleting a category with attached portals */}
          {portalCount > 0 && otherCategories.length > 0 && (
            <div className="mt-4 p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs">
              <p className="font-semibold text-amber-900 mb-2">
                This category contains {portalCount} booking portal{portalCount > 1 ? 's' : ''}. What would you like to do?
              </p>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-amber-900">
                  <input
                    type="radio"
                    name="reassign"
                    checked={reassignOption === 'reassign'}
                    onChange={() => setReassignOption('reassign')}
                    className="text-[#E11D2A] focus:ring-[#E11D2A]"
                  />
                  <span>Reassign portals to another category</span>
                </label>
                {reassignOption === 'reassign' && (
                  <select
                    value={selectedReassignCategory}
                    onChange={(e) => setSelectedReassignCategory(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E11D2A]"
                  >
                    {otherCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                )}
                <label className="flex items-center gap-2 cursor-pointer text-amber-900">
                  <input
                    type="radio"
                    name="reassign"
                    checked={reassignOption === 'delete'}
                    onChange={() => setReassignOption('delete')}
                    className="text-[#E11D2A] focus:ring-[#E11D2A]"
                  />
                  <span>Delete portals together with this category</span>
                </label>
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className="px-5 py-2 text-xs font-semibold text-white bg-[#E11D2A] hover:bg-[#C5131F] rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-60"
            >
              {loading ? 'Deleting...' : 'Confirm Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
