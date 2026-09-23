import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import path from 'path';
import fs from 'fs';
import { generateCustomOrderWhatsAppMessage } from '@/lib/whatsapp';
import { getProductPageUrl } from '@/lib/constants';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'jwter84c',
  api_key: process.env.CLOUDINARY_API_KEY || '568588525992717',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'PyoHDASsIEhvLoO3VRLCPsGTK8Y',
  secure: true,
});

// Cache for uploaded local product images so we upload each file to Cloudinary at most once
const publicImageCache = new Map<string, string>();

/**
 * Resolves a local or relative image to a permanent, public HTTPS Cloudinary URL
 * so WhatsApp scrapers and preview engines can load and display the image preview.
 */
async function resolveToPublicCloudinaryUrl(rawImageUrl?: string): Promise<string> {
  if (!rawImageUrl) {
    return 'https://res.cloudinary.com/jwter84c/image/upload/v1740000000/fabstory-products/placeholder.jpg';
  }

  // If it's already an external HTTPS URL (e.g. Cloudinary, Imgur, Supabase Storage) and NOT localhost
  if (
    rawImageUrl.startsWith('https://') &&
    !rawImageUrl.includes('localhost') &&
    !rawImageUrl.includes('127.0.0.1')
  ) {
    return rawImageUrl;
  }

  // Check cache
  if (publicImageCache.has(rawImageUrl)) {
    return publicImageCache.get(rawImageUrl)!;
  }

  try {
    // Extract local file path inside the /public directory
    let relativePath = rawImageUrl;
    if (relativePath.includes('localhost:') || relativePath.includes('127.0.0.1:')) {
      try {
        const parsed = new URL(relativePath);
        relativePath = parsed.pathname;
      } catch {
        // use as-is
      }
    }

    // Clean leading slash
    const cleanRelativePath = relativePath.replace(/^\//, '');
    const absolutePath = path.join(process.cwd(), 'public', cleanRelativePath);

    if (fs.existsSync(absolutePath)) {
      const uploadResult = await cloudinary.uploader.upload(absolutePath, {
        folder: 'fabstory-products',
        resource_type: 'image',
      });

      if (uploadResult && uploadResult.secure_url) {
        publicImageCache.set(rawImageUrl, uploadResult.secure_url);
        return uploadResult.secure_url;
      }
    }
  } catch (err) {
    console.error('Failed to upload local image to Cloudinary:', err);
  }

  // Fallback to a default public Cloudinary URL if local file is missing
  return 'https://res.cloudinary.com/jwter84c/image/upload/v1740000000/fabstory-products/placeholder.jpg';
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      productName = 'Fabstory Outfit',
      slug = '',
      category = '',
      price = 0,
      customizationCharge = 0,
      fabric = 'Standard',
      size = 'Custom',
      quantity = 1,
      measurements = {},
      instructions = '',
      image = '',
      referenceImageUrl = '',
      productUrl = '',
    } = body;

    // 1. Resolve product image to a public HTTPS Cloudinary URL (preserves existing Cloudinary URL)
    const publicProductImageUrl = await resolveToPublicCloudinaryUrl(image);

    // 2. Ensure product URL uses the real production website domain and never localhost
    const finalProductUrl =
      productUrl && !productUrl.includes('localhost') && !productUrl.includes('127.0.0.1')
        ? productUrl
        : slug
        ? getProductPageUrl(slug)
        : productUrl;

    // 3. Format the message with rich emojis, product image, measurements & product details page link at bottom
    const cleanMessage = generateCustomOrderWhatsAppMessage({
      productName,
      category,
      productPrice: Number(price),
      quantity: Number(quantity),
      selectedFabric: fabric,
      selectedSize: size,
      customizationCharge: Number(customizationCharge),
      grandTotal: (Number(price) + Number(customizationCharge)) * Number(quantity),
      measurements,
      specialInstructions: instructions,
      imageUrl: publicProductImageUrl,
      referenceImageUrl: referenceImageUrl || undefined,
      productUrl: finalProductUrl,
    });

    // 3. Encode with clean UTF-8 to preserve all emojis & symbols
    const processedMessage = new TextDecoder('utf-8').decode(
      new TextEncoder().encode(cleanMessage)
    );
    const whatsappUrl = `https://api.whatsapp.com/send?phone=919656276402&text=${encodeURIComponent(
      processedMessage
    )}`;

    return NextResponse.json({
      success: true,
      whatsappUrl,
      imageUrl: publicProductImageUrl,
      referenceImageUrl: referenceImageUrl || null,
      message: cleanMessage,
    });
  } catch (error: any) {
    console.error('WhatsApp inquiry API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process WhatsApp inquiry' },
      { status: 500 }
    );
  }
}
