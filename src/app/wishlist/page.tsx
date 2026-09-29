'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BrandPromises from '@/components/home/BrandPromises';
import { formatPrice } from '@/lib/utils';
import { Heart, ShoppingBag, Trash2, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { addToCart } from '@/lib/cart';
import type { Product } from '@/types';

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadWishlist = () => {
    try {
      const saved = localStorage.getItem('fabstory_wishlist');
      if (saved) {
        setWishlist(JSON.parse(saved));
      } else {
        setWishlist([]);
      }
    } catch {
      setWishlist([]);
    }
  };

  useEffect(() => {
    loadWishlist();
    window.addEventListener('wishlist-updated', loadWishlist);
    return () => window.removeEventListener('wishlist-updated', loadWishlist);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddToCart = (product: Product) => {
    try {
      const img = product.images?.[0]?.url || '/images/placeholder.jpg';
      addToCart({
        productId: product.id,
        name: product.name,
        slug: product.slug,
        fabric: product.fabrics?.[0]?.name || 'Pure Silk',
        size: product.sizes?.[0] || 'M',
        customSize: false,
        price: product.price,
        quantity: 1,
        image: img,
      });

      // Remove from wishlist
      const updated = wishlist.filter((p) => p.id !== product.id && p.slug !== product.slug);
      setWishlist(updated);
      localStorage.setItem('fabstory_wishlist', JSON.stringify(updated));
      window.dispatchEvent(new Event('wishlist-updated'));
      showToast(`Added ${product.name} to shopping bag!`);
    } catch (err) {
      console.error('Error adding to cart:', err);
    }
  };

  const handleRemove = (productId: string, slug: string) => {
    const updated = wishlist.filter((p) => p.id !== productId && p.slug !== slug);
    setWishlist(updated);
    localStorage.setItem('fabstory_wishlist', JSON.stringify(updated));
    window.dispatchEvent(new Event('wishlist-updated'));
    showToast('Removed from wishlist');
  };

  const handleMoveAllToCart = () => {
    wishlist.forEach((p) => {
      const img = p.images?.[0]?.url || '/images/placeholder.jpg';
      addToCart({
        productId: p.id,
        name: p.name,
        slug: p.slug,
        fabric: p.fabrics?.[0]?.name || 'Pure Silk',
        size: p.sizes?.[0] || 'M',
        customSize: false,
        price: p.price,
        quantity: 1,
        image: img,
      });
    });
    setWishlist([]);
    localStorage.removeItem('fabstory_wishlist');
    window.dispatchEvent(new Event('wishlist-updated'));
    showToast('All items moved to your shopping bag!');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F7F2]">
      <Header />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-4 sm:right-8 z-50 px-4 py-2.5 bg-[#1C3F3A] text-[#FAF8F5] text-xs font-semibold rounded-lg shadow-lg border border-[#C7A66A]/40 flex items-center gap-2 animate-bounce-short">
          <Check className="w-3.5 h-3.5 text-[#C7A66A]" />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="flex-1 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
          
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-[#6F7775]">
            <Link href="/" className="hover:text-[#23484A] transition-colors">Home</Link>
            <span>›</span>
            <Link href="/shop" className="hover:text-[#23484A] transition-colors">Shop</Link>
            <span>›</span>
            <span className="text-[#23484A] font-medium">My Wishlist</span>
          </div>

          {/* Heading Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E0D8] pb-4">
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl text-[#23484A] font-medium">
                My Wishlist
              </h1>
              <p className="text-xs text-[#6F7775] mt-0.5">
                {wishlist.length} {wishlist.length === 1 ? 'creation saved' : 'creations saved'} for your wardrobe
              </p>
            </div>

            {wishlist.length > 0 && (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleMoveAllToCart}
                  className="px-4 py-2 bg-[#23484A] hover:bg-[#1A3536] text-white text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors cursor-pointer"
                >
                  Move All to Bag
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem('fabstory_wishlist');
                    setWishlist([]);
                    window.dispatchEvent(new Event('wishlist-updated'));
                    showToast('Wishlist cleared');
                  }}
                  className="text-xs text-rose-600 hover:underline cursor-pointer"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>

          {/* Wishlist Grid or Clean Empty State */}
          {wishlist.length === 0 ? (
            <div className="bg-white rounded-xl border border-[#E5E0D8] p-12 sm:p-16 text-center space-y-4 shadow-xs max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-full bg-[#FAF8F5] border border-[#E5E0D8] flex items-center justify-center mx-auto text-[#C7A66A]">
                <Heart className="w-7 h-7 stroke-[1.5]" />
              </div>
              <div className="space-y-1">
                <h2 className="font-serif text-2xl text-[#23484A]">
                  Your wishlist is empty
                </h2>
                <p className="text-xs text-[#6F7775]">
                  Save outfits and fabrics you adore to order or customize later.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#23484A] hover:bg-[#1A3536] text-white text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors"
                >
                  <span>Explore Shop</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {wishlist.map((product) => {
                const imgUrl = product.images?.[0]?.url || '/images/placeholder.jpg';
                return (
                  <div
                    key={product.id}
                    className="group bg-white rounded-xl border border-[#E5E0D8] hover:border-[#C7A66A] p-3 transition-all shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      {/* Image container with Delete button */}
                      <div className="relative aspect-[3/4] bg-[#FAF8F5] rounded-lg overflow-hidden mb-3">
                        <Link href={`/shop/${product.slug}`}>
                          <Image
                            src={imgUrl}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </Link>

                        {/* Top-Right Remove Button */}
                        <button
                          onClick={() => handleRemove(product.id, product.slug)}
                          aria-label="Remove from wishlist"
                          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 backdrop-blur-xs text-[#6F7775] hover:text-rose-600 flex items-center justify-center shadow-xs transition-colors cursor-pointer"
                          title="Remove from wishlist"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Product Title */}
                      <Link
                        href={`/shop/${product.slug}`}
                        className="font-serif text-sm sm:text-base text-[#23484A] hover:text-[#C7A66A] transition-colors truncate block font-medium"
                      >
                        {product.name}
                      </Link>

                      {/* Subtitle / Fabric */}
                      <p className="text-[11px] text-[#6F7775] mt-0.5 truncate">
                        {product.fabrics?.[0]?.name || (product.type === 'CUSTOM' ? 'Custom Tailored' : 'Boutique Collection')}
                      </p>

                      {/* Price */}
                      <p className="text-sm font-bold text-[#23484A] mt-1">
                        {formatPrice(product.price)}
                      </p>
                    </div>

                    {/* Move to Bag Button */}
                    <div className="pt-3 mt-2 border-t border-[#E5E0D8]/60">
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[#23484A] hover:bg-[#1A3536] text-white text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors cursor-pointer shadow-2xs"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-[#C7A66A]" />
                        <span>Move to Bag</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Continue Shopping Link */}
          <div className="pt-4">
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#23484A] hover:text-[#C7A66A] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Collections</span>
            </Link>
          </div>

        </div>
      </main>

      <BrandPromises />
      <Footer />
    </div>
  );
}
