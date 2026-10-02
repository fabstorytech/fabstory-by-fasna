'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
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
  Edit3,
  Scissors,
  ExternalLink,
  ChevronRight,
  Plus,
  Trash2,
  AlertCircle,
  Truck,
  Sparkles,
  ArrowRight,
  Clock,
  Check,
  MessageCircle,
  X,
  Lock,
} from 'lucide-react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import ProductCard from '@/components/products/ProductCard';
import type { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { BRAND } from '@/lib/constants';
import { addToCart } from '@/lib/cart';

// Gold Luxury Ornament SVG
function GoldOrnament({ className = 'w-24 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M50 2C52 7 58 12 66 12C58 12 52 17 50 22C48 17 42 12 34 12C42 12 48 7 50 2Z"
        fill="#C7A66A"
      />
      <path
        d="M2 12H34M66 12H98"
        stroke="#C7A66A"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.9"
      />
      <circle cx="18" cy="12" r="2.5" fill="#C7A66A" />
      <circle cx="82" cy="12" r="2.5" fill="#C7A66A" />
      <circle cx="50" cy="12" r="2.5" fill="#FFFFFF" />
    </svg>
  );
}

export interface UserProfileProps {
  user: SupabaseUser | null;
  loadingUser: boolean;
  onLogout: () => Promise<void>;
  initialTab?: 'overview' | 'orders' | 'addresses' | 'measurements' | 'wishlist';
}

export interface SavedAddress {
  id: string;
  fullName: string;
  phone: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

export interface BespokeMeasurements {
  bust: string;
  waist: string;
  hips: string;
  shoulder: string;
  sleeveLength: string;
  outfitLength: string;
  height: string;
  fitPreference: 'Modest / Relaxed' | 'Regular Fit' | 'Slim Tailored';
  notes: string;
}

const DEFAULT_MEASUREMENTS: BespokeMeasurements = {
  bust: '',
  waist: '',
  hips: '',
  shoulder: '',
  sleeveLength: '',
  outfitLength: '',
  height: '',
  fitPreference: 'Regular Fit',
  notes: '',
};

export default function UserProfileView({
  user,
  loadingUser,
  onLogout,
  initialTab = 'overview',
}: UserProfileProps) {
  const router = useRouter();

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    'overview' | 'orders' | 'addresses' | 'measurements' | 'wishlist'
  >(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // User details & metadata
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Address State
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null);

  // Measurements State
  const [measurements, setMeasurements] = useState<BespokeMeasurements>(DEFAULT_MEASUREMENTS);
  const [isMeasurementsSaved, setIsMeasurementsSaved] = useState(false);

  // Profile Edit Modal State
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Toast / Feedback State
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync user info on change
  useEffect(() => {
    if (user) {
      const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Fabstory Patron';
      const userPhone = user.user_metadata?.phone || user.phone || '';
      setFullName(name);
      setPhone(userPhone);
      setEditName(name);
      setEditPhone(userPhone);

      // Fetch user's orders from Supabase
      fetchUserOrders(user.email || '');
    } else {
      setFullName('Guest Patron');
      setPhone('');
    }
  }, [user]);

  // Load wishlist, address, and measurements from localStorage
  useEffect(() => {
    loadWishlist();
    loadSavedAddresses();
    loadSavedMeasurements();

    const handleWishlistUpdated = () => loadWishlist();
    window.addEventListener('wishlist-updated', handleWishlistUpdated);

    return () => {
      window.removeEventListener('wishlist-updated', handleWishlistUpdated);
    };
  }, []);

  const loadWishlist = () => {
    try {
      const saved = localStorage.getItem('fabstory_wishlist');
      if (saved) setWishlist(JSON.parse(saved));
      else setWishlist([]);
    } catch {
      setWishlist([]);
    }
  };

  const loadSavedAddresses = () => {
    try {
      const saved = localStorage.getItem('fabstory_saved_address');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setSavedAddresses(parsed);
        } else if (parsed && typeof parsed === 'object') {
          // If stored as single address previously
          setSavedAddresses([
            {
              id: parsed.id || 'default',
              fullName: parsed.fullName || parsed.name || 'Patron',
              phone: parsed.phone || '',
              street: parsed.street || parsed.addressLine1 || '',
              apartment: parsed.apartment || parsed.addressLine2 || '',
              city: parsed.city || '',
              state: parsed.state || '',
              pincode: parsed.pincode || parsed.postalCode || '',
              country: parsed.country || 'India',
              isDefault: true,
            },
          ]);
        }
      } else {
        // Pre-fill a default sample address if none exists
        const defaultSample: SavedAddress[] = [
          {
            id: 'addr-1',
            fullName: user?.user_metadata?.full_name || 'Ayesha Khan',
            phone: user?.user_metadata?.phone || '+91 98765 43210',
            street: 'Emerald Villa, 4th Cross Road',
            apartment: 'Opposite Royal Palms',
            city: 'Kochi',
            state: 'Kerala',
            pincode: '682001',
            country: 'India',
            isDefault: true,
          },
        ];
        setSavedAddresses(defaultSample);
        localStorage.setItem('fabstory_saved_address', JSON.stringify(defaultSample));
      }
    } catch {
      setSavedAddresses([]);
    }
  };

  const loadSavedMeasurements = () => {
    try {
      const saved = localStorage.getItem('fabstory_measurements');
      if (saved) {
        setMeasurements(JSON.parse(saved));
        setIsMeasurementsSaved(true);
      }
    } catch {
      // ignore
    }
  };

  const fetchUserOrders = async (email: string) => {
    if (!email) return;
    setLoadingOrders(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_email', email)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
      } else if (data) {
        setOrders(data);
      }
    } catch (err) {
      console.error('Failed to fetch user orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Save updated profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      showToast('Please enter your full name', 'error');
      return;
    }

    setIsSavingProfile(true);
    try {
      // Update Supabase Auth user metadata
      const { data, error } = await supabase.auth.updateUser({
        data: {
          full_name: editName.trim(),
          phone: editPhone.trim(),
        },
      });

      if (error) {
        throw error;
      }

      setFullName(editName.trim());
      setPhone(editPhone.trim());

      // Attempt to sync with public.customers table if exists
      if (user?.id) {
        await supabase
          .from('customers')
          .update({
            full_name: editName.trim(),
            phone: editPhone.trim(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);
      }

      showToast('Profile updated successfully!');
      setIsEditProfileOpen(false);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      showToast(err?.message || 'Could not update profile', 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Save Measurements
  const handleSaveMeasurements = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('fabstory_measurements', JSON.stringify(measurements));
      setIsMeasurementsSaved(true);
      showToast('Bespoke measurements saved for tailoring!');
    } catch (err) {
      showToast('Failed to save measurements locally', 'error');
    }
  };

  // Save / Update Address
  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const newAddr: SavedAddress = {
      id: editingAddress ? editingAddress.id : `addr-${Date.now()}`,
      fullName: (formData.get('fullName') as string) || fullName,
      phone: (formData.get('phone') as string) || phone,
      street: (formData.get('street') as string) || '',
      apartment: (formData.get('apartment') as string) || '',
      city: (formData.get('city') as string) || '',
      state: (formData.get('state') as string) || '',
      pincode: (formData.get('pincode') as string) || '',
      country: 'India',
      isDefault: editingAddress ? editingAddress.isDefault : savedAddresses.length === 0,
    };

    let updatedList: SavedAddress[];
    if (editingAddress) {
      updatedList = savedAddresses.map((a) => (a.id === editingAddress.id ? newAddr : a));
    } else {
      updatedList = [...savedAddresses, newAddr];
    }

    setSavedAddresses(updatedList);
    localStorage.setItem('fabstory_saved_address', JSON.stringify(updatedList));
    setIsAddressModalOpen(false);
    setEditingAddress(null);
    showToast(editingAddress ? 'Address updated!' : 'New delivery address saved!');
  };

  const handleDeleteAddress = (id: string) => {
    const updated = savedAddresses.filter((a) => a.id !== id);
    setSavedAddresses(updated);
    localStorage.setItem('fabstory_saved_address', JSON.stringify(updated));
    showToast('Address removed');
  };

  const handleSetDefaultAddress = (id: string) => {
    const updated = savedAddresses.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));
    setSavedAddresses(updated);
    localStorage.setItem('fabstory_saved_address', JSON.stringify(updated));
    showToast('Default shipping address updated');
  };

  // Extract display values
  const displayEmail = user?.email?.endsWith('@fabstory.in')
    ? user.email.replace('@fabstory.in', '') + ' (Mobile)'
    : user?.email || 'guest@fabstory.in';

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-IN', {
        month: 'short',
        year: 'numeric',
      })
    : 'Recent Member';

  // Status Badge Styling Helper
  const getStatusBadge = (status: string) => {
    const s = (status || '').toUpperCase();
    if (s === 'DELIVERED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Delivered
        </span>
      );
    }
    if (s === 'SHIPPED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200">
          <Truck className="w-3.5 h-3.5 text-teal-600" />
          Shipped & In Transit
        </span>
      );
    }
    if (s === 'PROCESSING' || s === 'IN_PRODUCTION') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          Crafting in Studio
        </span>
      );
    }
    if (s === 'CANCELLED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
          <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
          Cancelled
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FAF4E8] text-[#8C6D2D] border border-[#E8D9BD]">
        <Check className="w-3.5 h-3.5 text-[#C7A66A]" />
        Confirmed
      </span>
    );
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-4 sm:right-8 z-50 px-4 py-3 rounded-lg shadow-lg border flex items-center gap-2.5 text-xs sm:text-sm font-medium transition-all transform animate-bounce-short ${
            toastMessage.type === 'error'
              ? 'bg-rose-50 text-rose-900 border-rose-200'
              : 'bg-[#1C3F3A] text-[#FAF8F5] border-[#C7A66A]/40'
          }`}
        >
          {toastMessage.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-[#C7A66A] shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* ============================================================ */}
      {/* 1. LUXURY PROFILE HERO (Fully Mobile Responsive) */}
      {/* ============================================================ */}
      {user ? (
        <div className="relative bg-white rounded-xl sm:rounded-2xl border border-[#E5E0D8] shadow-xs overflow-hidden">
          {/* Subtle Champagne Gold Top Accent Strip */}
          <div className="h-1.5 w-full bg-gradient-to-r from-[#1C3F3A] via-[#C7A66A] to-[#23484A]" />

          <div className="p-4 sm:p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Left: Avatar & Identity Details */}
            <div className="flex items-start sm:items-center gap-4 sm:gap-6">
              {/* Monogram Avatar with Gold Ring Border */}
              <div className="relative shrink-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#1C3F3A] to-[#23484A] text-[#FAF8F5] flex items-center justify-center font-serif text-2xl sm:text-3xl font-bold uppercase shadow-md border-2 border-[#C7A66A] ring-4 ring-[#FAF8F5]">
                  {fullName.charAt(0) || 'F'}
                </div>
                <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#C7A66A] text-white flex items-center justify-center shadow-xs border-2 border-white" title="Verified Patron">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </span>
              </div>

              {/* Patron Info */}
              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-serif text-2xl sm:text-3xl text-[#23484A] font-medium tracking-tight truncate">
                    {fullName}
                  </h1>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#8C6D2D] bg-[#FAF4E8] px-2.5 py-0.5 rounded-full border border-[#E8D9BD]">
                    <Sparkles className="w-3 h-3 text-[#C7A66A]" />
                    Atelier Member
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4 text-xs text-[#6F7775]">
                  <p className="flex items-center gap-1.5 truncate">
                    <Mail className="w-3.5 h-3.5 text-[#C7A66A] shrink-0" />
                    <span className="truncate">{displayEmail}</span>
                  </p>
                  {phone && (
                    <p className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#C7A66A] shrink-0" />
                      <span>{phone}</span>
                    </p>
                  )}
                </div>

                <p className="text-[11px] text-[#9AA3A1] flex items-center gap-1.5 pt-0.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Patron since {memberSince}</span>
                </p>
              </div>
            </div>

            {/* Right: Quick Action Buttons (Edit Profile & Logout) */}
            <div className="flex items-center gap-2.5 sm:gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-[#E5E0D8]/60 shrink-0">
              <button
                onClick={() => {
                  setEditName(fullName);
                  setEditPhone(phone);
                  setIsEditProfileOpen(true);
                }}
                className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#F8F5EF] hover:bg-[#F2EDE4] text-[#23484A] text-xs font-semibold rounded-lg border border-[#E5E0D8] transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#C7A66A]" />
                <span>Edit Profile</span>
              </button>

              <button
                onClick={onLogout}
                className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-lg border border-rose-200 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Ribbon (Orders, Wishlist, Addresses, Tailoring) */}
          <div className="grid grid-cols-2 md:grid-cols-4 border-t border-[#E5E0D8] bg-[#FAF8F5] divide-x divide-y md:divide-y-0 divide-[#E5E0D8]">
            <button
              onClick={() => setActiveTab('orders')}
              className="p-3.5 sm:p-4 text-left hover:bg-white transition-colors group cursor-pointer"
            >
              <span className="text-[10px] uppercase tracking-wider text-[#9AA3A1] font-semibold block">
                Total Orders
              </span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-xl sm:text-2xl font-serif text-[#23484A] font-bold group-hover:text-[#C7A66A] transition-colors">
                  {orders.length}
                </span>
                <Package className="w-4 h-4 text-[#C7A66A] opacity-75 group-hover:scale-110 transition-transform" />
              </div>
            </button>

            <button
              onClick={() => setActiveTab('wishlist')}
              className="p-3.5 sm:p-4 text-left hover:bg-white transition-colors group cursor-pointer"
            >
              <span className="text-[10px] uppercase tracking-wider text-[#9AA3A1] font-semibold block">
                Wishlist Items
              </span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-xl sm:text-2xl font-serif text-[#23484A] font-bold group-hover:text-[#C7A66A] transition-colors">
                  {wishlist.length}
                </span>
                <Heart className="w-4 h-4 text-[#C7A66A] opacity-75 group-hover:scale-110 transition-transform" />
              </div>
            </button>

            <button
              onClick={() => setActiveTab('addresses')}
              className="p-3.5 sm:p-4 text-left hover:bg-white transition-colors group cursor-pointer"
            >
              <span className="text-[10px] uppercase tracking-wider text-[#9AA3A1] font-semibold block">
                Saved Addresses
              </span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-xl sm:text-2xl font-serif text-[#23484A] font-bold group-hover:text-[#C7A66A] transition-colors">
                  {savedAddresses.length}
                </span>
                <MapPin className="w-4 h-4 text-[#C7A66A] opacity-75 group-hover:scale-110 transition-transform" />
              </div>
            </button>

            <button
              onClick={() => setActiveTab('measurements')}
              className="p-3.5 sm:p-4 text-left hover:bg-white transition-colors group cursor-pointer"
            >
              <span className="text-[10px] uppercase tracking-wider text-[#9AA3A1] font-semibold block">
                Bespoke Fit
              </span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-xs sm:text-sm font-semibold text-[#23484A] group-hover:text-[#C7A66A] transition-colors">
                  {isMeasurementsSaved ? 'Configured' : 'Setup Profile'}
                </span>
                <Scissors className="w-4 h-4 text-[#C7A66A] opacity-75 group-hover:scale-110 transition-transform" />
              </div>
            </button>
          </div>
        </div>
      ) : (
        /* Guest Welcome Banner */
        <div className="bg-white rounded-xl sm:rounded-2xl border border-[#E5E0D8] p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-[0.25em] text-[#C7A66A] font-semibold block">
              GUEST ACCESS
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#23484A]">
              Welcome to Fabstory by Fasna
            </h2>
            <p className="text-xs sm:text-sm text-[#6F7775] max-w-xl leading-relaxed">
              Sign in to your patron account to view custom orders, save bespoke tailoring measurements, and manage delivery addresses.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <Link
              href="/account/login"
              className="px-6 py-3 bg-[#23484A] hover:bg-[#1A3536] text-white text-xs font-semibold uppercase tracking-wider rounded-lg text-center shadow-xs transition-colors"
            >
              Sign In to Fabstory
            </Link>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. RESPONSIVE SEGMENTED TABS (Horizontally Scrollable on Mobile) */}
      {/* ============================================================ */}
      <div className="border-b border-[#E5E0D8] pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-[#23484A] text-white shadow-xs'
                : 'bg-white text-[#6F7775] border border-[#E5E0D8] hover:text-[#23484A] hover:border-[#23484A]'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile Details</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-[#23484A] text-white shadow-xs'
                : 'bg-white text-[#6F7775] border border-[#E5E0D8] hover:text-[#23484A] hover:border-[#23484A]'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>My Orders</span>
            {orders.length > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'orders' ? 'bg-[#C7A66A] text-white' : 'bg-[#F2EDE4] text-[#23484A]'
              }`}>
                {orders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'addresses'
                ? 'bg-[#23484A] text-white shadow-xs'
                : 'bg-white text-[#6F7775] border border-[#E5E0D8] hover:text-[#23484A] hover:border-[#23484A]'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Saved Addresses</span>
          </button>

          <button
            onClick={() => setActiveTab('measurements')}
            className={`shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'measurements'
                ? 'bg-[#23484A] text-white shadow-xs'
                : 'bg-white text-[#6F7775] border border-[#E5E0D8] hover:text-[#23484A] hover:border-[#23484A]'
            }`}
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>Bespoke Measurements</span>
          </button>

          <button
            onClick={() => setActiveTab('wishlist')}
            className={`shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'wishlist'
                ? 'bg-[#23484A] text-white shadow-xs'
                : 'bg-white text-[#6F7775] border border-[#E5E0D8] hover:text-[#23484A] hover:border-[#23484A]'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>Wishlist</span>
            {wishlist.length > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'wishlist' ? 'bg-[#C7A66A] text-white' : 'bg-[#F2EDE4] text-[#23484A]'
              }`}>
                {wishlist.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: OVERVIEW & PERSONAL INFORMATION */}
      {/* ============================================================ */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Cols: Personal Details Card */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-[#E5E0D8] p-5 sm:p-7 space-y-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-4">
                <div>
                  <h3 className="font-serif text-xl sm:text-2xl text-[#23484A]">
                    Personal Information
                  </h3>
                  <p className="text-xs text-[#6F7775]">
                    Your account contact details and primary delivery preferences
                  </p>
                </div>
                {user && (
                  <button
                    onClick={() => {
                      setEditName(fullName);
                      setEditPhone(phone);
                      setIsEditProfileOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#23484A] hover:text-[#C7A66A] transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                )}
              </div>

              {/* Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="p-3.5 bg-[#FAF8F5] rounded-lg border border-[#E5E0D8]/60 space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-[#9AA3A1] font-semibold block">
                    Full Name
                  </span>
                  <p className="text-sm font-semibold text-[#23484A]">{fullName}</p>
                </div>

                <div className="p-3.5 bg-[#FAF8F5] rounded-lg border border-[#E5E0D8]/60 space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-[#9AA3A1] font-semibold block">
                    Email Address
                  </span>
                  <p className="text-sm font-semibold text-[#23484A] truncate">{displayEmail}</p>
                </div>

                <div className="p-3.5 bg-[#FAF8F5] rounded-lg border border-[#E5E0D8]/60 space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-[#9AA3A1] font-semibold block">
                    Mobile Phone
                  </span>
                  <p className="text-sm font-semibold text-[#23484A]">
                    {phone || 'Not provided (Add for WhatsApp order updates)'}
                  </p>
                </div>

                <div className="p-3.5 bg-[#FAF8F5] rounded-lg border border-[#E5E0D8]/60 space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-[#9AA3A1] font-semibold block">
                    Primary Destination
                  </span>
                  <p className="text-sm font-semibold text-[#23484A]">
                    {savedAddresses[0]
                      ? `${savedAddresses[0].city}, ${savedAddresses[0].state}`
                      : 'Not configured'}
                  </p>
                </div>
              </div>

              {/* Password & Security Reminder */}
              <div className="p-4 bg-[#FAF8F5] rounded-lg border border-[#E5E0D8] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white border border-[#E5E0D8] flex items-center justify-center shrink-0">
                    <Lock className="w-4 h-4 text-[#23484A]" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-[#23484A]">
                      Account Security & Password
                    </h4>
                    <p className="text-[11px] text-[#6F7775]">
                      Need to update your password? Use our instant Brevo Email OTP verification.
                    </p>
                  </div>
                </div>
                <Link
                  href="/account/login"
                  className="text-xs font-semibold text-[#23484A] hover:text-[#C7A66A] whitespace-nowrap self-start sm:self-auto"
                >
                  Reset Password &rarr;
                </Link>
              </div>
            </div>

            {/* Right Col: Bespoke Concierge & Quick Shortcuts */}
            <div className="space-y-6">
              {/* WhatsApp Concierge Card */}
              <div className="bg-gradient-to-br from-[#1C3F3A] to-[#23484A] text-white rounded-xl p-5 sm:p-6 shadow-xs relative overflow-hidden space-y-4">
                <div className="space-y-1 relative z-10">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#C7A66A] font-semibold block">
                    ATELIER CONCIERGE
                  </span>
                  <h3
                    className="font-serif text-xl sm:text-2xl !text-[#FDFBF7]"
                    style={{ color: '#FDFBF7' }}
                  >
                    Need Styling or Tailoring Advice?
                  </h3>
                  <p className="text-xs text-[#CBD8D7] leading-relaxed">
                    Connect directly with Fasna and our couture styling team on WhatsApp for bespoke fabric consultations and rush order requests.
                  </p>
                </div>

                <a
                  href={`https://wa.me/${BRAND.whatsappNumber}?text=${encodeURIComponent(
                    `Hello Fabstory Team! I am ${fullName}, reaching out regarding my bespoke styling assistance.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full py-3 bg-[#C7A66A] hover:bg-[#D4B97E] text-[#1C3F3A] font-semibold text-xs rounded-lg transition-colors shadow-xs"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>

              {/* Brand Promises Mini Card */}
              <div className="bg-white rounded-xl border border-[#E5E0D8] p-5 space-y-3.5 shadow-xs">
                <h4 className="font-serif text-base text-[#23484A] font-semibold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#C7A66A]" />
                  <span>The Fabstory Promise</span>
                </h4>
                <ul className="space-y-2 text-xs text-[#6F7775]">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#C7A66A] shrink-0 mt-0.5" />
                    <span>Guaranteed custom fit with complimentary minor alterations.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#C7A66A] shrink-0 mt-0.5" />
                    <span>Pure, verified artisanal fabrics sourced from master weavers.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#C7A66A] shrink-0 mt-0.5" />
                    <span>Insured express shipping across India and GCC worldwide.</span>
                  </li>
                </ul>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: MY ORDERS & REAL-TIME TRACKING */}
      {/* ============================================================ */}
      {activeTab === 'orders' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E0D8] pb-4">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#23484A]">
                My Orders & Tracking
              </h2>
              <p className="text-xs text-[#6F7775]">
                Review all your custom-tailored creations and live delivery milestones
              </p>
            </div>
            <Link
              href="/track-order"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#23484A] hover:text-[#C7A66A] transition-colors"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Track with Order ID &rarr;</span>
            </Link>
          </div>

          {loadingOrders ? (
            <div className="p-12 text-center bg-white rounded-xl border border-[#E5E0D8] space-y-3">
              <div className="w-8 h-8 border-2 border-[#23484A] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-[#6F7775]">Fetching your order history from atelier studio...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16 px-4 bg-white rounded-xl border border-[#E5E0D8] space-y-4 shadow-xs">
              <div className="w-16 h-16 rounded-full bg-[#FAF8F5] border border-[#E5E0D8] flex items-center justify-center mx-auto text-[#C7A66A]">
                <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="font-serif text-xl sm:text-2xl text-[#23484A]">
                  No Orders Placed Yet
                </h3>
                <p className="text-xs sm:text-sm text-[#6F7775] leading-relaxed">
                  Your wardrobe awaits its next bespoke creation. Explore our luxury readymade designs and unstitched artisanal fabrics.
                </p>
              </div>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#23484A] hover:bg-[#1A3536] text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors shadow-xs"
              >
                <span>Explore The Collection</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const orderDate = new Date(order.created_at || Date.now()).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                });
                const itemsList = Array.isArray(order.items) ? order.items : [];

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-xl border border-[#E5E0D8] overflow-hidden shadow-xs hover:border-[#C7A66A]/60 transition-colors"
                  >
                    {/* Order Header Ribbon */}
                    <div className="p-4 sm:p-5 bg-[#FAF8F5] border-b border-[#E5E0D8] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-mono text-xs sm:text-sm font-bold text-[#23484A]">
                          #{order.order_number}
                        </span>
                        <span className="text-xs text-[#9AA3A1]">•</span>
                        <span className="text-xs text-[#6F7775]">{orderDate}</span>
                        <span className="text-xs text-[#9AA3A1]">•</span>
                        {getStatusBadge(order.status)}
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3">
                        <span className="text-sm font-bold text-[#23484A]">
                          {formatPrice(Number(order.total_amount || 0))}
                        </span>
                        <Link
                          href={`/track-order?orderId=${encodeURIComponent(order.order_number)}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#F2EDE4] text-[#23484A] text-xs font-semibold rounded-md border border-[#E5E0D8] transition-colors"
                        >
                          <Truck className="w-3 h-3 text-[#C7A66A]" />
                          <span>Track Live</span>
                        </Link>
                      </div>
                    </div>

                    {/* Order Items Preview */}
                    <div className="p-4 sm:p-5 divide-y divide-[#E5E0D8]/60">
                      {itemsList.map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                            <div className="w-12 h-14 bg-[#FAF8F5] rounded-md overflow-hidden border border-[#E5E0D8] relative shrink-0">
                              {item.image || item.product?.images?.[0]?.url ? (
                                <Image
                                  src={item.image || item.product?.images?.[0]?.url}
                                  alt={item.name || 'Product'}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[#C7A66A]">
                                  <Scissors className="w-4 h-4 opacity-50" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs sm:text-sm font-medium text-[#23484A] truncate">
                                {item.name || 'Custom Outfit'}
                              </h4>
                              <p className="text-[11px] text-[#6F7775]">
                                {item.fabric && <span>{item.fabric} • </span>}
                                {item.size && <span>Size: {item.size} • </span>}
                                <span>Qty: {item.quantity || 1}</span>
                              </p>
                            </div>
                          </div>
                          <span className="text-xs sm:text-sm font-semibold text-[#23484A] shrink-0">
                            {formatPrice(Number(item.price || item.unitPrice || 0) * Number(item.quantity || 1))}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Order Footer Help */}
                    <div className="p-3 sm:px-5 bg-[#FAF8F5]/50 border-t border-[#E5E0D8]/60 flex items-center justify-between text-xs text-[#6F7775]">
                      <span>Payment: {order.payment_method || 'Razorpay Verified'}</span>
                      <a
                        href={`https://wa.me/919876543210?text=${encodeURIComponent(
                          `Hello Fabstory, I need assistance with Order #${order.order_number}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#C7A66A] hover:underline font-semibold flex items-center gap-1"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Order Help</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: SAVED ADDRESSES */}
      {/* ============================================================ */}
      {activeTab === 'addresses' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E0D8] pb-4">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#23484A]">
                Saved Addresses
              </h2>
              <p className="text-xs text-[#6F7775]">
                Manage your default destinations for fast, effortless boutique checkout
              </p>
            </div>
            <button
              onClick={() => {
                setEditingAddress(null);
                setIsAddressModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#23484A] hover:bg-[#1A3536] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5 text-[#C7A66A]" />
              <span>Add New Address</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {savedAddresses.map((addr) => (
              <div
                key={addr.id}
                className={`bg-white rounded-xl border p-5 sm:p-6 space-y-4 shadow-xs relative transition-colors ${
                  addr.isDefault
                    ? 'border-[#C7A66A] ring-1 ring-[#C7A66A]/30'
                    : 'border-[#E5E0D8] hover:border-[#23484A]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#C7A66A]" />
                    <h4 className="font-semibold text-sm text-[#23484A]">
                      {addr.fullName}
                    </h4>
                  </div>
                  {addr.isDefault && (
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8C6D2D] bg-[#FAF4E8] px-2 py-0.5 rounded-full border border-[#E8D9BD]">
                      Default Shipping
                    </span>
                  )}
                </div>

                <div className="text-xs text-[#6F7775] space-y-1">
                  <p>{addr.street}</p>
                  {addr.apartment && <p>{addr.apartment}</p>}
                  <p>
                    {addr.city}, {addr.state} - {addr.pincode}
                  </p>
                  <p className="text-[#23484A] font-medium pt-1">
                    Phone: {addr.phone}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#E5E0D8]/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setEditingAddress(addr);
                        setIsAddressModalOpen(true);
                      }}
                      className="font-semibold text-[#23484A] hover:text-[#C7A66A] transition-colors cursor-pointer"
                    >
                      Edit
                    </button>
                    {!addr.isDefault && (
                      <button
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="text-rose-600 hover:text-rose-800 transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>

                  {!addr.isDefault && (
                    <button
                      onClick={() => handleSetDefaultAddress(addr.id)}
                      className="font-medium text-[#6F7775] hover:text-[#23484A] transition-colors cursor-pointer"
                    >
                      Set as Default
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 4: BESPOKE MEASUREMENTS (Tailoring Sizing Profile) */}
      {/* ============================================================ */}
      {activeTab === 'measurements' && (
        <div className="space-y-6 animate-fade-in">
          <div className="border-b border-[#E5E0D8] pb-4">
            <span className="text-xs uppercase tracking-[0.25em] text-[#C7A66A] font-semibold block">
              COUTURE FITTING
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#23484A]">
              My Bespoke Measurements
            </h2>
            <p className="text-xs text-[#6F7775]">
              Save your body measurements once to pre-fill all future custom outfits and bespoke tailoring orders
            </p>
          </div>

          <form onSubmit={handleSaveMeasurements} className="bg-white rounded-xl border border-[#E5E0D8] p-5 sm:p-8 space-y-6 shadow-xs">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#23484A] block">
                  Bust / Chest (inches)
                </label>
                <input
                  type="text"
                  value={measurements.bust}
                  onChange={(e) => setMeasurements({ ...measurements, bust: e.target.value })}
                  placeholder="e.g. 36"
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E5E0D8] rounded-lg text-xs text-[#23484A] focus:outline-none focus:border-[#C7A66A]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#23484A] block">
                  Waist (inches)
                </label>
                <input
                  type="text"
                  value={measurements.waist}
                  onChange={(e) => setMeasurements({ ...measurements, waist: e.target.value })}
                  placeholder="e.g. 30"
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E5E0D8] rounded-lg text-xs text-[#23484A] focus:outline-none focus:border-[#C7A66A]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#23484A] block">
                  Hips (inches)
                </label>
                <input
                  type="text"
                  value={measurements.hips}
                  onChange={(e) => setMeasurements({ ...measurements, hips: e.target.value })}
                  placeholder="e.g. 40"
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E5E0D8] rounded-lg text-xs text-[#23484A] focus:outline-none focus:border-[#C7A66A]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#23484A] block">
                  Shoulder Width (inches)
                </label>
                <input
                  type="text"
                  value={measurements.shoulder}
                  onChange={(e) => setMeasurements({ ...measurements, shoulder: e.target.value })}
                  placeholder="e.g. 14.5"
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E5E0D8] rounded-lg text-xs text-[#23484A] focus:outline-none focus:border-[#C7A66A]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#23484A] block">
                  Sleeve Length (inches)
                </label>
                <input
                  type="text"
                  value={measurements.sleeveLength}
                  onChange={(e) => setMeasurements({ ...measurements, sleeveLength: e.target.value })}
                  placeholder="e.g. 21"
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E5E0D8] rounded-lg text-xs text-[#23484A] focus:outline-none focus:border-[#C7A66A]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#23484A] block">
                  Kurta / Outfit Length (inches)
                </label>
                <input
                  type="text"
                  value={measurements.outfitLength}
                  onChange={(e) => setMeasurements({ ...measurements, outfitLength: e.target.value })}
                  placeholder="e.g. 48"
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E5E0D8] rounded-lg text-xs text-[#23484A] focus:outline-none focus:border-[#C7A66A]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#23484A] block">
                  Customer Height
                </label>
                <input
                  type="text"
                  value={measurements.height}
                  onChange={(e) => setMeasurements({ ...measurements, height: e.target.value })}
                  placeholder="e.g. 5 ft 4 in"
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E5E0D8] rounded-lg text-xs text-[#23484A] focus:outline-none focus:border-[#C7A66A]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#23484A] block">
                  Preferred Fit Style
                </label>
                <select
                  value={measurements.fitPreference}
                  onChange={(e) =>
                    setMeasurements({
                      ...measurements,
                      fitPreference: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2.5 bg-[#FAF8F5] border border-[#E5E0D8] rounded-lg text-xs text-[#23484A] focus:outline-none focus:border-[#C7A66A]"
                >
                  <option value="Modest / Relaxed">Modest / Relaxed</option>
                  <option value="Regular Fit">Regular Fit</option>
                  <option value="Slim Tailored">Slim Tailored</option>
                </select>
              </div>

            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#23484A] block">
                Special Tailoring Notes / Preferences
              </label>
              <textarea
                value={measurements.notes}
                onChange={(e) => setMeasurements({ ...measurements, notes: e.target.value })}
                rows={3}
                placeholder="e.g. Prefer 1 inch extra ease under arms, full sleeves with soft lining..."
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E5E0D8] rounded-lg text-xs text-[#23484A] focus:outline-none focus:border-[#C7A66A]"
              />
            </div>

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-[#6F7775]">
                <ShieldCheck className="w-4 h-4 text-[#C7A66A]" />
                <span>Your measurements are private & stored securely for tailoring only.</span>
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#23484A] hover:bg-[#1A3536] text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                <Check className="w-3.5 h-3.5 text-[#C7A66A]" />
                <span>Save Measurements</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 5: WISHLIST */}
      {/* ============================================================ */}
      {activeTab === 'wishlist' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-4">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#23484A]">
                Saved Wishlist
              </h2>
              <p className="text-xs text-[#6F7775]">
                {wishlist.length} {wishlist.length === 1 ? 'outfit saved' : 'outfits saved'} for tailoring and purchase
              </p>
            </div>
            {wishlist.length > 0 && (
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
            )}
          </div>

          {wishlist.length === 0 ? (
            <div className="text-center py-16 px-4 bg-white rounded-xl border border-[#E5E0D8] space-y-4 shadow-xs max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-full bg-[#FAF8F5] border border-[#E5E0D8] flex items-center justify-center mx-auto text-[#C7A66A]">
                <Heart className="w-7 h-7 stroke-[1.5]" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-xl sm:text-2xl text-[#23484A]">
                  Your Wishlist is Empty
                </h3>
                <p className="text-xs text-[#6F7775]">
                  Click the heart icon on any outfit or fabric to save it here for tailoring and purchase later.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#23484A] hover:bg-[#1A3536] text-white text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors shadow-xs"
                >
                  <span>Explore Shop</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {wishlist.map((prod) => {
                const imgUrl = prod.images?.[0]?.url || '/images/placeholder.jpg';
                return (
                  <div
                    key={prod.id}
                    className="group bg-white rounded-xl border border-[#E5E0D8] hover:border-[#C7A66A] p-3 transition-all shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      {/* Image Container with Remove Icon */}
                      <div className="relative aspect-[3/4] bg-[#FAF8F5] rounded-lg overflow-hidden mb-3">
                        <Link href={`/shop/${prod.slug}`}>
                          <Image
                            src={imgUrl}
                            alt={prod.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </Link>
                        <button
                          onClick={() => {
                            const updated = wishlist.filter((item) => item.id !== prod.id && item.slug !== prod.slug);
                            setWishlist(updated);
                            localStorage.setItem('fabstory_wishlist', JSON.stringify(updated));
                            window.dispatchEvent(new Event('wishlist-updated'));
                            showToast('Removed from wishlist');
                          }}
                          aria-label="Remove from wishlist"
                          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 backdrop-blur-xs text-[#6F7775] hover:text-rose-600 flex items-center justify-center shadow-xs transition-colors cursor-pointer"
                          title="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Product Title */}
                      <Link
                        href={`/shop/${prod.slug}`}
                        className="font-serif text-sm sm:text-base text-[#23484A] hover:text-[#C7A66A] transition-colors truncate block font-medium"
                      >
                        {prod.name}
                      </Link>

                      {/* Subtitle */}
                      <p className="text-[11px] text-[#6F7775] mt-0.5 truncate">
                        {prod.fabrics?.[0]?.name || (prod.type === 'CUSTOM' ? 'Custom Tailored' : 'Boutique Collection')}
                      </p>

                      {/* Price */}
                      <p className="text-sm font-bold text-[#23484A] mt-1">
                        {formatPrice(prod.price)}
                      </p>
                    </div>

                    {/* Move to Bag Action */}
                    <div className="pt-3 mt-2 border-t border-[#E5E0D8]/60">
                      <button
                        onClick={() => {
                          const img = prod.images?.[0]?.url || '/images/placeholder.jpg';
                          addToCart({
                            productId: prod.id,
                            name: prod.name,
                            slug: prod.slug,
                            fabric: prod.fabrics?.[0]?.name || 'Pure Silk',
                            size: prod.sizes?.[0] || 'M',
                            customSize: false,
                            price: prod.price,
                            quantity: 1,
                            image: img,
                          });
                          const updated = wishlist.filter((item) => item.id !== prod.id && item.slug !== prod.slug);
                          setWishlist(updated);
                          localStorage.setItem('fabstory_wishlist', JSON.stringify(updated));
                          window.dispatchEvent(new Event('wishlist-updated'));
                          showToast(`Added ${prod.name} to your bag!`);
                        }}
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
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 1: EDIT PROFILE MODAL (Mobile Responsive) */}
      {/* ============================================================ */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-xl sm:rounded-2xl border border-[#E5E0D8] shadow-2xl overflow-hidden animate-slide-up">
            <div className="p-5 border-b border-[#E5E0D8] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#C7A66A]" />
                <h3 className="font-serif text-lg sm:text-xl text-[#23484A]">
                  Edit Profile Details
                </h3>
              </div>
              <button
                onClick={() => setIsEditProfileOpen(false)}
                className="p-1 text-[#6F7775] hover:text-[#23484A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#23484A] block">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  placeholder="Your Full Name"
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E5E0D8] rounded-lg text-xs text-[#23484A] focus:outline-none focus:border-[#C7A66A]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#23484A] block">
                  Mobile Phone Number
                </label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E5E0D8] rounded-lg text-xs text-[#23484A] focus:outline-none focus:border-[#C7A66A]"
                />
                <p className="text-[10px] text-[#9AA3A1]">
                  Used for order delivery alerts and WhatsApp concierge tracking.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-[#6F7775] hover:text-[#23484A]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-5 py-2.5 bg-[#23484A] hover:bg-[#1A3536] text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSavingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: ADD / EDIT ADDRESS MODAL */}
      {/* ============================================================ */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-xl sm:rounded-2xl border border-[#E5E0D8] shadow-2xl overflow-hidden animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-[#E5E0D8] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#C7A66A]" />
                <h3 className="font-serif text-lg sm:text-xl text-[#23484A]">
                  {editingAddress ? 'Edit Delivery Address' : 'Add New Delivery Address'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsAddressModalOpen(false);
                  setEditingAddress(null);
                }}
                className="p-1 text-[#6F7775] hover:text-[#23484A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#23484A] block">
                    Recipient Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    defaultValue={editingAddress ? editingAddress.fullName : fullName}
                    required
                    placeholder="Recipient Name"
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E5E0D8] rounded-lg text-xs text-[#23484A] focus:outline-none focus:border-[#C7A66A]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#23484A] block">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    defaultValue={editingAddress ? editingAddress.phone : phone}
                    required
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E5E0D8] rounded-lg text-xs text-[#23484A] focus:outline-none focus:border-[#C7A66A]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#23484A] block">
                  Flat, House No., Building, Street
                </label>
                <input
                  type="text"
                  name="street"
                  defaultValue={editingAddress?.street || ''}
                  required
                  placeholder="e.g. Flat 4B, Emerald Heights, MG Road"
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E5E0D8] rounded-lg text-xs text-[#23484A] focus:outline-none focus:border-[#C7A66A]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#23484A] block">
                  Landmark / Apartment / Area (Optional)
                </label>
                <input
                  type="text"
                  name="apartment"
                  defaultValue={editingAddress?.apartment || ''}
                  placeholder="e.g. Near Royal Palms"
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E5E0D8] rounded-lg text-xs text-[#23484A] focus:outline-none focus:border-[#C7A66A]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#23484A] block">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    defaultValue={editingAddress?.city || 'Kochi'}
                    required
                    placeholder="City"
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E5E0D8] rounded-lg text-xs text-[#23484A] focus:outline-none focus:border-[#C7A66A]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#23484A] block">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    defaultValue={editingAddress?.state || 'Kerala'}
                    required
                    placeholder="State"
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E5E0D8] rounded-lg text-xs text-[#23484A] focus:outline-none focus:border-[#C7A66A]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#23484A] block">
                    PIN Code
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    defaultValue={editingAddress?.pincode || '682001'}
                    required
                    placeholder="682001"
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E5E0D8] rounded-lg text-xs text-[#23484A] focus:outline-none focus:border-[#C7A66A]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#E5E0D8]/60 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddressModalOpen(false);
                    setEditingAddress(null);
                  }}
                  className="px-4 py-2.5 text-xs font-semibold text-[#6F7775] hover:text-[#23484A]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#23484A] hover:bg-[#1A3536] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  {editingAddress ? 'Update Address' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
