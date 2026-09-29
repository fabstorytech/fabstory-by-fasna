'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/products/ProductCard';
import BrandPromises from '@/components/home/BrandPromises';
import type { Product } from '@/types';
import { getProducts } from '@/lib/supabase/services';
import { MOCK_PRODUCTS, BRAND } from '@/lib/constants';
import { SlidersHorizontal, X, MessageCircle, Search, RefreshCw } from 'lucide-react';

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || 'All';

  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedFabric, setSelectedFabric] = useState<string>('All');
  const [priceRange, setPriceRange] = useState<number>(10000);
  const [sortBy, setSortBy] = useState<string>('Featured');
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);

  const categories = ['All', 'Dresses', 'Anarkali', 'Abaya', 'Kurti', 'Sets'];
  const fabrics = ['All', 'Cotton', 'Linen', 'Silk', 'Chiffon', 'Georgette'];

  useEffect(() => {
    setSearchQuery(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    if (initialCategory && initialCategory !== 'All') {
      // capitalize first letter or match
      const matched = categories.find((c) => c.toLowerCase() === initialCategory.toLowerCase());
      if (matched) setSelectedCategory(matched);
    }
  }, [initialCategory]);

  useEffect(() => {
    getProducts().then((data) => {
      if (data && data.length > 0) {
        setProducts(data);
      }
    });
  }, []);

  // Filter logic
  const filteredProducts = products.filter((product) => {
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const matchName = product.name.toLowerCase().includes(q);
      const matchDesc = product.description?.toLowerCase().includes(q);
      const matchShort = product.shortDescription?.toLowerCase().includes(q);
      const matchType = product.type?.toLowerCase().includes(q);
      const matchFabric = product.fabrics?.some((f) => f.name.toLowerCase().includes(q));
      if (!matchName && !matchDesc && !matchShort && !matchType && !matchFabric) {
        return false;
      }
    }

    // Category filter
    if (selectedCategory !== 'All' && !product.name.toLowerCase().includes(selectedCategory.toLowerCase())) {
      return false;
    }

    // Price filter
    if (product.price > priceRange) {
      return false;
    }

    return true;
  });

  // Sort logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'PriceLow') return a.price - b.price;
    if (sortBy === 'PriceHigh') return b.price - a.price;
    return 0; // Featured default
  });

  const clearSearch = () => {
    setSearchQuery('');
    router.replace('/shop');
  };

  return (
    <div className="container-main space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[#6F7775]">
        <Link href="/" className="hover:text-[#23484A]">Home</Link>
        <span>›</span>
        <Link href="/shop" className="hover:text-[#23484A]">Collections</Link>
        {searchQuery && (
          <>
            <span>›</span>
            <span className="text-[#23484A] font-medium">Search: &ldquo;{searchQuery}&rdquo;</span>
          </>
        )}
      </div>

      {/* Title Header with Right Filter Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E0D8] pb-4">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl text-[#23484A] font-medium">
            {searchQuery ? `Search Results for "${searchQuery}"` : 'New Arrivals'}
          </h1>
          <p className="text-xs text-[#6F7775] mt-1">
            {searchQuery
              ? `Found ${sortedProducts.length} ${sortedProducts.length === 1 ? 'match' : 'matches'} in our handcrafted atelier collection.`
              : 'Handpicked designs crafted with perfection for every occasion.'}
          </p>
        </div>

        {/* Filter Button */}
        <button
          onClick={() => setMobileFilterOpen(true)}
          className="flex items-center gap-2 bg-white border border-[#E5E0D8] hover:border-[#23484A] text-[#23484A] px-4 py-2 text-xs font-bold rounded-xs shadow-2xs transition-colors shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Filter</span>
        </button>
      </div>

      {/* Active Filter Tags Strip */}
      <div className="flex items-center gap-2 flex-wrap pt-1">
        {searchQuery && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#1C3F3A] text-white border border-[#1C3F3A] rounded-xs text-xs font-medium">
            <Search className="w-3 h-3 text-[#C7A66A]" />
            <span>Search: &ldquo;{searchQuery}&rdquo;</span>
            <button
              onClick={clearSearch}
              aria-label="Clear search"
              className="text-white/80 hover:text-white cursor-pointer ml-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#F2EDE4] border border-[#E5E0D8] rounded-xs text-xs text-[#243234]">
          <span>{selectedCategory === 'All' ? 'All Collections' : selectedCategory}</span>
          {selectedCategory !== 'All' && (
            <button
              onClick={() => setSelectedCategory('All')}
              aria-label="Remove filter"
              className="text-[#6F7775] hover:text-[#23484A] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {priceRange < 10000 && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#F2EDE4] border border-[#E5E0D8] rounded-xs text-xs text-[#243234]">
            <span>Up to ₹{priceRange.toLocaleString('en-IN')}</span>
            <button
              onClick={() => setPriceRange(10000)}
              aria-label="Remove price filter"
              className="text-[#6F7775] hover:text-[#23484A] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {(searchQuery || selectedCategory !== 'All' || priceRange < 10000) && (
          <button
            onClick={() => {
              clearSearch();
              setSelectedCategory('All');
              setPriceRange(10000);
            }}
            className="text-xs text-[#C7A66A] hover:underline font-semibold ml-1 cursor-pointer"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Main Layout: Sidebar + Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:block lg:col-span-3 bg-white p-6 border border-[#E5E0D8] space-y-6">
          <h3 className="font-sans text-xs font-bold uppercase tracking-[0.15em] text-[#23484A] pb-3 border-b border-[#E5E0D8]">
            FILTER BY
          </h3>

          {/* Category Filter */}
          <div className="space-y-3">
            <h4 className="font-sans text-xs font-semibold text-[#243234]">Category</h4>
            <div className="space-y-2">
              {categories.map((cat) => (
                <label key={cat} className="flex items-center gap-2 text-xs text-[#6F7775] cursor-pointer hover:text-[#23484A]">
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === cat}
                    onChange={() => setSelectedCategory(cat)}
                    className="accent-[#23484A]"
                  />
                  <span>{cat}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Filter */}
          <div className="space-y-3 pt-4 border-t border-[#E5E0D8]">
            <h4 className="font-sans text-xs font-semibold text-[#243234]">Price</h4>
            <input
              type="range"
              min="500"
              max="10000"
              step="500"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full accent-[#23484A]"
            />
            <div className="flex items-center justify-between text-xs text-[#6F7775]">
              <span>₹ 500</span>
              <span className="font-semibold text-[#23484A]">Up to ₹ {priceRange.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Reset Filter Button */}
          <button
            onClick={() => {
              clearSearch();
              setSelectedCategory('All');
              setSelectedFabric('All');
              setPriceRange(10000);
            }}
            className="w-full btn bg-[#23484A] text-white text-xs font-semibold uppercase tracking-wider py-2.5 cursor-pointer"
          >
            RESET FILTERS
          </button>
        </aside>

        {/* Mobile Drawer Filter */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div className="fixed inset-0 bg-black/40" onClick={() => setMobileFilterOpen(false)} />
            <div className="relative ml-auto w-full max-w-xs bg-white h-full p-6 space-y-6 overflow-y-auto z-10">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E0D8]">
                <h3 className="font-sans text-xs font-bold uppercase tracking-[0.15em] text-[#23484A]">FILTER BY</h3>
                <button onClick={() => setMobileFilterOpen(false)}>
                  <X className="w-5 h-5 text-[#243234]" />
                </button>
              </div>
              {/* Category */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-[#243234]">Category</h4>
                {categories.map((cat) => (
                  <label key={cat} className="flex items-center gap-2 text-xs text-[#6F7775] block py-1 cursor-pointer">
                    <input
                      type="radio"
                      name="mobile-cat"
                      checked={selectedCategory === cat}
                      onChange={() => {
                        setSelectedCategory(cat);
                        setMobileFilterOpen(false);
                      }}
                      className="accent-[#23484A]"
                    />
                    <span>{cat}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Product Grid Area */}
        <div className="lg:col-span-9 space-y-6">
          {/* Header Sort controls */}
          <div className="flex items-center justify-between bg-white p-3 border border-[#E5E0D8]">
            <div className="flex items-center gap-3 text-xs text-[#6F7775]">
              <span>SORT BY:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-xs font-medium text-[#243234] focus:outline-none cursor-pointer border border-[#E5E0D8] px-2 py-1 rounded-xs"
              >
                <option value="Featured">Featured</option>
                <option value="PriceLow">Price: Low to High</option>
                <option value="PriceHigh">Price: High to Low</option>
              </select>
            </div>

            <div className="text-xs text-[#6F7775]">
              Showing <span className="font-semibold text-[#23484A]">{sortedProducts.length}</span> Products
            </div>
          </div>

          {/* Product Grid or Empty Match State */}
          {sortedProducts.length === 0 ? (
            <div className="text-center py-16 px-4 bg-white border border-[#E5E0D8] rounded-xl space-y-4 shadow-xs">
              <div className="w-16 h-16 rounded-full bg-[#FAF8F5] border border-[#E5E0D8] flex items-center justify-center mx-auto text-[#C7A66A]">
                <Search className="w-8 h-8 stroke-[1.5]" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="font-serif text-2xl text-[#23484A]">
                  No Matches Found
                </h3>
                <p className="text-xs sm:text-sm text-[#6F7775]">
                  We couldn&rsquo;t find any designs matching your search or filters. Try adjusting your search keywords or price range.
                </p>
              </div>
              <button
                onClick={() => {
                  clearSearch();
                  setSelectedCategory('All');
                  setPriceRange(10000);
                }}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#23484A] hover:bg-[#1A3536] text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#C7A66A]" />
                <span>Reset All Filters</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              {sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5EF]">
      <Header />

      <main className="flex-1 section-padding">
        <Suspense
          fallback={
            <div className="container-main py-16 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-[#23484A] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-[#6F7775]">Loading atelier collection...</p>
            </div>
          }
        >
          <ShopContent />
        </Suspense>
      </main>

      {/* Floating WhatsApp Us Button */}
      <a
        href={BRAND.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contact us on WhatsApp"
        className="fixed bottom-5 left-4 sm:left-6 z-40 flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white px-3.5 py-2.5 rounded-full shadow-lg transition-transform hover:scale-105"
      >
        <MessageCircle className="w-5 h-5 fill-current" />
        <span className="text-xs font-bold font-sans tracking-wide pr-1">WhatsApp us</span>
      </a>

      <BrandPromises />
      <Footer />
    </div>
  );
}
