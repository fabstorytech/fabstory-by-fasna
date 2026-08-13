'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { formatPrice } from '@/lib/utils';
import { Lock, CreditCard, Smartphone } from 'lucide-react';

export default function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card'>('upi');

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5EF]">
      <Header />

      <main className="flex-1 section-padding">
        <div className="container-main space-y-8">
          <h1 className="font-serif text-3xl md:text-4xl text-[#23484A]">
            Checkout
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Form */}
            <div className="lg:col-span-7 bg-white p-6 md:p-8 border border-[#E5E0D8] space-y-6">
              {/* Shipping Address */}
              <div className="space-y-4">
                <h2 className="font-serif text-xl text-[#23484A] pb-2 border-b border-[#E5E0D8]">
                  1. Contact & Shipping Address
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">Full Name *</label>
                    <input type="text" className="input" placeholder="Ayesha Khan" defaultValue="Ayesha Khan" />
                  </div>
                  <div>
                    <label className="input-label">Phone Number *</label>
                    <input type="tel" className="input" placeholder="+91 98765 43210" defaultValue="+91 98765 43210" />
                  </div>
                </div>
                <div>
                  <label className="input-label">Street Address *</label>
                  <input type="text" className="input" placeholder="House / Flat No., Street Name" defaultValue="Flat 4B, Emerald Heights" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="input-label">City *</label>
                    <input type="text" className="input" defaultValue="Kochi" />
                  </div>
                  <div>
                    <label className="input-label">State *</label>
                    <input type="text" className="input" defaultValue="Kerala" />
                  </div>
                  <div>
                    <label className="input-label">Pincode *</label>
                    <input type="text" className="input" defaultValue="682001" />
                  </div>
                </div>
              </div>

              {/* Payment Section */}
              <div className="space-y-4 pt-4 border-t border-[#E5E0D8]">
                <h2 className="font-serif text-xl text-[#23484A] pb-2 border-b border-[#E5E0D8]">
                  2. Payment Method
                </h2>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 border border-[#E5E0D8] rounded-xs cursor-pointer hover:border-[#23484A]">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'upi'}
                      onChange={() => setPaymentMethod('upi')}
                      className="accent-[#23484A]"
                    />
                    <Smartphone className="w-5 h-5 text-[#23484A]" />
                    <div>
                      <span className="text-xs font-semibold text-[#243234] block">UPI / QR (Google Pay, PhonePe, Paytm)</span>
                      <span className="text-[11px] text-[#6F7775]">Fast & safe instant payment via Razorpay</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 border border-[#E5E0D8] rounded-xs cursor-pointer hover:border-[#23484A]">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="accent-[#23484A]"
                    />
                    <CreditCard className="w-5 h-5 text-[#23484A]" />
                    <div>
                      <span className="text-xs font-semibold text-[#243234] block">Credit / Debit Card / Net Banking</span>
                      <span className="text-[11px] text-[#6F7775]">Visa, Mastercard, RuPay, Net Banking</span>
                    </div>
                  </label>
                </div>
              </div>

              <Link
                href="/order-success"
                className="w-full btn btn-primary bg-[#23484A] text-white py-4 text-xs font-semibold uppercase tracking-wider block text-center"
              >
                PAY ₹ 7,198 & PLACE ORDER
              </Link>
            </div>

            {/* Right Summary */}
            <div className="lg:col-span-5 bg-white p-6 border border-[#E5E0D8] space-y-4">
              <h2 className="font-serif text-xl text-[#23484A] pb-3 border-b border-[#E5E0D8]">
                Order Summary (2 Items)
              </h2>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span>Floral Anarkali (Custom Size)</span>
                  <span className="font-semibold text-[#23484A]">₹ 3,999</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span>Embroidered Abaya (L)</span>
                  <span className="font-semibold text-[#23484A]">₹ 2,999</span>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E5E0D8] space-y-2 text-xs text-[#6F7775]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹ 6,998</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>₹ 200</span>
                </div>
                <div className="flex justify-between text-base font-bold text-[#23484A] pt-3 border-t border-[#E5E0D8]">
                  <span>Total Payable</span>
                  <span>₹ 7,198</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
