'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { formatPrice } from '@/lib/utils';
import {
  Minus,
  Plus,
  Trash2,
  ArrowLeft,
  ShoppingBag,
  ArrowRight,
} from 'lucide-react';
import { getCart, updateCartQuantity, removeFromCart, CartItem } from '@/lib/cart';

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  const loadCart = () => {
    const cart = getCart();
    setItems(cart);
  };

  useEffect(() => {
    setMounted(true);
    loadCart();
    window.addEventListener('cart-updated', loadCart);
    return () => window.removeEventListener('cart-updated', loadCart);
  }, []);

  const handleUpdateQuantity = (id: string, delta: number) => {
    updateCartQuantity(id, delta);
    loadCart();
  };

  const handleRemoveItem = (id: string) => {
    removeFromCart(id);
    loadCart();
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = items.length > 0 ? 200 : 0;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F7F2]">
      <Header cartCount={items.length} />

      <main className="flex-1 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
          
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-[#6F7775]">
            <Link href="/" className="hover:text-[#23484A] transition-colors">Home</Link>
            <span>›</span>
            <Link href="/shop" className="hover:text-[#23484A] transition-colors">Shop</Link>
            <span>›</span>
            <span className="text-[#23484A] font-medium">Shopping Cart</span>
          </div>

          {/* Page Heading */}
          <div className="border-b border-[#E5E0D8] pb-4 flex items-baseline justify-between">
            <h1 className="font-serif text-3xl sm:text-4xl text-[#23484A] font-medium">
              Shopping Cart
            </h1>
            <span className="text-xs text-[#6F7775] font-medium">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </span>
          </div>

          {items.length === 0 ? (
            /* Clean Minimalist Empty State */
            <div className="bg-white rounded-xl border border-[#E5E0D8] p-12 sm:p-16 text-center space-y-4 shadow-xs max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-full bg-[#FAF8F5] border border-[#E5E0D8] flex items-center justify-center mx-auto text-[#C7A66A]">
                <ShoppingBag className="w-7 h-7 stroke-[1.5]" />
              </div>
              
              <div className="space-y-1">
                <h2 className="font-serif text-2xl text-[#23484A]">
                  Your shopping cart is empty
                </h2>
                <p className="text-xs text-[#6F7775]">
                  Explore our collections and add your favourite pieces.
                </p>
              </div>

              <div className="pt-2">
                <Link
                  href="/shop"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#23484A] hover:bg-[#1A3536] text-white text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors"
                >
                  <span>Explore Shop</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            /* Cart Grid */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Items Column (8 cols) */}
              <div className="lg:col-span-8 bg-white rounded-xl border border-[#E5E0D8] p-4 sm:p-6 shadow-xs divide-y divide-[#E5E0D8]">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="py-5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    {/* Item Image & Details */}
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="relative w-18 h-24 sm:w-20 sm:h-26 bg-[#FAF8F5] rounded-xs border border-[#E5E0D8] overflow-hidden shrink-0">
                        <Image
                          src={item.image || '/images/placeholder.jpg'}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="space-y-1 min-w-0">
                        <Link
                          href={`/shop/${item.slug}`}
                          className="font-serif text-base sm:text-lg text-[#23484A] hover:text-[#C7A66A] transition-colors font-medium truncate block"
                        >
                          {item.name}
                        </Link>

                        <p className="text-xs text-[#6F7775]">
                          {item.fabric && <span>{item.fabric} • </span>}
                          <span>Size: {item.size}</span>
                        </p>

                        {item.customSize && (
                          <span className="inline-block text-[10px] text-[#23484A] bg-[#FAF8F5] border border-[#E5E0D8] px-2 py-0.5 font-medium rounded-xs">
                            Custom Size
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stepper, Line Price, and Delete */}
                    <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 pt-2 sm:pt-0 border-t border-[#E5E0D8]/60 sm:border-t-0">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-[#E5E0D8] bg-[#FAF8F5] rounded-xs">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, -1)}
                          disabled={item.quantity <= 1}
                          className="p-1.5 text-[#23484A] hover:bg-white disabled:opacity-30 transition-colors cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-semibold text-[#23484A]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, 1)}
                          className="p-1.5 text-[#23484A] hover:bg-white transition-colors cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Total Price */}
                      <span className="text-sm font-semibold text-[#23484A] text-right min-w-[70px]">
                        {formatPrice(item.price * item.quantity)}
                      </span>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        aria-label="Remove item"
                        className="text-[#8C9B9A] hover:text-rose-600 p-1.5 transition-colors cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Continue Shopping Link */}
                <div className="pt-4 border-t border-[#E5E0D8]">
                  <Link
                    href="/shop"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#23484A] hover:text-[#C7A66A] transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Continue Shopping</span>
                  </Link>
                </div>
              </div>

              {/* Right Order Summary Column (4 cols) */}
              <div className="lg:col-span-4 bg-white rounded-xl border border-[#E5E0D8] p-5 sm:p-6 shadow-xs space-y-5 lg:sticky lg:top-24">
                <h2 className="font-serif text-xl text-[#23484A] font-medium pb-3 border-b border-[#E5E0D8]">
                  Order Summary
                </h2>

                <div className="space-y-3 text-xs text-[#6F7775]">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-[#23484A]">{formatPrice(subtotal)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="font-semibold text-[#23484A]">{formatPrice(shipping)}</span>
                  </div>

                  <div className="flex justify-between items-baseline pt-4 border-t border-[#E5E0D8] text-[#23484A]">
                    <span className="font-serif text-lg font-bold">Total</span>
                    <span className="font-serif text-xl font-bold">{formatPrice(total)}</span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="w-full inline-block text-center py-3.5 px-6 bg-[#23484A] hover:bg-[#1A3536] text-white text-xs font-semibold uppercase tracking-[0.16em] rounded-xs transition-colors shadow-xs cursor-pointer"
                >
                  PROCEED TO CHECKOUT
                </Link>
              </div>

            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
