import { supabase } from './client';
import { createClient as createSupabaseDirectClient } from '@supabase/supabase-js';
import type { Product, Category, Fabric, Order, CustomRequest } from '@/types';
import { DEFAULT_CATEGORIES } from '@/lib/constants';

export { DEFAULT_CATEGORIES };

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cwrcmppwattowaxcjkdf.supabase.co';
// Anon key is always available (NEXT_PUBLIC_) on Vercel — used as fallback when service role key is absent.
// RLS on site_settings allows public SELECT so the anon key is sufficient for reads.
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_DiFN5enKKYJMERapu9KetA_24bRba49';

function getDirectClient() {
  if (typeof window === 'undefined') {
    // Prefer service role key (bypasses RLS), fall back to anon key (reads work via public RLS)
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;
    return createSupabaseDirectClient(SUPABASE_URL, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return supabase;
}

export interface SiteSettings {
  id: string;
  heroDesktopImage: string;
  heroMobileImage: string;
  heroTitle: string;
  heroSubtitle: string;
  slide1Active?: boolean;
  heroDesktopImage2?: string;
  heroMobileImage2?: string;
  heroTitle2?: string;
  heroSubtitle2?: string;
  slide2Active?: boolean;
  heroDesktopImage3?: string;
  heroMobileImage3?: string;
  heroTitle3?: string;
  heroSubtitle3?: string;
  slide3Active?: boolean;
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
  heroDesktopImage: '/images/hero-new.jpg',
  heroMobileImage: '/images/hero-mobile.jpg',
  heroTitle: 'Where Style Meets Your Story',
  heroSubtitle: 'Specially curated for Women',
  slide1Active: true,
  heroDesktopImage2: '',
  heroMobileImage2: '',
  heroTitle2: 'Crafted with Love & Detail',
  heroSubtitle2: 'Timeless Occasion Wear & Bespoke Couture',
  slide2Active: false,
  heroDesktopImage3: '',
  heroMobileImage3: '',
  heroTitle3: 'Designed for Every Moment',
  heroSubtitle3: 'Curated luxury & handcrafted elegance',
  slide3Active: false,
  loginImage: '/images/craftsmanship.jpg',
  loginTitle: 'Where Style\nMeets Your Story',
  loginSubtitle: 'FABSTORY BY FASNA',
};

export async function getSiteSettings(): Promise<SiteSettings> {
  let settings = { ...DEFAULT_SITE_SETTINGS };

  // 1. Direct Supabase query (uses service role direct client on server to bypass RLS, or anon client in browser)
  try {
    const client = getDirectClient();
    const { data, error } = await client
      .from('site_settings')
      .select('*')
      .eq('id', 'default')
      .maybeSingle();

    if (!error && data) {
      const mergedSettings: SiteSettings = {
        ...settings,
        id: data.id || 'default',
        heroDesktopImage: data.hero_desktop_image ? data.hero_desktop_image : settings.heroDesktopImage,
        heroMobileImage: data.hero_mobile_image ? data.hero_mobile_image : (data.hero_desktop_image || settings.heroMobileImage),
        heroTitle: data.hero_title || settings.heroTitle,
        heroSubtitle: data.hero_subtitle || settings.heroSubtitle,
        loginImage: data.login_image || settings.loginImage,
        loginTitle: data.login_title || settings.loginTitle,
        loginSubtitle: data.login_subtitle || settings.loginSubtitle,
      };

      if (data.slide1_active !== undefined) mergedSettings.slide1Active = Boolean(data.slide1_active);
      if (data.hero_desktop_image_2 !== undefined) mergedSettings.heroDesktopImage2 = data.hero_desktop_image_2 ?? '';
      if (data.hero_mobile_image_2 !== undefined) mergedSettings.heroMobileImage2 = data.hero_mobile_image_2 ?? '';
      if (data.hero_title_2) mergedSettings.heroTitle2 = data.hero_title_2;
      if (data.hero_subtitle_2) mergedSettings.heroSubtitle2 = data.hero_subtitle_2;
      if (data.slide2_active !== undefined) mergedSettings.slide2Active = Boolean(data.slide2_active);

      if (data.hero_desktop_image_3 !== undefined) mergedSettings.heroDesktopImage3 = data.hero_desktop_image_3 ?? '';
      if (data.hero_mobile_image_3 !== undefined) mergedSettings.heroMobileImage3 = data.hero_mobile_image_3 ?? '';
      if (data.hero_title_3) mergedSettings.heroTitle3 = data.hero_title_3;
      if (data.hero_subtitle_3) mergedSettings.heroSubtitle3 = data.hero_subtitle_3;
      if (data.slide3_active !== undefined) mergedSettings.slide3Active = Boolean(data.slide3_active);

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('fabstory_site_settings', JSON.stringify(mergedSettings));
        } catch (_) {}
      }

      return mergedSettings;
    }
  } catch (err) {
    // Continue to API or localStorage fallback
  }

  // 2. If in browser and direct query had an issue, query the server API endpoint
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch('/api/site-settings', {
        method: 'GET',
        cache: 'no-store',
      }).catch(() => fetch('/api/admin/site-settings', { method: 'GET', cache: 'no-store' }));

      if (res && res.ok) {
        const json = await res.json();
        if (json.success && json.settings) {
          const data = json.settings;
          const merged: SiteSettings = {
            ...settings,
            id: data.id || 'default',
            heroDesktopImage: data.hero_desktop_image ? data.hero_desktop_image : settings.heroDesktopImage,
            heroMobileImage: data.hero_mobile_image ? data.hero_mobile_image : (data.hero_desktop_image || settings.heroMobileImage),
            heroTitle: data.hero_title || settings.heroTitle,
            heroSubtitle: data.hero_subtitle || settings.heroSubtitle,
            loginImage: data.login_image || settings.loginImage,
            loginTitle: data.login_title || settings.loginTitle,
            loginSubtitle: data.login_subtitle || settings.loginSubtitle,
          };
          if (data.slide1_active !== undefined) merged.slide1Active = Boolean(data.slide1_active);
          if (data.hero_desktop_image_2 !== undefined) merged.heroDesktopImage2 = data.hero_desktop_image_2 ?? '';
          if (data.hero_mobile_image_2 !== undefined) merged.heroMobileImage2 = data.hero_mobile_image_2 ?? '';
          if (data.hero_title_2) merged.heroTitle2 = data.hero_title_2;
          if (data.hero_subtitle_2) merged.heroSubtitle2 = data.hero_subtitle_2;
          if (data.slide2_active !== undefined) merged.slide2Active = Boolean(data.slide2_active);

          if (data.hero_desktop_image_3 !== undefined) merged.heroDesktopImage3 = data.hero_desktop_image_3 ?? '';
          if (data.hero_mobile_image_3 !== undefined) merged.heroMobileImage3 = data.hero_mobile_image_3 ?? '';
          if (data.hero_title_3) merged.heroTitle3 = data.hero_title_3;
          if (data.hero_subtitle_3) merged.heroSubtitle3 = data.hero_subtitle_3;
          if (data.slide3_active !== undefined) merged.slide3Active = Boolean(data.slide3_active);

          try {
            localStorage.setItem('fabstory_site_settings', JSON.stringify(merged));
          } catch (_) {}

          return merged;
        }
      }
    } catch (_) {}

    try {
      const stored = localStorage.getItem('fabstory_site_settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed) {
          // If this device holds custom uploaded banners in localStorage, automatically sync them to Supabase
          const hasCustomImages =
            (parsed.heroDesktopImage && parsed.heroDesktopImage.startsWith('http')) ||
            (parsed.heroMobileImage && parsed.heroMobileImage.startsWith('http')) ||
            (parsed.heroDesktopImage2 && parsed.heroDesktopImage2.startsWith('http')) ||
            (parsed.heroMobileImage2 && parsed.heroMobileImage2.startsWith('http')) ||
            (parsed.heroDesktopImage3 && parsed.heroDesktopImage3.startsWith('http')) ||
            (parsed.heroMobileImage3 && parsed.heroMobileImage3.startsWith('http'));

          if (hasCustomImages) {
            fetch('/api/admin/site-settings', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ settings: parsed }),
            }).catch(() => {});
          }
          return {
            ...settings,
            ...parsed,
            heroDesktopImage: parsed.heroDesktopImage || settings.heroDesktopImage,
            heroMobileImage: parsed.heroMobileImage || settings.heroMobileImage,
          };
        }
      }
    } catch (_) {}
  }

  return settings;
}

export async function updateSiteSettings(settings: Partial<SiteSettings>): Promise<boolean> {
  try {
    // 1. Persist immediately in localStorage for instant responsiveness
    if (typeof window !== 'undefined') {
      try {
        const current = localStorage.getItem('fabstory_site_settings');
        const merged = { ...(current ? JSON.parse(current) : DEFAULT_SITE_SETTINGS), ...settings };
        localStorage.setItem('fabstory_site_settings', JSON.stringify(merged));
      } catch (_) {}
    }

    // 2. Persist to Supabase via server-side API endpoint (uses Service Role to bypass any RLS locks)
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch('/api/admin/site-settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ settings }),
        });
        const json = await res.json();
        if (json.success) {
          return true;
        }
      } catch (apiErr) {
        console.warn('[updateSiteSettings] API call error, falling back to direct Supabase client:', apiErr);
      }
    }

    // 3. Fallback direct client upsert
    const fullPayload: any = {
      id: 'default',
      hero_desktop_image: settings.heroDesktopImage,
      hero_mobile_image: settings.heroMobileImage,
      hero_title: settings.heroTitle,
      hero_subtitle: settings.heroSubtitle,
      updated_at: new Date().toISOString(),
    };

    if (settings.slide1Active !== undefined) fullPayload.slide1_active = settings.slide1Active;
    if (settings.heroDesktopImage2 !== undefined) fullPayload.hero_desktop_image_2 = settings.heroDesktopImage2;
    if (settings.heroMobileImage2 !== undefined) fullPayload.hero_mobile_image_2 = settings.heroMobileImage2;
    if (settings.heroTitle2 !== undefined) fullPayload.hero_title_2 = settings.heroTitle2;
    if (settings.heroSubtitle2 !== undefined) fullPayload.hero_subtitle_2 = settings.heroSubtitle2;
    if (settings.slide2Active !== undefined) fullPayload.slide2_active = settings.slide2Active;

    if (settings.heroDesktopImage3 !== undefined) fullPayload.hero_desktop_image_3 = settings.heroDesktopImage3;
    if (settings.heroMobileImage3 !== undefined) fullPayload.hero_mobile_image_3 = settings.heroMobileImage3;
    if (settings.heroTitle3 !== undefined) fullPayload.hero_title_3 = settings.heroTitle3;
    if (settings.heroSubtitle3 !== undefined) fullPayload.hero_subtitle_3 = settings.heroSubtitle3;
    if (settings.slide3Active !== undefined) fullPayload.slide3_active = settings.slide3Active;

    if (settings.loginImage !== undefined) fullPayload.login_image = settings.loginImage;
    if (settings.loginTitle !== undefined) fullPayload.login_title = settings.loginTitle;
    if (settings.loginSubtitle !== undefined) fullPayload.login_subtitle = settings.loginSubtitle;

    const { error } = await supabase.from('site_settings').upsert([fullPayload], { onConflict: 'id' });

    if (error) {
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

      await supabase.from('site_settings').upsert([corePayload], { onConflict: 'id' });
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

export async function updateProduct(
  productId: string,
  productData: Partial<Product>
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const updateRow: any = {
      updated_at: new Date().toISOString(),
    };
    if (productData.name !== undefined) updateRow.name = productData.name;
    if (productData.slug !== undefined) updateRow.slug = productData.slug;
    if (productData.description !== undefined) updateRow.description = productData.description;
    if (productData.shortDescription !== undefined) updateRow.short_description = productData.shortDescription;
    if (productData.price !== undefined) updateRow.price = productData.price;
    if (productData.compareAtPrice !== undefined) updateRow.compare_at_price = productData.compareAtPrice;
    if (productData.type !== undefined) updateRow.type = productData.type;
    if (productData.status !== undefined) updateRow.status = productData.status;
    if (productData.categoryId !== undefined) updateRow.category_id = productData.categoryId || null;
    if (productData.images !== undefined) updateRow.images = productData.images;
    if (productData.sizes !== undefined) updateRow.sizes = productData.sizes;
    if (productData.stock !== undefined) updateRow.stock = productData.stock;
    if (productData.isFeatured !== undefined) updateRow.is_featured = productData.isFeatured;

    const { data, error } = await supabase.from('products').update(updateRow).eq('id', productId).select();
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error updating product' };
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

    if (error) {
      console.warn('Supabase getCategories query failed, using defaults:', error.message);
      return DEFAULT_CATEGORIES;
    }

    if (!data || data.length === 0) {
      // Auto-populate default categories into Supabase so they are immediately persisted and editable with real DB IDs
      try {
        const { data: inserted, error: insertError } = await supabase
          .from('categories')
          .upsert(
            DEFAULT_CATEGORIES.map((c) => ({
              slug: c.slug,
              name: c.name,
              description: c.description,
              image: c.image,
              display_order: c.order,
            })),
            { onConflict: 'slug' }
          )
          .select();

        if (!insertError && inserted && inserted.length > 0) {
          return inserted.map((cat) => ({
            id: cat.id,
            slug: cat.slug,
            name: cat.name,
            description: cat.description || '',
            image: cat.image || '/images/placeholder.jpg',
            order: cat.display_order || 1,
          }));
        }
      } catch (seedErr) {
        console.warn('Auto-seed default categories failed:', seedErr);
      }
      return DEFAULT_CATEGORIES;
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
    return DEFAULT_CATEGORIES;
  }
}

export async function seedDefaultCategories(): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const rows = DEFAULT_CATEGORIES.map((cat) => ({
      slug: cat.slug,
      name: cat.name,
      description: cat.description,
      image: cat.image,
      display_order: cat.order,
    }));

    const { data, error } = await supabase
      .from('categories')
      .upsert(rows, { onConflict: 'slug' })
      .select();

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error seeding default categories' };
  }
}

export async function createCategory(
  catData: Partial<Category>
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const slug = catData.name
      ? catData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
      : `cat-${Date.now()}`;

    const newRow = {
      name: catData.name,
      slug: catData.slug || slug,
      description: catData.description || '',
      image: catData.image || '/images/placeholder.jpg',
      display_order: catData.order || 1,
    };

    const { data, error } = await supabase.from('categories').insert([newRow]).select();
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error creating category' };
  }
}

export async function updateCategory(
  categoryId: string,
  catData: Partial<Category>
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const updateRow: any = {
      updated_at: new Date().toISOString(),
    };
    if (catData.name !== undefined) updateRow.name = catData.name;
    if (catData.slug !== undefined) updateRow.slug = catData.slug;
    if (catData.description !== undefined) updateRow.description = catData.description;
    if (catData.image !== undefined) updateRow.image = catData.image;
    if (catData.order !== undefined) updateRow.display_order = catData.order;

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(categoryId);

    let res;
    if (isUuid) {
      res = await supabase.from('categories').update(updateRow).eq('id', categoryId).select();
    } else {
      const slugKey = catData.slug || categoryId;
      res = await supabase.from('categories').upsert({
        ...updateRow,
        slug: slugKey,
        name: catData.name || '',
        description: catData.description || '',
        image: catData.image || '/images/placeholder.jpg',
        display_order: catData.order || 1,
      }, { onConflict: 'slug' }).select();
    }

    if (res.error) {
      return { success: false, error: res.error.message };
    }
    return { success: true, data: res.data };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error updating category' };
  }
}

export async function deleteCategory(categoryId: string): Promise<boolean> {
  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(categoryId);
    const query = isUuid
      ? supabase.from('categories').delete().eq('id', categoryId)
      : supabase.from('categories').delete().eq('slug', categoryId);
    const { error } = await query;
    return !error;
  } catch (err) {
    return false;
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
