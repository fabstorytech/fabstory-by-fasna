'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import {
  Search,
  User,
  Heart,
  ShoppingBag,
  Menu,
  ChevronDown,
  Check,
  Scissors,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { NAV_ITEMS, BRAND } from '@/lib/constants';
import { getCart } from '@/lib/cart';
import { supabase } from '@/lib/supabase/client';
import MobileNav from './MobileNav';
import HeaderSearchBar from './HeaderSearchBar';

interface HeaderProps {
  cartCount?: number;
  wishlistCount?: number;
}

export default function Header({ cartCount: initialCartCount, wishlistCount: initialWishlistCount }: HeaderProps) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [wishlistCount, setWishlistCount] = useState(initialWishlistCount || 0);
  const [cartCount, setCartCount] = useState(initialCartCount ?? 0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  const handleMouseEnter = (label: string) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setActiveDropdown(label);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 180);
  };

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

    const updateCartFromStorage = () => {
      try {
        const items = getCart();
        setCartCount(items.reduce((sum, item) => sum + item.quantity, 0));
      } catch {
        setCartCount(0);
      }
    };

    // Check Supabase session (single check, no excessive tokens)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setIsLoggedIn(true);
        setUserName(session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Account');
      } else {
        setIsLoggedIn(false);
        setUserName(null);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setIsLoggedIn(true);
        setUserName(session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Account');
      } else {
        setIsLoggedIn(false);
        setUserName(null);
      }
    });

    updateWishlistFromStorage();
    updateCartFromStorage();

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('wishlist-updated', updateWishlistFromStorage);
    window.addEventListener('cart-updated', updateCartFromStorage);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wishlist-updated', updateWishlistFromStorage);
      window.removeEventListener('cart-updated', updateCartFromStorage);
      subscription.unsubscribe();
    };
  }, []);

  return (
    <>
      <div className="sticky top-0 z-50 w-full">
        {/* DESKTOP HEADER (lg:flex) */}
        <header
          className={`hidden lg:flex h-20 md:h-24 items-center transition-colors duration-300 ${isScrolled || searchOpen
              ? 'bg-[#F8F5EF]/95 backdrop-blur-md border-b border-[#E5E0D8] shadow-2xs'
              : 'bg-transparent border-b border-transparent'
            }`}
        >
          <div className="container-wide w-full flex items-center justify-between px-4 sm:px-6 lg:px-12">
            {/* Brand Logo */}
            <Link href="/" className="flex items-center group relative z-10 shrink-0">
              <div
                className={`w-16 h-16 sm:w-20 sm:h-20 lg:w-22 lg:h-22 rounded-full overflow-hidden border border-[#C7A66A] bg-white p-1.5 shadow-sm transition-transform duration-300 group-hover:scale-105 ${isScrolled ? 'scale-90' : 'scale-100'
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
              {NAV_ITEMS.map((item) => {
                const isActive =
                  item.href === '/'
                    ? pathname === '/'
                    : pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

                return (
                  <div
                    key={item.label}
                    className="relative py-3"
                    onMouseEnter={() => item.children && handleMouseEnter(item.label)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <Link
                      href={item.href}
                      className={`flex items-center gap-1.5 text-xs xl:text-[13px] font-bold uppercase tracking-[0.16em] transition-colors py-1 relative border-b-2 ${
                        isActive
                          ? 'text-[#23484A] border-[#23484A]'
                          : 'text-[#243234] hover:text-[#23484A] border-transparent'
                      }`}
                    >
                      <span>{item.label}</span>
                      {item.children && (
                        <ChevronDown
                          className={`w-3 h-3 text-[#718887] transition-transform duration-200 ${
                            activeDropdown === item.label ? 'rotate-180 text-[#23484A]' : ''
                          }`}
                        />
                      )}
                    </Link>

                    {/* SHOP MEGA DROPDOWN */}
                    {item.label === 'SHOP' && activeDropdown === 'SHOP' && (
                      <div
                        className="absolute top-full left-1/2 -translate-x-1/2 w-[580px] xl:w-[620px] bg-white/98 backdrop-blur-md border border-[#E5E0D8] border-t-2 border-t-[#C7A66A] shadow-2xl rounded-b-md p-5 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                        onMouseEnter={() => handleMouseEnter('SHOP')}
                        onMouseLeave={handleMouseLeave}
                      >
                        <div className="grid grid-cols-12 gap-5">
                          {/* Left 7 cols: Categories & Silhouettes */}
                          <div className="col-span-7 space-y-3">
                            <div className="flex items-center justify-between border-b border-[#E5E0D8]/80 pb-2">
                              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C7A66A]">
                                Curated Silhouettes
                              </span>
                              <Link
                                href="/shop"
                                onClick={() => setActiveDropdown(null)}
                                className="text-[11px] font-semibold text-[#23484A] hover:underline flex items-center gap-1 group/link"
                              >
                                <span>All Outfits</span>
                                <ArrowRight className="w-3 h-3 text-[#23484A] group-hover/link:translate-x-0.5 transition-transform" />
                              </Link>
                            </div>

                            <div className="grid grid-cols-2 gap-1.5">
                              {item.children?.map((sub) => (
                                <Link
                                  key={sub.label}
                                  href={sub.href}
                                  onClick={() => setActiveDropdown(null)}
                                  className="group/item flex flex-col p-2 rounded-2xs hover:bg-[#F8F5EF] transition-all border border-transparent hover:border-[#E5E0D8]"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-[#243234] group-hover/item:text-[#23484A] transition-colors">
                                      {sub.label}
                                    </span>
                                    <ArrowRight className="w-3 h-3 text-[#C7A66A] opacity-0 -translate-x-1 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all" />
                                  </div>
                                  <span className="text-[10px] text-[#8C9B9A] group-hover/item:text-[#6F7775] transition-colors line-clamp-1">
                                    {sub.label === 'Dresses' && 'Flowy silhouettes & evening gowns'}
                                    {sub.label === 'Anarkali' && 'Grand flare festive couture'}
                                    {sub.label === 'Abaya' && 'Modest & contemporary cuts'}
                                    {sub.label === 'Kurti' && 'Handcrafted daily luxury'}
                                    {sub.label === 'Sets' && 'Coordinated statement sets'}
                                    {sub.label === 'All Products' && 'Browse full boutique catalog'}
                                  </span>
                                </Link>
                              ))}
                            </div>

                            <div className="pt-2 border-t border-[#E5E0D8]/60 flex items-center justify-between">
                              <Link
                                href="/shop?type=ready_stock"
                                onClick={() => setActiveDropdown(null)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#23484A]/5 hover:bg-[#23484A]/10 text-[#23484A] text-[11px] font-semibold transition-colors"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-[#C7A66A]" />
                                <span>Ready to Ship • Dispatched in 24-48 hrs</span>
                              </Link>
                            </div>
                          </div>

                          {/* Right 5 cols: Bespoke Stitching Spotlight Card */}
                          <div className="col-span-5 bg-[#FAF8F5] border border-[#E5E0D8] rounded-2xs p-4 flex flex-col justify-between shadow-2xs">
                            <div className="space-y-2">
                              <div className="w-8 h-8 rounded-full bg-white border border-[#C7A66A]/40 flex items-center justify-center text-[#C7A66A] shadow-2xs">
                                <Scissors className="w-4 h-4" />
                              </div>
                              <div>
                                <span className="text-[9px] uppercase tracking-[0.2em] text-[#C7A66A] font-bold block">
                                  Bespoke Studio
                                </span>
                                <h4 className="font-serif text-sm font-semibold text-[#23484A] leading-snug">
                                  Custom Made Outfits
                                </h4>
                              </div>
                              <p className="text-[11px] text-[#6F7775] leading-relaxed">
                                Share your custom measurements or reference design for handcrafted atelier tailoring.
                              </p>
                            </div>

                            <Link
                              href="/custom-made"
                              onClick={() => setActiveDropdown(null)}
                              className="mt-3 w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-[#23484A] hover:bg-[#1A3536] text-white text-[11px] font-semibold uppercase tracking-wider rounded-2xs transition-colors shadow-2xs group/btn"
                            >
                              <span>Customize Look</span>
                              <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* FABRICS MEGA DROPDOWN */}
                    {item.label === 'FABRICS' && activeDropdown === 'FABRICS' && (
                      <div
                        className="absolute top-full left-1/2 -translate-x-1/2 w-[540px] xl:w-[580px] bg-white/98 backdrop-blur-md border border-[#E5E0D8] border-t-2 border-t-[#C7A66A] shadow-2xl rounded-b-md p-5 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                        onMouseEnter={() => handleMouseEnter('FABRICS')}
                        onMouseLeave={handleMouseLeave}
                      >
                        <div className="grid grid-cols-12 gap-5">
                          {/* Left 7 cols: Pure Fabric Materials */}
                          <div className="col-span-7 space-y-3">
                            <div className="flex items-center justify-between border-b border-[#E5E0D8]/80 pb-2">
                              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C7A66A]">
                                Pure Textiles & Cuts
                              </span>
                              <Link
                                href="/fabrics"
                                onClick={() => setActiveDropdown(null)}
                                className="text-[11px] font-semibold text-[#23484A] hover:underline flex items-center gap-1 group/link"
                              >
                                <span>All Fabrics</span>
                                <ArrowRight className="w-3 h-3 text-[#23484A] group-hover/link:translate-x-0.5 transition-transform" />
                              </Link>
                            </div>

                            <div className="grid grid-cols-2 gap-1.5">
                              {item.children?.map((sub) => (
                                <Link
                                  key={sub.label}
                                  href={sub.href}
                                  onClick={() => setActiveDropdown(null)}
                                  className="group/item flex flex-col p-2 rounded-2xs hover:bg-[#F8F5EF] transition-all border border-transparent hover:border-[#E5E0D8]"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-[#243234] group-hover/item:text-[#23484A] transition-colors">
                                      {sub.label}
                                    </span>
                                    <ArrowRight className="w-3 h-3 text-[#C7A66A] opacity-0 -translate-x-1 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all" />
                                  </div>
                                  <span className="text-[10px] text-[#8C9B9A] group-hover/item:text-[#6F7775] transition-colors line-clamp-1">
                                    {sub.label === 'Cotton' && 'Mulmul & luxury breathable cotton'}
                                    {sub.label === 'Linen' && 'Natural airy textures & organic weave'}
                                    {sub.label === 'Silk' && 'Rich royal sheen for festivities'}
                                    {sub.label === 'Chiffon' && 'Delicate sheer & flowy drape'}
                                    {sub.label === 'Georgette' && 'Graceful fluid silhouettes'}
                                    {sub.label === 'All Fabrics' && 'Shop premium running yardage'}
                                  </span>
                                </Link>
                              ))}
                            </div>

                            <div className="pt-2 border-t border-[#E5E0D8]/60 flex items-center justify-between text-[11px] text-[#6F7775]">
                              <span>📏 Sold by the meter • Direct from weavers</span>
                            </div>
                          </div>

                          {/* Right 5 cols: Fabric + Stitching Combo Card */}
                          <div className="col-span-5 bg-[#FAF8F5] border border-[#E5E0D8] rounded-2xs p-4 flex flex-col justify-between shadow-2xs">
                            <div className="space-y-2">
                              <div className="w-8 h-8 rounded-full bg-white border border-[#C7A66A]/40 flex items-center justify-center text-[#C7A66A] shadow-2xs">
                                <Layers className="w-4 h-4" />
                              </div>
                              <div>
                                <span className="text-[9px] uppercase tracking-[0.2em] text-[#C7A66A] font-bold block">
                                  Atelier Combo
                                </span>
                                <h4 className="font-serif text-sm font-semibold text-[#23484A] leading-snug">
                                  Fabric + Tailoring
                                </h4>
                              </div>
                              <p className="text-[11px] text-[#6F7775] leading-relaxed">
                                Pick your favorite running fabric and get it custom stitched by Fasna&apos;s team.
                              </p>
                            </div>

                            <Link
                              href="/fabrics"
                              onClick={() => setActiveDropdown(null)}
                              className="mt-3 w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-[#23484A] hover:bg-[#1A3536] text-white text-[11px] font-semibold uppercase tracking-wider rounded-2xs transition-colors shadow-2xs group/btn"
                            >
                              <span>Browse Fabrics</span>
                              <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* GENERIC DROPDOWN */}
                    {item.label !== 'SHOP' && item.label !== 'FABRICS' && item.children && activeDropdown === item.label && (
                      <div
                        className="absolute top-full left-0 w-52 bg-white/98 backdrop-blur-md border border-[#E5E0D8] border-t-2 border-t-[#C7A66A] shadow-xl py-2 rounded-b-xs z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                        onMouseEnter={() => handleMouseEnter(item.label)}
                        onMouseLeave={handleMouseLeave}
                      >
                        {item.children.map((sub) => (
                          <Link
                            key={sub.label}
                            href={sub.href}
                            onClick={() => setActiveDropdown(null)}
                            className="block px-4 py-2 text-xs text-[#243234] hover:bg-[#F8F5EF] hover:text-[#23484A] transition-colors font-medium"
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Right Action Icons */}
            <div className="flex items-center gap-3.5 sm:gap-4 md:gap-5 shrink-0">
              <button
                onClick={() => setSearchOpen((prev) => !prev)}
                data-search-trigger="true"
                aria-label="Search products"
                className={`p-1.5 transition-colors cursor-pointer rounded-full ${searchOpen ? 'text-[#23484A] bg-[#E8E1D5]' : 'text-[#243234] hover:text-[#23484A]'
                  }`}
                title="Search products"
              >
                <Search className="w-5 h-5 stroke-[1.75]" />
              </button>

              <Link
                href={isLoggedIn ? '/account' : '/account/login'}
                aria-label={isLoggedIn ? `Account (${userName || 'Logged in'})` : 'Account Login'}
                className="hidden sm:flex items-center gap-1.5 text-[#243234] hover:text-[#23484A] transition-colors p-1 group"
                title={isLoggedIn ? `Logged in as ${userName}` : 'Sign In / Account'}
              >
                <div className="relative">
                  <User className="w-5 h-5 stroke-[1.75]" />
                  {isLoggedIn && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border border-white" />
                  )}
                </div>
                {isLoggedIn && userName && (
                  <span className="text-[11px] font-medium text-[#23484A] max-w-[80px] truncate hidden xl:inline-block">
                    {userName}
                  </span>
                )}
              </Link>

              <Link
                href="/wishlist"
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
          className={`lg:hidden w-full transition-all duration-300 bg-[#F8F5EF] border-b border-[#E5E0D8] ${isScrolled ? 'h-[56px]' : 'h-[62px]'
            } flex items-center justify-between px-3.5`}
        >
          {/* Left: Mobile Logo Badge */}
          <Link href="/" className="flex items-center">
            <div
              className={`rounded-full overflow-hidden border border-[#C7A66A]/60 bg-white p-0.5 shadow-2xs transition-all duration-300 ${
                isScrolled ? 'w-11 h-11' : 'w-13 h-13'
              }`}
            >
              <div className="relative w-full h-full flex items-center justify-center">
                <Image
                  src="/logo.png"
                  alt={BRAND.fullName}
                  fill
                  unoptimized
                  priority
                  className="object-contain scale-[1.32]"
                  style={{ imageRendering: '-webkit-optimize-contrast' }}
                />
              </div>
            </div>
          </Link>

          {/* Right Mobile Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setSearchOpen((prev) => !prev)}
              data-search-trigger="true"
              aria-label="Search"
              className={`p-2 min-w-[40px] flex items-center justify-center cursor-pointer transition-colors rounded-full ${searchOpen ? 'text-[#23484A] bg-[#E8E1D5]' : 'text-[#243234] hover:text-[#23484A]'
                }`}
              title="Search products"
            >
              <Search className="w-5 h-5 stroke-[1.75]" />
            </button>
            <Link href="/wishlist" aria-label="Wishlist" className="relative text-[#243234] hover:text-[#23484A] p-2 min-w-[40px] flex items-center justify-center">
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

        {/* Integrated Header Search Dropdown (Slides down from header, NOT a popup modal) */}
        <HeaderSearchBar isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      </div>

      {/* Mobile Drawer Navigation */}
      <MobileNav
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onOpenSearch={() => {
          setMobileMenuOpen(false);
          setSearchOpen(true);
        }}
      />
    </>
  );
}
