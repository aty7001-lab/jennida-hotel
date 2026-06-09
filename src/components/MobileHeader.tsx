"use client";

import { useState, useEffect } from 'react';
import { Menu, X, LayoutGrid } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function MobileHeader({ sidebar }: { sidebar: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar automatically when path changes (i.e. user clicks a link)
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      <div className="md:hidden flex items-center justify-between bg-slate-900 text-white p-4 z-20 shadow-md">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-500/20 p-1.5 rounded-md">
            <LayoutGrid className="text-indigo-400" size={20} />
          </div>
          <h1 className="text-lg font-bold tracking-wider">HOTEL<span className="text-indigo-400">.SYS</span></h1>
        </div>
        <button onClick={() => setIsOpen(true)} className="p-2 -mr-2 text-slate-300 hover:text-white transition-colors">
          <Menu size={24} />
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="relative flex flex-col shadow-2xl z-50 w-64 transform transition-transform duration-300 animate-in slide-in-from-left">
            <button 
              className="absolute top-5 right-4 z-[60] text-slate-400 hover:text-white bg-slate-800 p-1.5 rounded-full shadow-lg transition-colors" 
              onClick={() => setIsOpen(false)}
            >
              <X size={20} />
            </button>
            <div className="h-full w-full overflow-hidden">
              {sidebar}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
