'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BrandPromises from '@/components/home/BrandPromises';
import { Check, Mail, MessageCircle, ArrowRight, Package, Clock, ShieldCheck } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { BRAND } from '@/lib/constants';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order') || 'FAB-8492';
  const rawAmount = searchParams.get('amount');
  const amount = rawAmount ? Number(rawAmount) : 3199;
  const customerEmail = searchParams.get('email');
  const paymentId = searchParams.get('payment_id');

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
      {/* Main Luxury Receipt Card */}
      <div className="bg-white rounded-2xl border border-[#E5E0D8] shadow-sm p-6 sm:p-10 md:p-12 text-center space-y-8">
        
        {/* Animated Brand Emblem & Checkmark */}
        <div className="space-y-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#FAF8F5] border-2 border-[#C7A66A]/60 flex items-center justify-center mx-auto shadow-xs relative">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#23484A] text-white flex items-center justify-center">
              <Check className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-[#C7A66A] block">
              Payment Received • Order Confirmed
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#23484A] font-medium tracking-tight">
              Thank You for Your Order
            </h1>
            <p className="text-xs sm:text-sm text-[#6F7775] max-w-lg mx-auto leading-relaxed">
              We have received your payment of <span className="font-bold text-[#23484A]">{formatPrice(amount)}</span>. 
              Our artisans will verify your details and begin crafting your bespoke piece.
            </p>
          </div>
        </div>

        {/* Confirmation Details Card */}
        <div className="bg-[#FAF8F5] rounded-xl border border-[#E5E0D8]/80 p-5 sm:p-6 text-left grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 divide-y sm:divide-y-0 sm:divide-x divide-[#E5E0D8]">
          {/* Order Reference */}
          <div className="space-y-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9FA8A6] block">
                Order Reference
              </span>
              <span className="font-mono text-base font-bold text-[#23484A] tracking-wide">
                #{orderNumber}
              </span>
            </div>

            {paymentId && (
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#9FA8A6] block">
                  Transaction Reference
                </span>
                <span className="font-mono text-xs text-[#243234] block truncate" title={paymentId}>
                  {paymentId}
                </span>
              </div>
            )}

            <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Paid Online • Verified</span>
            </div>
          </div>

          {/* Fulfillment & Delivery */}
          <div className="space-y-3 pt-4 sm:pt-0 sm:pl-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9FA8A6] block">
                Estimated Delivery
              </span>
              <span className="text-xs sm:text-sm font-semibold text-[#243234]">
                7 – 10 Business Days
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9FA8A6] block">
                Order Status
              </span>
              <span className="text-xs text-[#23484A] font-medium flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-[#C7A66A]" />
                <span>In Production & Tailoring Queue</span>
              </span>
            </div>

            {customerEmail && (
              <div className="flex items-center gap-1.5 text-[11px] text-[#6F7775]">
                <Mail className="w-3.5 h-3.5 text-[#C7A66A] shrink-0" />
                <span className="truncate">Receipt sent to {customerEmail}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href={`/track-order?order=${orderNumber}`}
            className="w-full sm:w-auto px-8 py-3.5 bg-[#23484A] hover:bg-[#1A3536] text-white text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors shadow-sm text-center"
          >
            Track Order Status
          </Link>
          <Link
            href="/shop"
            className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-[#FAF8F5] border border-[#23484A] text-[#23484A] text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors text-center"
          >
            Continue Shopping
          </Link>
        </div>

        {/* WhatsApp Assistance Footer */}
        <div className="pt-4 border-t border-[#E5E0D8]/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6F7775]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#23484A]" />
            <span>100% Authentic Handcrafted Designer Wear</span>
          </div>

          <a
            href={`https://wa.me/${BRAND.whatsappNumber}?text=Hi%20Fasna,%20I%20just%20placed%20order%20%23${orderNumber}.%20Can%20you%20please%20confirm%20my%20order%20details?`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-semibold transition-colors"
          >
            <MessageCircle className="w-4 h-4 fill-emerald-600 text-white" />
            <span>Chat with Fasna on WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5EF]">
      <Header cartCount={0} />

      <main className="flex-1 section-padding">
        <Suspense fallback={<div className="text-center py-20 text-xs text-[#6F7775]">Loading confirmation details...</div>}>
          <OrderSuccessContent />
        </Suspense>
      </main>

      <BrandPromises />
      <Footer />
    </div>
  );
}
