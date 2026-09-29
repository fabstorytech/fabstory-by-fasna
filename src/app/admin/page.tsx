'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BRAND } from '@/lib/constants';
import type { Product } from '@/types';
import {
  getProducts,
  createProduct,
  deleteProduct,
  getOrdersFromSupabase,
  uploadImageToCloudinary,
  getSiteSettings,
  updateSiteSettings,
  SiteSettings,
  DEFAULT_SITE_SETTINGS,
} from '@/lib/supabase/services';
import { supabase } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import AdminLoginForm from '@/components/admin/AdminLoginForm';
import {
  ShoppingBag,
  Scissors,
  Layers,
  Plus,
  Trash2,
  Upload,
  CheckCircle,
  X,
  RefreshCw,
  ExternalLink,
  Cloud,
  Layout,
  Image as ImageIcon,
  TrendingUp,
  DollarSign,
  Search,
  Filter,
  BarChart3,
  Copy,
  Eye,
  LogOut,
  User as UserIcon,
  ShieldCheck,
  Loader2,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [adminUser, setAdminUser] = useState<SupabaseUser | null>(null);
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'products' | 'site_cms' | 'orders'>('overview');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // Site CMS State
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [bannerTab, setBannerTab] = useState<'slide1' | 'slide2' | 'slide3' | 'login'>('slide1');

  // Files for upload
  const [desktopHeroFile, setDesktopHeroFile] = useState<File | null>(null);
  const [mobileHeroFile, setMobileHeroFile] = useState<File | null>(null);
  const [desktopHero2File, setDesktopHero2File] = useState<File | null>(null);
  const [mobileHero2File, setMobileHero2File] = useState<File | null>(null);
  const [desktopHero3File, setDesktopHero3File] = useState<File | null>(null);
  const [mobileHero3File, setMobileHero3File] = useState<File | null>(null);
  const [loginHeroFile, setLoginHeroFile] = useState<File | null>(null);

  // Live preview URLs for freshly picked files
  const [desktopHeroPreview, setDesktopHeroPreview] = useState<string | null>(null);
  const [mobileHeroPreview, setMobileHeroPreview] = useState<string | null>(null);
  const [desktopHero2Preview, setDesktopHero2Preview] = useState<string | null>(null);
  const [mobileHero2Preview, setMobileHero2Preview] = useState<string | null>(null);
  const [desktopHero3Preview, setDesktopHero3Preview] = useState<string | null>(null);
  const [mobileHero3Preview, setMobileHero3Preview] = useState<string | null>(null);
  const [loginHeroPreview, setLoginHeroPreview] = useState<string | null>(null);

  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New Product Form State
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductComparePrice, setNewProductComparePrice] = useState('');
  const [newProductType, setNewProductType] = useState<'CUSTOM' | 'READY_STOCK' | 'FABRIC'>('CUSTOM');
  const [newProductDescription, setNewProductDescription] = useState('');
  const [newProductStock, setNewProductStock] = useState('50');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [formMessage, setFormMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user || null;
      setAdminUser(currentUser);
      setAuthChecking(false);
      if (currentUser) {
        loadAdminData();
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user || null;
      setAdminUser(currentUser);
      if (currentUser) {
        loadAdminData();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setAdminUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string, trackingNumber?: string) => {
    setUpdatingOrderId(orderId);
    try {
      const res = await fetch('/api/admin/orders/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus, trackingNumber }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  status: newStatus,
                  tracking_number: trackingNumber || o.tracking_number,
                  shipped_email_sent: data.shippedEmailSent ?? o.shipped_email_sent,
                  delivered_email_sent: data.deliveredEmailSent ?? o.delivered_email_sent,
                }
              : o
          )
        );
      }
    } catch (err) {
      console.error('Failed to update status', err);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const loadAdminData = async () => {
    setLoading(true);
    const [fetchedProducts, fetchedOrders, fetchedSettings] = await Promise.all([
      getProducts(),
      getOrdersFromSupabase(),
      getSiteSettings(),
    ]);
    setProducts(fetchedProducts);
    setOrders(fetchedOrders);
    setSiteSettings(fetchedSettings);
    setLoading(false);
  };

  // Handle File Selection & Preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFilePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handleSaveSiteSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    setSettingsMessage(null);

    let updatedDesktopUrl = siteSettings.heroDesktopImage;
    let updatedMobileUrl = siteSettings.heroMobileImage;
    let updatedDesktop2Url = siteSettings.heroDesktopImage2 || DEFAULT_SITE_SETTINGS.heroDesktopImage2;
    let updatedMobile2Url = siteSettings.heroMobileImage2 || DEFAULT_SITE_SETTINGS.heroMobileImage2;
    let updatedDesktop3Url = siteSettings.heroDesktopImage3 || DEFAULT_SITE_SETTINGS.heroDesktopImage3;
    let updatedMobile3Url = siteSettings.heroMobileImage3 || DEFAULT_SITE_SETTINGS.heroMobileImage3;
    let updatedLoginUrl = siteSettings.loginImage;

    // Slide 1
    if (desktopHeroFile) {
      const url = await uploadImageToCloudinary(desktopHeroFile);
      if (url) updatedDesktopUrl = url;
    }
    if (mobileHeroFile) {
      const url = await uploadImageToCloudinary(mobileHeroFile);
      if (url) updatedMobileUrl = url;
    }

    // Slide 2
    if (desktopHero2File) {
      const url = await uploadImageToCloudinary(desktopHero2File);
      if (url) updatedDesktop2Url = url;
    }
    if (mobileHero2File) {
      const url = await uploadImageToCloudinary(mobileHero2File);
      if (url) updatedMobile2Url = url;
    }

    // Slide 3
    if (desktopHero3File) {
      const url = await uploadImageToCloudinary(desktopHero3File);
      if (url) updatedDesktop3Url = url;
    }
    if (mobileHero3File) {
      const url = await uploadImageToCloudinary(mobileHero3File);
      if (url) updatedMobile3Url = url;
    }

    // Login
    if (loginHeroFile) {
      const url = await uploadImageToCloudinary(loginHeroFile);
      if (url) updatedLoginUrl = url;
    }

    const newSettings: SiteSettings = {
      ...siteSettings,
      heroDesktopImage: updatedDesktopUrl,
      heroMobileImage: updatedMobileUrl,
      heroDesktopImage2: updatedDesktop2Url,
      heroMobileImage2: updatedMobile2Url,
      heroDesktopImage3: updatedDesktop3Url,
      heroMobileImage3: updatedMobile3Url,
      loginImage: updatedLoginUrl,
    };

    const ok = await updateSiteSettings(newSettings);
    setIsSavingSettings(false);

    if (ok) {
      setSiteSettings(newSettings);
      setSettingsMessage({ type: 'success', text: 'All banners and site CMS settings updated successfully!' });
      setDesktopHeroFile(null);
      setMobileHeroFile(null);
      setDesktopHero2File(null);
      setMobileHero2File(null);
      setDesktopHero3File(null);
      setMobileHero3File(null);
      setLoginHeroFile(null);
      setDesktopHeroPreview(null);
      setMobileHeroPreview(null);
      setDesktopHero2Preview(null);
      setMobileHero2Preview(null);
      setDesktopHero3Preview(null);
      setMobileHero3Preview(null);
      setLoginHeroPreview(null);
    } else {
      setSettingsMessage({ type: 'error', text: 'Failed to update site settings.' });
    }
  };

  const handleResetBanners = async () => {
    if (!window.confirm('Reset all 3 hero banners back to the curated boutique originals?')) return;
    setIsSavingSettings(true);
    const ok = await updateSiteSettings(DEFAULT_SITE_SETTINGS);
    setIsSavingSettings(false);
    if (ok) {
      setSiteSettings(DEFAULT_SITE_SETTINGS);
      setDesktopHeroFile(null);
      setMobileHeroFile(null);
      setDesktopHero2File(null);
      setMobileHero2File(null);
      setDesktopHero3File(null);
      setMobileHero3File(null);
      setLoginHeroFile(null);
      setDesktopHeroPreview(null);
      setMobileHeroPreview(null);
      setDesktopHero2Preview(null);
      setMobileHero2Preview(null);
      setDesktopHero3Preview(null);
      setMobileHero3Preview(null);
      setLoginHeroPreview(null);
      setSettingsMessage({ type: 'success', text: 'Restored original curated 3 banners successfully!' });
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName || !newProductPrice) {
      setFormMessage({ type: 'error', text: 'Please fill in Product Name and Price.' });
      return;
    }

    setIsUploading(true);
    setFormMessage(null);

    let imageUrl = '/images/placeholder.jpg';
    if (selectedFile) {
      const uploadedCloudinaryUrl = await uploadImageToCloudinary(selectedFile);
      if (uploadedCloudinaryUrl) {
        imageUrl = uploadedCloudinaryUrl;
      } else {
        setFormMessage({ type: 'error', text: 'Failed to upload photo to Cloudinary.' });
        setIsUploading(false);
        return;
      }
    }

    const res = await createProduct({
      name: newProductName,
      price: Number(newProductPrice),
      compareAtPrice: newProductComparePrice ? Number(newProductComparePrice) : undefined,
      type: newProductType,
      description: newProductDescription || 'Handcrafted outfit curated with perfection by Fabstory by Fasna.',
      shortDescription: newProductName,
      stock: Number(newProductStock),
      images: [{ id: `img-${Date.now()}`, url: imageUrl, alt: newProductName, order: 1 }],
      status: 'PUBLISHED',
      isFeatured: true,
    });

    setIsUploading(false);

    if (res.success) {
      setFormMessage({ type: 'success', text: 'Product & photo uploaded to Cloudinary successfully!' });
      setNewProductName('');
      setNewProductPrice('');
      setNewProductComparePrice('');
      setNewProductDescription('');
      setSelectedFile(null);
      setFilePreview(null);
      setTimeout(() => {
        setIsAddModalOpen(false);
        setFormMessage(null);
        loadAdminData();
      }, 1200);
    } else {
      setFormMessage({ type: 'error', text: res.error || 'Failed to create product' });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await deleteProduct(id);
      loadAdminData();
    }
  };

  // Filtered Products Search
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'ALL' || p.type === filterType;
    return matchesSearch && matchesType;
  });

  // Calculate live dynamic metrics from Supabase database
  const totalRevenue = orders.reduce((acc, o) => acc + Number(o.total_amount || 0), 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#F7F4EE] flex flex-col items-center justify-center p-4 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-[#C7A66A]/60 bg-white p-1 shadow-md animate-pulse">
            <Image src="/logo.png" alt={BRAND.fullName} fill className="object-contain p-0.5" priority />
          </div>
          <Loader2 className="w-5 h-5 animate-spin text-[#1C3F3A]" />
          <p className="text-[11px] uppercase tracking-[0.25em] text-[#6F7775] font-semibold">
            Authenticating Admin Access...
          </p>
        </div>
      </div>
    );
  }

  if (!adminUser) {
    return (
      <AdminLoginForm
        onSuccess={() => {
          supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) {
              setAdminUser(user);
              loadAdminData();
            }
          });
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex bg-[#F8F5EF] text-[#243234]">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-white border-r border-[#E5E0D8] p-6 space-y-8 hidden md:block shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[#C7A66A]/40 bg-white p-0.5 shadow-2xs">
            <Image src="/logo.png" alt={BRAND.fullName} fill className="object-contain p-0.5" />
          </div>
          <div>
            <span className="font-serif text-sm font-semibold text-[#23484A] block leading-tight">
              {BRAND.name} CMS
            </span>
            <span className="text-[9px] uppercase tracking-[0.2em] text-[#C7A66A] block font-medium">
              Pro Analytics Shell
            </span>
          </div>
        </div>

        <nav className="space-y-1 text-xs font-semibold uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xs transition-colors flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'bg-[#23484A] text-white shadow-2xs'
                : 'text-[#6F7775] hover:bg-[#F8F5EF] hover:text-[#23484A]'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xs transition-colors flex items-center gap-2 ${
              activeTab === 'analytics'
                ? 'bg-[#23484A] text-white shadow-2xs'
                : 'text-[#6F7775] hover:bg-[#F8F5EF] hover:text-[#23484A]'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Analytics & Sales</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xs transition-colors flex items-center justify-between ${
              activeTab === 'products'
                ? 'bg-[#23484A] text-white shadow-2xs'
                : 'text-[#6F7775] hover:bg-[#F8F5EF] hover:text-[#23484A]'
            }`}
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              <span>Products CMS</span>
            </div>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">{products.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('site_cms')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xs transition-colors flex items-center gap-2 ${
              activeTab === 'site_cms'
                ? 'bg-[#23484A] text-white shadow-2xs'
                : 'text-[#6F7775] hover:bg-[#F8F5EF] hover:text-[#23484A]'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Hero & Banner Media</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xs transition-colors flex items-center justify-between ${
              activeTab === 'orders'
                ? 'bg-[#23484A] text-white shadow-2xs'
                : 'text-[#6F7775] hover:bg-[#F8F5EF] hover:text-[#23484A]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Scissors className="w-4 h-4" />
              <span>Customer Orders</span>
            </div>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">{orders.length}</span>
          </button>

          <Link
            href="/"
            className="block px-3.5 py-2.5 text-[#6F7775] hover:bg-[#F8F5EF] hover:text-[#23484A] rounded-xs mt-8 pt-4 border-t border-[#E5E0D8]"
          >
            ← View Live Store
          </Link>
        </nav>

        {/* Admin Session Profile & Logout */}
        <div className="pt-4 border-t border-[#E5E0D8] space-y-3">
          <div className="flex items-center gap-2.5 px-1 py-1">
            <div className="w-8 h-8 rounded-full bg-[#23484A]/10 text-[#23484A] flex items-center justify-center shrink-0">
              <UserIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-semibold text-[#23484A] truncate block" title={adminUser?.email || ''}>
                {adminUser?.email || 'Admin'}
              </span>
              <span className="inline-flex items-center gap-1 text-[9px] text-emerald-700 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active Session
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full text-left px-3.5 py-2 rounded-xs transition-colors flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-red-600 hover:bg-red-50 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 p-3 sm:p-6 md:p-8 space-y-4 sm:space-y-6 overflow-y-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 bg-white p-3.5 sm:p-6 border border-[#E5E0D8] rounded-2xs shadow-2xs">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-serif text-xl sm:text-2xl md:text-3xl text-[#23484A]">
                Fabstory Store Management
              </h1>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-[#003B75]/10 text-[#003B75] px-2 py-0.5 rounded-full">
                <Cloud className="w-3 h-3" /> Cloudinary (`jwter84c`)
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-[#6F7775] mt-1">
              Live Supabase database + Cloudinary image uploads. Analytics & store CMS portal.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-between sm:justify-end pt-1 sm:pt-0 border-t sm:border-t-0 border-[#E5E0D8]">
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 bg-[#F8F5EF] border border-[#E5E0D8] rounded-xs text-[11px] text-[#23484A]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C7A66A]" />
              <span className="font-medium max-w-[150px] truncate" title={adminUser?.email || ''}>
                {adminUser?.email}
              </span>
            </div>

            <button
              onClick={loadAdminData}
              className="p-2 border border-[#E5E0D8] text-[#23484A] hover:bg-[#F8F5EF] rounded-xs text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden xs:inline">Refresh</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="btn bg-[#23484A] hover:bg-[#1A3536] text-white text-xs font-semibold px-3.5 py-2 rounded-xs flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>

            <Link
              href="/"
              target="_blank"
              title="Open Live Customer Store"
              className="p-2 border border-[#E5E0D8] text-[#6F7775] hover:text-[#23484A] hover:bg-[#F8F5EF] rounded-xs text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Store</span>
            </Link>

            <button
              onClick={handleLogout}
              title="Sign Out of Admin"
              className="p-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-xs text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Tab Bar — Fixed 5-column grid, NO horizontal scrolling */}
        <div className="md:hidden bg-white/95 backdrop-blur-xs border border-[#E5E0D8] p-1 rounded-2xs shadow-2xs sticky top-2 z-30">
          <div className="grid grid-cols-5 gap-1 text-center">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 rounded-xs flex flex-col items-center justify-center gap-1 transition-all ${
                activeTab === 'overview'
                  ? 'bg-[#23484A] text-white shadow-2xs font-bold'
                  : 'text-[#6F7775] hover:bg-[#F8F5EF] hover:text-[#23484A] font-medium'
              }`}
            >
              <BarChart3 className="w-4 h-4 shrink-0" />
              <span className="text-[10px] leading-none tracking-tight">Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-2 px-1 rounded-xs flex flex-col items-center justify-center gap-1 transition-all ${
                activeTab === 'analytics'
                  ? 'bg-[#23484A] text-white shadow-2xs font-bold'
                  : 'text-[#6F7775] hover:bg-[#F8F5EF] hover:text-[#23484A] font-medium'
              }`}
            >
              <TrendingUp className="w-4 h-4 shrink-0" />
              <span className="text-[10px] leading-none tracking-tight">Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`py-2 px-1 rounded-xs flex flex-col items-center justify-center gap-1 transition-all relative ${
                activeTab === 'products'
                  ? 'bg-[#23484A] text-white shadow-2xs font-bold'
                  : 'text-[#6F7775] hover:bg-[#F8F5EF] hover:text-[#23484A] font-medium'
              }`}
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4 shrink-0" />
                {products.length > 0 && (
                  <span className={`absolute -top-1 -right-2 text-[8px] px-1 py-0.2 rounded-full leading-none ${
                    activeTab === 'products' ? 'bg-[#C7A66A] text-[#1A3536] font-bold' : 'bg-[#23484A] text-white font-semibold'
                  }`}>
                    {products.length}
                  </span>
                )}
              </div>
              <span className="text-[10px] leading-none tracking-tight">Products</span>
            </button>

            <button
              onClick={() => setActiveTab('site_cms')}
              className={`py-2 px-1 rounded-xs flex flex-col items-center justify-center gap-1 transition-all ${
                activeTab === 'site_cms'
                  ? 'bg-[#23484A] text-white shadow-2xs font-bold'
                  : 'text-[#6F7775] hover:bg-[#F8F5EF] hover:text-[#23484A] font-medium'
              }`}
            >
              <ImageIcon className="w-4 h-4 shrink-0" />
              <span className="text-[10px] leading-none tracking-tight">Banners</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`py-2 px-1 rounded-xs flex flex-col items-center justify-center gap-1 transition-all relative ${
                activeTab === 'orders'
                  ? 'bg-[#23484A] text-white shadow-2xs font-bold'
                  : 'text-[#6F7775] hover:bg-[#F8F5EF] hover:text-[#23484A] font-medium'
              }`}
            >
              <div className="relative">
                <Scissors className="w-4 h-4 shrink-0" />
                {orders.length > 0 && (
                  <span className={`absolute -top-1 -right-2 text-[8px] px-1 py-0.2 rounded-full leading-none ${
                    activeTab === 'orders' ? 'bg-[#C7A66A] text-[#1A3536] font-bold' : 'bg-[#23484A] text-white font-semibold'
                  }`}>
                    {orders.length}
                  </span>
                )}
              </div>
              <span className="text-[10px] leading-none tracking-tight">Orders</span>
            </button>
          </div>
        </div>

        {/* Tab 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-4 sm:space-y-6">
            {/* Stats Cards - perfectly aligned 2-col on mobile, 4-col on desktop */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
              <div className="bg-white p-3.5 sm:p-5 border border-[#E5E0D8] rounded-2xs flex flex-col justify-between h-full shadow-2xs">
                <div>
                  <div className="flex items-center justify-between text-[#6F7775] mb-1.5">
                    <span className="text-[11px] sm:text-xs font-semibold truncate">Total Revenue</span>
                    <DollarSign className="w-4 h-4 text-[#C7A66A] shrink-0" />
                  </div>
                  <div className="text-lg sm:text-2xl font-serif font-bold text-[#23484A]">
                    ₹ {totalRevenue.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="pt-2">
                  <span className="text-[9px] sm:text-[10px] text-[#23484A] bg-[#23484A]/10 px-2 py-0.5 rounded-2xs font-semibold inline-block">
                    Live DB Orders
                  </span>
                </div>
              </div>

              <div className="bg-white p-3.5 sm:p-5 border border-[#E5E0D8] rounded-2xs flex flex-col justify-between h-full shadow-2xs">
                <div>
                  <div className="flex items-center justify-between text-[#6F7775] mb-1.5">
                    <span className="text-[11px] sm:text-xs font-semibold truncate">Total Products</span>
                    <ShoppingBag className="w-4 h-4 text-[#23484A] shrink-0" />
                  </div>
                  <div className="text-lg sm:text-2xl font-serif font-bold text-[#23484A]">
                    {products.length}
                  </div>
                </div>
                <div className="pt-2">
                  <span className="text-[9px] sm:text-[10px] text-[#23484A] bg-[#23484A]/10 px-2 py-0.5 rounded-2xs font-semibold inline-block">
                    Pure Live Catalog
                  </span>
                </div>
              </div>

              <div className="bg-white p-3.5 sm:p-5 border border-[#E5E0D8] rounded-2xs flex flex-col justify-between h-full shadow-2xs">
                <div>
                  <div className="flex items-center justify-between text-[#6F7775] mb-1.5">
                    <span className="text-[11px] sm:text-xs font-semibold truncate">Cloudinary CDN</span>
                    <Cloud className="w-4 h-4 text-[#003B75] shrink-0" />
                  </div>
                  <div className="text-lg sm:text-2xl font-serif font-bold text-[#23484A]">
                    Active
                  </div>
                </div>
                <div className="pt-2">
                  <span className="text-[9px] sm:text-[10px] text-[#003B75] bg-[#003B75]/10 px-2 py-0.5 rounded-2xs font-semibold inline-block">
                    jwter84c Cloud
                  </span>
                </div>
              </div>

              <div className="bg-white p-3.5 sm:p-5 border border-[#E5E0D8] rounded-2xs flex flex-col justify-between h-full shadow-2xs">
                <div>
                  <div className="flex items-center justify-between text-[#6F7775] mb-1.5">
                    <span className="text-[11px] sm:text-xs font-semibold truncate">Database</span>
                    <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                  </div>
                  <div className="text-lg sm:text-2xl font-serif font-bold text-[#23484A]">
                    Supabase
                  </div>
                </div>
                <div className="pt-2">
                  <span className="text-[9px] sm:text-[10px] text-green-700 bg-green-50 px-2 py-0.5 rounded-2xs font-semibold inline-block">
                    Synced Live
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Products List */}
            <div className="bg-white p-4 sm:p-6 border border-[#E5E0D8] rounded-2xs space-y-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-lg sm:text-xl text-[#23484A]">Live Products ({products.length})</h2>
                <button
                  onClick={() => setActiveTab('products')}
                  className="text-xs text-[#23484A] font-semibold hover:underline"
                >
                  Manage All Products →
                </button>
              </div>

              {products.length === 0 ? (
                <div className="text-center py-10 space-y-3 bg-[#F8F5EF] border border-[#E5E0D8] rounded-2xs">
                  <ShoppingBag className="w-8 h-8 text-[#C7A66A] mx-auto" />
                  <p className="text-xs text-[#6F7775]">No products created yet. Upload your first product below.</p>
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="btn bg-[#23484A] text-white text-xs font-semibold px-4 py-2 rounded-xs inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Upload Product to Cloudinary</span>
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
                    {products.slice(0, 4).map((p) => (
                      <div key={p.id} className="border border-[#E5E0D8] p-2.5 sm:p-3 rounded-2xs flex flex-col justify-between h-full bg-[#F8F5EF] shadow-2xs hover:border-[#23484A]/40 transition-colors">
                        <div className="relative aspect-[3/4] w-full bg-white overflow-hidden rounded-xs">
                          <Image
                            src={p.images[0]?.url || '/images/placeholder.jpg'}
                            alt={p.name}
                            fill
                            className="object-cover object-top"
                          />
                        </div>
                        <div className="space-y-1 pt-2">
                          <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-[#C7A66A] block">
                            {p.type}
                          </span>
                          <h4 className="font-serif text-xs sm:text-sm font-medium text-[#243234] line-clamp-1">{p.name}</h4>
                          <p className="text-xs sm:text-sm font-bold text-[#23484A]">₹ {p.price.toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {products.length > 4 && (
                    <div className="text-center pt-2 border-t border-[#E5E0D8]">
                      <button
                        onClick={() => setActiveTab('products')}
                        className="text-xs font-semibold text-[#23484A] hover:bg-[#F8F5EF] border border-[#E5E0D8] px-4 py-2 rounded-xs transition-colors inline-flex items-center gap-1.5"
                      >
                        <span>View All {products.length} Products in Products Tab</span>
                        <span>→</span>
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: ANALYTICS (100% Live DB Metrics) */}
        {activeTab === 'analytics' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white p-4 sm:p-6 border border-[#E5E0D8] rounded-2xs space-y-5 sm:space-y-6 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E5E0D8] pb-4 gap-2">
                <div>
                  <h2 className="font-serif text-xl sm:text-2xl text-[#23484A]">Store Performance Analytics</h2>
                  <p className="text-[11px] sm:text-xs text-[#6F7775]">Live metrics calculated from Supabase orders database.</p>
                </div>
                <span className="text-[10px] sm:text-xs font-bold bg-[#F8F5EF] border border-[#E5E0D8] px-3 py-1 text-[#23484A] rounded-2xs self-start sm:self-auto">
                  Live DB Synced
                </span>
              </div>

              {/* Analytics Metric Cards - Equal height aligned cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-1">
                <div className="p-4 sm:p-5 border border-[#E5E0D8] bg-[#F8F5EF] rounded-2xs flex flex-col justify-between h-full shadow-2xs">
                  <div>
                    <div className="flex items-center justify-between text-[#6F7775] mb-1">
                      <span className="text-[11px] sm:text-xs font-semibold">Total Live Sales Revenue</span>
                      <DollarSign className="w-4 h-4 text-[#C7A66A]" />
                    </div>
                    <div className="text-xl sm:text-2xl font-serif font-bold text-[#23484A] my-1">
                      ₹ {totalRevenue.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <span className="text-[10px] text-[#6F7775] pt-1">Sum of all DB orders</span>
                </div>

                <div className="p-4 sm:p-5 border border-[#E5E0D8] bg-[#F8F5EF] rounded-2xs flex flex-col justify-between h-full shadow-2xs">
                  <div>
                    <div className="flex items-center justify-between text-[#6F7775] mb-1">
                      <span className="text-[11px] sm:text-xs font-semibold">Total Completed Orders</span>
                      <ShoppingBag className="w-4 h-4 text-[#23484A]" />
                    </div>
                    <div className="text-xl sm:text-2xl font-serif font-bold text-[#23484A] my-1">
                      {orders.length}
                    </div>
                  </div>
                  <span className="text-[10px] text-[#6F7775] pt-1">Checkout submissions</span>
                </div>

                <div className="p-4 sm:p-5 border border-[#E5E0D8] bg-[#F8F5EF] rounded-2xs flex flex-col justify-between h-full shadow-2xs">
                  <div>
                    <div className="flex items-center justify-between text-[#6F7775] mb-1">
                      <span className="text-[11px] sm:text-xs font-semibold">Average Order Value (AOV)</span>
                      <TrendingUp className="w-4 h-4 text-[#C7A66A]" />
                    </div>
                    <div className="text-xl sm:text-2xl font-serif font-bold text-[#23484A] my-1">
                      ₹ {avgOrderValue.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <span className="text-[10px] text-[#6F7775] pt-1">Per transaction average</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: PRODUCTS CMS */}
        {activeTab === 'products' && (
          <div className="bg-white p-4 sm:p-6 border border-[#E5E0D8] rounded-2xs space-y-5 sm:space-y-6 shadow-2xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#E5E0D8] pb-4">
              <div>
                <h2 className="font-serif text-lg sm:text-xl text-[#23484A]">Products CMS ({filteredProducts.length})</h2>
                <p className="text-[11px] sm:text-xs text-[#6F7775]">Upload photos to Cloudinary and manage product listings in Supabase DB.</p>
              </div>

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="btn bg-[#23484A] hover:bg-[#1A3536] text-white text-xs font-semibold px-4 py-2 rounded-xs flex items-center gap-1.5 shadow-2xs transition-colors self-start sm:self-auto cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>

            {/* Filter & Search Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 bg-[#F8F5EF] p-2.5 sm:p-3 border border-[#E5E0D8] rounded-2xs">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-[#6F7775] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search products by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-[#E5E0D8] pl-9 pr-3 py-1.5 text-xs rounded-2xs focus:outline-none focus:border-[#23484A]"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="w-3.5 h-3.5 text-[#6F7775]" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-white border border-[#E5E0D8] text-xs px-3 py-1.5 rounded-2xs focus:outline-none cursor-pointer flex-1 sm:flex-initial"
                >
                  <option value="ALL">All Types</option>
                  <option value="CUSTOM">Custom Made</option>
                  <option value="READY_STOCK">Ready to Ship</option>
                  <option value="FABRIC">Fabric</option>
                </select>
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-10 space-y-3 bg-[#F8F5EF] border border-[#E5E0D8] rounded-2xs">
                <ShoppingBag className="w-8 h-8 text-[#C7A66A] mx-auto" />
                <p className="text-xs text-[#6F7775]">No matching products found.</p>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="btn bg-[#23484A] text-white text-xs font-semibold px-4 py-2 rounded-xs inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Upload Product to Cloudinary</span>
                </button>
              </div>
            ) : (
              <>
                {/* Mobile Responsive Aligned Cards Grid (< md) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:hidden">
                  {filteredProducts.map((prod) => (
                    <div
                      key={prod.id}
                      className="bg-[#F8F5EF] border border-[#E5E0D8] p-3 rounded-2xs flex items-center justify-between gap-3 shadow-2xs hover:border-[#23484A]/40 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative w-14 h-18 bg-white overflow-hidden rounded-xs border border-[#E5E0D8] shrink-0">
                          <Image
                            src={prod.images[0]?.url || '/images/placeholder.jpg'}
                            alt={prod.name}
                            fill
                            className="object-cover object-top"
                          />
                        </div>
                        <div className="min-w-0 space-y-0.5">
                          <span className="text-[9px] font-bold text-[#C7A66A] uppercase tracking-wider block">
                            {prod.type}
                          </span>
                          <h4 className="font-semibold text-xs text-[#243234] truncate" title={prod.name}>
                            {prod.name}
                          </h4>
                          <p className="text-xs font-bold text-[#23484A]">₹ {prod.price.toLocaleString('en-IN')}</p>
                          <span className="text-[10px] text-[#6F7775] block">{prod.stock || 50} in stock</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5 shrink-0">
                        <Link
                          href={`/shop/${prod.slug}`}
                          target="_blank"
                          className="p-1.5 bg-white border border-[#E5E0D8] text-[#6F7775] hover:text-[#23484A] rounded-xs flex items-center justify-center transition-colors"
                          title="View on store"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDeleteProduct(prod.id)}
                          className="p-1.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-xs flex items-center justify-center transition-colors"
                          title="Delete product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Tabular View (>= md) */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#E5E0D8] text-[#23484A] bg-[#F8F5EF]">
                        <th className="p-3">Image</th>
                        <th className="p-3">Product Name</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Price</th>
                        <th className="p-3">Stock</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E0D8]">
                      {filteredProducts.map((prod) => (
                        <tr key={prod.id} className="hover:bg-[#F8F5EF] transition-colors">
                          <td className="p-3">
                            <div className="relative w-10 h-12 bg-[#F8F5EF] overflow-hidden rounded-2xs border border-[#E5E0D8]">
                              <Image
                                src={prod.images[0]?.url || '/images/placeholder.jpg'}
                                alt={prod.name}
                                fill
                                className="object-cover object-top"
                              />
                            </div>
                          </td>
                          <td className="p-3 font-semibold text-[#243234]">{prod.name}</td>
                          <td className="p-3">
                            <span className="bg-[#23484A]/10 text-[#23484A] text-[9px] font-bold px-2 py-0.5 rounded-2xs">
                              {prod.type}
                            </span>
                          </td>
                          <td className="p-3 font-bold text-[#23484A]">
                            ₹ {prod.price.toLocaleString('en-IN')}
                          </td>
                          <td className="p-3 text-[#6F7775]">{prod.stock || 50} pcs</td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                href={`/shop/${prod.slug}`}
                                target="_blank"
                                className="p-1.5 text-[#6F7775] hover:text-[#23484A] transition-colors"
                                title="View on store"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Link>
                              <button
                                onClick={() => handleDeleteProduct(prod.id)}
                                className="p-1.5 text-red-600 hover:text-red-800 transition-colors"
                                title="Delete product"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* Tab 4: HERO & SITE CMS */}
        {activeTab === 'site_cms' && (
          <div className="bg-white p-4 sm:p-6 border border-[#E5E0D8] rounded-2xs space-y-5 sm:space-y-6 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E5E0D8] gap-3">
              <div>
                <h2 className="font-serif text-lg sm:text-xl text-[#23484A]">Hero Artwork & Store Banners CMS</h2>
                <p className="text-[11px] sm:text-xs text-[#6F7775]">Manage all 3 rotating banners for Desktop and Mobile views, and login artwork.</p>
              </div>
              <button
                type="button"
                onClick={handleResetBanners}
                disabled={isSavingSettings}
                className="text-[11px] font-semibold text-[#8C2A36] border border-[#8C2A36]/30 hover:bg-[#8C2A36]/5 px-3 py-1.5 rounded-2xs transition-colors self-start sm:self-auto"
                title="Reset to default curated store banners"
              >
                Reset Curated Banners
              </button>
            </div>

            {settingsMessage && (
              <div
                className={`p-3 text-xs rounded-2xs border ${
                  settingsMessage.type === 'success'
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}
              >
                {settingsMessage.text}
              </div>
            )}

            {/* Sub-tab navigation for 3 Banners + Login — 4-item grid, NO scrolling */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pb-1 border-b border-[#E5E0D8]">
              <button
                type="button"
                onClick={() => setBannerTab('slide1')}
                className={`py-2 px-2 text-xs font-semibold rounded-2xs transition-colors text-center ${
                  bannerTab === 'slide1'
                    ? 'bg-[#23484A] text-white shadow-xs'
                    : 'bg-[#F8F5EF] text-[#243234] hover:bg-[#EBE5D9]'
                }`}
              >
                Slide 1 (Hero)
              </button>
              <button
                type="button"
                onClick={() => setBannerTab('slide2')}
                className={`py-2 px-2 text-xs font-semibold rounded-2xs transition-colors text-center ${
                  bannerTab === 'slide2'
                    ? 'bg-[#23484A] text-white shadow-xs'
                    : 'bg-[#F8F5EF] text-[#243234] hover:bg-[#EBE5D9]'
                }`}
              >
                Slide 2 (Arrivals)
              </button>
              <button
                type="button"
                onClick={() => setBannerTab('slide3')}
                className={`py-2 px-2 text-xs font-semibold rounded-2xs transition-colors text-center ${
                  bannerTab === 'slide3'
                    ? 'bg-[#23484A] text-white shadow-xs'
                    : 'bg-[#F8F5EF] text-[#243234] hover:bg-[#EBE5D9]'
                }`}
              >
                Slide 3 (Occasion)
              </button>
              <button
                type="button"
                onClick={() => setBannerTab('login')}
                className={`py-2 px-2 text-xs font-semibold rounded-2xs transition-colors text-center ${
                  bannerTab === 'login'
                    ? 'bg-[#23484A] text-white shadow-xs'
                    : 'bg-[#F8F5EF] text-[#243234] hover:bg-[#EBE5D9]'
                }`}
              >
                Login Artwork
              </button>
            </div>

            <form onSubmit={handleSaveSiteSettings} className="space-y-6 text-xs max-w-4xl">
              {/* SLIDE 1 */}
              {bannerTab === 'slide1' && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="p-3 bg-[#FAF8F5] border border-[#E5E0D8] rounded-2xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#C7A66A]">Slide 1 • Primary Showcase</span>
                    <h3 className="font-serif text-base text-[#23484A]">First Rotating Hero Slide</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-[#243234] font-semibold">Slide 1 Headline</label>
                      <input
                        type="text"
                        value={siteSettings.heroTitle}
                        onChange={(e) => setSiteSettings({ ...siteSettings, heroTitle: e.target.value })}
                        className="w-full border border-[#E5E0D8] p-2.5 rounded-2xs focus:outline-none focus:border-[#23484A] bg-white"
                        placeholder="Where Style Meets Your Story"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[#243234] font-semibold">Slide 1 Subtitle</label>
                      <input
                        type="text"
                        value={siteSettings.heroSubtitle}
                        onChange={(e) => setSiteSettings({ ...siteSettings, heroSubtitle: e.target.value })}
                        className="w-full border border-[#E5E0D8] p-2.5 rounded-2xs focus:outline-none focus:border-[#23484A] bg-white"
                        placeholder="Specially curated for Women"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-2 items-stretch">
                    {/* Desktop Banner 1 */}
                    <div className="p-4 sm:p-5 border border-[#E5E0D8] bg-[#F8F5EF] rounded-2xs flex flex-col justify-between h-full shadow-2xs space-y-3.5">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-[#23484A] text-xs sm:text-sm">Desktop Banner (16:9 Landscape)</h4>
                        <span className="text-[10px] bg-white px-2 py-0.5 border border-[#E5E0D8] text-[#6F7775] rounded-full">Slide 1</span>
                      </div>
                      <div className="relative w-full aspect-[16/9] bg-white border border-[#E5E0D8] overflow-hidden rounded-2xs shadow-2xs my-auto">
                        <Image
                          src={desktopHeroPreview || siteSettings.heroDesktopImage || '/images/hero-latest.jpg'}
                          alt="Slide 1 Desktop Banner"
                          fill
                          className="object-cover object-center"
                        />
                      </div>
                      <div className="space-y-1.5 pt-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            setDesktopHeroFile(file);
                            if (file) setDesktopHeroPreview(URL.createObjectURL(file));
                          }}
                          className="w-full border border-[#E5E0D8] p-2 rounded-2xs bg-white text-xs file:mr-3 file:py-1 file:px-2.5 file:rounded-2xs file:border-0 file:text-[11px] file:font-semibold file:bg-[#23484A] file:text-white hover:file:bg-[#1A3536] cursor-pointer"
                        />
                        <p className="text-[10px] text-[#6F7775]">Upload 1920×1080 or 1600×900 desktop banner.</p>
                      </div>
                    </div>

                    {/* Mobile Banner 1 */}
                    <div className="p-4 sm:p-5 border border-[#E5E0D8] bg-[#F8F5EF] rounded-2xs flex flex-col justify-between h-full shadow-2xs space-y-3.5">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-[#23484A] text-xs sm:text-sm">Mobile Banner (3:4 Vertical)</h4>
                        <span className="text-[10px] bg-white px-2 py-0.5 border border-[#E5E0D8] text-[#6F7775] rounded-full">Slide 1</span>
                      </div>
                      <div className="flex flex-col items-center justify-center my-auto py-1">
                        <div className="relative w-40 sm:w-44 aspect-[3/4] bg-white border border-[#E5E0D8] overflow-hidden rounded-2xs shadow-2xs">
                          <Image
                            src={mobileHeroPreview || siteSettings.heroMobileImage || '/images/mobileview/fabstore-mobilebanner1.png'}
                            alt="Slide 1 Mobile Banner"
                            fill
                            className="object-cover object-center"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5 pt-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            setMobileHeroFile(file);
                            if (file) setMobileHeroPreview(URL.createObjectURL(file));
                          }}
                          className="w-full border border-[#E5E0D8] p-2 rounded-2xs bg-white text-xs file:mr-3 file:py-1 file:px-2.5 file:rounded-2xs file:border-0 file:text-[11px] file:font-semibold file:bg-[#23484A] file:text-white hover:file:bg-[#1A3536] cursor-pointer"
                        />
                        <p className="text-[10px] text-[#6F7775]">Upload 900×1200 or 1080×1440 portrait mobile banner.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SLIDE 2 */}
              {bannerTab === 'slide2' && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="p-3 bg-[#FAF8F5] border border-[#E5E0D8] rounded-2xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#C7A66A]">Slide 2 • New Arrivals & Season</span>
                    <h3 className="font-serif text-base text-[#23484A]">Second Rotating Hero Slide</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-[#243234] font-semibold">Slide 2 Headline</label>
                      <input
                        type="text"
                        value={siteSettings.heroTitle2 || 'Crafted with Love & Detail'}
                        onChange={(e) => setSiteSettings({ ...siteSettings, heroTitle2: e.target.value })}
                        className="w-full border border-[#E5E0D8] p-2.5 rounded-2xs focus:outline-none focus:border-[#23484A] bg-white"
                        placeholder="Crafted with Love & Detail"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[#243234] font-semibold">Slide 2 Subtitle</label>
                      <input
                        type="text"
                        value={siteSettings.heroSubtitle2 || 'Timeless Occasion Wear & Bespoke Couture'}
                        onChange={(e) => setSiteSettings({ ...siteSettings, heroSubtitle2: e.target.value })}
                        className="w-full border border-[#E5E0D8] p-2.5 rounded-2xs focus:outline-none focus:border-[#23484A] bg-white"
                        placeholder="Timeless Occasion Wear & Bespoke Couture"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-2 items-stretch">
                    {/* Desktop Banner 2 */}
                    <div className="p-4 sm:p-5 border border-[#E5E0D8] bg-[#F8F5EF] rounded-2xs flex flex-col justify-between h-full shadow-2xs space-y-3.5">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-[#23484A] text-xs sm:text-sm">Desktop Banner (16:9 Landscape)</h4>
                        <span className="text-[10px] bg-white px-2 py-0.5 border border-[#E5E0D8] text-[#6F7775] rounded-full">Slide 2</span>
                      </div>
                      <div className="relative w-full aspect-[16/9] bg-white border border-[#E5E0D8] overflow-hidden rounded-2xs shadow-2xs my-auto">
                        <Image
                          src={desktopHero2Preview || siteSettings.heroDesktopImage2 || '/images/mobileview/fabstore-banner2.png'}
                          alt="Slide 2 Desktop Banner"
                          fill
                          className="object-cover object-center"
                        />
                      </div>
                      <div className="space-y-1.5 pt-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            setDesktopHero2File(file);
                            if (file) setDesktopHero2Preview(URL.createObjectURL(file));
                          }}
                          className="w-full border border-[#E5E0D8] p-2 rounded-2xs bg-white text-xs file:mr-3 file:py-1 file:px-2.5 file:rounded-2xs file:border-0 file:text-[11px] file:font-semibold file:bg-[#23484A] file:text-white hover:file:bg-[#1A3536] cursor-pointer"
                        />
                        <p className="text-[10px] text-[#6F7775]">Upload 1920×1080 or 1600×900 desktop banner.</p>
                      </div>
                    </div>

                    {/* Mobile Banner 2 */}
                    <div className="p-4 sm:p-5 border border-[#E5E0D8] bg-[#F8F5EF] rounded-2xs flex flex-col justify-between h-full shadow-2xs space-y-3.5">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-[#23484A] text-xs sm:text-sm">Mobile Banner (3:4 Vertical)</h4>
                        <span className="text-[10px] bg-white px-2 py-0.5 border border-[#E5E0D8] text-[#6F7775] rounded-full">Slide 2</span>
                      </div>
                      <div className="flex flex-col items-center justify-center my-auto py-1">
                        <div className="relative w-40 sm:w-44 aspect-[3/4] bg-white border border-[#E5E0D8] overflow-hidden rounded-2xs shadow-2xs">
                          <Image
                            src={mobileHero2Preview || siteSettings.heroMobileImage2 || '/images/mobileview/fabstore-mobilebanner2.png'}
                            alt="Slide 2 Mobile Banner"
                            fill
                            className="object-cover object-center"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5 pt-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            setMobileHero2File(file);
                            if (file) setMobileHero2Preview(URL.createObjectURL(file));
                          }}
                          className="w-full border border-[#E5E0D8] p-2 rounded-2xs bg-white text-xs file:mr-3 file:py-1 file:px-2.5 file:rounded-2xs file:border-0 file:text-[11px] file:font-semibold file:bg-[#23484A] file:text-white hover:file:bg-[#1A3536] cursor-pointer"
                        />
                        <p className="text-[10px] text-[#6F7775]">Upload 900×1200 or 1080×1440 portrait mobile banner.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SLIDE 3 */}
              {bannerTab === 'slide3' && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="p-3 bg-[#FAF8F5] border border-[#E5E0D8] rounded-2xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#C7A66A]">Slide 3 • Bespoke Occasion Wear</span>
                    <h3 className="font-serif text-base text-[#23484A]">Third Rotating Hero Slide</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-[#243234] font-semibold">Slide 3 Headline</label>
                      <input
                        type="text"
                        value={siteSettings.heroTitle3 || 'Designed for Every Moment'}
                        onChange={(e) => setSiteSettings({ ...siteSettings, heroTitle3: e.target.value })}
                        className="w-full border border-[#E5E0D8] p-2.5 rounded-2xs focus:outline-none focus:border-[#23484A] bg-white"
                        placeholder="Designed for Every Moment"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[#243234] font-semibold">Slide 3 Subtitle</label>
                      <input
                        type="text"
                        value={siteSettings.heroSubtitle3 || 'Curated luxury & handcrafted elegance'}
                        onChange={(e) => setSiteSettings({ ...siteSettings, heroSubtitle3: e.target.value })}
                        className="w-full border border-[#E5E0D8] p-2.5 rounded-2xs focus:outline-none focus:border-[#23484A] bg-white"
                        placeholder="Curated luxury & handcrafted elegance"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-2 items-stretch">
                    {/* Desktop Banner 3 */}
                    <div className="p-4 sm:p-5 border border-[#E5E0D8] bg-[#F8F5EF] rounded-2xs flex flex-col justify-between h-full shadow-2xs space-y-3.5">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-[#23484A] text-xs sm:text-sm">Desktop Banner (16:9 Landscape)</h4>
                        <span className="text-[10px] bg-white px-2 py-0.5 border border-[#E5E0D8] text-[#6F7775] rounded-full">Slide 3</span>
                      </div>
                      <div className="relative w-full aspect-[16/9] bg-white border border-[#E5E0D8] overflow-hidden rounded-2xs shadow-2xs my-auto">
                        <Image
                          src={desktopHero3Preview || siteSettings.heroDesktopImage3 || '/images/mobileview/fabstore-banner3.png'}
                          alt="Slide 3 Desktop Banner"
                          fill
                          className="object-cover object-center"
                        />
                      </div>
                      <div className="space-y-1.5 pt-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            setDesktopHero3File(file);
                            if (file) setDesktopHero3Preview(URL.createObjectURL(file));
                          }}
                          className="w-full border border-[#E5E0D8] p-2 rounded-2xs bg-white text-xs file:mr-3 file:py-1 file:px-2.5 file:rounded-2xs file:border-0 file:text-[11px] file:font-semibold file:bg-[#23484A] file:text-white hover:file:bg-[#1A3536] cursor-pointer"
                        />
                        <p className="text-[10px] text-[#6F7775]">Upload 1920×1080 or 1600×900 desktop banner.</p>
                      </div>
                    </div>

                    {/* Mobile Banner 3 */}
                    <div className="p-4 sm:p-5 border border-[#E5E0D8] bg-[#F8F5EF] rounded-2xs flex flex-col justify-between h-full shadow-2xs space-y-3.5">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-[#23484A] text-xs sm:text-sm">Mobile Banner (3:4 Vertical)</h4>
                        <span className="text-[10px] bg-white px-2 py-0.5 border border-[#E5E0D8] text-[#6F7775] rounded-full">Slide 3</span>
                      </div>
                      <div className="flex flex-col items-center justify-center my-auto py-1">
                        <div className="relative w-40 sm:w-44 aspect-[3/4] bg-white border border-[#E5E0D8] overflow-hidden rounded-2xs shadow-2xs">
                          <Image
                            src={mobileHero3Preview || siteSettings.heroMobileImage3 || '/images/mobileview/fabstore-mobileview3.png'}
                            alt="Slide 3 Mobile Banner"
                            fill
                            className="object-cover object-center"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5 pt-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            setMobileHero3File(file);
                            if (file) setMobileHero3Preview(URL.createObjectURL(file));
                          }}
                          className="w-full border border-[#E5E0D8] p-2 rounded-2xs bg-white text-xs file:mr-3 file:py-1 file:px-2.5 file:rounded-2xs file:border-0 file:text-[11px] file:font-semibold file:bg-[#23484A] file:text-white hover:file:bg-[#1A3536] cursor-pointer"
                        />
                        <p className="text-[10px] text-[#6F7775]">Upload 900×1200 or 1080×1440 portrait mobile banner.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* LOGIN CMS TAB */}
              {bannerTab === 'login' && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="p-3 bg-[#FAF8F5] border border-[#E5E0D8] rounded-2xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#C7A66A]">Authentication CMS</span>
                    <h3 className="font-serif text-base text-[#23484A]">Customer Login Page Artwork & Heading</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-[#243234] font-semibold">Login Page Title</label>
                      <input
                        type="text"
                        value={siteSettings.loginTitle || 'Where Style\nMeets Your Story'}
                        onChange={(e) => setSiteSettings({ ...siteSettings, loginTitle: e.target.value })}
                        placeholder="Where Style Meets Your Story"
                        className="w-full border border-[#E5E0D8] p-2.5 rounded-2xs focus:outline-none focus:border-[#23484A] bg-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[#243234] font-semibold">Login Page Subtitle</label>
                      <input
                        type="text"
                        value={siteSettings.loginSubtitle || 'FABSTORY BY FASNA'}
                        onChange={(e) => setSiteSettings({ ...siteSettings, loginSubtitle: e.target.value })}
                        placeholder="FABSTORY BY FASNA"
                        className="w-full border border-[#E5E0D8] p-2.5 rounded-2xs focus:outline-none focus:border-[#23484A] bg-white"
                      />
                    </div>
                  </div>

                  {/* Login Image Uploader */}
                  <div className="p-4 sm:p-5 border border-[#E5E0D8] bg-[#F8F5EF] rounded-2xs space-y-3 max-w-lg shadow-2xs">
                    <h4 className="font-semibold text-[#23484A] text-xs sm:text-sm">Login Side Banner Image</h4>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="relative w-28 aspect-[3/4] bg-white border border-[#E5E0D8] overflow-hidden rounded-2xs shadow-2xs shrink-0 mx-auto sm:mx-0">
                        <Image
                          src={loginHeroPreview || siteSettings.loginImage || '/images/craftsmanship.jpg'}
                          alt="Login Artwork"
                          fill
                          className="object-cover object-center"
                        />
                      </div>
                      <div className="space-y-2 flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            setLoginHeroFile(file);
                            if (file) setLoginHeroPreview(URL.createObjectURL(file));
                          }}
                          className="w-full border border-[#E5E0D8] p-2 rounded-2xs bg-white text-xs file:mr-2 file:py-1 file:px-2 file:rounded-2xs file:border-0 file:text-[10px] file:font-semibold file:bg-[#23484A] file:text-white hover:file:bg-[#1A3536] cursor-pointer"
                        />
                        <p className="text-[10px] text-[#6F7775]">Upload campaign portrait artwork for customer login screen.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#E5E0D8] flex flex-wrap items-center justify-end gap-3">
                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="w-full sm:w-auto btn bg-[#23484A] hover:bg-[#1A3536] text-white px-6 py-2.5 rounded-2xs font-semibold uppercase tracking-wider disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  {isSavingSettings && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSavingSettings ? 'Uploading & Saving to Cloudinary...' : 'Save All Banners & Settings'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 5: ORDERS */}
        {activeTab === 'orders' && (
          <div className="bg-white p-4 sm:p-6 border border-[#E5E0D8] rounded-2xs space-y-5 sm:space-y-6 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E5E0D8] pb-4 gap-2">
              <div>
                <h2 className="font-serif text-lg sm:text-xl text-[#23484A]">Customer Orders ({orders.length})</h2>
                <p className="text-[11px] sm:text-xs text-[#6F7775]">Manage live order statuses, tracking numbers, and automated email updates.</p>
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-10 space-y-3 bg-[#F8F5EF] border border-[#E5E0D8] rounded-2xs">
                <ShoppingBag className="w-8 h-8 text-[#C7A66A] mx-auto" />
                <p className="text-xs text-[#6F7775]">No live customer orders placed yet in database.</p>
              </div>
            ) : (
              <>
                {/* Mobile Responsive Aligned Order Cards (< md) */}
                <div className="space-y-3 md:hidden">
                  {orders.map((ord) => {
                    const isUpdating = updatingOrderId === ord.id;
                    return (
                      <div
                        key={ord.id}
                        className="bg-[#F8F5EF] border border-[#E5E0D8] p-3.5 sm:p-4 rounded-2xs space-y-3 shadow-2xs hover:border-[#23484A]/30 transition-colors"
                      >
                        {/* Header: Order #, Date, and Amount */}
                        <div className="flex items-start justify-between border-b border-[#E5E0D8] pb-2.5">
                          <div>
                            <span className="font-bold text-sm text-[#23484A] block">
                              {ord.order_number}
                            </span>
                            <span className="text-[10px] text-[#6F7775]">
                              {ord.created_at ? new Date(ord.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-base font-bold text-[#23484A] block">
                              ₹ {ord.total_amount}
                            </span>
                            <span className="text-[9px] uppercase tracking-wider text-[#C7A66A] font-semibold">
                              Total Amount
                            </span>
                          </div>
                        </div>

                        {/* Customer Info */}
                        <div className="text-xs space-y-1">
                          <div className="font-semibold text-[#243234]">{ord.customer_name}</div>
                          <div className="text-[#6F7775] text-[11px] truncate">{ord.customer_email}</div>
                          {ord.customer_phone && (
                            <div className="text-[#8C9B9A] text-[11px]">{ord.customer_phone}</div>
                          )}
                        </div>

                        {/* Status Update & Brevo Email Triggers */}
                        <div className="pt-2 border-t border-[#E5E0D8] space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <label className="text-[11px] font-semibold text-[#243234]">Order Status:</label>
                            <div className="flex items-center gap-2">
                              <select
                                value={ord.status || 'PENDING'}
                                disabled={isUpdating}
                                onChange={(e) => {
                                  const newStatus = e.target.value;
                                  let tracking = ord.tracking_number;
                                  if (newStatus === 'SHIPPED' && !tracking) {
                                    tracking =
                                      window.prompt(
                                        'Enter tracking number for shipment notification (optional):',
                                        ''
                                      ) || undefined;
                                  }
                                  handleUpdateOrderStatus(ord.id, newStatus, tracking);
                                }}
                                className="border border-[#D9D3C8] rounded-xs px-2.5 py-1 bg-white text-xs font-semibold text-[#23484A] focus:outline-none focus:border-[#23484A] cursor-pointer disabled:opacity-50"
                              >
                                <option value="PENDING">PENDING</option>
                                <option value="PROCESSING">PROCESSING</option>
                                <option value="SHIPPED">SHIPPED</option>
                                <option value="DELIVERED">DELIVERED</option>
                                <option value="CANCELLED">CANCELLED</option>
                              </select>
                              {isUpdating && <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#C7A66A]" />}
                            </div>
                          </div>

                          {/* Brevo Indicators */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                            {ord.confirmation_email_sent && (
                              <span className="inline-flex items-center text-[9px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-2xs">
                                ✉ Confirmed
                              </span>
                            )}
                            {ord.shipped_email_sent && (
                              <span className="inline-flex items-center text-[9px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded-2xs">
                                ✉ Shipped
                              </span>
                            )}
                            {ord.delivered_email_sent && (
                              <span className="inline-flex items-center text-[9px] font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded-2xs">
                                ✉ Delivered
                              </span>
                            )}
                          </div>

                          {/* Tracking Number */}
                          <div className="text-[11px] text-[#6F7775] pt-0.5">
                            <span className="font-semibold text-[#243234]">Tracking: </span>
                            {ord.tracking_number ? (
                              <span className="font-mono bg-white border border-[#E5E0D8] px-2 py-0.5 rounded-2xs inline-block">
                                {ord.tracking_number}
                              </span>
                            ) : (
                              <span className="text-[#A0A8A6] italic">No tracking info</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop Tabular View (>= md) */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#E5E0D8] text-[#23484A] bg-[#F8F5EF]">
                        <th className="p-3">Order #</th>
                        <th className="p-3">Customer</th>
                        <th className="p-3">Email & Phone</th>
                        <th className="p-3">Total Amount</th>
                        <th className="p-3">Status & Brevo Triggers</th>
                        <th className="p-3">Tracking Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E0D8]">
                      {orders.map((ord) => {
                        const isUpdating = updatingOrderId === ord.id;
                        return (
                          <tr key={ord.id} className="hover:bg-[#FAF8F5] transition-colors">
                            <td className="p-3 font-bold text-[#23484A]">
                              <span>{ord.order_number}</span>
                              <span className="block text-[10px] text-[#6F7775] font-normal">
                                {ord.created_at ? new Date(ord.created_at).toLocaleDateString('en-IN') : ''}
                              </span>
                            </td>
                            <td className="p-3 font-medium text-[#243234]">{ord.customer_name}</td>
                            <td className="p-3 text-[#6F7775]">
                              <span className="block">{ord.customer_email}</span>
                              {ord.customer_phone && (
                                <span className="block text-[10px] text-[#8C9B9A]">{ord.customer_phone}</span>
                              )}
                            </td>
                            <td className="p-3 font-bold text-[#23484A]">₹ {ord.total_amount}</td>
                            <td className="p-3 space-y-1.5">
                              <div className="flex items-center gap-2">
                                <select
                                  value={ord.status || 'PENDING'}
                                  disabled={isUpdating}
                                  onChange={(e) => {
                                    const newStatus = e.target.value;
                                    let tracking = ord.tracking_number;
                                    if (newStatus === 'SHIPPED' && !tracking) {
                                      tracking =
                                        window.prompt(
                                          'Enter tracking number for shipment notification (optional):',
                                          ''
                                        ) || undefined;
                                    }
                                    handleUpdateOrderStatus(ord.id, newStatus, tracking);
                                  }}
                                  className="border border-[#D9D3C8] rounded-xs px-2 py-1 bg-white text-xs font-semibold text-[#23484A] focus:outline-none focus:border-[#23484A] cursor-pointer disabled:opacity-50"
                                >
                                  <option value="PENDING">PENDING</option>
                                  <option value="PROCESSING">PROCESSING</option>
                                  <option value="SHIPPED">SHIPPED</option>
                                  <option value="DELIVERED">DELIVERED</option>
                                  <option value="CANCELLED">CANCELLED</option>
                                </select>
                                {isUpdating && <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#C7A66A]" />}
                              </div>

                              {/* Brevo Notification Indicators */}
                              <div className="flex flex-wrap gap-1 pt-0.5">
                                {ord.confirmation_email_sent && (
                                  <span className="inline-flex items-center text-[9px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-2xs">
                                    ✉ Confirmed
                                  </span>
                                )}
                                {ord.shipped_email_sent && (
                                  <span className="inline-flex items-center text-[9px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded-2xs">
                                    ✉ Shipped
                                  </span>
                                )}
                                {ord.delivered_email_sent && (
                                  <span className="inline-flex items-center text-[9px] font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded-2xs">
                                    ✉ Delivered
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-3 text-[11px] text-[#6F7775]">
                              {ord.tracking_number ? (
                                <span className="font-mono bg-white border border-[#E5E0D8] px-2 py-0.5 rounded-2xs inline-block">
                                  {ord.tracking_number}
                                </span>
                              ) : (
                                <span className="text-[#A0A8A6] italic">No tracking info</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {/* ============================================================ */}
      {/* ADVANCED ADD PRODUCT MODAL — Cloudinary Drag & Drop Preview  */}
      {/* ============================================================ */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white border border-[#E5E0D8] shadow-2xl w-full max-w-lg p-4 sm:p-6 rounded-xs space-y-4 sm:space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-3">
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-xl text-[#23484A]">Add Product to CMS</h3>
                <span className="text-[10px] font-bold bg-[#003B75]/10 text-[#003B75] px-2 py-0.5 rounded-full">
                  Cloudinary Upload
                </span>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-[#6F7775] hover:text-[#23484A]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formMessage && (
              <div
                className={`p-3 text-xs rounded-2xs border ${
                  formMessage.type === 'success'
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}
              >
                {formMessage.text}
              </div>
            )}

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#243234] font-semibold mb-1">Product Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Saanjh Mustard Tunic"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  required
                  className="w-full border border-[#E5E0D8] p-2.5 rounded-2xs focus:outline-none focus:border-[#23484A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#243234] font-semibold mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    placeholder="1700"
                    value={newProductPrice}
                    onChange={(e) => setNewProductPrice(e.target.value)}
                    required
                    className="w-full border border-[#E5E0D8] p-2.5 rounded-2xs focus:outline-none focus:border-[#23484A]"
                  />
                </div>

                <div>
                  <label className="block text-[#243234] font-semibold mb-1">Compare-At Price (₹)</label>
                  <input
                    type="number"
                    placeholder="2500"
                    value={newProductComparePrice}
                    onChange={(e) => setNewProductComparePrice(e.target.value)}
                    className="w-full border border-[#E5E0D8] p-2.5 rounded-2xs focus:outline-none focus:border-[#23484A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#243234] font-semibold mb-1">Product Type</label>
                  <select
                    value={newProductType}
                    onChange={(e) => setNewProductType(e.target.value as any)}
                    className="w-full border border-[#E5E0D8] p-2.5 rounded-2xs focus:outline-none focus:border-[#23484A] bg-white"
                  >
                    <option value="CUSTOM">Custom Made</option>
                    <option value="READY_STOCK">Ready to Ship</option>
                    <option value="FABRIC">Fabric</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#243234] font-semibold mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={newProductStock}
                    onChange={(e) => setNewProductStock(e.target.value)}
                    className="w-full border border-[#E5E0D8] p-2.5 rounded-2xs focus:outline-none focus:border-[#23484A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#243234] font-semibold mb-1">Product Description</label>
                <textarea
                  rows={3}
                  placeholder="Enter details about fabric, embroidery work, fit and style..."
                  value={newProductDescription}
                  onChange={(e) => setNewProductDescription(e.target.value)}
                  className="w-full border border-[#E5E0D8] p-2.5 rounded-2xs focus:outline-none focus:border-[#23484A]"
                />
              </div>

              {/* Enhanced File Dropzone & Live Preview */}
              <div>
                <label className="block text-[#243234] font-semibold mb-1">Product Photo (Cloudinary Upload)</label>
                
                {filePreview ? (
                  <div className="relative aspect-[4/3] w-full bg-[#F8F5EF] border border-[#E5E0D8] overflow-hidden rounded-2xs mb-2">
                    <Image src={filePreview} alt="Preview" fill className="object-cover object-top" />
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setFilePreview(null);
                      }}
                      className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full shadow-xs"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-[#E5E0D8] hover:border-[#23484A] p-4 text-center block rounded-2xs bg-[#F8F5EF] cursor-pointer transition-colors">
                    <Upload className="w-6 h-6 text-[#C7A66A] mx-auto mb-1" />
                    <span className="text-xs font-semibold text-[#23484A] block">Click to Choose Photo File</span>
                    <span className="text-[10px] text-[#6F7775] block mt-0.5">Supports JPG, PNG, WEBP — Direct Cloudinary Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div className="pt-2 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2 border border-[#E5E0D8] text-[#6F7775] hover:bg-[#F8F5EF] rounded-2xs text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="w-full sm:w-auto btn bg-[#23484A] hover:bg-[#1A3536] text-white px-5 py-2 rounded-2xs font-semibold uppercase tracking-wider disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                >
                  {isUploading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isUploading ? 'Uploading to Cloudinary...' : 'Upload & Save Product'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
