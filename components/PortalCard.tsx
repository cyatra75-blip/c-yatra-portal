import React, { useState } from 'react';
import { ExternalLink, Globe } from 'lucide-react';
import { Portal } from '@/lib/types';

interface PortalCardProps {
  portal: Portal;
}

export function PortalCard({ portal }: PortalCardProps) {
  const [imgError, setImgError] = useState(false);

  // Fallback initial letter or globe icon if image fails
  const firstLetter = portal.name.charAt(0).toUpperCase();

  return (
    <div className="group flex items-center justify-between p-3 sm:p-4 bg-white rounded-xl md:rounded-2xl border border-slate-200/90 hover:border-slate-300 hover:shadow-md transition-all duration-200">
      <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 pr-2">
        {/* Portal Logo Box */}
        <div className="relative flex-shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center p-1 shadow-2xs">
          {portal.logo_url && !imgError ? (
            <img
              src={portal.logo_url}
              alt={`${portal.name} logo`}
              className="w-full h-full object-contain rounded-lg"
              onError={() => setImgError(true)}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-[#E11D2A]/10 text-[#E11D2A] font-bold text-lg flex items-center justify-center rounded-lg">
              {firstLetter || <Globe className="w-5 h-5" />}
            </div>
          )}
        </div>

        {/* Portal Details */}
        <div className="min-w-0">
          <h3 className="font-bold text-slate-900 text-sm sm:text-[15px] leading-tight truncate">
            {portal.name}
          </h3>
          {portal.description && (
            <p className="text-[11px] sm:text-xs text-slate-500 truncate mt-0.5 font-normal">
              {portal.description}
            </p>
          )}
        </div>
      </div>

      {/* Red Action Button */}
      <a
        href={portal.website_url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-shrink-0 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-white bg-[#E11D2A] hover:bg-[#C5131F] active:scale-[0.98] rounded-lg sm:rounded-xl shadow-xs transition-all duration-150"
        title={`Open ${portal.name} in a new tab`}
      >
        <span className="hidden sm:inline">Open Website</span>
        <span className="sm:hidden">Open</span>
        <ExternalLink className="w-3.5 h-3.5 stroke-[2.2]" />
      </a>
    </div>
  );
}
