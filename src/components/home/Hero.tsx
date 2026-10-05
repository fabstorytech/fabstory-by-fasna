'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getSiteSettings, SiteSettings, DEFAULT_SITE_SETTINGS } from '@/lib/supabase/services';

interface HeroProps {
  initialSettings?: SiteSettings;
}

export default function Hero({ initialSettings }: HeroProps) {
  const [settings, setSettings] = useState<SiteSettings>(() => {
    if (initialSettings && initialSettings.heroDesktopImage && initialSettings.heroDesktopImage.trim() !== '') {
      return initialSettings;
    }
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('fabstory_site_settings');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.heroDesktopImage && parsed.heroDesktopImage.trim() !== '') return parsed;
        }
      } catch (_) {}
    }
    return initialSettings || DEFAULT_SITE_SETTINGS;
  });

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    getSiteSettings().then((data) => {
      if (data) {
        setSettings(data);
      }
    });
  }, []);

  const defaultDesktop = '/images/hero-new.jpg';
  const defaultMobile = '/images/hero-mobile.jpg';

  const desktopImg1 =
    settings.heroDesktopImage && settings.heroDesktopImage.trim() !== '' && settings.heroDesktopImage !== 'REMOVED'
      ? settings.heroDesktopImage
      : defaultDesktop;

  const mobileImg1 =
    settings.heroMobileImage && settings.heroMobileImage.trim() !== '' && settings.heroMobileImage !== 'REMOVED'
      ? settings.heroMobileImage
      : (desktopImg1 || defaultMobile);

  const desktopImg2 = settings.heroDesktopImage2;
  const mobileImg2 = settings.heroMobileImage2;
  const desktopImg3 = settings.heroDesktopImage3;
  const mobileImg3 = settings.heroMobileImage3;

  const title1 = settings.heroTitle || 'Where Style Meets Your Story';
  const subtitle1 = settings.heroSubtitle || 'Specially curated for Women';
  const title2 = settings.heroTitle2 || 'Crafted with Love & Detail';
  const subtitle2 = settings.heroSubtitle2 || 'Timeless Occasion Wear & Bespoke Couture';
  const title3 = settings.heroTitle3 || 'Designed for Every Moment';
  const subtitle3 = settings.heroSubtitle3 || 'Curated luxury & handcrafted elegance';

  // Construct active slides dynamically - only include slides that have valid, non-empty, non-deleted images
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

  // Slide 1 (Primary Showcase)
  if (
    settings.slide1Active !== false &&
    desktopImg1 &&
    desktopImg1 !== 'REMOVED'
  ) {
    activeSlides.push({
      id: 1,
      desktopImage: desktopImg1,
      mobileImage: mobileImg1 && mobileImg1 !== 'REMOVED' ? mobileImg1 : desktopImg1,
      tag: 'FABSTORY BY FASNA',
      title: title1,
      subtitle: subtitle1,
      primaryCta: { text: 'EXPLORE COLLECTION', href: '/shop' },
      secondaryCta: { text: 'CREATE YOUR LOOK', href: '/custom-made' },
    });
  }

  // Slide 2 (New Arrivals)
  if (
    settings.slide2Active !== false &&
    desktopImg2 &&
    desktopImg2.trim() !== '' &&
    desktopImg2 !== 'REMOVED'
  ) {
    activeSlides.push({
      id: 2,
      desktopImage: desktopImg2,
      mobileImage: mobileImg2 && mobileImg2.trim() !== '' && mobileImg2 !== 'REMOVED' ? mobileImg2 : desktopImg2,
      tag: 'NEW SEASON COLLECTION',
      title: title2,
      subtitle: subtitle2,
      primaryCta: { text: 'SHOP NEW ARRIVALS', href: '/shop' },
      secondaryCta: { text: 'CUSTOM STITCHING', href: '/custom-made' },
    });
  }

  // Slide 3 (Occasion Wear)
  if (
    settings.slide3Active !== false &&
    desktopImg3 &&
    desktopImg3.trim() !== '' &&
    desktopImg3 !== 'REMOVED'
  ) {
    activeSlides.push({
      id: 3,
      desktopImage: desktopImg3,
      mobileImage: mobileImg3 && mobileImg3.trim() !== '' && mobileImg3 !== 'REMOVED' ? mobileImg3 : desktopImg3,
      tag: 'ELEGANT STYLES',
      title: title3,
      subtitle: subtitle3,
      primaryCta: { text: 'DISCOVER MORE', href: '/shop' },
      secondaryCta: { text: 'BOOK CONSULTATION', href: '/custom-made' },
    });
  }

  // Fallback to minimal placeholder ONLY if all custom slides are removed
  const slides = activeSlides.length > 0 ? activeSlides : [
    {
      id: 1,
      desktopImage: defaultDesktop,
      mobileImage: defaultMobile,
      tag: 'FABSTORY BY FASNA',
      title: title1 || 'Where Style Meets Your Story',
      subtitle: subtitle1 || 'Specially curated for Women',
      primaryCta: { text: 'EXPLORE COLLECTION', href: '/shop' },
      secondaryCta: { text: 'CREATE YOUR LOOK', href: '/custom-made' },
    },
  ];

  const nextSlide = useCallback(() => {
    if (slides.length <= 1) return;
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    if (slides.length <= 1) return;
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // Automatic slide swap every 3.5 seconds (only when multi-slide)
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 3500);
    return () => clearInterval(timer);
  }, [nextSlide, slides.length]);

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
            {/* Desktop Banner Image */}
            {slide.desktopImage ? (
              <div className="hidden sm:block absolute inset-0">
                <Image
                  src={slide.desktopImage}
                  alt={slide.title}
                  fill
                  priority={idx === 0}
                  sizes="100vw"
                  unoptimized={slide.desktopImage.startsWith('http')}
                  className="object-cover object-top sm:object-center"
                />
              </div>
            ) : (
              <div className="hidden sm:block absolute inset-0 bg-gradient-to-r from-[#F8F5EF] via-[#F4EFE6] to-[#EDE7DC]" />
            )}
            {/* Mobile Banner Image */}
            {slide.mobileImage || slide.desktopImage ? (
              <div className="block sm:hidden absolute inset-0">
                <Image
                  src={slide.mobileImage || slide.desktopImage}
                  alt={slide.title}
                  fill
                  priority={idx === 0}
                  sizes="100vw"
                  unoptimized={(slide.mobileImage || slide.desktopImage).startsWith('http')}
                  className="object-cover object-top"
                />
              </div>
            ) : (
              <div className="block sm:hidden absolute inset-0 bg-gradient-to-b from-[#F8F5EF] to-[#EDE7DC]" />
            )}
            {/* Soft mobile gradient overlay for 100% crisp text legibility */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#F4EFE6]/95 via-[#F4EFE6]/75 to-transparent lg:hidden" />
          </div>
        ))}
      </div>

      {/* Hero Content Overlay */}
      {(() => {
        const activeSlide = slides[currentSlide % slides.length] || slides[0];
        return (
          <div className="container-wide w-full px-4 sm:px-6 lg:px-12 py-10 md:py-20 lg:py-24 z-20 relative">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Text & CTA Area */}
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
    </section>
  );
}
