'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, X, ArrowRight, Sparkles, Tag, ShoppingBag, Loader2 } from 'lucide-react';
import type { Product } from '@/types';
import { getProducts } from '@/lib/supabase/services';
import { formatPrice } from '@/lib/utils';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TRENDING_SEARCHES = [
  'Anarkali',
  'Abaya',
  'Silk',
  'Georgette',
  'Kurti',
  'Chiffon',
  'Custom',
  'Dresses',
];

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  // Focus input and load products when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);

      // Prevent background scrolling
      document.body.style.overflow = 'hidden';

      // Load products if not loaded yet
      if (!hasFetched) {
        setLoading(true);
        getProducts()
          .then((data) => {
            if (data && data.length > 0) {
              setProducts(data);
            }
          })
          .catch((err) => console.error('Error fetching search products:', err))
          .finally(() => {
            setLoading(false);
            setHasFetched(true);
          });
      }
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, hasFetched]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filter matching products
  const trimmed = query.trim().toLowerCase();
  const matchedProducts = trimmed
    ? products.filter((prod) => {
        const nameMatch = prod.name.toLowerCase().includes(trimmed);
        const descMatch = prod.description?.toLowerCase().includes(trimmed);
        const shortDescMatch = prod.shortDescription?.toLowerCase().includes(trimmed);
        const typeMatch = prod.type?.toLowerCase().includes(trimmed);
        const fabricMatch = prod.fabrics?.some((f) => f.name.toLowerCase().includes(trimmed));
        return nameMatch || descMatch || shortDescMatch || typeMatch || fabricMatch;
      })
    : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trimmed) {
      onClose();
      router.push(`/shop?search=${encodeURIComponent(trimmed)}`);
    }
  };

  const handleProductClick = (slug: string) => {
    onClose();
    router.push(`/shop/${slug}`);
  };

  const handlePillClick = (term: string) => {
    setQuery(term);
    inputRef.current?.focus();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 sm:pt-20 px-3 sm:px-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-2xl bg-[#F8F5EF] rounded-2xl border border-[#E5E0D8] shadow-2xl overflow-hidden z-10 flex flex-col max-h-[85vh] animate-slide-up">
        
        {/* Header / Input Form */}
        <form onSubmit={handleSearchSubmit} className="relative border-b border-[#E5E0D8] bg-white p-3 sm:p-4">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-[#C7A66A] shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search outfits, anarkalis, silk fabrics, abayas..."
              className="flex-1 bg-transparent text-sm sm:text-base text-[#23484A] placeholder-[#8C9B9A] focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="p-1 text-[#8C9B9A] hover:text-[#23484A] transition-colors"
                title="Clear query"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-[#6F7775] hover:text-[#23484A] hover:bg-[#F2EDE4] rounded-lg transition-colors ml-1"
              title="Close search"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </form>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Loading Indicator */}
          {loading && (
            <div className="py-12 text-center space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#C7A66A] mx-auto" />
              <p className="text-xs text-[#6F7775]">Searching collection...</p>
            </div>
          )}

          {/* When User has typed a query */}
          {!loading && trimmed && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-[#C7A66A] font-semibold">
                  {matchedProducts.length} {matchedProducts.length === 1 ? 'MATCH FOUND' : 'MATCHES FOUND'}
                </span>
                {matchedProducts.length > 0 && (
                  <button
                    onClick={handleSearchSubmit}
                    className="text-xs font-semibold text-[#23484A] hover:text-[#C7A66A] transition-colors flex items-center gap-1"
                  >
                    <span>View all in shop</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {matchedProducts.length === 0 ? (
                /* No Results State */
                <div className="text-center py-10 px-4 bg-white rounded-xl border border-[#E5E0D8] space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#FAF8F5] border border-[#E5E0D8] flex items-center justify-center mx-auto text-[#C7A66A]">
                    <Search className="w-6 h-6" />
                  </div>
                  <h4 className="font-serif text-lg text-[#23484A]">
                    No designs found for &ldquo;{query}&rdquo;
                  </h4>
                  <p className="text-xs text-[#6F7775] max-w-sm mx-auto">
                    Try searching for another style, fabric, or color, or explore our complete catalog.
                  </p>
                  <Link
                    href="/shop"
                    onClick={onClose}
                    className="inline-block mt-2 px-5 py-2.5 bg-[#23484A] hover:bg-[#1A3536] text-white text-xs font-semibold rounded-lg uppercase tracking-wider transition-colors"
                  >
                    Browse All Outfits
                  </Link>
                </div>
              ) : (
                /* Results List */
                <div className="divide-y divide-[#E5E0D8] bg-white rounded-xl border border-[#E5E0D8] overflow-hidden shadow-xs">
                  {matchedProducts.slice(0, 8).map((product) => {
                    const imgUrl = product.images?.[0]?.url || '/images/placeholder.jpg';
                    return (
                      <div
                        key={product.id}
                        onClick={() => handleProductClick(product.slug)}
                        className="p-3 sm:p-4 flex items-center justify-between gap-4 hover:bg-[#FAF8F5] transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                          {/* Product Image */}
                          <div className="w-12 h-14 sm:w-14 sm:h-16 bg-[#F8F5EF] rounded-md overflow-hidden relative border border-[#E5E0D8] shrink-0">
                            <Image
                              src={imgUrl}
                              alt={product.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>

                          {/* Info */}
                          <div className="min-w-0 space-y-1">
                            <h4 className="text-xs sm:text-sm font-medium text-[#23484A] group-hover:text-[#C7A66A] transition-colors truncate">
                              {product.name}
                            </h4>
                            <div className="flex items-center gap-2 text-[11px] text-[#6F7775]">
                              <span className="capitalize px-1.5 py-0.5 bg-[#F2EDE4] rounded-xs font-semibold text-[10px] text-[#23484A]">
                                {product.type === 'CUSTOM'
                                  ? 'Custom Tailored'
                                  : product.type === 'FABRIC'
                                  ? 'Artisanal Fabric'
                                  : 'Ready to Wear'}
                              </span>
                              {product.stock <= 5 && product.stock > 0 && (
                                <span className="text-amber-700 text-[10px]">Only {product.stock} left</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Price & Arrow */}
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <span className="text-xs sm:text-sm font-semibold text-[#23484A] block">
                              {formatPrice(product.price)}
                            </span>
                            {product.compareAtPrice && product.compareAtPrice > product.price && (
                              <span className="text-[10px] text-[#8C9B9A] line-through block">
                                {formatPrice(product.compareAtPrice)}
                              </span>
                            )}
                          </div>
                          <ArrowRight className="w-4 h-4 text-[#8C9B9A] group-hover:text-[#C7A66A] group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Initial State: Trending Searches & Quick Suggestions */}
          {!trimmed && (
            <div className="space-y-6">
              {/* Trending Searches */}
              <div className="space-y-3">
                <span className="text-xs uppercase tracking-wider text-[#C7A66A] font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Popular Searches</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {TRENDING_SEARCHES.map((term) => (
                    <button
                      key={term}
                      onClick={() => handlePillClick(term)}
                      className="px-3 py-1.5 bg-white hover:bg-[#23484A] hover:text-white text-[#23484A] text-xs font-medium rounded-full border border-[#E5E0D8] transition-colors cursor-pointer shadow-2xs"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              {/* Featured Outfits Preview (if products loaded) */}
              {products.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-[#E5E0D8]/60">
                  <span className="text-xs uppercase tracking-wider text-[#6F7775] font-semibold block">
                    Curated Creations
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {products.slice(0, 3).map((prod) => (
                      <div
                        key={prod.id}
                        onClick={() => handleProductClick(prod.slug)}
                        className="bg-white rounded-lg border border-[#E5E0D8] p-2 hover:border-[#C7A66A] transition-colors cursor-pointer group"
                      >
                        <div className="w-full aspect-[4/5] bg-[#F8F5EF] rounded-md overflow-hidden relative mb-2">
                          <Image
                            src={prod.images?.[0]?.url || '/images/placeholder.jpg'}
                            alt={prod.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <h5 className="text-[11px] sm:text-xs font-medium text-[#23484A] truncate">
                          {prod.name}
                        </h5>
                        <p className="text-[11px] font-semibold text-[#C7A66A]">
                          {formatPrice(prod.price)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer Tip */}
        <div className="p-3 bg-white border-t border-[#E5E0D8] flex items-center justify-between text-[11px] text-[#6F7775]">
          <span>Press <kbd className="px-1.5 py-0.5 bg-[#FAF8F5] border border-[#E5E0D8] rounded text-[10px] font-mono text-[#23484A]">ESC</kbd> to close</span>
          {trimmed && matchedProducts.length > 0 && (
            <button
              onClick={handleSearchSubmit}
              className="text-[#23484A] hover:text-[#C7A66A] font-semibold"
            >
              Press <kbd className="px-1.5 py-0.5 bg-[#FAF8F5] border border-[#E5E0D8] rounded text-[10px] font-mono">ENTER</kbd> for full results &rarr;
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
