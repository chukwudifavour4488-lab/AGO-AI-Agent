import React, { useState } from 'react';
import { X, UploadCloud, CheckCircle2, Image as ImageIcon, Sparkles, Plus, Loader2 } from 'lucide-react';
import { Product, NigerianCity } from '../types';
import { saveProductToFirestore } from '../lib/firebaseService';

interface UploadProductModalProps {
  onClose: () => void;
  onProductUploaded: (newProduct: Product) => void;
}

export const UploadProductModal: React.FC<UploadProductModalProps> = ({
  onClose,
  onProductUploaded,
}) => {
  const [title, setTitle] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [originalPrice, setOriginalPrice] = useState<string>('');
  const [category, setCategory] = useState<'phones' | 'fashion' | 'sneakers' | 'electronics' | 'native'>('phones');
  const [city, setCity] = useState<'Lagos' | 'Abuja' | 'Port Harcourt' | 'Kano'>('Lagos');
  const [locationArea, setLocationArea] = useState<string>('Computer Village, Ikeja');
  const [condition, setCondition] = useState<'Brand New' | 'UK Used' | 'Refurbished' | 'Custom Made'>('Brand New');
  const [imageUrl, setImageUrl] = useState<string>('https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80');
  const [description, setDescription] = useState<string>('');
  const [specsInput, setSpecsInput] = useState<string>('Tested & Guaranteed, 1 Year Warranty, Escrow Protected');
  const [sellerName, setSellerName] = useState<string>('Verified Nigerian Merchant');
  const [sellerHandle, setSellerHandle] = useState<string>('@Merchant_HQ');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<boolean>(false);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !price.trim()) return;

    setIsSubmitting(true);

    const numericPrice = parseFloat(price.replace(/,/g, '')) || 50000;
    const numericOriginalPrice = originalPrice ? parseFloat(originalPrice.replace(/,/g, '')) : undefined;

    const newProd: Product = {
      id: `prod-${Date.now()}`,
      title: title.trim(),
      price: numericPrice,
      priceFormatted: `₦${numericPrice.toLocaleString()}`,
      originalPrice: numericOriginalPrice,
      originalPriceFormatted: numericOriginalPrice ? `₦${numericOriginalPrice.toLocaleString()}` : undefined,
      city,
      locationArea: locationArea.trim() || `${city} Central`,
      category,
      image: imageUrl.trim() || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
      rating: 5.0,
      reviewsCount: 1,
      condition,
      seller: {
        id: `seller-${Date.now()}`,
        name: sellerName,
        handle: sellerHandle.startsWith('@') ? sellerHandle : `@${sellerHandle}`,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        verified: true,
        city,
        rating: 5.0,
        responseTime: 'Under 5 mins',
      },
      description: description.trim() || `Authentic ${title} available in ${city} with 100% AGO Escrow Buyer Protection.`,
      specs: specsInput.split(',').map((s) => s.trim()).filter(Boolean),
      inStock: true,
      featured: true,
      scrapedVia: 'Merchant',
    };

    // Save directly to Firestore "products" collection
    await saveProductToFirestore(newProd);

    setIsSubmitting(false);
    setSuccessToast(true);
    onProductUploaded(newProd);

    setTimeout(() => {
      setSuccessToast(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-950 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Upload Product to Firestore</h3>
              <p className="text-[10px] text-slate-400">Add live inventory to Nigerian Marketplace</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {successToast ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto text-3xl animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-white">Product Saved to Firestore!</h4>
            <p className="text-xs text-slate-300">
              Your item is now live in the AGO Nigerian Marketplace.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-3.5 overflow-y-auto">
            {/* Title */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Product Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. iPhone 14 Pro Max 256GB - Clean UK Used"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-teal-400"
              />
            </div>

            {/* Price and Category */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Price (₦ NGN) *
                </label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 285000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-teal-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-teal-400"
                >
                  <option value="phones">📱 Phones & Gadgets</option>
                  <option value="fashion">👕 Streetwear & Style</option>
                  <option value="sneakers">👟 Sneakers</option>
                  <option value="native">👔 Senator & Native</option>
                  <option value="electronics">💻 Electronics</option>
                </select>
              </div>
            </div>

            {/* City and Location Area */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  City *
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-teal-400"
                >
                  <option value="Lagos">Lagos</option>
                  <option value="Abuja">Abuja</option>
                  <option value="Port Harcourt">Port Harcourt</option>
                  <option value="Kano">Kano</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Condition *
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-teal-400"
                >
                  <option value="Brand New">Brand New</option>
                  <option value="UK Used">UK Used</option>
                  <option value="Refurbished">Refurbished</option>
                  <option value="Custom Made">Custom Made</option>
                </select>
              </div>
            </div>

            {/* Image URL & File Upload */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Product Image (Upload File or URL)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-teal-400"
                />
                <label className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-bold border border-slate-700 cursor-pointer flex items-center gap-1 shrink-0">
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Choose File</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Description & Guarantee
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Details about battery health, condition, warranty, accessories included..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-teal-400 resize-none"
              />
            </div>

            {/* Specs */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Key Specs (comma separated)
              </label>
              <input
                type="text"
                value={specsInput}
                onChange={(e) => setSpecsInput(e.target.value)}
                placeholder="128GB Storage, Factory Unlocked, 30-Day Warranty"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-teal-400"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-teal-400 via-cyan-500 to-purple-600 hover:opacity-95 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-teal-500/30 flex items-center justify-center gap-2 cursor-pointer transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>Save to Firestore & Publish</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
