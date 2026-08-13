'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { formatPrice } from '@/lib/utils';
import { Minus, Plus, Trash2, ArrowLeft } from 'lucide-react';

export default function CartPage() {
  const [items, setItems] = useState([
    {
      id: 'cart-1',
      name: 'Floral Anarkali',
      fabric: 'Premium Cotton',
      size: 'M',
      customSize: true,
      price: 3999,
      quantity: 1,
      image: '/images/products/product-1.jpg',
    },
    {
      id: 'cart-2',
      name: 'Embroidered Abaya',
      fabric: 'Linen',
      size: 'L',
      customSize: false,
      price: 2999,
      quantity: 1,
      image: '/images/products/product-2.jpg',
    },
  ]);

  const updateQuantity = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 200;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5EF]">
      <Header cartCount={items.length} />

      <main className="flex-1 section-padding">
        <div className="container-main space-y-8">
          <h1 className="font-serif text-3xl md:text-4xl text-[#23484A]">
            Your Cart ({items.length})
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Items List */}
            <div className="lg:col-span-8 bg-white p-6 border border-[#E5E0D8] space-y-6">
              {items.length === 0 ? (
                <div className="py-12 text-center space-y-4">
                  <p className="text-sm text-[#6F7775]">Your shopping cart is currently empty.</p>
                  <Link href="/shop" className="btn btn-primary bg-[#23484A] text-white">
                    EXPLORE SHOP
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-[#E5E0D8]">
                  {items.map((item) => (
                    <div key={item.id} className="py-4 first:pt-0 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="relative w-20 h-24 bg-[#F8F5EF] border border-[#E5E0D8] overflow-hidden shrink-0">
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-serif text-base font-semibold text-[#243234]">
                            {item.name}
                          </h3>
                          <p className="text-xs text-[#6F7775]">
                            {item.fabric} - {item.size}
                          </p>
                          {item.customSize && (
                            <span className="inline-block text-[10px] text-[#23484A] bg-[#23484A]/10 px-2 py-0.5 font-medium rounded-xs">
                              Custom Size
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quantity & Price */}
                      <div className="flex items-center gap-6">
                        <div className="flex items-center border border-[#E5E0D8] bg-white">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="p-1.5 text-[#243234] hover:bg-[#F8F5EF]"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-xs font-semibold text-[#243234]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="p-1.5 text-[#243234] hover:bg-[#F8F5EF]"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="text-sm font-semibold text-[#23484A] min-w-[80px] text-right">
                          {formatPrice(item.price * item.quantity)}
                        </span>

                        <button
                          onClick={() => removeItem(item.id)}
                          aria-label="Remove item"
                          className="text-[#6F7775] hover:text-[#B85450] p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-4 border-t border-[#E5E0D8]">
                <Link href="/shop" className="inline-flex items-center gap-2 text-xs font-semibold text-[#23484A] hover:underline">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Continue Shopping
                </Link>
              </div>
            </div>

            {/* Right Order Summary */}
            <div className="lg:col-span-4 bg-white p-6 border border-[#E5E0D8] space-y-6">
              <h2 className="font-serif text-xl text-[#23484A] pb-3 border-b border-[#E5E0D8]">
                Order Summary
              </h2>

              <div className="space-y-3 text-xs text-[#6F7775]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#243234]">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-semibold text-[#243234]">{formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-[#23484A] pt-4 border-t border-[#E5E0D8]">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="w-full btn btn-primary bg-[#23484A] text-white py-3.5 text-xs font-semibold uppercase tracking-wider block text-center"
              >
                PROCEED TO CHECKOUT
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
