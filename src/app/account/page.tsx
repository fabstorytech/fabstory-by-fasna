'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BrandPromises from '@/components/home/BrandPromises';
import type { Product } from '@/types';
import ProductCard from '@/components/products/ProductCard';
import { supabase } from '@/lib/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import {
  User,
  Package,
  Heart,
  MapPin,
  LogOut,
  ShoppingBag,
  CheckCircle2,
  Calendar,
  Mail,
  Phone,
  ShieldCheck,
} from 'lucide-react';

export default function AccountPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'profile' | 'wishlist'>('profile');
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [logoutMessage, setLogoutMessage] = useState<string | null>(null);

  useEffect(() => {
    loadWishlist();
    window.addEventListener('wishlist-updated', loadWishlist);

    // Fetch authenticated user from Supabase (single call, minimal tokens)
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoadingUser(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      window.removeEventListener('wishlist-updated', loadWishlist);
      subscription.unsubscribe();
    };
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

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setLogoutMessage('Logged out successfully.');
      setTimeout(() => {
        router.push('/account/login');
      }, 1000);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Extract display information
  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Fabstory Customer';
  const displayEmail = user?.email?.endsWith('@fabstory.in')
    ? user.email.replace('@fabstory.in', '') + ' (Mobile)'
    : user?.email || 'Guest User';
  const joinedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-IN', {
        month: 'short',
        year: 'numeric',
      })
    : 'Recent Member';

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5EF]">
      <Header />

      <main className="flex-1 section-padding">
        <div className="container-main space-y-8">
          
          {/* Logout Alert Notification */}
          {logoutMessage && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-xs rounded-md flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
              <span>{logoutMessage}</span>
            </div>
          )}

          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E5E0D8] pb-6">
            <div>
              <span className="text-xs uppercase tracking-[0.25em] text-[#C7A66A] font-semibold block">
                MY ACCOUNT
              </span>
              <h1 className="font-serif text-3xl md:text-4xl text-[#23484A]">
                {user ? `Welcome, ${fullName}` : 'My Saved Collection & Account'}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-4 py-2 text-xs font-semibold rounded-2xs transition-colors cursor-pointer ${
                  activeTab === 'profile'
                    ? 'bg-[#23484A] text-white shadow-2xs'
                    : 'bg-white text-[#6F7775] border border-[#E5E0D8] hover:text-[#23484A]'
                }`}
              >
                Profile & Details
              </button>
              <button
                onClick={() => setActiveTab('wishlist')}
                className={`px-4 py-2 text-xs font-semibold rounded-2xs transition-colors cursor-pointer ${
                  activeTab === 'wishlist'
                    ? 'bg-[#23484A] text-white shadow-2xs'
                    : 'bg-white text-[#6F7775] border border-[#E5E0D8] hover:text-[#23484A]'
                }`}
              >
                Saved Wishlist ({wishlist.length})
              </button>
            </div>
          </div>

          {/* ============================================================ */}
          {/* TAB 1: PROFILE & ACCOUNT DETAILS */}
          {/* ============================================================ */}
          {activeTab === 'profile' && (
            <div className="space-y-8 animate-fade-in">
              
              {/* Authenticated User Banner */}
              {user ? (
                <div className="bg-white p-6 md:p-8 border border-[#E5E0D8] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4 sm:gap-6">
                    {/* Avatar Initials Badge */}
                    <div className="w-16 h-16 rounded-full bg-[#1C3F3A] text-[#C7A66A] flex items-center justify-center font-serif text-2xl font-bold uppercase shadow-sm shrink-0 border-2 border-[#C7A66A]/40">
                      {fullName.charAt(0)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h2 className="font-serif text-xl sm:text-2xl text-[#23484A] font-medium">
                          {fullName}
                        </h2>
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <ShieldCheck className="w-3 h-3" />
                          Verified
                        </span>
                      </div>
                      <p className="text-xs text-[#6F7775] flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-[#8C9B9A]" />
                        <span>{displayEmail}</span>
                      </p>
                      <p className="text-[11px] text-[#8C9B9A] flex items-center gap-1.5 pt-0.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Customer since {joinedDate}</span>
                      </p>
                    </div>
                  </div>

                  {/* Log Out Button */}
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-xs border border-red-200 transition-colors cursor-pointer self-start md:self-auto"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              ) : (
                /* Guest Banner */
                <div className="bg-white p-6 sm:p-8 border border-[#E5E0D8] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="font-serif text-xl text-[#23484A]">
                      You are currently browsing as a Guest
                    </h3>
                    <p className="text-xs text-[#6F7775]">
                      Sign in to view your orders, save custom tailoring measurements, and access your profile.
                    </p>
                  </div>
                  <Link
                    href="/account/login"
                    className="btn bg-[#23484A] text-white text-xs font-semibold px-6 py-3 uppercase tracking-wider inline-block text-center shrink-0 hover:bg-[#1A3536]"
                  >
                    SIGN IN TO FABSTORY
                  </Link>
                </div>
              )}

              {/* Quick Actions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link
                  href="/track-order"
                  className="bg-white p-6 border border-[#E5E0D8] space-y-3 hover:border-[#23484A] transition-colors group block"
                >
                  <Package className="w-8 h-8 text-[#23484A] group-hover:scale-105 transition-transform" />
                  <h3 className="font-serif text-xl text-[#23484A]">My Orders</h3>
                  <p className="text-xs text-[#6F7775]">
                    View recent orders, order history, and live tracking status.
                  </p>
                </Link>

                <div className="bg-white p-6 border border-[#E5E0D8] space-y-3">
                  <MapPin className="w-8 h-8 text-[#23484A]" />
                  <h3 className="font-serif text-xl text-[#23484A]">Saved Addresses</h3>
                  <p className="text-xs text-[#6F7775]">
                    Manage your default shipping address and contacts for swift checkout.
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab('wishlist')}
                  className="bg-white p-6 border border-[#E5E0D8] space-y-3 text-left hover:border-[#23484A] transition-colors cursor-pointer group"
                >
                  <Heart className="w-8 h-8 text-[#C7A66A] group-hover:scale-105 transition-transform" />
                  <h3 className="font-serif text-xl text-[#23484A]">
                    Saved Wishlist ({wishlist.length})
                  </h3>
                  <p className="text-xs text-[#6F7775]">
                    View saved outfits and fabric designs for tailoring later.
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 2: WISHLIST */}
          {/* ============================================================ */}
          {activeTab === 'wishlist' && (
            <div className="space-y-6 animate-fade-in">
              {wishlist.length === 0 ? (
                <div className="text-center py-16 px-4 bg-white border border-[#E5E0D8] space-y-4">
                  <Heart className="w-10 h-10 text-[#C7A66A] mx-auto opacity-70" />
                  <div className="space-y-1">
                    <h3 className="font-serif text-xl text-[#23484A]">Your Wishlist is Empty</h3>
                    <p className="text-xs text-[#6F7775]">
                      Click the heart icon on any outfit or fabric to save it here for later.
                    </p>
                  </div>
                  <Link
                    href="/shop"
                    className="btn bg-[#23484A] text-white text-xs font-semibold px-6 py-3 inline-block uppercase tracking-wider hover:bg-[#1A3536]"
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

        </div>
      </main>

      <BrandPromises />
      <Footer />
    </div>
  );
}
