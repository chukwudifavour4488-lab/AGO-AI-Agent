import React, { useState } from 'react';
import { Search, X, ShoppingBag, Users, Film, ArrowRight, ShieldCheck, MapPin, Tag } from 'lucide-react';
import { Product, UserAccount, FeedPost } from '../types';

interface SearchModalProps {
  products: Product[];
  users: UserAccount[];
  posts: FeedPost[];
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  onSelectUser: (userHandle: string) => void;
  onSelectPost: (post: FeedPost) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  products,
  users,
  posts,
  onClose,
  onSelectProduct,
  onSelectUser,
  onSelectPost,
}) => {
  const [queryText, setQueryText] = useState<string>('');
  const [filterTab, setFilterTab] = useState<'all' | 'products' | 'users' | 'posts'>('all');

  const q = queryText.toLowerCase().trim();

  // Filter products from Firestore data
  const matchedProducts = products.filter(
    (p) =>
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.city.toLowerCase().includes(q) ||
      p.seller.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
  );

  // Filter users from Firestore data
  const matchedUsers = users.filter(
    (u) =>
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.handle.toLowerCase().includes(q) ||
      u.city.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
  );

  // Filter posts from Firestore data
  const matchedPosts = posts.filter(
    (p) =>
      !q ||
      p.caption.toLowerCase().includes(q) ||
      p.creator.name.toLowerCase().includes(q) ||
      p.creator.handle.toLowerCase().includes(q) ||
      p.productTagged.title.toLowerCase().includes(q)
  );

  const totalResults = matchedProducts.length + matchedUsers.length + matchedPosts.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-4 pt-12 sm:pt-16 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Search Input Bar */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-teal-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            placeholder="Search Firestore products, Nigerian sellers, or shoppable posts..."
            className="flex-1 bg-transparent text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none"
          />
          {queryText && (
            <button
              onClick={() => setQueryText('')}
              className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
          >
            Done
          </button>
        </div>

        {/* Tab Filters */}
        <div className="flex bg-slate-950/70 p-2 gap-1.5 border-b border-slate-800 text-xs overflow-x-auto no-scrollbar">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
              filterTab === 'all'
                ? 'bg-teal-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Results ({totalResults})
          </button>
          <button
            onClick={() => setFilterTab('products')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1 whitespace-nowrap ${
              filterTab === 'products'
                ? 'bg-teal-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Products ({matchedProducts.length})</span>
          </button>
          <button
            onClick={() => setFilterTab('users')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1 whitespace-nowrap ${
              filterTab === 'users'
                ? 'bg-teal-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Verified Users ({matchedUsers.length})</span>
          </button>
          <button
            onClick={() => setFilterTab('posts')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1 whitespace-nowrap ${
              filterTab === 'posts'
                ? 'bg-teal-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Posts ({matchedPosts.length})</span>
          </button>
        </div>

        {/* Search Results List */}
        <div className="p-4 space-y-5 overflow-y-auto flex-1">
          {/* Section: Products */}
          {(filterTab === 'all' || filterTab === 'products') && matchedProducts.length > 0 && (
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                <span className="flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-teal-400" />
                  <span>Products in Firestore</span>
                </span>
                <span className="text-[10px] text-teal-300">{matchedProducts.length} Found</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {matchedProducts.slice(0, 6).map((prod) => (
                  <div
                    key={prod.id}
                    onClick={() => {
                      onSelectProduct(prod);
                      onClose();
                    }}
                    className="p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-teal-500/50 flex items-center gap-3 cursor-pointer transition group shadow-sm"
                  >
                    <img
                      src={prod.image}
                      alt={prod.title}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-xl object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-white truncate group-hover:text-teal-300 transition">
                        {prod.title}
                      </h4>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs font-extrabold text-emerald-400">
                          {prod.priceFormatted}
                        </span>
                        <span className="text-[10px] text-slate-400">📍 {prod.city}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Users / Sellers */}
          {(filterTab === 'all' || filterTab === 'users') && matchedUsers.length > 0 && (
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-purple-400" />
                  <span>Merchants & Creators</span>
                </span>
                <span className="text-[10px] text-purple-300">{matchedUsers.length} Found</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {matchedUsers.slice(0, 4).map((usr) => (
                  <div
                    key={usr.id}
                    onClick={() => {
                      onSelectUser(usr.handle);
                      onClose();
                    }}
                    className="p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-purple-500/50 flex items-center gap-3 cursor-pointer transition group shadow-sm"
                  >
                    <img
                      src={usr.avatar}
                      alt={usr.name}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full object-cover shrink-0 ring-1 ring-purple-500/40"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <h4 className="text-xs font-bold text-white truncate group-hover:text-purple-300 transition">
                          {usr.name}
                        </h4>
                        {usr.verified && (
                          <ShieldCheck className="w-3 h-3 text-teal-400 shrink-0" />
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400">{usr.handle} • {usr.city}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Shoppable Posts */}
          {(filterTab === 'all' || filterTab === 'posts') && matchedPosts.length > 0 && (
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                <span className="flex items-center gap-1.5">
                  <Film className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Shoppable Posts</span>
                </span>
                <span className="text-[10px] text-cyan-300">{matchedPosts.length} Found</span>
              </div>

              <div className="space-y-2">
                {matchedPosts.slice(0, 3).map((post) => (
                  <div
                    key={post.id}
                    onClick={() => {
                      onSelectPost(post);
                      onClose();
                    }}
                    className="p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/50 flex items-center gap-3 cursor-pointer transition group shadow-sm"
                  >
                    <img
                      src={post.mediaUrl}
                      alt={post.caption}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-xl object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-white line-clamp-1 group-hover:text-cyan-300">
                        {post.caption}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                        <span>{post.creator.name}</span>
                        <span>•</span>
                        <span className="text-emerald-400 font-bold">{post.productTagged.priceFormatted}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {totalResults === 0 && (
            <div className="py-12 text-center text-slate-400 text-xs">
              No matching records found for "{queryText}".
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
