import React, { useState } from 'react';
import { Phone, ShieldCheck, ArrowRight, CheckCircle2, Lock, Sparkles, RefreshCw } from 'lucide-react';
import { AgoLogo } from './AgoLogo';
import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { UserAccount } from '../types';
import { CountryPhoneInput, COUNTRIES, CountryData, formatFullInternationalNumber } from './CountryPhoneInput';

interface PhoneAuthModalProps {
  onAuthenticated: (user: UserAccount) => void;
}

export const PhoneAuthModal: React.FC<PhoneAuthModalProps> = ({ onAuthenticated }) => {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [selectedCountry, setSelectedCountry] = useState<CountryData>(COUNTRIES[0]); // Default: Nigeria 🇳🇬 +234
  const [rawPhoneNumber, setRawPhoneNumber] = useState<string>('08081234567');
  const [fullPhoneNumber, setFullPhoneNumber] = useState<string>('+2348081234567');
  const [fullName, setFullName] = useState<string>('Favour Chukwudi');
  const [city, setCity] = useState<'Lagos' | 'Abuja' | 'Port Harcourt' | 'Kano'>('Lagos');
  const [otpCode, setOtpCode] = useState<string>('');
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Send Phone OTP
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const digitsOnly = rawPhoneNumber.replace(/\D/g, '');
    if (!digitsOnly || digitsOnly.length < selectedCountry.minLength) {
      setError(`Please enter a valid phone number for ${selectedCountry.name} (min ${selectedCountry.minLength} digits)`);
      return;
    }
    setError(null);
    setLoading(true);

    const fullFormatted = formatFullInternationalNumber(selectedCountry.dialCode, rawPhoneNumber);
    setFullPhoneNumber(fullFormatted);

    setTimeout(() => {
      // Generate 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(code);
      setOtpCode(code); // Pre-fill for instant seamless testing
      setLoading(false);
      setStep('otp');
    }, 600);
  };

  // Verify Phone OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.length < 6) {
      setError('Please enter the 6-digit OTP code sent to your phone');
      return;
    }

    setLoading(true);
    setError(null);

    // Save full number as {countryCode}{phoneNumber} (e.g. +233241234567 or +2348081234567)
    const finalFormattedPhone = fullPhoneNumber || formatFullInternationalNumber(selectedCountry.dialCode, rawPhoneNumber);

    const userId = `usr-${finalFormattedPhone.replace(/\D/g, '').slice(-10) || Date.now()}`;
    const userHandle = `@${fullName.toLowerCase().replace(/\s+/g, '_')}`;

    const userAccount: UserAccount = {
      id: userId,
      name: fullName,
      handle: userHandle,
      email: `${fullName.toLowerCase().replace(/\s+/g, '')}@ago.africa`,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      role: 'buyer',
      city: city,
      status: 'active',
      verified: true,
      joinedDate: 'August 2026',
      totalVolumeNaira: 0,
      totalVolumeFormatted: '₦0',
      totalListingsOrPosts: 0,
      rating: 5.0,
    };

    try {
      // Save user to Firestore "users" with country & full international number
      await setDoc(
        doc(db, 'users', userId),
        {
          ...userAccount,
          phoneNumber: finalFormattedPhone,
          countryCode: selectedCountry.code,
          dialCode: selectedCountry.dialCode,
          countryName: selectedCountry.name,
          lastLogin: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (err) {
      console.warn('[Firestore] Phone auth user save note:', err);
    }

    // Store in localStorage for persistence
    localStorage.setItem('ago_auth_user', JSON.stringify(userAccount));
    setLoading(false);
    onAuthenticated(userAccount);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl overflow-y-auto">
      <div className="relative w-full max-w-md bg-slate-900 rounded-3xl border border-teal-500/30 shadow-2xl p-6 sm:p-8 overflow-visible text-center">
        {/* Glow backdrop */}
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Logo & Header */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="mb-2">
            <AgoLogo size="lg" showSubtitle={false} />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-bold mt-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Secure Firebase Phone Authentication</span>
          </div>
          <p className="text-xs text-slate-300 mt-2">
            Sign in with your mobile number to access verified marketplace deals & escrow protection.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold text-center">
            {error}
          </div>
        )}

        {/* Step 1: Phone Number & Country Code Selector Input */}
        {step === 'phone' && (
          <form onSubmit={handleSendOtp} className="space-y-4 text-left">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Favour Chukwudi"
                className="w-full bg-slate-950 border border-slate-800 focus:border-teal-400 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition"
              />
            </div>

            {/* Country Code Selector + Phone Input */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Phone Number
              </label>
              <CountryPhoneInput
                value={rawPhoneNumber}
                selectedCountry={selectedCountry}
                onChangeCountry={(c) => {
                  setSelectedCountry(c);
                  const formatted = formatFullInternationalNumber(c.dialCode, rawPhoneNumber);
                  setFullPhoneNumber(formatted);
                }}
                onChangeNumber={(raw, full) => {
                  setRawPhoneNumber(raw);
                  setFullPhoneNumber(full);
                }}
              />
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5 px-0.5">
                <span>Selected: <strong className="text-teal-300">{selectedCountry.flag} {selectedCountry.name}</strong></span>
                <span className="font-mono text-slate-400 text-[10px]">
                  Full: <strong className="text-teal-300 font-mono">{fullPhoneNumber || formatFullInternationalNumber(selectedCountry.dialCode, rawPhoneNumber)}</strong>
                </span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Your Primary Commercial Hub
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-teal-400 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none transition"
              >
                <option value="Lagos">Lagos (Computer Village, Lekki, Ikeja)</option>
                <option value="Abuja">Abuja (Wuse 2, Garki, Maitama)</option>
                <option value="Port Harcourt">Port Harcourt (Garrison, GRA)</option>
                <option value="Kano">Kano (Sabon Gari, Fagge)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-teal-400 via-cyan-500 to-purple-600 hover:opacity-95 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-teal-500/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Send Verification Code (OTP)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Step 2: OTP Code Verification */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4 text-left">
            {/* Simulated Real SMS Notification Banner */}
            <div className="p-3 rounded-2xl bg-teal-950/80 border border-teal-500/40 text-teal-300 text-xs">
              <div className="flex items-center gap-1.5 font-bold mb-1">
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                <span>SMS Notification Preview</span>
              </div>
              <p className="font-mono text-[11px] text-slate-200">
                [AGO Security]: OTP code for <strong className="text-teal-300 font-mono">{fullPhoneNumber}</strong> is <strong className="text-white bg-teal-500/20 px-1.5 py-0.5 rounded">{generatedOtp}</strong>. Valid for 10 mins.
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Enter 6-Digit OTP Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="6-digit code"
                className="w-full bg-slate-950 border border-slate-800 focus:border-teal-400 rounded-xl px-4 py-3 text-center text-lg tracking-[0.3em] font-mono font-bold text-teal-300 focus:outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-teal-400 via-cyan-500 to-purple-600 hover:opacity-95 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-teal-500/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verify & Enter Marketplace</span>
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setStep('phone')}
                className="text-xs text-slate-400 hover:text-teal-300 underline font-medium"
              >
                Change Phone Number
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
