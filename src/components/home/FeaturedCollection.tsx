'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/products/ProductCard';
import type { Product } from '@/types';
import { getProducts } from '@/lib/supabase/services';
import { MOCK_PRODUCTS } from '@/lib/constants';

export default function FeaturedCollection() {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS.slice(0, 4));

  useEffect(() => {
    getProducts().then((data) => {
      if (data && data.length > 0) {
        setProducts(data.slice(0, 4));
      }
    });
  }, []);

  return (
    <section className="section-padding bg-white border-b border-[#E5E0D8]">
      <div className="container-main space-y-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <h2 className="font-serif text-3xl md:text-4xl text-[#23484A]">
              Featured Collection
            </h2>
            <p className="text-xs text-[#6F7775] mt-1">
              Handpicked designs crafted with perfection
            </p>
          </div>
          <Link
            href="/shop"
            className="btn border border-[#23484A] text-[#23484A] text-xs font-semibold px-6 py-2 uppercase tracking-wider hover:bg-[#23484A] hover:text-white transition-colors"
          >
            EXPLORE ALL
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
