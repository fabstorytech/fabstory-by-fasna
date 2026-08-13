'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getSiteSettings, SiteSettings } from '@/lib/supabase/services';

export default function Hero() {
  const [settings, setSettings] = useState<SiteSettings>({
    id: 'default',
    heroDesktopImage: '/images/hero-latest.jpg',
    heroMobileImage: '/images/hero-mobile.jpg',
    heroTitle: 'Where Style Meets Your Story',
    heroSubtitle: 'Specially curated for Women',
  });

  useEffect(() => {
    getSiteSettings().then((data) => {
      if (data) {
        setSettings(data);
      }
    });
  }, []);

  const desktopImg = settings.heroDesktopImage || '/images/hero-latest.jpg';
  const title = settings.heroTitle || 'Where Style Meets Your Story';
  const subtitle = settings.heroSubtitle || 'Specially curated for Women';

  return (
    <section className="relative min-h-[520px] sm:min-h-[580px] md:min-h-[640px] lg:min-h-[700px] flex items-center overflow-hidden -mt-28 sm:-mt-32 md:-mt-36 pt-28 sm:pt-32 md:pt-36 border-b border-[#E5E0D8]">
      {/* Background Image (User's Exact Background Artwork Blending Under Transparent Header) */}
      <div className="absolute inset-0 z-0">
        <Image
          src={desktopImg}
          alt={title}
          fill
          priority
          sizes="100vw"
          className="object-cover object-top sm:object-center"
        />
        {/* Soft mobile gradient overlay for 100% crisp text legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#F4EFE6]/95 via-[#F4EFE6]/75 to-transparent lg:hidden" />
      </div>

      {/* Hero Content Overlay */}
      <div className="container-wide w-full px-4 sm:px-6 lg:px-12 py-10 md:py-20 lg:py-24 z-10 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Text & CTA Area */}
          <div className="lg:col-span-6 space-y-5 sm:space-y-6 md:space-y-8 max-w-lg lg:max-w-xl text-left">
            <div className="space-y-3 sm:space-y-4">
              <span className="text-xs uppercase tracking-[0.25em] text-[#C7A66A] font-semibold block">
                FABSTORY BY FASNA
              </span>
              <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl text-[#23484A] leading-[1.08] font-medium tracking-tight">
                {title}
              </h1>

              <div className="flex items-center gap-3 sm:gap-4 pt-1 sm:pt-2">
                <div className="w-[2px] h-7 sm:h-8 bg-[#23484A]/60" />
                <p className="text-sm sm:text-base md:text-lg text-[#243234] font-sans font-semibold">
                  {subtitle}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/shop"
                className="btn bg-[#23484A] hover:bg-[#1A3536] text-white px-6 sm:px-8 py-3 sm:py-3.5 text-xs font-semibold uppercase tracking-[0.18em] border border-[#23484A] shadow-xs inline-block"
              >
                EXPLORE COLLECTION
              </Link>
              <Link
                href="/custom-made"
                className="btn border-[#23484A] text-[#23484A] hover:bg-[#23484A] hover:text-white px-6 sm:px-8 py-3 sm:py-3.5 text-xs font-semibold uppercase tracking-[0.18em] transition-colors inline-block"
              >
                CREATE YOUR LOOK
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
