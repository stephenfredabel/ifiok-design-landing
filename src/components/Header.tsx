'use client';

import { Menu, X } from 'lucide-react';
import { useState } from 'react';

const navItems = ['Templates', 'Features', 'Pricing', 'Enterprise'];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
      <div className="container-shell flex items-center justify-between py-4">
        <a href="#top" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#008080] to-[#0f172a] text-sm font-bold text-white shadow-sm">
            ID
          </div>
          <div>
            <p className="text-lg font-bold tracking-tight text-slate-900">Ifiok Design</p>
          </div>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <a key={item} href="#" className="text-sm font-medium text-slate-600 hover:text-[#008080]">
              {item}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <button className="ghost-btn">Log in</button>
          <button className="primary-btn">Start free</button>
        </div>

        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <div className="container-shell flex flex-col gap-4 py-4">
            {navItems.map((item) => (
              <a key={item} href="#" className="text-sm font-medium text-slate-700">
                {item}
              </a>
            ))}
            <div className="mt-2 flex flex-col gap-3">
              <button className="secondary-btn w-full">Log in</button>
              <button className="primary-btn w-full">Start free</button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
