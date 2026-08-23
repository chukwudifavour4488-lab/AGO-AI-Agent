import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, CreditCard, Building2, Smartphone, ArrowRight, Truck, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Product, PaymentMethod, ShippingInfo } from '../types';
import { createOrderInFirestore, OrderDocument } from '../lib/firebaseService';
import { CountryPhoneInput, COUNTRIES, CountryData, formatFullInternationalNumber } from './CountryPhoneInput';

interface CheckoutModalProps {
  product?: Product | null;
  items?: { product: Product; quantity: number; selectedSize?: string; selectedColor?: string }[];
  onClose: () => void;
  onOrderCompleted: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  product,
  items,
  onClose,
  onOrderCompleted,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Form State
  const [selectedCountry, setSelectedCountry] = useState<CountryData>(COUNTRIES[0]);
  const [rawPhone, setRawPhone] = useState<string>('808 000 0000');
  const [shipping, setShipping] = useState<ShippingInfo>({
    fullName: 'Favour Chukwudi',
    phoneNumber: '+2348080000000',
    address: '14 Olu Obasanjo Road, GRA Phase 2',
    city: product?.city || 'Port Harcourt',
    state: 'Rivers State',
    postalCode: '500101',
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [orderNumber] = useState<string>(`AGO${Math.floor(10000 + Math.random() * 90000)}`);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [trackingModalOpen, setTrackingModalOpen] = useState<boolean>(false);

  // Calculate total in Naira
  const singleItemTotal = product ? product.price : 0;
  const itemsTotal = items ? items.reduce((sum, item) => sum + item.product.price * item.quantity, 0) : 0;
  const subtotal = product ? singleItemTotal : itemsTotal;
  const shippingFee = 2500;
  const totalAmount = subtotal + shippingFee;

  const handleContinueToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shipping.fullName || !shipping.phoneNumber || !shipping.address) {
      setErrorMessage("Please fill in all shipping details.");
      return;
    }
    setErrorMessage(null);
    setStep(2);
  };

  const handleConfirmPayment = async () => {
    setIsProcessing(true);

    const orderDoc: OrderDocument = {
      id: `ord-${Date.now()}`,
      orderNumber,
      status: 'pending',
      product: product || null,
      items: items || (product ? [{ product, quantity: 1 }] : []),
      totalAmount,
      shipping,
      paymentMethod,
      createdAt: new Date().toISOString(),
      escrowStatus: 'funds_held_in_escrow',
    };

    // Save order document to Firestore collection "orders" with status "pending"
    await createOrderInFirestore(orderDoc);

    setTimeout(() => {
      setIsProcessing(false);
      setStep(3);
      // Trigger festive celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (err) {
        console.log("Confetti trigger:", err);
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-md bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden my-auto flex flex-col">
        {/* Header with Step Progress */}
        <div className="bg-slate-950/80 px-5 py-4 border-b border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-teal-400">
              {step === 1 && 'Step 1: Shipping Info'}
              {step === 2 && 'Step 2: Payment Method'}
              {step === 3 && 'Step 3: Confirmation'}
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Progress Bar (Mockup 4 style) */}
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden flex">
            <div
              className={`h-full bg-gradient-to-r from-teal-400 to-cyan-500 transition-all duration-300 ${
                step === 1 ? 'w-1/3' : step === 2 ? 'w-2/3' : 'w-full'
              }`}
            />
          </div>
        </div>

        {/* ================= STEP 1: SHIPPING ================= */}
        {step === 1 && (
          <form onSubmit={handleContinueToPayment} className="p-5 space-y-3.5">
            {errorMessage && (
              <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold text-center">
                {errorMessage}
              </div>
            )}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={shipping.fullName}
                onChange={(e) => setShipping({ ...shipping, fullName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-teal-400 transition"
                placeholder="e.g. Favour Chukwudi"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Phone Number (for SMS Tracking)
              </label>
              <CountryPhoneInput
                value={rawPhone}
                selectedCountry={selectedCountry}
                onChangeCountry={(c) => {
                  setSelectedCountry(c);
                  const full = formatFullInternationalNumber(c.dialCode, rawPhone);
                  setShipping((prev) => ({ ...prev, phoneNumber: full }));
                }}
                onChangeNumber={(raw, full) => {
                  setRawPhone(raw);
                  setShipping((prev) => ({ ...prev, phoneNumber: full }));
                }}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Shipping Address
              </label>
              <input
                type="text"
                required
                value={shipping.address}
                onChange={(e) => setShipping({ ...shipping, address: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-teal-400 transition"
                placeholder="Street address / apartment"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  City
                </label>
                <select
                  value={shipping.city}
                  onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-teal-400 transition"
                >
                  <option value="Port Harcourt">Port Harcourt</option>
                  <option value="Lagos">Lagos</option>
                  <option value="Abuja">Abuja</option>
                  <option value="Kano">Kano</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  State
                </label>
                <input
                  type="text"
                  value={shipping.state}
                  onChange={(e) => setShipping({ ...shipping, state: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-teal-400 transition"
                  placeholder="State"
                />
              </div>
            </div>

            {/* Order Summary Snapshot */}
            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Total Items Payable:</span>
              <span className="font-extrabold text-emerald-400 text-sm">
                ₦{totalAmount.toLocaleString()}
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-300 hover:to-cyan-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-teal-500/20 transition uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Continue to Payment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* ================= STEP 2: PAYMENT METHOD ================= */}
        {step === 2 && (
          <div className="p-5 space-y-4">
            <div className="space-y-2.5">
              {/* Option 1: Card */}
              <div
                onClick={() => setPaymentMethod('card')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                  paymentMethod === 'card'
                    ? 'bg-teal-500/10 border-teal-400 text-white'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-slate-800 text-teal-400">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">Debit / Credit Card</div>
                    <div className="text-[10px] text-slate-400">Mastercard, Visa, Verve</div>
                  </div>
                </div>
                {paymentMethod === 'card' && (
                  <div className="w-5 h-5 rounded-full bg-teal-400 text-slate-950 flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </div>

              {/* Option 2: Bank Transfer */}
              <div
                onClick={() => setPaymentMethod('bank_transfer')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                  paymentMethod === 'bank_transfer'
                    ? 'bg-teal-500/10 border-teal-400 text-white'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-slate-800 text-cyan-400">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">Direct Bank Transfer</div>
                    <div className="text-[10px] text-slate-400">Instant automated verification</div>
                  </div>
                </div>
                {paymentMethod === 'bank_transfer' && (
                  <div className="w-5 h-5 rounded-full bg-teal-400 text-slate-950 flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </div>

              {/* Option 3: USSD */}
              <div
                onClick={() => setPaymentMethod('ussd')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                  paymentMethod === 'ussd'
                    ? 'bg-teal-500/10 border-teal-400 text-white'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-slate-800 text-purple-400">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">USSD / Bank Codes</div>
                    <div className="text-[10px] text-slate-400">*737#, *894#, *966#, etc.</div>
                  </div>
                </div>
                {paymentMethod === 'ussd' && (
                  <div className="w-5 h-5 rounded-full bg-teal-400 text-slate-950 flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </div>
            </div>

            {/* Paystack & Flutterwave Gateway Selector */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-slate-950 to-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-400" />
                  <span className="text-[11px] text-slate-300 font-semibold">
                    Instant Gateway Processing
                  </span>
                </div>
                <span className="text-[10px] text-teal-400 font-bold uppercase tracking-wider">
                  Escrow Protected
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="p-2 rounded-xl bg-slate-900/80 border border-teal-500/40 text-center text-[11px] font-bold text-teal-300 flex items-center justify-center gap-1.5">
                  <span>💳</span> Paystack Active
                </div>
                <div className="p-2 rounded-xl bg-slate-900/80 border border-cyan-500/40 text-center text-[11px] font-bold text-cyan-300 flex items-center justify-center gap-1.5">
                  <span>🦋</span> Flutterwave Active
                </div>
              </div>
            </div>

            {/* Price breakdown */}
            <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-400">Subtotal:</span>
                <span>₦{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Doorstep Delivery ({shipping.city}):</span>
                <span>₦{shippingFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-extrabold text-white text-sm pt-1 border-t border-slate-800">
                <span>Total Amount:</span>
                <span className="text-emerald-400">₦{totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
              >
                Back
              </button>

              <button
                type="button"
                disabled={isProcessing}
                onClick={handleConfirmPayment}
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-teal-400 via-cyan-500 to-purple-600 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-teal-500/20 transition uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <span>Securing with Flutterwave...</span>
                ) : (
                  <span>Pay ₦{totalAmount.toLocaleString()}</span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: CONFIRMATION ================= */}
        {step === 3 && (
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-teal-400 to-emerald-500 text-slate-950 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20 animate-bounce">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>

            <div>
              <h3 className="text-lg font-black text-white">Thank you!</h3>
              <p className="text-xs text-slate-300 mt-1">
                Your order has been placed successfully under AGO Escrow Protection.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-left text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Order ID:</span>
                <span className="font-mono font-bold text-teal-300">#{orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Paid:</span>
                <span className="font-extrabold text-emerald-400">
                  ₦{totalAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Delivery Destination:</span>
                <span className="font-semibold text-slate-200">{shipping.city}, Nigeria</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-teal-400">
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5" /> Est. Delivery:
                </span>
                <span className="font-bold">1 - 2 Business Days</span>
              </div>
            </div>

            {trackingModalOpen && (
              <div className="p-3 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs space-y-1 text-left">
                <div className="font-bold flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5" /> GIG Logistics Dispatch Active
                </div>
                <p className="text-[11px] text-slate-300">
                  Waybill #{orderNumber}-NG is registered. Dispatch rider assigned for doorstep delivery in {shipping.city}.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <button
                onClick={() => setTrackingModalOpen(!trackingModalOpen)}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition"
              >
                {trackingModalOpen ? 'Hide Tracking Details' : 'Track Order Status'}
              </button>

              <button
                onClick={() => {
                  onOrderCompleted();
                  onClose();
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-500 text-slate-950 font-black text-xs transition"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
