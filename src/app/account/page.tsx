'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BrandPromises from '@/components/home/BrandPromises';
import type { Product } from '@/types';
import ProductCard from '@/components/products/ProductCard';
import { User, Package, Heart, MapPin, LogOut, ShoppingBag } from 'lucide-react';

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'wishlist'>('wishlist');
  const [wishlist, setWishlist] = useState<Product[]>([]);

  useEffect(() => {
    loadWishlist();
    window.addEventListener('wishlist-updated', loadWishlist);
    return () => window.removeEventListener('wishlist-updated', loadWishlist);
  }, []);

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

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5EF]">
      <Header />

      <main className="flex-1 section-padding">
        <div className="container-main space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E5E0D8] pb-6">
            <div>
              <span className="text-xs uppercase tracking-[0.25em] text-[#C7A66A] font-semibold block">
                MY ACCOUNT
              </span>
              <h1 className="font-serif text-3xl md:text-4xl text-[#23484A]">
                My Saved Collection & Account
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('wishlist')}
                className={`px-4 py-2 text-xs font-semibold rounded-2xs transition-colors ${
                  activeTab === 'wishlist'
                    ? 'bg-[#23484A] text-white shadow-2xs'
                    : 'bg-white text-[#6F7775] border border-[#E5E0D8] hover:text-[#23484A]'
                }`}
              >
                Saved Wishlist ({wishlist.length})
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-4 py-2 text-xs font-semibold rounded-2xs transition-colors ${
                  activeTab === 'profile'
                    ? 'bg-[#23484A] text-white shadow-2xs'
                    : 'bg-white text-[#6F7775] border border-[#E5E0D8] hover:text-[#23484A]'
                }`}
              >
                Profile & Details
              </button>
            </div>
          </div>

          {activeTab === 'wishlist' && (
            <div className="space-y-6">
              {wishlist.length === 0 ? (
                <div className="text-center py-16 px-4 bg-white border border-[#E5E0D8] space-y-4">
                  <Heart className="w-10 h-10 text-[#C7A66A] mx-auto opacity-70" />
                  <div className="space-y-1">
                    <h3 className="font-serif text-xl text-[#23484A]">Your Wishlist is Empty</h3>
                    <p className="text-xs text-[#6F7775]">Click the heart icon on any outfit or fabric to save it here for later.</p>
                  </div>
                  <Link
                    href="/shop"
                    className="btn bg-[#23484A] text-white text-xs font-semibold px-6 py-3 inline-block uppercase tracking-wider"
                  >
                    EXPLORE COLLECTION
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {wishlist.map((prod) => (
                    <ProductCard key={prod.id} product={prod} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link href="/track-order" className="bg-white p-6 border border-[#E5E0D8] space-y-3 hover:border-[#23484A] transition-colors">
                <Package className="w-8 h-8 text-[#23484A]" />
                <h3 className="font-serif text-xl text-[#23484A]">My Orders</h3>
                <p className="text-xs text-[#6F7775]">View recent orders, order history, and live tracking status.</p>
              </Link>

              <div className="bg-white p-6 border border-[#E5E0D8] space-y-3">
                <MapPin className="w-8 h-8 text-[#23484A]" />
                <h3 className="font-serif text-xl text-[#23484A]">Saved Addresses</h3>
                <p className="text-xs text-[#6F7775]">Manage your default shipping address and contacts.</p>
              </div>

              <button
                onClick={() => setActiveTab('wishlist')}
                className="bg-white p-6 border border-[#E5E0D8] space-y-3 text-left hover:border-[#23484A] transition-colors"
              >
                <Heart className="w-8 h-8 text-[#C7A66A]" />
                <h3 className="font-serif text-xl text-[#23484A]">Saved Wishlist ({wishlist.length})</h3>
                <p className="text-xs text-[#6F7775]">View saved outfits and fabric designs for later.</p>
              </button>
            </div>
          )}
        </div>
      </main>

      <BrandPromises />
      <Footer />
    </div>
  );
}
