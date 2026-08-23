import React, { useState } from 'react';
import { X, Star, ShieldCheck, MapPin, MessageCircle, ShoppingBag, Check, Share2, Heart, Sparkles } from 'lucide-react';
import { Product } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, selectedSize?: string, selectedColor?: string) => void;
  onBuyNow: (product: Product, selectedSize?: string, selectedColor?: string) => void;
  onChatSeller: (product: Product) => void;
  onAskAiAboutProduct: (product: Product) => void;
  onOpenCreatorProfile: (creatorHandle: string) => void;
  onOpenEscrowRoom?: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onBuyNow,
  onChatSeller,
  onAskAiAboutProduct,
  onOpenCreatorProfile,
  onOpenEscrowRoom,
}) => {
  if (!product) return null;

  const [selectedSize, setSelectedSize] = useState<string>(
    product.sizes ? product.sizes[0] : ''
  );
  const [selectedColor, setSelectedColor] = useState<string>(
    product.colors ? product.colors[0].name : ''
  );
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [addedToast, setAddedToast] = useState<boolean>(false);
  const [copiedToast, setCopiedToast] = useState<boolean>(false);

  const images = product.gallery && product.gallery.length > 0 ? product.gallery : [product.image];

  const handleAdd = () => {
    onAddToCart(product, selectedSize, selectedColor);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2000);
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Top Header / Actions Bar */}
        <div className="sticky top-0 z-20 bg-slate-900/90 backdrop-blur-md px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Product Details
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSaved(!isSaved)}
              className={`p-2 rounded-full bg-slate-800 hover:bg-slate-700 transition ${
                isSaved ? 'text-rose-500' : 'text-slate-300'
              }`}
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-500' : ''}`} />
            </button>
            <button
              onClick={handleCopyLink}
              className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="Copy link"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {copiedToast && (
          <div className="bg-teal-500/20 border-b border-teal-500/40 text-teal-300 text-xs font-bold text-center py-2">
            ✓ Product link copied to clipboard!
          </div>
        )}

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Gallery Carousel */}
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
            <img
              src={images[activeImageIndex]}
              alt={product.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />

            {/* Condition Tag */}
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-sm border border-slate-700 text-xs font-bold text-teal-300">
              {product.condition}
            </div>

            {/* City Location */}
            <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-sm border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-teal-400" />
              <span>{product.city}</span>
            </div>

            {/* Gallery Indicator Dots */}
            {images.length > 1 && (
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      activeImageIndex === idx
                        ? 'w-6 bg-teal-400'
                        : 'bg-white/40 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Title & Rating */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{product.rating}</span>
              </div>
              <span className="text-xs text-slate-400">
                ({product.reviewsCount} verified reviews)
              </span>
              <span className="text-xs text-slate-600">•</span>
              <span className="text-xs text-emerald-400 font-semibold">In Stock</span>
            </div>

            <h3 className="text-base sm:text-lg font-black text-white leading-tight">
              {product.title}
            </h3>

            {/* Price section */}
            <div className="mt-3 flex items-baseline gap-3">
              <span className="text-2xl font-black text-emerald-400">
                {product.priceFormatted}
              </span>
              {product.originalPriceFormatted && (
                <span className="text-sm text-slate-500 line-through">
                  {product.originalPriceFormatted}
                </span>
              )}
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                Escrow Protected
              </span>
            </div>
          </div>

          {/* Creator Profile Preview (mockup 6: Creator Section) */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <div
              className="flex items-center gap-2.5 cursor-pointer"
              onClick={() => onOpenCreatorProfile(product.seller.handle)}
            >
              <img
                src={product.seller.avatar}
                alt={product.seller.name}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full object-cover ring-2 ring-teal-400/50"
              />
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-white">{product.seller.name}</span>
                  {product.seller.verified && (
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                  )}
                </div>
                <div className="text-[11px] text-slate-400">
                  {product.seller.handle} • {product.seller.locationArea || product.seller.city}
                </div>
              </div>
            </div>

            <button
              onClick={() => onOpenCreatorProfile(product.seller.handle)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-bold border border-slate-700 transition"
            >
              View Shop
            </button>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Description
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Specifications / Highlights */}
          {product.specs && product.specs.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Item Specifications
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {product.specs.map((spec, i) => (
                  <div
                    key={i}
                    className="p-2 rounded-xl bg-slate-950/40 border border-slate-800 text-[11px] text-slate-200 flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span>{spec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Size Selector */}
          {product.sizes && product.sizes.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Select Size
                </span>
                <span className="text-xs text-teal-300 font-semibold">{selectedSize}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      selectedSize === size
                        ? 'bg-gradient-to-r from-teal-400 to-cyan-500 text-slate-950 shadow-md shadow-teal-500/20'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Selector */}
          {product.colors && product.colors.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Select Color
                </span>
                <span className="text-xs text-teal-300 font-semibold">{selectedColor}</span>
              </div>
              <div className="flex items-center gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      selectedColor === color.name
                        ? 'ring-2 ring-teal-400 ring-offset-2 ring-offset-slate-900 scale-110'
                        : 'opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  >
                    {selectedColor === color.name && (
                      <Check className="w-4 h-4 text-white drop-shadow-md" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* AI Helper Banner */}
          <button
            onClick={() => onAskAiAboutProduct(product)}
            className="w-full p-3 rounded-2xl bg-gradient-to-r from-teal-500/10 via-purple-500/10 to-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold flex items-center justify-center gap-2 hover:bg-teal-500/20 transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span>Ask AGO AI: "Is this price fair in {product.city}?"</span>
          </button>
        </div>

        {/* Bottom CTA Bar (Inspired by mockup 6) */}
        <div className="sticky bottom-0 z-20 bg-slate-950/95 backdrop-blur-md p-4 border-t border-slate-800 space-y-2">
          {addedToast && (
            <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-center animate-bounce">
              ✓ Added to cart successfully!
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onBuyNow(product, selectedSize, selectedColor)}
              className="py-3 px-4 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 hover:opacity-95 text-white font-black text-xs sm:text-sm shadow-xl shadow-orange-500/20 transition uppercase tracking-wider flex items-center justify-center gap-1.5"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Buy Now</span>
            </button>

            <button
              onClick={handleAdd}
              className="py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm border border-slate-700 transition flex items-center justify-center gap-1.5"
            >
              <ShoppingBag className="w-4 h-4 text-teal-400" />
              <span>Add to Cart</span>
            </button>
          </div>

          {onOpenEscrowRoom && (
            <button
              onClick={() => {
                onClose();
                onOpenEscrowRoom(product);
              }}
              className="w-full py-2.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/40 text-teal-300 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>Open in AGO Escrow Room (Protected Checkout & Vault)</span>
            </button>
          )}

          <button
            onClick={() => onChatSeller(product)}
            className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-teal-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition border border-slate-800"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Chat Directly with Seller ({product.seller.name})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
