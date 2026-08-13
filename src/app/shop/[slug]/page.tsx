'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BrandPromises from '@/components/home/BrandPromises';
import type { Product } from '@/types';
import { getProductBySlug, getProducts } from '@/lib/supabase/services';
import { formatPrice } from '@/lib/utils';
import { Star, ShieldCheck, Ruler, Lock, Globe, Minus, Plus, Upload, ShoppingBag } from 'lucide-react';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductDetailPage({ params }: ProductPageProps) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedFabric, setSelectedFabric] = useState('Premium Cotton');
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [showCustomForm, setShowCustomForm] = useState(true);

  // Custom Measurements state
  const [bust, setBust] = useState('34');
  const [waist, setWaist] = useState('28');
  const [hips, setHips] = useState('36');
  const [shoulder, setShoulder] = useState('14');
  const [sleeveLength, setSleeveLength] = useState('22');
  const [outfitLength, setOutfitLength] = useState('52');
  const [specialInstructions, setSpecialInstructions] = useState('');

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

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5EF]">
      <Header />

      <main className="flex-1 section-padding">
        <div className="container-main space-y-12">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-[#6F7775]">
            <Link href="/" className="hover:text-[#23484A]">Home</Link>
            <span>›</span>
            <Link href="/shop" className="hover:text-[#23484A]">Shop</Link>
            <span>›</span>
            <span className="text-[#23484A] font-medium">{product.name}</span>
          </div>

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
                        if (sz === 'Custom') setShowCustomForm(true);
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
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="flex-1 text-center text-xs font-semibold text-[#243234]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 text-[#243234] hover:bg-[#F8F5EF]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={() => setShowCustomForm(true)}
                  className="w-full btn bg-[#23484A] text-white font-semibold py-3.5 text-xs uppercase tracking-wider hover:bg-[#1A3536]"
                >
                  CUSTOMIZE & ADD TO CART
                </button>
                <button className="w-full btn border border-[#23484A] text-[#23484A] font-semibold py-3.5 text-xs uppercase tracking-wider hover:bg-[#23484A] hover:text-white transition-colors">
                  BUY NOW
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
                  <span>Worldwide Shipping</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customization Form Section */}
          {showCustomForm && (
            <div className="bg-white p-6 md:p-8 border border-[#E5E0D8] space-y-6">
              <div className="border-b border-[#E5E0D8] pb-4">
                <h2 className="font-serif text-2xl text-[#23484A]">
                  Customize Your Outfit
                </h2>
                <p className="text-xs text-[#6F7775] mt-0.5">Enter your measurements</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Form Fields */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-[#243234] font-semibold mb-1">Bust (inches)</label>
                      <input
                        type="text"
                        value={bust}
                        onChange={(e) => setBust(e.target.value)}
                        className="w-full border border-[#E5E0D8] p-2.5 rounded-2xs focus:outline-none focus:border-[#23484A]"
                        placeholder="34"
                      />
                    </div>
                    <div>
                      <label className="block text-[#243234] font-semibold mb-1">Waist (inches)</label>
                      <input
                        type="text"
                        value={waist}
                        onChange={(e) => setWaist(e.target.value)}
                        className="w-full border border-[#E5E0D8] p-2.5 rounded-2xs focus:outline-none focus:border-[#23484A]"
                        placeholder="28"
                      />
                    </div>
                    <div>
                      <label className="block text-[#243234] font-semibold mb-1">Hips (inches)</label>
                      <input
                        type="text"
                        value={hips}
                        onChange={(e) => setHips(e.target.value)}
                        className="w-full border border-[#E5E0D8] p-2.5 rounded-2xs focus:outline-none focus:border-[#23484A]"
                        placeholder="36"
                      />
                    </div>
                    <div>
                      <label className="block text-[#243234] font-semibold mb-1">Shoulder (inches)</label>
                      <input
                        type="text"
                        value={shoulder}
                        onChange={(e) => setShoulder(e.target.value)}
                        className="w-full border border-[#E5E0D8] p-2.5 rounded-2xs focus:outline-none focus:border-[#23484A]"
                        placeholder="14"
                      />
                    </div>
                    <div>
                      <label className="block text-[#243234] font-semibold mb-1">Sleeve Length (inches)</label>
                      <input
                        type="text"
                        value={sleeveLength}
                        onChange={(e) => setSleeveLength(e.target.value)}
                        className="w-full border border-[#E5E0D8] p-2.5 rounded-2xs focus:outline-none focus:border-[#23484A]"
                        placeholder="22"
                      />
                    </div>
                    <div>
                      <label className="block text-[#243234] font-semibold mb-1">Outfit Length (inches)</label>
                      <input
                        type="text"
                        value={outfitLength}
                        onChange={(e) => setOutfitLength(e.target.value)}
                        className="w-full border border-[#E5E0D8] p-2.5 rounded-2xs focus:outline-none focus:border-[#23484A]"
                        placeholder="52"
                      />
                    </div>
                  </div>

                  <div className="text-xs">
                    <label className="block text-[#243234] font-semibold mb-1">Special Instructions (Optional)</label>
                    <textarea
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      placeholder="e.g. I want it with full sleeves and back round neck."
                      className="w-full border border-[#E5E0D8] p-2.5 rounded-2xs focus:outline-none focus:border-[#23484A]"
                    />
                  </div>

                  <div className="text-xs">
                    <label className="block text-[#243234] font-semibold mb-1">Upload Reference (Optional)</label>
                    <div className="flex items-center gap-3 p-3 border border-dashed border-[#E5E0D8] bg-[#F8F5EF] rounded-xs cursor-pointer">
                      <Upload className="w-4 h-4 text-[#23484A]" />
                      <span className="text-xs text-[#6F7775]">Choose File (No file chosen)</span>
                    </div>
                  </div>
                </div>

                {/* Order Summary Sidebar */}
                <div className="lg:col-span-5 bg-[#F8F5EF] p-6 border border-[#E5E0D8] space-y-4">
                  <h3 className="font-serif text-lg text-[#23484A] border-b border-[#E5E0D8] pb-3">
                    Order Summary
                  </h3>

                  <div className="flex items-center gap-3">
                    <div className="relative w-16 h-20 bg-white border border-[#E5E0D8] overflow-hidden shrink-0">
                      <Image src={imagesList[0].url} alt={product.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 text-xs">
                      <h4 className="font-serif font-semibold text-[#243234] text-sm">{product.name}</h4>
                      <p className="text-[#6F7775]">{selectedFabric} - {selectedSize}</p>
                    </div>
                    <span className="text-xs font-semibold text-[#23484A]">{formatPrice(product.price)}</span>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-[#E5E0D8] text-xs text-[#6F7775]">
                    <div className="flex justify-between">
                      <span>Customization Charges</span>
                      <span>{formatPrice(customizationCharge)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-sm text-[#23484A] pt-2 border-t border-[#E5E0D8]">
                      <span>Total</span>
                      <span>{formatPrice(itemTotal)}</span>
                    </div>
                  </div>

                  <Link href="/cart" className="w-full btn bg-[#23484A] text-white py-3 text-xs font-semibold uppercase tracking-wider block text-center mt-4 hover:bg-[#1A3536]">
                    ADD TO CART
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <BrandPromises />
      <Footer />
    </div>
  );
}
