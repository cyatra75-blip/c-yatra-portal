import React from 'react';
import { Category } from '@/lib/types';
import { getCategoryIcon } from '@/lib/icons';

interface CategoryGridProps {
  categories: Category[];
  selectedCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
}

export function CategoryGrid({
  categories,
  selectedCategoryId,
  onSelectCategory,
}: CategoryGridProps) {
  return (
    <div className="w-full">
      {/* Responsive Layout: 4 columns on mobile/tablet, horizontal flex on desktop */}
      <div className="grid grid-cols-4 sm:grid-cols-5 md:flex md:flex-row md:items-stretch md:overflow-x-auto gap-2 md:gap-3.5 pb-1 md:pb-2 no-scrollbar">
        {categories.map((cat) => {
          const isSelected = cat.id === selectedCategoryId;
          const IconComponent = getCategoryIcon(cat.icon);

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`
                group relative flex flex-col items-center justify-center
                py-2.5 px-2 md:py-3.5 md:px-5
                rounded-xl md:rounded-2xl
                transition-all duration-200 ease-out select-none
                min-h-[72px] md:min-h-[82px] md:min-w-[96px] md:flex-1
                text-center
                ${
                  isSelected
                    ? 'bg-[#E11D2A] text-white shadow-md shadow-red-500/25 border border-[#E11D2A] scale-[1.02]'
                    : 'bg-white text-slate-800 border border-slate-200/90 hover:border-slate-300 hover:shadow-sm hover:bg-slate-50/70'
                }
              `}
              aria-pressed={isSelected}
            >
              {/* Category Icon */}
              <div
                className={`
                  mb-1.5 transition-transform duration-200 group-hover:scale-110
                  ${isSelected ? 'text-white' : 'text-slate-800'}
                `}
              >
                <IconComponent className="w-5 h-5 md:w-6 md:h-6" strokeWidth={isSelected ? 2.2 : 1.9} />
              </div>

              {/* Category Name */}
              <span
                className={`
                  text-[11px] md:text-xs leading-tight font-semibold tracking-tight
                  line-clamp-2 md:line-clamp-1
                  ${isSelected ? 'text-white' : 'text-slate-800'}
                `}
              >
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
