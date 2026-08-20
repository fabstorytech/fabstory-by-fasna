'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, User, Heart, ShoppingBag, Menu, ChevronDown } from 'lucide-react';
import { NAV_ITEMS, BRAND } from '@/lib/constants';
import MobileNav from './MobileNav';

interface HeaderProps {
  cartCount?: number;
  wishlistCount?: number;
}

export default function Header({ cartCount = 2, wishlistCount: initialWishlistCount }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [wishlistCount, setWishlistCount] = useState(initialWishlistCount || 0);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    const updateWishlistFromStorage = () => {
      try {
        const saved = localStorage.getItem('fabstory_wishlist');
        if (saved) {
          const list = JSON.parse(saved);
          setWishlistCount(list.length);
        } else {
          setWishlistCount(0);
        }
      } catch {
        setWishlistCount(0);
      }
    };

    updateWishlistFromStorage();

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('wishlist-updated', updateWishlistFromStorage);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wishlist-updated', updateWishlistFromStorage);
    };
  }, []);

  return (
    <>
      {/* DESKTOP HEADER (lg:flex) */}
      <header
        className={`hidden lg:flex sticky top-0 z-50 h-20 md:h-24 items-center transition-colors duration-300 ${
          isScrolled
            ? 'bg-[#F8F5EF]/95 backdrop-blur-md border-b border-[#E5E0D8] shadow-2xs'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="container-wide w-full flex items-center justify-between px-4 sm:px-6 lg:px-12">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center group relative z-10 shrink-0">
            <div
              className={`w-16 h-16 sm:w-20 sm:h-20 lg:w-22 lg:h-22 rounded-full overflow-hidden border border-[#C7A66A] bg-white p-1.5 shadow-sm transition-transform duration-300 group-hover:scale-105 ${
                isScrolled ? 'scale-90' : 'scale-100'
              }`}
            >
              <div className="relative w-full h-full">
                <Image
                  src="/logo.png"
                  alt={BRAND.fullName}
                  fill
                  sizes="88px"
                  className="object-contain p-0.5"
                  priority
                />
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="flex items-center justify-center gap-6 xl:gap-8 mx-auto px-4">
            {NAV_ITEMS.map((item) => (
              <div
                key={item.label}
                className="relative py-2"
                onMouseEnter={() => item.children && setActiveDropdown(item.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={item.href}
                  className={`flex items-center gap-1 text-xs xl:text-[13px] font-bold uppercase tracking-[0.16em] transition-colors py-1 relative ${
                    item.label === 'HOME'
                      ? 'text-[#23484A] border-b-2 border-[#23484A]'
                      : 'text-[#243234] hover:text-[#23484A]'
                  }`}
                >
                  {item.label}
                  {item.children && <ChevronDown className="w-3 h-3 text-[#718887]" />}
                </Link>

                {/* Dropdown Menu */}
                {item.children && activeDropdown === item.label && (
                  <div className="absolute top-full left-0 w-48 bg-white border border-[#E5E0D8] shadow-lg py-2 rounded-xs z-50 animate-fade-in">
                    {item.children.map((sub) => (
                      <Link
                        key={sub.label}
                        href={sub.href}
                        className="block px-4 py-2 text-xs text-[#243234] hover:bg-[#F8F5EF] hover:text-[#23484A] transition-colors"
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-3.5 sm:gap-4 md:gap-5 shrink-0">
            <button
              aria-label="Search products"
              className="text-[#243234] hover:text-[#23484A] transition-colors p-1"
            >
              <Search className="w-5 h-5 stroke-[1.75]" />
            </button>

            <Link
              href="/account"
              aria-label="Account"
              className="hidden sm:block text-[#243234] hover:text-[#23484A] transition-colors p-1"
            >
              <User className="w-5 h-5 stroke-[1.75]" />
            </Link>

            <Link
              href="/account"
              aria-label="Wishlist"
              className="relative text-[#243234] hover:text-[#23484A] transition-colors p-1"
            >
              <Heart className={`w-4 h-4 sm:w-5 sm:h-5 stroke-[1.75] ${wishlistCount > 0 ? 'fill-[#C7A66A] text-[#C7A66A]' : ''}`} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#C7A66A] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link
              href="/cart"
              aria-label="Shopping Cart"
              className="relative text-[#243234] hover:text-[#23484A] transition-colors p-1"
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.75]" />
              <span className="absolute -top-1 -right-1 bg-[#23484A] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* MOBILE HEADER (lg:hidden) */}
      <header
        className={`lg:hidden sticky top-0 z-50 w-full transition-all duration-300 bg-[#F8F5EF] border-b border-[#E5E0D8] ${
          isScrolled ? 'h-[56px]' : 'h-[62px]'
        } flex items-center justify-between px-3.5`}
      >
        {/* Left: Mobile Logo Badge */}
        <Link href="/" className="flex items-center">
          <div
            className={`rounded-full overflow-hidden border border-[#C7A66A]/40 bg-white p-0.5 shadow-2xs transition-all duration-300 ${
              isScrolled ? 'w-10 h-10' : 'w-12 h-12'
            }`}
          >
            <div className="relative w-full h-full">
              <Image
                src="/logo.png"
                alt={BRAND.fullName}
                fill
                sizes="48px"
                className="object-contain p-0.5 scale-105"
                priority
              />
            </div>
          </div>
        </Link>

        {/* Right Mobile Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button aria-label="Search" className="text-[#243234] hover:text-[#23484A] p-2 min-w-[40px] flex items-center justify-center">
            <Search className="w-5 h-5 stroke-[1.75]" />
          </button>
          <Link href="/account" aria-label="Wishlist" className="relative text-[#243234] hover:text-[#23484A] p-2 min-w-[40px] flex items-center justify-center">
            <Heart className={`w-5 h-5 stroke-[1.75] ${wishlistCount > 0 ? 'fill-[#C7A66A] text-[#C7A66A]' : ''}`} />
            {wishlistCount > 0 && (
              <span className="absolute top-0.5 right-0.5 bg-[#C7A66A] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-2xs">
                {wishlistCount}
              </span>
            )}
          </Link>
          <Link href="/cart" aria-label="Cart" className="relative text-[#243234] hover:text-[#23484A] p-2 min-w-[40px] flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 stroke-[1.75]" />
            <span className="absolute top-0.5 right-0.5 bg-[#23484A] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-2xs">
              {cartCount}
            </span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open Menu"
            className="text-[#243234] hover:text-[#23484A] p-2 min-w-[40px] flex items-center justify-center ml-0.5"
          >
            <Menu className="w-6 h-6 stroke-[1.75]" />
          </button>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      <MobileNav isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  );
}
