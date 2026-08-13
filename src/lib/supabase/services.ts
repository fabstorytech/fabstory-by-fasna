import { supabase } from './client';
import type { Product, Category, Fabric, Order, CustomRequest } from '@/types';

export interface SiteSettings {
  id: string;
  heroDesktopImage: string;
  heroMobileImage: string;
  heroTitle: string;
  heroSubtitle: string;
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

export async function getSiteSettings(): Promise<SiteSettings> {
  const defaultSettings: SiteSettings = {
    id: 'default',
    heroDesktopImage: '/images/hero-latest.jpg',
    heroMobileImage: '/images/hero-mobile.jpg',
    heroTitle: 'Where Style Meets Your Story',
    heroSubtitle: 'Specially curated for Women',
  };

  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 'default')
      .single();

    if (error || !data) {
      return defaultSettings;
    }

    return {
      id: data.id,
      heroDesktopImage: data.hero_desktop_image || defaultSettings.heroDesktopImage,
      heroMobileImage: data.hero_mobile_image || defaultSettings.heroMobileImage,
      heroTitle: data.hero_title || defaultSettings.heroTitle,
      heroSubtitle: data.hero_subtitle || defaultSettings.heroSubtitle,
    };
  } catch (err) {
    return defaultSettings;
  }
}

export async function updateSiteSettings(settings: Partial<SiteSettings>): Promise<boolean> {
  try {
    const payload = {
      id: 'default',
      hero_desktop_image: settings.heroDesktopImage,
      hero_mobile_image: settings.heroMobileImage,
      hero_title: settings.heroTitle,
      hero_subtitle: settings.heroSubtitle,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('site_settings').upsert([payload]);
    return !error;
  } catch (err) {
    return false;
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
