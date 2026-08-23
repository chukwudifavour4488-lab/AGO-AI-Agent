import React from 'react';
import { Sparkles, ShoppingBag, MapPin, Search, ShieldAlert, ShieldCheck } from 'lucide-react';
import { NigerianCity } from '../types';
import { AgoLogo } from './AgoLogo';

interface HeaderProps {
  selectedCity: NigerianCity;
  onSelectCity: (city: NigerianCity) => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenSearch: () => void;
  onOpenAiChat: () => void;
  onOpenEscrow?: () => void;
  onOpenAdminPanel?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedCity,
  onSelectCity,
  cartCount,
  onOpenCart,
  onOpenSearch,
  onOpenAiChat,
  onOpenEscrow,
  onOpenAdminPanel,
}) => {
  const cities: NigerianCity[] = ['All Nigeria', 'Port Harcourt', 'Lagos', 'Abuja', 'Kano'];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          {/* Brand Logo & Slogan */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectCity('All Nigeria')}>
            <AgoLogo size="lg" showSubtitle={false} />
            <span className="hidden sm:inline-flex text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-gradient-to-r from-teal-500/20 to-purple-500/20 text-teal-300 border border-teal-500/30 items-center gap-1">
              <Sparkles className="w-3 h-3 text-teal-400" /> AI SUPER APP
            </span>
          </div>

          {/* Slogan Banner on Mobile */}
          <div className="sm:hidden text-center flex-1 px-1">
            <span className="text-[11px] font-semibold text-teal-300 block truncate">
              Your AI Shopping Agent for Africa 🇳🇬
            </span>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2">
            {/* Quick Escrow Room trigger */}
            {onOpenEscrow && (
              <button
                onClick={onOpenEscrow}
                className="hidden xs:flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-teal-300 text-xs font-bold transition"
                title="Open Escrow Room"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                <span>Escrow</span>
              </button>
            )}

            {/* Quick AI Search trigger */}
            <button
              onClick={onOpenAiChat}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-teal-500/10 to-purple-500/10 hover:from-teal-500/20 hover:to-purple-500/20 border border-teal-500/30 text-teal-300 text-xs font-semibold transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>Ask AGO AI</span>
            </button>

            {/* Currency Pill */}
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-semibold text-emerald-400">
              <span>🇳🇬 ₦ NGN</span>
            </div>

            {/* Admin Console Trigger */}
            {onOpenAdminPanel && (
              <button
                onClick={onOpenAdminPanel}
                className="p-2 rounded-full bg-slate-800/80 hover:bg-rose-950/40 border border-slate-700/60 hover:border-rose-500/40 text-slate-300 hover:text-rose-300 transition"
                title="Admin Console & Moderation"
              >
                <ShieldAlert className="w-4 h-4" />
              </button>
            )}

            {/* Search Button */}
            <button
              onClick={onOpenSearch}
              className="p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-slate-300 hover:text-white transition"
              title="Search marketplace"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-slate-300 hover:text-white transition"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-r from-teal-400 to-purple-500 text-white font-bold text-[10px] flex items-center justify-center shadow-md animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* City Filter Pills */}
        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <div className="flex items-center gap-1 text-slate-400 text-xs shrink-0 pl-1">
            <MapPin className="w-3.5 h-3.5 text-teal-400" />
            <span className="text-[11px] uppercase tracking-wider font-semibold">City:</span>
          </div>
          {cities.map((city) => (
            <button
              key={city}
              onClick={() => onSelectCity(city)}
              className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 transition-all ${
                selectedCity === city
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-slate-950 font-bold shadow-md shadow-teal-500/20'
                  : 'bg-slate-800/70 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/50'
              }`}
            >
              {city === 'All Nigeria' ? '🇳🇬 All Cities' : city}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
