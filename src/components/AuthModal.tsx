import React, { useState } from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  MapPin,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  ChevronDown,
  AlertCircle,
  KeyRound,
} from 'lucide-react';
import { AgoLogo } from './AgoLogo';
import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { UserAccount } from '../types';
import { CountryPhoneInput, COUNTRIES, CountryData, formatFullInternationalNumber } from './CountryPhoneInput';

interface AuthModalProps {
  onAuthenticated: (user: UserAccount) => void;
  initialMode?: 'login' | 'signup';
}

const NIGERIAN_CITIES = [
  'Lagos',
  'Abuja',
  'Port Harcourt',
  'Kano',
  'Ibadan',
  'Enugu',
  'Benin City',
  'Calabar',
];

const DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
];

export const AuthModal: React.FC<AuthModalProps> = ({
  onAuthenticated,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'signup_success'>(initialMode);
  
  // Login Form State
  const [loginIdentifier, setLoginIdentifier] = useState<string>('chukwudifavour2277@gmail.com');
  const [loginPassword, setLoginPassword] = useState<string>('password123');
  const [showLoginPassword, setShowLoginPassword] = useState<boolean>(false);

  // Signup Form State
  const [fullName, setFullName] = useState<string>('Favour Chukwudi');
  const [signupEmail, setSignupEmail] = useState<string>('chukwudifavour2277@gmail.com');
  const [signupPhone, setSignupPhone] = useState<string>('08081234567');
  const [signupPassword, setSignupPassword] = useState<string>('password123');
  const [showSignupPassword, setShowSignupPassword] = useState<boolean>(false);
  const [selectedCity, setSelectedCity] = useState<string>('Lagos');
  const [agreeEscrowTerms, setAgreeEscrowTerms] = useState<boolean>(true);
  const [selectedCountry, setSelectedCountry] = useState<CountryData>(COUNTRIES[0]); // 🇳🇬 Nigeria

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState<string>('chukwudifavour2277@gmail.com');
  const [forgotSent, setForgotSent] = useState<boolean>(false);

  // Feedback & Loading
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [newlyCreatedUser, setNewlyCreatedUser] = useState<UserAccount | null>(null);

  // Helper to construct a complete UserAccount
  const constructUserAccount = (
    name: string,
    email: string,
    phone: string,
    city: string,
    avatarUrl?: string
  ): UserAccount => {
    const cleanName = name.trim() || 'Favour Chukwudi';
    const cleanHandle = `@${cleanName.toLowerCase().replace(/\s+/g, '_')}`;
    const cleanEmail = email.trim() || `${cleanName.toLowerCase().replace(/\s+/g, '')}@ago.africa`;
    const cleanPhone = phone.trim() || '+2348081234567';
    const safeCity = (NIGERIAN_CITIES.includes(city) ? city : 'Lagos') as 'Lagos' | 'Abuja' | 'Port Harcourt' | 'Kano';

    const randomAvatar = avatarUrl || DEFAULT_AVATARS[0];

    return {
      id: `usr-${cleanPhone.replace(/\D/g, '').slice(-8) || Math.floor(Math.random() * 899999 + 100000)}`,
      name: cleanName,
      handle: cleanHandle,
      email: cleanEmail,
      avatar: randomAvatar,
      role: 'buyer',
      city: safeCity,
      status: 'active',
      verified: true,
      joinedDate: 'August 2026',
      totalVolumeNaira: 0,
      totalVolumeFormatted: '₦0',
      totalListingsOrPosts: 0,
      rating: 5.0,
    };
  };

  // 1. Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier.trim()) {
      setError('Please enter your email or phone number');
      return;
    }
    if (!loginPassword.trim()) {
      setError('Please enter your password');
      return;
    }

    setError(null);
    setLoading(true);

    setTimeout(async () => {
      // Derive display name from identifier if plausible, default to Favour Chukwudi
      let derivedName = 'Favour Chukwudi';
      if (loginIdentifier.includes('@')) {
        const prefix = loginIdentifier.split('@')[0];
        if (prefix.toLowerCase().includes('favour')) {
          derivedName = 'Favour Chukwudi';
        } else {
          derivedName = prefix.replace(/[^a-zA-Z]/g, ' ').trim() || 'Ago Member';
          derivedName = derivedName.charAt(0).toUpperCase() + derivedName.slice(1);
        }
      }

      const user = constructUserAccount(
        derivedName,
        loginIdentifier.includes('@') ? loginIdentifier : `${derivedName.toLowerCase().replace(/\s+/g, '')}@ago.africa`,
        loginIdentifier.includes('@') ? '+2348081234567' : loginIdentifier,
        'Lagos'
      );

      // Save to Firestore and localStorage
      try {
        await setDoc(doc(db, 'users', user.id), {
          ...user,
          lastLogin: new Date().toISOString(),
        }, { merge: true });
      } catch (err) {
        console.warn('Firestore user save note:', err);
      }

      localStorage.setItem('ago_auth_user', JSON.stringify(user));
      localStorage.setItem('ago_user', JSON.stringify(user));
      setLoading(false);
      onAuthenticated(user);
    }, 600);
  };

  // 2. Handle Signup
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!signupEmail.trim()) {
      setError('Please enter a valid email address');
      return;
    }
    if (!signupPhone.trim()) {
      setError('Please enter your phone number');
      return;
    }
    if (!signupPassword.trim() || signupPassword.length < 4) {
      setError('Password must be at least 4 characters long');
      return;
    }
    if (!agreeEscrowTerms) {
      setError('You must agree to the AGO Escrow Terms & Buyer Protection');
      return;
    }

    setError(null);
    setLoading(true);

    const fullFormattedPhone = formatFullInternationalNumber(selectedCountry.dialCode, signupPhone);

    const user = constructUserAccount(
      fullName,
      signupEmail,
      fullFormattedPhone,
      selectedCity
    );

    setTimeout(async () => {
      try {
        await setDoc(doc(db, 'users', user.id), {
          ...user,
          phoneNumber: fullFormattedPhone,
          countryCode: selectedCountry.code,
          dialCode: selectedCountry.dialCode,
          agreedToEscrow: true,
          registeredAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        }, { merge: true });
      } catch (err) {
        console.warn('Firestore user save note:', err);
      }

      localStorage.setItem('ago_auth_user', JSON.stringify(user));
      localStorage.setItem('ago_user', JSON.stringify(user));
      setNewlyCreatedUser(user);
      setLoading(false);
      setMode('signup_success');
    }, 700);
  };

  // 3. Handle Continue with Google
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    setTimeout(async () => {
      const googleUser = constructUserAccount(
        'Favour Chukwudi',
        'chukwudifavour2277@gmail.com',
        '+2348081234567',
        'Lagos',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'
      );

      try {
        await setDoc(doc(db, 'users', googleUser.id), {
          ...googleUser,
          provider: 'google',
          lastLogin: new Date().toISOString(),
        }, { merge: true });
      } catch (err) {
        console.warn('Firestore google user note:', err);
      }

      localStorage.setItem('ago_auth_user', JSON.stringify(googleUser));
      localStorage.setItem('ago_user', JSON.stringify(googleUser));
      setLoading(false);
      onAuthenticated(googleUser);
    }, 500);
  };

  // 4. Handle Forgot Password
  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setError('Please enter your registered email address');
      return;
    }
    setError(null);
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setForgotSent(true);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/95 backdrop-blur-xl overflow-y-auto">
      {/* Background ambient lighting */}
      <div className="fixed -right-20 -top-20 w-72 h-72 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed -left-20 -bottom-20 w-72 h-72 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md bg-slate-900 rounded-3xl border border-teal-500/30 shadow-2xl p-5 sm:p-7 text-center overflow-hidden my-auto">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center justify-center mb-5">
          <div className="mb-2">
            <AgoLogo size="lg" showSubtitle={false} />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>AI Super App + Escrow Protection</span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold text-left flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 1: LOGIN */}
        {/* ========================================================================= */}
        {mode === 'login' && (
          <div className="space-y-4">
            <div className="text-left">
              <h2 className="text-xl font-black text-white">Welcome Back</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Log in to shop, track escrow funds, and chat with AI.
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-3.5 text-left">
              {/* Email / Phone Field */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Email or Phone Number
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="name@gmail.com or 08081234567"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-teal-400 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setMode('forgot');
                    }}
                    className="text-[11px] font-semibold text-teal-400 hover:text-teal-300 hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-teal-400 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-500 hover:from-teal-300 hover:to-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-teal-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-1"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                ) : (
                  <>
                    <span>Login</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-500">
                <span className="bg-slate-900 px-3 tracking-widest">OR</span>
              </div>
            </div>

            {/* Continue with Google Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2.5 transition shadow-sm cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Switch to Sign Up */}
            <div className="pt-2 text-center text-xs text-slate-400">
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setMode('signup');
                }}
                className="text-teal-400 font-bold hover:underline cursor-pointer"
              >
                Sign Up
              </button>
            </div>

            <div className="pt-2 text-[10px] text-slate-500">
              ⚡ Demo mode: enter any email/password to log in instantly.
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: SIGNUP */}
        {/* ========================================================================= */}
        {mode === 'signup' && (
          <div className="space-y-4">
            <div className="text-left">
              <h2 className="text-xl font-black text-white">Create Your Account</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Join Nigeria&apos;s verified AI shopping & escrow network.
              </p>
            </div>

            <form onSubmit={handleSignupSubmit} className="space-y-3 text-left">
              {/* Full Name */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Favour Chukwudi"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-teal-400 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="chukwudifavour2277@gmail.com"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-teal-400 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Phone Number
                </label>
                <CountryPhoneInput
                  selectedCountry={selectedCountry}
                  onSelectCountry={setSelectedCountry}
                  phoneNumber={signupPhone}
                  onPhoneNumberChange={setSignupPhone}
                  placeholder="0808 123 4567"
                />
              </div>

              {/* City Dropdown & Password Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* City Dropdown */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    City (Nigeria)
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-teal-400 rounded-xl pl-10 pr-8 py-2 text-xs sm:text-sm text-white focus:outline-none transition appearance-none cursor-pointer"
                    >
                      {NIGERIAN_CITIES.map((c) => (
                        <option key={c} value={c} className="bg-slate-900 text-white">
                          {c}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showSignupPassword ? 'text' : 'password'}
                      required
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-teal-400 rounded-xl pl-10 pr-8 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    >
                      {showSignupPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Escrow Agreement Checkbox */}
              <label className="flex items-start gap-2.5 pt-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreeEscrowTerms}
                  onChange={(e) => setAgreeEscrowTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-teal-500 bg-slate-950 border-slate-700 focus:ring-teal-400 focus:ring-offset-slate-900"
                />
                <span className="text-[11px] text-slate-300 leading-tight">
                  I agree to <strong className="text-teal-300">AGO Escrow Terms</strong> and Buyer Protection Guarantee.
                </span>
              </label>

              {/* Create Account Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-500 hover:from-teal-300 hover:to-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-teal-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-2.5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-500">
                <span className="bg-slate-900 px-3 tracking-widest">OR</span>
              </div>
            </div>

            {/* Google Signup Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2.5 transition shadow-sm cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Switch to Login */}
            <div className="pt-1 text-center text-xs text-slate-400">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setMode('login');
                }}
                className="text-teal-400 font-bold hover:underline cursor-pointer"
              >
                Log In
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: SIGNUP SUCCESS CELEBRATION */}
        {/* ========================================================================= */}
        {mode === 'signup_success' && (
          <div className="py-4 space-y-4 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-teal-400 to-emerald-400 text-slate-950 flex items-center justify-center mx-auto shadow-xl shadow-teal-500/30">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Account Created!
              </h2>
              <p className="text-base font-bold text-teal-300 mt-1">
                Welcome to Ago Lite, {newlyCreatedUser?.name || fullName}! 🎉
              </p>
              <p className="text-xs text-slate-300 mt-2 max-w-xs mx-auto">
                Your profile is protected by AGO Escrow Vault & 24/7 Anti-Scam Intelligence.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-teal-500/30 text-left text-xs space-y-1.5 max-w-xs mx-auto">
              <div className="flex justify-between text-slate-400">
                <span>Name:</span>
                <span className="font-bold text-white">{newlyCreatedUser?.name}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Email:</span>
                <span className="text-slate-200 font-mono">{newlyCreatedUser?.email}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Location:</span>
                <span className="text-teal-300 font-semibold">{newlyCreatedUser?.city}, Nigeria 🇳🇬</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Escrow Status:</span>
                <span className="text-emerald-400 font-bold">🛡️ Active & Protected</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (newlyCreatedUser) {
                  onAuthenticated(newlyCreatedUser);
                }
              }}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-xl shadow-teal-500/30 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Go to Home</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 4: FORGOT PASSWORD */}
        {/* ========================================================================= */}
        {mode === 'forgot' && (
          <div className="space-y-4 text-left">
            <div>
              <h2 className="text-xl font-black text-white">Reset Password</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Enter your email or phone to receive an instant password recovery link.
              </p>
            </div>

            {forgotSent ? (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs space-y-2 text-center">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400" />
                <div className="font-bold text-white text-sm">Reset Link Sent!</div>
                <p className="text-xs text-slate-300">
                  We&apos;ve sent a password reset link to <strong className="text-teal-300">{forgotEmail}</strong>. Check your inbox or SMS.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setForgotSent(false);
                    setMode('login');
                  }}
                  className="mt-3 w-full py-2 rounded-xl bg-teal-500 text-slate-950 font-bold text-xs cursor-pointer"
                >
                  Return to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Registered Email or Phone
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="name@gmail.com or 08081234567"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-teal-400 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-teal-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>Send Reset Link</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setMode('login');
                  }}
                  className="w-full text-center text-xs text-slate-400 hover:text-white py-1 transition cursor-pointer"
                >
                  Back to Login
                </button>
              </form>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
