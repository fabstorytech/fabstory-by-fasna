'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BrandPromises from '@/components/home/BrandPromises';
import type { Product } from '@/types';
import { getProductBySlug, getProducts, uploadImageToCloudinary } from '@/lib/supabase/services';
import { formatPrice } from '@/lib/utils';
import { addToCart } from '@/lib/cart';
import { BRAND, getProductPageUrl } from '@/lib/constants';
import { generateCustomOrderWhatsAppMessage, openWhatsApp } from '@/lib/whatsapp';
import {
  Star,
  ShieldCheck,
  Ruler,
  Lock,
  Globe,
  Minus,
  Plus,
  Upload,
  ShoppingBag,
  MessageCircle,
  X,
  Check,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductDetailPage({ params }: ProductPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedFabric, setSelectedFabric] = useState('Premium Cotton');
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  
  // Customization Popup Modal state (hidden by default as requested)
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [cartSuccessMessage, setCartSuccessMessage] = useState<string | null>(null);

  // Custom Measurements state
  const [bust, setBust] = useState('34');
  const [waist, setWaist] = useState('28');
  const [hips, setHips] = useState('36');
  const [shoulder, setShoulder] = useState('14');
  const [sleeveLength, setSleeveLength] = useState('22');
  const [outfitLength, setOutfitLength] = useState('52');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [isUploadingReference, setIsUploadingReference] = useState<boolean>(false);
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState<boolean>(false);

  // Upload reference image file to Cloudinary via API
  const handleReferenceFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setIsUploadingReference(true);
    try {
      const url = await uploadImageToCloudinary(file);
      if (url) {
        setUploadedFileUrl(url);
      }
    } catch (err) {
      console.error('Failed to upload reference image:', err);
    } finally {
      setIsUploadingReference(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    getProductBySlug(slug).then((data) => {
      if (data) {
        setProduct(data);
        if (data.fabrics && data.fabrics.length > 0) {
          setSelectedFabric(data.fabrics[0].name);
        }
      } else {
        // Fallback to first available product if slug match fails
        getProducts().then((all) => {
          if (all && all.length > 0) {
            setProduct(all[0]);
          }
        });
      }
      setLoading(false);
    });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8F5EF]">
        <Header />
        <main className="flex-1 flex items-center justify-center p-12">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-2 border-[#23484A] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-[#6F7775]">Loading product details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8F5EF]">
        <Header />
        <main className="flex-1 flex items-center justify-center p-12">
          <div className="text-center space-y-4 max-w-md bg-white p-8 border border-[#E5E0D8]">
            <ShoppingBag className="w-10 h-10 text-[#C7A66A] mx-auto opacity-70" />
            <h2 className="font-serif text-xl text-[#23484A]">Product Not Found</h2>
            <p className="text-xs text-[#6F7775]">The product you requested is not available in the store database.</p>
            <Link href="/shop" className="btn bg-[#23484A] text-white text-xs font-semibold px-6 py-2.5 inline-block">
              BROWSE CATALOG
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const customizationCharge = selectedSize === 'Custom' ? 500 : 0;
  const itemTotal = (product.price + customizationCharge) * quantity;
  const imagesList = product.images && product.images.length > 0 ? product.images : [{ id: '1', url: '/images/placeholder.jpg', alt: product.name, order: 1 }];
  const fabricsList = product.fabrics && product.fabrics.length > 0 ? product.fabrics : [{ id: 'f1', fabricId: '1', name: 'Premium Cotton', additionalPrice: 0 }];
  const sizesList = product.sizes && product.sizes.length > 0 ? product.sizes : ['S', 'M', 'L', 'XL', 'Custom'];

  // 1. ADD TO CART HANDLER
  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      fabric: selectedFabric,
      size: selectedSize,
      customSize: selectedSize === 'Custom',
      price: product.price + customizationCharge,
      quantity,
      image: imagesList[0]?.url || '/images/placeholder.jpg',
      measurements:
        selectedSize === 'Custom'
          ? {
              bust,
              waist,
              hips,
              shoulder,
              sleeveLength,
              outfitLength,
              notes: specialInstructions,
            }
          : undefined,
    });

    setCartSuccessMessage('Added to cart!');
    setTimeout(() => {
      setCartSuccessMessage(null);
    }, 2500);
  };

  // 2. BUY NOW HANDLER
  const handleBuyNow = () => {
    addToCart({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      fabric: selectedFabric,
      size: selectedSize,
      customSize: selectedSize === 'Custom',
      price: product.price + customizationCharge,
      quantity,
      image: imagesList[0]?.url || '/images/placeholder.jpg',
      measurements:
        selectedSize === 'Custom'
          ? {
              bust,
              waist,
              hips,
              shoulder,
              sleeveLength,
              outfitLength,
              notes: specialInstructions,
            }
          : undefined,
    });
    router.push('/checkout');
  };

  // 3. WHATSAPP CUSTOMIZATION SEND HANDLERS (RICH EMOJIS, IMAGE, SITE LINK & UTF-8)
  const getWhatsAppMessage = (publicImgUrl?: string) => {
    // 1. PRODUCT IMAGE: Existing Cloudinary URL already stored in product
    const imageUrl =
      publicImgUrl ||
      product.images?.[0]?.url ||
      imagesList[0]?.url ||
      '';

    // 2. PRODUCT DETAIL PAGE URL: Real production domain + product route/slug (never localhost)
    const productUrl = getProductPageUrl(product.slug);

    return generateCustomOrderWhatsAppMessage({
      productName: product.name,
      category: product.categoryId || '',
      productPrice: product.price,
      quantity,
      selectedFabric,
      selectedSize,
      customizationCharge,
      grandTotal: (product.price + customizationCharge) * quantity,
      measurements: {
        bust: bust || '34',
        waist: waist || '28',
        hips: hips || '36',
        shoulder: shoulder || '14',
        sleeveLength: sleeveLength || '22',
        outfitLength: outfitLength || '52',
      },
      specialInstructions,
      imageUrl,
      referenceImageUrl: uploadedFileUrl || undefined,
      productUrl,
    });
  };

  const handleSendWhatsApp = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!product) return;

    setIsSendingWhatsApp(true);
    // Real production URL using product's slug (never localhost)
    const productUrl = getProductPageUrl(product.slug);
    const existingProductImage = product.images?.[0]?.url || imagesList[0]?.url || '';

    try {
      const res = await fetch('/api/whatsapp-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: product.name,
          slug: product.slug,
          category: product.categoryId || '',
          price: product.price,
          customizationCharge,
          fabric: selectedFabric,
          size: selectedSize,
          quantity,
          measurements: {
            bust: bust || '34',
            waist: waist || '28',
            hips: hips || '36',
            shoulder: shoulder || '14',
            sleeveLength: sleeveLength || '22',
            outfitLength: outfitLength || '52',
          },
          instructions: specialInstructions,
          image: existingProductImage,
          referenceImageUrl: uploadedFileUrl || '',
          productUrl,
        }),
      });

      const data = await res.json();

      if (data && data.message) {
        // Dispatch using clean UTF-8 text decoder/encoder to Fasna's WhatsApp
        openWhatsApp(BRAND.whatsappNumber, data.message);
      } else {
        const fallbackMsg = getWhatsAppMessage();
        openWhatsApp(BRAND.whatsappNumber, fallbackMsg);
      }
    } catch (err) {
      console.error('WhatsApp inquiry error, using fallback:', err);
      const fallbackMsg = getWhatsAppMessage();
      openWhatsApp(BRAND.whatsappNumber, fallbackMsg);
    } finally {
      setIsSendingWhatsApp(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5EF]">
      <Header />

      <main className="flex-1 section-padding">
        <div className="container-main space-y-6 sm:space-y-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-[#6F7775]">
            <Link href="/" className="hover:text-[#23484A]">Home</Link>
            <span>›</span>
            <Link href="/shop" className="hover:text-[#23484A]">Shop</Link>
            <span>›</span>
            <span className="text-[#23484A] font-medium">{product.name}</span>
          </div>

          {/* Top Toast Alert */}
          {cartSuccessMessage && (
            <div className="fixed top-20 right-6 z-50 bg-[#23484A] text-white text-xs font-semibold px-4 py-3 rounded-md shadow-xl flex items-center gap-2 animate-fade-in">
              <Check className="w-4 h-4 text-green-300" />
              <span>{cartSuccessMessage}</span>
              <Link href="/cart" className="underline ml-2 text-[#C7A66A] hover:text-white">
                View Cart →
              </Link>
            </div>
          )}



          {/* Top Section: Gallery + Product Info */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Image Gallery */}
            <div className="lg:col-span-6 space-y-4">
              <div className="relative aspect-[3/4] w-full bg-white rounded-sm overflow-hidden border border-[#E5E0D8] shadow-sm">
                <Image
                  src={imagesList[selectedImage]?.url || imagesList[0].url}
                  alt={product.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-top"
                />
              </div>

              {/* Gallery Thumbnails */}
              {imagesList.length > 1 && (
                <div className="flex items-center gap-3">
                  {imagesList.map((img, idx) => (
                    <button
                      key={img.id || idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`relative w-20 h-24 rounded-xs overflow-hidden border transition-all ${
                        selectedImage === idx ? 'border-[#23484A] ring-1 ring-[#23484A]' : 'border-[#E5E0D8] opacity-70 hover:opacity-100'
                      }`}
                    >
                      <Image src={img.url} alt={img.alt || product.name} fill className="object-cover object-top" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Product Details */}
            <div className="lg:col-span-6 bg-white p-6 md:p-8 border border-[#E5E0D8] space-y-6">
              <div>
                <h1 className="font-serif text-3xl md:text-4xl text-[#23484A]">
                  {product.name}
                </h1>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xl font-semibold text-[#23484A]">
                    {formatPrice(product.price)}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-[#C7A66A]">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-[#C7A66A] stroke-none" />
                      ))}
                    </div>
                    <span className="text-[#6F7775] ml-1">(25 reviews)</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-[#6F7775] leading-relaxed border-t border-b border-[#E5E0D8] py-4">
                {product.description}
              </p>

              {/* Select Fabric */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#243234]">
                  Select Fabric
                </label>
                <select
                  value={selectedFabric}
                  onChange={(e) => setSelectedFabric(e.target.value)}
                  className="w-full border border-[#E5E0D8] p-2.5 bg-white text-xs text-[#243234] focus:outline-none focus:border-[#23484A]"
                >
                  {fabricsList.map((fab) => (
                    <option key={fab.id || fab.name} value={fab.name}>
                      {fab.name} {fab.additionalPrice && fab.additionalPrice > 0 ? `(+${formatPrice(fab.additionalPrice)})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Size */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-[#243234]">
                    Select Size
                  </label>
                  <Link href="/size-guide" className="text-[11px] text-[#23484A] underline hover:text-[#C7A66A]">
                    How to Measure
                  </Link>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sizesList.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => {
                        setSelectedSize(sz);
                        if (sz === 'Custom') setShowCustomModal(true);
                      }}
                      className={`px-4 py-2 text-xs font-semibold rounded-xs border transition-all ${
                        selectedSize === sz
                          ? 'bg-[#23484A] text-white border-[#23484A]'
                          : 'bg-white text-[#243234] border-[#E5E0D8] hover:border-[#23484A]'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#243234]">Quantity</label>
                <div className="flex items-center border border-[#E5E0D8] w-32 bg-white">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 text-[#243234] hover:bg-[#F8F5EF]"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="flex-1 text-center text-xs font-semibold text-[#243234]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 text-[#243234] hover:bg-[#F8F5EF]"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* ============================================================ */}
              {/* CTA Buttons: 1. Add to Cart, 2. Buy Now, 3. Customize Your Order */}
              {/* ============================================================ */}
              <div className="space-y-2.5 pt-2">
                {/* 1. ADD TO CART */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="w-full btn bg-[#23484A] text-white font-semibold py-3.5 text-xs uppercase tracking-wider hover:bg-[#1A3536] flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.99] cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>ADD TO CART</span>
                </button>

                {/* 2. BUY NOW */}
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="w-full btn border-2 border-[#23484A] text-[#23484A] font-semibold py-3.5 text-xs uppercase tracking-wider hover:bg-[#23484A] hover:text-white transition-all shadow-xs active:scale-[0.99] cursor-pointer"
                >
                  BUY NOW
                </button>

                {/* 3. CUSTOMIZE YOUR ORDER */}
                <button
                  type="button"
                  onClick={() => setShowCustomModal(true)}
                  className="w-full btn bg-[#C7A66A] hover:bg-[#b08e54] text-white font-semibold py-3.5 text-xs uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>CUSTOMIZE YOUR ORDER</span>
                </button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-[#E5E0D8] text-center text-[11px] text-[#6F7775]">
                <div className="flex flex-col items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-[#23484A]" />
                  <span>Premium Quality Fabrics</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Ruler className="w-4 h-4 text-[#23484A]" />
                  <span>Made to Measure</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Lock className="w-4 h-4 text-[#23484A]" />
                  <span>Secure Payment</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Globe className="w-4 h-4 text-[#23484A]" />
                  <span>All India Shipping</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ============================================================ */}
      {/* CUSTOMIZATION NOTE POPUP MODAL (Hidden by default from page) */}
      {/* ============================================================ */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-white border border-[#E5E0D8] shadow-2xl rounded-sm my-8 overflow-hidden max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="sticky top-0 z-20 bg-white border-b border-[#E5E0D8] p-4 sm:p-6 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#C7A66A] font-bold block">
                  BESPOKE TAILORING
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl text-[#23484A]">
                  Customize Your Outfit
                </h2>
                <p className="text-xs text-[#6F7775] mt-0.5">
                  Enter your custom measurements and styling notes.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowCustomModal(false)}
                className="w-9 h-9 rounded-full bg-[#F8F5EF] hover:bg-[#E5E0D8] text-[#243234] flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 lg:p-8 overflow-y-auto flex-1 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Form Fields: Measurements & Notes */}
                <div className="lg:col-span-7 space-y-5">
                  <div className="space-y-1">
                    <h3 className="font-serif text-lg text-[#23484A]">
                      Body Measurements (inches)
                    </h3>
                    <p className="text-[11px] text-[#6F7775]">
                      Enter your accurate measurements in inches for bespoke stitching.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 text-xs">
                    <div>
                      <label className="block text-[#243234] font-semibold mb-1">
                        Bust (inches)
                      </label>
                      <input
                        type="text"
                        value={bust}
                        onChange={(e) => setBust(e.target.value)}
                        className="w-full border border-[#E5E0D8] p-2.5 rounded-2xs focus:outline-none focus:border-[#23484A] bg-white"
                        placeholder="34"
                      />
                    </div>
                    <div>
                      <label className="block text-[#243234] font-semibold mb-1">
                        Waist (inches)
                      </label>
                      <input
                        type="text"
                        value={waist}
                        onChange={(e) => setWaist(e.target.value)}
                        className="w-full border border-[#E5E0D8] p-2.5 rounded-2xs focus:outline-none focus:border-[#23484A] bg-white"
                        placeholder="28"
                      />
                    </div>
                    <div>
                      <label className="block text-[#243234] font-semibold mb-1">
                        Hips (inches)
                      </label>
                      <input
                        type="text"
                        value={hips}
                        onChange={(e) => setHips(e.target.value)}
                        className="w-full border border-[#E5E0D8] p-2.5 rounded-2xs focus:outline-none focus:border-[#23484A] bg-white"
                        placeholder="36"
                      />
                    </div>
                    <div>
                      <label className="block text-[#243234] font-semibold mb-1">
                        Shoulder (inches)
                      </label>
                      <input
                        type="text"
                        value={shoulder}
                        onChange={(e) => setShoulder(e.target.value)}
                        className="w-full border border-[#E5E0D8] p-2.5 rounded-2xs focus:outline-none focus:border-[#23484A] bg-white"
                        placeholder="14"
                      />
                    </div>
                    <div>
                      <label className="block text-[#243234] font-semibold mb-1">
                        Sleeve Length (inches)
                      </label>
                      <input
                        type="text"
                        value={sleeveLength}
                        onChange={(e) => setSleeveLength(e.target.value)}
                        className="w-full border border-[#E5E0D8] p-2.5 rounded-2xs focus:outline-none focus:border-[#23484A] bg-white"
                        placeholder="22"
                      />
                    </div>
                    <div>
                      <label className="block text-[#243234] font-semibold mb-1">
                        Outfit Length (inches)
                      </label>
                      <input
                        type="text"
                        value={outfitLength}
                        onChange={(e) => setOutfitLength(e.target.value)}
                        className="w-full border border-[#E5E0D8] p-2.5 rounded-2xs focus:outline-none focus:border-[#23484A] bg-white"
                        placeholder="52"
                      />
                    </div>
                  </div>

                  {/* Special Instructions / Customization Note */}
                  <div className="text-xs space-y-1">
                    <label className="block text-[#243234] font-semibold">
                      Special Instructions / Customization Note
                    </label>
                    <textarea
                      rows={3}
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      placeholder="e.g. I want it with full sleeves and back round neck, add extra lining."
                      className="w-full border border-[#E5E0D8] p-3 rounded-2xs focus:outline-none focus:border-[#23484A] bg-white text-xs leading-relaxed"
                    />
                  </div>

                  {/* Upload Reference File */}
                  <div className="text-xs space-y-1">
                    <label className="block text-[#243234] font-semibold">
                      Upload Reference (Optional)
                    </label>
                    <label className="flex items-center gap-3 p-3 border border-dashed border-[#E5E0D8] bg-[#F8F5EF] hover:border-[#23484A] rounded-xs cursor-pointer transition-colors">
                      {isUploadingReference ? (
                        <div className="w-4 h-4 border-2 border-[#23484A] border-t-transparent rounded-full animate-spin shrink-0" />
                      ) : uploadedFileUrl ? (
                        <Check className="w-4 h-4 text-green-600 shrink-0" />
                      ) : (
                        <Upload className="w-4 h-4 text-[#23484A] shrink-0" />
                      )}
                      <span className="text-xs text-[#6F7775] truncate">
                        {isUploadingReference
                          ? 'Uploading reference image...'
                          : uploadedFileName
                          ? `${uploadedFileName} (Uploaded)`
                          : 'Choose File (No file chosen)'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isUploadingReference}
                        className="hidden"
                        onChange={handleReferenceFileUpload}
                      />
                    </label>
                  </div>
                </div>

                {/* Order Summary & Actions */}
                <div className="lg:col-span-5 bg-[#F8F5EF] p-5 sm:p-6 border border-[#E5E0D8] space-y-5 rounded-xs">
                  <h3 className="font-serif text-lg text-[#23484A] border-b border-[#E5E0D8] pb-3">
                    Order Summary
                  </h3>

                  <div className="flex items-center gap-3">
                    <div className="relative w-16 h-20 bg-white border border-[#E5E0D8] overflow-hidden shrink-0 rounded-2xs">
                      <Image
                        src={imagesList[0].url}
                        alt={product.name}
                        fill
                        className="object-cover object-top"
                      />
                    </div>
                    <div className="flex-1 text-xs min-w-0">
                      <h4 className="font-serif font-semibold text-[#243234] text-sm truncate">
                        {product.name}
                      </h4>
                      <p className="text-[#6F7775]">
                        {selectedFabric} — {selectedSize === 'Custom' ? 'Custom Fit' : selectedSize}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-[#23484A] shrink-0">
                      {formatPrice(product.price)}
                    </span>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-[#E5E0D8] text-xs text-[#6F7775]">
                    <div className="flex justify-between">
                      <span>Customization Charges</span>
                      <span>₹ 0</span>
                    </div>
                    <div className="flex justify-between font-bold text-sm text-[#23484A] pt-2 border-t border-[#E5E0D8]">
                      <span>Total</span>
                      <span>{formatPrice(product.price * quantity)}</span>
                    </div>
                  </div>

                  {/* Primary WhatsApp Action */}
                  <div className="pt-2 space-y-2.5">
                    <button
                      type="button"
                      disabled={isSendingWhatsApp}
                      onClick={handleSendWhatsApp}
                      className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white py-3.5 px-4 text-xs font-bold uppercase tracking-wider rounded-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] cursor-pointer text-center disabled:opacity-75"
                    >
                      {isSendingWhatsApp ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                          <span>PREPARING INQUIRY...</span>
                        </>
                      ) : (
                        <>
                          <MessageCircle className="w-4 h-4 fill-current shrink-0" />
                          <span>SEND VIA WHATSAPP</span>
                        </>
                      )}
                    </button>


                    {/* Secondary Add to Cart option */}
                    <button
                      type="button"
                      onClick={() => {
                        handleAddToCart();
                        setShowCustomModal(false);
                      }}
                      className="w-full bg-[#23484A] hover:bg-[#1A3536] text-white py-3 px-3 text-xs font-semibold uppercase tracking-wider rounded-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm active:scale-[0.99] text-center"
                    >
                      <ShoppingBag className="w-4 h-4 shrink-0" />
                      <span>ADD TO CART WITH MEASUREMENTS</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      <BrandPromises />
      <Footer />
    </div>
  );
}
