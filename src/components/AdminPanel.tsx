import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  UserX,
  UserCheck,
  Filter,
  CheckCircle,
  AlertTriangle,
  MapPin,
  TrendingUp,
  Users,
  DollarSign,
  Lock,
  RefreshCw,
  Plus,
  X,
  Store,
  Sparkles,
  ShoppingBag,
  ArrowUpRight,
} from 'lucide-react';
import { UserAccount, NigerianCity } from '../types';
import { AgoIcon } from './AgoLogo';

interface AdminPanelProps {
  users: UserAccount[];
  onUpdateUserStatus: (userId: string, status: 'active' | 'banned', reason?: string) => void;
  onToggleUserVerification: (userId: string) => void;
  onAddUser: (user: Omit<UserAccount, 'id'>) => void;
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  users,
  onUpdateUserStatus,
  onToggleUserVerification,
  onAddUser,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeSubTab, setActiveSubTab] = useState<'users' | 'escrow' | 'metrics'>('users');

  // Ban Modal State
  const [selectedUserForBan, setSelectedUserForBan] = useState<UserAccount | null>(null);
  const [banReason, setBanReason] = useState<string>('Attempted off-platform payment diversion / counterfeit');

  // Add User Modal State
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newUserName, setNewUserName] = useState<string>('');
  const [newUserHandle, setNewUserHandle] = useState<string>('');
  const [newUserEmail, setNewUserEmail] = useState<string>('');
  const [newUserRole, setNewUserRole] = useState<'seller' | 'creator' | 'buyer'>('seller');
  const [newUserCity, setNewUserCity] = useState<'Lagos' | 'Abuja' | 'Port Harcourt' | 'Kano'>('Lagos');

  // Filtered users calculation
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.city.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesCity = cityFilter === 'all' || u.city === cityFilter;
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;

    return matchesSearch && matchesRole && matchesCity && matchesStatus;
  });

  // Calculate platform totals
  const totalVolume = users.reduce((sum, u) => sum + (u.totalVolumeNaira || 0), 0);
  const activeCount = users.filter((u) => u.status === 'active').length;
  const bannedCount = users.filter((u) => u.status === 'banned').length;
  const sellerCount = users.filter((u) => u.role === 'seller' || u.role === 'creator').length;

  const handleConfirmBan = () => {
    if (!selectedUserForBan) return;
    onUpdateUserStatus(selectedUserForBan.id, 'banned', banReason);
    setSelectedUserForBan(null);
    setBanReason('Attempted off-platform payment diversion / counterfeit');
  };

  const handleUnban = (user: UserAccount) => {
    onUpdateUserStatus(user.id, 'active');
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserHandle) return;

    onAddUser({
      name: newUserName,
      handle: newUserHandle.startsWith('@') ? newUserHandle : `@${newUserHandle}`,
      email: newUserEmail || `${newUserHandle.replace('@', '')}@ago.ng`,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      role: newUserRole,
      city: newUserCity,
      status: 'active',
      verified: true,
      joinedDate: 'Today',
      totalVolumeNaira: 0,
      totalVolumeFormatted: '₦0',
      totalListingsOrPosts: 0,
      rating: 5.0,
    });

    setShowAddModal(false);
    setNewUserName('');
    setNewUserHandle('');
    setNewUserEmail('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex flex-col overflow-hidden text-slate-100">
      {/* Top Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 sm:px-6 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-2xl bg-slate-950 border border-slate-800 shadow-md">
            <AgoIcon size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-white">Ago Lite Admin Console</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 border border-rose-500/40 text-rose-300 uppercase tracking-wider">
                Trust & Safety
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Moderate accounts, manage verified vendors, and enforce marketplace safety across Nigeria.
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
          title="Close Admin Panel"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-6xl mx-auto w-full space-y-6">
        {/* KPI Metrics Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-semibold">Total Accounts</span>
              <Users className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">{users.length}</div>
            <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
              <ArrowUpRight className="w-3 h-3" />
              <span>{activeCount} Active users</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-semibold">Total Escrow GMV</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400">
              ₦{(totalVolume / 1000000).toFixed(1)}M
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-medium">
              Nigerian Naira (₦ NGN)
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-semibold">Merchants & Creators</span>
              <Store className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">{sellerCount}</div>
            <div className="text-[11px] text-teal-300 mt-1 font-medium">
              Lagos, PH, Abuja, Kano
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-rose-900/40 shadow-lg bg-rose-950/10">
            <div className="flex items-center justify-between text-rose-400 mb-1">
              <span className="text-xs font-semibold">Banned Accounts</span>
              <UserX className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-rose-400">{bannedCount}</div>
            <div className="text-[11px] text-rose-300/80 mt-1 font-medium">
              Blocked for fraudulent activity
            </div>
          </div>
        </div>

        {/* Sub Navigation Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveSubTab('users')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeSubTab === 'users'
                  ? 'bg-teal-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              User Management ({filteredUsers.length})
            </button>
            <button
              onClick={() => setActiveSubTab('escrow')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeSubTab === 'escrow'
                  ? 'bg-teal-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Escrow Queue (Protected)
            </button>
            <button
              onClick={() => setActiveSubTab('metrics')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeSubTab === 'metrics'
                  ? 'bg-teal-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Regional Distribution
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-300 hover:to-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-teal-500/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Test User</span>
          </button>
        </div>

        {/* TAB 1: USER MANAGEMENT */}
        {activeSubTab === 'users' && (
          <div className="space-y-4">
            {/* Search & Filters */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, handle (@AGO_Brand), email, city..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
                />
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Role Filter */}
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-teal-400"
                >
                  <option value="all">All Roles</option>
                  <option value="seller">Sellers / Vendors</option>
                  <option value="creator">Creators</option>
                  <option value="buyer">Buyers</option>
                  <option value="admin">Admins</option>
                </select>

                {/* City Filter */}
                <select
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className="py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-teal-400"
                >
                  <option value="all">All Cities</option>
                  <option value="Lagos">Lagos</option>
                  <option value="Abuja">Abuja</option>
                  <option value="Port Harcourt">Port Harcourt</option>
                  <option value="Kano">Kano</option>
                </select>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-teal-400"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active Only</option>
                  <option value="banned">Banned Only</option>
                </select>
              </div>
            </div>

            {/* Users List (Responsive Card Table) */}
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Role & City</th>
                      <th className="py-3 px-4">Transactions (₦)</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Moderation Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400">
                          No users found matching your filters.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <tr
                          key={user.id}
                          className={`hover:bg-slate-800/40 transition ${
                            user.status === 'banned' ? 'bg-rose-950/15' : ''
                          }`}
                        >
                          {/* User Details */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <img
                                  src={user.avatar}
                                  alt={user.name}
                                  referrerPolicy="no-referrer"
                                  className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-800"
                                />
                                {user.verified && (
                                  <div className="absolute -bottom-0.5 -right-0.5 bg-teal-400 rounded-full p-0.5 shadow">
                                    <ShieldCheck className="w-3 h-3 text-slate-950" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-white text-sm">{user.name}</span>
                                </div>
                                <div className="text-slate-400 text-[11px] font-mono">
                                  {user.handle} • {user.email}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Role & City */}
                          <td className="py-3 px-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase tracking-wider ${
                                    user.role === 'creator'
                                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                      : user.role === 'seller'
                                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                                      : user.role === 'admin'
                                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                      : 'bg-slate-800 text-slate-300'
                                  }`}
                                >
                                  {user.role}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-slate-400 text-[11px]">
                                <MapPin className="w-3 h-3 text-teal-400" />
                                <span>{user.city}</span>
                              </div>
                            </div>
                          </td>

                          {/* Total Volume */}
                          <td className="py-3 px-4">
                            <div className="font-extrabold text-white text-xs">
                              {user.totalVolumeFormatted}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {user.totalListingsOrPosts}{' '}
                              {user.role === 'seller'
                                ? 'listings'
                                : user.role === 'creator'
                                ? 'posts'
                                : 'orders'}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4">
                            {user.status === 'banned' ? (
                              <div>
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-500/20 border border-rose-500/40 text-rose-300 uppercase">
                                  <AlertTriangle className="w-3 h-3" />
                                  Banned
                                </span>
                                {user.banReason && (
                                  <div className="text-[10px] text-rose-400/80 mt-1 max-w-xs truncate" title={user.banReason}>
                                    {user.banReason}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 uppercase">
                                <CheckCircle className="w-3 h-3" />
                                Active
                              </span>
                            )}
                          </td>

                          {/* Moderation Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* Toggle Verified */}
                              <button
                                onClick={() => onToggleUserVerification(user.id)}
                                className={`p-1.5 rounded-lg border text-xs transition cursor-pointer ${
                                  user.verified
                                    ? 'bg-teal-500/20 border-teal-500/40 text-teal-300 hover:bg-teal-500/30'
                                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                                }`}
                                title={user.verified ? 'Revoke Verified Badge' : 'Grant Verified Badge'}
                              >
                                <ShieldCheck className="w-4 h-4" />
                              </button>

                              {/* Ban or Unban button */}
                              {user.status === 'banned' ? (
                                <button
                                  onClick={() => handleUnban(user)}
                                  className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-md transition cursor-pointer"
                                  title="Unban and restore account"
                                >
                                  <UserCheck className="w-3.5 h-3.5" />
                                  <span>Unban</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => setSelectedUserForBan(user)}
                                  className="px-2.5 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-600/40 font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                                  title="Ban this account"
                                >
                                  <UserX className="w-3.5 h-3.5" />
                                  <span>Ban Account</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ESCROW QUEUE */}
        {activeSubTab === 'escrow' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
              <div className="flex items-center gap-2 text-emerald-400 mb-2">
                <Lock className="w-5 h-5" />
                <h3 className="text-sm font-bold text-white">AGO Escrow Protection Engine</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Funds for high-value Nigerian marketplace orders (iPhones, Electronics, Bespoke Native Wear) are held safely in escrow until customer inspection in Lagos, Port Harcourt, Abuja, or Kano.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Order #AGO-84920</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Inspection In Progress (PH)
                  </span>
                </div>
                <div className="text-xs text-slate-300">
                  Item: <strong>iPhone 13 128GB (Midnight Blue)</strong>
                </div>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                  <span className="text-slate-400">Escrow Value:</span>
                  <span className="font-extrabold text-emerald-400 text-sm">₦285,000</span>
                </div>
                <div className="flex gap-2 pt-1">
                  <button className="flex-1 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs">
                    Release Funds to Seller
                  </button>
                  <button className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 border border-slate-700 font-bold text-xs">
                    Refund Buyer
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Order #AGO-91823</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    Dispatched via GIG Logistics
                  </span>
                </div>
                <div className="text-xs text-slate-300">
                  Item: <strong>AGO Limited Edition 420GSM Hoodie (Lekki, Lagos)</strong>
                </div>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                  <span className="text-slate-400">Escrow Value:</span>
                  <span className="font-extrabold text-emerald-400 text-sm">₦45,000</span>
                </div>
                <div className="flex gap-2 pt-1">
                  <button className="flex-1 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs">
                    Confirm Delivery
                  </button>
                  <button className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold text-xs">
                    Track Cargo
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: REGIONAL METRICS */}
        {activeSubTab === 'metrics' && (
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white">Marketplace Volume by City (Nigeria)</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Lagos (Fashion, Gadgets, Kicks)</span>
                  <span className="text-emerald-400">₦38,350,000 (49%)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-teal-400 to-cyan-500 rounded-full" style={{ width: '49%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Port Harcourt (Smartphones, Luxury Streetwear)</span>
                  <span className="text-emerald-400">₦21,000,000 (27%)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-teal-400 to-cyan-500 rounded-full" style={{ width: '27%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Abuja (Bespoke Native & Senator Wear)</span>
                  <span className="text-emerald-400">₦12,990,000 (16%)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-teal-400 to-cyan-500 rounded-full" style={{ width: '16%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Kano (Electronics & Gaming Consoles)</span>
                  <span className="text-emerald-400">₦6,800,000 (8%)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-teal-400 to-cyan-500 rounded-full" style={{ width: '8%' }} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* BAN CONFIRMATION MODAL */}
      {selectedUserForBan && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl p-5 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2 rounded-xl bg-rose-500/20 border border-rose-500/30">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">Ban User Account</h3>
                <p className="text-xs text-rose-300/90">
                  {selectedUserForBan.name} ({selectedUserForBan.handle})
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Banning this account will immediately deactivate their seller storefront, pause ongoing payouts, and block AI Chat interactions.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Violation Reason:
              </label>
              <select
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-400"
              >
                <option value="Attempted off-platform payment diversion / counterfeit">
                  Off-platform payment diversion / counterfeit
                </option>
                <option value="Failed Escrow inspection / wrong item shipped">
                  Failed Escrow inspection / wrong item shipped
                </option>
                <option value="Spam / harassing buyers on AI chat">
                  Spam / harassing buyers on AI chat
                </option>
                <option value="Suspicious multiple account creation">
                  Suspicious multiple account creation
                </option>
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setSelectedUserForBan(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBan}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-lg shadow-rose-600/30 transition cursor-pointer"
              >
                Confirm Ban
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD TEST USER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-teal-400" />
                <h3 className="font-extrabold text-base text-white">Create Test Merchant / Creator</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. Femi Balogun"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-teal-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Handle</label>
                <input
                  type="text"
                  required
                  value={newUserHandle}
                  onChange={(e) => setNewUserHandle(e.target.value)}
                  placeholder="e.g. @BalogunDrip_Lagos"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-teal-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Email</label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="e.g. femi@balogun.ng"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-teal-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Role</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-teal-400"
                  >
                    <option value="seller">Seller / Merchant</option>
                    <option value="creator">Content Creator</option>
                    <option value="buyer">Shopper</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">City</label>
                  <select
                    value={newUserCity}
                    onChange={(e) => setNewUserCity(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-teal-400"
                  >
                    <option value="Lagos">Lagos</option>
                    <option value="Port Harcourt">Port Harcourt</option>
                    <option value="Abuja">Abuja</option>
                    <option value="Kano">Kano</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-300 hover:to-cyan-400 text-slate-950 font-black text-xs shadow-lg shadow-teal-500/20"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
