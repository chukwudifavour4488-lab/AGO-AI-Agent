import React, { useState } from 'react';
import { X, Sparkles, Heart, CreditCard, ShieldCheck, CheckCircle2, Loader2, Smartphone, Building2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { createGiftInFirestore, GiftDocument } from '../lib/firebaseService';

interface GiftModalProps {
  creatorName: string;
  onClose: () => void;
  onGiftSent?: (gift: GiftDocument) => void;
}

export const GiftModal: React.FC<GiftModalProps> = ({ creatorName, onClose, onGiftSent }) => {
  const [selectedGiftId, setSelectedGiftId] = useState<string>('rose');
  const [showPaystackPopup, setShowPaystackPopup] = useState<boolean>(false);
  const [paystackChannel, setPaystackChannel] = useState<'card' | 'bank' | 'ussd'>('card');
  const [isProcessingPaystack, setIsProcessingPaystack] = useState<boolean>(false);
  const [sentToast, setSentToast] = useState<boolean>(false);

  const gifts = [
    { id: 'rose', name: 'Rose', icon: '🌹', price: '₦500', rawPrice: 500, coins: 50 },
    { id: 'palm_wine', name: 'Palm Wine', icon: '🍶', price: '₦1,500', rawPrice: 1500, coins: 150 },
    { id: 'gold_cap', name: 'Chief Cap', icon: '👑', price: '₦5,000', rawPrice: 500, coins: 500 },
    { id: 'super_heart', name: 'Mega Heart', icon: '💖', price: '₦10,000', rawPrice: 10000, coins: 1000 },
    { id: 'gold_chest', name: 'Treasure Box', icon: '🎁', price: '₦25,000', rawPrice: 25000, coins: 2500 },
  ];

  const activeGift = gifts.find((g) => g.id === selectedGiftId) || gifts[0];

  // Open Paystack Popup
  const handleOpenPaystack = () => {
    setShowPaystackPopup(true);
  };

  // Authorize Paystack payment and save to Firestore "gifts"
  const handleAuthorizePaystack = async () => {
    setIsProcessingPaystack(true);

    const ref = `PSTK_AGO_${Math.floor(1000000 + Math.random() * 9000000)}`;

    const giftDoc: GiftDocument = {
      id: `gift-${Date.now()}`,
      creatorHandle: creatorName,
      giftId: activeGift.id,
      giftName: activeGift.name,
      amount: activeGift.rawPrice,
      coins: activeGift.coins,
      senderName: 'Favour Chukwudi',
      paystackRef: ref,
      status: 'completed',
      createdAt: new Date().toISOString(),
    };

    // Save directly to Firestore collection "gifts"
    await createGiftInFirestore(giftDoc);

    setTimeout(() => {
      setIsProcessingPaystack(false);
      setShowPaystackPopup(false);
      setSentToast(true);

      if (onGiftSent) {
        onGiftSent(giftDoc);
      }

      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        console.log(e);
      }

      setTimeout(() => {
        setSentToast(false);
        onClose();
      }, 1500);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-sm bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl p-5 overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5 text-xs font-bold text-teal-400">
            <Sparkles className="w-4 h-4" />
            <span>Send Creator Gift</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-300 mb-4 text-center">
          Show love and support to <span className="font-bold text-white">{creatorName}</span> with verified Paystack virtual gifts!
        </p>

        {sentToast ? (
          <div className="py-8 text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 text-white flex items-center justify-center mx-auto text-3xl animate-bounce">
              🎁
            </div>
            <h4 className="text-sm font-bold text-white">Gift Sent & Saved to Firestore!</h4>
            <p className="text-xs text-teal-300">Creator has received your support.</p>
          </div>
        ) : showPaystackPopup ? (
          /* ================= PAYSTACK POPUP OVERLAY ================= */
          <div className="space-y-3.5 animate-fade-in">
            {/* Paystack Header Banner */}
            <div className="p-3 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-black text-xs">
                  P
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1">
                    <span>Paystack Checkout</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="text-[10px] text-emerald-400">Secured 256-bit payment</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-black text-white">{activeGift.price}</div>
                <div className="text-[9px] text-slate-400">{activeGift.name}</div>
              </div>
            </div>

            {/* Channels: Card, Bank, USSD */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-bold text-center">
              <button
                type="button"
                onClick={() => setPaystackChannel('card')}
                className={`py-1.5 rounded-lg transition ${
                  paystackChannel === 'card' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400'
                }`}
              >
                Card
              </button>
              <button
                type="button"
                onClick={() => setPaystackChannel('bank')}
                className={`py-1.5 rounded-lg transition ${
                  paystackChannel === 'bank' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400'
                }`}
              >
                Transfer
              </button>
              <button
                type="button"
                onClick={() => setPaystackChannel('ussd')}
                className={`py-1.5 rounded-lg transition ${
                  paystackChannel === 'ussd' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400'
                }`}
              >
                USSD
              </button>
            </div>

            {/* Channel Content */}
            {paystackChannel === 'card' && (
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Card Number:</span>
                  <span className="text-white font-mono">**** **** **** 4242</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Expiry & CVV:</span>
                  <span className="text-white font-mono">12/28 • 382</span>
                </div>
              </div>
            )}

            {paystackChannel === 'bank' && (
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5 text-xs text-slate-300">
                <div className="text-slate-400 text-[10px]">Transfer to Wema Bank / Paystack:</div>
                <div className="font-mono font-bold text-white text-sm">9928104829</div>
                <div className="text-[10px] text-emerald-400">Expires in 30 minutes</div>
              </div>
            )}

            {paystackChannel === 'ussd' && (
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-xs text-slate-300 text-center">
                <div className="text-[10px] text-slate-400">Dial on your registered phone:</div>
                <div className="font-mono font-bold text-amber-300 text-sm">*737*50*500#</div>
              </div>
            )}

            {/* Pay Button */}
            <div className="space-y-2 pt-1">
              <button
                onClick={handleAuthorizePaystack}
                disabled={isProcessingPaystack}
                className="w-full py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer transition disabled:opacity-50"
              >
                {isProcessingPaystack ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Pay {activeGift.price} with Paystack</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setShowPaystackPopup(false)}
                className="w-full py-1.5 text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel & Choose Different Gift
              </button>
            </div>
          </div>
        ) : (
          /* ================= GIFT SELECTION GRID ================= */
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {gifts.map((g) => (
                <div
                  key={g.id}
                  onClick={() => setSelectedGiftId(g.id)}
                  className={`p-3 rounded-2xl border cursor-pointer text-center transition ${
                    selectedGiftId === g.id
                      ? 'bg-gradient-to-b from-teal-500/20 to-purple-500/20 border-teal-400 ring-2 ring-teal-400/40 scale-105'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="text-2xl mb-1">{g.icon}</div>
                  <div className="text-[11px] font-bold text-white">{g.name}</div>
                  <div className="text-[10px] text-teal-400 font-extrabold">{g.price}</div>
                </div>
              ))}
            </div>

            <button
              onClick={handleOpenPaystack}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-500 hover:opacity-95 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5 cursor-pointer transition"
            >
              <CreditCard className="w-4 h-4" />
              <span>Send Gift ({activeGift.price}) via Paystack</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
