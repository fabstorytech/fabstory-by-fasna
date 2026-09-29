'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, X, ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import type { Product } from '@/types';
import { getProducts } from '@/lib/supabase/services';
import { formatPrice } from '@/lib/utils';

interface HeaderSearchBarProps {
  isOpen: boolean;
  onClose: () => void;
}

const TRENDING_TERMS = ['Anarkali', 'Abaya', 'Silk', 'Kurti', 'Kaftan'];

export default function HeaderSearchBar({ isOpen, onClose }: HeaderSearchBarProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  // Auto focus input when opened & load products silently
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 60);

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
      setQuery('');
    }
  }, [isOpen, hasFetched]);

  // Close on ESC key or click outside
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        const target = e.target as HTMLElement;
        if (!target.closest('[data-search-trigger]')) {
          onClose();
        }
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
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
    <div
      ref={containerRef}
      className="w-full bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E5E0D8] shadow-sm py-2.5 px-3 sm:px-6 transition-all duration-200 animate-slide-down relative z-40"
    >
      <div className="max-w-2xl mx-auto relative">
        {/* Sleek Compact Pill Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <div className="flex items-center gap-2.5 bg-white border border-[#E5E0D8] hover:border-[#C7A66A] focus-within:border-[#23484A] focus-within:ring-2 focus-within:ring-[#C7A66A]/20 rounded-full px-3.5 py-1.5 shadow-2xs transition-all">
            <Search className="w-4 h-4 text-[#C7A66A] shrink-0" strokeWidth={2} />
            
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by outfit name, silk, anarkali, abaya..."
              style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
              className="flex-1 bg-transparent text-xs sm:text-sm text-[#23484A] placeholder-[#8C9B9A] border-none outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
            />

            {/* Clear Query Button */}
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="p-1 text-[#8C9B9A] hover:text-[#23484A] transition-colors cursor-pointer"
                title="Clear"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Quick Submit Button (only when text is entered) */}
            {trimmed && (
              <button
                type="submit"
                className="px-2.5 py-1 bg-[#23484A] hover:bg-[#1A3536] text-white text-[11px] font-semibold rounded-full transition-colors cursor-pointer shrink-0"
              >
                Search
              </button>
            )}

            {/* Close ✕ Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-[#6F7775] hover:text-[#23484A] hover:bg-[#F2EDE4] rounded-full transition-colors cursor-pointer shrink-0"
              title="Close search"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Minimal Trending Chips (Compact, only when query is empty) */}
        {!trimmed && (
          <div className="pt-2 flex items-center justify-center gap-1.5 flex-wrap">
            <span className="text-[10px] uppercase tracking-wider text-[#8C9B9A] font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#C7A66A]" />
              <span>Trending:</span>
            </span>
            {TRENDING_TERMS.map((term) => (
              <button
                key={term}
                onClick={() => handlePillClick(term)}
                className="px-2.5 py-0.5 bg-white hover:bg-[#23484A] hover:text-white text-[#23484A] text-[11px] font-medium rounded-full border border-[#E5E0D8] transition-colors cursor-pointer shadow-2xs"
              >
                {term}
              </button>
            ))}
          </div>
        )}

        {/* ============================================================ */}
        {/* COMPACT FLOATING AUTOCOMPLETE DROPDOWN (Only When Typing) */}
        {/* ============================================================ */}
        {trimmed && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl border border-[#E5E0D8] shadow-xl overflow-hidden z-50 animate-fade-in">
            
            {/* Header info */}
            <div className="p-2.5 px-3.5 bg-[#FAF8F5] border-b border-[#E5E0D8] flex items-center justify-between text-xs">
              <span className="text-[11px] font-semibold text-[#8C6D2D] uppercase tracking-wider">
                {matchedProducts.length} {matchedProducts.length === 1 ? 'Match' : 'Matches'} Found
              </span>
              {matchedProducts.length > 0 && (
                <button
                  onClick={handleSearchSubmit}
                  className="text-[11px] font-bold text-[#23484A] hover:text-[#C7A66A] transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>View all in shop</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>

            {loading ? (
              <div className="py-6 text-center text-xs text-[#6F7775] flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#C7A66A]" />
                <span>Searching catalog...</span>
              </div>
            ) : matchedProducts.length === 0 ? (
              /* No Results State */
              <div className="py-6 text-center p-4 space-y-2">
                <p className="text-xs font-semibold text-[#23484A]">
                  No matching designs found for &ldquo;{query}&rdquo;
                </p>
                <p className="text-[11px] text-[#6F7775]">
                  Try searching for &ldquo;Anarkali&rdquo;, &ldquo;Abaya&rdquo;, or &ldquo;Silk&rdquo;.
                </p>
                <Link
                  href="/shop"
                  onClick={onClose}
                  className="inline-block mt-1 px-3 py-1 bg-[#23484A] text-white text-[11px] font-semibold rounded-full"
                >
                  Browse Shop Collection
                </Link>
              </div>
            ) : (
              /* Compact Product Matches List (Clean, luxury rows) */
              <div className="max-h-[300px] overflow-y-auto divide-y divide-[#E5E0D8]/60 p-1">
                {matchedProducts.slice(0, 5).map((product) => {
                  const imgUrl = product.images?.[0]?.url || '/images/placeholder.jpg';
                  return (
                    <div
                      key={product.id}
                      onClick={() => handleProductClick(product.slug)}
                      className="p-2 sm:p-2.5 rounded-lg flex items-center justify-between gap-3 hover:bg-[#FAF8F5] transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Compact Thumbnail with Gold Border */}
                        <div className="w-10 h-12 bg-[#F2EDE4] rounded-md overflow-hidden relative border border-[#E5E0D8] shrink-0">
                          <Image
                            src={imgUrl}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>

                        {/* Title & Tag */}
                        <div className="min-w-0 space-y-0.5">
                          <h4 className="font-serif text-xs sm:text-sm text-[#23484A] group-hover:text-[#C7A66A] font-medium transition-colors truncate">
                            {product.name}
                          </h4>
                          <div className="flex items-center gap-1.5 text-[10px] text-[#6F7775]">
                            <span className="capitalize px-1.5 py-0.2 bg-[#F2EDE4] rounded-xs font-semibold text-[9px] text-[#23484A]">
                              {product.type === 'CUSTOM'
                                ? 'Custom'
                                : product.type === 'FABRIC'
                                ? 'Fabric'
                                : 'Ready to Wear'}
                            </span>
                            {product.fabrics && product.fabrics[0] && (
                              <span className="truncate hidden sm:inline">• {product.fabrics[0].name}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Price & Arrow */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-bold text-[#23484A]">
                          {formatPrice(product.price)}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#8C9B9A] group-hover:text-[#C7A66A] group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Footer Tip */}
            {matchedProducts.length > 5 && (
              <div className="p-2 bg-[#FAF8F5] border-t border-[#E5E0D8] text-center">
                <button
                  onClick={handleSearchSubmit}
                  className="text-[11px] font-semibold text-[#23484A] hover:text-[#C7A66A] cursor-pointer"
                >
                  +{matchedProducts.length - 5} more results in shop &rarr;
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
