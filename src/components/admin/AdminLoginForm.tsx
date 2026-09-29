'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
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
        fillOpacity="0.18"
      />
      <path
        d="M22 28C14 34 16 44 26 42C36 40 32 30 22 28Z"
        stroke="#C7A66A"
        strokeWidth="1"
        fill="#C7A66A"
        fillOpacity="0.18"
      />
      <path
        d="M48 42C54 34 64 36 62 46C60 56 50 52 48 42Z"
        stroke="#C7A66A"
        strokeWidth="1"
        fill="#C7A66A"
        fillOpacity="0.18"
      />
      <path
        d="M42 48C34 54 36 64 46 62C56 60 52 50 42 48Z"
        stroke="#C7A66A"
        strokeWidth="1"
        fill="#C7A66A"
        fillOpacity="0.18"
      />
    </svg>
  );
}

interface AdminLoginFormProps {
  onSuccess?: () => void;
  redirectUrl?: string;
}

export default function AdminLoginForm({
  onSuccess,
  redirectUrl = '/admin',
}: AdminLoginFormProps) {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = identifier.trim();

    if (!cleanId) {
      setErrorMessage('Please enter your admin email or phone number.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your admin password.');
      return;
    }

    // Normalize identifier: Email or 10-digit Indian Mobile Number
    let normalizedEmail = cleanId.toLowerCase();
    if (!cleanId.includes('@')) {
      const digits = cleanId.replace(/\D/g, '');
      if (digits.length >= 10) {
        normalizedEmail = `${digits.slice(-10)}@fabstory.in`;
      } else {
        setErrorMessage('Please enter a valid admin email address.');
        return;
      }
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error) {
        if (error.message.toLowerCase().includes('email not confirmed')) {
          setErrorMessage(
            'Admin email is not yet confirmed in Supabase Auth. Please check your verification email.'
          );
        } else if (
          error.message.toLowerCase().includes('invalid login credentials') ||
          error.message.toLowerCase().includes('invalid credentials')
        ) {
          setErrorMessage(
            'Invalid credentials. Please verify your administrator email and password.'
          );
        } else {
          setErrorMessage(error.message);
        }
        setIsSubmitting(false);
        return;
      }

      if (data.session) {
        if (onSuccess) {
          onSuccess();
        } else {
          router.replace(redirectUrl);
          router.refresh();
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'An unexpected authentication error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F4EE] flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12 relative overflow-hidden font-sans">
      {/* Subtle Background Ambience */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#C7A66A]/10 rounded-full blur-[120px] pointer-events-none -z-0" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#23484A]/10 rounded-full blur-[120px] pointer-events-none -z-0" />

      {/* Main Luxury Split-Card Container */}
      <div className="w-full max-w-4xl bg-white rounded-2xl md:rounded-3xl shadow-[0_20px_60px_-15px_rgba(35,72,74,0.12)] border border-[#E5E0D8]/90 overflow-hidden flex flex-col md:flex-row relative z-10">
        
        {/* ============================================================ */}
        {/* LEFT COLUMN: Editorial Atelier Imagery & Brand Story (Desktop) */}
        {/* ============================================================ */}
        <div className="hidden md:flex md:w-[46%] relative bg-[#1B383A] overflow-hidden flex-col justify-between p-8 lg:p-10 text-white">
          {/* Background Fashion Imagery with Rich Atelier Vignette */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/craftsmanship.jpg"
              alt="Fabstory Haute Couture Craftsmanship"
              fill
              priority
              sizes="50vw"
              className="object-cover object-center opacity-65 scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#142A2C] via-[#1B383A]/80 to-[#1B383A]/60" />
            <div className="absolute inset-0 bg-radial from-transparent via-[#142A2C]/50 to-[#0F1E20]/90" />
          </div>

          {/* Top-Left Botanical Filigree */}
          <div className="relative z-10 pointer-events-none -ml-3 -mt-3">
            <BotanicalCorner className="w-28 h-28 text-[#C7A66A]" />
          </div>

          {/* Center Brand Identity & Privileges */}
          <div className="relative z-10 my-auto text-center space-y-4 py-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-[#C7A66A]/40 text-[#FAF6EE] text-[11px] uppercase tracking-[0.25em] font-medium mx-auto shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C7A66A]" />
              <span>Admin Portal</span>
            </div>

            <div className="space-y-2">
              <h2
                style={{
                  color: '#FFFFFF',
                  textShadow: '0 2px 12px rgba(0,0,0,0.9), 0 0 30px rgba(0,0,0,0.7)',
                }}
                className="font-serif text-3xl lg:text-4xl !text-white font-medium tracking-wide leading-tight drop-shadow-md"
              >
                Storefront CMS & Operations
              </h2>
              <p
                style={{
                  color: '#F1F5F9',
                  textShadow: '0 1px 6px rgba(0,0,0,0.8)',
                }}
                className="text-xs !text-slate-100 font-light tracking-wide max-w-xs mx-auto drop-shadow-sm"
              >
                Bespoke Order Management, Real-time Analytics & Media Management
              </p>
            </div>

            <div className="flex justify-center pt-2">
              <GoldOrnament className="w-24 h-5 text-[#C7A66A]" />
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* RIGHT COLUMN: Luxury Administrative Login Console            */}
        {/* ============================================================ */}
        <div className="w-full md:w-[54%] bg-white flex flex-col justify-between p-7 sm:p-9 lg:p-12">
          
          {/* Top Brand Header */}
          <div>
            <div className="flex flex-col items-center text-center mb-6 sm:mb-8">
              {/* Circular Gold-Bordered Logo Badge */}
              <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#C7A66A]/60 bg-white p-1 shadow-md mb-3 transition-transform hover:scale-105">
                <Image
                  src="/logo.png"
                  alt={BRAND.fullName}
                  fill
                  sizes="64px"
                  className="object-contain p-0.5"
                  priority
                />
              </div>

              {/* Brand Typography */}
              <div className="space-y-0.5">
                <span className="font-serif text-xl sm:text-2xl font-bold tracking-[0.2em] text-[#1C3F3A] uppercase block">
                  {BRAND.name}
                </span>
                <span className="text-[10px] uppercase tracking-[0.3em] text-[#C7A66A] font-semibold block">
                  — {BRAND.subBrand} —
                </span>
              </div>

              <div className="mt-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#1C3F3A]/5 border border-[#1C3F3A]/15 text-[#1C3F3A] text-[10px] font-semibold tracking-wider uppercase">
                  <ShieldCheck className="w-3 h-3 text-[#C7A66A]" />
                  Admin Control Center
                </span>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {/* Credentials Form */}
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {/* Email / Identifier */}
              <div className="space-y-1.5">
                <label
                  htmlFor="admin-email"
                  className="block text-[11px] font-semibold text-[#1C3F3A] uppercase tracking-wider"
                >
                  Admin Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6F7775]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="admin-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="admin@fabstorybyfasna.com"
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-[#FAF8F5] hover:bg-[#F5F1EA] focus:bg-white text-sm text-[#243234] border border-[#E5E0D8] rounded-xl focus:outline-none focus:border-[#C7A66A] focus:ring-2 focus:ring-[#C7A66A]/20 transition-all placeholder:text-[#6F7775]/50"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label
                  htmlFor="admin-password"
                  className="block text-[11px] font-semibold text-[#1C3F3A] uppercase tracking-wider"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6F7775]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-11 py-2.5 sm:py-3 bg-[#FAF8F5] hover:bg-[#F5F1EA] focus:bg-white text-sm text-[#243234] border border-[#E5E0D8] rounded-xl focus:outline-none focus:border-[#C7A66A] focus:ring-2 focus:ring-[#C7A66A]/20 transition-all placeholder:text-[#6F7775]/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#6F7775] hover:text-[#1C3F3A] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 sm:py-3.5 px-5 bg-[#1C3F3A] hover:bg-[#142D2A] text-white text-xs font-semibold uppercase tracking-[0.15em] rounded-xl border border-[#C7A66A]/40 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 pt-3"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#C7A66A]" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#C7A66A]" />
                    <span>Sign In to Admin Portal</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer Backlink & Trust Badge */}
          <div className="mt-8 pt-5 border-t border-[#E5E0D8]/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6F7775] hover:text-[#1C3F3A] transition-colors group"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
              <span>Back to Storefront</span>
            </Link>

            <span className="text-[10px] text-[#6F7775]/75">
              Encrypted Supabase Auth Session
            </span>
          </div>

        </div>

      </div>
    </div>
  );
}
