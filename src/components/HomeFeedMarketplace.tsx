import React from 'react';
import { Bot, Bell, ChevronRight, Heart, MapPin, Search, ShieldCheck, Sparkles, Store, Star, Navigation, Mic } from 'lucide-react';
import { Product, FeedPost, NigerianCity, UserAccount } from '../types';

interface HomeFeedMarketplaceProps {
  products: Product[];
  feedPosts: FeedPost[];
  selectedCity: NigerianCity;
  currentUser?: UserAccount | null;
  onSelectProduct: (product: Product) => void;
  onChatSeller: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  onOpenAiChatWithPrompt: (prompt: string) => void;
  onOpenCreatorProfile: (creatorHandle: string) => void;
  onOpenEscrowOrder?: (product: Product) => void;
  onAddScrapedProduct?: (product: Product) => void;
  onSyncFirecrawl?: () => Promise<void>;
}

export const HomeFeedMarketplace: React.FC<HomeFeedMarketplaceProps> = ({ products, selectedCity, currentUser, onSelectProduct, onOpenAiChatWithPrompt }) => {
  const firstName = currentUser?.name?.split(' ')[0] || 'there';
  const nearby = products.filter(p => selectedCity === 'All Nigeria' || p.city.toLowerCase() === selectedCity.toLowerCase()).slice(0, 6);
  const stores = Array.from(new Map(products.map(p => [p.seller.id, p.seller])).values()).slice(0, 4);

  return <div className="min-h-screen bg-[#07070b] text-white pb-28">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-5">
      <header className="flex items-center justify-between mb-6">
        <div><div className="flex items-center gap-2"><h1 className="text-3xl font-black">AGO</h1><span className="px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-400/20 text-violet-300 text-[10px] font-bold">SMART MARKET</span></div><p className="mt-1 text-sm text-slate-400">Good evening, {firstName}. Shop smarter.</p></div>
        <button className="relative w-11 h-11 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center"><Bell className="w-5 h-5" /><span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-violet-500 ring-2 ring-[#07070b]" /></button>
      </header>

      <section className="relative overflow-hidden rounded-3xl p-5 sm:p-7 bg-gradient-to-br from-violet-950/80 via-[#17102b] to-[#0b0b13] border border-violet-400/20 mb-6">
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5"><div className="max-w-xl"><div className="inline-flex items-center gap-2 text-violet-300 text-xs font-bold mb-3"><ShieldCheck className="w-4 h-4" /> AGO SHIELD <span className="text-emerald-400">● ACTIVE</span></div><h2 className="text-2xl sm:text-3xl font-black leading-tight">Your smarter way to buy online.</h2><p className="mt-2 text-sm text-slate-300 leading-6">AGO helps you discover products, understand sellers, compare options and make safer shopping decisions.</p><button onClick={() => onOpenAiChatWithPrompt('Help me find the best and safest deal for what I want to buy.')} className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-white text-slate-950 px-5 py-3 font-extrabold text-sm"><Sparkles className="w-4 h-4" /> Talk to AGO AI <ChevronRight className="w-4 h-4" /></button></div><div className="hidden sm:flex w-28 h-28 rounded-full bg-violet-500/10 border border-violet-400/20 items-center justify-center"><Bot className="w-14 h-14 text-violet-300" /></div></div>
      </section>

      <button onClick={() => onOpenAiChatWithPrompt('I want to shop. Help me choose what to buy and find good options.')} className="w-full mb-7 rounded-2xl bg-white/[0.055] border border-white/10 px-4 py-4 flex items-center gap-3 text-left"><Search className="w-5 h-5 text-slate-400" /><span className="text-sm text-slate-400 flex-1">What are you looking for today?</span><Mic className="w-4 h-4 text-violet-300" /></button>

      <section className="mb-7"><div className="flex items-end justify-between mb-3"><div><p className="text-xs text-violet-300 font-bold uppercase tracking-widest">For you</p><h3 className="text-xl font-black mt-1">Nearby Deals</h3></div><button className="text-sm text-violet-300 font-semibold">See all</button></div><div className="flex gap-3 overflow-x-auto pb-2">{nearby.map(p => <button key={p.id} onClick={() => onSelectProduct(p)} className="min-w-[190px] text-left rounded-2xl overflow-hidden bg-white/[0.045] border border-white/10"><div className="relative h-40 bg-slate-900"><img src={p.image} alt={p.title} className="w-full h-full object-cover" /><span className="absolute top-2 left-2 px-2 py-1 rounded-lg bg-black/70 text-[10px] font-bold text-emerald-300"><ShieldCheck className="inline w-3 h-3 mr-1" /> AGO checked</span><Heart className="absolute top-2 right-2 w-5 h-5" /></div><div className="p-3"><h4 className="font-bold text-sm truncate">{p.title}</h4><p className="text-violet-300 font-black mt-1">{p.priceFormatted}</p><div className="flex items-center gap-1 mt-2 text-[11px] text-slate-400"><MapPin className="w-3 h-3" /> {p.city}</div></div></button>)}</div></section>

      <section className="mb-7"><div className="flex items-end justify-between mb-3"><div><p className="text-xs text-emerald-300 font-bold uppercase tracking-widest">Local commerce</p><h3 className="text-xl font-black mt-1">Stores Near You</h3></div><button className="text-sm text-violet-300 font-semibold">Explore</button></div><div className="grid grid-cols-2 sm:grid-cols-4 gap-3">{stores.map(s => <button key={s.id} className="text-left rounded-2xl p-4 bg-white/[0.045] border border-white/10"><div className="w-11 h-11 rounded-2xl bg-violet-500/15 flex items-center justify-center mb-3"><Store className="w-5 h-5 text-violet-300" /></div><p className="font-bold text-sm truncate">{s.name}</p><div className="flex items-center gap-1 mt-1 text-[11px] text-emerald-300"><ShieldCheck className="w-3 h-3" /> Verified</div><div className="flex items-center gap-1 mt-2 text-[11px] text-slate-400"><Star className="w-3 h-3 text-amber-300" /> Trusted seller</div></button>)}</div></section>

      <section className="grid sm:grid-cols-2 gap-3"><button onClick={() => onOpenAiChatWithPrompt('Help me find trusted local stores and good deals near me.')} className="text-left rounded-2xl p-5 bg-[#101018] border border-white/10"><div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-3"><Navigation className="w-5 h-5 text-blue-300" /></div><h4 className="font-black">Nearby Deals</h4><p className="text-xs text-slate-400 mt-1">Discover products and trusted businesses around you.</p></button><button onClick={() => onOpenAiChatWithPrompt('I run a business. Help me create a professional product listing and marketing campaign.')} className="text-left rounded-2xl p-5 bg-[#101018] border border-white/10"><div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-3"><Store className="w-5 h-5 text-emerald-300" /></div><h4 className="font-black">Grow Your Business</h4><p className="text-xs text-slate-400 mt-1">Use AGO AI to create listings and marketing ideas.</p></button></section>
    </div>
  </div>;
};
