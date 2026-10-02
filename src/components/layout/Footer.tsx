'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  MapPin,
  Phone,
  Mail,
  ArrowUpRight,
  ChevronDown,
  ArrowUp,
  Sparkles,
  Check,
  Scissors,
  Truck,
  MessageCircle,
} from 'lucide-react';
import { BRAND } from '@/lib/constants';

function InstagramIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function FacebookIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function YouTubeIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

export default function Footer() {
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({});
  const [email, setEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setSubscribeStatus('loading');
    setTimeout(() => {
      setSubscribeStatus('success');
      setEmail('');
    }, 600);
  };

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="relative bg-[#162A2B] text-[#E4DFD7] border-t border-[#C7A66A]/20 overflow-hidden font-sans">
      {/* Subtle Luxury Ambient Glow */}
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#C7A66A]/10 rounded-full blur-3xl pointer-events-none translate-y-1/2 z-0" />

      {/* --- Section 1: VIP Newsletter & Quick Consultation --- */}
      <div className="relative border-b border-[#2A494B]">
        <div className="container-main py-6 md:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
            {/* Left: Newsletter Pitch */}
            <div className="lg:col-span-6 space-y-1 relative z-10">
              <div className="flex items-center gap-1.5 text-[#D4B97E] text-[11px] font-bold tracking-[0.18em] uppercase">
                <Sparkles className="w-3 h-3 text-[#D4B97E]" />
                <span>The Fabstory Circle</span>
              </div>
              <h3
                className="font-serif text-lg md:text-xl font-semibold tracking-wide !text-[#FDFBF7]"
                style={{ color: '#FDFBF7' }}
              >
                Sewing Fabulous Stories, Together
              </h3>
              <p className="text-[11px] md:text-xs text-[#CBD8D7] max-w-md leading-relaxed">
                Subscribe for private previews of new fabrics, custom tailoring slots, and styling edits.
              </p>
            </div>

            {/* Right: Newsletter Input & WhatsApp Quick Button */}
            <div className="lg:col-span-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <form onSubmit={handleSubscribe} className="flex-1 flex items-center relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  disabled={subscribeStatus === 'success'}
                  className="w-full h-9.5 pl-3.5 pr-24 rounded-xs bg-[#1F3A3B] border border-[#34595B] text-xs text-white placeholder-[#859998] focus:outline-none focus:border-[#C7A66A] transition-all disabled:opacity-75"
                />
                <button
                  type="submit"
                  disabled={subscribeStatus === 'loading' || subscribeStatus === 'success'}
                  className="absolute right-1 top-1 bottom-1 px-3 rounded-xs bg-[#C7A66A] text-[#162A2B] hover:bg-[#D4B97E] font-bold text-[11px] tracking-wider uppercase transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-90"
                >
                  {subscribeStatus === 'loading' ? (
                    <span className="inline-block w-3.5 h-3.5 border-2 border-[#162A2B] border-t-transparent rounded-full animate-spin" />
                  ) : subscribeStatus === 'success' ? (
                    <>
                      <Check className="w-3 h-3 stroke-[2.5]" />
                      <span>Joined</span>
                    </>
                  ) : (
                    <span>Join</span>
                  )}
                </button>
              </form>

              {/* Direct Stylist Consult Link */}
              <a
                href={BRAND.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="h-9.5 px-3.5 rounded-xs bg-[#1F3A3B] hover:bg-[#254648] border border-[#34595B] hover:border-[#C7A66A]/60 text-xs font-semibold text-[#F8F5EF] inline-flex items-center justify-center gap-1.5 transition-all shrink-0 group"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#25D366] group-hover:scale-110 transition-transform" />
                <span>Chat with Stylist</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* --- Section 2: Main Footer Navigation & Brand Pillars --- */}
      <div className="container-main py-8 md:py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Brand Info Column (Col 1-4 on desktop) */}
          <div className="lg:col-span-4 space-y-3.5">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[#C7A66A]/60 bg-white p-0.5 shadow-xs group-hover:border-[#C7A66A] transition-colors">
                <Image
                  src="/logo.png"
                  alt={BRAND.fullName}
                  fill
                  className="object-contain p-0.5"
                />
              </div>
              <div>
                <span className="font-serif text-lg font-semibold tracking-wider text-white block leading-tight">
                  {BRAND.name}
                </span>
                <span className="text-[9px] uppercase tracking-[0.25em] text-[#C7A66A] block font-semibold">
                  {BRAND.subBrand}
                </span>
              </div>
            </Link>

            <p className="text-[11px] text-[#A5B3B2] max-w-sm leading-relaxed">
              {BRAND.description}
            </p>

            {/* Atelier Highlights */}
            <div className="space-y-1 text-[11px] text-[#CBD8D7]">
              <div className="flex items-center gap-2">
                <Scissors className="w-3 h-3 text-[#C7A66A] shrink-0" />
                <span>Tailored with Love & Precision in Kerala</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-3 h-3 text-[#C7A66A] shrink-0" />
                <span>All India Express Shipping</span>
              </div>
            </div>

            {/* Social Pill: Instagram Badge & Direct Links */}
            <div className="pt-1 flex flex-wrap items-center gap-2">
              <a
                href={BRAND.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1F3A3B] border border-[#C7A66A]/40 text-white hover:bg-[#C7A66A] hover:text-[#162A2B] hover:border-[#C7A66A] transition-all group shadow-2xs"
              >
                <InstagramIcon className="w-3 h-3 text-[#C7A66A] group-hover:text-[#162A2B] transition-colors" />
                <span className="text-[11px] font-bold tracking-wide">{BRAND.instagramHandle}</span>
                <span className="text-[9px] px-1.5 rounded-full bg-[#162A2B]/40 text-[#C7A66A] group-hover:bg-[#162A2B] group-hover:text-[#F8F5EF] font-semibold">
                  {BRAND.followersCount}
                </span>
                <ArrowUpRight className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100" />
              </a>

              {/* Social Channels Icons */}
              <div className="flex items-center gap-1.5 text-[#A5B3B2]">
                <a
                  href={BRAND.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="w-7 h-7 rounded-full bg-[#1F3A3B] hover:bg-[#25D366] hover:text-white border border-[#34595B] flex items-center justify-center transition-all"
                >
                  <MessageCircle className="w-3 h-3" />
                </a>
                <a
                  href={BRAND.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-7 h-7 rounded-full bg-[#1F3A3B] hover:bg-[#E4405F] hover:text-white border border-[#34595B] flex items-center justify-center transition-all"
                >
                  <InstagramIcon className="w-3 h-3" />
                </a>
                <a
                  href={BRAND.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-7 h-7 rounded-full bg-[#1F3A3B] hover:bg-[#1877F2] hover:text-white border border-[#34595B] flex items-center justify-center transition-all"
                >
                  <FacebookIcon className="w-3 h-3" />
                </a>
                <a
                  href={BRAND.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="w-7 h-7 rounded-full bg-[#1F3A3B] hover:bg-[#FF0000] hover:text-white border border-[#34595B] flex items-center justify-center transition-all"
                >
                  <YouTubeIcon className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Collections */}
          <div className="lg:col-span-2 border-b border-[#2A494B]/80 pb-3 md:border-b-0 md:pb-0">
            <button
              type="button"
              onClick={() => toggleSection('shop')}
              className="w-full flex items-center justify-between font-serif text-xs font-semibold tracking-[0.14em] uppercase !text-white py-1 md:py-0 md:mb-3 md:pointer-events-none text-left"
              style={{ color: '#FFFFFF' }}
            >
              <span className="flex items-center gap-1.5 !text-white" style={{ color: '#FFFFFF' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#C7A66A]" />
                COLLECTIONS
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 md:hidden text-[#C7A66A] transition-transform duration-200 ${
                  openSections.shop ? 'rotate-180' : ''
                }`}
              />
            </button>
            <div className={`transition-all duration-200 md:!block ${openSections.shop ? 'block pt-1 pb-1' : 'hidden md:block'}`}>
              <ul className="space-y-1.5 text-xs">
                {[
                  { label: 'Custom Made Couture', href: '/custom-made' },
                  { label: 'Ready to Ship', href: '/shop?type=ready_stock' },
                  { label: 'Pure Fabrics', href: '/fabrics' },
                  { label: 'Anarkali & Suits', href: '/shop?category=dresses' },
                  { label: 'Abayas & Kaftans', href: '/shop?category=abaya' },
                ].map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-[#A5B3B2] hover:text-[#C7A66A] inline-block transition-all">
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/shop" className="text-[#C7A66A] font-semibold hover:text-white inline-block transition-all pt-0.5 text-[11px]">
                    All Designs →
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Column 3: Client Care */}
          <div className="lg:col-span-3 border-b border-[#2A494B]/80 pb-3 md:border-b-0 md:pb-0">
            <button
              type="button"
              onClick={() => toggleSection('help')}
              className="w-full flex items-center justify-between font-serif text-xs font-semibold tracking-[0.14em] uppercase !text-white py-1 md:py-0 md:mb-3 md:pointer-events-none text-left"
              style={{ color: '#FFFFFF' }}
            >
              <span className="flex items-center gap-1.5 !text-white" style={{ color: '#FFFFFF' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#C7A66A]" />
                CLIENT CARE
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 md:hidden text-[#C7A66A] transition-transform duration-200 ${
                  openSections.help ? 'rotate-180' : ''
                }`}
              />
            </button>
            <div className={`transition-all duration-200 md:!block ${openSections.help ? 'block pt-1 pb-1' : 'hidden md:block'}`}>
              <ul className="space-y-1.5 text-xs">
                {[
                  { label: 'How Custom Orders Work', href: '/how-it-works' },
                  { label: 'Measurement & Size Guide', href: '/size-guide' },
                  { label: 'Track Your Order', href: '/track-order' },
                  { label: 'Our Story & Atelier', href: '/about' },
                  { label: 'FAQs & Support', href: '/contact#faq' },
                  { label: 'My Account & Wishlist', href: '/account' },
                ].map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-[#A5B3B2] hover:text-[#C7A66A] inline-block transition-all">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Column 4: Atelier Contact */}
          <div className="lg:col-span-3 border-b border-[#2A494B]/80 pb-3 md:border-b-0 md:pb-0">
            <button
              type="button"
              onClick={() => toggleSection('contact')}
              className="w-full flex items-center justify-between font-serif text-xs font-semibold tracking-[0.14em] uppercase !text-white py-1 md:py-0 md:mb-3 md:pointer-events-none text-left"
              style={{ color: '#FFFFFF' }}
            >
              <span className="flex items-center gap-1.5 !text-white" style={{ color: '#FFFFFF' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#C7A66A]" />
                ATELIER CONTACT
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 md:hidden text-[#C7A66A] transition-transform duration-200 ${
                  openSections.contact ? 'rotate-180' : ''
                }`}
              />
            </button>
            <div className={`transition-all duration-200 md:!block ${openSections.contact ? 'block pt-1 pb-1' : 'hidden md:block'}`}>
              <ul className="space-y-2.5 text-xs text-[#CBD8D7]">
                <li>
                  <a
                    href={BRAND.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-2 hover:text-[#C7A66A] transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-[#25D366] shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <div>
                      <span className="block font-medium text-white group-hover:text-[#C7A66A]">WhatsApp Inquiry</span>
                      <span className="text-[10px] text-[#8EA09F]">{BRAND.whatsappDisplay}</span>
                    </div>
                  </a>
                </li>
                <li>
                  <a
                    href={`tel:${BRAND.phone.replace(/\s+/g, '')}`}
                    className="group flex items-start gap-2 hover:text-[#C7A66A] transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#C7A66A] shrink-0 mt-0.5" />
                    <div>
                      <span className="block font-medium text-white group-hover:text-[#C7A66A]">{BRAND.phone}</span>
                      <span className="text-[10px] text-[#8EA09F]">Mon – Sat: 10 AM – 7 PM</span>
                    </div>
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${BRAND.email}`}
                    className="group flex items-start gap-2 hover:text-[#C7A66A] transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#C7A66A] shrink-0 mt-0.5" />
                    <div>
                      <span className="block font-medium text-white group-hover:text-[#C7A66A] truncate">{BRAND.email}</span>
                      <span className="text-[10px] text-[#8EA09F]">Client Support</span>
                    </div>
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#C7A66A] shrink-0 mt-0.5" />
                  <div>
                    <span className="block font-medium text-white">Kerala, India</span>
                    <span className="text-[10px] text-[#8EA09F]">All India Shipping</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* --- Bottom Bar & Legal --- */}
        <div className="mt-8 pt-5 border-t border-[#2A494B] flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-[#8EA09F]">
          {/* Copyright */}
          <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-3 text-center sm:text-left">
            <p>
              © {new Date().getFullYear()} <span className="text-white font-medium">Fabstory by Fasna</span>. All rights reserved.
            </p>
            <span className="hidden sm:inline text-[#3D6365]">•</span>
            <p className="text-[10px]">
              Crafted by{' '}
              <a
                href="https://ekodrix.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#C7A66A] font-semibold hover:text-white transition-colors underline-offset-4 hover:underline"
              >
                Ekodrix
              </a>
            </p>
          </div>

          {/* Payment Badges */}
          <div className="flex items-center gap-1.5 flex-wrap justify-center text-[9px] font-bold text-[#CBD8D7]">
            {['PhonePe', 'VISA', 'Mastercard', 'RuPay'].map((p) => (
              <span key={p} className="px-2 py-0.5 bg-[#1F3A3B] border border-[#34595B] rounded-xs shadow-2xs">
                {p}
              </span>
            ))}
          </div>

          {/* Scroll to Top */}
          <button
            onClick={scrollToTop}
            aria-label="Back to top"
            className="flex items-center gap-1 text-[11px] text-[#CBD8D7] hover:text-[#C7A66A] px-2.5 py-1 rounded-full bg-[#1F3A3B] border border-[#34595B] hover:border-[#C7A66A]/60 transition-all cursor-pointer group"
          >
            <span>Top</span>
            <ArrowUp className="w-3 h-3 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </footer>
  );
}
