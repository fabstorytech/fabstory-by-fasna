'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  User,
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { getSiteSettings, SiteSettings } from '@/lib/supabase/services';
import { BRAND } from '@/lib/constants';

function GoldOrnament({ className = 'w-24 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M50 2C52 7 58 12 66 12C58 12 52 17 50 22C48 17 42 12 34 12C42 12 48 7 50 2Z"
        fill="#C7A66A"
      />
      <path
        d="M2 12H34M66 12H98"
        stroke="#C7A66A"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.9"
      />
      <circle cx="18" cy="12" r="2.5" fill="#C7A66A" />
      <circle cx="82" cy="12" r="2.5" fill="#C7A66A" />
      <circle cx="50" cy="12" r="2.5" fill="#FFFFFF" />
    </svg>
  );
}

function BotanicalCorner({ className = 'w-32 h-32' }: { className?: string }) {
  return (
    <svg viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M10 10C28 40 50 70 95 85M10 10C40 28 70 50 85 95"
        stroke="#C7A66A"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.65"
      />
      <path
        d="M28 22C34 14 44 16 42 26C40 36 30 32 28 22Z"
        stroke="#C7A66A"
        strokeWidth="1"
        fill="#C7A66A"
        fillOpacity="0.15"
      />
      <path
        d="M22 28C14 34 16 44 26 42C36 40 32 30 22 28Z"
        stroke="#C7A66A"
        strokeWidth="1"
        fill="#C7A66A"
        fillOpacity="0.15"
      />
      <path
        d="M48 42C54 34 64 36 62 46C60 56 50 52 48 42Z"
        stroke="#C7A66A"
        strokeWidth="1"
        fill="#C7A66A"
        fillOpacity="0.15"
      />
      <path
        d="M42 48C34 54 36 64 46 62C56 60 52 50 42 48Z"
        stroke="#C7A66A"
        strokeWidth="1"
        fill="#C7A66A"
        fillOpacity="0.15"
      />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [identifier, setIdentifier] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Dynamic Site Settings for Login CMS
  const [settings, setSettings] = useState<SiteSettings>({
    id: 'default',
    heroDesktopImage: '/images/hero-latest.jpg',
    heroMobileImage: '/images/mobileview/fabstore-mobilebanner1.png',
    heroTitle: 'Where Style Meets Your Story',
    heroSubtitle: 'Specially curated for Women',
    loginImage: '/images/craftsmanship.jpg',
    loginTitle: 'Where Style\nMeets Your Story',
    loginSubtitle: 'FABSTORY BY FASNA',
  });

  useEffect(() => {
    getSiteSettings().then((data) => {
      if (data) {
        setSettings(data);
      }
    });
  }, []);

  const loginImage = settings.loginImage || '/images/craftsmanship.jpg';
  const loginTitle = settings.loginTitle || 'Where Style\nMeets Your Story';
  const loginSubtitle = settings.loginSubtitle || 'FABSTORY BY FASNA';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setMessage({ type: 'error', text: 'Please enter your email or mobile number.' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    setTimeout(() => {
      setIsSubmitting(false);
      setMessage({
        type: 'success',
        text:
          mode === 'login'
            ? 'Signed in successfully! Redirecting...'
            : 'Account created successfully! Welcome to Fabstory.',
      });
      setTimeout(() => {
        router.push('/account');
      }, 1000);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#F7F4EE] flex items-center justify-center p-0 md:p-6 lg:p-10 font-sans">
      {/* Outer Split-Card Container */}
      <div className="w-full max-w-4xl bg-white md:rounded-2xl shadow-xl border border-[#E5E0D8]/80 overflow-hidden flex flex-col md:flex-row min-h-screen md:min-h-[600px] lg:min-h-[640px]">
        
        {/* ============================================================ */}
        {/* LEFT COLUMN: Fashion Model Image with Crisp High-Contrast Overlay (Desktop) */}
        {/* ============================================================ */}
        <div className="hidden md:flex md:w-1/2 relative bg-[#EFE9DF] overflow-hidden flex-col justify-between p-8 lg:p-10 text-white">
          {/* Background Fashion Model Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src={loginImage}
              alt="Fabstory by Fasna - Bespoke Fashion"
              fill
              priority
              sizes="50vw"
              className="object-cover object-top"
            />
            {/* Rich Dark Gradient Backdrop ensuring 100% Crisp Text Visibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/15 z-1" />
          </div>

          {/* Top-Left Botanical Line-Art Illustration */}
          <div className="relative z-10 pointer-events-none">
            <BotanicalCorner className="w-28 h-28 lg:w-36 lg:h-36 -ml-4 -mt-4 text-[#C7A66A]" />
          </div>

          {/* Bottom Branding & Tagline — Enhanced Glowing Silver Typography */}
          <div className="relative z-10 text-center space-y-3 pb-4">
            <h2
              style={{
                color: '#FFFFFF',
                textShadow:
                  '0 0 12px rgba(255, 255, 255, 1), 0 0 24px rgba(226, 232, 240, 0.9), 0 0 45px rgba(199, 210, 222, 0.75), 0 2px 10px rgba(0, 0, 0, 0.95)',
              }}
              className="font-serif text-3xl lg:text-4xl leading-tight font-medium !text-white tracking-normal whitespace-pre-line"
            >
              {loginTitle}
            </h2>

            <div className="space-y-2">
              <span
                style={{
                  color: '#F8FAFC',
                  textShadow:
                    '0 0 10px rgba(255, 255, 255, 0.9), 0 0 20px rgba(226, 232, 240, 0.6), 0 1px 6px rgba(0, 0, 0, 0.9)',
                }}
                className="text-[11px] lg:text-xs uppercase tracking-[0.28em] !text-slate-100 font-semibold block"
              >
                {loginSubtitle}
              </span>
              <div className="flex justify-center">
                <GoldOrnament className="w-28 h-5 text-[#C7A66A] drop-shadow-sm" />
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* MOBILE TOP SECTION: Header with Symmetrical Side-Positioned Nav & Logo */}
        {/* ============================================================ */}
        <div className="md:hidden relative w-full h-72 sm:h-80 bg-[#EFE9DF] shrink-0">
          {/* Image */}
          <div className="absolute inset-0">
            <Image
              src={loginImage}
              alt="Fabstory by Fasna"
              fill
              priority
              sizes="100vw"
              className="object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70" />
          </div>

          {/* Botanical Line-art top-left */}
          <div className="absolute top-0 left-0 pointer-events-none">
            <BotanicalCorner className="w-24 h-24 text-[#C7A66A]" />
          </div>

          {/* Top Navigation Bar: Back Arrow on Left, Real Logo Badge on Right Side */}
          <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-auto">
            <Link
              href="/"
              aria-label="Back to home"
              className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-[#1C3F3A] hover:bg-white transition-colors shadow-sm"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2]" />
            </Link>

            <div className="w-12 h-12 rounded-full bg-white border border-[#C7A66A]/60 shadow-md p-1 flex items-center justify-center">
              <div className="relative w-full h-full">
                <Image
                  src="/logo.png"
                  alt={BRAND.fullName}
                  fill
                  sizes="48px"
                  className="object-contain p-0.5"
                  priority
                />
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* RIGHT COLUMN / MOBILE BOTTOM SHEET: Form & Auth Controls    */}
        {/* ============================================================ */}
        <div className="w-full md:w-1/2 bg-white md:bg-[#FDFCF9] flex flex-col justify-center px-6 sm:px-10 lg:px-14 py-8 sm:py-10 -mt-6 md:mt-0 rounded-t-3xl md:rounded-none z-10 shadow-lg md:shadow-none border-t border-[#E5E0D8]/60 md:border-t-0">
          
          {/* Top Real Brand Logo (Desktop) */}
          <div className="hidden md:flex flex-col items-center justify-center text-center mb-5">
            <div className="w-16 h-16 rounded-full overflow-hidden border border-[#C7A66A]/60 bg-white p-1 shadow-sm mb-2">
              <div className="relative w-full h-full">
                <Image
                  src="/logo.png"
                  alt={BRAND.fullName}
                  fill
                  sizes="64px"
                  className="object-contain p-0.5"
                  priority
                />
              </div>
            </div>
            <span className="font-serif text-xl tracking-[0.22em] text-[#1C3F3A] font-bold uppercase block">
              {BRAND.name}
            </span>
            <span className="text-[9px] tracking-[0.3em] text-[#C7A66A] font-semibold uppercase block">
              — {BRAND.subBrand} —
            </span>
          </div>

          {/* Form Header */}
          <div className="text-center space-y-1 mb-6">
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-[32px] text-[#1C3F3A] font-normal tracking-tight">
              {mode === 'login' ? 'Welcome back' : 'Create an account'}
            </h1>
            <p className="text-xs sm:text-[13px] text-[#6F7775]">
              {mode === 'login'
                ? 'Sign in to continue your Fabstory journey.'
                : 'Join Fabstory to explore bespoke curated collections.'}
            </p>
          </div>

          {/* Feedback Alert Message */}
          {message && (
            <div
              className={`mb-4 p-3 rounded-md text-xs flex items-center gap-2 ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 max-w-[340px] w-full mx-auto">
            {/* Full Name (Sign Up mode only) */}
            {mode === 'signup' && (
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-medium text-[#243234] block">
                  Full Name
                </label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-[#8C9B9A] absolute left-3.5" />
                  <input
                    type="text"
                    placeholder="Your Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required={mode === 'signup'}
                    className="w-full border border-[#D9D3C8] rounded-md pl-10 pr-3.5 py-3 text-xs sm:text-sm bg-white focus:outline-none focus:border-[#1C3F3A] focus:ring-1 focus:ring-[#1C3F3A] placeholder:text-[#A0A8A6] text-[#1C3F3A] transition-all"
                  />
                </div>
              </div>
            )}

            {/* Email or Mobile Number Input */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-medium text-[#243234] block">
                Email or mobile number
              </label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-[#8C9B9A] absolute left-3.5" />
                <input
                  type="text"
                  placeholder="Enter email or mobile number"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  className="w-full border border-[#D9D3C8] rounded-md pl-10 pr-3.5 py-3 text-xs sm:text-sm bg-white focus:outline-none focus:border-[#1C3F3A] focus:ring-1 focus:ring-[#1C3F3A] placeholder:text-[#A0A8A6] text-[#1C3F3A] transition-all"
                />
              </div>
            </div>

            {/* Password Field (Sign Up mode) */}
            {mode === 'signup' && (
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-medium text-[#243234] block">
                  Create Password
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-[#8C9B9A] absolute left-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required={mode === 'signup'}
                    minLength={6}
                    className="w-full border border-[#D9D3C8] rounded-md pl-10 pr-10 py-3 text-xs sm:text-sm bg-white focus:outline-none focus:border-[#1C3F3A] focus:ring-1 focus:ring-[#1C3F3A] placeholder:text-[#A0A8A6] text-[#1C3F3A] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-[#8C9B9A] hover:text-[#1C3F3A]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Primary Action Button: CONTINUE */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#1C3F3A] hover:bg-[#14302C] text-white font-semibold text-xs tracking-[0.14em] uppercase py-3.5 rounded-md transition-all mt-2 shadow-sm active:scale-[0.99] cursor-pointer disabled:opacity-75"
            >
              {isSubmitting ? 'PLEASE WAIT...' : 'CONTINUE'}
            </button>

            {/* Bottom Toggle Link */}
            <div className="pt-3 text-center text-xs text-[#6F7775]">
              {mode === 'login' ? (
                <>
                  New to Fabstory?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup');
                      setMessage(null);
                    }}
                    className="text-[#B08F52] hover:text-[#937540] font-semibold underline underline-offset-2 transition-colors cursor-pointer"
                  >
                    Create an account
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setMessage(null);
                    }}
                    className="text-[#B08F52] hover:text-[#937540] font-semibold underline underline-offset-2 transition-colors cursor-pointer"
                  >
                    Sign in
                  </button>
                </>
              )}
            </div>
          </form>

          {/* Back link on desktop */}
          <div className="hidden md:block text-center mt-6">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-[#8C9B9A] hover:text-[#1C3F3A] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to store</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
