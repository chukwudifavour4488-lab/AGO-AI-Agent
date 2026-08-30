import React from 'react';
import { Home, MessageCircle, ShieldCheck, User } from 'lucide-react';
import { AgoIcon } from './AgoLogo';

export type MainTab = 'home' | 'escrow' | 'chat' | 'profile';

interface NavigationProps {
  currentTab: MainTab;
  onSelectTab: (tab: MainTab) => void;
  unreadCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({ currentTab, onSelectTab, unreadCount = 0 }) => {
  const item = (tab: MainTab, icon: React.ReactNode, label: string, badge = false) => (
    <button
      onClick={() => onSelectTab(tab)}
      className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all ${
        currentTab === tab ? 'text-teal-300 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
      }`}
    >
      <div className="relative">{icon}{badge && unreadCount > 0 && <span className="absolute -top-1 -right-2 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-slate-900">{unreadCount > 9 ? '9+' : unreadCount}</span>}</div>
      <span className="text-[10px] tracking-wide mt-1">{label}</span>
      {currentTab === tab && <div className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-0.5 shadow-sm shadow-teal-400" />}
    </button>
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800/80 px-3 py-2">
      <div className="max-w-md mx-auto flex items-center justify-between gap-1">
        {item('home', <Home className="w-5 h-5" />, 'Home')}
        {item('escrow', <ShieldCheck className="w-5 h-5 text-teal-400" />, 'Escrow')}
        {item('chat', <MessageCircle className="w-5 h-5" />, 'Messages', true)}
        <button onClick={() => onSelectTab('chat')} className="-mt-5 flex flex-col items-center justify-center" aria-label="Open AGO AI">
          <div className="p-2 rounded-2xl bg-slate-800 border border-teal-400/60 shadow-lg shadow-teal-500/20"><AgoIcon size={24} /></div>
          <span className="text-[9px] text-slate-400 mt-1">AGO AI</span>
        </button>
        {item('profile', <User className="w-5 h-5" />, 'Profile')}
      </div>
    </nav>
  );
};
