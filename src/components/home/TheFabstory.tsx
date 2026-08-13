import Link from 'next/link';
import Image from 'next/image';
import { BRAND } from '@/lib/constants';

export default function TheFabstory() {
  return (
    <section className="section-padding bg-[#F8F5EF] border-b border-[#E5E0D8]">
      <div className="container-main">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Artisan/Sewing Image */}
          <div className="lg:col-span-6 relative">
            <div className="relative aspect-[4/3] md:aspect-[14/10] w-full rounded-sm overflow-hidden border border-[#E5E0D8] shadow-md">
              <Image
                src="/images/craftsmanship.jpg"
                alt="Craftsmanship at Fabstory by Fasna"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>

          {/* Right Brand Story Card */}
          <div className="lg:col-span-6 bg-white p-8 md:p-12 border border-[#E5E0D8] relative space-y-6">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl text-[#23484A]">
                The Fabstory
              </h2>
              <span className="text-xs uppercase tracking-[0.25em] text-[#C7A66A] font-semibold block mt-1">
                {BRAND.subBrand}
              </span>
            </div>

            <p className="text-sm text-[#6F7775] leading-relaxed">
              Every stitch has a story. Every outfit is a reflection of your personality. At Fabstory by Fasna, we don&apos;t just create outfits — we create memories.
            </p>

            <div>
              <Link
                href="/about"
                className="btn btn-secondary border-[#23484A] text-[#23484A] text-xs font-semibold px-8 py-3 uppercase tracking-wider hover:bg-[#23484A] hover:text-white"
              >
                READ OUR STORY
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
