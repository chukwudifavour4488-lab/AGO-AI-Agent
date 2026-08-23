import React from 'react';
import { Home, ShieldCheck, User } from 'lucide-react';
import { AgoIcon } from './AgoLogo';

export type MainTab = 'home' | 'escrow' | 'chat' | 'profile';

interface NavigationProps {
  currentTab: MainTab;
  onSelectTab: (tab: MainTab) => void;
  unreadCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  unreadCount = 1,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800/80 px-3 py-2">
      <div className="max-w-md mx-auto flex items-center justify-between gap-1">
        {/* Tab 1: Home (Feed & Marketplace) */}
        <button
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
            currentTab === 'home'
              ? 'text-teal-300 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home className="w-5 h-5 mb-1" />
          <span className="text-[10px] tracking-wide">Marketplace</span>
          {currentTab === 'home' && (
            <div className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-0.5 shadow-sm shadow-teal-400" />
          )}
        </button>

        {/* Tab 2: Escrow Order & Dispute Vault */}
        <button
          onClick={() => onSelectTab('escrow')}
          className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
            currentTab === 'escrow'
              ? 'text-teal-300 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <ShieldCheck className="w-5 h-5 mb-1 text-teal-400" />
            <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <span className="text-[10px] tracking-wide">Escrow Room</span>
          {currentTab === 'escrow' && (
            <div className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-0.5 shadow-sm shadow-teal-400" />
          )}
        </button>

        {/* Tab 3: Chat & AGO AI (Super App Center) */}
        <button
          onClick={() => onSelectTab('chat')}
          className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
            currentTab === 'chat'
              ? 'text-white font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div
            className={`p-1.5 rounded-2xl mb-0.5 transition-all flex items-center justify-center ${
              currentTab === 'chat'
                ? 'bg-slate-800 border border-teal-400/80 shadow-lg shadow-teal-500/20 ring-2 ring-teal-400/40'
                : 'bg-slate-800/80 border border-slate-700'
            }`}
          >
            <AgoIcon size={22} />
          </div>
          <span className="text-[10px] tracking-wide flex items-center gap-1 font-semibold">
            Ago AI
          </span>
          {unreadCount > 0 && currentTab !== 'chat' && (
            <span className="absolute top-1 right-2 w-2.5 h-2.5 rounded-full bg-cyan-400 ring-2 ring-slate-900 animate-ping" />
          )}
        </button>

        {/* Tab 4: Profile & Brand Page */}
        <button
          onClick={() => onSelectTab('profile')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
            currentTab === 'profile'
              ? 'text-teal-300 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <User className="w-5 h-5 mb-1" />
          <span className="text-[10px] tracking-wide">Profile</span>
          {currentTab === 'profile' && (
            <div className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-0.5 shadow-sm shadow-teal-400" />
          )}
        </button>
      </div>
    </nav>
  );
};
