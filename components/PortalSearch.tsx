import React from 'react';
import { Search, X } from 'lucide-react';

interface PortalSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function PortalSearch({
  value,
  onChange,
  placeholder = 'Search portal...',
  className = '',
}: PortalSearchProps) {
  return (
    <div className={`relative w-full max-w-xs ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
        <Search className="h-4 w-4" />
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-9 py-2 md:py-2.5 text-xs md:text-sm bg-white border border-slate-200 rounded-xl md:rounded-full text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E11D2A]/20 focus:border-[#E11D2A] transition-all shadow-2xs"
      />

      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
