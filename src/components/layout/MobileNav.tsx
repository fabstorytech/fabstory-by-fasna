'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, ChevronDown, MessageCircle } from 'lucide-react';
import { BRAND } from '@/lib/constants';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const [shopOpen, setShopOpen] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="relative ml-auto w-full max-w-xs bg-[#F8F5EF] h-full shadow-2xl flex flex-col z-10 overflow-y-auto animate-fade-in">
        {/* Drawer Header */}
        <div className="p-4 border-b border-[#E5E0D8] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[#C7A66A] bg-white p-1">
              <Image src="/logo.png" alt={BRAND.fullName} fill className="object-contain p-0.5" />
            </div>
            <div>
              <span className="font-serif text-base font-semibold text-[#23484A] block leading-tight">
                {BRAND.name}
              </span>
              <span className="text-[9px] uppercase tracking-[0.2em] text-[#C7A66A] block font-medium">
                {BRAND.subBrand}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="p-1 text-[#243234] hover:text-[#23484A]"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="p-6 flex-1 space-y-4">
          <ul className="space-y-3 font-serif text-lg text-[#243234]">
            <li>
              <Link
                href="/"
                onClick={onClose}
                className="block hover:text-[#23484A] transition-colors py-1"
              >
                Home
              </Link>
            </li>

            {/* Shop Accordion */}
            <li className="border-b border-t border-[#E5E0D8]/60 py-2">
              <button
                onClick={() => setShopOpen(!shopOpen)}
                className="w-full flex items-center justify-between font-serif text-lg text-[#243234] hover:text-[#23484A]"
              >
                <span>Shop</span>
                <ChevronDown
                  className={`w-4 h-4 text-[#718887] transition-transform duration-300 ${
                    shopOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {shopOpen && (
                <ul className="pl-4 pt-3 pb-1 space-y-2.5 font-sans text-xs uppercase tracking-wider text-[#6F7775]">
                  <li>
                    <Link
                      href="/shop?type=ready_stock"
                      onClick={onClose}
                      className="block hover:text-[#23484A]"
                    >
                      Ready to Ship
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/custom-made"
                      onClick={onClose}
                      className="block hover:text-[#23484A]"
                    >
                      Custom Made
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/fabrics"
                      onClick={onClose}
                      className="block hover:text-[#23484A]"
                    >
                      Fabrics
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            <li>
              <Link
                href="/shop"
                onClick={onClose}
                className="block hover:text-[#23484A] transition-colors py-1"
              >
                Collections
              </Link>
            </li>

            <li>
              <Link
                href="/about"
                onClick={onClose}
                className="block hover:text-[#23484A] transition-colors py-1"
              >
                About
              </Link>
            </li>

            <li>
              <Link
                href="/contact"
                onClick={onClose}
                className="block hover:text-[#23484A] transition-colors py-1"
              >
                Contact
              </Link>
            </li>
          </ul>

          <div className="pt-6 border-t border-[#E5E0D8]">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C7A66A] block mb-3">
              CONNECT WITH US
            </span>

            <div className="flex items-center gap-4 text-xs font-semibold text-[#23484A]">
              <a
                href={BRAND.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-[#C7A66A]"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <span>Instagram</span>
              </a>

              <a
                href={BRAND.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-[#C7A66A]"
              >
                <MessageCircle className="w-4 h-4 text-[#23484A]" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
