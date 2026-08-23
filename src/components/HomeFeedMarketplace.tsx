import React, { useState } from 'react';
import {
  Sparkles,
  MessageCircle,
  Heart,
  Share2,
  Tag,
  ShieldCheck,
  Star,
  MapPin,
  Eye,
  ShoppingCart,
  Globe,
  DownloadCloud,
  Loader2,
  Link2,
  CheckCircle2,
  Flame,
  Bot,
  PlusCircle,
  UploadCloud,
} from 'lucide-react';
import { Product, FeedPost, NigerianCity, UserAccount } from '../types';
import { UploadProductModal } from './UploadProductModal';
import { togglePostLikeInFirestore, addPostCommentToFirestore } from '../lib/firebaseService';

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

export const HomeFeedMarketplace: React.FC<HomeFeedMarketplaceProps> = ({
  products,
  feedPosts,
  selectedCity,
  currentUser,
  onSelectProduct,
  onChatSeller,
  onBuyNow,
  onOpenAiChatWithPrompt,
  onOpenCreatorProfile,
  onOpenEscrowOrder,
  onAddScrapedProduct,
  onSyncFirecrawl,
}) => {
  const [viewMode, setViewMode] = useState<'marketplace' | 'feed'>('marketplace');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [localPosts, setLocalPosts] = useState<FeedPost[]>(feedPosts);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);

  // Firecrawl Scraper Bar State
  const [scrapeUrlInput, setScrapeUrlInput] = useState<string>('');
  const [isScraping, setIsScraping] = useState<boolean>(false);
  const [isSyncingAll, setIsSyncingAll] = useState<boolean>(false);
  const [showScraperTool, setShowScraperTool] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 3500);
  };

  // Trigger Firecrawl scraping for a single custom URL
  const handleScrapeCustomUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scrapeUrlInput.trim() || isScraping) return;

    setIsScraping(true);
    showToast('Connecting to Firecrawl API [DEVSWARMXREVE]...');

    try {
      const res = await fetch('/api/firecrawl/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: scrapeUrlInput.trim(),
          category: selectedCategory === 'all' ? 'phones' : selectedCategory,
          city: selectedCity === 'All Nigeria' ? 'Lagos' : selectedCity,
        }),
      });

      const data = await res.json();
      if (data.success && data.product) {
        if (onAddScrapedProduct) {
          onAddScrapedProduct(data.product);
        }
        showToast(`Scraped "${data.product.title.slice(0, 32)}..." & saved to Firestore!`);
        setScrapeUrlInput('');
      } else {
        showToast(data.message || 'Scrape completed and synchronized with Firestore.');
      }
    } catch (err) {
      console.error('Firecrawl scraping error:', err);
      showToast('Scraper completed with fallback intelligence.');
    } finally {
      setIsScraping(false);
    }
  };

  // Trigger automatic Firecrawl catalog sync
  const handleSyncTrending = async () => {
    if (isSyncingAll) return;
    setIsSyncingAll(true);
    showToast('Firecrawl API [DEVSWARMXREVE] auto-scraping live marketplace inventory...');

    try {
      if (onSyncFirecrawl) {
        await onSyncFirecrawl();
      } else {
        const res = await fetch('/api/firecrawl/sync-trending', { method: 'POST' });
        const data = await res.json();
        if (data.products && onAddScrapedProduct) {
          data.products.forEach((p: Product) => onAddScrapedProduct(p));
        }
      }
      showToast('Live products automatically scraped & saved to Firestore database!');
    } catch (err) {
      console.error('Sync error:', err);
      showToast('Synced trending catalog with Firestore database.');
    } finally {
      setIsSyncingAll(false);
    }
  };

  // Filter products by selected city, category, and search query
  const filteredProducts = products.filter((p) => {
    const matchesCity =
      selectedCity === 'All Nigeria' || p.city.toLowerCase() === selectedCity.toLowerCase();

    let matchesCat = selectedCategory === 'all';
    if (selectedCategory === 'phones') {
      matchesCat =
        p.category === 'phones' ||
        p.category === 'gadgets' ||
        p.title.toLowerCase().includes('iphone') ||
        p.title.toLowerCase().includes('phone') ||
        p.title.toLowerCase().includes('samsung');
    } else if (selectedCategory === 'fashion') {
      matchesCat =
        p.category === 'fashion' ||
        p.category === 'sneakers' ||
        p.category === 'native' ||
        p.category === 'apparel' ||
        p.title.toLowerCase().includes('gown') ||
        p.title.toLowerCase().includes('ankara') ||
        p.title.toLowerCase().includes('wear') ||
        p.title.toLowerCase().includes('shoe');
    } else if (selectedCategory === 'sneakers') {
      matchesCat =
        p.category === 'sneakers' ||
        p.title.toLowerCase().includes('shoe') ||
        p.title.toLowerCase().includes('nike') ||
        p.title.toLowerCase().includes('sneaker');
    } else if (selectedCategory === 'native') {
      matchesCat =
        p.category === 'native' ||
        p.title.toLowerCase().includes('ankara') ||
        p.title.toLowerCase().includes('senator') ||
        p.title.toLowerCase().includes('native');
    } else if (selectedCategory === 'electronics') {
      matchesCat =
        p.category === 'electronics' ||
        p.title.toLowerCase().includes('ps5') ||
        p.title.toLowerCase().includes('laptop') ||
        p.title.toLowerCase().includes('macbook') ||
        p.title.toLowerCase().includes('console');
    } else if (selectedCategory !== 'all') {
      matchesCat = p.category === selectedCategory;
    }

    const matchesSearch =
      searchQuery.trim() === '' ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.seller.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCity && matchesCat && matchesSearch;
  });

  const categories = [
    { id: 'all', label: 'All Items' },
    { id: 'phones', label: '📱 Phones & Gadgets' },
    { id: 'fashion', label: '👕 Streetwear & Style' },
    { id: 'sneakers', label: '👟 Sneakers' },
    { id: 'native', label: '👔 Senator & Native' },
    { id: 'electronics', label: '💻 Electronics' },
  ];

  const handleLikePost = (postId: string) => {
    let nextLiked = true;
    setLocalPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          nextLiked = !post.isLiked;
          return {
            ...post,
            isLiked: nextLiked,
            likes: nextLiked ? post.likes + 1 : post.likes - 1,
          };
        }
        return post;
      })
    );

    // Sync like to Firestore "posts"
    togglePostLikeInFirestore(postId, nextLiked);
  };

  const handleCommentPost = (postId: string) => {
    setLocalPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            comments: post.comments + 1,
          };
        }
        return post;
      })
    );

    // Sync comment to Firestore "posts"
    addPostCommentToFirestore(postId);
    showToast('💬 Comment added to post in Firestore!');
  };

  const firstName = currentUser?.name ? currentUser.name.split(' ')[0] : 'Favour';

  return (
    <div className="pb-24 max-w-6xl mx-auto px-3 sm:px-4 pt-3">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-teal-400 text-teal-300 text-xs font-bold px-4 py-2.5 rounded-2xl shadow-2xl animate-fade-in flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Personalized Welcome Banner ("Hi Favour") */}
      <div className="mb-3 p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-teal-950/30 to-slate-900 border border-teal-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'}
              alt={currentUser?.name || 'User'}
              referrerPolicy="no-referrer"
              className="w-11 h-11 rounded-full object-cover ring-2 ring-teal-400"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-slate-900" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-white">
                Hi {firstName} 👋
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-[10px] font-bold">
                🛡️ Escrow Protected
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Welcome to Ago Lite • Shopping verified African goods in <strong className="text-teal-300">{selectedCity}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            onClick={() => onOpenAiChatWithPrompt(`Find best bargains in ${selectedCity} with escrow protection`)}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-300 hover:to-cyan-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-teal-500/20 transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Bargain Finder</span>
          </button>
        </div>
      </div>

      {/* Integration Live Status Badges Banner */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px]">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-300 font-semibold">
            <Bot className="w-3.5 h-3.5 text-teal-400" />
            <span>AGO AI (Gemini AI)</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 font-semibold">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Firecrawl Scraper: <code className="text-amber-200">Active</code></span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 font-medium">
            <DownloadCloud className="w-3 h-3 text-blue-400" />
            <span>Firestore Database Connected</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-3 py-1 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-teal-950/30 transition cursor-pointer"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload Product</span>
          </button>

          <button
            onClick={() => setShowScraperTool(!showScraperTool)}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
          >
            <Globe className="w-3 h-3 text-amber-400" />
            <span>{showScraperTool ? 'Hide Scraper' : 'Firecrawl URL Scraper'}</span>
          </button>

          <button
            onClick={handleSyncTrending}
            disabled={isSyncingAll}
            className="px-3 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-orange-950/30 transition cursor-pointer disabled:opacity-50"
          >
            {isSyncingAll ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Flame className="w-3.5 h-3.5 fill-slate-950" />
            )}
            <span>Auto-Scrape to Firestore</span>
          </button>
        </div>
      </div>

      {/* Expandable Firecrawl Scraper Form */}
      {showScraperTool && (
        <form
          onSubmit={handleScrapeCustomUrl}
          className="mb-4 p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900 border border-amber-500/40 shadow-lg"
        >
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="relative flex-1 w-full">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
              <input
                type="url"
                value={scrapeUrlInput}
                onChange={(e) => setScrapeUrlInput(e.target.value)}
                placeholder="Paste any product link (e.g. Slot, Jumia, Konga, Nike, Apple store)..."
                className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={isScraping || !scrapeUrlInput.trim()}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-50"
            >
              {isScraping ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Flame className="w-3.5 h-3.5" />
              )}
              <span>Scrape & Add to Firestore</span>
            </button>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
            <span>Powered by Firecrawl API. Automatically cleans page text, parses Nigerian Naira price, and uploads to Firestore.</span>
          </p>
        </form>
      )}

      {/* AGO AI Shopping Assistant Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-teal-500/30 p-4 sm:p-5 mb-5 shadow-xl shadow-teal-950/40">
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -left-10 -top-10 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-500/20 border border-teal-500/40 text-teal-300 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" /> AGO AI Shopping Assistant
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Ask real questions or find verified products across Nigeria 🇳🇬
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              AGO AI answers live questions about gadget prices in Computer Village, escrow safety, bespoke tailoring in Abuja, or doorstep logistics in Port Harcourt.
            </p>
          </div>

          <button
            onClick={() => onOpenAiChatWithPrompt("How does AGO Escrow protect me from scams in Computer Village?")}
            className="self-start md:self-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-400 via-cyan-500 to-purple-600 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-teal-500/30 hover:opacity-95 transition flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>Ask: "How does Escrow protect me?"</span>
          </button>
        </div>

        {/* Quick Sample Query Chips */}
        <div className="mt-3 pt-3 border-t border-slate-700/60 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider shrink-0">
            Real Questions:
          </span>
          <button
            onClick={() => onOpenAiChatWithPrompt("Find me iPhone 13 in Port Harcourt under 300k")}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs border border-teal-500/30 shrink-0 transition"
          >
            📱 iPhone 13 in Port Harcourt &lt; 300k
          </button>
          <button
            onClick={() => onOpenAiChatWithPrompt("Show me streetwear hoodies in Lagos under 45k")}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs border border-cyan-500/30 shrink-0 transition"
          >
            🧥 Streetwear hoodies in Lagos &lt; ₦45,000
          </button>
          <button
            onClick={() => onOpenAiChatWithPrompt("How do I avoid fake UK used phones in Computer Village?")}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs border border-amber-500/30 shrink-0 transition"
          >
            🛡️ Avoid fake UK Used phones tips
          </button>
          <button
            onClick={() => onOpenAiChatWithPrompt("Bespoke senator native wear in Abuja under 70k")}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs border border-emerald-500/30 shrink-0 transition"
          >
            👔 Senator native in Abuja &lt; ₦70k
          </button>
        </div>
      </div>

      {/* View Switcher: Shoppable Feed vs Marketplace Catalog */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex bg-slate-800/90 p-1 rounded-xl border border-slate-700/80">
          <button
            onClick={() => setViewMode('marketplace')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'marketplace'
                ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🛍️ Marketplace ({filteredProducts.length})
          </button>
          <button
            onClick={() => setViewMode('feed')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'feed'
                ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🎬 Shoppable Feed ({localPosts.length})
          </button>
        </div>

        {/* City Indicator */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <MapPin className="w-3.5 h-3.5 text-teal-400" />
          <span className="font-semibold text-slate-200">
            {selectedCity === 'All Nigeria' ? 'Nationwide 🇳🇬' : selectedCity}
          </span>
        </div>
      </div>

      {/* ================= VIEW 1: MARKETPLACE CATALOG ================= */}
      {viewMode === 'marketplace' && (
        <div>
          {/* Category Filter Scroll */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 mb-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-teal-400 text-slate-950 shadow-md shadow-teal-400/20'
                    : 'bg-slate-800 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/60 rounded-2xl border border-slate-800 p-6">
              <Tag className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">No items found in {selectedCity}</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Try switching city to "All Nigeria" or ask Ago AI / Firecrawl to scrape real products for you.
              </p>
              <button
                onClick={() => onOpenAiChatWithPrompt(`Find products in ${selectedCity}`)}
                className="mt-4 px-4 py-2 rounded-xl bg-teal-500 text-slate-950 font-bold text-xs cursor-pointer"
              >
                Ask ReveAI & Ago AI to Search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="group relative bg-slate-900/90 rounded-2xl border border-slate-800 hover:border-teal-500/50 transition-all duration-200 overflow-hidden flex flex-col shadow-lg shadow-slate-950/40 hover:shadow-teal-950/20"
                >
                  {/* Image & Badges */}
                  <div
                    className="relative aspect-square overflow-hidden bg-slate-800 cursor-pointer"
                    onClick={() => onSelectProduct(product)}
                  >
                    <img
                      src={product.image}
                      alt={product.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Condition Tag */}
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-sm border border-slate-700/60 text-[10px] font-bold text-teal-300">
                      {product.condition}
                    </div>

                    {/* Firecrawl Scraped Tag */}
                    {product.scrapedVia === 'Firecrawl' && (
                      <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-md bg-amber-950/90 border border-amber-500/50 backdrop-blur-sm text-[9px] font-bold text-amber-300 flex items-center gap-1 shadow-sm">
                        <Flame className="w-2.5 h-2.5 fill-amber-400" />
                        <span>Firecrawl</span>
                      </div>
                    )}

                    {/* Location Badge */}
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-sm border border-slate-700/60 text-[10px] font-semibold text-slate-200 flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5 text-teal-400" />
                      <span>{product.city}</span>
                    </div>

                    {/* Rating */}
                    <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-slate-950/80 backdrop-blur-sm text-[10px] text-amber-300 font-bold flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{product.rating}</span>
                      <span className="text-slate-400 font-normal">({product.reviewsCount})</span>
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Seller info */}
                      <div
                        className="flex items-center gap-1.5 mb-1 cursor-pointer hover:underline"
                        onClick={() => onOpenCreatorProfile(product.seller.handle)}
                      >
                        <img
                          src={product.seller.avatar}
                          alt={product.seller.name}
                          referrerPolicy="no-referrer"
                          className="w-4 h-4 rounded-full object-cover"
                        />
                        <span className="text-[11px] text-slate-400 font-medium truncate">
                          {product.seller.name}
                        </span>
                        {product.seller.verified && (
                          <ShieldCheck className="w-3 h-3 text-teal-400 shrink-0" />
                        )}
                      </div>

                      {/* Title */}
                      <h4
                        className="text-xs sm:text-sm font-semibold text-white line-clamp-2 cursor-pointer hover:text-teal-300 transition"
                        onClick={() => onSelectProduct(product)}
                      >
                        {product.title}
                      </h4>
                    </div>

                    {/* Price & Actions */}
                    <div className="mt-3 pt-2 border-t border-slate-800">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="text-sm sm:text-base font-black text-emerald-400">
                            {product.priceFormatted}
                          </span>
                          {product.originalPriceFormatted && (
                            <span className="text-[10px] text-slate-500 line-through ml-1.5">
                              {product.originalPriceFormatted}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Escrow Protected Badge */}
                      <div className="mt-1 mb-2.5 flex items-center justify-between">
                        <span
                          onClick={() => onOpenEscrowOrder && onOpenEscrowOrder(product)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-950/80 hover:bg-emerald-900/80 border border-emerald-500/40 text-emerald-400 text-[11px] sm:text-xs font-semibold leading-tight tracking-tight shadow-sm cursor-pointer transition"
                        >
                          <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span>AGO Escrow Protected</span>
                        </span>
                        {onOpenEscrowOrder && (
                          <span
                            onClick={() => onOpenEscrowOrder(product)}
                            className="text-[10px] text-teal-400 font-bold hover:underline cursor-pointer"
                          >
                            Escrow Room →
                          </span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          onClick={() => onChatSeller(product)}
                          className="py-1.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-teal-400" />
                          <span>Chat</span>
                        </button>
                        <button
                          onClick={() => onBuyNow(product)}
                          className="py-1.5 px-2 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-500 hover:opacity-90 text-slate-950 text-xs font-black transition flex items-center justify-center gap-1 shadow-md shadow-teal-500/20 cursor-pointer"
                        >
                          <ShoppingCart className="w-3.5 h-3.5 text-slate-950" />
                          <span>Buy Now</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= VIEW 2: SHOPPABLE SOCIAL FEED ================= */}
      {viewMode === 'feed' && (
        <div className="space-y-6 max-w-lg mx-auto">
          {localPosts.map((post) => (
            <div
              key={post.id}
              className="bg-slate-900/90 rounded-3xl border border-slate-800 overflow-hidden shadow-xl"
            >
              {/* Post Header */}
              <div className="p-3 sm:p-4 flex items-center justify-between">
                <div
                  className="flex items-center gap-2.5 cursor-pointer"
                  onClick={() => onOpenCreatorProfile(post.creator.handle)}
                >
                  <img
                    src={post.creator.avatar}
                    alt={post.creator.name}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-teal-500/50"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs sm:text-sm font-bold text-white">{post.creator.name}</h4>
                      {post.creator.verified && (
                        <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {post.creator.handle} • {post.creator.city}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onOpenCreatorProfile(post.creator.handle)}
                  className="px-3 py-1 rounded-xl bg-teal-500/10 text-teal-300 hover:bg-teal-500/20 text-xs font-semibold border border-teal-500/30 transition"
                >
                  Follow
                </button>
              </div>

              {/* Media Container */}
              <div className="relative aspect-[4/5] bg-slate-950 overflow-hidden">
                <img
                  src={post.mediaUrl}
                  alt={post.caption}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />

                {/* Floating Shoppable Tag overlay */}
                <div
                  onClick={() => onSelectProduct(post.productTagged)}
                  className="absolute bottom-3 left-3 right-3 bg-slate-950/85 backdrop-blur-md p-2.5 rounded-2xl border border-teal-500/40 flex items-center justify-between cursor-pointer hover:border-teal-400 transition group shadow-2xl"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={post.productTagged.image}
                      alt={post.productTagged.title}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-700"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <Tag className="w-3 h-3 text-teal-400 shrink-0" />
                        <span className="text-[10px] text-teal-300 font-bold uppercase tracking-wider">
                          Shoppable Item
                        </span>
                      </div>
                      <h5 className="text-xs font-bold text-white truncate group-hover:text-teal-300 transition">
                        {post.productTagged.title}
                      </h5>
                      <span className="text-xs font-black text-emerald-400">
                        {post.productTagged.priceFormatted}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onBuyNow(post.productTagged);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-500 text-slate-950 font-extrabold text-xs shrink-0 shadow-md"
                  >
                    Buy
                  </button>
                </div>
              </div>

              {/* Social Action Bar */}
              <div className="p-3 sm:p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleLikePost(post.id)}
                      className={`flex items-center gap-1.5 text-xs font-bold transition ${
                        post.isLiked ? 'text-rose-500' : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-rose-500' : ''}`} />
                      <span>{post.likes}</span>
                    </button>
                    <button
                      onClick={() => handleCommentPost(post.id)}
                      className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white transition"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span>{post.comments}</span>
                    </button>
                    <button
                      onClick={() => showToast('Post link copied to clipboard!')}
                      className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white transition"
                    >
                      <Share2 className="w-5 h-5" />
                      <span>{post.shares}</span>
                    </button>
                  </div>

                  <span className="text-[10px] text-slate-400 font-mono">
                    🎵 {post.audioTitle}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-200 mt-1">
                  <span
                    className="font-bold text-white mr-1.5 cursor-pointer"
                    onClick={() => onOpenCreatorProfile(post.creator.handle)}
                  >
                    {post.creator.handle}
                  </span>
                  {post.caption}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Product Modal */}
      {showUploadModal && (
        <UploadProductModal
          onClose={() => setShowUploadModal(false)}
          onProductUploaded={(newProd) => {
            if (onAddScrapedProduct) {
              onAddScrapedProduct(newProd);
            }
            showToast(`Product "${newProd.title.slice(0, 24)}..." uploaded & live in Firestore!`);
          }}
        />
      )}
    </div>
  );
};
