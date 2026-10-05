'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getSiteSettings, SiteSettings, DEFAULT_SITE_SETTINGS } from '@/lib/supabase/services';

interface HeroProps {
  initialSettings?: SiteSettings;
}

/** Returns true only if the URL is a real uploaded image (Cloudinary or any http URL) */
function isAdminImage(url?: string): boolean {
  return !!(url && url.trim() !== '' && url !== 'REMOVED' && url.startsWith('http'));
}

export default function Hero({ initialSettings }: HeroProps) {
  const [settings, setSettings] = useState<SiteSettings>(initialSettings || DEFAULT_SITE_SETTINGS);
  const [loaded, setLoaded] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    // Always fetch fresh from Supabase on mount — admin-uploaded banners always win
    getSiteSettings().then((data) => {
      if (data) {
        setSettings(data);
        try {
          localStorage.setItem('fabstory_site_settings', JSON.stringify(data));
        } catch (_) {}
      }
      setLoaded(true);
    });
  }, []);

  // Build slides — ONLY include slides that have real admin-uploaded (http) images
  const activeSlides: Array<{
    id: number;
    desktopImage: string;
    mobileImage: string;
    tag: string;
    title: string;
    subtitle: string;
    primaryCta: { text: string; href: string };
    secondaryCta: { text: string; href: string };
  }> = [];

  // Slide 1
  if (settings.slide1Active !== false && isAdminImage(settings.heroDesktopImage)) {
    activeSlides.push({
      id: 1,
      desktopImage: settings.heroDesktopImage,
      mobileImage: isAdminImage(settings.heroMobileImage) ? settings.heroMobileImage! : settings.heroDesktopImage,
      tag: 'FABSTORY BY FASNA',
      title: settings.heroTitle || 'Where Style Meets Your Story',
      subtitle: settings.heroSubtitle || 'Specially curated for Women',
      primaryCta: { text: 'EXPLORE COLLECTION', href: '/shop' },
      secondaryCta: { text: 'CREATE YOUR LOOK', href: '/custom-made' },
    });
  }

  // Slide 2
  if (settings.slide2Active !== false && isAdminImage(settings.heroDesktopImage2)) {
    activeSlides.push({
      id: 2,
      desktopImage: settings.heroDesktopImage2!,
      mobileImage: isAdminImage(settings.heroMobileImage2) ? settings.heroMobileImage2! : settings.heroDesktopImage2!,
      tag: 'NEW SEASON COLLECTION',
      title: settings.heroTitle2 || 'Crafted with Love & Detail',
      subtitle: settings.heroSubtitle2 || 'Timeless Occasion Wear & Bespoke Couture',
      primaryCta: { text: 'SHOP NEW ARRIVALS', href: '/shop' },
      secondaryCta: { text: 'CUSTOM STITCHING', href: '/custom-made' },
    });
  }

  // Slide 3
  if (settings.slide3Active !== false && isAdminImage(settings.heroDesktopImage3)) {
    activeSlides.push({
      id: 3,
      desktopImage: settings.heroDesktopImage3!,
      mobileImage: isAdminImage(settings.heroMobileImage3) ? settings.heroMobileImage3! : settings.heroDesktopImage3!,
      tag: 'ELEGANT STYLES',
      title: settings.heroTitle3 || 'Designed for Every Moment',
      subtitle: settings.heroSubtitle3 || 'Curated luxury & handcrafted elegance',
      primaryCta: { text: 'DISCOVER MORE', href: '/shop' },
      secondaryCta: { text: 'BOOK CONSULTATION', href: '/custom-made' },
    });
  }

  const slides = activeSlides;

  const nextSlide = useCallback(() => {
    if (slides.length <= 1) return;
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    if (slides.length <= 1) return;
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(nextSlide, 3500);
    return () => clearInterval(timer);
  }, [nextSlide, slides.length]);

  // ── No admin banners uploaded yet ──────────────────────────────────────────
  if (loaded && slides.length === 0) {
    return (
      <section className="relative min-h-[520px] sm:min-h-[580px] md:min-h-[640px] lg:min-h-[700px] flex items-center overflow-hidden -mt-28 sm:-mt-32 md:-mt-36 pt-28 sm:pt-32 md:pt-36 border-b border-[#E5E0D8]">
        {/* Elegant gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#F4EFE6] via-[#EDE7DC] to-[#E5DDD0]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#23484A]/5 via-transparent to-[#C7A66A]/10" />

        <div className="container-wide w-full px-4 sm:px-6 lg:px-12 py-10 md:py-20 z-10 relative">
          <div className="max-w-xl space-y-6">
            <span className="text-[11px] sm:text-xs uppercase tracking-[0.22em] text-[#C7A66A] font-semibold block">
              FABSTORY BY FASNA
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-[#23484A] leading-[1.08] font-medium tracking-tight">
              {settings.heroTitle || 'Where Style Meets Your Story'}
            </h1>
            <div className="flex items-center gap-4">
              <div className="w-[2px] h-8 bg-[#23484A]/50 shrink-0" />
              <p className="text-base md:text-lg text-[#243234] font-semibold">
                {settings.heroSubtitle || 'Specially curated for Women'}
              </p>
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/shop" className="btn bg-[#23484A] hover:bg-[#1A3536] text-white px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] border border-[#23484A] shadow-xs inline-block">
                EXPLORE COLLECTION
              </Link>
              <Link href="/custom-made" className="btn border-[#23484A] text-[#23484A] hover:bg-[#23484A] hover:text-white px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] transition-colors inline-block">
                CREATE YOUR LOOK
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ── Slides not yet fetched — show minimal skeleton ─────────────────────────
  if (!loaded && slides.length === 0) {
    return (
      <section className="relative min-h-[520px] sm:min-h-[580px] md:min-h-[640px] lg:min-h-[700px] flex items-center overflow-hidden -mt-28 sm:-mt-32 md:-mt-36 pt-28 sm:pt-32 md:pt-36 border-b border-[#E5E0D8]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#F4EFE6] via-[#EDE7DC] to-[#E5DDD0] animate-pulse" />
      </section>
    );
  }

  // ── Admin banners available ─────────────────────────────────────────────────
  return (
    <section className="relative min-h-[520px] sm:min-h-[580px] md:min-h-[640px] lg:min-h-[700px] flex items-center overflow-hidden -mt-28 sm:-mt-32 md:-mt-36 pt-28 sm:pt-32 md:pt-36 border-b border-[#E5E0D8] group">
      {/* Background Images with Crossfade */}
      <div className="absolute inset-0 z-0">
        {slides.map((slide, idx) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              currentSlide === idx ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {/* Desktop Banner */}
            <div className="hidden sm:block absolute inset-0">
              <Image
                src={slide.desktopImage}
                alt={slide.title}
                fill
                priority={idx === 0}
                sizes="100vw"
                unoptimized
                className="object-cover object-center"
              />
            </div>
            {/* Mobile Banner */}
            <div className="block sm:hidden absolute inset-0">
              <Image
                src={slide.mobileImage}
                alt={slide.title}
                fill
                priority={idx === 0}
                sizes="100vw"
                unoptimized
                className="object-cover object-center"
              />
            </div>

          </div>
        ))}
      </div>

      {/* Hero Content Overlay */}
      {(() => {
        const activeSlide = slides[currentSlide % slides.length] || slides[0];
        return (
          <div className="container-wide w-full px-4 sm:px-6 lg:px-12 py-10 md:py-20 lg:py-24 z-20 relative">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 space-y-4 sm:space-y-6 md:space-y-8 max-w-[280px] xs:max-w-[340px] sm:max-w-lg lg:max-w-xl text-left">
                <div className="space-y-2.5 sm:space-y-4 min-h-[140px] sm:min-h-[170px] flex flex-col justify-center">
                  <span className="text-[11px] sm:text-xs uppercase tracking-[0.22em] text-[#C7A66A] font-semibold block transition-all duration-300">
                    {activeSlide.tag}
                  </span>
                  <h1 className="font-serif text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-[#23484A] leading-[1.12] sm:leading-[1.08] font-medium tracking-tight transition-all duration-300 [text-wrap:balance] whitespace-pre-line max-w-[260px] xs:max-w-[320px] sm:max-w-none">
                    {activeSlide.title}
                  </h1>
                  <div className="flex items-start sm:items-center gap-2.5 sm:gap-4 pt-1 sm:pt-2">
                    <div className="w-[2px] h-6 sm:h-8 bg-[#23484A]/60 shrink-0 mt-0.5 sm:mt-0" />
                    <p className="text-xs sm:text-base md:text-lg text-[#243234] font-sans font-semibold transition-all duration-300 [text-wrap:balance] whitespace-pre-line max-w-[240px] xs:max-w-[300px] sm:max-w-none">
                      {activeSlide.subtitle}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2.5 sm:gap-3 pt-1 sm:pt-2">
                  <Link
                    href={activeSlide.primaryCta.href}
                    className="btn bg-[#23484A] hover:bg-[#1A3536] text-white px-5 sm:px-8 py-2.5 sm:py-3.5 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.18em] border border-[#23484A] shadow-xs inline-block"
                  >
                    {activeSlide.primaryCta.text}
                  </Link>
                  <Link
                    href={activeSlide.secondaryCta.href}
                    className="btn border-[#23484A] text-[#23484A] hover:bg-[#23484A] hover:text-white px-5 sm:px-8 py-2.5 sm:py-3.5 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.18em] transition-colors inline-block"
                  >
                    {activeSlide.secondaryCta.text}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Slide dots — only show when multiple slides */}
      {slides.length > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-30">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                currentSlide === idx ? 'bg-[#23484A] w-5' : 'bg-[#23484A]/30'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
