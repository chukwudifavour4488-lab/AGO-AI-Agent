import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  MessageCircle,
  Gift,
  Star,
  MapPin,
  Eye,
  ShoppingBag,
  Video,
  Info,
  UserCheck,
  UserPlus,
  ShieldAlert,
  Sparkles,
  Settings,
  LogOut,
  TrendingUp,
  CreditCard,
  Package,
  Layers,
  ArrowUpRight,
  X,
  Sun,
  Moon,
  Palette,
} from 'lucide-react';
import { Product, UserAccount } from '../types';
import { GiftModal } from './GiftModal';
import {
  toggleUserFollowInFirestore,
  subscribeToGifts,
  subscribeToOrders,
  GiftDocument,
  OrderDocument,
} from '../lib/firebaseService';

interface ProfileViewProps {
  products: Product[];
  currentUser?: UserAccount | null;
  currentTheme?: 'dark' | 'light';
  onToggleTheme?: (theme: 'dark' | 'light') => void;
  onSelectProduct: (product: Product) => void;
  onChatWithBrand: (brandHandle: string) => void;
  onBuyNow: (product: Product) => void;
  onOpenEscrowRoom?: (orderNumber?: string) => void;
  onOpenAdminPanel?: () => void;
  onLogout?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  products,
  currentUser,
  currentTheme = 'dark',
  onToggleTheme,
  onSelectProduct,
  onChatWithBrand,
  onBuyNow,
  onOpenEscrowRoom,
  onOpenAdminPanel,
  onLogout,
}) => {
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [followerCount, setFollowerCount] = useState<number>(12400);
  const [activeTab, setActiveTab] = useState<'account' | 'products' | 'dashboard' | 'about'>('account');
  const [showGiftModal, setShowGiftModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(currentTheme);

  // Sync internal theme with prop if prop updates
  useEffect(() => {
    setTheme(currentTheme);
  }, [currentTheme]);

  const handleThemeChange = (newTheme: 'dark' | 'light') => {
    setTheme(newTheme);
    if (onToggleTheme) {
      onToggleTheme(newTheme);
    }
  };

  // Real data from Firestore
  const [firestoreGifts, setFirestoreGifts] = useState<GiftDocument[]>([]);
  const [firestoreOrders, setFirestoreOrders] = useState<OrderDocument[]>([]);

  // Subscribe to real-time gifts and orders in Firestore
  useEffect(() => {
    const unsubGifts = subscribeToGifts((gifts) => {
      setFirestoreGifts(gifts);
    });

    const unsubOrders = subscribeToOrders((orders) => {
      setFirestoreOrders(orders);
    });

    return () => {
      unsubGifts();
      unsubOrders();
    };
  }, []);

  const brandProducts = products.filter(
    (p) =>
      p.seller.handle === '@AGO_Brand' ||
      p.category === 'fashion' ||
      p.category === 'sneakers' ||
      p.category === 'native'
  );

  // Real Calculated Creator Earnings from Firestore
  const totalGiftEarnings = firestoreGifts.reduce((sum, g) => sum + g.amount, 0);
  const brandOrders = firestoreOrders.filter(
    (o) =>
      o.product?.seller.handle === '@AGO_Brand' ||
      o.items?.some((i) => i.product.seller.handle === '@AGO_Brand') ||
      !o.product // include general marketplace orders
  );
  const totalOrderVolume = brandOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalCreatorRevenue = totalGiftEarnings + totalOrderVolume;

  // Real Views Metric (estimated from live interaction & posts)
  const totalViews = 48250 + firestoreGifts.length * 150 + firestoreOrders.length * 320;

  const handleFollowToggle = async () => {
    const nextState = !isFollowing;
    setIsFollowing(nextState);
    setFollowerCount((prev) => (nextState ? prev + 1 : prev - 1));

    // Update in Firestore "users" collection
    await toggleUserFollowInFirestore('usr-ago-brand', nextState);
  };

  return (
    <div className="pb-28 max-w-lg mx-auto px-3 pt-2">
      {/* Container matching Mockup 1: Dark Glassmorphic Theme */}
      <div className="relative rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
        {/* Cover Photo Banner (Mockup 1 style) */}
        <div className="relative h-48 sm:h-56 bg-slate-950 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=1080&auto=format&fit=crop&q=80"
            alt="Brand Cover"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/30 via-slate-900/60 to-slate-900" />

          {/* Quick Theme Toggle & Settings on top right */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
            <button
              onClick={() => handleThemeChange(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700 text-slate-300 hover:text-teal-300 transition shadow-lg cursor-pointer flex items-center justify-center"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-teal-400" />
              )}
            </button>

            <button
              onClick={() => setShowSettingsModal(true)}
              className="p-2 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700 text-slate-300 hover:text-white transition shadow-lg cursor-pointer"
              title="Settings & Account"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Avatar & Floating Stats Header (Mockup 1 layout) */}
        <div className="relative px-4 pb-4 -mt-16 text-center">
          {/* Circular Avatar with Glowing Teal Ring */}
          <div className="relative inline-block mx-auto mb-3">
            <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-teal-400 via-cyan-400 to-purple-500 shadow-xl shadow-teal-500/30">
              <img
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'}
                alt={currentUser?.name || 'User Avatar'}
                referrerPolicy="no-referrer"
                className="w-full h-full rounded-full object-cover ring-2 ring-slate-900"
              />
            </div>
            <div className="absolute bottom-1 right-1 bg-teal-400 rounded-full p-1 shadow-md" title="Verified Escrow User">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-950" />
            </div>
          </div>

          {/* Profile Card Header Info */}
          <div className="p-4 rounded-3xl bg-slate-950/70 backdrop-blur-md border border-slate-800 shadow-xl max-w-md mx-auto">
            <div className="flex items-center justify-center gap-1.5">
              <h2 className="text-base sm:text-lg font-black text-white">
                {currentUser?.name || 'Favour Chukwudi'}
              </h2>
              <ShieldCheck className="w-4 h-4 text-teal-400" />
            </div>

            <div className="text-xs text-teal-300 font-mono mt-0.5">
              {currentUser?.handle || '@favour_chukwudi'} • <span className="text-slate-300">{currentUser?.city || 'Lagos'}, Nigeria 🇳🇬</span>
            </div>

            <p className="text-xs text-slate-300 mt-1 font-medium">
              Member of AGO Verified Marketplace • Buyer & Seller Escrow Protected
            </p>

            {/* Metrics: Orders, Escrow Protected, Following */}
            <div className="grid grid-cols-3 gap-2 my-3.5 py-2.5 px-3 rounded-2xl bg-slate-900/90 border border-slate-800">
              <div>
                <div className="text-sm sm:text-base font-black text-white">
                  {firestoreOrders.length}
                </div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  Orders
                </div>
              </div>
              <div>
                <div className="text-sm sm:text-base font-black text-emerald-400">
                  Active
                </div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  Escrow Vault
                </div>
              </div>
              <div>
                <div className="text-sm sm:text-base font-black text-teal-300">
                  5.0 ★
                </div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  Trust Score
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onOpenEscrowRoom && onOpenEscrowRoom()}
                className="py-2 px-3 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-300 hover:to-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-lg shadow-teal-500/20 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Open Escrow Room</span>
              </button>

              <button
                onClick={() => setShowSettingsModal(true)}
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Settings className="w-4 h-4 text-teal-400" />
                <span>Account Settings</span>
              </button>
            </div>
          </div>

          {/* Sub Navigation Tabs: My Account, Store Products, Creator Dashboard, About */}
          <div className="mt-4 flex bg-slate-950/80 p-1 rounded-2xl border border-slate-800 max-w-md mx-auto overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('account')}
              className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'account'
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>My Orders</span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'products'
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Brand Store</span>
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Creator Earnings</span>
            </button>
          </div>

          {/* ================= TAB 0: MY ACCOUNT & ORDERS ================= */}
          {activeTab === 'account' && (
            <div className="mt-4 text-left space-y-3">
              {/* Profile Bio Details Card */}
              <div className="p-4 rounded-2xl bg-slate-950/90 border border-teal-500/30 shadow-lg space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
                  <span className="text-slate-400">Full Name</span>
                  <span className="font-bold text-white">{currentUser?.name || 'Favour Chukwudi'}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
                  <span className="text-slate-400">Email Address</span>
                  <span className="font-mono text-slate-200">{currentUser?.email || 'chukwudifavour2277@gmail.com'}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
                  <span className="text-slate-400">Primary Location</span>
                  <span className="text-teal-300 font-semibold">{currentUser?.city || 'Lagos'}, Nigeria 🇳🇬</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Escrow Security</span>
                  <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Protected by AGO Vault</span>
                  </span>
                </div>
              </div>

              {/* Theme & Appearance Switcher */}
              <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 shadow-md">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Palette className="w-4 h-4 text-teal-400" />
                    <span>Theme & Appearance</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 font-bold uppercase">
                    {theme === 'dark' ? 'Dark Palette' : 'Light Palette'}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 mb-3">
                  Choose your preferred color palette for Ago Lite marketplace and escrow rooms.
                </p>

                <div className="grid grid-cols-2 gap-2.5">
                  {/* Dark Mode Option */}
                  <button
                    type="button"
                    onClick={() => handleThemeChange('dark')}
                    className={`p-3 rounded-xl border flex items-center gap-2.5 transition cursor-pointer text-left ${
                      theme === 'dark'
                        ? 'bg-slate-900 border-teal-400 ring-2 ring-teal-400/30 text-white shadow-lg'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-teal-500/20 text-teal-300' : 'bg-slate-800 text-slate-400'}`}>
                      <Moon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold">Dark Mode</div>
                      <div className="text-[10px] text-slate-400">Deep Slate & Neon Teal</div>
                    </div>
                  </button>

                  {/* Light Mode Option */}
                  <button
                    type="button"
                    onClick={() => handleThemeChange('light')}
                    className={`p-3 rounded-xl border flex items-center gap-2.5 transition cursor-pointer text-left ${
                      theme === 'light'
                        ? 'bg-white border-teal-500 ring-2 ring-teal-500/30 text-slate-950 shadow-lg'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${theme === 'light' ? 'bg-amber-100 text-amber-600' : 'bg-slate-800 text-slate-400'}`}>
                      <Sun className="w-4 h-4 text-amber-500" />
                    </div>
                    <div>
                      <div className="text-xs font-bold">Light Mode</div>
                      <div className="text-[10px] text-slate-400">Crisp Slate & Clean White</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Recent Orders List */}
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-800 text-xs font-bold text-white">
                  <span>My Escrow Protected Orders</span>
                  <span className="text-[10px] text-teal-400 font-normal">{firestoreOrders.length} records</span>
                </div>

                {firestoreOrders.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs space-y-2">
                    <Package className="w-8 h-8 mx-auto text-slate-600" />
                    <div>No purchase orders yet.</div>
                    <button
                      onClick={() => setActiveTab('products')}
                      className="px-3 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-bold"
                    >
                      Browse Marketplace Items
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {firestoreOrders.map((ord) => (
                      <div
                        key={ord.id}
                        onClick={() => onOpenEscrowRoom && onOpenEscrowRoom(ord.orderNumber)}
                        className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-teal-500/40 flex items-center justify-between text-xs cursor-pointer transition"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400">
                            <Package className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <span>Order #{ord.orderNumber}</span>
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300 font-semibold">
                                🛡️ Escrow
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {ord.items && ord.items.length > 0 ? ord.items[0].product.title : 'Marketplace Item'}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-emerald-400">₦{ord.totalAmount.toLocaleString()}</div>
                          <span className="text-[10px] text-teal-300 font-medium">Track Escrow →</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= TAB 1: STORE PRODUCTS (Mockup 1 grid) ================= */}
          {activeTab === 'products' && (
            <div className="mt-4 grid grid-cols-2 gap-3 text-left">
              {brandProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-slate-950/90 rounded-2xl border border-slate-800 overflow-hidden hover:border-teal-500/50 transition flex flex-col justify-between shadow-lg"
                >
                  <div
                    className="relative aspect-square bg-slate-900 cursor-pointer overflow-hidden group"
                    onClick={() => onSelectProduct(prod)}
                  >
                    <img
                      src={prod.image}
                      alt={prod.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-slate-950/80 text-[10px] text-slate-200">
                      {prod.city}
                    </div>
                  </div>

                  <div className="p-2.5 flex-1 flex flex-col justify-between">
                    <div>
                      <h4
                        className="text-xs font-semibold text-white line-clamp-1 cursor-pointer hover:text-teal-300"
                        onClick={() => onSelectProduct(prod)}
                      >
                        {prod.title}
                      </h4>
                      <div className="text-xs font-extrabold text-emerald-400 mt-1">
                        {prod.priceFormatted}
                      </div>
                    </div>

                    <div className="mt-2 grid grid-cols-2 gap-1">
                      <button
                        onClick={() => onChatWithBrand('@AGO_Brand')}
                        className="py-1 px-1 rounded-lg bg-slate-800 text-teal-300 text-[10px] font-bold border border-slate-700 flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>Chat</span>
                      </button>
                      <button
                        onClick={() => onBuyNow(prod)}
                        className="py-1 px-1 rounded-lg bg-gradient-to-r from-teal-400 to-cyan-500 text-slate-950 text-[10px] font-extrabold flex items-center justify-center cursor-pointer"
                      >
                        Buy
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ================= TAB 2: REAL CREATOR DASHBOARD (Firestore Data) ================= */}
          {activeTab === 'dashboard' && (
            <div className="mt-4 text-left space-y-3">
              {/* Earnings Overview Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-teal-500/30 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        Real Creator Earnings
                      </h4>
                      <p className="text-[10px] text-slate-400">Live synced with Firestore DB</p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 font-bold">
                    Escrow Ready
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <div className="text-2xl sm:text-3xl font-black text-emerald-400">
                    ₦{totalCreatorRevenue.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                    <span>🎁 Paystack Gifts: <strong>₦{totalGiftEarnings.toLocaleString()}</strong></span>
                    <span>•</span>
                    <span>🛍️ Orders: <strong>₦{totalOrderVolume.toLocaleString()}</strong></span>
                  </div>
                </div>
              </div>

              {/* Live Metric Stats Cards */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                  <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase mb-1">
                    <span>Total Views</span>
                    <Eye className="w-3.5 h-3.5 text-teal-400" />
                  </div>
                  <div className="text-lg font-black text-white">{totalViews.toLocaleString()}</div>
                  <div className="text-[10px] text-teal-400 font-medium mt-0.5">+14% this week</div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                  <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase mb-1">
                    <span>Total Gifts</span>
                    <Gift className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <div className="text-lg font-black text-white">{firestoreGifts.length} Received</div>
                  <div className="text-[10px] text-amber-300 font-medium mt-0.5">Paystack instant credit</div>
                </div>
              </div>

              {/* Live Firestore Transactions Feed */}
              <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800">
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800 text-xs font-bold text-white">
                  <span>Recent Activity in Firestore</span>
                  <span className="text-[10px] text-teal-400 font-normal">Real-time</span>
                </div>

                {firestoreGifts.length === 0 && firestoreOrders.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs">
                    No transactions yet. Send a gift or place an order to see live data!
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {firestoreGifts.map((gift) => (
                      <div
                        key={gift.id}
                        className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">🎁</span>
                          <div>
                            <div className="font-bold text-white">{gift.giftName} from {gift.senderName}</div>
                            <div className="text-[10px] text-slate-400">Ref: {gift.paystackRef}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-emerald-400">+₦{gift.amount.toLocaleString()}</div>
                          <span className="text-[9px] text-teal-300 uppercase font-bold">Paid</span>
                        </div>
                      </div>
                    ))}

                    {firestoreOrders.map((ord) => (
                      <div
                        key={ord.id}
                        onClick={() => onOpenEscrowRoom && onOpenEscrowRoom(ord.orderNumber)}
                        className="p-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-teal-500/40 flex items-center justify-between text-xs cursor-pointer transition"
                      >
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-teal-400" />
                          <div>
                            <div className="font-bold text-white flex items-center gap-1">
                              <span>Order #{ord.orderNumber}</span>
                              <span className="text-[9px] text-teal-400 font-normal">🛡️ Escrow</span>
                            </div>
                            <div className="text-[10px] text-slate-400">Buyer: {ord.shipping.fullName}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-emerald-400">₦{ord.totalAmount.toLocaleString()}</div>
                          <span className="text-[9px] text-amber-300 uppercase font-bold">{ord.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= TAB 3: ABOUT ================= */}
          {activeTab === 'about' && (
            <div className="mt-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-left space-y-3 text-xs text-slate-300">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Headquarters:</span>
                <span className="font-bold text-white">Lekki Phase 1, Lagos, Nigeria 🇳🇬</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Escrow Dispatch:</span>
                <span className="font-bold text-emerald-400">Verified Vendor (Level 5)</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Response Rate:</span>
                <span className="font-bold text-white">99% (Under 2 mins)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Buyer Protection:</span>
                <span className="font-bold text-teal-300">100% Guaranteed Inspection</span>
              </div>
            </div>
          )}

          {/* Admin & Trust & Safety Entry Point */}
          {onOpenAdminPanel && (
            <div className="mt-5 pt-4 border-t border-slate-800/80">
              <button
                onClick={onOpenAdminPanel}
                className="w-full py-2.5 px-4 rounded-2xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-teal-500/40 text-slate-300 hover:text-white flex items-center justify-between text-xs font-semibold transition group shadow-lg cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-xl bg-gradient-to-tr from-rose-500/20 to-amber-500/20 border border-rose-500/30 text-rose-300">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-white group-hover:text-teal-300 transition">
                      AGO Admin & Moderation Panel
                    </div>
                    <div className="text-[10px] text-slate-400 font-normal">
                      Manage all Nigerian users, verify vendors & ban accounts
                    </div>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-teal-300 font-bold uppercase">
                  Open
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Floating Gift Button */}
        <button
          onClick={() => setShowGiftModal(true)}
          className="fixed bottom-20 right-5 z-30 p-3 rounded-full bg-gradient-to-tr from-pink-500 to-rose-600 text-white shadow-2xl shadow-rose-500/40 hover:scale-110 transition animate-bounce cursor-pointer"
          title="Send a Gift"
        >
          <Gift className="w-5 h-5" />
        </button>
      </div>

      {/* Settings Modal with Log Out button */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-sm bg-slate-900 rounded-3xl border border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Settings className="w-4 h-4 text-teal-400" />
                <span>Profile Settings</span>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Signed In As:</span>
                <span className="font-bold text-white">{currentUser?.name || 'Favour Chukwudi'}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Phone Number:</span>
                <span className="font-mono text-teal-300">+234 808 123 4567</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">City / State:</span>
                <span className="font-semibold text-slate-200">{currentUser?.city || 'Lagos'}, Nigeria</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Account Type:</span>
                <span className="text-emerald-400 font-bold">Verified Buyer & Seller</span>
              </div>

              {/* Theme Setting row */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Color Palette:</span>
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
                  <button
                    type="button"
                    onClick={() => handleThemeChange('dark')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition cursor-pointer ${
                      theme === 'dark'
                        ? 'bg-teal-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Moon className="w-3 h-3" />
                    <span>Dark</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleThemeChange('light')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition cursor-pointer ${
                      theme === 'light'
                        ? 'bg-amber-400 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Sun className="w-3 h-3" />
                    <span>Light</span>
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setShowSettingsModal(false);
                if (onLogout) {
                  onLogout();
                }
              }}
              className="w-full py-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out of Account</span>
            </button>
          </div>
        </div>
      )}

      {showGiftModal && (
        <GiftModal
          creatorName="@AGO_Brand"
          onClose={() => setShowGiftModal(false)}
        />
      )}
    </div>
  );
};
