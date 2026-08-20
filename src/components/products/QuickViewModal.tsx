'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Star, Heart, ShoppingBag, Check } from 'lucide-react';
import type { Product } from '@/types';
import { formatPrice } from '@/lib/utils';

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (product: Product) => void;
}

export default function QuickViewModal({
  product,
  isOpen,
  onClose,
  isWishlisted = false,
  onToggleWishlist,
}: QuickViewModalProps) {
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedFabric, setSelectedFabric] = useState('Premium Cotton');
  const [addedToCart, setAddedToCart] = useState(false);

  if (!isOpen || !product) return null;

  const images = product.images && product.images.length > 0
    ? product.images
    : [{ id: '1', url: '/images/placeholder.jpg', alt: product.name, order: 1 }];

  const sizes = product.sizes && product.sizes.length > 0
    ? product.sizes
    : ['S', 'M', 'L', 'XL', 'Custom'];

  const fabrics = product.fabrics && product.fabrics.length > 0
    ? product.fabrics
    : [{ id: 'f1', fabricId: '1', name: 'Premium Cotton', additionalPrice: 0 }];

  const handleAddToCart = () => {
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-[#E5E0D8] shadow-2xl w-full max-w-3xl rounded-xs overflow-hidden relative max-h-[90vh] flex flex-col md:flex-row">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 bg-white/80 hover:bg-white text-[#243234] p-1.5 rounded-full shadow-xs transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Image Gallery */}
        <div className="w-full md:w-1/2 bg-[#F8F5EF] p-4 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#E5E0D8]">
          <div className="relative aspect-[3/4] w-full bg-white overflow-hidden rounded-2xs border border-[#E5E0D8]">
            <Image
              src={images[selectedImageIdx]?.url || images[0].url}
              alt={product.name}
              fill
              className="object-cover object-top"
            />
          </div>

          {images.length > 1 && (
            <div className="flex items-center gap-2 pt-3 overflow-x-auto">
              {images.map((img, idx) => (
                <button
                  key={img.id || idx}
                  onClick={() => setSelectedImageIdx(idx)}
                  className={`relative w-14 h-16 rounded-2xs overflow-hidden border ${
                    selectedImageIdx === idx ? 'border-[#23484A] ring-1 ring-[#23484A]' : 'border-[#E5E0D8] opacity-70'
                  }`}
                >
                  <Image src={img.url} alt={product.name} fill className="object-cover object-top" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Product Summary & Actions */}
        <div className="w-full md:w-1/2 p-6 flex flex-col justify-between space-y-4 overflow-y-auto max-h-[500px] md:max-h-none">
          <div className="space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#C7A66A] bg-[#C7A66A]/10 px-2 py-0.5 rounded-2xs">
              {product.type === 'CUSTOM' ? 'Custom Made' : 'Ready to Ship'}
            </span>

            <h2 className="font-serif text-2xl text-[#23484A] leading-tight">{product.name}</h2>

            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-[#23484A]">{formatPrice(product.price)}</span>
              {product.compareAtPrice && (
                <span className="text-xs text-[#6F7775] line-through">{formatPrice(product.compareAtPrice)}</span>
              )}
            </div>

            <p className="text-xs text-[#6F7775] line-clamp-3 leading-relaxed border-t border-b border-[#E5E0D8] py-3">
              {product.description}
            </p>

            {/* Select Size */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#243234] block">Size</label>
              <div className="flex flex-wrap gap-1.5">
                {sizes.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-2xs border ${
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

            {/* Select Fabric */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#243234] block">Fabric</label>
              <select
                value={selectedFabric}
                onChange={(e) => setSelectedFabric(e.target.value)}
                className="w-full border border-[#E5E0D8] p-2 bg-white text-xs text-[#243234] focus:outline-none focus:border-[#23484A]"
              >
                {fabrics.map((f) => (
                  <option key={f.id || f.name} value={f.name}>{f.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-4 border-t border-[#E5E0D8]">
            <div className="flex gap-2">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-[#23484A] hover:bg-[#1A3536] text-white py-2.5 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
              >
                {addedToCart ? (
                  <>
                    <Check className="w-4 h-4 text-green-300" />
                    <span>Added to Cart</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>

              {onToggleWishlist && (
                <button
                  onClick={() => onToggleWishlist(product)}
                  className={`p-2.5 border rounded-2xs transition-colors ${
                    isWishlisted
                      ? 'border-red-500 bg-red-50 text-red-600'
                      : 'border-[#E5E0D8] text-[#243234] hover:bg-[#F8F5EF]'
                  }`}
                  title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-600 text-red-600' : ''}`} />
                </button>
              )}
            </div>

            <Link
              href={`/shop/${product.slug}`}
              onClick={onClose}
              className="block w-full text-center text-xs font-semibold text-[#23484A] hover:underline pt-1"
            >
              View Full Product Details →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
