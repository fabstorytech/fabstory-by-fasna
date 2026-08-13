'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/products/ProductCard';
import BrandPromises from '@/components/home/BrandPromises';
import type { Product } from '@/types';
import { getProducts } from '@/lib/supabase/services';
import { MOCK_PRODUCTS, BRAND } from '@/lib/constants';
import { SlidersHorizontal, X, MessageCircle } from 'lucide-react';

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedFabric, setSelectedFabric] = useState<string>('All');
  const [priceRange, setPriceRange] = useState<number>(10000);
  const [sortBy, setSortBy] = useState<string>('Featured');
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);

  const categories = ['All', 'Dresses', 'Anarkali', 'Abaya', 'Kurti', 'Sets'];
  const fabrics = ['All', 'Cotton', 'Linen', 'Silk', 'Chiffon', 'Georgette'];

  useEffect(() => {
    getProducts().then((data) => {
      if (data && data.length > 0) {
        setProducts(data);
      }
    });
  }, []);

  // Filter logic
  const filteredProducts = products.filter((product) => {
    if (selectedCategory !== 'All' && !product.name.toLowerCase().includes(selectedCategory.toLowerCase())) {
      return false;
    }
    if (product.price > priceRange) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5EF]">
      <Header />

      <main className="flex-1 section-padding">
        <div className="container-main space-y-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-[#6F7775]">
            <Link href="/" className="hover:text-[#23484A]">Home</Link>
            <span>›</span>
            <span className="text-[#23484A] font-medium">New Arrivals</span>
          </div>

          {/* Title Header with Right Filter Button */}
          <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-4">
            <div>
              <h1 className="font-serif text-3xl md:text-4xl text-[#23484A] font-medium">
                New Arrivals
              </h1>
              <p className="text-xs text-[#6F7775] mt-1">
                Handpicked designs crafted with perfection for every occasion.
              </p>
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="flex items-center gap-2 bg-white border border-[#E5E0D8] hover:border-[#23484A] text-[#23484A] px-4 py-2 text-xs font-bold rounded-xs shadow-2xs transition-colors shrink-0"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filter</span>
            </button>
          </div>

          {/* Active Filter Tags Strip */}
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#F2EDE4] border border-[#E5E0D8] rounded-xs text-xs text-[#243234]">
              <span>New Arrivals</span>
              <button
                onClick={() => setSelectedCategory('All')}
                aria-label="Remove filter"
                className="text-[#6F7775] hover:text-[#23484A]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {selectedCategory !== 'All' && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#F2EDE4] border border-[#E5E0D8] rounded-xs text-xs text-[#243234]">
                <span>{selectedCategory}</span>
                <button
                  onClick={() => setSelectedCategory('All')}
                  aria-label="Remove category filter"
                  className="text-[#6F7775] hover:text-[#23484A]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
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
                  setSelectedCategory('All');
                  setSelectedFabric('All');
                  setPriceRange(10000);
                }}
                className="w-full btn bg-[#23484A] text-white text-xs font-semibold uppercase tracking-wider py-2.5"
              >
                RESET FILTER
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
                  Showing <span className="font-semibold text-[#23484A]">{filteredProducts.length}</span> Products
                </div>
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </div>
        </div>
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
