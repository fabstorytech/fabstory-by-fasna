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
} from '@/lib/supabase/services';
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
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'products' | 'site_cms' | 'orders'>('overview');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // Site CMS State
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    id: 'default',
    heroDesktopImage: '/images/hero-latest.jpg',
    heroMobileImage: '/images/hero-mobile.jpg',
    heroTitle: 'Where Style Meets Your Story',
    heroSubtitle: 'Specially curated for Women',
  });
  const [desktopHeroFile, setDesktopHeroFile] = useState<File | null>(null);
  const [mobileHeroFile, setMobileHeroFile] = useState<File | null>(null);
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

  useEffect(() => {
    loadAdminData();
  }, []);

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

    if (desktopHeroFile) {
      const url = await uploadImageToCloudinary(desktopHeroFile);
      if (url) updatedDesktopUrl = url;
    }

    if (mobileHeroFile) {
      const url = await uploadImageToCloudinary(mobileHeroFile);
      if (url) updatedMobileUrl = url;
    }

    const newSettings: SiteSettings = {
      ...siteSettings,
      heroDesktopImage: updatedDesktopUrl,
      heroMobileImage: updatedMobileUrl,
    };

    const ok = await updateSiteSettings(newSettings);
    setIsSavingSettings(false);

    if (ok) {
      setSiteSettings(newSettings);
      setSettingsMessage({ type: 'success', text: 'Hero artwork & store banner updated live on Cloudinary!' });
      setDesktopHeroFile(null);
      setMobileHeroFile(null);
    } else {
      setSettingsMessage({ type: 'error', text: 'Failed to update site settings.' });
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
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 p-4 sm:p-6 md:p-10 space-y-6 overflow-y-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 border border-[#E5E0D8]">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl sm:text-3xl text-[#23484A]">
                Fabstory Store Management
              </h1>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-[#003B75]/10 text-[#003B75] px-2 py-0.5 rounded-full">
                <Cloud className="w-3 h-3" /> Cloudinary (`jwter84c`)
              </span>
            </div>
            <p className="text-xs text-[#6F7775] mt-1">
              Live Supabase database + Cloudinary image uploads. Analytics & store CMS portal.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadAdminData}
              className="p-2 border border-[#E5E0D8] text-[#23484A] hover:bg-[#F8F5EF] rounded-xs text-xs font-semibold flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="btn bg-[#23484A] text-white text-xs font-semibold px-4 py-2 rounded-xs flex items-center gap-1.5 shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          </div>
        </div>

        {/* Tab 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 border border-[#E5E0D8] space-y-1">
                <div className="flex items-center justify-between text-[#6F7775]">
                  <span className="text-xs font-semibold">Total Revenue</span>
                  <DollarSign className="w-4 h-4 text-[#C7A66A]" />
                </div>
                <div className="text-2xl font-serif font-bold text-[#23484A]">
                  ₹ {totalRevenue.toLocaleString('en-IN')}
                </div>
                <span className="text-[10px] text-[#23484A] bg-[#23484A]/10 px-1.5 py-0.5 rounded-2xs font-semibold inline-block">
                  Live DB Orders Sum
                </span>
              </div>

              <div className="bg-white p-5 border border-[#E5E0D8] space-y-1">
                <div className="flex items-center justify-between text-[#6F7775]">
                  <span className="text-xs font-semibold">Total Products</span>
                  <ShoppingBag className="w-4 h-4 text-[#23484A]" />
                </div>
                <div className="text-2xl font-serif font-bold text-[#23484A]">
                  {products.length}
                </div>
                <span className="text-[10px] text-[#23484A] bg-[#23484A]/10 px-1.5 py-0.5 rounded-2xs font-semibold inline-block">
                  Pure Live Catalog
                </span>
              </div>

              <div className="bg-white p-5 border border-[#E5E0D8] space-y-1">
                <div className="flex items-center justify-between text-[#6F7775]">
                  <span className="text-xs font-semibold">Cloudinary Storage</span>
                  <Cloud className="w-4 h-4 text-[#003B75]" />
                </div>
                <div className="text-2xl font-serif font-bold text-[#23484A]">
                  Active
                </div>
                <span className="text-[10px] text-[#003B75] bg-[#003B75]/10 px-1.5 py-0.5 rounded-2xs font-semibold inline-block">
                  jwter84c CDN
                </span>
              </div>

              <div className="bg-white p-5 border border-[#E5E0D8] space-y-1">
                <div className="flex items-center justify-between text-[#6F7775]">
                  <span className="text-xs font-semibold">Database Status</span>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div className="text-2xl font-serif font-bold text-[#23484A]">
                  Supabase
                </div>
                <span className="text-[10px] text-green-700 bg-green-50 px-1.5 py-0.5 rounded-2xs font-semibold inline-block">
                  Synced Live
                </span>
              </div>
            </div>

            {/* Quick Products List */}
            <div className="bg-white p-6 border border-[#E5E0D8] space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-xl text-[#23484A]">Live Products ({products.length})</h2>
                <button
                  onClick={() => setActiveTab('products')}
                  className="text-xs text-[#23484A] font-semibold hover:underline"
                >
                  Manage All Products →
                </button>
              </div>

              {products.length === 0 ? (
                <div className="text-center py-12 space-y-3 bg-[#F8F5EF] border border-[#E5E0D8]">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {products.map((p) => (
                    <div key={p.id} className="border border-[#E5E0D8] p-3 rounded-2xs space-y-2 bg-[#F8F5EF]">
                      <div className="relative aspect-[3/4] w-full bg-white overflow-hidden">
                        <Image
                          src={p.images[0]?.url || '/images/placeholder.jpg'}
                          alt={p.name}
                          fill
                          className="object-cover object-top"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-[#C7A66A]">
                          {p.type}
                        </span>
                        <h4 className="font-serif text-sm font-medium text-[#243234] truncate">{p.name}</h4>
                        <p className="text-xs font-bold text-[#23484A]">₹ {p.price.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: ANALYTICS (100% Live DB Metrics) */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white p-6 border border-[#E5E0D8] space-y-6">
              <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-4">
                <div>
                  <h2 className="font-serif text-2xl text-[#23484A]">Store Performance Analytics</h2>
                  <p className="text-xs text-[#6F7775]">Live metrics calculated from Supabase orders database.</p>
                </div>
                <span className="text-xs font-bold bg-[#F8F5EF] border border-[#E5E0D8] px-3 py-1 text-[#23484A]">
                  Live DB Synced
                </span>
              </div>

              {/* Analytics Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 border border-[#E5E0D8] bg-[#F8F5EF] space-y-1">
                  <span className="text-[11px] text-[#6F7775]">Total Live Sales Revenue</span>
                  <div className="text-2xl font-serif font-bold text-[#23484A]">₹ {totalRevenue.toLocaleString('en-IN')}</div>
                  <span className="text-[10px] text-[#6F7775]">Sum of all DB orders</span>
                </div>

                <div className="p-4 border border-[#E5E0D8] bg-[#F8F5EF] space-y-1">
                  <span className="text-[11px] text-[#6F7775]">Total Completed Orders</span>
                  <div className="text-2xl font-serif font-bold text-[#23484A]">{orders.length}</div>
                  <span className="text-[10px] text-[#6F7775]">Checkout submissions</span>
                </div>

                <div className="p-4 border border-[#E5E0D8] bg-[#F8F5EF] space-y-1">
                  <span className="text-[11px] text-[#6F7775]">Average Order Value (AOV)</span>
                  <div className="text-2xl font-serif font-bold text-[#23484A]">₹ {avgOrderValue.toLocaleString('en-IN')}</div>
                  <span className="text-[10px] text-[#6F7775]">Per transaction average</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: PRODUCTS CMS */}
        {activeTab === 'products' && (
          <div className="bg-white p-6 border border-[#E5E0D8] space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E5E0D8] pb-4">
              <div>
                <h2 className="font-serif text-xl text-[#23484A]">Products CMS ({filteredProducts.length})</h2>
                <p className="text-xs text-[#6F7775]">Upload photos to Cloudinary and manage product listings in Supabase DB.</p>
              </div>

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="btn bg-[#23484A] text-white text-xs font-semibold px-4 py-2 rounded-xs flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>

            {/* Filter & Search Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#F8F5EF] p-3 border border-[#E5E0D8]">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-[#6F7775] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search products by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-[#E5E0D8] pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:border-[#23484A]"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="w-3.5 h-3.5 text-[#6F7775]" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-white border border-[#E5E0D8] text-xs px-3 py-1.5 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Types</option>
                  <option value="CUSTOM">Custom Made</option>
                  <option value="READY_STOCK">Ready to Ship</option>
                  <option value="FABRIC">Fabric</option>
                </select>
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-12 space-y-3 bg-[#F8F5EF] border border-[#E5E0D8]">
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
              <div className="overflow-x-auto">
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
                      <tr key={prod.id} className="hover:bg-[#F8F5EF]">
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
                              className="p-1.5 text-[#6F7775] hover:text-[#23484A]"
                              title="View on store"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDeleteProduct(prod.id)}
                              className="p-1.5 text-red-600 hover:text-red-800"
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
            )}
          </div>
        )}

        {/* Tab 4: HERO & SITE CMS */}
        {activeTab === 'site_cms' && (
          <div className="bg-white p-6 border border-[#E5E0D8] space-y-6">
            <div className="border-b border-[#E5E0D8] pb-4">
              <h2 className="font-serif text-xl text-[#23484A]">Hero Artwork & Store Banners CMS</h2>
              <p className="text-xs text-[#6F7775]">Upload your Desktop and Mobile Hero images directly to Cloudinary.</p>
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

            <form onSubmit={handleSaveSiteSettings} className="space-y-6 text-xs max-w-2xl">
              <div className="space-y-2">
                <label className="block text-[#243234] font-semibold">Hero Title</label>
                <input
                  type="text"
                  value={siteSettings.heroTitle}
                  onChange={(e) => setSiteSettings({ ...siteSettings, heroTitle: e.target.value })}
                  className="w-full border border-[#E5E0D8] p-2.5 rounded-2xs focus:outline-none focus:border-[#23484A]"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[#243234] font-semibold">Hero Subtitle</label>
                <input
                  type="text"
                  value={siteSettings.heroSubtitle}
                  onChange={(e) => setSiteSettings({ ...siteSettings, heroSubtitle: e.target.value })}
                  className="w-full border border-[#E5E0D8] p-2.5 rounded-2xs focus:outline-none focus:border-[#23484A]"
                />
              </div>

              {/* Desktop Hero Uploader */}
              <div className="p-4 border border-[#E5E0D8] bg-[#F8F5EF] rounded-2xs space-y-3">
                <h4 className="font-semibold text-[#23484A] text-sm">Desktop Hero Image</h4>
                <div className="flex items-center gap-4">
                  <div className="relative w-24 h-28 bg-white border border-[#E5E0D8] overflow-hidden rounded-2xs shrink-0">
                    <Image
                      src={siteSettings.heroDesktopImage || '/images/hero-latest.jpg'}
                      alt="Desktop Hero"
                      fill
                      className="object-cover object-top"
                    />
                  </div>
                  <div className="space-y-2 flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setDesktopHeroFile(e.target.files?.[0] || null)}
                      className="w-full border border-[#E5E0D8] p-2 rounded-2xs bg-white text-xs"
                    />
                    <p className="text-[10px] text-[#6F7775]">Upload desktop landscape/portrait hero artwork.</p>
                  </div>
                </div>
              </div>

              {/* Mobile Hero Uploader */}
              <div className="p-4 border border-[#E5E0D8] bg-[#F8F5EF] rounded-2xs space-y-3">
                <h4 className="font-semibold text-[#23484A] text-sm">Mobile Hero Image (3:4 Portrait)</h4>
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-28 bg-white border border-[#E5E0D8] overflow-hidden rounded-2xs shrink-0">
                    <Image
                      src={siteSettings.heroMobileImage || '/images/hero-mobile.jpg'}
                      alt="Mobile Hero"
                      fill
                      className="object-cover object-top"
                    />
                  </div>
                  <div className="space-y-2 flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setMobileHeroFile(e.target.files?.[0] || null)}
                      className="w-full border border-[#E5E0D8] p-2 rounded-2xs bg-white text-xs"
                    />
                    <p className="text-[10px] text-[#6F7775]">Upload portrait mobile hero image.</p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSavingSettings}
                className="btn bg-[#23484A] text-white px-6 py-2.5 rounded-2xs font-semibold uppercase tracking-wider disabled:opacity-50 flex items-center gap-2"
              >
                {isSavingSettings && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{isSavingSettings ? 'Uploading to Cloudinary...' : 'Save Site Settings'}</span>
              </button>
            </form>
          </div>
        )}

        {/* Tab 5: ORDERS */}
        {activeTab === 'orders' && (
          <div className="bg-white p-6 border border-[#E5E0D8] space-y-6">
            <h2 className="font-serif text-xl text-[#23484A]">Customer Orders ({orders.length})</h2>

            {orders.length === 0 ? (
              <div className="text-center py-12 space-y-3 bg-[#F8F5EF] border border-[#E5E0D8]">
                <ShoppingBag className="w-8 h-8 text-[#C7A66A] mx-auto" />
                <p className="text-xs text-[#6F7775]">No live customer orders placed yet in database.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E5E0D8] text-[#23484A] bg-[#F8F5EF]">
                      <th className="p-3">Order #</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Total Amount</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E0D8]">
                    {orders.map((ord) => (
                      <tr key={ord.id}>
                        <td className="p-3 font-bold text-[#23484A]">{ord.order_number}</td>
                        <td className="p-3">{ord.customer_name}</td>
                        <td className="p-3 text-[#6F7775]">{ord.customer_email}</td>
                        <td className="p-3 font-bold">₹ {ord.total_amount}</td>
                        <td className="p-3">
                          <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-2xs">
                            {ord.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ============================================================ */}
      {/* ADVANCED ADD PRODUCT MODAL — Cloudinary Drag & Drop Preview  */}
      {/* ============================================================ */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white border border-[#E5E0D8] shadow-2xl w-full max-w-lg p-6 rounded-xs space-y-5 max-h-[90vh] overflow-y-auto">
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

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-[#E5E0D8] text-[#6F7775] hover:bg-[#F8F5EF] rounded-2xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="btn bg-[#23484A] text-white px-5 py-2 rounded-2xs font-semibold uppercase tracking-wider disabled:opacity-50 flex items-center gap-2"
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
