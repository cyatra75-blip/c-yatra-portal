'use client';

import React, { useState, useEffect } from 'react';
import { Portal, Category } from '@/lib/types';
import { X, AlertCircle, ExternalLink, Globe, Image as ImageIcon } from 'lucide-react';

interface PortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  portalToEdit?: Portal | null;
  categories: Category[];
  defaultCategoryId?: string;
}

const PRESET_LOGOS = [
  { label: 'MakeMyTrip', path: '/portals/makemytrip.svg' },
  { label: 'Ixigo', path: '/portals/ixigo.svg' },
  { label: 'Cleartrip', path: '/portals/cleartrip.svg' },
  { label: 'Skyscanner', path: '/portals/skyscanner.svg' },
  { label: 'Google Flights', path: '/portals/googleflights.svg' },
  { label: 'Booking.com', path: '/portals/booking.svg' },
  { label: 'Yatra', path: '/portals/yatra.svg' },
  { label: 'EaseMyTrip', path: '/portals/easemytrip.svg' },
  { label: 'Trip.com', path: '/portals/trip.svg' },
  { label: 'Alternative Airlines', path: '/portals/alternativeairlines.svg' },
  { label: 'Agoda', path: '/portals/agoda.svg' },
  { label: 'Goibibo', path: '/portals/goibibo.svg' },
  { label: 'RedBus', path: '/portals/redbus.svg' },
  { label: 'IRCTC', path: '/portals/irctc.svg' },
  { label: 'Airbnb', path: '/portals/airbnb.svg' },
  { label: 'Savaari', path: '/portals/savaari.svg' },
  { label: 'Atlys', path: '/portals/atlys.svg' },
  { label: 'PolicyBazaar', path: '/portals/policybazaar.svg' },
];

export function PortalModal({
  isOpen,
  onClose,
  onSaved,
  portalToEdit,
  categories,
  defaultCategoryId,
}: PortalModalProps) {
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [description, setDescription] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [sortOrder, setSortOrder] = useState<number>(1);
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState(false);

  useEffect(() => {
    if (portalToEdit) {
      setName(portalToEdit.name);
      setCategoryId(portalToEdit.category_id);
      setWebsiteUrl(portalToEdit.website_url);
      setLogoUrl(portalToEdit.logo_url || '');
      setDescription(portalToEdit.description || '');
      setInternalNotes(portalToEdit.internal_notes || '');
      setSortOrder(portalToEdit.sort_order);
      setIsActive(portalToEdit.is_active);
    } else {
      setName('');
      setCategoryId(defaultCategoryId || categories[0]?.id || '');
      setWebsiteUrl('');
      setLogoUrl('');
      setDescription('');
      setInternalNotes('');
      setSortOrder(1);
      setIsActive(true);
    }
    setPreviewError(false);
    setError(null);
  }, [portalToEdit, isOpen, defaultCategoryId, categories]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const isEditing = Boolean(portalToEdit);
      const url = isEditing ? `/api/portals/${portalToEdit!.id}` : '/api/portals';
      const method = isEditing ? 'PUT' : 'POST';

      const payload = {
        name: name.trim(),
        category_id: categoryId,
        website_url: websiteUrl.trim(),
        logo_url: logoUrl.trim() || null,
        description: description.trim() || null,
        internal_notes: internalNotes.trim() || null,
        sort_order: Number(sortOrder),
        is_active: isActive,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save portal');
      }

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {portalToEdit ? 'Edit Booking Portal' : 'Add Booking Portal'}
            </h3>
            <p className="text-xs text-slate-500">
              Enter official booking portal information and URL.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Name & Category Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Portal Name <span className="text-[#E11D2A]">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. MakeMyTrip, Skyscanner"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E11D2A]/20 focus:border-[#E11D2A]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Category <span className="text-[#E11D2A]">*</span>
              </label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E11D2A]/20 focus:border-[#E11D2A]"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Website URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Official Website URL <span className="text-[#E11D2A]">*</span>
            </label>
            <div className="relative">
              <input
                type="url"
                required
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://www.makemytrip.com/flights/"
                className="w-full pl-3.5 pr-10 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E11D2A]/20 focus:border-[#E11D2A]"
              />
              {websiteUrl && (
                <a
                  href={websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#E11D2A]"
                  title="Test URL"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Logo URL & Live Preview */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Logo (Image URL or Local Preset)
            </label>
            <div className="flex items-center gap-3">
              {/* Live Preview Box */}
              <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex-shrink-0 flex items-center justify-center p-1 overflow-hidden shadow-2xs">
                {logoUrl && !previewError ? (
                  <img
                    src={logoUrl}
                    alt="Logo Preview"
                    className="w-full h-full object-contain rounded-lg"
                    onError={() => setPreviewError(true)}
                  />
                ) : (
                  <div className="text-slate-400 text-xs flex flex-col items-center">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                )}
              </div>

              {/* URL Input */}
              <input
                type="text"
                value={logoUrl}
                onChange={(e) => {
                  setLogoUrl(e.target.value);
                  setPreviewError(false);
                }}
                placeholder="e.g. /portals/makemytrip.svg or https://example.com/logo.png"
                className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E11D2A]/20 focus:border-[#E11D2A]"
              />
            </div>

            {/* Quick Logo Presets */}
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] text-slate-400 font-medium">Quick Presets:</span>
              {PRESET_LOGOS.slice(0, 8).map((preset) => (
                <button
                  key={preset.path}
                  type="button"
                  onClick={() => {
                    setLogoUrl(preset.path);
                    setPreviewError(false);
                  }}
                  className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Short Description (displayed on card)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Domestic & International Flights"
              maxLength={200}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E11D2A]/20 focus:border-[#E11D2A]"
            />
          </div>

          {/* Internal Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Internal Notes (admin only)
            </label>
            <textarea
              rows={2}
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder="e.g. Agency discount code, dedicated account manager contact"
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E11D2A]/20 focus:border-[#E11D2A]"
            />
          </div>

          {/* Sort Order & Status Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Display Order
              </label>
              <input
                type="number"
                min={0}
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E11D2A]/20 focus:border-[#E11D2A]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Status
              </label>
              <div className="flex items-center h-10 gap-2">
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isActive ? 'bg-[#E11D2A]' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      isActive ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span className="text-xs font-medium text-slate-700">
                  {isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-[#E11D2A] hover:bg-[#C5131F] rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-60"
            >
              {loading ? 'Saving...' : portalToEdit ? 'Save Changes' : 'Add Portal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
