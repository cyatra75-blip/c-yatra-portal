import React from 'react';
import { CatraLogo } from '@/components/CatraLogo';
import { OwnerLoginForm } from '@/components/OwnerLoginForm';

export default function OwnerLoginPage() {
  return (
    <main className="relative min-h-screen w-full flex items-center justify-center overflow-x-hidden bg-slate-900">
      {/* Scenic Udaipur Lake Palace Fullscreen Background */}
      <div
        className="absolute inset-0 bg-cover bg-center md:bg-[center_40%] scale-100 filter brightness-95"
        style={{
          backgroundImage: "url('/images/udaipur-login.jpg')",
        }}
      />

      {/* Atmospheric Overlays */}
      <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[0.5px]" />
      <div className="hidden lg:block absolute inset-0 bg-gradient-to-r from-white/90 via-white/40 to-transparent w-[55%]" />

      {/* Main Responsive Container */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-12 py-8 min-h-screen flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Hero Column (Desktop only, matches reference screen) */}
          <div className="hidden lg:flex lg:col-span-7 flex-col justify-center pr-6">
            <div className="mb-6">
              <CatraLogo size="lg" priority />
            </div>

            <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
              All Your <br />
              Travel Portals <br />
              <span className="text-[#E11D2A]">in One Place</span>
            </h1>

            <p className="mt-4 text-base xl:text-lg text-slate-700 font-medium max-w-md leading-relaxed">
              Quick access to the best booking websites for your travel business.
            </p>

            {/* Red & Green Accent Line */}
            <div className="mt-6 flex items-center h-1.5 w-32 rounded-full overflow-hidden shadow-2xs">
              <div className="h-full w-3/5 bg-[#E11D2A]" />
              <div className="h-full w-2/5 bg-[#16A34A]" />
            </div>
          </div>

          {/* Right Column: Owner Login Card (Desktop & Mobile) */}
          <div className="w-full lg:col-span-5 flex justify-center lg:justify-end">
            <OwnerLoginForm />
          </div>

        </div>
      </div>
    </main>
  );
}
