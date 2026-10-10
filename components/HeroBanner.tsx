import React from 'react';

export function HeroBanner() {
  return (
    <div className="relative w-full rounded-2xl md:rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm bg-white min-h-[170px] md:min-h-[260px] flex items-center">
      {/* Scenic Udaipur Lake Palace Background */}
      <div
        className="absolute inset-0 bg-cover bg-center md:bg-[center_35%] transform scale-100 transition-transform duration-700 hover:scale-[1.01]"
        style={{
          backgroundImage: "url('/images/udaipur-hero.jpg')",
        }}
      />

      {/* Soft Light Overlay for perfect legibility matching reference */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent md:w-[65%]" />

      {/* Banner Text Content */}
      <div className="relative z-10 px-6 py-6 md:px-12 md:py-10 max-w-xl">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-extrabold tracking-tight text-slate-900 leading-[1.15]">
          All Your Travel Portals{' '}
          <span className="block text-slate-900">
            <span className="text-slate-900">in </span>
            <span className="text-[#E11D2A]">One Place</span>
          </span>
        </h1>

        <p className="mt-2 md:mt-3 text-xs sm:text-sm md:text-base text-slate-600 font-medium">
          Quick access to your booking websites.
        </p>

        {/* C-Yatra Dual Brand Color Accent Line (Red + Green) */}
        <div className="mt-3 md:mt-4 flex items-center h-1.5 w-24 md:w-28 rounded-full overflow-hidden">
          <div className="h-full w-3/5 bg-[#E11D2A]" />
          <div className="h-full w-2/5 bg-[#16A34A]" />
        </div>
      </div>
    </div>
  );
}
