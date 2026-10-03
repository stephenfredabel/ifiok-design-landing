'use client';

import { Ellipsis, Globe, Search, ShoppingCart, Sparkles } from 'lucide-react';

const categoryPills = [
  'Business Cards',
  'Flyers',
  'Flex Banners',
  'SAV Stickers',
  'Labels',
  'ID Cards',
  'Letterheads',
  'Posters',
  'T-Shirts',
  'Receipt Books',
  'Roll-Up Banners',
  'Wedding',
];

export default function Header() {
  return (
    <div className="min-h-screen bg-[#021a1d] text-white">
      <header className="w-full border-b border-white/10 bg-[#021a1d] px-3 py-3 sm:px-5 lg:px-6">
        <div className="mx-auto flex max-w-[1700px] items-center gap-3">
          <div className="flex items-center gap-3 pr-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0a2c31] shadow-inner shadow-[#0d3439]">
              <div className="relative flex h-7 w-7 items-center justify-center">
                <div className="absolute h-5 w-5 rounded-md bg-[#f7d847]" />
                <div className="absolute h-4 w-4 rounded-md border-[3px] border-[#0d2d2f] bg-transparent" />
              </div>
            </div>
            <div className="text-[2rem] font-black leading-none tracking-[-0.08em] text-white">ifiok</div>
          </div>

          <div className="flex flex-1 items-center gap-3 justify-center">
            <div className="flex w-full max-w-[1000px] items-center gap-3 rounded-full border border-white/10 bg-[#0b2a2d]/90 px-4 py-3 shadow-inner shadow-black/20">
              <Search className="h-5 w-5 text-white/80" />
              <input
                value="Search print products..."
                readOnly
                className="w-full bg-transparent text-base text-white/80 outline-none placeholder:text-white/60"
              />
            </div>
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <button className="rounded-full bg-[#1cc9c8] px-6 py-3 text-base font-semibold text-[#031a1d] shadow-[0_6px_18px_rgba(28,201,200,0.35)]">
              Search
            </button>
            <button className="flex items-center gap-2 rounded-full border border-white/10 bg-[#0b2a2d] px-4 py-3 text-sm text-white/90">
              <Globe className="h-4 w-4" />
              English
            </button>
            <button className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-[#0b2a2d] text-white">
              <Ellipsis className="h-4 w-4" />
            </button>
            <button className="flex items-center gap-2 rounded-full border border-white/10 bg-[#0b2a2d] px-4 py-3 text-sm text-white">
              <div className="flex h-5 w-5 items-center justify-center rounded-full border border-white/40">
                <Sparkles className="h-3 w-3" />
              </div>
              Sign In
            </button>
            <button className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-[#0b2a2d] text-white">
              <ShoppingCart className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <button className="rounded-full bg-[#1cc9c8] px-4 py-2 text-sm font-semibold text-[#031a1d]">Search</button>
            <button className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[#0b2a2d] text-white">
              <ShoppingCart className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1700px] px-3 pb-6 pt-4 sm:px-5 lg:px-6">
        <div className="flex flex-wrap items-center gap-3 pb-3 pl-1 pt-1">
          {categoryPills.map((item) => (
            <button
              key={item}
              className="rounded-full border border-white/10 bg-[#0b2a2d]/70 px-4 py-2 text-sm text-white/85 backdrop-blur-sm shadow-inner shadow-black/10 transition hover:border-white/20 hover:bg-[#102f33]"
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
