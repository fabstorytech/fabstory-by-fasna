import Image from 'next/image';
import { BRAND } from '@/lib/constants';
import { CheckCircle2, ArrowUpRight } from 'lucide-react';

function InstagramIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

export default function InstagramShowcase() {
  const instagramPosts = [
    {
      id: 1,
      image: '/images/products/product-1.jpg',
      likes: '1.2k',
      caption: 'Floral Anarkali crafted with love and delicate embroidery ✨',
    },
    {
      id: 2,
      image: '/images/products/product-2.jpg',
      likes: '940',
      caption: 'Graceful Embroidered Abaya in premium linen 🧵',
    },
    {
      id: 3,
      image: '/images/products/product-3.jpg',
      likes: '1.5k',
      caption: 'Pastel Kurti Set — Everyday elegance curated for women 🌸',
    },
    {
      id: 4,
      image: '/images/products/product-4.jpg',
      likes: '2.1k',
      caption: 'Sharara Set for festive celebrations • Worldwide shipping 🌍',
    },
    {
      id: 5,
      image: '/images/products/product-5.jpg',
      likes: '880',
      caption: 'Flowing Kaftan dress — Tailored with detail by Fasna 💖',
    },
    {
      id: 6,
      image: '/images/products/product-6.jpg',
      likes: '1.8k',
      caption: 'Contemporary party wear dress designed for special moments ✨',
    },
  ];

  return (
    <section className="py-12 md:py-20 bg-[#F8F5EF] border-t border-[#E5E0D8]">
      <div className="container-main">
        {/* Instagram Profile Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#C7A66A]/30 shadow-2xs">
            <InstagramIcon className="w-4 h-4 text-[#23484A]" />
            <span className="text-xs font-bold text-[#23484A] tracking-wide">
              {BRAND.instagramHandle}
            </span>
            <CheckCircle2 className="w-3.5 h-3.5 text-[#C7A66A] fill-[#C7A66A]/20" />
            <span className="text-[10px] font-semibold text-[#6F7775] pl-1 border-l border-[#E5E0D8]">
              {BRAND.followersCount} Followers
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#23484A] font-medium tracking-tight">
            Follow Our Story on Instagram
          </h2>

          {/* Bio Highlights Pills */}
          <div className="flex flex-wrap justify-center gap-2 pt-1 text-xs text-[#243234]">
            {BRAND.bioHighlights.map((highlight, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-white/80 border border-[#E5E0D8] rounded-full text-[11px] font-medium shadow-2xs"
              >
                {highlight}
              </span>
            ))}
          </div>

          <div className="pt-2">
            <a
              href={BRAND.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#23484A] hover:bg-[#1A3536] text-white text-xs font-semibold uppercase tracking-[0.16em] px-6 py-3 rounded-xs shadow-2xs transition-colors"
            >
              <span>Follow @fabstory_by_fasna</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* 6-Photo Instagram Gallery Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {instagramPosts.map((post) => (
            <a
              key={post.id}
              href={BRAND.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square bg-[#F2EDE4] overflow-hidden rounded-xs border border-[#E5E0D8] block"
            >
              <Image
                src={post.image}
                alt={post.caption}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
              />

              {/* Hover Overlay with Likes & Instagram Icon */}
              <div className="absolute inset-0 bg-[#23484A]/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-3 text-white text-center">
                <InstagramIcon className="w-6 h-6 mb-2 text-white" />
                <span className="text-xs font-bold">{post.likes} Likes</span>
                <p className="text-[10px] line-clamp-2 mt-1 opacity-90 font-sans">
                  {post.caption}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
