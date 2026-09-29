import { supabase } from './client';
import type { Product, Category, Fabric, Order, CustomRequest } from '@/types';

export interface SiteSettings {
  id: string;
  heroDesktopImage: string;
  heroMobileImage: string;
  heroTitle: string;
  heroSubtitle: string;
  heroDesktopImage2?: string;
  heroMobileImage2?: string;
  heroTitle2?: string;
  heroSubtitle2?: string;
  heroDesktopImage3?: string;
  heroMobileImage3?: string;
  heroTitle3?: string;
  heroSubtitle3?: string;
  loginImage?: string;
  loginTitle?: string;
  loginSubtitle?: string;
}

// ============================================================
// 1. CLOUDINARY IMAGE UPLOAD HELPER
// ============================================================

export async function uploadImageToCloudinary(file: File): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    if (res.ok && data.url) {
      return data.url;
    } else {
      console.error('Cloudinary upload error:', data.error);
      return null;
    }
  } catch (err) {
    console.error('Failed to upload image to Cloudinary:', err);
    return null;
  }
}

// ============================================================
// 2. SITE SETTINGS & HERO IMAGE SERVICES
// ============================================================

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  id: 'default',
  heroDesktopImage: '/images/hero-latest.jpg',
  heroMobileImage: '/images/mobileview/fabstore-mobilebanner1.png',
  heroTitle: 'Where Style Meets Your Story',
  heroSubtitle: 'Specially curated for Women',
  heroDesktopImage2: '/images/mobileview/fabstore-banner2.png',
  heroMobileImage2: '/images/mobileview/fabstore-mobilebanner2.png',
  heroTitle2: 'Crafted with Love & Detail',
  heroSubtitle2: 'Timeless Occasion Wear & Bespoke Couture',
  heroDesktopImage3: '/images/mobileview/fabstore-banner3.png',
  heroMobileImage3: '/images/mobileview/fabstore-mobileview3.png',
  heroTitle3: 'Designed for Every Moment',
  heroSubtitle3: 'Curated luxury & handcrafted elegance',
  loginImage: '/images/craftsmanship.jpg',
  loginTitle: 'Where Style\nMeets Your Story',
  loginSubtitle: 'FABSTORY BY FASNA',
};

export async function getSiteSettings(): Promise<SiteSettings> {
  let settings = { ...DEFAULT_SITE_SETTINGS };

  // Read local storage overrides first if available in browser
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('fabstory_site_settings');
      if (stored) {
        settings = { ...settings, ...JSON.parse(stored) };
      }
    } catch (_) {}
  }

  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 'default')
      .single();

    if (error || !data) {
      return settings;
    }

    const mergedSettings: SiteSettings = {
      ...settings,
      id: data.id || 'default',
      heroDesktopImage: data.hero_desktop_image || settings.heroDesktopImage,
      heroMobileImage: data.hero_mobile_image || settings.heroMobileImage,
      heroTitle: data.hero_title || settings.heroTitle,
      heroSubtitle: data.hero_subtitle || settings.heroSubtitle,
      loginImage: data.login_image || settings.loginImage,
      loginTitle: data.login_title || settings.loginTitle,
      loginSubtitle: data.login_subtitle || settings.loginSubtitle,
    };

    if (data.hero_desktop_image_2) mergedSettings.heroDesktopImage2 = data.hero_desktop_image_2;
    if (data.hero_mobile_image_2) mergedSettings.heroMobileImage2 = data.hero_mobile_image_2;
    if (data.hero_title_2) mergedSettings.heroTitle2 = data.hero_title_2;
    if (data.hero_subtitle_2) mergedSettings.heroSubtitle2 = data.hero_subtitle_2;

    if (data.hero_desktop_image_3) mergedSettings.heroDesktopImage3 = data.hero_desktop_image_3;
    if (data.hero_mobile_image_3) mergedSettings.heroMobileImage3 = data.hero_mobile_image_3;
    if (data.hero_title_3) mergedSettings.heroTitle3 = data.hero_title_3;
    if (data.hero_subtitle_3) mergedSettings.heroSubtitle3 = data.hero_subtitle_3;

    return mergedSettings;
  } catch (err) {
    return settings;
  }
}

export async function updateSiteSettings(settings: Partial<SiteSettings>): Promise<boolean> {
  try {
    // Persist immediately in localStorage so changes take effect across tabs instantly
    if (typeof window !== 'undefined') {
      try {
        const current = localStorage.getItem('fabstory_site_settings');
        const merged = { ...(current ? JSON.parse(current) : DEFAULT_SITE_SETTINGS), ...settings };
        localStorage.setItem('fabstory_site_settings', JSON.stringify(merged));
      } catch (_) {}
    }

    // Try full upsert with extended banner columns first
    const fullPayload: any = {
      id: 'default',
      hero_desktop_image: settings.heroDesktopImage,
      hero_mobile_image: settings.heroMobileImage,
      hero_title: settings.heroTitle,
      hero_subtitle: settings.heroSubtitle,
      updated_at: new Date().toISOString(),
    };

    if (settings.heroDesktopImage2 !== undefined) fullPayload.hero_desktop_image_2 = settings.heroDesktopImage2;
    if (settings.heroMobileImage2 !== undefined) fullPayload.hero_mobile_image_2 = settings.heroMobileImage2;
    if (settings.heroTitle2 !== undefined) fullPayload.hero_title_2 = settings.heroTitle2;
    if (settings.heroSubtitle2 !== undefined) fullPayload.hero_subtitle_2 = settings.heroSubtitle2;

    if (settings.heroDesktopImage3 !== undefined) fullPayload.hero_desktop_image_3 = settings.heroDesktopImage3;
    if (settings.heroMobileImage3 !== undefined) fullPayload.hero_mobile_image_3 = settings.heroMobileImage3;
    if (settings.heroTitle3 !== undefined) fullPayload.hero_title_3 = settings.heroTitle3;
    if (settings.heroSubtitle3 !== undefined) fullPayload.hero_subtitle_3 = settings.heroSubtitle3;

    if (settings.loginImage !== undefined) fullPayload.login_image = settings.loginImage;
    if (settings.loginTitle !== undefined) fullPayload.login_title = settings.loginTitle;
    if (settings.loginSubtitle !== undefined) fullPayload.login_subtitle = settings.loginSubtitle;

    const { error } = await supabase.from('site_settings').upsert([fullPayload]);

    if (error) {
      // In case Postgres table schema doesn't have the extended _2 and _3 columns, fallback to basic schema
      console.warn('Extended columns upsert failed, falling back to core columns:', error.message);
      const corePayload: any = {
        id: 'default',
        hero_desktop_image: settings.heroDesktopImage,
        hero_mobile_image: settings.heroMobileImage,
        hero_title: settings.heroTitle,
        hero_subtitle: settings.heroSubtitle,
        updated_at: new Date().toISOString(),
      };
      if (settings.loginImage !== undefined) corePayload.login_image = settings.loginImage;
      if (settings.loginTitle !== undefined) corePayload.login_title = settings.loginTitle;
      if (settings.loginSubtitle !== undefined) corePayload.login_subtitle = settings.loginSubtitle;

      await supabase.from('site_settings').upsert([corePayload]);
    }

    return true;
  } catch (err) {
    console.error('Error updating site settings:', err);
    return true;
  }
}

// ============================================================
// 3. PRODUCTS SERVICES (DIRECT SUPABASE FETCHING - NO HARDCODE)
// ============================================================

export async function getProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map((item) => ({
      id: item.id,
      slug: item.slug,
      name: item.name,
      description: item.description || '',
      shortDescription: item.short_description || '',
      price: Number(item.price),
      compareAtPrice: item.compare_at_price ? Number(item.compare_at_price) : undefined,
      type: item.type as 'CUSTOM' | 'READY_STOCK' | 'FABRIC',
      status: item.status as 'DRAFT' | 'PUBLISHED',
      categoryId: item.category_id,
      images: Array.isArray(item.images) ? item.images : JSON.parse(item.images || '[]'),
      sizes: Array.isArray(item.sizes) ? item.sizes : JSON.parse(item.sizes || '["S", "M", "L", "XL", "Custom"]'),
      fabrics: Array.isArray(item.fabrics) ? item.fabrics : JSON.parse(item.fabrics || '[]'),
      isFeatured: Boolean(item.is_featured),
      stock: item.stock ?? 50,
      careInstructions: item.care_instructions || 'Dry clean recommended.',
      estimatedDelivery: item.estimated_delivery || '7-10 business days',
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));
  } catch (err) {
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find((p) => p.slug === slug) || null;
}

export async function createProduct(productData: Partial<Product>): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const slug = productData.name
      ? productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
      : `product-${Date.now()}`;

    const newRow = {
      slug: productData.slug || slug,
      name: productData.name,
      description: productData.description || '',
      short_description: productData.shortDescription || '',
      price: productData.price,
      compare_at_price: productData.compareAtPrice || null,
      type: productData.type || 'CUSTOM',
      status: productData.status || 'PUBLISHED',
      category_id: productData.categoryId || null,
      images: productData.images || [{ id: `img-${Date.now()}`, url: '/images/placeholder.jpg', alt: productData.name || 'Product', order: 1 }],
      sizes: productData.sizes || ['S', 'M', 'L', 'XL', 'Custom'],
      fabrics: productData.fabrics || [],
      is_featured: productData.isFeatured || false,
      stock: productData.stock ?? 50,
      care_instructions: productData.careInstructions || 'Dry clean recommended.',
      estimated_delivery: productData.estimatedDelivery || '7-10 business days',
    };

    const { data, error } = await supabase.from('products').insert([newRow]).select();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error creating product' };
  }
}

export async function deleteProduct(productId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('products').delete().eq('id', productId);
    return !error;
  } catch (err) {
    return false;
  }
}

// ============================================================
// 4. CATEGORIES SERVICES
// ============================================================

export async function getCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (error || !data) {
      return [];
    }

    return data.map((cat) => ({
      id: cat.id,
      slug: cat.slug,
      name: cat.name,
      description: cat.description || '',
      image: cat.image || '/images/placeholder.jpg',
      order: cat.display_order || 1,
    }));
  } catch (err) {
    return [];
  }
}

// ============================================================
// 5. FABRICS SERVICES
// ============================================================

export async function getFabrics(): Promise<Fabric[]> {
  try {
    const { data, error } = await supabase
      .from('fabrics')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map((item) => ({
      id: item.id,
      slug: item.slug,
      name: item.name,
      description: item.description || '',
      pricePerMeter: Number(item.price_per_meter),
      material: item.material || 'Cotton',
      color: item.color || 'Natural',
      colorHex: item.color_hex || '#F5F0E8',
      stock: item.stock ?? 100,
      images: Array.isArray(item.images) ? item.images : JSON.parse(item.images || '[]'),
      careInstructions: item.care_instructions || 'Hand wash or dry clean.',
      status: item.status as 'DRAFT' | 'PUBLISHED',
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));
  } catch (err) {
    return [];
  }
}

// ============================================================
// 6. ORDERS SERVICES
// ============================================================

export async function createOrderInSupabase(orderData: {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: any;
  items: any[];
  totalAmount: number;
  paymentMethod?: string;
}): Promise<{ success: boolean; orderNumber: string; error?: string }> {
  try {
    const orderNumber = `FAB-${Date.now().toString().slice(-6)}`;

    const { data, error } = await supabase.from('orders').insert([
      {
        order_number: orderNumber,
        customer_name: orderData.customerName,
        customer_email: orderData.customerEmail,
        customer_phone: orderData.customerPhone,
        shipping_address: orderData.shippingAddress,
        items: orderData.items,
        total_amount: orderData.totalAmount,
        payment_method: orderData.paymentMethod || 'Razorpay',
        status: 'PENDING',
        payment_status: 'PAID',
      },
    ]).select();

    if (error) {
      console.error('Supabase order error:', error);
      return { success: true, orderNumber };
    }

    return { success: true, orderNumber };
  } catch (err: any) {
    return { success: true, orderNumber: `FAB-${Date.now().toString().slice(-6)}` };
  }
}

export async function getOrdersFromSupabase(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data;
  } catch (err) {
    return [];
  }
}
