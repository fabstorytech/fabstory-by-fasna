'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, Eye } from 'lucide-react';
import type { Product } from '@/types';
import { formatPrice } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export default function ProductCard({ product, onQuickView }: ProductCardProps) {
  const mainImage = product.images[0]?.url || '/images/products/product-1.jpg';

  return (
    <div className="group relative flex flex-col bg-white border border-[#E5E0D8]/60 hover:border-[#23484A]/30 transition-all duration-300">
      {/* Product Type Badge — Left */}
      <div className="absolute top-2.5 left-2.5 z-10">
        <span
          className={`text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.14em] px-2 py-0.5 rounded-2xs shadow-2xs backdrop-blur-xs block ${
            product.type === 'CUSTOM'
              ? 'bg-[#23484A]/90 text-white border border-white/10'
              : product.type === 'READY_STOCK'
              ? 'bg-[#718887]/90 text-white border border-white/10'
              : 'bg-[#C7A66A]/90 text-white border border-white/10'
          }`}
        >
          {product.type === 'CUSTOM'
            ? 'Custom Made'
            : product.type === 'READY_STOCK'
            ? 'Ready to Ship'
            : 'Fabric'}
        </span>
      </div>

      {/* Top-Right Action Buttons: Quick View Eye Icon + Wishlist Heart Icon */}
      <div className="absolute top-2.5 right-2.5 z-10 flex flex-col gap-1.5">
        {/* Quick View Eye Icon */}
        <button
          onClick={() => onQuickView && onQuickView(product)}
          aria-label="Quick View"
          className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-[#243234] hover:text-[#23484A] hover:bg-white transition-all shadow-xs"
        >
          <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[1.75]" />
        </button>

        {/* Wishlist Heart Icon */}
        <button
          aria-label="Add to wishlist"
          className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-[#243234] hover:text-[#23484A] hover:bg-white transition-all shadow-xs"
        >
          <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[1.75]" />
        </button>
      </div>

      {/* Product Image */}
      <Link href={`/shop/${product.slug}`} className="product-image-wrapper block aspect-[3/4] relative bg-[#F8F5EF] overflow-hidden">
        <Image
          src={mainImage}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
        />
      </Link>

      {/* Product Content — Pro UI/UX E-Commerce Layout */}
      <div className="p-2.5 sm:p-3.5 flex flex-col flex-1 bg-white space-y-1.5 sm:space-y-2">
        {/* Muted Category Tag */}
        <span className="text-[10px] sm:text-xs text-[#6F7775] font-sans block">
          {product.type === 'CUSTOM' ? 'Custom Collection' : 'New Arrivals'}
        </span>

        {/* Product Title — line-clamp-2 for full readable product names without truncation */}
        <Link href={`/shop/${product.slug}`} className="block min-h-[32px] sm:min-h-[40px]">
          <h3 className="font-sans text-xs sm:text-sm font-semibold text-[#243234] group-hover:text-[#23484A] transition-colors leading-snug line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {/* Pricing */}
        <div className="flex items-center gap-1.5 sm:gap-2 pt-0.5">
          <span className="text-xs sm:text-sm font-bold text-[#243234]">
            {formatPrice(product.price)}
          </span>
          {product.compareAtPrice && (
            <span className="text-[10px] sm:text-xs text-[#6F7775] line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>

        {/* Action Button: Select options */}
<div className="pt-1 sm:pt-2 mt-auto">
<div className="pt-1 sm:pt-2 mt-auto">
  <Link
    href={`/shop/${product.slug}`}
    className="w-full bg-[#23484A] hover:bg-[#1A3536] text-white text-[7px] sm:text-[8px] font-semibold py-1 sm:py-1.5 px-2 text-center block transition-colors tracking-[0.08em] uppercase shadow-sm rounded-[8px]"
  >
    SELECT OPTIONS
  </Link>
</div>

        </div>
      </div>
    </div>
  );
}
