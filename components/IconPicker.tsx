'use client';

import React, { useState } from 'react';
import { AVAILABLE_ICONS, getCategoryIcon } from '@/lib/icons';
import { Search } from 'lucide-react';

interface IconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const CurrentIcon = getCategoryIcon(value);

  const filteredIcons = AVAILABLE_ICONS.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-left text-sm text-slate-900 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#E11D2A]/20 focus:border-[#E11D2A] transition-all cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-800">
            <CurrentIcon className="w-5 h-5" />
          </div>
          <span className="font-medium text-slate-800">{value}</span>
        </div>
        <span className="text-xs text-slate-500 font-medium bg-slate-50 border border-slate-200/80 px-2 py-1 rounded-md">
          {isOpen ? 'Close' : 'Choose Icon'}
        </span>
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-2 p-3 bg-white rounded-2xl shadow-xl border border-slate-200/90 max-h-72 flex flex-col">
          <div className="relative mb-2.5">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search icons (plane, bed, car...)"
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#E11D2A]"
            />
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 overflow-y-auto pr-1 flex-1 max-h-48">
            {filteredIcons.map((item) => {
              const IconComp = item.icon;
              const isSelected = item.name === value;

              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => {
                    onChange(item.name);
                    setIsOpen(false);
                  }}
                  title={item.label}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#E11D2A] text-white shadow-xs'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <IconComp className="w-5 h-5 mb-1" />
                  <span className="text-[10px] truncate max-w-full">{item.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
