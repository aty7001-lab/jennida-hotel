"use client";

import { useState, useEffect } from 'react';
import { Menu, X, LayoutGrid } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function MobileHeader({ sidebar }: { sidebar: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <>
      {/* Top bar */}
      <div className="md:hidden flex items-center justify-between bg-slate-900 text-white px-4 py-3 z-20 shadow-md shrink-0">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-500/20 p-1.5 rounded-md">
            <LayoutGrid className="text-indigo-400" size={20} />
          </div>
          <h1 className="text-base font-bold tracking-wider">
            Jennida<span className="text-indigo-400"> Hotel</span>
          </h1>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 -mr-1 text-slate-300 hover:text-white transition-colors rounded-md hover:bg-slate-800"
          aria-label="ເປີດເມນູ"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Sidebar panel — fixed height = full viewport, scrollable inside Sidebar */}
          <div className="relative z-50 w-72 max-w-[85vw] h-dvh h-screen flex flex-col shadow-2xl animate-in slide-in-from-left duration-200">
            {/* Close button */}
            <button
              className="absolute top-4 right-3 z-10 text-slate-400 hover:text-white bg-slate-800/80 p-1.5 rounded-full transition-colors"
              onClick={() => setIsOpen(false)}
              aria-label="ປິດເມນູ"
            >
              <X size={18} />
            </button>

            {/* Sidebar fills the panel — Sidebar itself handles internal scroll */}
            <div className="h-full w-full overflow-hidden">
              {sidebar}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
