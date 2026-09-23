import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, Scissors, Heart } from 'lucide-react';
import { BRAND } from '@/lib/constants';

export default function TheFabstory() {
  return (
    <section className="section-padding bg-[#F8F5EF] border-b border-[#E5E0D8] overflow-hidden">
      <div className="container-main">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch shadow-xl rounded-sm overflow-hidden border border-[#E5E0D8]">

          {/* Left: Full-bleed Image with decorative overlay */}
          <div className="lg:col-span-6 relative">
            <div className="relative aspect-[4/5] sm:aspect-[3/2] lg:aspect-auto lg:h-full min-h-[420px] w-full">
              <Image
                src="/images/craftsmanship.jpg"
                alt="Craftsmanship at Fabstory by Fasna"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-top"
                priority
              />
              {/* Gradient overlay for text legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#162A2B]/60 via-transparent to-transparent" />

              {/* Bottom-left floating badge */}
              <div className="absolute bottom-5 left-5 flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2">
                <Scissors className="w-3.5 h-3.5 text-[#C7A66A]" />
                <span className="text-white text-[10px] font-bold uppercase tracking-[0.18em]">
                  Handcrafted in Kerala
                </span>
              </div>
            </div>
          </div>

          {/* Right: Brand Story Panel */}
          <div className="lg:col-span-6 bg-white relative flex flex-col justify-center px-8 md:px-14 py-12 md:py-16">
            {/* Decorative corner accent */}
            <div className="absolute top-0 right-0 w-28 h-28 bg-[#F8F5EF] rounded-bl-full opacity-60" />

            <div className="relative space-y-6">
              {/* Label */}
              <div className="flex items-center gap-2">
                <span className="w-8 h-px bg-[#C7A66A]" />
                <span className="text-[10px] uppercase tracking-[0.28em] text-[#C7A66A] font-bold">
                  Our Story
                </span>
              </div>

              {/* Heading */}
              <div>
                <h2 className="font-serif text-4xl md:text-5xl text-[#23484A] leading-tight">
                  The Fabstory
                </h2>
                <span className="text-xs uppercase tracking-[0.28em] text-[#C7A66A] font-semibold block mt-2">
                  {BRAND.subBrand}
                </span>
              </div>

              {/* Divider */}
              <div className="w-12 h-0.5 bg-[#E5E0D8]" />

              {/* Body */}
              <p className="text-sm md:text-[15px] text-[#6F7775] leading-relaxed max-w-sm">
                Every stitch has a story. Every outfit is a reflection of your personality.
                At Fabstory by Fasna, we don&apos;t just create outfits — we create{' '}
                <span className="text-[#23484A] font-medium italic">memories.</span>
              </p>

              {/* Highlights */}
              <div className="flex flex-wrap gap-4 text-xs text-[#718887]">
                <div className="flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-[#C7A66A] fill-[#C7A66A]" />
                  <span>Made with love</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Scissors className="w-3.5 h-3.5 text-[#C7A66A]" />
                  <span>Custom tailored</span>
                </div>
              </div>

              {/* CTA */}
              <div>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2.5 bg-[#23484A] text-white text-xs font-bold px-7 py-3.5 uppercase tracking-[0.16em] hover:bg-[#1A3536] transition-colors group rounded-xs"
                >
                  <span>Read Our Story</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
