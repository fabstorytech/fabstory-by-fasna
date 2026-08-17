'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, Mail, ArrowUpRight, ChevronDown } from 'lucide-react';
import { BRAND, FOOTER_LINKS } from '@/lib/constants';

function InstagramIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

export default function Footer() {
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({});

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <footer className="bg-[#FFFFFF] text-[#243234] border-t border-[#E5E0D8]">
      <div className="container-main py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 md:gap-8 lg:gap-12">
          {/* Brand Info & Instagram Bio Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3 group inline-block">
              <div className="relative w-16 h-16 rounded-full overflow-hidden border border-[#C7A66A]/30 bg-white p-1 shadow-xs">
                <Image
                  src="/logo.png"
                  alt={BRAND.fullName}
                  fill
                  className="object-contain p-1"
                />
              </div>
              <div>
                <span className="font-serif text-xl font-semibold tracking-wider text-[#23484A] block leading-tight">
                  {BRAND.name}
                </span>
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#C7A66A] block font-medium">
                  {BRAND.subBrand}
                </span>
              </div>
            </Link>

            <p className="text-xs text-[#6F7775] max-w-sm leading-relaxed">
              Where Style Meets Your Story • Specially curated for Women. Tailored with Love & Detail. Based in Kerala, shipping worldwide.
            </p>

            {/* Official Instagram Handle Badge */}
            <div className="pt-1">
              <a
                href={BRAND.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F8F5EF] border border-[#C7A66A]/40 text-[#23484A] hover:bg-[#23484A] hover:text-white transition-colors group shadow-2xs"
              >
                <InstagramIcon className="w-4 h-4 text-[#23484A] group-hover:text-white transition-colors" />
                <span className="text-xs font-bold tracking-wide">
                  {BRAND.instagramHandle}
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 ml-0.5" />
              </a>
            </div>
          </div>

          {/* Shop Column */}
          <div className="border-b border-[#E5E0D8]/60 pb-3 md:border-b-0 md:pb-0">
            <button
              type="button"
              onClick={() => toggleSection('shop')}
              className="w-full flex items-center justify-between font-sans text-xs font-bold uppercase tracking-[0.15em] text-[#23484A] py-1 md:py-0 md:mb-4 md:pointer-events-none text-left"
            >
              <span>SHOP</span>
              <ChevronDown
                className={`w-4 h-4 md:hidden text-[#23484A] transition-transform duration-200 ${
                  openSections.shop ? 'rotate-180' : ''
                }`}
              />
            </button>
            <div
              className={`transition-all duration-200 md:!block ${
                openSections.shop ? 'block pt-2 pb-1' : 'hidden md:block'
              }`}
            >
              <ul className="space-y-2.5">
                {FOOTER_LINKS.shop.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-xs text-[#6F7775] hover:text-[#23484A] transition-colors block py-0.5 md:py-0"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Help Column */}
          <div className="border-b border-[#E5E0D8]/60 pb-3 md:border-b-0 md:pb-0">
            <button
              type="button"
              onClick={() => toggleSection('help')}
              className="w-full flex items-center justify-between font-sans text-xs font-bold uppercase tracking-[0.15em] text-[#23484A] py-1 md:py-0 md:mb-4 md:pointer-events-none text-left"
            >
              <span>HELP</span>
              <ChevronDown
                className={`w-4 h-4 md:hidden text-[#23484A] transition-transform duration-200 ${
                  openSections.help ? 'rotate-180' : ''
                }`}
              />
            </button>
            <div
              className={`transition-all duration-200 md:!block ${
                openSections.help ? 'block pt-2 pb-1' : 'hidden md:block'
              }`}
            >
              <ul className="space-y-2.5">
                {FOOTER_LINKS.help.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-xs text-[#6F7775] hover:text-[#23484A] transition-colors block py-0.5 md:py-0"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact Column */}
          <div className="border-b border-[#E5E0D8]/60 pb-3 md:border-b-0 md:pb-0">
            <button
              type="button"
              onClick={() => toggleSection('contact')}
              className="w-full flex items-center justify-between font-sans text-xs font-bold uppercase tracking-[0.15em] text-[#23484A] py-1 md:py-0 md:mb-4 md:pointer-events-none text-left"
            >
              <span>CONTACT</span>
              <ChevronDown
                className={`w-4 h-4 md:hidden text-[#23484A] transition-transform duration-200 ${
                  openSections.contact ? 'rotate-180' : ''
                }`}
              />
            </button>
            <div
              className={`transition-all duration-200 md:!block ${
                openSections.contact ? 'block pt-2 pb-1' : 'hidden md:block'
              }`}
            >
              <ul className="space-y-3 text-xs text-[#6F7775]">
                <li className="flex items-center gap-2 py-0.5 md:py-0">
                  <Phone className="w-3.5 h-3.5 text-[#23484A] shrink-0" />
                  <span>+91 12345 67890</span>
                </li>
                <li className="flex items-center gap-2 py-0.5 md:py-0">
                  <Mail className="w-3.5 h-3.5 text-[#23484A] shrink-0" />
                  <span className="truncate">hello@fabstorybyfasna.com</span>
                </li>
                <li className="flex items-center gap-2 py-0.5 md:py-0">
                  <MapPin className="w-3.5 h-3.5 text-[#23484A] shrink-0" />
                  <span>Based in Kerala, India</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-[#E5E0D8] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6F7775]">
          <p>© {new Date().getFullYear()} Fabstory by Fasna. All rights reserved.</p>
          <div className="flex items-center gap-3 text-[10px] font-bold text-[#718887]">
            <span className="px-2 py-1 bg-[#F8F5EF] border border-[#E5E0D8] rounded-xs">VISA</span>
            <span className="px-2 py-1 bg-[#F8F5EF] border border-[#E5E0D8] rounded-xs">MC</span>
            <span className="px-2 py-1 bg-[#F8F5EF] border border-[#E5E0D8] rounded-xs">UPI</span>
            <span className="px-2 py-1 bg-[#F8F5EF] border border-[#E5E0D8] rounded-xs">PayPal</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
