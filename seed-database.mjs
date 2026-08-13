import { v2 as cloudinary } from 'cloudinary';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const rootDir = process.cwd();

// 1. Configure Cloudinary
cloudinary.config({
  cloud_name: 'jwter84c',
  api_key: '568588525992717',
  api_secret: 'PyoHDASsIEhvLoO3VRLCPsGTK8Y',
  secure: true,
});

// 2. Configure Supabase
const supabaseUrl = 'https://cwrcmppwattowaxcjkdf.supabase.co';
const supabaseKey = 'sb_publishable_DiFN5enKKYJMERapu9KetA_24bRba49';
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to upload local file to Cloudinary
async function uploadLocalFileToCloudinary(relativePath) {
  try {
    const fullPath = path.join(rootDir, 'public', relativePath);
    if (!fs.existsSync(fullPath)) {
      console.log(`File not found: ${fullPath}, skipping...`);
      return null;
    }

    const result = await cloudinary.uploader.upload(fullPath, {
      folder: 'fabstory-seeded-products',
    });

    console.log(`Uploaded ${relativePath} -> ${result.secure_url}`);
    return result.secure_url;
  } catch (err) {
    console.error(`Error uploading ${relativePath}:`, err.message);
    return null;
  }
}

async function seed() {
  console.log('🚀 Starting Automatic Database Seeding to Cloudinary & Supabase...');

  // Step A: Upload Hero Images to Cloudinary
  console.log('\n📸 Uploading Hero Images to Cloudinary...');
  const desktopHeroUrl = await uploadLocalFileToCloudinary('/images/hero-latest.jpg');
  const mobileHeroUrl = await uploadLocalFileToCloudinary('/images/hero-mobile.jpg');

  if (desktopHeroUrl || mobileHeroUrl) {
    await supabase.from('site_settings').upsert([
      {
        id: 'default',
        hero_desktop_image: desktopHeroUrl || '',
        hero_mobile_image: mobileHeroUrl || '',
        hero_title: 'Where Style Meets Your Story',
        hero_subtitle: 'Specially curated for Women',
        updated_at: new Date().toISOString(),
      },
    ]);
    console.log('✅ Site settings (Hero images) populated in Supabase!');
  }

  // Step B: Upload Category Images & Insert Categories
  console.log('\n📁 Uploading Categories to Cloudinary & Supabase...');
  const categoriesData = [
    {
      slug: 'custom-made-outfits',
      name: 'Custom Made Outfits',
      description: 'Elegantly crafted outfits tailored to your measurements and style.',
      localImage: '/images/categories/custom-made.jpg',
      display_order: 1,
    },
    {
      slug: 'ready-to-ship',
      name: 'Ready to Ship Collection',
      description: 'Beautiful ready-made outfits available for immediate delivery.',
      localImage: '/images/categories/ready-to-ship.jpg',
      display_order: 2,
    },
    {
      slug: 'fabrics',
      name: 'Fabrics by the Meter',
      description: 'Premium handpicked fabrics for your creative designs.',
      localImage: '/images/categories/fabrics.jpg',
      display_order: 3,
    },
    {
      slug: 'accessories',
      name: 'Accessories & More',
      description: 'Complement your outfit with our curated accessories.',
      localImage: '/images/categories/accessories.jpg',
      display_order: 4,
    },
  ];

  for (const cat of categoriesData) {
    const cloudUrl = await uploadLocalFileToCloudinary(cat.localImage);
    const { error } = await supabase.from('categories').upsert([
      {
        slug: cat.slug,
        name: cat.name,
        description: cat.description,
        image: cloudUrl || '',
        display_order: cat.display_order,
      },
    ], { onConflict: 'slug' });

    if (error) console.error(`Error inserting category ${cat.name}:`, error.message);
    else console.log(`✅ Category inserted: ${cat.name}`);
  }

  // Step C: Upload Product Images & Insert Products
  console.log('\n👗 Uploading Products to Cloudinary & Supabase...');
  const initialProducts = [
    {
      slug: 'floral-anarkali',
      name: 'Floral Anarkali',
      description: 'A timeless anarkali with delicate floral embroidery crafted for elegance and comfort. Perfect for festive occasions and celebrations.',
      short_description: 'Elegant floral embroidered anarkali suit',
      price: 3499,
      compare_at_price: 4999,
      type: 'CUSTOM',
      status: 'PUBLISHED',
      is_featured: true,
      stock: 50,
      localImages: ['/images/products/product-1.jpg', '/images/products/product-2.jpg'],
    },
    {
      slug: 'embroidered-abaya',
      name: 'Embroidered Abaya',
      description: 'A graceful abaya featuring intricate embroidery work, crafted with premium linen for a luxurious drape.',
      short_description: 'Luxurious embroidered abaya in premium linen',
      price: 2099,
      compare_at_price: 2999,
      type: 'CUSTOM',
      status: 'PUBLISHED',
      is_featured: true,
      stock: 30,
      localImages: ['/images/products/product-2.jpg'],
    },
    {
      slug: 'pastel-kurti-set',
      name: 'Pastel Kurti Set',
      description: 'A delicate pastel kurti set with coordinated bottom and dupatta. Ideal for everyday elegance.',
      short_description: 'Pastel-toned kurti set with dupatta',
      price: 2499,
      compare_at_price: 3200,
      type: 'READY_STOCK',
      status: 'PUBLISHED',
      is_featured: true,
      stock: 15,
      localImages: ['/images/products/product-3.jpg'],
    },
    {
      slug: 'sharara-set',
      name: 'Sharara Set',
      description: 'A stunning sharara set with delicate detailing, perfect for weddings and festive celebrations.',
      short_description: 'Premium sharara set for festive occasions',
      price: 4499,
      compare_at_price: 5999,
      type: 'CUSTOM',
      status: 'PUBLISHED',
      is_featured: true,
      stock: 25,
      localImages: ['/images/products/product-4.jpg'],
    },
    {
      slug: 'elegant-kaftan',
      name: 'Elegant Kaftan',
      description: 'A flowing kaftan with sophisticated draping and minimal embellishments for effortless style.',
      short_description: 'Flowing elegant kaftan dress',
      price: 2999,
      compare_at_price: 3999,
      type: 'READY_STOCK',
      status: 'PUBLISHED',
      is_featured: true,
      stock: 20,
      localImages: ['/images/products/product-5.jpg'],
    },
  ];

  for (const prod of initialProducts) {
    const uploadedImages = [];
    for (let i = 0; i < prod.localImages.length; i++) {
      const url = await uploadLocalFileToCloudinary(prod.localImages[i]);
      if (url) {
        uploadedImages.push({
          id: `img-${Date.now()}-${i}`,
          url: url,
          alt: prod.name,
          order: i + 1,
        });
      }
    }

    const { error } = await supabase.from('products').upsert([
      {
        slug: prod.slug,
        name: prod.name,
        description: prod.description,
        short_description: prod.short_description,
        price: prod.price,
        compare_at_price: prod.compare_at_price,
        type: prod.type,
        status: prod.status,
        is_featured: prod.is_featured,
        stock: prod.stock,
        images: uploadedImages,
        sizes: ['S', 'M', 'L', 'XL', 'Custom'],
      },
    ], { onConflict: 'slug' });

    if (error) console.error(`Error inserting product ${prod.name}:`, error.message);
    else console.log(`✅ Product inserted: ${prod.name} with Cloudinary images!`);
  }

  // Step D: Upload Fabrics
  console.log('\n🧶 Uploading Fabrics to Cloudinary & Supabase...');
  const initialFabrics = [
    {
      slug: 'premium-cotton',
      name: 'Premium Cotton',
      description: 'Soft, breathable premium cotton fabric. Ideal for everyday wear.',
      price_per_meter: 599,
      material: 'Cotton',
      color: 'White',
      color_hex: '#F5F0E8',
      stock: 100,
      localImage: '/images/products/product-1.jpg',
    },
    {
      slug: 'pure-linen',
      name: 'Pure Linen',
      description: 'Premium linen with natural texture and exceptional drape.',
      price_per_meter: 899,
      material: 'Linen',
      color: 'Natural',
      color_hex: '#D4C5A9',
      stock: 75,
      localImage: '/images/products/product-2.jpg',
    },
    {
      slug: 'silk-blend',
      name: 'Silk Blend',
      description: 'Luxurious silk blend with a beautiful sheen and smooth finish.',
      price_per_meter: 1299,
      material: 'Silk',
      color: 'Champagne',
      color_hex: '#E8D8C4',
      stock: 40,
      localImage: '/images/products/product-3.jpg',
    },
  ];

  for (const fab of initialFabrics) {
    const cloudUrl = await uploadLocalFileToCloudinary(fab.localImage);
    const { error } = await supabase.from('fabrics').upsert([
      {
        slug: fab.slug,
        name: fab.name,
        description: fab.description,
        price_per_meter: fab.price_per_meter,
        material: fab.material,
        color: fab.color,
        color_hex: fab.color_hex,
        stock: fab.stock,
        images: [{ id: `fab-img-${Date.now()}`, url: cloudUrl || '', alt: fab.name, order: 1 }],
      },
    ], { onConflict: 'slug' });

    if (error) console.error(`Error inserting fabric ${fab.name}:`, error.message);
    else console.log(`✅ Fabric inserted: ${fab.name}`);
  }

  console.log('\n🎉 ALL PRODUCTS, CATEGORIES, FABRICS & HERO IMAGES AUTOMATICALLY SEEDED TO CLOUDINARY & SUPABASE!');
}

seed();
