'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BRAND } from '@/lib/constants';
import type { Product, Category } from '@/types';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  seedDefaultCategories,
  DEFAULT_CATEGORIES,
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
import BannerImageUploader from '@/components/admin/BannerImageUploader';
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
  Pencil,
  Menu,
  Tag,
  FolderPlus,
} from 'lucide-react';

export interface ProductImageSlot {
  file: File | null;
  preview: string | null;
  existingUrl: string | null;
}

export default function AdminDashboardPage() {
  const [adminUser, setAdminUser] = useState<SupabaseUser | null>(null);
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'products' | 'categories' | 'site_cms' | 'orders'>('overview');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

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

  // Floating Toast / Success Popup State
  const [toast, setToast] = useState<{
    type: 'success' | 'error' | 'info';
    title: string;
    message: string;
  } | null>(null);

  const showToast = (title: string, message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ type, title, message });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Category CMS State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categorySlug, setCategorySlug] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [categoryOrder, setCategoryOrder] = useState<number>(1);
  const [categoryFile, setCategoryFile] = useState<File | null>(null);
  const [categoryPreview, setCategoryPreview] = useState<string | null>(null);
  const [categoryExistingImage, setCategoryExistingImage] = useState<string>('');
  const [isCategoryUploading, setIsCategoryUploading] = useState(false);
  const [categoryMessage, setCategoryMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isCategoryDragging, setIsCategoryDragging] = useState(false);
  const [isRestoringCategories, setIsRestoringCategories] = useState(false);

  // Product Form State (Add & Edit)
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductComparePrice, setNewProductComparePrice] = useState('');
  const [newProductType, setNewProductType] = useState<'CUSTOM' | 'READY_STOCK' | 'FABRIC'>('CUSTOM');
  const [newProductCategory, setNewProductCategory] = useState<string>('');
  const [newProductDescription, setNewProductDescription] = useState('');
  const [newProductStock, setNewProductStock] = useState('50');

  // 3 Product Image Slots (1 Main Image + 2 Sub Images)
  const [imageSlots, setImageSlots] = useState<ProductImageSlot[]>([
    { file: null, preview: null, existingUrl: null },
    { file: null, preview: null, existingUrl: null },
    { file: null, preview: null, existingUrl: null },
  ]);
  const [slotDragging, setSlotDragging] = useState<number | null>(null);
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
    const [fetchedProducts, fetchedOrders, fetchedSettings, fetchedCategories] = await Promise.all([
      getProducts(),
      getOrdersFromSupabase(),
      getSiteSettings(),
      getCategories(),
    ]);
    setProducts(fetchedProducts);
    setOrders(fetchedOrders);
    setSiteSettings(fetchedSettings);
    setCategories(fetchedCategories && fetchedCategories.length > 0 ? fetchedCategories : DEFAULT_CATEGORIES);
    setLoading(false);
  };

  // Product 3-Slot Image Handlers
  const handleSlotFileChange = (index: number, file: File | null) => {
    if (!file) {
      setImageSlots((prev) => {
        const next = [...prev];
        next[index] = { file: null, preview: null, existingUrl: null };
        return next;
      });
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageSlots((prev) => {
        const next = [...prev];
        next[index] = { file, preview: reader.result as string, existingUrl: null };
        return next;
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSlotRemove = (index: number) => {
    setImageSlots((prev) => {
      const next = [...prev];
      next[index] = { file: null, preview: null, existingUrl: null };
      return next;
    });
  };

  const handleSaveSiteSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    setSettingsMessage(null);

    let updatedDesktopUrl = siteSettings.heroDesktopImage;
    let updatedMobileUrl = siteSettings.heroMobileImage;
    let updatedDesktop2Url = siteSettings.heroDesktopImage2 ?? '';
    let updatedMobile2Url = siteSettings.heroMobileImage2 ?? '';
    let updatedDesktop3Url = siteSettings.heroDesktopImage3 ?? '';
    let updatedMobile3Url = siteSettings.heroMobileImage3 ?? '';
    let updatedLoginUrl = siteSettings.loginImage ?? '';

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
      showToast('Changes Saved', 'All banners and site CMS settings updated successfully!', 'success');
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
      showToast('Save Failed', 'Failed to update site settings. Please check connection.', 'error');
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
      showToast('Reset Complete', 'Banners restored to original boutique defaults.', 'success');
    }
  };

  const handleOpenAddProduct = () => {
    setEditingProductId(null);
    setNewProductName('');
    setNewProductPrice('');
    setNewProductComparePrice('');
    setNewProductType('CUSTOM');
    setNewProductCategory(categories[0]?.id || '');
    setNewProductDescription('');
    setNewProductStock('50');
    setImageSlots([
      { file: null, preview: null, existingUrl: null },
      { file: null, preview: null, existingUrl: null },
      { file: null, preview: null, existingUrl: null },
    ]);
    setFormMessage(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProductId(prod.id);
    setNewProductName(prod.name);
    setNewProductPrice(String(prod.price));
    setNewProductComparePrice(prod.compareAtPrice ? String(prod.compareAtPrice) : '');
    setNewProductType(prod.type);
    setNewProductCategory(prod.categoryId || '');
    setNewProductDescription(prod.description || '');
    setNewProductStock(String(prod.stock ?? 50));

    const existingImages = prod.images || [];
    setImageSlots([
      { file: null, preview: null, existingUrl: existingImages[0]?.url || null },
      { file: null, preview: null, existingUrl: existingImages[1]?.url || null },
      { file: null, preview: null, existingUrl: existingImages[2]?.url || null },
    ]);
    setFormMessage(null);
    setIsAddModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName || !newProductPrice) {
      setFormMessage({ type: 'error', text: 'Please fill in Product Name and Price.' });
      return;
    }

    setIsUploading(true);
    setFormMessage(null);

    // Upload newly selected files across 3 slots to Cloudinary
    const finalImages: { id: string; url: string; alt: string; order: number }[] = [];

    for (let i = 0; i < 3; i++) {
      const slot = imageSlots[i];
      let url = slot?.existingUrl;
      if (slot?.file) {
        const uploadedUrl = await uploadImageToCloudinary(slot.file);
        if (uploadedUrl) {
          url = uploadedUrl;
        } else {
          setFormMessage({ type: 'error', text: `Failed to upload image slot ${i + 1} to Cloudinary.` });
          setIsUploading(false);
          return;
        }
      }
      if (url) {
        finalImages.push({
          id: `img-${Date.now()}-${i}`,
          url,
          alt: `${newProductName} view ${i + 1}`,
          order: i + 1,
        });
      }
    }

    if (finalImages.length === 0) {
      finalImages.push({
        id: `img-${Date.now()}-0`,
        url: '/images/placeholder.jpg',
        alt: newProductName,
        order: 1,
      });
    }

    if (editingProductId) {
      const res = await updateProduct(editingProductId, {
        name: newProductName,
        price: Number(newProductPrice),
        compareAtPrice: newProductComparePrice ? Number(newProductComparePrice) : undefined,
        type: newProductType,
        categoryId: newProductCategory || undefined,
        description: newProductDescription,
        shortDescription: newProductName,
        stock: Number(newProductStock),
        images: finalImages,
      });

      setIsUploading(false);

      if (res.success) {
        setFormMessage({ type: 'success', text: 'Product updated successfully!' });
        showToast('Success', 'Product updated successfully!', 'success');
        setTimeout(() => {
          setIsAddModalOpen(false);
          setFormMessage(null);
          loadAdminData();
        }, 800);
      } else {
        setFormMessage({ type: 'error', text: res.error || 'Failed to update product.' });
        showToast('Error', res.error || 'Failed to update product.', 'error');
      }
    } else {
      const res = await createProduct({
        name: newProductName,
        price: Number(newProductPrice),
        compareAtPrice: newProductComparePrice ? Number(newProductComparePrice) : undefined,
        type: newProductType,
        categoryId: newProductCategory || undefined,
        description: newProductDescription || 'Handcrafted outfit curated with perfection by Fabstory by Fasna.',
        shortDescription: newProductName,
        stock: Number(newProductStock),
        images: finalImages,
        status: 'PUBLISHED',
        isFeatured: true,
      });

      setIsUploading(false);

      if (res.success) {
        setFormMessage({ type: 'success', text: 'Product saved successfully!' });
        showToast('Success', 'Product created and saved successfully!', 'success');
        setTimeout(() => {
          setIsAddModalOpen(false);
          setFormMessage(null);
          loadAdminData();
        }, 800);
      } else {
        setFormMessage({ type: 'error', text: res.error || 'Failed to create product.' });
        showToast('Error', res.error || 'Failed to create product.', 'error');
      }
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await deleteProduct(id);
      showToast('Deleted', 'Product removed from catalog.', 'info');
      loadAdminData();
    }
  };

  // Category CMS Handlers
  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCategoryName('');
    setCategorySlug('');
    setCategoryDescription('');
    setCategoryOrder(categories.length + 1);
    setCategoryFile(null);
    setCategoryPreview(null);
    setCategoryExistingImage('');
    setCategoryMessage(null);
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setCategoryName(cat.name);
    setCategorySlug(cat.slug);
    setCategoryDescription(cat.description || '');
    setCategoryOrder(cat.order || 1);
    setCategoryFile(null);
    setCategoryPreview(null);
    setCategoryExistingImage(cat.image || '');
    setCategoryMessage(null);
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      setCategoryMessage({ type: 'error', text: 'Please enter category name.' });
      return;
    }
    setIsCategoryUploading(true);
    setCategoryMessage(null);

    let imageUrl = categoryExistingImage || '/images/placeholder.jpg';
    if (categoryFile) {
      const uploadedUrl = await uploadImageToCloudinary(categoryFile);
      if (uploadedUrl) {
        imageUrl = uploadedUrl;
      } else {
        setCategoryMessage({ type: 'error', text: 'Failed to upload category image to Cloudinary.' });
        setIsCategoryUploading(false);
        return;
      }
    }

    const payload: Partial<Category> = {
      name: categoryName.trim(),
      slug: categorySlug.trim() || categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      description: categoryDescription.trim(),
      image: imageUrl,
      order: Number(categoryOrder) || 1,
    };

    let res;
    if (editingCategory) {
      res = await updateCategory(editingCategory.id, payload);
    } else {
      res = await createCategory(payload);
    }
    setIsCategoryUploading(false);

    if (res.success) {
      setCategoryMessage({ type: 'success', text: `Category ${editingCategory ? 'updated' : 'created'} successfully!` });
      showToast('Success', `Category ${editingCategory ? 'updated' : 'created'} successfully!`, 'success');
      setTimeout(() => {
        setIsCategoryModalOpen(false);
        setCategoryMessage(null);
        loadAdminData();
      }, 800);
    } else {
      setCategoryMessage({ type: 'error', text: res.error || 'Failed to save category.' });
      showToast('Error', res.error || 'Failed to save category.', 'error');
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete category "${name}"? This will not delete products in this category.`)) {
      const ok = await deleteCategory(id);
      if (ok) {
        showToast('Deleted', `Category "${name}" removed.`, 'info');
        loadAdminData();
      } else {
        showToast('Error', 'Failed to delete category.', 'error');
      }
    }
  };

  const handleRestoreDefaultCategories = async () => {
    if (confirm('Restore / Sync the 4 curated homepage categories (Custom Made Outfits, Ready to Ship, Fabrics by the Meter, Accessories & More)?')) {
      setIsRestoringCategories(true);
      const res = await seedDefaultCategories();
      setIsRestoringCategories(false);
      if (res.success) {
        showToast('Synced', 'Default categories synchronized successfully.', 'success');
        await loadAdminData();
      } else {
        showToast('Error', res.error || 'Failed to restore default categories.', 'error');
      }
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
    <div className="min-h-screen flex bg-[#F8F5EF] text-[#243234] relative">
      {/* Floating Success / Status Popup Message */}
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 pointer-events-auto px-4 w-full max-w-md animate-in fade-in slide-in-from-top-4">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xs shadow-2xl border ${
              toast.type === 'success'
                ? 'bg-[#23484A] text-white border-[#C7A66A]/60'
                : toast.type === 'error'
                ? 'bg-[#4A1D24] text-white border-rose-500/50'
                : 'bg-[#243234] text-white border-white/20'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                toast.type === 'success'
                  ? 'bg-[#C7A66A]/20 text-[#C7A66A]'
                  : toast.type === 'error'
                  ? 'bg-rose-500/20 text-rose-300'
                  : 'bg-white/10 text-white'
              }`}
            >
              {toast.type === 'success' ? (
                <CheckCircle className="w-4 h-4 text-[#C7A66A]" />
              ) : (
                <X className="w-4 h-4" />
              )}
            </div>
            <div className="flex-1 min-w-0 pr-1">
              <p className="font-semibold text-xs tracking-wider uppercase text-[#F8F5EF]">
                {toast.title}
              </p>
              <p className="text-xs text-[#FAF8F5]/90 line-clamp-2">{toast.message}</p>
            </div>
            <button
              onClick={() => setToast(null)}
              className="text-white/60 hover:text-white p-1 transition-colors cursor-pointer shrink-0"
              aria-label="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] bg-white h-full p-6 flex flex-col justify-between shadow-2xl z-10 overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-4">
                <div className="flex items-center gap-3">
                  <div className="relative w-9 h-9 rounded-full overflow-hidden border border-[#C7A66A]/40 bg-white p-0.5 shadow-2xs">
                    <Image src="/logo.png" alt={BRAND.fullName} fill className="object-contain p-0.5" />
                  </div>
                  <div>
                    <span className="font-serif text-sm font-semibold text-[#23484A] block leading-tight">
                      {BRAND.name} CMS
                    </span>
                    <span className="text-[9px] uppercase tracking-[0.2em] text-[#C7A66A] block font-medium">
                      Admin Portal
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-[#6F7775] hover:text-[#23484A] rounded-xs"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1.5 text-xs font-semibold uppercase tracking-wider">
                <button
                  onClick={() => {
                    setActiveTab('overview');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xs transition-colors flex items-center gap-2.5 ${
                    activeTab === 'overview'
                      ? 'bg-[#23484A] text-white shadow-2xs'
                      : 'text-[#6F7775] hover:bg-[#F8F5EF] hover:text-[#23484A]'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Dashboard</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('analytics');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xs transition-colors flex items-center gap-2.5 ${
                    activeTab === 'analytics'
                      ? 'bg-[#23484A] text-white shadow-2xs'
                      : 'text-[#6F7775] hover:bg-[#F8F5EF] hover:text-[#23484A]'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Analytics & Sales</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('products');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xs transition-colors flex items-center justify-between ${
                    activeTab === 'products'
                      ? 'bg-[#23484A] text-white shadow-2xs'
                      : 'text-[#6F7775] hover:bg-[#F8F5EF] hover:text-[#23484A]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <ShoppingBag className="w-4 h-4" />
                    <span>Products CMS</span>
                  </div>
                  <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">{products.length}</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('categories');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xs transition-colors flex items-center justify-between ${
                    activeTab === 'categories'
                      ? 'bg-[#23484A] text-white shadow-2xs'
                      : 'text-[#6F7775] hover:bg-[#F8F5EF] hover:text-[#23484A]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Layers className="w-4 h-4" />
                    <span>Categories CMS</span>
                  </div>
                  <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">{categories.length}</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('site_cms');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xs transition-colors flex items-center gap-2.5 ${
                    activeTab === 'site_cms'
                      ? 'bg-[#23484A] text-white shadow-2xs'
                      : 'text-[#6F7775] hover:bg-[#F8F5EF] hover:text-[#23484A]'
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Hero & Banners</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('orders');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xs transition-colors flex items-center justify-between ${
                    activeTab === 'orders'
                      ? 'bg-[#23484A] text-white shadow-2xs'
                      : 'text-[#6F7775] hover:bg-[#F8F5EF] hover:text-[#23484A]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Scissors className="w-4 h-4" />
                    <span>Orders</span>
                  </div>
                  <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">{orders.length}</span>
                </button>

                <Link
                  href="/"
                  target="_blank"
                  className="block px-3.5 py-2.5 text-[#6F7775] hover:bg-[#F8F5EF] hover:text-[#23484A] rounded-xs mt-6 pt-3 border-t border-[#E5E0D8]"
                >
                  ← View Live Store
                </Link>
              </nav>
            </div>

            <div className="pt-4 border-t border-[#E5E0D8] space-y-3">
              <div className="flex items-center gap-2.5 px-1 py-1">
                <div className="w-8 h-8 rounded-full bg-[#23484A]/10 text-[#23484A] flex items-center justify-center shrink-0">
                  <UserIcon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] font-semibold text-[#23484A] truncate block">
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
          </div>
        </div>
      )}

      {/* Admin Sidebar — Sticky & Scrollable */}
      <aside className="w-64 bg-white border-r border-[#E5E0D8] p-6 space-y-8 hidden md:flex md:flex-col md:sticky md:top-0 md:h-screen md:overflow-y-auto shrink-0 z-30">
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

        <nav className="space-y-1 text-xs font-semibold uppercase tracking-wider flex-1">
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
            onClick={() => setActiveTab('categories')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xs transition-colors flex items-center justify-between ${
              activeTab === 'categories'
                ? 'bg-[#23484A] text-white shadow-2xs'
                : 'text-[#6F7775] hover:bg-[#F8F5EF] hover:text-[#23484A]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              <span>Categories CMS</span>
            </div>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">{categories.length}</span>
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
            target="_blank"
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
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2 border border-[#E5E0D8] text-[#23484A] hover:bg-[#F8F5EF] rounded-xs cursor-pointer"
                title="Open Navigation"
              >
                <Menu className="w-5 h-5" />
              </button>
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
            </div>
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
              onClick={handleOpenAddProduct}
              className="btn bg-[#23484A] hover:bg-[#1A3536] text-white text-xs font-semibold px-3.5 py-2 rounded-xs flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>

            <button
              onClick={handleOpenAddCategory}
              className="btn border border-[#23484A] text-[#23484A] hover:bg-[#23484A] hover:text-white text-xs font-semibold px-3 py-2 rounded-xs flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
            >
              <FolderPlus className="w-4 h-4" />
              <span className="hidden xs:inline">Add Category</span>
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

        {/* Mobile Navigation Tab Bar — 6-Tab Strip */}
        <div className="md:hidden bg-white/95 backdrop-blur-xs border border-[#E5E0D8] p-1 rounded-2xs shadow-2xs sticky top-2 z-30">
          <div className="grid grid-cols-6 gap-0.5 text-center">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-1.5 px-0.5 rounded-xs flex flex-col items-center justify-center gap-1 transition-all ${
                activeTab === 'overview'
                  ? 'bg-[#23484A] text-white shadow-2xs font-bold'
                  : 'text-[#6F7775] hover:bg-[#F8F5EF] hover:text-[#23484A] font-medium'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 shrink-0" />
              <span className="text-[9px] leading-none tracking-tight">Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-1.5 px-0.5 rounded-xs flex flex-col items-center justify-center gap-1 transition-all ${
                activeTab === 'analytics'
                  ? 'bg-[#23484A] text-white shadow-2xs font-bold'
                  : 'text-[#6F7775] hover:bg-[#F8F5EF] hover:text-[#23484A] font-medium'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 shrink-0" />
              <span className="text-[9px] leading-none tracking-tight">Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`py-1.5 px-0.5 rounded-xs flex flex-col items-center justify-center gap-1 transition-all relative ${
                activeTab === 'products'
                  ? 'bg-[#23484A] text-white shadow-2xs font-bold'
                  : 'text-[#6F7775] hover:bg-[#F8F5EF] hover:text-[#23484A] font-medium'
              }`}
            >
              <div className="relative">
                <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                {products.length > 0 && (
                  <span className={`absolute -top-1 -right-2 text-[7px] px-1 py-0.2 rounded-full leading-none ${
                    activeTab === 'products' ? 'bg-[#C7A66A] text-[#1A3536] font-bold' : 'bg-[#23484A] text-white font-semibold'
                  }`}>
                    {products.length}
                  </span>
                )}
              </div>
              <span className="text-[9px] leading-none tracking-tight">Products</span>
            </button>

            <button
              onClick={() => setActiveTab('categories')}
              className={`py-1.5 px-0.5 rounded-xs flex flex-col items-center justify-center gap-1 transition-all relative ${
                activeTab === 'categories'
                  ? 'bg-[#23484A] text-white shadow-2xs font-bold'
                  : 'text-[#6F7775] hover:bg-[#F8F5EF] hover:text-[#23484A] font-medium'
              }`}
            >
              <div className="relative">
                <Layers className="w-3.5 h-3.5 shrink-0" />
                {categories.length > 0 && (
                  <span className={`absolute -top-1 -right-2 text-[7px] px-1 py-0.2 rounded-full leading-none ${
                    activeTab === 'categories' ? 'bg-[#C7A66A] text-[#1A3536] font-bold' : 'bg-[#23484A] text-white font-semibold'
                  }`}>
                    {categories.length}
                  </span>
                )}
              </div>
              <span className="text-[9px] leading-none tracking-tight">Categories</span>
            </button>

            <button
              onClick={() => setActiveTab('site_cms')}
              className={`py-1.5 px-0.5 rounded-xs flex flex-col items-center justify-center gap-1 transition-all ${
                activeTab === 'site_cms'
                  ? 'bg-[#23484A] text-white shadow-2xs'
                  : 'text-[#6F7775] hover:bg-[#F8F5EF] hover:text-[#23484A] font-medium'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5 shrink-0" />
              <span className="text-[9px] leading-none tracking-tight">Banners</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`py-1.5 px-0.5 rounded-xs flex flex-col items-center justify-center gap-1 transition-all relative ${
                activeTab === 'orders'
                  ? 'bg-[#23484A] text-white shadow-2xs font-bold'
                  : 'text-[#6F7775] hover:bg-[#F8F5EF] hover:text-[#23484A] font-medium'
              }`}
            >
              <div className="relative">
                <Scissors className="w-3.5 h-3.5 shrink-0" />
                {orders.length > 0 && (
                  <span className={`absolute -top-1 -right-2 text-[7px] px-1 py-0.2 rounded-full leading-none ${
                    activeTab === 'orders' ? 'bg-[#C7A66A] text-[#1A3536] font-bold' : 'bg-[#23484A] text-white font-semibold'
                  }`}>
                    {orders.length}
                  </span>
                )}
              </div>
              <span className="text-[9px] leading-none tracking-tight">Orders</span>
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
                    className="btn bg-[#23484A] text-white text-xs font-semibold px-4 py-2 rounded-xs inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Product</span>
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
                onClick={handleOpenAddProduct}
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
                  onClick={handleOpenAddProduct}
                  className="btn bg-[#23484A] text-white text-xs font-semibold px-4 py-2 rounded-xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Product</span>
                </button>
              </div>
            ) : (
              <>
                {/* Mobile Responsive Aligned Cards Grid (< md) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:hidden">
                  {filteredProducts.map((prod) => {
                    const assignedCat = categories.find((c) => c.id === prod.categoryId || c.slug === prod.categoryId);
                    return (
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
                            {prod.images && prod.images.length > 1 && (
                              <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[8px] px-1 rounded-2xs font-semibold">
                                {prod.images.length} imgs
                              </span>
                            )}
                          </div>
                          <div className="min-w-0 space-y-0.5">
                            <div className="flex items-center gap-1 flex-wrap">
                              <span className="text-[9px] font-bold text-[#C7A66A] uppercase tracking-wider">
                                {prod.type}
                              </span>
                              {assignedCat && (
                                <span className="text-[9px] bg-[#C7A66A]/15 text-[#8C6D37] px-1.5 py-0.2 rounded-2xs font-medium">
                                  {assignedCat.name}
                                </span>
                              )}
                            </div>
                            <h4 className="font-semibold text-xs text-[#243234] truncate" title={prod.name}>
                              {prod.name}
                            </h4>
                            <p className="text-xs font-bold text-[#23484A]">₹ {prod.price.toLocaleString('en-IN')}</p>
                            <span className="text-[10px] text-[#6F7775] block">{prod.stock || 50} in stock</span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5 shrink-0">
                          <button
                            onClick={() => handleOpenEditProduct(prod)}
                            className="p-1.5 bg-white border border-[#23484A]/30 text-[#23484A] hover:bg-[#23484A] hover:text-white rounded-xs flex items-center justify-center transition-colors cursor-pointer"
                            title="Edit product"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
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
                            className="p-1.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-xs flex items-center justify-center transition-colors cursor-pointer"
                            title="Delete product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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
                        <th className="p-3">Image</th>
                        <th className="p-3">Product Name</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Price</th>
                        <th className="p-3">Stock</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E0D8]">
                      {filteredProducts.map((prod) => {
                        const assignedCat = categories.find((c) => c.id === prod.categoryId || c.slug === prod.categoryId);
                        return (
                          <tr key={prod.id} className="hover:bg-[#F8F5EF] transition-colors">
                            <td className="p-3">
                              <div className="relative w-10 h-12 bg-[#F8F5EF] overflow-hidden rounded-2xs border border-[#E5E0D8]">
                                <Image
                                  src={prod.images[0]?.url || '/images/placeholder.jpg'}
                                  alt={prod.name}
                                  fill
                                  className="object-cover object-top"
                                />
                                {prod.images && prod.images.length > 1 && (
                                  <span className="absolute bottom-0.5 right-0.5 bg-black/65 text-white text-[7px] px-1 rounded-2xs font-semibold">
                                    {prod.images.length}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-3 font-semibold text-[#243234]">{prod.name}</td>
                            <td className="p-3">
                              {assignedCat ? (
                                <span className="bg-[#C7A66A]/15 text-[#8C6D37] text-[10px] font-semibold px-2 py-0.5 rounded-2xs border border-[#C7A66A]/30">
                                  {assignedCat.name}
                                </span>
                              ) : (
                                <span className="text-[10px] text-[#A0A8A6] italic">Unassigned</span>
                              )}
                            </td>
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
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleOpenEditProduct(prod)}
                                  className="p-1.5 text-[#23484A] hover:bg-[#23484A]/10 rounded-xs transition-colors cursor-pointer"
                                  title="Edit product details & images"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
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
                                  className="p-1.5 text-red-600 hover:text-red-800 transition-colors cursor-pointer"
                                  title="Delete product"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
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

        {/* Tab: CATEGORIES CMS (Separate from Products) */}
        {activeTab === 'categories' && (
          <div className="bg-white p-4 sm:p-6 border border-[#E5E0D8] rounded-2xs space-y-5 sm:space-y-6 shadow-2xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#E5E0D8] pb-4">
              <div>
                <h2 className="font-serif text-lg sm:text-xl text-[#23484A]">Categories CMS ({categories.length})</h2>
                <p className="text-[11px] sm:text-xs text-[#6F7775]">
                  Manage distinct boutique collections and store categories with cover images, completely separate from product inventory.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={handleRestoreDefaultCategories}
                  disabled={isRestoringCategories}
                  className="btn bg-white hover:bg-[#FAF8F5] text-[#23484A] border border-[#D9D3C8] text-xs font-semibold px-3 py-2 rounded-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                  title="Restore or sync the 4 curated categories shown on the homepage"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-[#C7A66A] ${isRestoringCategories ? 'animate-spin' : ''}`} />
                  <span>Restore Curated Categories</span>
                </button>
                <button
                  onClick={handleOpenAddCategory}
                  className="btn bg-[#23484A] hover:bg-[#1A3536] text-white text-xs font-semibold px-4 py-2 rounded-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Category</span>
                </button>
              </div>
            </div>

            {categories.length === 0 ? (
              <div className="text-center py-12 space-y-3 bg-[#F8F5EF] border border-[#E5E0D8] rounded-2xs">
                <Layers className="w-10 h-10 text-[#C7A66A] mx-auto opacity-70" />
                <h3 className="font-serif text-base text-[#23484A]">No Categories Created Yet</h3>
                <p className="text-xs text-[#6F7775] max-w-sm mx-auto">
                  Create categories like &apos;Dresses&apos;, &apos;Abayas&apos;, &apos;Kurtis&apos;, or &apos;Anarkali&apos; to showcase on your homepage and organize products.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                  <button
                    onClick={handleRestoreDefaultCategories}
                    disabled={isRestoringCategories}
                    className="btn bg-[#23484A] text-white text-xs font-semibold px-4 py-2 rounded-xs inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 text-[#C7A66A] ${isRestoringCategories ? 'animate-spin' : ''}`} />
                    <span>Populate 4 Homepage Categories</span>
                  </button>
                  <button
                    onClick={handleOpenAddCategory}
                    className="btn bg-white border border-[#23484A] text-[#23484A] text-xs font-semibold px-4 py-2 rounded-xs inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Custom Category</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((cat) => {
                  const linkedCount = products.filter((p) => p.categoryId === cat.id || p.categoryId === cat.slug).length;
                  return (
                    <div
                      key={cat.id}
                      className="bg-[#FAF8F5] border border-[#E5E0D8] rounded-2xs overflow-hidden flex flex-col justify-between hover:border-[#23484A]/40 transition-all shadow-2xs"
                    >
                      <div className="relative aspect-[16/9] w-full bg-[#EFECE6] overflow-hidden">
                        <Image
                          src={cat.image || '/images/placeholder.jpg'}
                          alt={cat.name}
                          fill
                          className="object-cover object-center"
                        />
                        <div className="absolute top-2 left-2 bg-[#23484A]/90 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded-full font-semibold">
                          Order #{cat.order || 1}
                        </div>
                        <div className="absolute top-2 right-2 bg-white/95 text-[#23484A] text-[10px] px-2 py-0.5 rounded-full font-semibold border border-[#E5E0D8]">
                          {linkedCount} {linkedCount === 1 ? 'Product' : 'Products'}
                        </div>
                      </div>

                      <div className="p-3.5 flex flex-col flex-1 justify-between space-y-3">
                        <div>
                          <h3 className="font-serif text-base font-bold text-[#23484A]">{cat.name}</h3>
                          <span className="text-[10px] font-mono text-[#6F7775] block mt-0.5">/{cat.slug}</span>
                          {cat.description && (
                            <p className="text-xs text-[#6F7775] mt-1 line-clamp-2">{cat.description}</p>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-[#E5E0D8]">
                          <Link
                            href={`/shop?category=${cat.slug}`}
                            target="_blank"
                            className="text-[11px] text-[#23484A] hover:text-[#C7A66A] font-semibold flex items-center gap-1"
                          >
                            <span>View in Shop</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleOpenEditCategory(cat)}
                              className="p-1.5 bg-white border border-[#E5E0D8] text-[#23484A] hover:bg-[#F8F5EF] rounded-xs transition-colors cursor-pointer"
                              title="Edit Category"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(cat.id, cat.name)}
                              className="p-1.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-xs transition-colors cursor-pointer"
                              title="Delete Category"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
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

            {/* Sub-tab navigation for 3 Banners + Login — 4-item grid */}
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
                className={`py-2 px-2 text-xs font-semibold rounded-2xs transition-colors text-center flex items-center justify-center gap-1.5 ${
                  bannerTab === 'slide2'
                    ? 'bg-[#23484A] text-white shadow-xs'
                    : 'bg-[#F8F5EF] text-[#243234] hover:bg-[#EBE5D9]'
                }`}
              >
                <span>Slide 2 (Arrivals)</span>
                {siteSettings.slide2Active === false && (
                  <span className="w-2 h-2 rounded-full bg-rose-500" title="Slide Removed from Storefront" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setBannerTab('slide3')}
                className={`py-2 px-2 text-xs font-semibold rounded-2xs transition-colors text-center flex items-center justify-center gap-1.5 ${
                  bannerTab === 'slide3'
                    ? 'bg-[#23484A] text-white shadow-xs'
                    : 'bg-[#F8F5EF] text-[#243234] hover:bg-[#EBE5D9]'
                }`}
              >
                <span>Slide 3 (Occasion)</span>
                {siteSettings.slide3Active === false && (
                  <span className="w-2 h-2 rounded-full bg-rose-500" title="Slide Removed from Storefront" />
                )}
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
                  <div className="p-3 bg-[#FAF8F5] border border-[#E5E0D8] rounded-2xs flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#C7A66A]">Slide 1 • Primary Showcase</span>
                      <h3 className="font-serif text-base text-[#23484A]">First Rotating Hero Slide</h3>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800">
                      ● Active Primary Slide
                    </span>
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
                    <BannerImageUploader
                      label="Desktop Banner (16:9 Landscape)"
                      sublabel="Shown on desktop, laptop & tablet screens"
                      badge="Slide 1"
                      aspectRatio="16/9"
                      currentImageUrl={siteSettings.heroDesktopImage && siteSettings.heroDesktopImage !== '' && siteSettings.heroDesktopImage !== 'REMOVED' ? siteSettings.heroDesktopImage : '/images/hero-new.jpg'}
                      stagedFile={desktopHeroFile}
                      stagedPreviewUrl={desktopHeroPreview}
                      recommendedDimensions="1920×1080 or 1600×900 px"
                      isRemoved={siteSettings.heroDesktopImage === 'REMOVED'}
                      onFileSelect={(file) => {
                        setDesktopHeroFile(file);
                        setDesktopHeroPreview(URL.createObjectURL(file));
                      }}
                      onRemove={() => {
                        setDesktopHeroFile(null);
                        setDesktopHeroPreview(null);
                        setSiteSettings((prev) => ({ ...prev, heroDesktopImage: 'REMOVED' }));
                      }}
                    />

                    <BannerImageUploader
                      label="Mobile Banner (3:4 Vertical)"
                      sublabel="Shown on smartphone & mobile screens"
                      badge="Slide 1"
                      aspectRatio="3/4"
                      currentImageUrl={siteSettings.heroMobileImage && siteSettings.heroMobileImage !== '' && siteSettings.heroMobileImage !== 'REMOVED' ? siteSettings.heroMobileImage : '/images/hero-mobile.jpg'}
                      stagedFile={mobileHeroFile}
                      stagedPreviewUrl={mobileHeroPreview}
                      recommendedDimensions="900×1200 or 1080×1440 px"
                      isRemoved={siteSettings.heroMobileImage === 'REMOVED'}
                      onFileSelect={(file) => {
                        setMobileHeroFile(file);
                        setMobileHeroPreview(URL.createObjectURL(file));
                      }}
                      onRemove={() => {
                        setMobileHeroFile(null);
                        setMobileHeroPreview(null);
                        setSiteSettings((prev) => ({ ...prev, heroMobileImage: 'REMOVED' }));
                      }}
                    />
                  </div>
                </div>
              )}

              {/* SLIDE 2 */}
              {bannerTab === 'slide2' && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="p-3 bg-[#FAF8F5] border border-[#E5E0D8] rounded-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#C7A66A]">Slide 2 • New Arrivals & Season</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            siteSettings.slide2Active !== false && siteSettings.heroDesktopImage2 !== ''
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {siteSettings.slide2Active !== false && siteSettings.heroDesktopImage2 !== ''
                            ? '● Active on Storefront'
                            : '○ Banner Removed / Hidden'}
                        </span>
                      </div>
                      <h3 className="font-serif text-base text-[#23484A]">Second Rotating Hero Slide</h3>
                    </div>
                  </div>

                  {siteSettings.slide2Active === false && (
                    <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xs text-xs flex items-center gap-2">
                      <span className="font-bold">Notice:</span>
                      <span>
                        Slide 2 is currently removed from your homepage slider. Customers will not see it. You can still customize or replace the images below, and click <strong>Enable Slide</strong> when ready.
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-[#243234] font-semibold">Slide 2 Headline</label>
                      <input
                        type="text"
                        value={siteSettings.heroTitle2 || ''}
                        onChange={(e) => setSiteSettings({ ...siteSettings, heroTitle2: e.target.value })}
                        className="w-full border border-[#E5E0D8] p-2.5 rounded-2xs focus:outline-none focus:border-[#23484A] bg-white"
                        placeholder="Crafted with Love & Detail"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[#243234] font-semibold">Slide 2 Subtitle</label>
                      <input
                        type="text"
                        value={siteSettings.heroSubtitle2 || ''}
                        onChange={(e) => setSiteSettings({ ...siteSettings, heroSubtitle2: e.target.value })}
                        className="w-full border border-[#E5E0D8] p-2.5 rounded-2xs focus:outline-none focus:border-[#23484A] bg-white"
                        placeholder="Timeless Occasion Wear & Bespoke Couture"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-2 items-stretch">
                    <BannerImageUploader
                      label="Desktop Banner (16:9 Landscape)"
                      sublabel="Shown on desktop, laptop & tablet screens"
                      badge="Slide 2"
                      aspectRatio="16/9"
                      currentImageUrl={siteSettings.heroDesktopImage2}
                      stagedFile={desktopHero2File}
                      stagedPreviewUrl={desktopHero2Preview}
                      recommendedDimensions="1920×1080 or 1600×900 px"
                      isRemoved={siteSettings.heroDesktopImage2 === '' && !desktopHero2File}
                      onFileSelect={(file) => {
                        setDesktopHero2File(file);
                        setDesktopHero2Preview(URL.createObjectURL(file));
                      }}
                      onRemove={() => {
                        setDesktopHero2File(null);
                        setDesktopHero2Preview(null);
                        setSiteSettings((prev) => ({ ...prev, heroDesktopImage2: '' }));
                      }}
                    />

                    <BannerImageUploader
                      label="Mobile Banner (3:4 Vertical)"
                      sublabel="Shown on smartphone & mobile screens"
                      badge="Slide 2"
                      aspectRatio="3/4"
                      currentImageUrl={siteSettings.heroMobileImage2}
                      stagedFile={mobileHero2File}
                      stagedPreviewUrl={mobileHero2Preview}
                      recommendedDimensions="900×1200 or 1080×1440 px"
                      isRemoved={siteSettings.heroMobileImage2 === '' && !mobileHero2File}
                      onFileSelect={(file) => {
                        setMobileHero2File(file);
                        setMobileHero2Preview(URL.createObjectURL(file));
                      }}
                      onRemove={() => {
                        setMobileHero2File(null);
                        setMobileHero2Preview(null);
                        setSiteSettings((prev) => ({ ...prev, heroMobileImage2: '' }));
                      }}
                    />
                  </div>
                </div>
              )}

              {/* SLIDE 3 */}
              {bannerTab === 'slide3' && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="p-3 bg-[#FAF8F5] border border-[#E5E0D8] rounded-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#C7A66A]">Slide 3 • Bespoke Occasion Wear</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            siteSettings.slide3Active !== false && siteSettings.heroDesktopImage3 !== ''
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {siteSettings.slide3Active !== false && siteSettings.heroDesktopImage3 !== ''
                            ? '● Active on Storefront'
                            : '○ Banner Removed / Hidden'}
                        </span>
                      </div>
                      <h3 className="font-serif text-base text-[#23484A]">Third Rotating Hero Slide</h3>
                    </div>
                  </div>

                  {siteSettings.slide3Active === false && (
                    <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xs text-xs flex items-center gap-2">
                      <span className="font-bold">Notice:</span>
                      <span>
                        Slide 3 is currently removed from your homepage slider. Customers will not see it. You can still customize or replace the images below, and click <strong>Enable Slide</strong> when ready.
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-[#243234] font-semibold">Slide 3 Headline</label>
                      <input
                        type="text"
                        value={siteSettings.heroTitle3 || ''}
                        onChange={(e) => setSiteSettings({ ...siteSettings, heroTitle3: e.target.value })}
                        className="w-full border border-[#E5E0D8] p-2.5 rounded-2xs focus:outline-none focus:border-[#23484A] bg-white"
                        placeholder="Designed for Every Moment"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[#243234] font-semibold">Slide 3 Subtitle</label>
                      <input
                        type="text"
                        value={siteSettings.heroSubtitle3 || ''}
                        onChange={(e) => setSiteSettings({ ...siteSettings, heroSubtitle3: e.target.value })}
                        className="w-full border border-[#E5E0D8] p-2.5 rounded-2xs focus:outline-none focus:border-[#23484A] bg-white"
                        placeholder="Curated luxury & handcrafted elegance"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-2 items-stretch">
                    <BannerImageUploader
                      label="Desktop Banner (16:9 Landscape)"
                      sublabel="Shown on desktop, laptop & tablet screens"
                      badge="Slide 3"
                      aspectRatio="16/9"
                      currentImageUrl={siteSettings.heroDesktopImage3}
                      stagedFile={desktopHero3File}
                      stagedPreviewUrl={desktopHero3Preview}
                      recommendedDimensions="1920×1080 or 1600×900 px"
                      isRemoved={siteSettings.heroDesktopImage3 === '' && !desktopHero3File}
                      onFileSelect={(file) => {
                        setDesktopHero3File(file);
                        setDesktopHero3Preview(URL.createObjectURL(file));
                      }}
                      onRemove={() => {
                        setDesktopHero3File(null);
                        setDesktopHero3Preview(null);
                        setSiteSettings((prev) => ({ ...prev, heroDesktopImage3: '' }));
                      }}
                    />

                    <BannerImageUploader
                      label="Mobile Banner (3:4 Vertical)"
                      sublabel="Shown on smartphone & mobile screens"
                      badge="Slide 3"
                      aspectRatio="3/4"
                      currentImageUrl={siteSettings.heroMobileImage3}
                      stagedFile={mobileHero3File}
                      stagedPreviewUrl={mobileHero3Preview}
                      recommendedDimensions="900×1200 or 1080×1440 px"
                      isRemoved={siteSettings.heroMobileImage3 === '' && !mobileHero3File}
                      onFileSelect={(file) => {
                        setMobileHero3File(file);
                        setMobileHero3Preview(URL.createObjectURL(file));
                      }}
                      onRemove={() => {
                        setMobileHero3File(null);
                        setMobileHero3Preview(null);
                        setSiteSettings((prev) => ({ ...prev, heroMobileImage3: '' }));
                      }}
                    />
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

                  <div className="max-w-md">
                    <BannerImageUploader
                      label="Login Side Banner Image"
                      sublabel="Shown alongside customer login & registration form"
                      badge="Login Screen"
                      aspectRatio="3/4"
                      currentImageUrl={siteSettings.loginImage}
                      stagedFile={loginHeroFile}
                      stagedPreviewUrl={loginHeroPreview}
                      recommendedDimensions="900×1200 or 1080×1440 portrait"
                      isRemoved={siteSettings.loginImage === '' && !loginHeroFile}
                      onFileSelect={(file) => {
                        setLoginHeroFile(file);
                        setLoginHeroPreview(URL.createObjectURL(file));
                      }}
                      onRemove={() => {
                        setLoginHeroFile(null);
                        setLoginHeroPreview(null);
                        setSiteSettings((prev) => ({ ...prev, loginImage: '' }));
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#E5E0D8] flex flex-wrap items-center justify-end gap-3">
                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="w-full sm:w-auto btn bg-[#23484A] hover:bg-[#1A3536] text-white px-6 py-2.5 rounded-2xs font-semibold uppercase tracking-wider disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  {isSavingSettings && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSavingSettings ? 'Saving Changes...' : 'Save Changes'}</span>
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
      {/* PRODUCT ADD / EDIT MODAL — 4 Image Slots (1 Main + 3 Sub)   */}
      {/* ============================================================ */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white border border-[#E5E0D8] shadow-2xl w-full max-w-xl p-4 sm:p-6 rounded-xs space-y-4 sm:space-y-5 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-3">
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-xl text-[#23484A]">
                  {editingProductId ? 'Edit Product' : 'Add Product to CMS'}
                </h3>
                <span className="text-[10px] font-bold bg-[#003B75]/10 text-[#003B75] px-2 py-0.5 rounded-full">
                  Cloudinary 4-Photo
                </span>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#6F7775] hover:text-[#23484A] cursor-pointer"
              >
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

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                  <label className="block text-[#243234] font-semibold mb-1">Store Category</label>
                  <select
                    value={newProductCategory}
                    onChange={(e) => setNewProductCategory(e.target.value)}
                    className="w-full border border-[#E5E0D8] p-2.5 rounded-2xs focus:outline-none focus:border-[#23484A] bg-white font-medium"
                  >
                    <option value="">-- No Category --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
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
                  rows={2}
                  placeholder="Enter details about fabric, embroidery work, fit and style..."
                  value={newProductDescription}
                  onChange={(e) => setNewProductDescription(e.target.value)}
                  className="w-full border border-[#E5E0D8] p-2.5 rounded-2xs focus:outline-none focus:border-[#23484A]"
                />
              </div>

              {/* 3 Image Slots: 1 Main Photo + 2 Sub Images */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[#243234] font-semibold">
                    Product Images (1 Main + 2 Sub Images)
                  </label>
                  <span className="text-[10px] text-[#6F7775]">Total 3 image slots</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[0, 1, 2].map((idx) => {
                    const slot = imageSlots[idx];
                    const isMain = idx === 0;
                    const displayUrl = slot?.preview || slot?.existingUrl;
                    const isDraggingThis = slotDragging === idx;

                    return (
                      <div
                        key={idx}
                        className={`border rounded-2xs p-2 flex flex-col justify-between transition-all ${
                          isMain ? 'border-[#C7A66A] bg-[#FAF8F5]' : 'border-[#E5E0D8] bg-white'
                        } ${isDraggingThis ? 'ring-2 ring-[#23484A] bg-[#23484A]/5' : ''}`}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSlotDragging(idx);
                        }}
                        onDragEnter={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSlotDragging(idx);
                        }}
                        onDragLeave={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                            setSlotDragging(null);
                          }
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSlotDragging(null);
                          const file = e.dataTransfer.files?.[0];
                          if (file && file.type.startsWith('image/')) {
                            handleSlotFileChange(idx, file);
                          }
                        }}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`text-[10px] font-bold ${isMain ? 'text-[#8C6D37]' : 'text-[#6F7775]'}`}>
                            {isMain ? '★ Main Image' : `Sub Image ${idx}`}
                          </span>
                          {displayUrl && (
                            <button
                              type="button"
                              onClick={() => handleSlotRemove(idx)}
                              className="text-red-500 hover:text-red-700 p-0.5 rounded-full cursor-pointer"
                              title="Remove image"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {displayUrl ? (
                          <div className="relative aspect-[3/4] w-full rounded-xs overflow-hidden border border-[#E5E0D8] bg-[#F8F5EF] mb-2">
                            <Image src={displayUrl} alt={`Slot ${idx + 1}`} fill className="object-cover object-top" />
                            {slot?.file && (
                              <span className="absolute bottom-1 right-1 bg-emerald-600 text-white text-[8px] px-1 py-0.2 rounded-2xs font-semibold">
                                New
                              </span>
                            )}
                          </div>
                        ) : (
                          <label className="aspect-[3/4] w-full rounded-xs border border-dashed border-[#D9D3C8] hover:border-[#23484A] flex flex-col items-center justify-center p-2 text-center cursor-pointer mb-2 bg-[#F8F5EF]/60 hover:bg-[#F8F5EF] transition-colors">
                            <Upload className={`w-5 h-5 mb-1 ${isMain ? 'text-[#C7A66A]' : 'text-[#6F7775]'}`} />
                            <span className="text-[10px] font-semibold text-[#23484A] block">
                              {isDraggingThis ? 'Drop Here' : isMain ? 'Upload Main' : `Upload Sub ${idx}`}
                            </span>
                            <span className="text-[8px] text-[#6F7775] block mt-0.5">Drag & Drop</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleSlotFileChange(idx, e.target.files?.[0] || null)}
                              className="hidden"
                            />
                          </label>
                        )}

                        {displayUrl && (
                          <label className="text-[10px] text-center text-[#23484A] hover:underline font-semibold cursor-pointer block py-0.5">
                            Change
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleSlotFileChange(idx, e.target.files?.[0] || null)}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    );
                  })}
                </div>
                <p className="text-[10px] text-[#6F7775]">
                  • <strong>Main Image</strong> will appear in catalog cards, details hero, and checkout.<br />
                  • <strong>Sub Images 1 & 2</strong> will appear beneath the card image and in the product gallery.
                </p>
              </div>

              <div className="pt-2 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2 border border-[#E5E0D8] text-[#6F7775] hover:bg-[#F8F5EF] rounded-2xs text-center cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="w-full sm:w-auto btn bg-[#23484A] hover:bg-[#1A3536] text-white px-5 py-2 rounded-2xs font-semibold uppercase tracking-wider disabled:opacity-50 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  {isUploading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>
                    {isUploading ? 'Saving Changes...' : 'Save Changes'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* CATEGORY ADD / EDIT MODAL                                    */}
      {/* ============================================================ */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white border border-[#E5E0D8] shadow-2xl w-full max-w-md p-4 sm:p-6 rounded-xs space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#23484A]" />
                <h3 className="font-serif text-xl text-[#23484A]">
                  {editingCategory ? 'Edit Category' : 'Create New Category'}
                </h3>
              </div>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-[#6F7775] hover:text-[#23484A] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {categoryMessage && (
              <div
                className={`p-3 text-xs rounded-2xs border ${
                  categoryMessage.type === 'success'
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}
              >
                {categoryMessage.text}
              </div>
            )}

            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#243234] font-semibold mb-1">Category Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Designer Abayas"
                  value={categoryName}
                  onChange={(e) => {
                    setCategoryName(e.target.value);
                    if (!editingCategory) {
                      setCategorySlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, '-')
                          .replace(/(^-|-$)+/g, '')
                      );
                    }
                  }}
                  required
                  className="w-full border border-[#E5E0D8] p-2.5 rounded-2xs focus:outline-none focus:border-[#23484A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#243234] font-semibold mb-1">URL Slug</label>
                  <input
                    type="text"
                    placeholder="e.g. designer-abayas"
                    value={categorySlug}
                    onChange={(e) => setCategorySlug(e.target.value)}
                    className="w-full border border-[#E5E0D8] p-2.5 rounded-2xs focus:outline-none focus:border-[#23484A] font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block text-[#243234] font-semibold mb-1">Display Order</label>
                  <input
                    type="number"
                    value={categoryOrder}
                    onChange={(e) => setCategoryOrder(Number(e.target.value))}
                    min={1}
                    className="w-full border border-[#E5E0D8] p-2.5 rounded-2xs focus:outline-none focus:border-[#23484A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#243234] font-semibold mb-1">Description (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Short description for collection banners..."
                  value={categoryDescription}
                  onChange={(e) => setCategoryDescription(e.target.value)}
                  className="w-full border border-[#E5E0D8] p-2.5 rounded-2xs focus:outline-none focus:border-[#23484A]"
                />
              </div>

              <div>
                <label className="block text-[#243234] font-semibold mb-1">Category Cover Image</label>
                {categoryPreview || categoryExistingImage ? (
                  <div className="space-y-2">
                    <div className="relative aspect-[16/9] w-full rounded-2xs overflow-hidden border border-[#E5E0D8] bg-[#F8F5EF]">
                      <Image
                        src={categoryPreview || categoryExistingImage}
                        alt="Category preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex gap-2">
                      <label className="flex-1 py-1.5 px-3 bg-white hover:bg-[#FAF8F5] text-[#23484A] border border-[#D9D3C8] rounded-2xs text-[11px] font-semibold transition-colors shadow-2xs text-center cursor-pointer flex items-center justify-center gap-1.5">
                        <Upload className="w-3.5 h-3.5 text-[#C7A66A]" />
                        <span>Change Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setCategoryFile(file);
                              const reader = new FileReader();
                              reader.onloadend = () => setCategoryPreview(reader.result as string);
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setCategoryFile(null);
                          setCategoryPreview(null);
                          setCategoryExistingImage('');
                        }}
                        className="py-1.5 px-3 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 rounded-2xs text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsCategoryDragging(true);
                    }}
                    onDragEnter={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsCategoryDragging(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                        setIsCategoryDragging(false);
                      }
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsCategoryDragging(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file && file.type.startsWith('image/')) {
                        setCategoryFile(file);
                        const reader = new FileReader();
                        reader.onloadend = () => setCategoryPreview(reader.result as string);
                        reader.readAsDataURL(file);
                      }
                    }}
                    className={`border-2 border-dashed p-5 text-center rounded-2xs transition-all cursor-pointer ${
                      isCategoryDragging
                        ? 'border-[#C7A66A] bg-[#C7A66A]/10'
                        : 'border-[#E5E0D8] bg-[#F8F5EF] hover:border-[#23484A]'
                    }`}
                  >
                    <label className="cursor-pointer block">
                      <Upload className="w-6 h-6 mx-auto mb-1.5 text-[#C7A66A]" />
                      <span className="text-xs font-semibold text-[#23484A] block">
                        Drag & Drop Category Cover or Click to Browse
                      </span>
                      <span className="text-[10px] text-[#6F7775] block mt-0.5">
                        High resolution recommended (16:9 or 3:4)
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setCategoryFile(file);
                            const reader = new FileReader();
                            reader.onloadend = () => setCategoryPreview(reader.result as string);
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>

              <div className="pt-2 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2 border border-[#E5E0D8] text-[#6F7775] hover:bg-[#F8F5EF] rounded-2xs text-center cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCategoryUploading}
                  className="w-full sm:w-auto btn bg-[#23484A] hover:bg-[#1A3536] text-white px-5 py-2 rounded-2xs font-semibold uppercase tracking-wider disabled:opacity-50 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  {isCategoryUploading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isCategoryUploading ? 'Saving Changes...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
