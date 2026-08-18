'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getSiteSettings, SiteSettings } from '@/lib/supabase/services';

export default function Hero() {
  const [settings, setSettings] = useState<SiteSettings>({
    id: 'default',
    heroDesktopImage: '/images/hero-latest.jpg',
    heroMobileImage: '/images/mobileview/fabstore-mobilebanner.png',
    heroTitle: 'Where Style Meets Your Story',
    heroSubtitle: 'Specially curated for Women',
  });

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    getSiteSettings().then((data) => {
      if (data) {
        setSettings(data);
      }
    });
  }, []);

  const desktopImg1 = settings.heroDesktopImage || '/images/hero-latest.jpg';
  const mobileImg1 =
    settings.heroMobileImage && settings.heroMobileImage !== '/images/hero-mobile.jpg'
      ? settings.heroMobileImage
      : '/images/mobileview/fabstore-mobilebanner1.png';
  const mobileImg2 = '/images/mobileview/fabstore-mobilebanner2.png';
  const mobileImg3 = '/images/mobileview/fabstore-mobileview3.png';
  const title1 = settings.heroTitle || 'Where Style Meets Your Story';
  const subtitle1 = settings.heroSubtitle || 'Specially curated for Women';

  const slides = [
    {
      id: 1,
      desktopImage: desktopImg1,
      mobileImage: mobileImg1,
      tag: 'FABSTORY BY FASNA',
      title: title1,
      subtitle: subtitle1,
      primaryCta: { text: 'EXPLORE COLLECTION', href: '/shop' },
      secondaryCta: { text: 'CREATE YOUR LOOK', href: '/custom-made' },
    },
    {
      id: 2,
      desktopImage: '/images/mobileview/fabstore-banner2.png',
      mobileImage: mobileImg2,
      tag: 'NEW SEASON COLLECTION',
      title: 'Crafted with Love & Detail',
      subtitle: 'Timeless Occasion Wear & Bespoke Couture',
      primaryCta: { text: 'SHOP NEW ARRIVALS', href: '/shop' },
      secondaryCta: { text: 'CUSTOM STITCHING', href: '/custom-made' },
    },
    {
      id: 3,
      desktopImage: '/images/mobileview/fabstore-banner3.png',
      mobileImage: mobileImg3,
      tag: 'ELEGANT STYLES',
      title: 'Designed for Every Moment',
      subtitle: 'Curated luxury & handcrafted elegance',
      primaryCta: { text: 'DISCOVER MORE', href: '/shop' },
      secondaryCta: { text: 'BOOK CONSULTATION', href: '/custom-made' },
    },
  ];

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // Automatic slide swap every 3.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 3500);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <section className="relative min-h-[520px] sm:min-h-[580px] md:min-h-[640px] lg:min-h-[700px] flex items-center overflow-hidden -mt-28 sm:-mt-32 md:-mt-36 pt-28 sm:pt-32 md:pt-36 border-b border-[#E5E0D8] group">
      {/* Background Images with Crossfade */}
      <div className="absolute inset-0 z-0">
        {slides.map((slide, idx) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${currentSlide === idx ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
          >
            {/* Desktop Banner Image */}
            <div className="hidden sm:block absolute inset-0">
              <Image
                src={slide.desktopImage}
                alt={slide.title}
                fill
                priority={idx === 0}
                sizes="100vw"
                className="object-cover object-top sm:object-center"
              />
            </div>
            {/* Mobile Banner Image */}
            <div className="block sm:hidden absolute inset-0">
              <Image
                src={slide.mobileImage}
                alt={slide.title}
                fill
                priority={idx === 0}
                sizes="100vw"
                className="object-cover object-top"
              />
            </div>
            {/* Soft mobile gradient overlay for 100% crisp text legibility */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#F4EFE6]/95 via-[#F4EFE6]/75 to-transparent lg:hidden" />
          </div>
        ))}
      </div>

      {/* Hero Content Overlay */}
      <div className="container-wide w-full px-4 sm:px-6 lg:px-12 py-10 md:py-20 lg:py-24 z-20 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Text & CTA Area */}
          <div className="lg:col-span-6 space-y-5 sm:space-y-6 md:space-y-8 max-w-lg lg:max-w-xl text-left">
            <div className="space-y-3 sm:space-y-4 min-h-[140px] sm:min-h-[170px] flex flex-col justify-center">
              <span className="text-xs uppercase tracking-[0.25em] text-[#C7A66A] font-semibold block transition-all duration-300">
                {slides[currentSlide].tag}
              </span>
              <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl text-[#23484A] leading-[1.08] font-medium tracking-tight transition-all duration-300">
                {slides[currentSlide].title}
              </h1>

              <div className="flex items-center gap-3 sm:gap-4 pt-1 sm:pt-2">
                <div className="w-[2px] h-7 sm:h-8 bg-[#23484A]/60" />
                <p className="text-sm sm:text-base md:text-lg text-[#243234] font-sans font-semibold transition-all duration-300">
                  {slides[currentSlide].subtitle}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href={slides[currentSlide].primaryCta.href}
                className="btn bg-[#23484A] hover:bg-[#1A3536] text-white px-6 sm:px-8 py-3 sm:py-3.5 text-xs font-semibold uppercase tracking-[0.18em] border border-[#23484A] shadow-xs inline-block"
              >
                {slides[currentSlide].primaryCta.text}
              </Link>
              <Link
                href={slides[currentSlide].secondaryCta.href}
                className="btn border-[#23484A] text-[#23484A] hover:bg-[#23484A] hover:text-white px-6 sm:px-8 py-3 sm:py-3.5 text-xs font-semibold uppercase tracking-[0.18em] transition-colors inline-block"
              >
                {slides[currentSlide].secondaryCta.text}
              </Link>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
