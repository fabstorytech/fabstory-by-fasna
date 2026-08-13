'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Category } from '@/types';
import { getCategories } from '@/lib/supabase/services';
import { MOCK_CATEGORIES } from '@/lib/constants';

export default function ShopByCategory() {
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);

  useEffect(() => {
    getCategories().then((data) => {
      if (data && data.length > 0) {
        setCategories(data);
      }
    });
  }, []);

  return (
    <section className="section-padding bg-white border-b border-[#E5E0D8]">
      <div className="container-main space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <h2 className="font-serif text-3xl md:text-4xl text-[#23484A]">
              Shop by Category
            </h2>
            <p className="text-xs text-[#6F7775] mt-1">
              Choose from our most loved collections
            </p>
          </div>
          <Link
            href="/shop"
            className="btn border border-[#23484A] text-[#23484A] text-xs font-semibold px-6 py-2 uppercase tracking-wider hover:bg-[#23484A] hover:text-white transition-colors"
          >
            VIEW ALL
          </Link>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.slug}`}
              className="group flex flex-col items-center text-center space-y-3"
            >
              <div className="relative aspect-[3/4] w-full bg-[#F8F5EF] overflow-hidden border border-[#E5E0D8]">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <h3 className="font-serif text-base text-[#243234] group-hover:text-[#23484A] transition-colors leading-tight">
                {cat.name}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
